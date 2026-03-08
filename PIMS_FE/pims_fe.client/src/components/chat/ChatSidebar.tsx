import React, { useState, useEffect } from "react";
import { Search, MessageSquare, UserPlus, Loader2 } from "lucide-react";
import type { Conversation } from "../../types/chat.types";
import type { User } from "../../types/user.types";
import { format } from "date-fns";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  globalUsers: User[];
  onSearchGlobal: (query: string) => void;
  searchingGlobal: false | boolean;
  onStartConversation: (userId: number) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeConversation,
  onSelectConversation,
  globalUsers,
  onSearchGlobal,
  searchingGlobal,
  onStartConversation,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConversations = conversations.filter((c) =>
    (c.name || "Chat").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length >= 2) {
        onSearchGlobal(searchTerm);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, onSearchGlobal]);

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
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 glass-input text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchingGlobal && (
            <Loader2
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin"
              size={14}
            />
          )}
        </div>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto chat-custom-scrollbar">
        {/* Existing Conversations */}
        {filteredConversations.length > 0 && (
          <div className="py-2">
            <h5 className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Recent Chats
            </h5>
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-white/10 ${
                  activeConversation?.id === conv.id
                    ? "bg-blue-600/10 border-l-2 border-l-blue-600 shadow-sm"
                    : "hover:bg-white/40"
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold">
                    {conv.name ? conv.name.charAt(0) : "C"}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h4 className="font-semibold text-sm text-gray-900 truncate">
                      {conv.participants.length > 2
                        ? conv.name
                        : conv.participants[1].fullName}
                    </h4>
                    <span className="text-[10px] text-gray-500">
                      {conv.lastMessage
                        ? format(new Date(conv.lastMessage.createdAt), "HH:mm")
                        : ""}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {conv.lastMessage?.content || "No messages yet"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Global User Search Results */}
        {searchTerm.length >= 2 && globalUsers.length > 0 && (
          <div className="py-2 border-t border-white/10">
            <h5 className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Global Users ({globalUsers.length})
            </h5>
            {globalUsers.map((user) => {
              // Check if user already has a conversation
              const hasConv = conversations.some((c) =>
                c.participants.some((p) => p.userId === user.userId),
              );

              if (
                hasConv &&
                filteredConversations.some((c) =>
                  c.participants.some((p) => p.userId === user.userId),
                )
              ) {
                return null; // Don't show if already in filtered recent chats
              }

              return (
                <div
                  key={user.userId}
                  onClick={() => onStartConversation(user.userId)}
                  className="p-4 flex items-center gap-3 cursor-pointer hover:bg-white/40 transition-colors border-b border-white/10 group"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                    {user.fullName
                      ? user.fullName.charAt(0)
                      : user.email.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 truncate">
                      {user.fullName || "User"}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  <UserPlus
                    className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    size={18}
                  />
                </div>
              );
            })}
          </div>
        )}

        {searchTerm.length >= 2 &&
          filteredConversations.length === 0 &&
          globalUsers.length === 0 &&
          !searchingGlobal && (
            <div className="p-8 text-center text-gray-400 text-sm">
              No users or conversations found for "{searchTerm}"
            </div>
          )}
      </div>
    </div>
  );
};

export default ChatSidebar;
