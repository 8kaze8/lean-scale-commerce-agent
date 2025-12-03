"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CouponBadgeProps {
  code: string;
  className?: string;
}

export const CouponBadge = ({ code, className }: CouponBadgeProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed border-primary/30 rounded-lg p-4 bg-primary/5 flex items-center justify-between gap-3",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Coupon Code:
        </span>
        <span className="text-lg font-bold text-primary font-mono">
          {code}
        </span>
      </div>
      <Button
        onClick={handleCopy}
        size="sm"
        variant="outline"
        className="shrink-0"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 mr-1" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </>
        )}
      </Button>
    </div>
  );
};

