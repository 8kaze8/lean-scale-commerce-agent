import { render, screen } from "@testing-library/react";
import { UIMapper } from "../ui-mapper";
import { ChatMessage } from "@/src/hooks/use-chat";

// Mock useTextReveal
jest.mock("@/src/hooks/use-text-reveal", () => ({
  useTextReveal: jest.fn(() => ({
    displayedText: "Test text",
    isComplete: true,
  })),
}));

// Mock react-markdown
jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

describe("UIMapper", () => {
  it("should render product list when type is product-list", () => {
    const message: ChatMessage = {
      id: "1",
      role: "bot",
      content: "Here are some products",
      type: "product-list",
      data: [
        { id: 1, name: "Product 1", price: 100, imageUrl: "" },
        { id: 2, name: "Product 2", price: 200, imageUrl: "" },
      ],
    };

    render(<UIMapper message={message} />);

    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("Product 2")).toBeInTheDocument();
  });

  it("should render order status when type is order-status", () => {
    const message: ChatMessage = {
      id: "1",
      role: "bot",
      content: "Your order status",
      type: "order-status",
      data: [
        {
          orderId: "ORD-1001",
          status: "Delivered",
          expectedDeliveryDate: "2024-12-05",
        },
      ],
    };

    render(<UIMapper message={message} />);

    expect(screen.getByText("ORD-1001")).toBeInTheDocument();
    expect(screen.getByText("Delivered")).toBeInTheDocument();
  });

  it("should render text message when type is text", () => {
    const message: ChatMessage = {
      id: "1",
      role: "bot",
      content: "Hello, how can I help?",
      type: "text",
    };

    render(<UIMapper message={message} />);

    expect(screen.getByText(/Hello, how can I help\?/i)).toBeInTheDocument();
  });

  it("should clean product list from AI message text", () => {
    const message: ChatMessage = {
      id: "1",
      role: "bot",
      content: "Here are products:\n* **Product 1** - **100 SAR**\n* **Product 2** - **200 SAR**",
      type: "product-list",
      data: [
        { id: 1, name: "Product 1", price: 100, imageUrl: "" },
        { id: 2, name: "Product 2", price: 200, imageUrl: "" },
      ],
    };

    render(<UIMapper message={message} />);

    // Should show intro text but not the product list in text
    expect(screen.getByText(/Here are products/i)).toBeInTheDocument();
    // Products should be in cards, not in text
    expect(screen.getByText("Product 1")).toBeInTheDocument();
  });
});

