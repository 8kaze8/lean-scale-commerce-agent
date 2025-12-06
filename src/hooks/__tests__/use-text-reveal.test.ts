import { renderHook, act, waitFor } from "@testing-library/react";
import { useTextReveal } from "../use-text-reveal";

describe("useTextReveal", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should reveal text in chunks when enabled", async () => {
    const { result } = renderHook(() =>
      useTextReveal({
        text: "Hello world this is a test",
        chunkSize: 3,
        delay: 50,
        enabled: true,
      })
    );

    // Initially should be empty
    expect(result.current.displayedText).toBe("");

    // After first chunk (3 words)
    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(result.current.displayedText).toBe("Hello world this");

    // After second chunk
    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(result.current.displayedText).toBe("Hello world this is a test");
  });

  it("should show full text immediately when disabled", () => {
    const { result } = renderHook(() =>
      useTextReveal({
        text: "Hello world",
        enabled: false,
      })
    );

    expect(result.current.displayedText).toBe("Hello world");
    expect(result.current.isComplete).toBe(true);
  });

  it("should mark as complete when all text is revealed", async () => {
    const { result } = renderHook(() =>
      useTextReveal({
        text: "Hello world",
        chunkSize: 2,
        delay: 50,
        enabled: true,
      })
    );

    expect(result.current.isComplete).toBe(false);

    // Advance timers to complete
    act(() => {
      jest.advanceTimersByTime(200);
    });

    await waitFor(() => {
      expect(result.current.isComplete).toBe(true);
    });
  });
});

