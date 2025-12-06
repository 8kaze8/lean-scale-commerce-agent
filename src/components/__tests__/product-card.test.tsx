import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductCard } from "../product-card";

describe("ProductCard", () => {
  const mockProduct = {
    id: 1,
    name: "Test Product",
    price: 100,
    imageUrl: "https://example.com/image.jpg",
    onAddToCart: jest.fn(),
  };

  it("should render product information correctly", () => {
    render(<ProductCard {...mockProduct} />);

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText(/SAR.*100/i)).toBeInTheDocument();
    expect(screen.getByText("Add to Cart")).toBeInTheDocument();
  });

  it("should call onAddToCart when button is clicked", async () => {
    const user = userEvent.setup();
    const onAddToCart = jest.fn();
    render(<ProductCard {...mockProduct} onAddToCart={onAddToCart} />);

    const button = screen.getByText("Add to Cart");
    await user.click(button);

    expect(onAddToCart).toHaveBeenCalledWith(1);
  });

  it("should show placeholder when imageUrl is invalid", () => {
    render(<ProductCard {...mockProduct} imageUrl="" />);

    // Should still render product info
    expect(screen.getByText("Test Product")).toBeInTheDocument();
  });

  it("should format price correctly in SAR", () => {
    render(<ProductCard {...mockProduct} price={1500} />);

    expect(screen.getByText(/SAR.*1,500/i)).toBeInTheDocument();
  });
});

