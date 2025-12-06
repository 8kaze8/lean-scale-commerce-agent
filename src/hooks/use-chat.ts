"use client";

import { useState, useCallback, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";

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
  // Remove markdown bold/italic markers first
  const cleanText = text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/_/g, "");

  // Look for patterns like 'SORRY10', 'code SORRY10', 'coupon code SORRY10'
  // Try multiple patterns
  const patterns = [
    /(?:code|coupon code)\s+['"]?([A-Z0-9]{4,})['"]?/i, // "coupon code SORRY10"
    /['"]([A-Z0-9]{4,})['"]/, // "SORRY10"
    /\b([A-Z]{4,}\d+)\b/, // SORRY10 (word boundary)
    /(?:code|coupon)\s+([A-Z0-9]{4,})/i, // "code SORRY10"
  ];

  for (const pattern of patterns) {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return undefined;
}

function extractStatus(text: string): string | undefined {
  const lowerText = text.toLowerCase();
  // Check in order of specificity - look for exact status words
  // Use word boundaries to avoid partial matches
  if (/\bshipped\b/.test(lowerText)) return "Shipped";
  if (/\bdelivered\b/.test(lowerText)) return "Delivered";
  if (/\bdelayed\b/.test(lowerText)) return "Delayed";
  if (/\bprocessing\b/.test(lowerText)) return "Processing";
  if (/\bpending\b/.test(lowerText)) return "Pending";
  if (/\bcancelled\b/.test(lowerText) || /\bcanceled\b/.test(lowerText))
    return "Cancelled";
  // Fallback to simple includes if word boundary doesn't match
  if (lowerText.includes("shipped")) return "Shipped";
  if (lowerText.includes("delivered")) return "Delivered";
  if (lowerText.includes("delayed")) return "Delayed";
  if (lowerText.includes("processing")) return "Processing";
  return undefined;
}

function extractDeliveryDate(text: string): string | undefined {
  // Look for date patterns like "2024-12-02", "2024/12/02", "December 5, 2024", "December 5th, 2024"
  const datePatterns = [
    /\d{4}-\d{2}-\d{2}/, // 2024-12-05
    /\d{4}\/\d{2}\/\d{2}/, // 2024/12/05
    /(?:on|before|by|delivered by)\s+(\d{4}-\d{2}-\d{2})/i, // by 2024-12-05
    /(?:on|before|by|delivered by)\s+([A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})/i, // December 5, 2024 or December 5th, 2024
    /([A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})/, // December 5, 2024 (standalone)
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      const dateStr = match[1] || match[0];
      // If it's a written date like "December 5, 2024", try to convert to YYYY-MM-DD
      if (dateStr.includes(",") || /[A-Za-z]/.test(dateStr)) {
        try {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split("T")[0]; // Convert to YYYY-MM-DD
          }
        } catch {
          // If conversion fails, return as is
        }
      }
      return dateStr;
    }
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
  const messageTimestampsRef = useRef<number[]>([]); // Track message timestamps for rate limiting
  const { toast } = useToast();

  // Initialize sessionId only on client side
  if (typeof window !== "undefined" && !sessionIdRef.current) {
    sessionIdRef.current = `LSC-${generateUUID()}`;
  }

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) {
      return;
    }

    // Rate limiting: Check if user has sent too many messages in the last minute
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000; // 1 minute in milliseconds
    const MAX_MESSAGES_PER_MINUTE = 5;

    // Remove timestamps older than 1 minute
    messageTimestampsRef.current = messageTimestampsRef.current.filter(
      (timestamp) => timestamp > oneMinuteAgo
    );

    // Check if limit is exceeded
    if (messageTimestampsRef.current.length >= MAX_MESSAGES_PER_MINUTE) {
      const remainingSeconds = Math.ceil(
        (messageTimestampsRef.current[0] + 60 * 1000 - now) / 1000
      );
      toast({
        variant: "destructive",
        title: "Rate Limit Exceeded",
        description: `You can send a maximum of ${MAX_MESSAGES_PER_MINUTE} messages per minute. Please wait ${remainingSeconds} second${remainingSeconds !== 1 ? "s" : ""} before sending another message.`,
      });
      return;
    }

    // Add current timestamp to the array
    messageTimestampsRef.current.push(now);

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
              typeStr === "order_status" ||
              typeStr.includes("order") ||
              typeStr === "shipped" ||
              typeStr === "delivered" ||
              typeStr === "delayed" ||
              typeStr === "processing" ||
              typeStr === "pending" ||
              typeStr.includes("delivery") || // DELIVERY_CONFIRMATION, DELIVERY_NOTIFICATION
              typeStr.includes("confirmation") ||
              typeStr.includes("notification")
            ) {
              messageType = "order-status";
              // Parse order information from the message text
              const orderText = nestedOutput.output || "";
              const extractedCoupon = extractCouponCode(orderText);
              const extractedStatus = extractStatus(orderText);
              console.log(
                "Extracted Coupon Code:",
                extractedCoupon,
                "from text:",
                orderText
              );
              console.log(
                "Extracted Status:",
                extractedStatus,
                "from text:",
                orderText
              );
              console.log("nestedOutput.status:", nestedOutput.status);
              const orderData: any = {
                // Prefer nestedOutput.status if available, otherwise extract from text
                status: nestedOutput.status || extractedStatus,
                orderId: nestedOutput.orderId || extractOrderId(orderText),
                couponCode: nestedOutput.couponCode || extractedCoupon,
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
      let toastTitle = "Error";
      let toastDescription = "An unexpected error occurred. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("500")) {
          errorContent =
            "I'm having trouble processing your request right now. This might be a policy-related query that needs additional configuration. Please try again in a moment or rephrase your question.";
          toastTitle = "Server Error";
          toastDescription =
            "The server is having trouble processing your request. Please try again in a moment.";
        } else if (error.message.includes("404")) {
          errorContent =
            "The service is temporarily unavailable. Please try again later.";
          toastTitle = "Service Unavailable";
          toastDescription =
            "The service is temporarily unavailable. Please try again later.";
        } else if (
          error.message.includes("network") ||
          error.message.includes("fetch") ||
          error.message.includes("Failed to fetch")
        ) {
          errorContent =
            "Network error. Please check your connection and try again.";
          toastTitle = "Network Error";
          toastDescription =
            "Please check your internet connection and try again.";
        } else if (
          error.message.includes("timeout") ||
          error.message.includes("aborted")
        ) {
          errorContent = "The request took too long. Please try again.";
          toastTitle = "Request Timeout";
          toastDescription =
            "The request took too long to complete. Please try again.";
        } else {
          toastDescription = error.message || "An unexpected error occurred.";
        }
      }

      // Show toast notification
      toast({
        variant: "destructive",
        title: toastTitle,
        description: toastDescription,
      });

      // Add error message to chat
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
