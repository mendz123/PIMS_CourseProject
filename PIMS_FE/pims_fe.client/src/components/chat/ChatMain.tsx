import React, { useState, useRef, useEffect } from "react";
import { Send, Smile, Plus, Phone, Video, Info } from "lucide-react";
import type { Conversation, Message } from "../../types/chat.types";
import { format } from "date-fns";
import { useAuth } from "../../context/AuthContext";

interface ChatMainProps {
  activeConversation: Conversation | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onToggleInfo: () => void;
  loading: boolean;
}

const ChatMain: React.FC<ChatMainProps> = ({
  activeConversation,
  messages,
  onSendMessage,
  onToggleInfo,
  loading,
}) => {
  const { user: currentUser } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!activeConversation) {
    return (
      <div className="chat-main h-full flex flex-col items-center justify-center bg-gray-50/30">
        <div className="p-8 rounded-3xl bg-white/50 backdrop-blur-md border border-white/40 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-4">
            <Send size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Select a chat
          </h3>
          <p className="text-gray-500 max-w-xs">
            Choose a conversation from the sidebar to start messaging.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-main h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/20 flex items-center justify-between bg-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 font-bold">
              {activeConversation.name
                ? activeConversation.name.charAt(0)
                : "C"}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">
              {activeConversation.name || "Chat"}
            </h4>
            <p className="text-[11px] text-green-600 font-medium">
              {activeConversation.participants.length} participants
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-white/40 rounded-full transition text-gray-500">
            <Phone size={18} />
          </button>
          <button className="p-2 hover:bg-white/40 rounded-full transition text-gray-500">
            <Video size={18} />
          </button>
          <button
            onClick={onToggleInfo}
            className="p-2 hover:bg-white/40 rounded-full transition text-gray-500"
          >
            <Info size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 chat-custom-scrollbar flex flex-col"
      >
        {loading && (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}
        <div className="mt-auto space-y-4">
          {messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.userId;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}
              >
                {!isMe && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold mb-1 shadow-sm">
                    {msg.senderName?.charAt(0) || "U"}
                  </div>
                )}
                <div
                  className={`max-w-[75%] flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  {!isMe && (
                    <span className="text-[10px] text-gray-500 ml-1 mb-1 font-medium">
                      {msg.senderName}
                    </span>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm transition-all hover:shadow-md ${
                      isMe
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white/70 backdrop-blur-md text-gray-800 rounded-bl-none border border-white/50"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1">
                    {format(new Date(msg.createdAt), "HH:mm")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/20 bg-white/5">
        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-md p-2 rounded-2xl border border-white/40 shadow-inner focus-within:shadow-md transition-all">
          <button className="p-2 text-gray-400 hover:text-blue-600 transition">
            <Plus size={20} />
          </button>
          <input
            type="text"
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder:text-gray-400 py-2"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button className="p-2 text-gray-400 hover:text-yellow-500 transition">
            <Smile size={20} />
          </button>
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
              inputValue.trim()
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105"
                : "text-gray-400 bg-gray-100/50"
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatMain;
