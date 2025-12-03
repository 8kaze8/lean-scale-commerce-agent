"use client";

import { ProductCard } from "./product-card";
import { OrderBox } from "./order-box";
import { ChatMessage } from "@/src/hooks/use-chat";

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

  // Check if it's a product list type (handle various formats from n8n)
  if (
    normalizedType === "product-list" ||
    normalizedType === "product_recommendation" ||
    normalizedType === "product recommendation" ||
    normalizedType.includes("product")
  ) {
    if (!products || !Array.isArray(products) || products.length === 0) {
      // Fallback to text if data is invalid
      return (
        <div className="rounded-2xl px-4 py-3 bg-muted text-muted-foreground shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      );
    }

    return (
      <div className="w-full">
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
  if (normalizedType === "order-status" || normalizedType.includes("order")) {
    return (
      <div className="p-4">
        <OrderBox
          orderId={message.data?.[0]?.orderId}
          status={message.data?.[0]?.status}
          items={message.data?.[0]?.items}
        />
      </div>
    );
  }

  // Default: render as text
  return (
    <div className="rounded-2xl px-4 py-3 bg-muted text-muted-foreground shadow-sm">
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {message.content}
      </p>
    </div>
  );
};
