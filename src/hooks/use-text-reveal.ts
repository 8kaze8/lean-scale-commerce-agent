"use client";

import { useState, useEffect } from "react";

interface UseTextRevealOptions {
  text: string;
  chunkSize?: number; // Number of words per chunk
  delay?: number; // Delay between chunks in ms
  enabled?: boolean;
}

export const useTextReveal = ({
  text,
  chunkSize = 3, // Show 3 words at a time
  delay = 50, // 50ms between chunks (faster than typewriter)
  enabled = true,
}: UseTextRevealOptions) => {
  const [displayedText, setDisplayedText] = useState(enabled ? "" : text);
  const [isComplete, setIsComplete] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    setDisplayedText("");
    setIsComplete(false);
    
    // Split text into words
    const words = text.split(/\s+/);
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < words.length) {
        // Show chunks of words
        const endIndex = Math.min(currentIndex + chunkSize, words.length);
        const chunk = words.slice(0, endIndex).join(" ");
        setDisplayedText(chunk);
        currentIndex = endIndex;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, delay);

    return () => clearInterval(interval);
  }, [text, chunkSize, delay, enabled]);

  return { displayedText, isComplete };
};

