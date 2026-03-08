export type ConversationType = 1 | 2; // 1: Direct, 2: Group

export type MessageType = 0 | 1 | 2; // 0: Text, 1: File, 2: Image

export interface Participant {
  userId: number;
  fullName: string;
  avatarUrl?: string;
  role: number;
}

export interface LatestMessage {
  id: number;
  content: string;
  createdAt: string;
  senderId: number;
}

export interface Conversation {
  id: number;
  type: ConversationType;
  name?: string;
  createdAt: string;
  lastMessage?: LatestMessage;
  participants: Participant[];
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderName?: string;
  content?: string;
  messageType: MessageType;
  fileUrl?: string;
  createdAt: string;
}

export interface SendMessageRequest {
  conversationId: number;
  content?: string;
  messageType: MessageType;
  fileUrl?: string;
}
