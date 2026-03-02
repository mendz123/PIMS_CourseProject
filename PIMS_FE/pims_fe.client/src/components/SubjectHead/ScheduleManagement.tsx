import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
    defenseScheduleService,
    type DefenseScheduleDto,
    type CreateDefenseScheduleDto,
    type GroupInfo,
} from "../../services/defenseScheduleService";
import { councilService, type CouncilDto } from "../../services/councilService";
import { semesterService, type SemesterDto } from "../../services/semesterService";
import { roomService, type RoomDto } from "../../services/roomService";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtDate = (d: string | null) =>
    d ? new Date(d + "T00:00:00").toLocaleDateString("vi-VN") : "—";

const fmtTime = (t: string | null) => {
    if (!t) return "—";
    const [h, m] = t.split(":");
    return `${h}:${m}`;
};

const statusBadge = (s: string | null) => {
    const map: Record<string, string> = {
        PENDING: "bg-amber-100 text-amber-700",
        COMPLETED: "bg-green-100 text-green-700",
        CANCELLED: "bg-red-100 text-red-500",
    };
    return map[s ?? ""] ?? "bg-gray-100 text-gray-600";
};

// ─── Create Schedule Modal ────────────────────────────────────────────────────

interface CreateModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (dto: CreateDefenseScheduleDto) => Promise<void>;
    loading: boolean;
    councils: CouncilDto[];
    groups: GroupInfo[];
    rooms: RoomDto[];
    filterSemesterId: number | "";
}

interface FormState {
    councilId: string;
    groupId: string;
    defenseDate: string;
    startTime: string;
    endTime: string;
    roomId: string;
}

const EMPTY: FormState = {
    councilId: "",
    groupId: "",
    defenseDate: "",
    startTime: "",
    endTime: "",
    roomId: "",
};

