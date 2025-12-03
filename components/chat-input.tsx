"use client";

import { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  isLoading: boolean;
}

export const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim() || isLoading) {
      return;
    }

    const message = input.trim();
    setInput("");
    await onSend(message);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 p-3 border-t bg-background">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Type your message..."
        disabled={isLoading}
        className="flex-1"
      />
      <Button
        onClick={handleSend}
        disabled={isLoading || !input.trim()}
        size="icon"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};

