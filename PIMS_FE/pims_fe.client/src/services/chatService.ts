import api from "./api";
import type {
  Conversation,
  Message,
  SendMessageRequest,
} from "../types/chat.types";

const chatService = {
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get("/api/chat/conversations");
    return response.data;
  },

  getMessages: async (conversationId: number): Promise<Message[]> => {
    const response = await api.get(
      `/api/chat/conversations/${conversationId}/messages`,
    );
    return response.data;
  },

  sendMessage: async (request: SendMessageRequest): Promise<Message> => {
    const response = await api.post("/api/chat/messages", request);
    return response.data;
  },

  getOrCreateDirectConversation: async (
    targetUserId: number,
  ): Promise<Conversation> => {
    const response = await api.post(
      `/api/chat/conversations/direct/${targetUserId}`,
    );
    return response.data;
  },
};

export default chatService;
