import React, { useState } from "react";
import { Search, MessageSquare } from "lucide-react";

interface Conversation {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar?: string;
  online: boolean;
}

const mockConversations: Conversation[] = [
  {
    id: 1,
    name: "Group Project Team",
    lastMessage: "Alice: Let's meet at 2 PM",
    time: "10:30 AM",
    unread: 3,
    online: true,
  },
  {
    id: 2,
    name: "Instructor Smith",
    lastMessage: "The assignment is due tomorrow.",
    time: "Yesterday",
    unread: 0,
    avatar: "https://i.pravatar.cc/150?u=smith",
    online: false,
  },
  {
    id: 3,
    name: "John Doe",
    lastMessage: "Thanks for the help!",
    time: "Monday",
    unread: 0,
    avatar: "https://i.pravatar.cc/150?u=john",
    online: true,
  },
];

const ChatSidebar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="chat-sidebar h-full flex flex-col">
      {/* Search Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Messages</h2>
          <button className="p-2 hover:bg-white/40 rounded-full transition">
            <MessageSquare size={20} className="text-gray-600" />
          </button>
        </div>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 glass-input text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto chat-custom-scrollbar">
        {mockConversations.map((conv) => (
          <div
            key={conv.id}
            className="p-4 flex items-center gap-3 cursor-pointer hover:bg-white/40 transition-colors border-b border-white/10"
          >
            <div className="relative">
              {conv.avatar ? (
                <img
                  src={conv.avatar}
                  alt={conv.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold">
                  {conv.name.charAt(0)}
                </div>
              )}
              {conv.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-0.5">
                <h4 className="font-semibold text-sm text-gray-900 truncate">
                  {conv.name}
                </h4>
                <span className="text-[10px] text-gray-500">{conv.time}</span>
              </div>
              <p className="text-xs text-gray-500 truncate">
                {conv.lastMessage}
              </p>
            </div>
            {conv.unread > 0 && (
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                {conv.unread}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;
