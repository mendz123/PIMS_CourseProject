import React, { useEffect, useState, useCallback } from "react";
import { groupService } from "../../services/groupService";
import type { GroupDto, PaginatedResponse } from "../../types/group.types";
import GroupDetailModal from "./GroupDetailModal";

interface GroupListContentProps {
    showMentorInfo?: boolean;
}

const statusColor: Record<string, string> = {
    CREATED: "bg-blue-100 text-blue-700",
    ACTIVE: "bg-green-100 text-green-700",
    INACTIVE: "bg-slate-100 text-slate-600",
    COMPLETED: "bg-purple-100 text-purple-700",
};

const PAGE_SIZE = 10;

const GroupListContent: React.FC<GroupListContentProps> = ({ showMentorInfo = false }) => {
    const [data, setData] = useState<PaginatedResponse<GroupDto> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [page, setPage] = useState(1);
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

    const fetchGroups = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const res = await groupService.getGroups({ search: search || undefined, pageNumber: page, pageSize: PAGE_SIZE });
            if (res.success) setData(res.data);
            else setError(res.message);
        } catch {
            setError("Failed to load groups.");
        } finally {
            setLoading(false);
        }
    }, [search, page]);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput);
    };

    const handleClearSearch = () => {
        setSearchInput("");
        setSearch("");
        setPage(1);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Toolbar */}
            <div className="bg-white rounded-xl border border-[#dbdfe6] p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-base font-bold text-[#111318]">Group Management</h2>
                    <p className="text-sm text-[#616f89] mt-0.5">
                        {data ? `${data.totalCount} groups in the current semester` : "Loading..."}
                    </p>
                </div>
                <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#616f89] text-[18px]">search</span>
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search group name..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-[#dbdfe6] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                        {searchInput && (
                            <button type="button" onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#616f89] hover:text-[#111318]">
                                <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                        )}
                    </div>
                    <button type="submit" className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                        Search
                    </button>
                </form>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-[#dbdfe6] shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center h-56">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-56 gap-3 text-red-500">
                        <span className="material-symbols-outlined text-4xl">error</span>
                        <p className="text-sm">{error}</p>
                        <button onClick={fetchGroups} className="text-sm text-primary underline">Retry</button>
                    </div>
                ) : !data || data.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-56 gap-3 text-[#616f89]">
                        <span className="material-symbols-outlined text-5xl">group_off</span>
                        <p className="text-sm font-medium">No groups found.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-[#dbdfe6]">
                                <th className="text-left px-5 py-3 text-xs font-bold text-[#616f89] uppercase tracking-wide">Group</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-[#616f89] uppercase tracking-wide">Leader</th>
                                {showMentorInfo && (
                                    <th className="text-left px-5 py-3 text-xs font-bold text-[#616f89] uppercase tracking-wide">Mentor</th>
                                )}
                                <th className="text-left px-5 py-3 text-xs font-bold text-[#616f89] uppercase tracking-wide">Members</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-[#616f89] uppercase tracking-wide">Status</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-[#616f89] uppercase tracking-wide">Semester</th>
                                <th className="px-5 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.map((g) => (
                                <tr key={g.groupId} className="border-b border-[#dbdfe6] last:border-0 hover:bg-[#f6f6f8] transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <span className="material-symbols-outlined text-primary text-[16px]">groups</span>
                                            </div>
                                            <span className="font-semibold text-[#111318]">{g.groupName}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-[#616f89]">{g.leaderName}</td>
                                    {showMentorInfo && (
                                        <td className="px-5 py-3.5">
                                            {g.mentorId ? (
                                                <div>
                                                    <p className="text-[#111318] font-medium">{g.mentorName}</p>
                                                    <p className="text-[#616f89] text-xs">ID: {g.mentorId}</p>
                                                </div>
                                            ) : (
                                                <span className="text-[#616f89] italic text-xs">Not assigned</span>
                                            )}
                                        </td>
                                    )}
                                    <td className="px-5 py-3.5 text-[#111318] font-medium">{g.memberCount}</td>
                                    <td className="px-5 py-3.5">
                                        <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[g.statusName] ?? "bg-slate-100 text-slate-600"}`}>
                                            {g.statusName}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-[#616f89] text-xs">{g.semesterName}</td>
                                    <td className="px-5 py-3.5">
                                        <button
                                            onClick={() => setSelectedGroupId(g.groupId)}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                                        >
                                            <span className="material-symbols-outlined text-[15px]">visibility</span>
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between px-1">
                    <p className="text-sm text-[#616f89]">
                        Page <span className="font-semibold text-[#111318]">{data.pageNumber}</span> of{" "}
                        <span className="font-semibold text-[#111318]">{data.totalPages}</span>
                        {" "}· {data.totalCount} groups
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={!data.hasPrevious}
                            onClick={() => setPage((p) => p - 1)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#dbdfe6] text-sm font-medium text-[#616f89] disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-[#f6f6f8] transition-colors"
                        >
                            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                            Prev
                        </button>
                        <button
                            disabled={!data.hasNext}
                            onClick={() => setPage((p) => p + 1)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#dbdfe6] text-sm font-medium text-[#616f89] disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-[#f6f6f8] transition-colors"
                        >
                            Next
                            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedGroupId !== null && (
                <GroupDetailModal
                    groupId={selectedGroupId}
                    showMentorInfo={showMentorInfo}
                    onClose={() => setSelectedGroupId(null)}
                />
            )}
        </div>
    );
};

export default GroupListContent;
