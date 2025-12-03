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

  // Check if we have a valid image URL
  const hasValidImage =
    imageUrl &&
    imageUrl !== "N/A" &&
    imageUrl !== "null" &&
    imageUrl.trim() !== "" &&
    imageUrl.startsWith("http");

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <div className="aspect-square w-full overflow-hidden bg-muted flex items-center justify-center relative">
        {hasValidImage ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Hide image on error, placeholder will show
              e.currentTarget.style.display = "none";
            }}
          />
        ) : null}
        {/* Placeholder icon - shows when no image or image fails */}
        {!hasValidImage && (
          <div className="flex items-center justify-center w-full h-full absolute inset-0">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-muted-foreground"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" />
              <path d="M9 9h6v6H9z" strokeLinecap="round" />
            </svg>
          </div>
        )}
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

