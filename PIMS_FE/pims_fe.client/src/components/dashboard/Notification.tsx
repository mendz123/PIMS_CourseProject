import React, { useState, useRef, useEffect } from "react";
import "./Notification.css";
import { notificationService } from "../../services/notificationService";
import type { NotificationDto } from "../../types/notification.types";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

const Notification: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getMyNotifications();
      if (response && response.success) {
        setNotifications(response.data || []);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    // Fetch when component mounts
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAll = async () => {
    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      // ignore
    }
    fetchNotifications();
  };

  const handleMarkRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
    } catch (error) {
      // ignore
    }
    fetchNotifications();
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
              <button onClick={handleMarkAll} className="mark-read-btn">
                Mark all as read
              </button>
            )}
          </div>
          <div className="notification-list">
            {loading && (
              <div className="p-4 text-center text-gray-400 text-sm">
                Loading...
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="no-notifications">
                <span className="material-symbols-outlined text-4xl mb-2">
                  notifications_off
                </span>
                <p>No new notifications</p>
              </div>
            )}

            {!loading &&
              notifications.map((notif) => (
                <div
                  key={notif.notificationId}
                  className={`notification-item ${!notif.isRead ? "unread" : ""}`}
                >
                  {/* <div className={`notification-icon`}>
                    <span className="material-symbols-outlined text-[20px]">
                      notifications
                    </span>
                  </div> */}
                  <div className="notification-content">
                    <p className="notification-title">
                      {notif.title || "Notification"}
                    </p>
                    <p className="notification-message">
                      {notif.content || "No details provided."}
                    </p>
                    <p className="notification-time">
                      {notif.createdAt
                        ? formatDistanceToNow(new Date(notif.createdAt), {
                            locale: vi,
                            addSuffix: true,
                          })
                        : "Just now"}
                    </p>
                  </div>
                  {!notif.isRead ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(notif.notificationId);
                      }}
                      className="notification-action-btn"
                    >
                      Mark read
                    </button>
                  ) : null}
                </div>
              ))}
          </div>
          <div className="notification-footer">
            <button onClick={() => navigate("/")} className="view-all-btn">
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
