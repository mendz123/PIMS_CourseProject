import React, { useEffect, useState } from "react";
import { groupService } from "../../services/groupService";
import type { GroupDetailDto } from "../../types/group.types";

interface GroupDetailModalProps {
    groupId: number;
    onClose: () => void;
    showMentorInfo?: boolean;
}

const statusColor: Record<string, string> = {
    CREATED: "bg-blue-100 text-blue-700",
    ACTIVE: "bg-green-100 text-green-700",
    INACTIVE: "bg-slate-100 text-slate-600",
    COMPLETED: "bg-purple-100 text-purple-700",
};

const GroupDetailModal: React.FC<GroupDetailModalProps> = ({ groupId, onClose, showMentorInfo = false }) => {
    const [detail, setDetail] = useState<GroupDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const res = await groupService.getGroupDetail(groupId);
                if (res.success) setDetail(res.data);
                else setError(res.message);
            } catch {
                setError("Failed to load group detail.");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [groupId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#dbdfe6] bg-slate-50">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-2xl">groups</span>
                        <h2 className="text-lg font-bold text-[#111318]">
                            {loading ? "Loading..." : detail?.groupName ?? "Group Detail"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-[#616f89] hover:bg-[#f6f6f8] hover:text-[#111318] transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 py-10">{error}</div>
                    ) : detail ? (
                        <div className="flex flex-col gap-6">
                            {/* Group Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#f6f6f8] rounded-xl p-4">
                                    <p className="text-xs text-[#616f89] font-medium mb-1">Semester</p>
                                    <p className="text-sm font-semibold text-[#111318]">{detail.semesterName}</p>
                                </div>
                                <div className="bg-[#f6f6f8] rounded-xl p-4">
                                    <p className="text-xs text-[#616f89] font-medium mb-1">Leader</p>
                                    <p className="text-sm font-semibold text-[#111318]">{detail.leaderName}</p>
                                </div>
                                {showMentorInfo && (
                                    <div className="bg-[#f6f6f8] rounded-xl p-4">
                                        <p className="text-xs text-[#616f89] font-medium mb-1">Mentor</p>
                                        <p className="text-sm font-semibold text-[#111318]">
                                            {detail.mentorName || <span className="text-[#616f89] italic">Not assigned</span>}
                                        </p>
                                    </div>
                                )}
                                <div className="bg-[#f6f6f8] rounded-xl p-4">
                                    <p className="text-xs text-[#616f89] font-medium mb-1">Status</p>
                                    <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[detail.statusName] ?? "bg-slate-100 text-slate-600"}`}>
                                        {detail.statusName}
                                    </span>
                                </div>
                                <div className="bg-[#f6f6f8] rounded-xl p-4">
                                    <p className="text-xs text-[#616f89] font-medium mb-1">Members</p>
                                    <p className="text-sm font-semibold text-[#111318]">{detail.memberCount} active</p>
                                </div>
                            </div>

                            {/* Members Table */}
                            <div>
                                <h3 className="text-sm font-bold text-[#111318] mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px] text-primary">person</span>
                                    Members
                                </h3>
                                <div className="border border-[#dbdfe6] rounded-xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-[#dbdfe6]">
                                                <th className="text-left px-4 py-3 text-xs font-bold text-[#616f89] uppercase tracking-wide">Name</th>
                                                <th className="text-left px-4 py-3 text-xs font-bold text-[#616f89] uppercase tracking-wide">Email</th>
                                                <th className="text-left px-4 py-3 text-xs font-bold text-[#616f89] uppercase tracking-wide">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detail.members.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="text-center py-8 text-[#616f89]">No members found.</td>
                                                </tr>
                                            ) : (
                                                detail.members.map((m) => (
                                                    <tr key={m.groupMemberId} className="border-b border-[#dbdfe6] last:border-0 hover:bg-[#f6f6f8] transition-colors">
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                {m.avatarUrl ? (
                                                                    <img src={m.avatarUrl} alt={m.fullName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                                        <span className="text-primary text-xs font-bold">
                                                                            {m.fullName.charAt(0).toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <span className="font-medium text-[#111318]">{m.fullName || "—"}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-[#616f89]">{m.email}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[m.statusName] ?? "bg-slate-100 text-slate-600"}`}>
                                                                {m.statusName}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default GroupDetailModal;
