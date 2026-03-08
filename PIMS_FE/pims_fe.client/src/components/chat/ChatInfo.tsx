import React from "react";
import {
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  ChevronRight,
  Bell,
  Trash2,
  X,
} from "lucide-react";
import type { Conversation } from "../../types/chat.types";
import { useAuth } from "../../context/AuthContext";

interface ChatInfoProps {
  isCollapsed: boolean;
  onClose: () => void;
  activeConversation: Conversation | null;
}

const ChatInfo: React.FC<ChatInfoProps> = ({
  isCollapsed,
  onClose,
  activeConversation,
}) => {
  const { user: currentUser } = useAuth();

  if (!activeConversation) return null;

  return (
    <div
      className={`chat-info ${isCollapsed ? "collapsed" : ""} h-full flex flex-col`}
    >
      <div className="p-4 border-b border-white/20 flex items-center justify-between sticky top-0 bg-white/30 backdrop-blur-md z-10">
        <h3 className="font-bold text-gray-800">Information</h3>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/40 rounded-full transition text-gray-500 lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-6 flex flex-col items-center">
        <div className="w-24 h-24 rounded-3xl bg-blue-600/10 flex items-center justify-center text-blue-600 text-3xl font-bold mb-4 shadow-sm">
          {activeConversation.name ? activeConversation.name.charAt(0) : "C"}
        </div>
        <h4 className="text-lg font-bold text-gray-900">
          {activeConversation.name || "Direct Message"}
        </h4>
        <p className="text-sm text-gray-500">
          {activeConversation.participants.length} Members • Active
        </p>
      </div>

      <div className="flex-1 overflow-y-auto chat-custom-scrollbar p-4 space-y-6">
        {/* Members Section */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Members
            </h5>
            <button className="text-[10px] text-blue-600 font-semibold hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {activeConversation.participants.map((participant) => (
              <div
                key={participant.userId}
                className="flex items-center gap-3 px-2 py-1.5 hover:bg-white/30 rounded-xl transition"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                  {participant.fullName.charAt(0)}
                </div>
                <span className="text-sm text-gray-700 font-medium truncate flex-1">
                  {participant.fullName}
                  {participant.userId === currentUser?.userId && " (You)"}
                </span>
                {participant.role === 1 && (
                  <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 rounded-md ml-auto">
                    Admin
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Shared Links/Files - Placeholder for now */}
        <div>
          <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
            Shared Files
          </h5>
          <div className="space-y-2">
            {[
              {
                icon: FileText,
                name: "Project_Requirements.pdf",
                size: "2.4 MB",
                color: "text-red-500",
              },
            ].map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-2 hover:bg-white/30 rounded-xl transition cursor-pointer group"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-white/50 border border-white flex items-center justify-center ${file.color}`}
                >
                  <file.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-gray-500">{file.size}</p>
                </div>
                <ChevronRight
                  size={14}
                  className="text-gray-300 group-hover:text-gray-500 transition"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="pt-4 border-t border-white/20 space-y-2">
          <button className="w-full flex items-center gap-3 p-3 hover:bg-white/30 rounded-xl transition text-gray-600">
            <Bell size={18} />
            <span className="text-sm font-medium">Mute Notifications</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 hover:bg-red-50/50 rounded-xl transition text-red-600">
            <Trash2 size={18} />
            <span className="text-sm font-medium">Clear Chat History</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInfo;
