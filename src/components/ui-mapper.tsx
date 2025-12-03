"use client";

import { ProductCard } from "./product-card";
import { OrderBox } from "./order-box";
import { ChatMessage } from "@/src/hooks/use-chat";

interface UIMapperProps {
  message: ChatMessage & {
    data?: any[];
  };
}

export const UIMapper = ({ message }: UIMapperProps) => {
  const handleAddToCart = (id: number) => {
    // Placeholder function - can be connected to cart context later
    console.log("Add to cart:", id);
    // TODO: Implement cart functionality
  };

  switch (message.type) {
    case "product-list":
      if (!message.data || !Array.isArray(message.data)) {
        // Fallback to text if data is invalid
        return <p className="text-sm whitespace-pre-wrap">{message.content}</p>;
      }

      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
          {message.data.map((product: any, index: number) => (
            <ProductCard
              key={product.id || index}
              id={product.id || index}
              name={product.name || "Unknown Product"}
              price={product.price || 0}
              imageUrl={product.imageUrl || product.image || ""}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      );

    case "order-status":
      return (
        <div className="p-4">
          <OrderBox
            orderId={message.data?.[0]?.orderId}
            status={message.data?.[0]?.status}
            items={message.data?.[0]?.items}
          />
        </div>
      );

    default:
      // Default case: render as text
      return (
        <div className="rounded-lg px-4 py-2 bg-muted text-muted-foreground">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      );
  }
};

