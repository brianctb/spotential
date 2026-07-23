import { create } from "zustand";
import type { AgentLocationResult, AgentMessage } from "@/types/agent";

export interface ChatMessage extends AgentMessage {
    id: string;
    results?: AgentLocationResult[];
}

interface ChatStore {
    messages: ChatMessage[];
    isPanelOpen: boolean;

    addMessage: (message: Omit<ChatMessage, "id">) => ChatMessage;
    setPanelOpen: (value: boolean) => void;
    reset: () => void;
}

const createId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

export const useChatStore = create<ChatStore>((set) => ({
    messages: [],
    isPanelOpen: false,

    addMessage: (message) => {
        const newMessage: ChatMessage = { ...message, id: createId() };
        set((state) => ({ messages: [...state.messages, newMessage] }));
        return newMessage;
    },

    setPanelOpen: (value) => set({ isPanelOpen: value }),
    reset: () => set({ messages: [] }),
}));
