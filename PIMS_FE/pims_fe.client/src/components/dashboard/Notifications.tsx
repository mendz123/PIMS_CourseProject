import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Check, Bell, BellOff } from "lucide-react";
import { notificationService } from "../../services/notificationService";
import type { NotificationDto } from "../../types/notification.types";

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [onlyUnread, setOnlyUnread] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getMyNotifications(onlyUnread);
      if (response.success) {
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
    fetchNotifications();
  }, [onlyUnread]);

  const handleMarkAll = async () => {
    await notificationService.markAllAsRead();
    fetchNotifications();
  };

  const handleMarkRead = async (id: number) => {
    await notificationService.markAsRead(id);
    fetchNotifications();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Bell size={18} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#0f172a]">Notifications</h2>
            <p className="text-xs text-gray-500">Your latest updates</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOnlyUnread((prev) => !prev)}
            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
              onlyUnread
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {onlyUnread ? "Showing Unread" : "Show Unread"}
          </button>
          <button
            onClick={handleMarkAll}
            className="px-3 py-2 rounded-lg text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
          >
            Mark All Read
          </button>
        </div>
      </header>

      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="divide-y divide-gray-100">
          {loading && (
            <div className="p-8 text-center text-gray-400 text-sm">
              Loading...
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="p-12 text-center text-gray-400">
              <div className="mx-auto mb-3 size-12 rounded-full bg-gray-50 text-gray-300 flex items-center justify-center">
                <BellOff size={20} />
              </div>
              <p className="text-sm">No notifications found.</p>
            </div>
          )}

          {!loading &&
            notifications.map((notif) => (
              <div
                key={notif.notificationId}
                className={`flex items-start gap-4 p-5 transition-colors ${
                  notif.isRead ? "bg-white" : "bg-blue-50/40"
                }`}
              >
                <div
                  className={`size-10 rounded-xl flex items-center justify-center ${
                    notif.isRead
                      ? "bg-gray-100 text-gray-400"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <Bell size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {notif.title || "Notification"}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {notif.content || "No details provided."}
                      </p>
                    </div>
                    <div className="text-[10px] text-gray-400 text-right">
                      {notif.createdAt
                        ? formatDistanceToNow(new Date(notif.createdAt), {
                            locale: vi,
                            addSuffix: true,
                          })
                        : "Just now"}
                    </div>
                  </div>
                </div>
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkRead(notif.notificationId)}
                    className="px-3 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Check size={14} />
                    Mark Read
                  </button>
                )}
              </div>
            ))}
        </div>
      </section>
    </div>
  );
};

export default Notifications;
