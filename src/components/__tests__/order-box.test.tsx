import { render, screen } from "@testing-library/react";
import { OrderBox } from "../order-box";

describe("OrderBox", () => {
  const mockOrder = {
    orderId: "ORD-1001",
    status: "Delivered",
    expectedDeliveryDate: "2024-12-05",
    items: [],
  };

  it("should render order information correctly", () => {
    render(<OrderBox {...mockOrder} />);

    expect(screen.getByText("ORD-1001")).toBeInTheDocument();
    expect(screen.getByText("Delivered")).toBeInTheDocument();
    expect(screen.getByText("2024-12-05")).toBeInTheDocument();
  });

  it("should show 'Date of Delivery' for Delivered status", () => {
    render(<OrderBox {...mockOrder} status="Delivered" />);

    expect(screen.getByText(/Date of Delivery/i)).toBeInTheDocument();
  });

  it("should show 'Expected Delivery' for other statuses", () => {
    render(<OrderBox {...mockOrder} status="Shipped" />);

    expect(screen.getByText(/Expected Delivery/i)).toBeInTheDocument();
  });

  it("should show coupon badge for Delayed status", () => {
    render(
      <OrderBox
        {...mockOrder}
        status="Delayed"
        couponCode="SORRY10"
      />
    );

    expect(screen.getByText("SORRY10")).toBeInTheDocument();
    expect(screen.getByText(/Coupon Code/i)).toBeInTheDocument();
  });

  it("should not show coupon badge for non-delayed statuses", () => {
    render(<OrderBox {...mockOrder} status="Delivered" />);

    expect(screen.queryByText(/Coupon Code/i)).not.toBeInTheDocument();
  });
});

