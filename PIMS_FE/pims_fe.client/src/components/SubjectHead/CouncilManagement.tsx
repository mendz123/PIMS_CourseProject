import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
    councilService,
    type CouncilDto,
    type CreateCouncilDto,
    type TeacherInfo,
} from "../../services/councilService";
import { semesterService, type SemesterDto } from "../../services/semesterService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
    name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

const AVATAR_COLORS = [
    "bg-violet-500", "bg-blue-500", "bg-emerald-500",
    "bg-amber-500", "bg-rose-500", "bg-cyan-500",
];

const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

// ─── Create Modal ─────────────────────────────────────────────────────────────

interface CreateModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (dto: CreateCouncilDto) => Promise<void>;
    loading: boolean;
    semesters: SemesterDto[];
    teachers: TeacherInfo[];
}

const CreateCouncilModal: React.FC<CreateModalProps> = ({
    open, onClose, onSave, loading, semesters, teachers,
}) => {
    const [councilName, setCouncilName] = useState("");
    const [semesterId, setSemesterId] = useState("");
    const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
    const [teacherSearch, setTeacherSearch] = useState("");

    useEffect(() => {
        if (open) { setCouncilName(""); setSemesterId(""); setSelectedTeachers([]); setTeacherSearch(""); }
    }, [open]);

    if (!open) return null;

    const toggleTeacher = (id: number) => {
        setSelectedTeachers(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    const filteredTeachers = teachers.filter(t =>
        (t.fullName ?? t.email).toLowerCase().includes(teacherSearch.toLowerCase()) ||
        t.email.toLowerCase().includes(teacherSearch.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!councilName.trim()) { toast.error("Council name is required"); return; }
        if (!semesterId) { toast.error("Please select a semester"); return; }
        await onSave({
            councilName: councilName.trim(),
            semesterId: Number(semesterId),
            memberUserIds: selectedTeachers,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0f2f5]">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-md shadow-primary/25">
                            <span className="material-symbols-outlined text-white text-xl">gavel</span>
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-[#111318]">New Defense Council</h2>
                            <p className="text-xs text-[#616f89]">Assign members and semester</p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-xl text-[#616f89] hover:bg-[#f6f6f8] flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-[#616f89] uppercase tracking-wider mb-2">
                            Council Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text" value={councilName}
                            onChange={e => setCouncilName(e.target.value)}
                            placeholder="e.g. Committee A – Spring 2025"
                            className="w-full px-4 py-3 text-sm rounded-2xl border-2 border-[#f0f2f5] focus:border-primary outline-none transition-all bg-[#fafafa] focus:bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#616f89] uppercase tracking-wider mb-2">
                            Semester <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={semesterId} onChange={e => setSemesterId(e.target.value)}
                            className="w-full px-4 py-3 text-sm rounded-2xl border-2 border-[#f0f2f5] focus:border-primary outline-none transition-all bg-[#fafafa] focus:bg-white appearance-none"
                        >
                            <option value="">— Select semester —</option>
                            {semesters.map(s => (
                                <option key={s.semesterId} value={s.semesterId}>{s.semesterName}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#616f89] uppercase tracking-wider mb-2">
                            Members ({selectedTeachers.length} selected)
                        </label>
                        <div className="border-2 border-[#f0f2f5] rounded-2xl overflow-hidden">
                            <div className="px-3 py-2.5 border-b border-[#f0f2f5] bg-[#fafafa]">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#616f89] text-lg">search</span>
                                    <input
                                        type="text" value={teacherSearch}
                                        onChange={e => setTeacherSearch(e.target.value)}
                                        placeholder="Search teachers..."
                                        className="flex-1 text-sm outline-none bg-transparent"
                                    />
                                </div>
                            </div>
                            <div className="max-h-44 overflow-y-auto divide-y divide-[#f5f6f8]">
                                {filteredTeachers.map(t => {
                                    const isSelected = selectedTeachers.includes(t.userId);
                                    const displayName = t.fullName || t.email;
                                    return (
                                        <label key={t.userId}
                                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${isSelected ? "bg-primary/5" : "hover:bg-[#f8f9fb]"}`}>
                                            <div className={`w-8 h-8 rounded-xl ${avatarColor(t.userId)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                                                {getInitials(displayName)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-[#111318] truncate">{displayName}</p>
                                                <p className="text-xs text-[#616f89] truncate">{t.email}</p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? "bg-primary border-primary" : "border-[#dbdfe6]"}`}>
                                                {isSelected && <span className="material-symbols-outlined text-white text-sm" style={{ fontSize: 14 }}>check</span>}
                                            </div>
                                            <input type="checkbox" checked={isSelected}
                                                onChange={() => toggleTeacher(t.userId)} className="sr-only" />
                                        </label>
                                    );
                                })}
                                {filteredTeachers.length === 0 && (
                                    <div className="py-8 text-center text-sm text-[#616f89]">
                                        No teachers found
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[#f0f2f5] flex gap-3">
                    <button type="button" onClick={onClose}
                        className="flex-1 py-3 text-sm font-semibold rounded-2xl border-2 border-[#f0f2f5] text-[#616f89] hover:bg-[#f6f6f8] transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSubmit as any} disabled={loading}
                        className="flex-1 py-3 text-sm font-bold rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-white hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                        {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        Create Council
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Delete Modal ─────────────────────────────────────────────────────────────

const DeleteModal: React.FC<{
    council: CouncilDto | null;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    loading: boolean;
}> = ({ council, onClose, onConfirm, loading }) => {
    if (!council) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7 flex flex-col gap-5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-red-500 text-2xl">delete_forever</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-[#111318]">Delete Council?</h3>
                        <p className="text-xs text-[#616f89] mt-0.5">This cannot be undone</p>
                    </div>
                </div>
                <p className="text-sm text-[#616f89] bg-[#fafafa] rounded-xl p-3">
                    You are about to delete <span className="font-bold text-[#111318]">{council.councilName}</span>.
                    All associated data will be removed.
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 text-sm font-semibold rounded-2xl border-2 border-[#f0f2f5] text-[#616f89] hover:bg-[#f6f6f8]">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                        className="flex-1 py-2.5 text-sm font-bold rounded-2xl bg-red-500 text-white hover:bg-red-600 flex items-center justify-center gap-2 transition-colors">
                        {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────

interface EditModalProps {
    council: CouncilDto | null;
    onClose: () => void;
    onSave: (id: number, dto: { councilName?: string; memberUserIds?: number[] }) => Promise<void>;
    loading: boolean;
    semesters: SemesterDto[];
    teachers: TeacherInfo[];
}

const EditCouncilModal: React.FC<EditModalProps> = ({
    council, onClose, onSave, loading, semesters, teachers,
}) => {
    const [councilName, setCouncilName] = useState("");
    const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
    const [teacherSearch, setTeacherSearch] = useState("");

    useEffect(() => {
        if (council) {
            setCouncilName(council.councilName);
            setSelectedTeachers(council.members?.map(m => m.userId) ?? []);
            setTeacherSearch("");
        }
    }, [council]);

    if (!council) return null;

    const toggleTeacher = (id: number) => {
        setSelectedTeachers(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    const filteredTeachers = teachers.filter(t =>
        (t.fullName ?? t.email).toLowerCase().includes(teacherSearch.toLowerCase()) ||
        t.email.toLowerCase().includes(teacherSearch.toLowerCase())
    );

    const handleSubmit = async () => {
        if (!councilName.trim()) { toast.error("Council name is required"); return; }
        if (selectedTeachers.length === 0) { toast.error("Please select at least 1 member"); return; }
        await onSave(council.councilId, {
            councilName: councilName.trim(),
            memberUserIds: selectedTeachers,
        });
    };

    const semesterName = semesters.find(s => Number(s.semesterId) === Number(council.semesterId))?.semesterName ?? `Semester #${council.semesterId}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0f2f5]">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-md shadow-amber-500/25">
                            <span className="material-symbols-outlined text-white text-xl">edit</span>
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-[#111318]">Edit Council</h2>
                            <p className="text-xs text-[#616f89]">{semesterName}</p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-xl text-[#616f89] hover:bg-[#f6f6f8] flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-[#616f89] uppercase tracking-wider mb-2">
                            Council Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text" value={councilName}
                            onChange={e => setCouncilName(e.target.value)}
                            className="w-full px-4 py-3 text-sm rounded-2xl border-2 border-[#f0f2f5] focus:border-amber-400 outline-none transition-all bg-[#fafafa] focus:bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#616f89] uppercase tracking-wider mb-2">
                            Members ({selectedTeachers.length} selected)
                        </label>
                        <div className="border-2 border-[#f0f2f5] rounded-2xl overflow-hidden">
                            <div className="px-3 py-2.5 border-b border-[#f0f2f5] bg-[#fafafa]">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#616f89] text-lg">search</span>
                                    <input
                                        type="text" value={teacherSearch}
                                        onChange={e => setTeacherSearch(e.target.value)}
                                        placeholder="Search teachers..."
                                        className="flex-1 text-sm outline-none bg-transparent"
                                    />
                                </div>
                            </div>
                            <div className="max-h-44 overflow-y-auto divide-y divide-[#f5f6f8]">
                                {filteredTeachers.map(t => {
                                    const isSelected = selectedTeachers.includes(t.userId);
                                    const displayName = t.fullName || t.email;
                                    return (
                                        <label key={t.userId}
                                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${isSelected ? "bg-amber-50" : "hover:bg-[#f8f9fb]"}`}>
                                            <div className={`w-8 h-8 rounded-xl ${avatarColor(t.userId)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                                                {getInitials(displayName)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-[#111318] truncate">{displayName}</p>
                                                <p className="text-xs text-[#616f89] truncate">{t.email}</p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? "bg-amber-500 border-amber-500" : "border-[#dbdfe6]"}`}>
                                                {isSelected && <span className="material-symbols-outlined text-white" style={{ fontSize: 14 }}>check</span>}
                                            </div>
                                            <input type="checkbox" checked={isSelected}
                                                onChange={() => toggleTeacher(t.userId)} className="sr-only" />
                                        </label>
                                    );
                                })}
                                {filteredTeachers.length === 0 && (
                                    <div className="py-8 text-center text-sm text-[#616f89]">No teachers found</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[#f0f2f5] flex gap-3">
                    <button type="button" onClick={onClose}
                        className="flex-1 py-3 text-sm font-semibold rounded-2xl border-2 border-[#f0f2f5] text-[#616f89] hover:bg-[#f6f6f8] transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={loading}
                        className="flex-1 py-3 text-sm font-bold rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-white hover:shadow-lg hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                        {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Council Card ─────────────────────────────────────────────────────────────

const CouncilCard: React.FC<{
    council: CouncilDto;
    semesterName: string;
    onDelete: (c: CouncilDto) => void;
    onEdit: (c: CouncilDto) => void;
}> = ({ council, semesterName, onDelete, onEdit }) => {
    const memberCount = council.members?.length ?? 0;

    return (
        <div className="group bg-white border border-[#f0f2f5] rounded-3xl p-6 flex flex-col gap-4 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5 transition-all relative overflow-hidden">
            {/* Decorative accent */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary via-primary/50 to-transparent rounded-l-3xl" />

            <div className="flex items-start justify-between gap-3 pl-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl flex items-center justify-center shrink-0 border border-primary/10">
                        <span className="material-symbols-outlined text-primary text-xl">gavel</span>
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-[#111318] text-base leading-snug truncate">{council.councilName}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="material-symbols-outlined text-[#616f89] text-sm">calendar_month</span>
                            <span className="text-xs text-[#616f89] font-medium">{semesterName}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={() => onEdit(council)}
                        className="p-1.5 rounded-xl text-[#b0b8c9] hover:bg-amber-50 hover:text-amber-500 transition-all opacity-0 group-hover:opacity-100"
                        title="Edit">
                        <span className="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button
                        onClick={() => onDelete(council)}
                        className="p-1.5 rounded-xl text-[#b0b8c9] hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                        title="Delete">
                        <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#f5f6f8] mx-3" />

            {/* Members */}
            <div className="pl-3">
                <p className="text-xs font-semibold text-[#616f89] uppercase tracking-wide mb-3">
                    Members · {memberCount}
                </p>
                {memberCount > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {council.members.map(m => (
                            <div key={m.userId}
                                className="flex items-center gap-2 pl-1 pr-3 py-1 bg-[#f8f9fb] rounded-xl border border-[#f0f2f5]">
                                <div className={`w-6 h-6 ${avatarColor(m.userId)} rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                                    {getInitials(m.fullName || m.email || "?")}
                                </div>
                                <span className="text-xs font-semibold text-[#111318]">{m.fullName || m.email}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-[#b0b8c9]">
                        <span className="material-symbols-outlined text-lg">person_off</span>
                        <span className="text-xs italic">No members assigned yet</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const CouncilManagement: React.FC = () => {
    const [councils, setCouncils] = useState<CouncilDto[]>([]);
    const [semesters, setSemesters] = useState<SemesterDto[]>([]);
    const [teachers, setTeachers] = useState<TeacherInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSemesterId, setActiveSemesterId] = useState<number | undefined>(undefined);
    const [activeSemesterName, setActiveSemesterName] = useState<string>("");
    const [createOpen, setCreateOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<CouncilDto | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [editTarget, setEditTarget] = useState<CouncilDto | null>(null);
    const [editLoading, setEditLoading] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [councilRes, semesterRes, teacherRes] = await Promise.all([
                councilService.getAllCouncils(),
                semesterService.getActiveSemester(),
                councilService.getTeachers(),
            ]);
            const sem = semesterRes.data;
            if (sem) {
                setActiveSemesterId(sem.semesterId);
                setActiveSemesterName(sem.semesterName ?? "");
                setSemesters([sem]);
                // Re-fetch councils filtered by active semester
                const filtered = await councilService.getAllCouncils(sem.semesterId);
                setCouncils(filtered.data ?? []);
            } else {
                setCouncils(councilRes.data ?? []);
            }
            setTeachers(teacherRes.data ?? []);
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? "Failed to load data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleCreate = async (dto: CreateCouncilDto) => {
        setCreateLoading(true);
        try {
            await councilService.createCouncil(dto);
            toast.success("Council created!");
            setCreateOpen(false);
            await fetchAll();
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? "Failed to create council");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await councilService.deleteCouncil(deleteTarget.councilId);
            toast.success("Council deleted!");
            setDeleteTarget(null);
            await fetchAll();
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? "Failed to delete council");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleEdit = async (id: number, dto: { councilName?: string; memberUserIds?: number[] }) => {
        setEditLoading(true);
        try {
            await councilService.updateCouncil(id, dto);
            toast.success("Council updated!");
            setEditTarget(null);
            await fetchAll();
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? "Failed to update council");
        } finally {
            setEditLoading(false);
        }
    };

    const getSemesterName = (id: number) =>
        semesters.find(s => Number(s.semesterId) === Number(id))?.semesterName ?? `Semester #${id}`;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-[#111318] tracking-tight">Defense Councils</h2>
                    <p className="text-[#616f89] mt-1 text-sm">Manage committees for thesis defense evaluation.</p>
                </div>
                <button
                    onClick={() => setCreateOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-white text-sm font-bold rounded-2xl hover:shadow-lg hover:shadow-primary/25 active:scale-95 transition-all"
                >
                    <span className="material-symbols-outlined text-xl">add</span>
                    New Council
                </button>
            </div>

            {/* Active Semester Badge */}
            <div className="bg-white p-4 rounded-2xl border border-[#f0f2f5] shadow-sm flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-xl text-green-700 border border-green-100">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider">Active Semester</span>
                </div>
                {activeSemesterName ? (
                    <span className="text-sm font-semibold text-[#111318]">{activeSemesterName}</span>
                ) : (
                    <span className="text-sm text-[#b0b8c9] italic">No active semester</span>
                )}
                <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#616f89]">
                        {councils.length} council{councils.length !== 1 ? "s" : ""}
                    </span>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-[#616f89] text-sm font-medium animate-pulse">Loading councils…</p>
                </div>
            ) : councils.length === 0 ? (
                <div className="bg-white border border-dashed border-[#dbdfe6] rounded-3xl p-16 text-center">
                    <div className="w-16 h-16 bg-[#f6f6f8] rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-4xl text-[#b0b8c9]">gavel</span>
                    </div>
                    <p className="font-bold text-[#616f89] text-base">No councils found</p>
                    <p className="text-sm text-[#b0b8c9] mt-1">Create a new council to get started</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {councils.map(c => (
                        <CouncilCard
                            key={c.councilId}
                            council={c}
                            semesterName={getSemesterName(c.semesterId)}
                            onDelete={setDeleteTarget}
                            onEdit={setEditTarget}
                        />
                    ))}
                </div>
            )}

            <CreateCouncilModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onSave={handleCreate}
                loading={createLoading}
                semesters={semesters}
                teachers={teachers}
            />
            <DeleteModal
                council={deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                loading={deleteLoading}
            />
            <EditCouncilModal
                council={editTarget}
                onClose={() => setEditTarget(null)}
                onSave={handleEdit}
                loading={editLoading}
                semesters={semesters}
                teachers={teachers}
            />
        </div>
    );
};

export default CouncilManagement;
