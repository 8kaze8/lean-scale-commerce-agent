"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  onAddToCart: (id: number) => void;
}

export const ProductCard = ({
  id,
  name,
  price,
  imageUrl,
  onAddToCart,
}: ProductCardProps) => {
  const formattedPrice = new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 0,
  }).format(price);

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <div className="aspect-square w-full overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            e.currentTarget.src =
              "https://via.placeholder.com/300x300?text=No+Image";
          }}
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2">{name}</h3>
        <p className="font-bold text-lg mb-3 text-primary">{formattedPrice}</p>
        <Button
          onClick={() => onAddToCart(id)}
          className="w-full"
          size="sm"
        >
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
};

