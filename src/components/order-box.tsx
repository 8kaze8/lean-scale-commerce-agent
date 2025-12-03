"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, CheckCircle2, AlertCircle, Truck } from "lucide-react";
import { CouponBadge } from "./coupon-badge";
import { cn } from "@/lib/utils";

interface OrderBoxProps {
  orderId?: string;
  status?: string;
  items?: Array<{ name: string; quantity: number; price: number }>;
  couponCode?: string;
  expectedDeliveryDate?: string;
}

export const OrderBox = ({
  orderId,
  status,
  items,
  couponCode,
  expectedDeliveryDate,
}: OrderBoxProps) => {
  const normalizedStatus = status?.toLowerCase() || "";
  const isDelivered = normalizedStatus === "delivered";
  const isDelayed = normalizedStatus === "delayed";
  const isShipped = normalizedStatus === "shipped";

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Package className="h-4 w-4" />
          Order Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {orderId && (
          <div>
            <span className="text-sm font-semibold">Order ID: </span>
            <span className="text-sm font-mono">{orderId}</span>
          </div>
        )}

        {status && (
          <div className="flex items-center gap-2">
            {isDelivered ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            ) : isDelayed ? (
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            ) : isShipped ? (
              <Truck className="h-5 w-5 text-yellow-600 shrink-0" />
            ) : (
              <Package className="h-5 w-5 text-muted-foreground shrink-0" />
            )}
            <div>
              <span className="text-sm font-semibold">Status: </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  isDelivered && "text-green-600",
                  isDelayed && "text-red-600",
                  isShipped && "text-yellow-600"
                )}
              >
                {status}
              </span>
            </div>
          </div>
        )}

        {expectedDeliveryDate && (
          <div>
            <span className="text-sm font-semibold">
              {isDelivered ? "Date of Delivery: " : "Expected Delivery: "}
            </span>
            <span className="text-sm">{expectedDeliveryDate}</span>
          </div>
        )}

        {items && items.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2">Items:</p>
            <ul className="space-y-1">
              {items.map((item, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {item.name} x{item.quantity} -{" "}
                  {new Intl.NumberFormat("en-SA", {
                    style: "currency",
                    currency: "SAR",
                  }).format(item.price * item.quantity)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Coupon Section - Show only if status is Delayed */}
        {isDelayed && couponCode && (
          <div className="pt-2 border-t">
            <p className="text-sm font-semibold mb-3 text-muted-foreground">
              As a token of our apology:
            </p>
            <CouponBadge code={couponCode} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

