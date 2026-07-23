"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MAX_MESSAGE_LENGTH = 500;

export const ChatInputBar = ({
  onSend,
  disabled,
}: {
  onSend: (message: string) => void;
  disabled: boolean;
}) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="flex gap-2">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Ask about a business idea..."
        className="border-transparent bg-card ring-1 ring-foreground/10"
        disabled={disabled}
      />
      <Button
        size="icon"
        onClick={handleSend}
        disabled={!input.trim() || disabled}
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};
