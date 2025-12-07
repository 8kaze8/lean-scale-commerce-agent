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
    <Card className="group shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border-border/50 hover:border-primary/20">
      <div className="aspect-square w-full overflow-hidden bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center relative">
        {hasValidImage ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-muted-foreground/60"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" />
              <path d="M9 9h6v6H9z" strokeLinecap="round" />
            </svg>
          </div>
        )}
      </div>
      <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        <h3 className="font-semibold text-xs sm:text-sm leading-snug line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] text-foreground">
          {name}
        </h3>
        <div className="flex items-baseline justify-between">
          <p className="font-bold text-lg sm:text-xl text-primary">{formattedPrice}</p>
        </div>
        <Button
          onClick={() => onAddToCart(id)}
          className="w-full font-medium text-xs sm:text-sm"
          size="sm"
        >
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
};

