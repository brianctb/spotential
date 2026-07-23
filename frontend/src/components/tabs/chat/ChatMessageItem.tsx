import { cn } from "@/lib/utils";
import { ChatResultCard } from "./ChatResultCard";
import type { ChatMessage } from "@/store/chatStore";

export const ChatMessageItem = ({ message }: { message: ChatMessage }) => {
  // in the chat window, user message is on the right, bot message is on the left
  const isUser = message.role === "user";

  return (
    <div className={cn("flex flex-col gap-2", isUser ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-3 py-2 text-sm",
          isUser
            ? "bg-selected-blue text-[oklch(0.98_0.005_260)]"
            : "bg-card ring-1 ring-foreground/10"
        )}
      >
        {message.content}
      </div>

      {message.results && message.results.length > 0 && (
        <div className="flex w-full flex-col gap-2">
          {message.results.map((result) => (
            <ChatResultCard key={result.tract_id} result={result} />
          ))}
        </div>
      )}
    </div>
  );
};
