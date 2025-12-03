"use client";

import { ProductCard } from "./product-card";
import { OrderBox } from "./order-box";
import { ChatMessage } from "@/src/hooks/use-chat";
import { useTextReveal } from "@/src/hooks/use-text-reveal";

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
        <div className="rounded-2xl px-4 py-3 bg-muted text-muted-foreground shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {displayedText}
          </p>
        </div>
      );
    }

    return (
      <div className="w-full space-y-3 max-w-full">
        {/* Show AI message if available - with text reveal effect */}
        {message.content && message.content.trim() && (
          <div className="rounded-2xl px-4 py-3 bg-muted text-muted-foreground shadow-sm w-full max-w-full">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {displayedText}
            </p>
          </div>
        )}
        {/* Product cards */}
        <div 
          className="overflow-x-auto scrollbar-hide scroll-smooth py-2"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <div className="flex gap-3 px-4 pr-8" style={{ width: 'max-content', minWidth: '100%' }}>
            {products.map((product: any, index: number) => (
              <div
                key={product.id || index}
                className="w-[240px] sm:w-[260px] flex-shrink-0"
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
      <div className="w-full space-y-3 max-w-full">
        {/* Show AI message if available - with text reveal effect */}
        {message.content && message.content.trim() && (
          <div className="rounded-2xl px-4 py-3 bg-muted text-muted-foreground shadow-sm w-full max-w-full">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {displayedText}
            </p>
          </div>
        )}
        {/* Order Box */}
        <div className="p-4">
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

  // Default: render as text - with text reveal effect
  return (
    <div className="rounded-2xl px-4 py-3 bg-muted text-muted-foreground shadow-sm">
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {displayedText}
      </p>
    </div>
  );
};
