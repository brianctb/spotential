import { apiClient } from "./client";
import { AgentChatResponse, AgentMessage } from "@/types/agent";

export const agentApi = {
    chat: (messages: AgentMessage[]) =>
        apiClient.post<AgentChatResponse>("/agent/chat", { messages }),
};
