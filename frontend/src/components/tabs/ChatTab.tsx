"use client";

import { Separator } from "@/components/ui/separator";
import { useAgentChat } from "@/hooks/useAgentChat";
import { ChatMessageList } from "./chat/ChatMessageList";
import { ChatInputBar } from "./chat/ChatInputBar";

export const ChatTab = () => {
  const { messages, sendMessage, isSending } = useAgentChat();

  return (
    <div className="flex flex-col gap-3 pb-4">
      <ChatMessageList messages={messages} isSending={isSending} />
      <Separator className="opacity-50" />
      <ChatInputBar onSend={sendMessage} disabled={isSending} />
    </div>
  );
};
