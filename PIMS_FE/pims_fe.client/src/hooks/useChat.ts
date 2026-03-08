import { useState, useEffect, useCallback, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import chatService from "../services/chatService";
import userService from "../services/userService";
import type {
  Conversation,
  Message,
  SendMessageRequest,
} from "../types/chat.types";
import type { UserInfo } from "../types";
import { useAuth } from "../context/AuthContext";

export const useChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalUsers, setGlobalUsers] = useState<UserInfo[]>([]);
  const [searchingGlobal, setSearchingGlobal] = useState(false);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null,
  );

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const activeConversationRef = useRef<Conversation | null>(null);

  // Sync ref with state for use inside SignalR callbacks
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const data = await chatService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  }, [user]);

  // Load messages for active conversation
  const loadMessages = useCallback(async (conversationId: number) => {
    setLoading(true);
    try {
      const data = await chatService.getMessages(conversationId);
      setMessages(data);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search users globally
  const searchGlobalUsers = useCallback(
    async (query: string) => {
      if (!query.trim() || query.length < 2) {
        setGlobalUsers([]);
        return;
      }
      setSearchingGlobal(true);
      try {
        const response = await userService.getUsers(1, 10, query); // Fixed pageIndex to 1
        if (response.success && response.data) {
          // Filter out current user from results
          setGlobalUsers(
            response.data.items.filter((u) => u.userId !== user?.userId),
          );
        }
      } catch (error) {
        console.error("Failed to search global users:", error);
      } finally {
        setSearchingGlobal(false);
      }
    },
    [user],
  );

  // Start or get direct conversation
  const startDirectConversation = async (targetUserId: number) => {
    setLoading(true);
    try {
      const conversation =
        await chatService.getOrCreateDirectConversation(targetUserId);

      // Update conversations list if it's new
      setConversations((prev) => {
        if (prev.some((c) => c.id === conversation.id)) return prev;
        return [conversation, ...prev];
      });

      selectConversation(conversation);
      setGlobalUsers([]); // Clear search results after selection
    } catch (error) {
      console.error("Failed to start conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize SignalR connection
  useEffect(() => {
    if (!user) return;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(
        `${import.meta.env.VITE_API_URL || "http://localhost:5172"}/chathub`,
        {
          accessTokenFactory: () => {
            return "";
          },
        },
      )
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
    connectionRef.current = newConnection;

    return () => {
      newConnection.stop();
    };
  }, [user]);

  // Handle SignalR events
  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log("SignalR Connected");

          connection.on("ReceiveMessage", (message: Message) => {
            // Update messages if it belongs to current active conversation
            if (activeConversationRef.current?.id === message.conversationId) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === message.id)) return prev;
                return [...prev, message];
              });
            }

            // Update last message in the conversation list regardless of active state
            setConversations((prev) =>
              prev.map((c) =>
                c.id === message.conversationId
                  ? {
                      ...c,
                      lastMessage: {
                        id: message.id,
                        content: message.content || "",
                        createdAt: message.createdAt,
                        senderId: message.senderId,
                      },
                    }
                  : c,
              ),
            );
          });
        })
        .catch((e) => console.log("Connection failed: ", e));
    }
  }, [connection]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const selectConversation = async (conversation: Conversation) => {
    // Leave old group if exists
    if (connectionRef.current && activeConversation) {
      await connectionRef.current.invoke(
        "LeaveConversation",
        activeConversation.id.toString(),
      );
    }

    setActiveConversation(conversation);
    loadMessages(conversation.id);

    // Join new group
    if (connectionRef.current) {
      await connectionRef.current.invoke(
        "JoinConversation",
        conversation.id.toString(),
      );
    }
  };

  const sendMessage = async (content: string) => {
    if (!activeConversation || !user) return;

    const request: SendMessageRequest = {
      conversationId: activeConversation.id,
      content,
      messageType: 0, // Text
    };

    try {
      // Sent message will be received back via SignalR to maintain single source of truth
      // But we can optimistically update or just wait for the hub broadcast
      await chatService.sendMessage(request);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return {
    conversations,
    activeConversation,
    messages,
    loading,
    globalUsers,
    searchingGlobal,
    selectConversation,
    sendMessage,
    loadConversations,
    searchGlobalUsers,
    startDirectConversation,
  };
};
