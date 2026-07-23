"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { agentApi } from "@/api/agent";
import { ApiError } from "@/api/client";
import { useChatStore } from "@/store/chatStore";
import type { AgentMessage } from "@/types/agent";

const MAX_HISTORY = 20;

export function useAgentChat() {
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);

  const mutation = useMutation({
    // Called when mutate() runs below; whatever mutate() is passed becomes `history` here.
    mutationFn: (history: AgentMessage[]) => agentApi.chat(history),

    // Fires automatically once mutationFn's promise resolves. `data` is the AgentChatResponse.
    onSuccess: (data) => {
      addMessage({
        role: "assistant",
        content: data.reply,
        results: data.results,
      });
    },

    // Fires automatically if mutationFn's promise rejects (ApiError on HTTP failure, plain Error on network failure).
    onError: (error: Error) => {
      if (error instanceof ApiError && error.status === 429) {
        toast.error("You're chatting a bit fast, try again in a moment.");
      } else {
        toast.error(
          "Ask Spotential is unavailable right now, please try again.",
        );
      }
    },
  });

  const sendMessage = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || mutation.isPending) return;

    // Add user message to chat even if it fails; we still want to show it even if the assistant responds quickly.
    addMessage({ role: "user", content: trimmed });

    const history: AgentMessage[] = [
      ...messages.map(({ role, content }) => ({ role, content })),
      // add the newest user message as part of history when sending
      { role: "user" as const, content: trimmed },
    ].slice(-MAX_HISTORY);

    // Triggers mutationFn with `history`; fire-and-forget, outcome handled via onSuccess/onError above.
    mutation.mutate(history);
  };

  return {
    messages,
    sendMessage,
    // True from the moment mutate() is called until the promise settles; drives the "Thinking..." spinner.
    isSending: mutation.isPending,
  };
}
