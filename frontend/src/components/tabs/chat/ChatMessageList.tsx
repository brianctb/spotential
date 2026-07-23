"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { ChatMessageItem } from "./ChatMessageItem";
import type { ChatMessage } from "@/store/chatStore";

export const ChatMessageList = ({
  messages,
  isSending,
}: {
  messages: ChatMessage[];
  isSending: boolean;
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  return (
    <div className="flex flex-col gap-3">
      {messages.length === 0 && (
        <p className="text-sm text-muted-foreground text-center pt-4">
          Ask about the best locations for a business, e.g. &quot;top 5 gyms in
          Vancouver&quot;.
        </p>
      )}

      {messages.map((message) => (
        <ChatMessageItem key={message.id} message={message} />
      ))}

      {isSending && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Thinking...
        </div>
      )}

      {/* scroll anchor - keeps the view pinned to the newest message */}
      <div ref={bottomRef} />
    </div>
  );
};
