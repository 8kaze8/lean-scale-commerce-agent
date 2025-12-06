import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CouponBadge } from "../coupon-badge";

// Mock clipboard API
const mockWriteText = jest.fn().mockResolvedValue(undefined);

// Mock navigator.clipboard
Object.defineProperty(navigator, "clipboard", {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
  configurable: true,
});

describe("CouponBadge", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWriteText.mockResolvedValue(undefined);
  });

  it("should render coupon code", () => {
    render(<CouponBadge code="SORRY10" />);

    expect(screen.getByText("SORRY10")).toBeInTheDocument();
    expect(screen.getByText(/Coupon Code/i)).toBeInTheDocument();
  });

  it("should copy code to clipboard when button is clicked", async () => {
    const user = userEvent.setup();
    render(<CouponBadge code="SORRY10" />);

    const copyButton = screen.getByText("Copy");
    await user.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith("SORRY10");
  });

  it("should show 'Copied' after successful copy", async () => {
    const user = userEvent.setup();
    render(<CouponBadge code="SORRY10" />);

    const copyButton = screen.getByText("Copy");
    await user.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText("Copied")).toBeInTheDocument();
    });
  });

  it("should fallback to execCommand if clipboard API fails", async () => {
    // Mock clipboard API to fail
    mockWriteText.mockRejectedValue(new Error("Clipboard error"));

    // Mock execCommand
    const mockExecCommand = jest.fn().mockReturnValue(true);
    document.execCommand = mockExecCommand;

    const user = userEvent.setup();
    render(<CouponBadge code="SORRY10" />);

    const copyButton = screen.getByText("Copy");
    await user.click(copyButton);

    // Should fallback to execCommand
    await waitFor(() => {
      expect(mockExecCommand).toHaveBeenCalledWith("copy");
    });
  });
});

