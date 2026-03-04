import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Smile,
  Plus,
  Phone,
  Video,
  Info,
  MoreVertical,
} from "lucide-react";

interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
  avatar?: string;
}

interface ChatMainProps {
  onToggleInfo: () => void;
}

const ChatMain: React.FC<ChatMainProps> = ({ onToggleInfo }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "Alice",
      text: "Hey team, how is the middleware coming along?",
      time: "10:30 AM",
      isMe: false,
      avatar: "https://i.pravatar.cc/150?u=alice",
    },
    {
      id: 2,
      sender: "Bob",
      text: "Almost done with the auth flow. Just need to test the JWT validation.",
      time: "10:32 AM",
      isMe: false,
      avatar: "https://i.pravatar.cc/150?u=bob",
    },
    {
      id: 3,
      sender: "You",
      text: "Great! I've started on the frontend integration.",
      time: "10:35 AM",
      isMe: true,
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const newMessage: Message = {
      id: Date.now(),
      sender: "You",
      text: inputValue,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isMe: true,
    };
    setMessages([...messages, newMessage]);
    setInputValue("");
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-main h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/20 flex items-center justify-between bg-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 font-bold">
              GP
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">
              Group Project Team
            </h4>
            <p className="text-[11px] text-green-600 font-medium">
              4 members active
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
        <div className="mt-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isMe ? "justify-end" : "justify-start"} items-end gap-2`}
            >
              {!msg.isMe && (
                <img
                  src={msg.avatar}
                  alt={msg.sender}
                  className="w-8 h-8 rounded-full mb-1 shadow-sm"
                />
              )}
              <div
                className={`max-w-[75%] flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}
              >
                {!msg.isMe && (
                  <span className="text-[10px] text-gray-500 ml-1 mb-1 font-medium">
                    {msg.sender}
                  </span>
                )}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm transition-all hover:shadow-md ${
                    msg.isMe
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white/70 backdrop-blur-md text-gray-800 rounded-bl-none border border-white/50"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-gray-400 mt-1">
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
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
