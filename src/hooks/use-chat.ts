"use client";

import { useState, useCallback, useRef } from "react";

export interface ChatMessage {
  role: "user" | "bot";
  content: string;
  id: string;
  type?: "product-list" | "order-status" | "text";
  data?: any[];
}

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (message: string) => Promise<void>;
  sessionId: string;
}

const WEBHOOK_URL =
  "https://n8n.burakcanpolat.dev/webhook/cbc523be-3838-4b41-a3fa-839e89f4e29e/chat";

// Generate UUID v4
function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const sessionIdRef = useRef<string | null>(null);

  // Initialize sessionId only on client side
  if (typeof window !== "undefined" && !sessionIdRef.current) {
    sessionIdRef.current = `LSC-${generateUUID()}`;
  }

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) {
      return;
    }

    // Add user message immediately
    const userMessage: ChatMessage = {
      role: "user",
      content: message.trim(),
      id: generateUUID(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatInput: message.trim(),
          sessionId: sessionIdRef.current,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();

      // Debug: log raw response first
      console.log("Raw n8n Response:", responseText);

      let cleanResponse = responseText.trim();
      let messageType: "product-list" | "order-status" | "text" = "text";
      let messageData: any[] | undefined = undefined;

      // Try to parse JSON response
      try {
        const jsonResponse = JSON.parse(cleanResponse);

        // Debug: log the parsed response
        console.log("Parsed n8n Response:", jsonResponse);

        // Check if response has structured data for Generative UI
        if (jsonResponse.type) {
          messageType = jsonResponse.type;
          // Check for products array (n8n format)
          if (jsonResponse.products && Array.isArray(jsonResponse.products)) {
            messageData = jsonResponse.products;
          } else if (jsonResponse.data && Array.isArray(jsonResponse.data)) {
            messageData = jsonResponse.data;
          }
          cleanResponse =
            jsonResponse.output ||
            jsonResponse.content ||
            JSON.stringify(jsonResponse, null, 2);
        } else if (jsonResponse.output) {
          // Try to detect type from output content
          const outputStr = jsonResponse.output;

          // Check if response has products array at root level (n8n format)
          if (jsonResponse.products && Array.isArray(jsonResponse.products)) {
            messageType = "product-list";
            messageData = jsonResponse.products;
            cleanResponse = outputStr;
          }
          // Check if response has data array at root level
          else if (jsonResponse.data && Array.isArray(jsonResponse.data)) {
            messageType = "product-list";
            messageData = jsonResponse.data;
            cleanResponse = outputStr;
          }
          // Check if output itself is an array (product list)
          else if (Array.isArray(jsonResponse.output)) {
            messageType = "product-list";
            messageData = jsonResponse.output;
            cleanResponse = "Products";
          }
          // Check for order status
          else if (jsonResponse.orderId || jsonResponse.status) {
            messageType = "order-status";
            messageData = [jsonResponse];
            cleanResponse = outputStr;
          }
          // Check if output contains JSON string with products
          else if (
            typeof outputStr === "string" &&
            outputStr.includes("products")
          ) {
            try {
              const parsedOutput = JSON.parse(outputStr);
              if (
                parsedOutput.products &&
                Array.isArray(parsedOutput.products)
              ) {
                messageType = "product-list";
                messageData = parsedOutput.products;
                cleanResponse = parsedOutput.message || "Products";
              } else {
                cleanResponse = outputStr;
              }
            } catch {
              cleanResponse = outputStr;
            }
          } else {
            cleanResponse = outputStr;
          }
        } else if (typeof jsonResponse === "string") {
          cleanResponse = jsonResponse;
        } else {
          // If it's an object but no 'output' field, check for structured data
          if (jsonResponse.products && Array.isArray(jsonResponse.products)) {
            messageType = "product-list";
            messageData = jsonResponse.products;
            cleanResponse = jsonResponse.message || "Products";
          } else if (Array.isArray(jsonResponse) && jsonResponse.length > 0) {
            messageType = "product-list";
            messageData = jsonResponse;
            cleanResponse = "Products";
          } else {
            cleanResponse = JSON.stringify(jsonResponse, null, 2);
          }
        }
      } catch {
        // If not JSON, use the text as is
        cleanResponse = responseText.trim();
      }

      // Debug: log what we're setting
      console.log("Message Type:", messageType, "Data:", messageData);

      // Add bot response
      const botMessage: ChatMessage = {
        role: "bot",
        content: cleanResponse,
        id: generateUUID(),
        type: messageType,
        data: messageData,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message
      const errorMessage: ChatMessage = {
        role: "bot",
        content: "Sorry, I encountered an error. Please try again.",
        id: generateUUID(),
        type: "text",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    sessionId: sessionIdRef.current || "",
  };
};
