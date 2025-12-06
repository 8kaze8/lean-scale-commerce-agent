import { renderHook, act, waitFor } from "@testing-library/react";
import { useChat } from "../use-chat";
import { useToast } from "@/components/ui/use-toast";

// Mock useToast
jest.mock("@/components/ui/use-toast", () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));

// Mock fetch
global.fetch = jest.fn();

describe("useChat", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it("should initialize with empty messages", () => {
    const { result } = renderHook(() => useChat());
    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("should enforce rate limiting - block after 5 messages in 1 minute", async () => {
    const mockToast = jest.fn();
    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });

    // Mock successful fetch for first 5 messages
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ output: "Response", type: "text" }),
    });

    const { result } = renderHook(() => useChat());

    // Send 5 messages quickly
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        await result.current.sendMessage(`Test message ${i}`);
      });
    }

    // 6th message should be blocked
    await act(async () => {
      await result.current.sendMessage("6th message");
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "destructive",
        title: "Rate Limit Exceeded",
      })
    );
  });

  it("should allow messages after rate limit expires", async () => {
    jest.useFakeTimers();
    const mockToast = jest.fn();
    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });

    // Mock successful fetch
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ output: "Response", type: "text" }),
    });

    const { result } = renderHook(() => useChat());

    // Send 5 messages
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        await result.current.sendMessage(`Test message ${i}`);
      });
    }

    // Fast forward 61 seconds
    act(() => {
      jest.advanceTimersByTime(61000);
    });

    // Now should allow another message
    await act(async () => {
      await result.current.sendMessage("Message after timeout");
    });

    // Should not show rate limit error (only fetch errors if any)
    const rateLimitCalls = mockToast.mock.calls.filter(
      (call) => call[0]?.title === "Rate Limit Exceeded"
    );
    expect(rateLimitCalls.length).toBe(0);
    jest.useRealTimers();
  });

  it("should parse product-list response correctly", async () => {
    const mockResponse = {
      output: "Here are some products",
      type: "product-list",
      products: [
        { id: 1, name: "Product 1", price: 100, imageUrl: "url1" },
        { id: 2, name: "Product 2", price: 200, imageUrl: "url2" },
      ],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockResponse),
    });

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("Show products");
    });

    await waitFor(() => {
      expect(result.current.messages.length).toBeGreaterThan(0);
    });

    const botMessage = result.current.messages.find((m) => m.role === "bot");
    expect(botMessage?.type).toBe("product-list");
    expect(botMessage?.data).toHaveLength(2);
  });

  it("should parse order-status response correctly", async () => {
    const mockResponse = {
      output: "Your order has been delivered",
      type: "order_status",
      orderId: "ORD-1001",
      status: "Delivered",
      deliveryDate: "2024-12-05",
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockResponse),
    });

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("Check my order");
    });

    await waitFor(() => {
      expect(result.current.messages.length).toBeGreaterThan(0);
    });

    const botMessage = result.current.messages.find((m) => m.role === "bot");
    // Type might be "order_status" or "order-status" depending on parsing
    expect(botMessage?.type).toMatch(/order[-_]status/);
    expect(botMessage?.data?.[0]?.orderId).toBe("ORD-1001");
  });

  it("should handle network errors gracefully", async () => {
    const mockToast = jest.fn();
    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });

    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("Test message");
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "destructive",
      })
    );
    // Check that it's a network-related error
    const toastCall = mockToast.mock.calls[0][0];
    expect(toastCall.title).toMatch(/Network|Error/i);
  });

  it("should handle 500 server errors", async () => {
    const mockToast = jest.fn();
    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    });

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("Test message");
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "destructive",
        title: "Server Error",
      })
    );
  });
});

