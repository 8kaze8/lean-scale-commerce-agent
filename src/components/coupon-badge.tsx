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
      // Try modern Clipboard API first (works on HTTPS and localhost)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }

      // Fallback: Use document.execCommand for older browsers or HTTP
      const textArea = document.createElement("textarea");
      textArea.value = code;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand("copy");
        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          throw new Error("execCommand failed");
        }
      } finally {
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error("Failed to copy:", error);
      // Show a fallback message or toast if needed
      // For now, we'll just log the error
    }
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed border-primary/30 rounded-lg p-3 sm:p-4 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3",
        className
      )}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0">
          Coupon Code:
        </span>
        <span className="text-base sm:text-lg font-bold text-primary font-mono break-all">
          {code}
        </span>
      </div>
      <Button
        onClick={handleCopy}
        size="sm"
        variant="outline"
        className="shrink-0 w-full sm:w-auto text-xs sm:text-sm"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Copy
          </>
        )}
      </Button>
    </div>
  );
};

