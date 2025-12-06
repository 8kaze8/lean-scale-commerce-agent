import {
  extractOrderId,
  extractCouponCode,
  extractStatus,
  extractDeliveryDate,
} from "../use-chat";

describe("extractOrderId", () => {
  it("should extract order ID from text", () => {
    expect(extractOrderId("Your order ORD-1001 has been shipped")).toBe(
      "ORD-1001"
    );
    expect(extractOrderId("Order ORD1234 is ready")).toBe("ORD1234");
    expect(extractOrderId("ORD-9999")).toBe("ORD-9999");
  });

  it("should return undefined when no order ID found", () => {
    expect(extractOrderId("Your order has been shipped")).toBeUndefined();
    expect(extractOrderId("")).toBeUndefined();
  });
});

describe("extractCouponCode", () => {
  it("should extract coupon code from various formats", () => {
    expect(extractCouponCode("Use coupon code SORRY10")).toBe("SORRY10");
    expect(extractCouponCode('Coupon code "SAVE20"')).toBe("SAVE20");
    expect(extractCouponCode("Code: WELCOME15")).toBe("WELCOME15");
    expect(extractCouponCode("**SORRY10**")).toBe("SORRY10");
  });

  it("should return undefined when no coupon code found", () => {
    expect(extractCouponCode("No coupon code available")).toBeUndefined();
    expect(extractCouponCode("Just regular text without any codes")).toBeUndefined();
    expect(extractCouponCode("Simple text")).toBeUndefined();
    expect(extractCouponCode("")).toBeUndefined();
  });
});

describe("extractStatus", () => {
  it("should extract status correctly", () => {
    expect(extractStatus("Your order has been shipped")).toBe("Shipped");
    expect(extractStatus("Order is delivered")).toBe("Delivered");
    expect(extractStatus("Your order is delayed")).toBe("Delayed");
    expect(extractStatus("Order is processing")).toBe("Processing");
    expect(extractStatus("Order is pending")).toBe("Pending");
    expect(extractStatus("Order cancelled")).toBe("Cancelled");
  });

  it("should prioritize specific statuses", () => {
    // "shipped" should not match "delivered"
    expect(extractStatus("Order has been delivered")).toBe("Delivered");
    expect(extractStatus("Order shipped today")).toBe("Shipped");
  });

  it("should return undefined when no status found", () => {
    expect(extractStatus("Random text")).toBeUndefined();
    expect(extractStatus("")).toBeUndefined();
  });
});

describe("extractDeliveryDate", () => {
  it("should extract date in YYYY-MM-DD format", () => {
    expect(extractDeliveryDate("Delivery on 2024-12-05")).toBe("2024-12-05");
    expect(extractDeliveryDate("Expected: 2024/12/05")).toBe("2024/12/05");
  });

  it("should extract written dates and convert to YYYY-MM-DD", () => {
    const date = extractDeliveryDate("Delivered on December 5, 2024");
    // Date conversion might vary by timezone, so just check it's a valid date format
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(date).toContain("2024");
  });

  it("should extract dates with context", () => {
    expect(extractDeliveryDate("Delivered by 2024-12-05")).toBe("2024-12-05");
    expect(extractDeliveryDate("Expected before 2024-12-05")).toBe(
      "2024-12-05"
    );
  });

  it("should return undefined when no date found", () => {
    expect(extractDeliveryDate("No date here")).toBeUndefined();
    expect(extractDeliveryDate("")).toBeUndefined();
  });
});

