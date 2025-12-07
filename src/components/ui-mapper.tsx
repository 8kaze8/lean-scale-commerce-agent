"use client";

import { ProductCard } from "./product-card";
import { OrderBox } from "./order-box";
import { ChatMessage } from "@/src/hooks/use-chat";
import { useTextReveal } from "@/src/hooks/use-text-reveal";
import ReactMarkdown from "react-markdown";

interface UIMapperProps {
  message: ChatMessage & {
    data?: any[];
    products?: any[];
  };
}

export const UIMapper = ({ message }: UIMapperProps) => {
  const handleAddToCart = (id: number) => {
    // Placeholder function - can be connected to cart context later
    console.log("Add to cart:", id);
    // TODO: Implement cart functionality
  };

  // Get products from data array or products array
  const products = message.data || message.products || [];

  // Normalize type for comparison
  const normalizedType = message.type?.toLowerCase() || "";

  // Use text reveal for AI message text (word chunks, not character-by-character)
  // Always call hook at top level to follow React rules
  const shouldAnimateText = !!message.content && message.content.trim().length > 0;
  const { displayedText } = useTextReveal({
    text: message.content || "",
    chunkSize: 5, // Show 5 words at a time (faster)
    delay: 30, // 30ms between chunks (very fast, like Gemini)
    enabled: shouldAnimateText,
  });

  // Helper function to clean product list from AI message text
  // Removes markdown product lists (e.g., "* **Product** - **Price**") to avoid duplication
  const cleanProductListFromText = (text: string): string => {
    if (!text) return text;
    
    // Remove markdown list items that look like products
    // Pattern: *   **Product Name** - **Price** (with optional spaces)
    // Also handles: - **Product Name** - **Price**
    const productListPattern = /^[\s]*[-*]\s+\*\*[^*]+?\*\*\s*-\s*\*\*[^*]+?\*\*[\s]*$/gm;
    let cleaned = text.replace(productListPattern, "");
    
    // Also remove standalone product lines with bold formatting (without list markers)
    // Pattern: **Product Name** - **Price** (standalone line)
    const boldProductPattern = /^\s*\*\*[^*]+?\*\*\s*-\s*\*\*[^*]+?\*\*\s*$/gm;
    cleaned = cleaned.replace(boldProductPattern, "");
    
    // Remove lines that are just product names with prices in various formats
    // Pattern: Product Name - Price (with or without bold)
    const simpleProductPattern = /^[\s]*[-*]?\s*[^*\n]+?\s*-\s*\d+\s*SAR[\s]*$/gmi;
    cleaned = cleaned.replace(simpleProductPattern, "");
    
    // Clean up multiple consecutive newlines (3+ becomes 2)
    cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
    
    // Remove leading/trailing whitespace from each line
    cleaned = cleaned
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n");
    
    // Trim and return
    return cleaned.trim();
  };

  // Check if it's a product list type (handle various formats from n8n)
  if (
    normalizedType === "product-list" ||
    normalizedType === "product_recommendation" ||
    normalizedType === "product recommendation" ||
    normalizedType.includes("product")
  ) {
    if (!products || !Array.isArray(products) || products.length === 0) {
      // Fallback to text if data is invalid - with text reveal
      return (
        <div className="rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 bg-muted text-muted-foreground shadow-sm">
          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
            {displayedText}
          </p>
        </div>
      );
    }

    // Clean the AI message to remove product list (since we show it in cards)
    const cleanedContent = cleanProductListFromText(message.content || "");
    const shouldShowIntroText = cleanedContent && cleanedContent.trim().length > 0;

    return (
      <div className="w-full space-y-2 sm:space-y-3 max-w-full">
        {/* Show AI intro message if available (cleaned from product list) - with markdown rendering */}
        {shouldShowIntroText && (
          <div className="rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 bg-muted text-muted-foreground shadow-sm w-full max-w-full">
            <div className="markdown-content break-words text-xs sm:text-sm">
              <ReactMarkdown>{cleanedContent}</ReactMarkdown>
            </div>
          </div>
        )}
        {/* Product cards */}
        <div 
          className="overflow-x-auto scrollbar-hide scroll-smooth py-1 sm:py-2 -mx-2 sm:mx-0"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <div className="flex gap-2 sm:gap-3 px-2 sm:px-4 pr-4 sm:pr-8" style={{ width: 'max-content', minWidth: '100%' }}>
            {products.map((product: any, index: number) => (
              <div
                key={product.id || index}
                className="w-[200px] sm:w-[240px] md:w-[260px] flex-shrink-0"
              >
                <ProductCard
                  id={product.id || index}
                  name={product.name || "Unknown Product"}
                  price={product.price || 0}
                  imageUrl={product.imageUrl || product.image || ""}
                  onAddToCart={handleAddToCart}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Handle order status
  if (
    normalizedType === "order-status" ||
    normalizedType.includes("order") ||
    normalizedType === "shipped" ||
    normalizedType === "delivered" ||
    normalizedType === "delayed" ||
    normalizedType === "processing" ||
    normalizedType === "pending" ||
    normalizedType.includes("delivery") || // DELIVERY_CONFIRMATION, DELIVERY_NOTIFICATION
    normalizedType.includes("confirmation") ||
    normalizedType.includes("notification")
  ) {
    const orderData = message.data?.[0] || {};
    return (
      <div className="w-full space-y-2 sm:space-y-3 max-w-full">
        {/* Show AI message if available - with markdown rendering */}
        {message.content && message.content.trim() && (
          <div className="rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 bg-muted text-muted-foreground shadow-sm w-full max-w-full">
            <div className="markdown-content break-words text-xs sm:text-sm">
              <ReactMarkdown>{displayedText}</ReactMarkdown>
            </div>
          </div>
        )}
        {/* Order Box */}
        <div className="p-2 sm:p-4">
          <OrderBox
            orderId={orderData.orderId}
            status={orderData.status}
            items={orderData.items}
            couponCode={orderData.couponCode || orderData.coupon}
            expectedDeliveryDate={orderData.expectedDeliveryDate || orderData.deliveryDate}
          />
        </div>
      </div>
    );
  }

  // Default: render as text - with markdown rendering
  return (
    <div className="rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 bg-muted text-muted-foreground shadow-sm">
      <div className="markdown-content break-words text-xs sm:text-sm">
        <ReactMarkdown>{displayedText}</ReactMarkdown>
      </div>
    </div>
  );
};
