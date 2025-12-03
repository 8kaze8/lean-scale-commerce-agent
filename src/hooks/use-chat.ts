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

// Helper functions to extract order information from text
function extractOrderId(text: string): string | undefined {
  const match = text.match(/ORD-?\d+/i);
  return match ? match[0] : undefined;
}

function extractCouponCode(text: string): string | undefined {
  // Look for patterns like 'SORRY10', 'code SORRY10', 'coupon code SORRY10'
  const match =
    text.match(/(?:code|coupon code)\s+['"]?([A-Z0-9]+)['"]?/i) ||
    text.match(/['"]([A-Z0-9]{4,})['"]/);
  return match ? match[1] : undefined;
}

function extractStatus(text: string): string | undefined {
  const lowerText = text.toLowerCase();
  if (lowerText.includes("delivered")) return "Delivered";
  if (lowerText.includes("delayed")) return "Delayed";
  if (lowerText.includes("processing")) return "Processing";
  if (lowerText.includes("shipped")) return "Shipped";
  return undefined;
}

function extractDeliveryDate(text: string): string | undefined {
  // Look for date patterns like "2024-12-02", "2024/12/02", "December 2, 2024"
  const datePatterns = [
    /\d{4}-\d{2}-\d{2}/,
    /\d{4}\/\d{2}\/\d{2}/,
    /(?:on|before|by)\s+(\d{4}-\d{2}-\d{2})/i,
  ];
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) return match[1] || match[0];
  }
  return undefined;
}

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
        // Try to get error message from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorText = await response.text();
          const errorJson = JSON.parse(errorText);
          if (errorJson.message || errorJson.error) {
            errorMessage = errorJson.message || errorJson.error;
          }
        } catch {
          // If response is not JSON, use status code
        }
        throw new Error(errorMessage);
      }

      const responseText = await response.text();

      // Debug: log raw response
      console.log("Raw n8n Response:", responseText);

      let cleanResponse = responseText.trim();
      let messageType: "product-list" | "order-status" | "text" = "text";
      let messageData: any[] | undefined = undefined;

      // Try to parse JSON response
      try {
        const jsonResponse = JSON.parse(cleanResponse);

        // Debug: log parsed response
        console.log("Parsed n8n Response:", jsonResponse);

        // Check if response has nested output structure (n8n Format Structured Output format)
        // This must be checked FIRST before other type checks
        if (
          jsonResponse.output &&
          typeof jsonResponse.output === "object" &&
          !Array.isArray(jsonResponse.output) &&
          (jsonResponse.output.products || jsonResponse.output.type)
        ) {
          const nestedOutput = jsonResponse.output;
          // Extract type and products from nested output
          if (nestedOutput.type) {
            const typeStr = nestedOutput.type.toLowerCase();
            if (
              typeStr === "product_recommendation" ||
              typeStr === "product recommendation" ||
              typeStr.includes("product")
            ) {
              messageType = "product-list";
            } else if (
              typeStr === "order status" ||
              typeStr.includes("order")
            ) {
              messageType = "order-status";
              // Parse order information from the message text
              const orderText = nestedOutput.output || "";
              const orderData: any = {
                status: nestedOutput.status || extractStatus(orderText),
                orderId: nestedOutput.orderId || extractOrderId(orderText),
                couponCode:
                  nestedOutput.couponCode || extractCouponCode(orderText),
                expectedDeliveryDate:
                  nestedOutput.expectedDeliveryDate ||
                  nestedOutput.deliveryDate ||
                  extractDeliveryDate(orderText),
                items: nestedOutput.items || [],
              };
              console.log("Order Data Parsed:", orderData);
              messageData = [orderData];
              // Don't override messageData for order-status, skip products check
            } else {
              messageType = nestedOutput.type as any;
            }
          }
          // Only check for products if it's not order-status (to avoid overriding orderData)
          if (messageType !== "order-status") {
            if (
              nestedOutput.products &&
              Array.isArray(nestedOutput.products) &&
              nestedOutput.products.length > 0
            ) {
              messageData = nestedOutput.products;
            } else if (
              nestedOutput.data &&
              Array.isArray(nestedOutput.data) &&
              nestedOutput.data.length > 0
            ) {
              messageData = nestedOutput.data;
            }
          }
          cleanResponse =
            nestedOutput.output ||
            nestedOutput.content ||
            JSON.stringify(nestedOutput, null, 2);
        }
        // Check if response has structured data for Generative UI (only if nested wasn't found)
        else if (jsonResponse.type) {
          const typeStr = String(jsonResponse.type).toLowerCase();
          // product_recommendation or Product Recommendation -> product-list'e çevir
          if (
            typeStr === "product_recommendation" ||
            typeStr === "product recommendation" ||
            typeStr.includes("product")
          ) {
            messageType = "product-list";
          } else {
            messageType = jsonResponse.type as any;
          }
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
          // Check if output object has products (nested structure)
          else if (
            jsonResponse.output &&
            typeof jsonResponse.output === "object" &&
            jsonResponse.output.products
          ) {
            messageType =
              jsonResponse.output.type === "product_recommendation"
                ? "product-list"
                : jsonResponse.output.type || "product-list";
            messageData = jsonResponse.output.products;
            cleanResponse =
              typeof jsonResponse.output.output === "string"
                ? jsonResponse.output.output
                : outputStr;
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

      // Debug: log final message data
      console.log("Final Message Type:", messageType);
      console.log("Final Message Data:", messageData);
      console.log("Final Clean Response:", cleanResponse);

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

      // Provide more specific error messages
      let errorContent = "Sorry, I encountered an error. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("500")) {
          errorContent =
            "I'm having trouble processing your request right now. This might be a policy-related query that needs additional configuration. Please try again in a moment or rephrase your question.";
        } else if (error.message.includes("404")) {
          errorContent =
            "The service is temporarily unavailable. Please try again later.";
        } else if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          errorContent =
            "Network error. Please check your connection and try again.";
        }
      }

      // Add error message
      const errorMessage: ChatMessage = {
        role: "bot",
        content: errorContent,
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
