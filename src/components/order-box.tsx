"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

interface OrderBoxProps {
  orderId?: string;
  status?: string;
  items?: Array<{ name: string; quantity: number; price: number }>;
}

export const OrderBox = ({ orderId, status, items }: OrderBoxProps) => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Package className="h-4 w-4" />
          Order Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {orderId && (
          <p className="text-sm mb-2">
            <span className="font-semibold">Order ID:</span> {orderId}
          </p>
        )}
        {status && (
          <p className="text-sm mb-2">
            <span className="font-semibold">Status:</span> {status}
          </p>
        )}
        {items && items.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold mb-2">Items:</p>
            <ul className="space-y-1">
              {items.map((item, index) => (
                <li key={index} className="text-sm">
                  {item.name} x{item.quantity} - {item.price} SAR
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

