"use client";

import { useState, useCallback, useRef } from "react";

export interface ChatMessage {
  role: "user" | "bot";
  content: string;
  id: string;
  type?: "product-list" | "order-status" | "text";
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
      let cleanResponse = responseText.trim();

      // Try to parse JSON response
      try {
        const jsonResponse = JSON.parse(cleanResponse);
        // If response has 'output' field, use it
        if (jsonResponse.output) {
          cleanResponse = jsonResponse.output;
        } else if (typeof jsonResponse === "string") {
          cleanResponse = jsonResponse;
        } else {
          // If it's an object but no 'output' field, stringify it
          cleanResponse = JSON.stringify(jsonResponse, null, 2);
        }
      } catch {
        // If not JSON, use the text as is
        cleanResponse = responseText.trim();
      }

      // Add bot response
      const botMessage: ChatMessage = {
        role: "bot",
        content: cleanResponse,
        id: generateUUID(),
        type: "text",
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
