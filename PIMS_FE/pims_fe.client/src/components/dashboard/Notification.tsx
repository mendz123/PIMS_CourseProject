import React, { useState, useRef, useEffect } from "react";
import "./Notification.css";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "info" | "success" | "warning";
  read: boolean;
  icon: string;
}

const mockNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "New Registration",
    message: "A new student, Nguyễn Văn A, has joined the platform.",
    time: "5 mins ago",
    type: "info",
    read: false,
    icon: "person_add",
  },
  {
    id: "2",
    title: "Course Updated",
    message: "The 'React Advanced' course content has been updated.",
    time: "2 hours ago",
    type: "success",
    read: false,
    icon: "update",
  },
  {
    id: "3",
    title: "System Alert",
    message: "Scheduled maintenance will occur tonight at 00:00 AM.",
    time: "4 hours ago",
    type: "warning",
    read: true,
    icon: "warning",
  },
  {
    id: "4",
    title: "New Report",
    message: "Monthly revenue report is ready for viewing.",
    time: "1 day ago",
    type: "info",
    read: true,
    icon: "analytics",
  },
];

const Notification: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <button
        className={`notification-trigger p-2 rounded-lg transition-all relative ${isOpen ? "bg-primary/10 text-primary" : "bg-[#f6f6f8] text-[#616f89] hover:bg-primary/10 hover:text-primary"}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 border-2 border-white rounded-full text-[10px] text-white font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-read-btn">
                Mark all as read
              </button>
            )}
          </div>
          <div className="notification-list">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${!notif.read ? "unread" : ""}`}
                >
                  <div className={`notification-icon ${notif.type}`}>
                    <span className="material-symbols-outlined text-[20px]">
                      {notif.icon}
                    </span>
                  </div>
                  <div className="notification-content">
                    <p className="notification-title">{notif.title}</p>
                    <p className="notification-message">{notif.message}</p>
                    <p className="notification-time">{notif.time}</p>
                  </div>
                  {!notif.read && <div className="unread-dot"></div>}
                </div>
              ))
            ) : (
              <div className="no-notifications">
                <span className="material-symbols-outlined text-4xl mb-2">
                  notifications_off
                </span>
                <p>No new notifications</p>
              </div>
            )}
          </div>
          <div className="notification-footer">
            <button className="view-all-btn">View All Notifications</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
