"use client";

import { Separator } from "@/components/ui/separator";
import { useAgentChat } from "@/hooks/useAgentChat";
import { ChatMessageList } from "./chat/ChatMessageList";
import { ChatInputBar } from "./chat/ChatInputBar";

export const ChatTab = () => {
  const { messages, sendMessage, isSending } = useAgentChat();

  return (
    <div className="flex min-h-full flex-col gap-3">
      <ChatMessageList messages={messages} isSending={isSending} />

      <div className="sticky bottom-0 bg-background pt-2 pb-4">
        <Separator className="opacity-50 mb-3" />
        <ChatInputBar onSend={sendMessage} disabled={isSending} />
      </div>
    </div>
  );
};
