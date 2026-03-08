import React, { useState } from "react";
import "./chat.css";
import ChatSidebar from "./ChatSidebar";
import ChatMain from "./ChatMain";
import ChatInfo from "./ChatInfo";
import { useChat } from "../../hooks/useChat";

const ChatInterface: React.FC = () => {
  const [isInfoCollapsed, setIsInfoCollapsed] = useState(false);
  const {
    conversations,
    activeConversation,
    messages,
    loading,
    globalUsers,
    searchingGlobal,
    selectConversation,
    sendMessage,
    searchGlobalUsers,
    startDirectConversation,
  } = useChat();

  const toggleInfo = () => {
    setIsInfoCollapsed(!isInfoCollapsed);
  };

  return (
    <div className="chat-interface p-0 h-full bg-slate-50/50">
      <div className="chat-container h-full max-w-[1400px] mx-auto">
        <ChatSidebar
          conversations={conversations}
          activeConversation={activeConversation}
          onSelectConversation={selectConversation}
          globalUsers={globalUsers}
          onSearchGlobal={searchGlobalUsers}
          searchingGlobal={searchingGlobal}
          onStartConversation={startDirectConversation}
        />

        <ChatMain
          activeConversation={activeConversation}
          messages={messages}
          onSendMessage={sendMessage}
          onToggleInfo={toggleInfo}
          loading={loading}
        />

        <ChatInfo
          isCollapsed={isInfoCollapsed}
          onClose={() => setIsInfoCollapsed(true)}
          activeConversation={activeConversation}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
