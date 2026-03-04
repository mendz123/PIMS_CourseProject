import React, { useState } from "react";
import "./chat.css";
import ChatSidebar from "./ChatSidebar";
import ChatMain from "./ChatMain";
import ChatInfo from "./ChatInfo";

const ChatInterface: React.FC = () => {
  const [isInfoCollapsed, setIsInfoCollapsed] = useState(false);

  const toggleInfo = () => {
    setIsInfoCollapsed(!isInfoCollapsed);
  };

  return (
    <div className="chat-interface p-0 h-full bg-slate-50/50">
      <div className="chat-container h-full max-w-[1400px] mx-auto">
        <ChatSidebar />

        <ChatMain onToggleInfo={toggleInfo} />

        <ChatInfo
          isCollapsed={isInfoCollapsed}
          onClose={() => setIsInfoCollapsed(true)}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
