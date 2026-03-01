import React, { useEffect, useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Check, Bell, BellOff, Users, Eye } from "lucide-react";
import { toast } from "react-hot-toast";
import { notificationService } from "../../services/notificationService";
import { groupService } from "../../services/groupService";
import type { NotificationDto } from "../../types/notification.types";
import InvitationDetailModal from "../student/InvitationDetailModal";
import { useGroup } from "../../hooks/useGroup";

const INVITATION_TITLE = "L?i m?i tham gia nhóm";

function parseInvitationId(content: string | null): number | null {
    if (!content) return null;
    const match = content.match(/#(\d+)/);
    return match ? parseInt(match[1], 10) : null;
}

const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [onlyUnread, setOnlyUnread] = useState(false);
    const [pendingInvitationIds, setPendingInvitationIds] = useState<Set<number>>(new Set());
    const [selectedInvitationId, setSelectedInvitationId] = useState<number | null>(null);
    const { refetchGroup } = useGroup();

    const fetchPendingInvitations = useCallback(async () => {
        try {
            const res = await groupService.getPendingInvitations();
            if (res.success && res.data) {
                setPendingInvitationIds(new Set(res.data.map((i) => i.invitationId)));
            }
        } catch {
            // not a student or no invitations – ignore silently
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

    const handleMarkRead = async (id: number) => {
        await notificationService.markAsRead(id);
        fetchNotifications();
    };

    const handleInvitationAccepted = async () => {
        setSelectedInvitationId(null);
        toast.success("B?n ?ã tham gia nhóm thành công!");
        await refetchGroup();
        await fetchNotifications();
        await fetchPendingInvitations();
    };

    const handleInvitationRejected = () => {
        setSelectedInvitationId(null);
        toast.success("?ã t? ch?i l?i m?i.");
        fetchPendingInvitations();
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
                        <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
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
                            const isInvite = notif.title === INVITATION_TITLE;
                            const invitationId = isInvite ? parseInvitationId(notif.content) : null;
                            const isPending = invitationId !== null && pendingInvitationIds.has(invitationId);

                            if (isInvite && invitationId !== null) {
                                return (
                                    <InvitationNotificationCard
                                        key={notif.notificationId}
                                        notif={notif}
                                        invitationId={invitationId}
                                        isPending={isPending}
                                        onViewDetail={() => setSelectedInvitationId(invitationId)}
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
                                            notif.isRead ? "bg-gray-100 text-gray-400" : "bg-primary/10 text-primary"
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
                                                    ? formatDistanceToNow(new Date(notif.createdAt), { locale: vi, addSuffix: true })
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
    isPending: boolean;
    onViewDetail: () => void;
    onMarkRead: () => void;
}

const InvitationNotificationCard: React.FC<InvitationCardProps> = ({
    notif,
    isPending,
    onViewDetail,
    onMarkRead,
}) => (
    <div className={`p-5 transition-colors ${notif.isRead ? "bg-white" : "bg-blue-50/40"}`}>
        <div className="flex items-start gap-4">
            <div className="size-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <Users size={18} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-gray-900">{notif.title}</p>
                            {isPending ? (
                                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                    Ch? ph?n h?i
                                </span>
                            ) : (
                                <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                    ?ã x? lý
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                            {notif.content}
                        </p>
                    </div>
                    <span className="text-[10px] text-gray-400 text-right shrink-0">
                        {notif.createdAt
                            ? formatDistanceToNow(new Date(notif.createdAt), { locale: vi, addSuffix: true })
                            : "Just now"}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onViewDetail}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-primary/30 text-primary hover:bg-primary/5 transition-colors"
                    >
                        <Eye size={13} />
                        Xem chi ti?t nhóm
                    </button>
                    {!notif.isRead && (
                        <button
                            onClick={onMarkRead}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-blue-700 transition-colors"
                        >
                            <Check size={13} />
                            Mark Read
                        </button>
                    )}
                </div>
            </div>
        </div>
    </div>
);

export default Notifications;

