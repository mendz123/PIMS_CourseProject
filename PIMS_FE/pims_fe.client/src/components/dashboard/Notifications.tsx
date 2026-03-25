import React, { useEffect, useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  Check,
  Bell,
  BellOff,
  Users,
  Eye,
  X,
  Crown,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { notificationService } from "../../services/notificationService";
import { groupService } from "../../services/groupService";
import type { NotificationDto } from "../../types/notification.types";
import type { InvitationDto } from "../../types/group.types";
import InvitationDetailModal from "../student/InvitationDetailModal";
import { useGroup } from "../../hooks/useGroup";

function parseInvitationId(content: string | null): number | null {
  if (!content) return null;
  const match = content.match(/Invitation ID: #(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<
    Map<number, InvitationDto>
  >(new Map());
  const [selectedInvitationId, setSelectedInvitationId] = useState<
    number | null
  >(null);
  const { refetchGroup } = useGroup();

  const fetchPendingInvitations = useCallback(async () => {
    try {
      const res = await groupService.getPendingInvitations();
      if (res.success && res.data) {
        const map = new Map<number, InvitationDto>();
        res.data.forEach((i) => map.set(i.invitationId, i));
        setPendingInvitations(map);
      }
    } catch {
      // not a student or no invitations � ignore silently
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await notificationService.getMyNotifications(onlyUnread);
      if (response.success) {
        setNotifications(response.data || []);
      } else {
        setNotifications([]);
      }
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [onlyUnread]);

  useEffect(() => {
    fetchNotifications();
    fetchPendingInvitations();
  }, [fetchNotifications, fetchPendingInvitations]);

  const handleMarkAll = async () => {
    await notificationService.markAllAsRead();
    fetchNotifications();
  };

  const latestInvitationNotified = new Set<number>();

  const handleMarkRead = async (id: number) => {
    await notificationService.markAsRead(id);
    fetchNotifications();
  };

  const handleInvitationAccepted = async () => {
    setSelectedInvitationId(null);
    toast.success("You have successfully joined the group!");
    await refetchGroup();
    await fetchNotifications();
    await fetchPendingInvitations();
  };

  const handleInvitationRejected = () => {
    setSelectedInvitationId(null);
    toast.success("Invitation rejected.");
    fetchPendingInvitations();
    fetchNotifications();
  };

  return (
    <div className="max-w-5xl  space-y-6">
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
            notifications.map((notif) => {
              const invitationId = parseInvitationId(notif.content);
              const isInvite = invitationId !== null;
              const isLatestInviteNotification =
                invitationId !== null && !latestInvitationNotified.has(invitationId);
              if (invitationId !== null) {
                latestInvitationNotified.add(invitationId);
              }
              const invitationData =
                invitationId !== null
                  ? pendingInvitations.get(invitationId)
                  : undefined;
              const isPending =
                invitationId !== null &&
                pendingInvitations.has(invitationId) &&
                isLatestInviteNotification;

              if (isInvite) {
                return (
                  <InvitationNotificationCard
                    key={notif.notificationId}
                    notif={notif}
                    invitationId={invitationId!}
                    invitationData={invitationData}
                    isPending={isPending}
                    onAccepted={async () => {
                      await refetchGroup();
                      await fetchNotifications();
                      await fetchPendingInvitations();
                    }}
                    onRejected={() => {
                      fetchPendingInvitations();
                      fetchNotifications();
                    }}
                    onViewDetail={() => setSelectedInvitationId(invitationId!)}
                    onMarkRead={() => handleMarkRead(notif.notificationId)}
                  />
                );
              }

              return (
                <div
                  key={notif.notificationId}
                  className={`flex items-start gap-4 p-5 transition-colors ${
                    notif.isRead ? "bg-white" : "bg-blue-50/40"
                  }`}
                >
                  <div
                    className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                      notif.isRead
                        ? "bg-gray-100 text-gray-400"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Bell size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {notif.title || "Notification"}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {notif.content || "No details provided."}
                        </p>
                      </div>
                      <span className="text-[10px] text-gray-400 text-right shrink-0">
                        {notif.createdAt
                          ? formatDistanceToNow(new Date(notif.createdAt), {
                              locale: enUS,
                              addSuffix: true,
                            })
                          : "Just now"}
                      </span>
                    </div>
                  </div>
                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkRead(notif.notificationId)}
                      className="px-3 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-blue-700 transition-colors flex items-center gap-2 shrink-0"
                    >
                      <Check size={14} />
                      Mark Read
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      </section>

      {selectedInvitationId !== null && (
        <InvitationDetailModal
          invitationId={selectedInvitationId}
          onClose={() => setSelectedInvitationId(null)}
          onAccepted={handleInvitationAccepted}
          onRejected={handleInvitationRejected}
        />
      )}
    </div>
  );
};

/* ??? Invitation notification card ??? */
interface InvitationCardProps {
  notif: NotificationDto;
  invitationId: number;
  invitationData: InvitationDto | undefined;
  isPending: boolean;
  onAccepted: () => void;
  onRejected: () => void;
  onViewDetail: () => void;
  onMarkRead: () => void;
}

const InvitationNotificationCard: React.FC<InvitationCardProps> = ({
  notif,
  invitationId,
  invitationData,
  isPending,
  onAccepted,
  onRejected,
  onViewDetail,
  onMarkRead,
}) => {
  const [responding, setResponding] = useState<"accept" | "reject" | null>(
    null,
  );
  const { refetchGroup } = useGroup();

  const handleAccept = async () => {
    setResponding("accept");
    try {
      const res = await groupService.acceptInvitation(invitationId);
      if (res.success) {
        toast.success("You have successfully joined the group!");
        await refetchGroup();
        onAccepted();
      } else {
        toast.error(res.message || "Failed to accept invitation.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setResponding(null);
    }
  };

  const handleReject = async () => {
    setResponding("reject");
    try {
      const res = await groupService.rejectInvitation(invitationId);
      if (res.success) {
        toast.success("Invitation rejected.");
        onRejected();
      } else {
        toast.error(res.message || "Failed to reject invitation.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setResponding(null);
    }
  };

  return (
    <div
      className={`p-5 transition-colors ${notif.isRead ? "bg-white" : "bg-blue-50/40"}`}
    >
      <div className="flex items-start gap-4">
        <div className="size-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
          <Users size={18} />
        </div>
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-gray-900">
                Group Invitation
              </p>
              {isPending ? (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  Pending
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  Processed
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-400 text-right shrink-0">
              {notif.createdAt
                ? formatDistanceToNow(new Date(notif.createdAt), {
                    locale: enUS,
                    addSuffix: true,
                  })
                : "Just now"}
            </span>
          </div>

          {/* Group info */}
          {invitationData ? (
            <div className="bg-amber-50/60 rounded-xl p-3 mb-3 space-y-1">
              <div className="flex items-center gap-2">
                <Users size={13} className="text-amber-600 shrink-0" />
                <span className="text-xs font-bold text-gray-800">
                  {invitationData.groupName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Crown size={13} className="text-amber-500 shrink-0" />
                <span className="text-xs text-gray-600">
                  Leader:{" "}
                  <span className="font-semibold text-gray-800">
                    {invitationData.invitedByUserName}
                  </span>
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 mb-3">{notif.content}</p>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {isPending && (
              <>
                <button
                  onClick={handleReject}
                  disabled={!!responding}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {responding === "reject" ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <X size={12} />
                  )}
                  Reject
                </button>
                <button
                  onClick={handleAccept}
                  disabled={!!responding}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-70"
                >
                  {responding === "accept" ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Check size={12} />
                  )}
                  Accept
                </button>
              </>
            )}
            <button
              onClick={onViewDetail}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-primary/30 text-primary hover:bg-primary/5 transition-colors"
            >
              <Eye size={12} />
              View Members
            </button>
            {!notif.isRead && (
              <button
                onClick={onMarkRead}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-blue-700 transition-colors"
              >
                <Check size={12} />
                Mark Read
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