const CreateModal: React.FC<CreateModalProps> = ({
    open, onClose, onSubmit, loading, councils, groups, rooms, filterSemesterId,
}) => {
    const [form, setForm] = useState<FormState>(EMPTY);
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

    useEffect(() => {
        if (open) { setForm(EMPTY); setErrors({}); }
    }, [open]);

    const filteredCouncils = councils.filter(c =>
        filterSemesterId === "" || c.semesterId === filterSemesterId
    );

    const validate = () => {
        const e: Partial<Record<keyof FormState, string>> = {};
        if (!form.councilId) e.councilId = "Council is required";
        if (!form.groupId) e.groupId = "Group is required";
        if (!form.defenseDate) e.defenseDate = "Date is required";
        if (!form.startTime) e.startTime = "Start time is required";
        if (!form.endTime) e.endTime = "End time is required";
        if (form.startTime && form.endTime && form.endTime <= form.startTime)
            e.endTime = "End time must be after start time";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        await onSubmit({
            councilId: Number(form.councilId),
            groupId: Number(form.groupId),
            defenseDate: form.defenseDate,
            startTime: form.startTime + ":00",
            endTime: form.endTime + ":00",
            roomId: form.roomId ? Number(form.roomId) : undefined,
        });
    };

    if (!open) return null;

    const field = (k: keyof FormState, label: string, required = false, children: React.ReactNode) => (
        <div>
            <label className="block text-sm font-semibold text-[#111318] mb-1.5">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {errors[k] && <p className="text-xs text-red-500 mt-1">{errors[k]}</p>}
        </div>
    );

    const selectCls = (k: keyof FormState) =>
        `w-full px-3 py-2.5 text-sm rounded-xl border outline-none focus:ring-2 focus:ring-primary/30 transition-all ${errors[k] ? "border-red-400 bg-red-50" : "border-[#dbdfe6] focus:border-primary"
        }`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#dbdfe6] sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <span className="material-symbols-outlined text-primary text-xl">event</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[#111318]">Schedule Defense Session</h2>
                            <p className="text-xs text-[#616f89]">Set date, time and council for a group</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg text-[#616f89] hover:bg-[#f6f6f8] transition-all">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Council */}
                    {field("councilId", "Council", true,
                        <select value={form.councilId} onChange={e => { setForm(p => ({ ...p, councilId: e.target.value })); setErrors(p => ({ ...p, councilId: undefined })); }} className={selectCls("councilId")}>
                            <option value="">— Select council —</option>
                            {filteredCouncils.map(c => (
                                <option key={c.councilId} value={c.councilId}>{c.councilName}</option>
                            ))}
                        </select>
                    )}

                    {/* Group */}
                    {field("groupId", "Group", true,
                        <select value={form.groupId} onChange={e => { setForm(p => ({ ...p, groupId: e.target.value })); setErrors(p => ({ ...p, groupId: undefined })); }} className={selectCls("groupId")}>
                            <option value="">— Select group —</option>
                            {groups.map(g => (
                                <option key={g.groupId} value={g.groupId}>{g.groupName || `Group #${g.groupId}`}</option>
                            ))}
                        </select>
                    )}

                    {/* Date */}
                    {field("defenseDate", "Defense Date", true,
                        <input type="date" value={form.defenseDate}
                            onChange={e => { setForm(p => ({ ...p, defenseDate: e.target.value })); setErrors(p => ({ ...p, defenseDate: undefined })); }}
                            className={selectCls("defenseDate")}
                        />
                    )}

                    {/* Time row */}
                    <div className="grid grid-cols-2 gap-3">
                        {field("startTime", "Start Time", true,
                            <input type="time" value={form.startTime}
                                onChange={e => { setForm(p => ({ ...p, startTime: e.target.value })); setErrors(p => ({ ...p, startTime: undefined })); }}
                                className={selectCls("startTime")}
                            />
                        )}
                        {field("endTime", "End Time", true,
                            <input type="time" value={form.endTime}
                                onChange={e => { setForm(p => ({ ...p, endTime: e.target.value })); setErrors(p => ({ ...p, endTime: undefined })); }}
                                className={selectCls("endTime")}
                            />
                        )}
                    </div>

                    {/* Room (optional) */}
                    {field("roomId", "Room (optional)", false,
                        <select value={form.roomId} onChange={e => setForm(p => ({ ...p, roomId: e.target.value }))} className={selectCls("roomId")}>
                            <option value="">— Assign later —</option>
                            {rooms.map(r => (
                                <option key={r.roomId} value={r.roomId}>
                                    {r.roomName}{r.building ? ` (${r.building})` : ""}{r.capacity ? ` · ${r.capacity} seats` : ""}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Footer */}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} disabled={loading}
                            className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-[#dbdfe6] text-[#616f89] hover:bg-[#f6f6f8] transition-all disabled:opacity-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                            {loading
                                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <span className="material-symbols-outlined text-sm">add</span>}
                            Create Schedule
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Assign Room Modal (UC37) ─────────────────────────────────────────────────

interface AssignRoomModalProps {
    schedule: DefenseScheduleDto | null;
    onClose: () => void;
    onSave: (roomId: number | null) => Promise<void>;
    loading: boolean;
    rooms: RoomDto[];
}

const AssignRoomModal: React.FC<AssignRoomModalProps> = ({ schedule, onClose, onSave, loading, rooms }) => {
    const [roomId, setRoomId] = useState<string>("");

    useEffect(() => {
        setRoomId(schedule?.roomId?.toString() ?? "");
    }, [schedule]);

    if (!schedule) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <span className="material-symbols-outlined text-primary text-xl">meeting_room</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-[#111318]">Assign Room</h3>
                        <p className="text-xs text-[#616f89] mt-0.5">{schedule.groupName} · {fmtDate(schedule.defenseDate)}</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-[#111318] mb-1.5">Room</label>
                    <select
                        value={roomId}
                        onChange={e => setRoomId(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#dbdfe6] outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    >
                        <option value="">— No room assigned —</option>
                        {rooms.map(r => (
                            <option key={r.roomId} value={r.roomId}>
                                {r.roomName}{r.building ? ` (${r.building})` : ""}{r.capacity ? ` · ${r.capacity} seats` : ""}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} disabled={loading}
                        className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-[#dbdfe6] text-[#616f89] hover:bg-[#f6f6f8] transition-all disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={() => onSave(roomId ? Number(roomId) : null)} disabled={loading}
                        className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                        {loading
                            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <span className="material-symbols-outlined text-sm">save</span>}
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ScheduleManagement: React.FC = () => {
    const [schedules, setSchedules] = useState<DefenseScheduleDto[]>([]);
    const [councils, setCouncils] = useState<CouncilDto[]>([]);
    const [groups, setGroups] = useState<GroupInfo[]>([]);
    const [rooms, setRooms] = useState<RoomDto[]>([]);
    const [semesters, setSemesters] = useState<SemesterDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterSemester, setFilterSemester] = useState<number | "">("");
    const [filterCouncil, setFilterCouncil] = useState<number | "">("");
    const [createOpen, setCreateOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [assignTarget, setAssignTarget] = useState<DefenseScheduleDto | null>(null);
    const [assignLoading, setAssignLoading] = useState(false);

    const fetchSchedules = useCallback(async () => {
        setLoading(true);
        try {
            const res = await defenseScheduleService.getAll(
                filterSemester !== "" ? filterSemester : undefined,
                filterCouncil !== "" ? filterCouncil : undefined,
            );
            setSchedules(res.data ?? []);
        } catch {
            toast.error("Failed to load schedules");
        } finally {
            setLoading(false);
        }
    }, [filterSemester, filterCouncil]);

    const fetchSupport = useCallback(async () => {
        try {
            const [c, g, r, s] = await Promise.all([
                councilService.getAllCouncils(),
                defenseScheduleService.getGroups(),
                roomService.getAllRooms(),
                semesterService.getAllSemesters(),
            ]);
            setCouncils(c.data ?? []);
            setGroups(g.data ?? []);
            setRooms(r.data ?? []);
            setSemesters(s.data ?? []);
        } catch {
            // silent
        }
    }, []);

    useEffect(() => { fetchSchedules(); }, [fetchSchedules]);
    useEffect(() => { fetchSupport(); }, [fetchSupport]);

    const handleCreate = async (dto: CreateDefenseScheduleDto) => {
        setCreateLoading(true);
        try {
            await defenseScheduleService.create(dto);
            toast.success("Defense session scheduled!");
            setCreateOpen(false);
            await fetchSchedules();
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to create schedule";
            toast.error(msg);
        } finally {
            setCreateLoading(false);
        }
    };

    const handleAssignRoom = async (roomId: number | null) => {
        if (!assignTarget) return;
        setAssignLoading(true);
        try {
            await defenseScheduleService.assignRoom(assignTarget.scheduleId, roomId);
            toast.success(roomId ? "Room assigned!" : "Room unassigned");
            setAssignTarget(null);
            await fetchSchedules();
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to assign room";
            toast.error(msg);
        } finally {
            setAssignLoading(false);
        }
    };

    const filteredCouncils = councils.filter(c =>
        filterSemester === "" || c.semesterId === filterSemester
    );

    const semesterName = (id: number) =>
        semesters.find(s => s.semesterId === id)?.semesterName ?? `Semester ${id}`;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-[#111318] tracking-tight">Defense Schedule</h2>
                    <p className="text-[#616f89] mt-1 text-sm">
                        Schedule and manage defense sessions for student groups.
                    </p>
                </div>
                <button
                    onClick={() => setCreateOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-xl">event_add</span>
                    New Session
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <span className="material-symbols-outlined text-[#616f89] text-lg">filter_list</span>
                <select
                    value={filterSemester}
                    onChange={e => { setFilterSemester(e.target.value ? Number(e.target.value) : ""); setFilterCouncil(""); }}
                    className="px-3 py-2 text-sm rounded-xl border border-[#dbdfe6] bg-white outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                >
                    <option value="">All Semesters</option>
                    {semesters.map(s => <option key={s.semesterId} value={s.semesterId}>{s.semesterName}</option>)}
                </select>
                <select
                    value={filterCouncil}
                    onChange={e => setFilterCouncil(e.target.value ? Number(e.target.value) : "")}
                    className="px-3 py-2 text-sm rounded-xl border border-[#dbdfe6] bg-white outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                >
                    <option value="">All Councils</option>
                    {filteredCouncils.map(c => <option key={c.councilId} value={c.councilId}>{c.councilName}</option>)}
                </select>
                <span className="text-xs text-[#616f89]">
                    {schedules.length} session{schedules.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-[#616f89] text-sm">Loading schedules…</p>
                </div>
            ) : schedules.length === 0 ? (
                <div className="bg-white border border-[#dbdfe6] rounded-xl flex flex-col items-center justify-center py-20 gap-3 text-center shadow-sm">
                    <span className="material-symbols-outlined text-6xl text-[#dbdfe6]">event_busy</span>
                    <p className="text-[#111318] font-semibold">No defense sessions found</p>
                    <p className="text-[#616f89] text-sm">Click "New Session" to create the first one.</p>
                </div>
            ) : (
                <div className="bg-white border border-[#dbdfe6] rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-[#f6f6f8] border-b border-[#dbdfe6]">
                            <tr>
                                <th className="text-left px-5 py-3 text-xs font-bold text-[#616f89] uppercase tracking-wider">Group</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-[#616f89] uppercase tracking-wider">Council</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-[#616f89] uppercase tracking-wider">Date & Time</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-[#616f89] uppercase tracking-wider">Room</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-[#616f89] uppercase tracking-wider">Status</th>
                                <th className="text-right px-5 py-3 text-xs font-bold text-[#616f89] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#dbdfe6]">
                            {schedules.map(s => (
                                <tr key={s.scheduleId} className="hover:bg-[#f6f6f8] transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <span className="material-symbols-outlined text-primary text-base">group</span>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-[#111318]">{s.groupName || `Group #${s.groupId}`}</p>
                                                <p className="text-[10px] text-[#616f89]">{semesterName(councils.find(c => c.councilId === s.councilId)?.semesterId ?? 0)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-[#616f89]">
                                        <div className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-sm">gavel</span>
                                            {s.councilName}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <p className="font-medium text-[#111318]">{fmtDate(s.defenseDate)}</p>
                                        <p className="text-xs text-[#616f89]">{fmtTime(s.startTime)} – {fmtTime(s.endTime)}</p>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        {s.roomName ? (
                                            <span className="inline-flex items-center gap-1 text-[#111318]">
                                                <span className="material-symbols-outlined text-sm text-primary">meeting_room</span>
                                                {s.roomName}
                                            </span>
                                        ) : (
                                            <span className="italic text-[#b0b8c9] text-xs">Not assigned</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusBadge(s.status)}`}>
                                            {s.status ?? "—"}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center justify-end">
                                            <button
                                                onClick={() => setAssignTarget(s)}
                                                title="Assign room"
                                                className="p-1.5 rounded-lg text-[#616f89] hover:bg-primary/10 hover:text-primary transition-all flex items-center gap-1 text-xs"
                                            >
                                                <span className="material-symbols-outlined text-lg">meeting_room</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Modal */}
            <CreateModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onSubmit={handleCreate}
                loading={createLoading}
                councils={councils}
                groups={groups}
                rooms={rooms}
                filterSemesterId={filterSemester}
            />

            {/* Assign Room Modal */}
            <AssignRoomModal
                schedule={assignTarget}
                onClose={() => setAssignTarget(null)}
                onSave={handleAssignRoom}
                loading={assignLoading}
                rooms={rooms}
            />
        </div>
    );
};

export default ScheduleManagement;
