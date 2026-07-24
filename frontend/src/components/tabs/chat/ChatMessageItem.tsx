import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { ChatResultCard } from "./ChatResultCard";
import type { ChatMessage } from "@/store/chatStore";

// Overrides default tags with compact chat-bubble spacing; without it,
// browser-default margins around things like **bold** text and lists
// blow out the bubble.
const markdownComponents = {
  p: ({ ...props }) => <p className="mb-1 last:mb-0" {...props} />,
  ul: ({ ...props }) => <ul className="my-1 list-disc pl-4" {...props} />,
  ol: ({ ...props }) => <ol className="my-1 list-decimal pl-4" {...props} />,
  li: ({ ...props }) => <li className="mb-0.5" {...props} />,
  strong: ({ ...props }) => <strong className="font-semibold" {...props} />,
  a: ({ ...props }) => (
    <a
      className="underline underline-offset-2"
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
};

export const ChatMessageItem = ({ message }: { message: ChatMessage }) => {
  // in the chat window, user message is on the right, bot message is on the left
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        isUser ? "items-end" : "items-start",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-3 py-2 text-sm",
          isUser
            ? "bg-selected-blue text-[oklch(0.98_0.005_260)]"
            : "bg-card ring-1 ring-foreground/10",
        )}
      >
        {isUser ? (
          // user's own text stays literal; without this branch, typing
          // "**hi**" would render bold instead of what they actually typed
          message.content
        ) : (
          <ReactMarkdown
            // remarkGfm adds the relaxed list parsing Claude's replies use;
            // without it, a line like "- **text**" renders as a literal
            // dash instead of a bulleted list item
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {message.content}
          </ReactMarkdown>
        )}
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
