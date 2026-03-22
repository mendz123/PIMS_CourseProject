import React, { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    parseISO,
} from "date-fns";
import { vi } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
    defenseScheduleService,
    type DefenseScheduleDto,
    type CreateDefenseScheduleDto,
    type UpdateDefenseScheduleDto,
    type BulkCreateDefenseScheduleDto,
    type GroupInfo,
} from "../../services/defenseScheduleService";
import { councilService, type CouncilDto } from "../../services/councilService";
import { semesterService } from "../../services/semesterService";
import { roomService, type RoomDto } from "../../services/roomService";
import { groupService } from "../../services/groupService";

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
        SCHEDULED: "bg-blue-100 text-blue-700",
        COMPLETED: "bg-green-100 text-green-700",
        CANCELLED: "bg-red-100 text-red-500",
    };
    return map[s ?? ""] ?? "bg-gray-100 text-gray-600";
};

// ─── Components ──────────────────────────────────────────────────────────────

interface ScheduleFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (dto: CreateDefenseScheduleDto | UpdateDefenseScheduleDto) => Promise<void>;
    loading: boolean;
    councils: CouncilDto[];
    groups: GroupInfo[];
    rooms: RoomDto[];
    filterSemesterId: number | "";
    editData?: DefenseScheduleDto | null;
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

const ScheduleFormModal: React.FC<ScheduleFormProps> = ({
    open, onClose, onSubmit, loading, councils, groups, rooms, filterSemesterId, editData,
}) => {
    const [form, setForm] = useState<FormState>(EMPTY);
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

    const isEdit = !!editData;

    useEffect(() => {
        if (open) {
            if (editData) {
                setForm({
                    councilId: String(editData.councilId),
                    groupId: String(editData.groupId),
                    defenseDate: editData.defenseDate ?? "",
                    startTime: editData.startTime ? editData.startTime.substring(0, 5) : "",
                    endTime: editData.endTime ? editData.endTime.substring(0, 5) : "",
                    roomId: editData.roomId ? String(editData.roomId) : "",
                });
            } else {
                setForm(EMPTY);
            }
            setErrors({});
        }
    }, [open, editData]);

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

    const selectCls = (k: keyof FormState) =>
        `w-full px-3 py-2.5 text-sm rounded-xl border outline-none focus:ring-2 focus:ring-primary/30 transition-all ${errors[k] ? "border-red-400 bg-red-50" : "border-[#dbdfe6] focus:border-primary"
        }`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-[#dbdfe6] sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isEdit ? "bg-amber-50" : "bg-primary/10"}`}>
                            <span className={`material-symbols-outlined text-xl ${isEdit ? "text-amber-600" : "text-primary"}`}>
                                {isEdit ? "edit_calendar" : "event"}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[#111318]">
                                {isEdit ? "Edit Defense Session" : "Schedule Defense Session"}
                            </h2>
                            <p className="text-xs text-[#616f89]">
                                {isEdit ? "Update date, time and council for this session" : "Set date, time and council for a group"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg text-[#616f89] hover:bg-[#f6f6f8] transition-all">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-[#111318] mb-1.5">Council <span className="text-red-500">*</span></label>
                        <select value={form.councilId} onChange={e => setForm(p => ({ ...p, councilId: e.target.value }))} className={selectCls("councilId")}>
                            <option value="">— Select council —</option>
                            {filteredCouncils.map(c => (
                                <option key={c.councilId} value={c.councilId}>{c.councilName}</option>
                            ))}
                        </select>
                        {errors.councilId && <p className="text-xs text-red-500 mt-1">{errors.councilId}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#111318] mb-1.5">Group <span className="text-red-500">*</span></label>
                        <select value={form.groupId} onChange={e => setForm(p => ({ ...p, groupId: e.target.value }))} className={selectCls("groupId")}>
                            <option value="">— Select group —</option>
                            {groups.map(g => (
                                <option key={g.groupId} value={g.groupId}>{g.groupName || `Group #${g.groupId}`}</option>
                            ))}
                        </select>
                        {errors.groupId && <p className="text-xs text-red-500 mt-1">{errors.groupId}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#111318] mb-1.5">Defense Date <span className="text-red-500">*</span></label>
                        <input type="date" value={form.defenseDate} onChange={e => setForm(p => ({ ...p, defenseDate: e.target.value }))} className={selectCls("defenseDate")} />
                        {errors.defenseDate && <p className="text-xs text-red-500 mt-1">{errors.defenseDate}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-[#111318] mb-1.5">Start Time <span className="text-red-500">*</span></label>
                            <input type="time" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} className={selectCls("startTime")} />
                            {errors.startTime && <p className="text-xs text-red-500 mt-1">{errors.startTime}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#111318] mb-1.5">End Time <span className="text-red-500">*</span></label>
                            <input type="time" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} className={selectCls("endTime")} />
                            {errors.endTime && <p className="text-xs text-red-500 mt-1">{errors.endTime}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#111318] mb-1.5">Room (optional)</label>
                        <select value={form.roomId} onChange={e => setForm(p => ({ ...p, roomId: e.target.value }))} className={selectCls("roomId")}>
                            <option value="">— Assign later —</option>
                            {rooms.map(r => (
                                <option key={r.roomId} value={r.roomId}>
                                    {r.roomName}{r.building ? ` (${r.building})` : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-[#dbdfe6] text-[#616f89] hover:bg-[#f6f6f8]">Cancel</button>
                        <button type="submit" disabled={loading} className={`flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-60 flex items-center justify-center gap-2 ${isEdit ? "bg-amber-600 hover:bg-amber-700" : "bg-primary hover:bg-primary/90"}`}>
                            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {isEdit ? "Update Schedule" : "Create Schedule"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface AssignRoomModalProps {
    schedule: DefenseScheduleDto | null;
    onClose: () => void;
    onSave: (roomId: number | null) => Promise<void>;
    loading: boolean;
    rooms: RoomDto[];
}

const AssignRoomModal: React.FC<AssignRoomModalProps> = ({ schedule, onClose, onSave, loading, rooms }) => {
    const [roomId, setRoomId] = useState<string>("");
    useEffect(() => { setRoomId(schedule?.roomId?.toString() ?? ""); }, [schedule]);
    if (!schedule) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl"><span className="material-symbols-outlined text-primary text-xl">meeting_room</span></div>
                    <div>
                        <h3 className="font-bold text-[#111318]">Assign Room</h3>
                        <p className="text-xs text-[#616f89] mt-0.5">{schedule.groupName} · {fmtDate(schedule.defenseDate)}</p>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-[#111318] mb-1.5">Room</label>
                    <select value={roomId} onChange={e => setRoomId(e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#dbdfe6] focus:border-primary transition-all underline-none">
                        <option value="">— No room assigned —</option>
                        {rooms.map(r => <option key={r.roomId} value={r.roomId}>{r.roomName}{r.building ? ` (${r.building})` : ""}</option>)}
                    </select>
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-[#dbdfe6] text-[#616f89] hover:bg-[#f6f6f8]">Cancel</button>
                    <button onClick={() => onSave(roomId ? Number(roomId) : null)} disabled={loading} className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 flex items-center justify-center gap-2">
                        {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Delete Confirm Modal ────────────────────────────────────────────────────

interface DeleteConfirmModalProps {
    schedule: DefenseScheduleDto | null;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    loading: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ schedule, onClose, onConfirm, loading }) => {
    if (!schedule) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 rounded-xl">
                        <span className="material-symbols-outlined text-red-600 text-xl">delete_forever</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-[#111318]">Delete Schedule</h3>
                        <p className="text-xs text-[#616f89] mt-0.5">This action cannot be undone</p>
                    </div>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">
                    Are you sure you want to delete the defense schedule for <strong>{schedule.groupName}</strong> on <strong>{fmtDate(schedule.defenseDate)}</strong>?
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-[#dbdfe6] text-[#616f89] hover:bg-[#f6f6f8]">Cancel</button>
                    <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2">
                        {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Bulk Create Modal ───────────────────────────────────────────────────────

interface BulkCreateModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (dto: BulkCreateDefenseScheduleDto) => Promise<void>;
    loading: boolean;
    councils: CouncilDto[];
    groups: GroupInfo[];
    rooms: RoomDto[];
    filterSemesterId: number | "";
}

const BulkCreateModal: React.FC<BulkCreateModalProps> = ({
    open, onClose, onSubmit, loading, councils, groups, rooms, filterSemesterId,
}) => {
    const [councilId, setCouncilId] = useState("");
    const [defenseDate, setDefenseDate] = useState("");
    const [windowStart, setWindowStart] = useState("");
    const [windowEnd, setWindowEnd] = useState("");
    const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
    const [slotMinutes, setSlotMinutes] = useState("");
    const [roomId, setRoomId] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (open) {
            setCouncilId(""); setDefenseDate(""); setWindowStart(""); setWindowEnd("");
            setSelectedGroupIds([]); setSlotMinutes(""); setRoomId(""); setErrors({});
        }
    }, [open]);

    const filteredCouncils = councils.filter(c =>
        filterSemesterId === "" || c.semesterId === filterSemesterId
    );

    const toggleGroup = (gid: number) => {
        setSelectedGroupIds(prev =>
            prev.includes(gid) ? prev.filter(x => x !== gid) : [...prev, gid]
        );
    };

    // Preview slots
    const previewSlots = React.useMemo(() => {
        if (!windowStart || !windowEnd || selectedGroupIds.length === 0) return [];
        const [sh, sm] = windowStart.split(":").map(Number);
        const [eh, em] = windowEnd.split(":").map(Number);
        const totalMin = (eh * 60 + em) - (sh * 60 + sm);
        if (totalMin <= 0) return [];
        const slot = slotMinutes ? Number(slotMinutes) : Math.floor(totalMin / selectedGroupIds.length);
        if (slot <= 0 || slot * selectedGroupIds.length > totalMin) return [];
        return selectedGroupIds.map((gid, i) => {
            const startMin = sh * 60 + sm + i * slot;
            const endMin = startMin + slot;
            const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
            const g = groups.find(x => x.groupId === gid);
            return { gid, name: g?.groupName || `Group #${gid}`, start: fmt(startMin), end: fmt(endMin) };
        });
    }, [windowStart, windowEnd, selectedGroupIds, slotMinutes, groups]);

    const validate = () => {
        const e: Record<string, string> = {};
        if (!councilId) e.councilId = "Council is required";
        if (!defenseDate) e.defenseDate = "Date is required";
        if (!windowStart) e.windowStart = "Start time is required";
        if (!windowEnd) e.windowEnd = "End time is required";
        if (windowStart && windowEnd && windowEnd <= windowStart) e.windowEnd = "End must be after start";
        if (selectedGroupIds.length === 0) e.groups = "Select at least one group";
        if (slotMinutes && isNaN(Number(slotMinutes))) e.slotMinutes = "Must be a number";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        await onSubmit({
            councilId: Number(councilId),
            defenseDate,
            windowStart,
            windowEnd,
            groupIds: selectedGroupIds,
            slotMinutes: slotMinutes ? Number(slotMinutes) : undefined,
            roomId: roomId ? Number(roomId) : undefined,
        });
    };

    if (!open) return null;

    const inputCls = (k: string) =>
        `w-full px-3 py-2.5 text-sm rounded-xl border outline-none focus:ring-2 focus:ring-primary/30 transition-all ${errors[k] ? "border-red-400 bg-red-50" : "border-[#dbdfe6] focus:border-primary"
        }`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-[#dbdfe6] sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-xl">
                            <span className="material-symbols-outlined text-indigo-600 text-xl">event_upcoming</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[#111318]">Bulk Schedule Defense Sessions</h2>
                            <p className="text-xs text-[#616f89]">Assign multiple groups to a council with auto-split time slots</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg text-[#616f89] hover:bg-[#f6f6f8] transition-all">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Council & Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-[#111318] mb-1.5">Council <span className="text-red-500">*</span></label>
                            <select value={councilId} onChange={e => setCouncilId(e.target.value)} className={inputCls("councilId")}>
                                <option value="">— Select council —</option>
                                {filteredCouncils.map(c => (
                                    <option key={c.councilId} value={c.councilId}>{c.councilName}</option>
                                ))}
                            </select>
                            {errors.councilId && <p className="text-xs text-red-500 mt-1">{errors.councilId}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#111318] mb-1.5">Defense Date <span className="text-red-500">*</span></label>
                            <input type="date" value={defenseDate} onChange={e => setDefenseDate(e.target.value)} className={inputCls("defenseDate")} />
                            {errors.defenseDate && <p className="text-xs text-red-500 mt-1">{errors.defenseDate}</p>}
                        </div>
                    </div>

                    {/* Window & Slot */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-[#111318] mb-1.5">Window Start <span className="text-red-500">*</span></label>
                            <input type="time" value={windowStart} onChange={e => setWindowStart(e.target.value)} className={inputCls("windowStart")} />
                            {errors.windowStart && <p className="text-xs text-red-500 mt-1">{errors.windowStart}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#111318] mb-1.5">Window End <span className="text-red-500">*</span></label>
                            <input type="time" value={windowEnd} onChange={e => setWindowEnd(e.target.value)} className={inputCls("windowEnd")} />
                            {errors.windowEnd && <p className="text-xs text-red-500 mt-1">{errors.windowEnd}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#111318] mb-1.5">Slot (min) <span className="text-[#b0b8c9] font-normal text-xs">optional</span></label>
                            <input type="number" min={1} placeholder="Auto" value={slotMinutes} onChange={e => setSlotMinutes(e.target.value)} className={inputCls("slotMinutes")} />
                            {errors.slotMinutes && <p className="text-xs text-red-500 mt-1">{errors.slotMinutes}</p>}
                        </div>
                    </div>

                    {/* Group Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-[#111318] mb-2">Select Groups <span className="text-red-500">*</span></label>
                        {errors.groups && <p className="text-xs text-red-500 mb-2">{errors.groups}</p>}
                        <div className="border border-[#dbdfe6] rounded-xl overflow-hidden">
                            <div className="bg-[#f8f9fb] px-3 py-2 border-b border-[#dbdfe6] flex items-center justify-between">
                                <span className="text-xs font-bold text-[#616f89] uppercase tracking-wide">{selectedGroupIds.length} selected</span>
                                <button type="button" onClick={() => setSelectedGroupIds(groups.map(g => g.groupId))} className="text-xs font-bold text-primary hover:underline">Select All</button>
                            </div>
                            <div className="max-h-48 overflow-y-auto divide-y divide-[#f0f2f5]">
                                {groups.map(g => (
                                    <label key={g.groupId} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[#f8f9fb] transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={selectedGroupIds.includes(g.groupId)}
                                            onChange={() => toggleGroup(g.groupId)}
                                            className="w-4 h-4 rounded accent-primary"
                                        />
                                        <span className="text-sm text-[#111318] font-medium">{g.groupName || `Group #${g.groupId}`}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Room */}
                    <div>
                        <label className="block text-sm font-semibold text-[#111318] mb-1.5">Room (optional)</label>
                        <select value={roomId} onChange={e => setRoomId(e.target.value)} className={inputCls("roomId")}>
                            <option value="">— Assign later —</option>
                            {rooms.map(r => (
                                <option key={r.roomId} value={r.roomId}>{r.roomName}{r.building ? ` (${r.building})` : ""}</option>
                            ))}
                        </select>
                    </div>

                    {/* Preview */}
                    {previewSlots.length > 0 && (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                            <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">preview</span>
                                Schedule Preview
                            </p>
                            <div className="space-y-2">
                                {previewSlots.map((s, i) => (
                                    <div key={s.gid} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 bg-indigo-200 text-indigo-700 rounded-md flex items-center justify-center font-black text-[10px]">{i + 1}</span>
                                            <span className="font-semibold text-[#111318]">{s.name}</span>
                                        </div>
                                        <span className="font-mono font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-lg border border-indigo-100">{s.start} – {s.end}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-[#dbdfe6] text-[#616f89] hover:bg-[#f6f6f8]">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2">
                            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            <span className="material-symbols-outlined text-lg">event_upcoming</span>
                            Bulk Schedule ({selectedGroupIds.length})
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ScheduleManagement: React.FC = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [schedules, setSchedules] = useState<DefenseScheduleDto[]>([]);
    const [councils, setCouncils] = useState<CouncilDto[]>([]);
    const [groups, setGroups] = useState<GroupInfo[]>([]);
    const [rooms, setRooms] = useState<RoomDto[]>([]);
    const [activeSemesterId, setActiveSemesterId] = useState<number | undefined>(undefined);
    const [activeSemesterName, setActiveSemesterName] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [assignTarget, setAssignTarget] = useState<DefenseScheduleDto | null>(null);
    const [assignLoading, setAssignLoading] = useState(false);
    // Edit & Delete state
    const [editTarget, setEditTarget] = useState<DefenseScheduleDto | null>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<DefenseScheduleDto | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Retake Mode States
    const [isRetakeMode, setIsRetakeMode] = useState(false);
    const [lan1AssessmentId, setLan1AssessmentId] = useState<string>("");
    const [assessments, setAssessments] = useState<{ assessmentId: number; title: string }[]>([]);

    // Schedules are already filtered by active semester at the API level
    const filteredSchedules = schedules;

    const fetchSchedules = useCallback(async (semId?: number) => {
        setLoading(true);
        try {
            const res = await defenseScheduleService.getAll(semId, undefined);
            setSchedules(res.data ?? []);
        } catch {
            toast.error("Failed to load schedules");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSupport = useCallback(async () => {
        try {
            const [c, r, activeSem] = await Promise.all([
                councilService.getAllCouncils(),
                roomService.getAllRooms(),
                semesterService.getActiveSemester(),
            ]);
            setCouncils(c.data ?? []);
            setRooms(r.data ?? []);
            const sem = activeSem.data;
            if (sem) {
                setActiveSemesterId(sem.semesterId);
                setActiveSemesterName(sem.semesterName ?? "");
                // Use eligible groups (filters out groups where all members passed)
                const eligibleRes = await defenseScheduleService.getEligibleGroups(sem.semesterId);
                setGroups(eligibleRes.data ?? []);
                await fetchSchedules(sem.semesterId);
            } else {
                setCouncils([]);
                setGroups([]);
                setRooms([]);
                await fetchSchedules(undefined);
            }
        } catch { /* silent */ }
    }, [fetchSchedules]);

    const fetchAssessments = useCallback(async () => {
        try {
            const res = await groupService.getActiveAssessments();
            const finalAssessments = (res.data ?? []).filter(a => a.title.toLowerCase().includes('final'));
            setAssessments(finalAssessments);
        } catch { /* silent */ }
    }, []);

    const fetchGroups = useCallback(async (retake: boolean, assessmentId: string, semId?: number) => {
        try {
            if (retake && assessmentId && semId) {
                const res = await groupService.getGroupsEligibleForRetake(semId, Number(assessmentId));
                setGroups((res.data as any) ?? []); 
            } else if (!retake && semId) {
                const res = await defenseScheduleService.getGroups(semId);
                setGroups((res.data as any) ?? []);
            } else {
                setGroups([]);
            }
        } catch { toast.error("Failed to fetch groups"); }
    }, []);

    useEffect(() => { fetchSupport(); fetchAssessments(); }, [fetchSupport, fetchAssessments]);

    // Re-fetch groups when mode or assessment changes
    useEffect(() => {
        if (!loading) fetchGroups(isRetakeMode, lan1AssessmentId, activeSemesterId);
    }, [isRetakeMode, lan1AssessmentId, activeSemesterId, loading, fetchGroups]);

    const handleCreate = async (dto: CreateDefenseScheduleDto) => {
        setCreateLoading(true);
        try {
            await defenseScheduleService.create(dto);
            toast.success("Defense session scheduled!");
            setCreateOpen(false);
            await fetchSchedules(activeSemesterId);
            // Refresh eligible groups
            if (activeSemesterId) {
                const eligibleRes = await defenseScheduleService.getEligibleGroups(activeSemesterId);
                setGroups(eligibleRes.data ?? []);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? "Failed to create schedule");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleEdit = async (dto: UpdateDefenseScheduleDto) => {
        if (!editTarget) return;
        setEditLoading(true);
        try {
            await defenseScheduleService.update(editTarget.scheduleId, dto);
            toast.success("Defense session updated!");
            setEditTarget(null);
            await fetchSchedules(activeSemesterId);
            // Refresh eligible groups
            if (activeSemesterId) {
                const eligibleRes = await defenseScheduleService.getEligibleGroups(activeSemesterId);
                setGroups(eligibleRes.data ?? []);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? "Failed to update schedule");
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await defenseScheduleService.delete(deleteTarget.scheduleId);
            toast.success("Defense session deleted!");
            setDeleteTarget(null);
            await fetchSchedules(activeSemesterId);
            // Refresh eligible groups
            if (activeSemesterId) {
                const eligibleRes = await defenseScheduleService.getEligibleGroups(activeSemesterId);
                setGroups(eligibleRes.data ?? []);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? "Failed to delete schedule");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleBulkCreate = async (dto: BulkCreateDefenseScheduleDto) => {
        setBulkLoading(true);
        try {
            const res = await defenseScheduleService.bulkCreate(dto);
            const count = res.data?.length ?? 0;
            toast.success(`${count} defense sessions scheduled!`);
            setBulkOpen(false);
            await fetchSchedules(activeSemesterId);
            // Refresh eligible groups
            if (activeSemesterId) {
                const eligibleRes = await defenseScheduleService.getEligibleGroups(activeSemesterId);
                setGroups(eligibleRes.data ?? []);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? "Failed to bulk create schedules");
        } finally {
            setBulkLoading(false);
        }
    };

    const handleAssignRoom = async (roomId: number | null) => {
        if (!assignTarget) return;
        setAssignLoading(true);
        try {
            await defenseScheduleService.assignRoom(assignTarget.scheduleId, roomId);
            toast.success("Room updated!");
            setAssignTarget(null);
            await fetchSchedules(activeSemesterId);
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? "Failed to assign room");
        } finally {
            setAssignLoading(false);
        }
    };

    // ─── Calendar Logic ──────────────────────────────────────────────────────

    const calendarDays = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
        const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    }, [currentMonth]);

    const getDaySessions = (day: Date) => {
        return filteredSchedules.filter(s => s.defenseDate && isSameDay(parseISO(s.defenseDate), day));
    };

    const selectedDaySessions = useMemo(() => getDaySessions(selectedDate), [selectedDate, filteredSchedules]);

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-[#111318] tracking-tight">Defense Schedule</h2>
                    <p className="text-[#616f89] mt-1 text-sm">Manage defense sessions for students.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setBulkOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-200"
                    >
                        <span className="material-symbols-outlined text-xl">event_upcoming</span>
                        Bulk Schedule
                    </button>
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/20"
                    >
                        <span className="material-symbols-outlined text-xl">event_add</span>
                        New Session
                    </button>
                </div>
            </div>

            {/* Retake Mode Toggle */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-indigo-200 shadow-sm bg-indigo-50/30">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isRetakeMode} onChange={e => setIsRetakeMode(e.target.checked)} className="w-5 h-5 rounded accent-indigo-600 cursor-pointer" />
                    <span className="text-sm font-bold text-indigo-900">Schedule for Retake (Lần 2)</span>
                </label>
                
                {isRetakeMode && (
                    <div className="flex flex-1 items-center gap-3 animate-in fade-in slide-in-from-left-4">
                        <span className="text-xs text-indigo-700 font-medium whitespace-nowrap">Filter eligible groups from Assessment (Lần 1):</span>
                        <select value={lan1AssessmentId} onChange={e => setLan1AssessmentId(e.target.value)} className="flex-1 max-w-sm px-3 py-2 text-sm rounded-xl border border-indigo-200 focus:border-indigo-500 outline-none shadow-sm">
                            <option value="">— Select Lần 1 Assessment —</option>
                            {assessments.map(a => <option key={a.assessmentId} value={a.assessmentId}>{a.title}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {/* Active Semester Badge */}
            <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-[#dbdfe6] shadow-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-xl text-green-700 border border-green-100">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider">Active Semester</span>
                </div>
                {activeSemesterName ? (
                    <span className="text-sm font-semibold text-[#111318]">{activeSemesterName}</span>
                ) : (
                    <span className="text-sm text-[#b0b8c9] italic">No active semester</span>
                )}
                <div className="ml-auto flex items-center gap-2 text-[#616f89] text-xs font-medium">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    {filteredSchedules.length} session{filteredSchedules.length !== 1 ? "s" : ""} found
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-[#616f89] text-sm animate-pulse">Loading schedule data…</p>
                </div>
            ) : (
                /* ─── Calendar View ─── */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
                    {/* Left: Calendar Side */}
                    <div className="lg:col-span-8 bg-white border border-[#dbdfe6] rounded-3xl shadow-sm overflow-hidden flex flex-col">
                        {/* Month Header */}
                        <div className="p-6 flex items-center justify-between border-b border-[#dbdfe6] bg-[#f8f9fb]">
                            <h3 className="text-lg font-black text-[#111318] capitalize">
                                {format(currentMonth, "MMMM yyyy", { locale: vi })}
                            </h3>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-xl hover:bg-[#ebedf2] border border-[#dbdfe6] bg-white transition-all text-[#616f89]">
                                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                </button>
                                <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-1.5 rounded-xl border border-[#dbdfe6] bg-white text-xs font-bold hover:bg-[#ebedf2] transition-all text-[#111318]">
                                    Today
                                </button>
                                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-xl hover:bg-[#ebedf2] border border-[#dbdfe6] bg-white transition-all text-[#616f89]">
                                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                </button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="grid grid-cols-7 border-b border-[#dbdfe6] bg-[#f8f9fb]">
                                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                                    <div key={d} className="py-2 text-center text-[10px] font-black text-[#616f89] uppercase tracking-widest">{d}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 auto-rows-fr h-full">
                                {calendarDays.map((day, i) => {
                                    const sessions = getDaySessions(day);
                                    const isCurrentMonth = isSameMonth(day, currentMonth);
                                    const activeDate = isSameDay(day, selectedDate);
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => setSelectedDate(day)}
                                            className={`min-h-[100px] p-2 border-r border-b border-[#f0f2f5] transition-all cursor-pointer relative group ${!isCurrentMonth ? "opacity-30 bg-[#fbfbfc]" : "bg-white"} ${activeDate ? "ring-2 ring-primary ring-inset z-10" : ""}`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg ${isToday(day) ? "bg-primary text-white shadow-md shadow-primary/30" : activeDate ? "text-primary bg-primary/10" : "text-[#111318]"}`}>
                                                    {format(day, "d")}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                {sessions.slice(0, 3).map(s => (
                                                    <div key={s.scheduleId} className="px-1.5 py-0.5 rounded-md bg-primary/5 border-l-2 border-primary text-[9px] font-bold text-primary truncate">
                                                        {s.groupName || "Group"}
                                                    </div>
                                                ))}
                                                {sessions.length > 3 && (
                                                    <div className="text-[8px] font-black text-[#616f89] pl-2">+{sessions.length - 3} more</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: Details Side */}
                    <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
                        <div className="bg-white border border-[#dbdfe6] rounded-3xl shadow-sm p-6 flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-primary/10 rounded-2xl">
                                    <span className="material-symbols-outlined text-primary">calendar_today</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#111318]">{format(selectedDate, "eeee", { locale: vi })}</h3>
                                    <p className="text-sm text-[#616f89]">{format(selectedDate, "dd MMMM, yyyy", { locale: vi })}</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                                {selectedDaySessions.length > 0 ? (
                                    selectedDaySessions.map(s => (
                                        <div key={s.scheduleId} className="p-4 rounded-2xl border border-[#f0f2f5] hover:border-primary/30 transition-all bg-[#f8f9fb] group">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${statusBadge(s.status)}`}>{s.status}</span>
                                                <span className="text-[10px] font-bold text-[#616f89] bg-white px-2 py-1 rounded-lg border border-[#f0f2f5]">{fmtTime(s.startTime)}</span>
                                            </div>
                                            <h4 className="font-bold text-[#111318] text-sm group-hover:text-primary transition-colors">{s.groupName || `Group #${s.groupId}`}</h4>
                                            <div className="mt-2 space-y-2">
                                                <div className="flex items-center gap-2 text-[11px] text-[#616f89]">
                                                    <span className="material-symbols-outlined text-sm">gavel</span>
                                                    {s.councilName}
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] text-[#616f89]">
                                                    <span className="material-symbols-outlined text-sm text-green-500">location_on</span>
                                                    {s.roomName || "No room assigned"}
                                                </div>
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-[#f0f2f5] flex justify-end gap-3">
                                                <button onClick={() => setEditTarget(s)} className="text-[10px] font-bold text-amber-600 flex items-center gap-1 hover:underline">
                                                    <span className="material-symbols-outlined text-[12px]">edit</span>
                                                    Edit
                                                </button>
                                                <button onClick={() => setDeleteTarget(s)} className="text-[10px] font-bold text-red-500 flex items-center gap-1 hover:underline">
                                                    <span className="material-symbols-outlined text-[12px]">delete</span>
                                                    Delete
                                                </button>
                                                <button onClick={() => setAssignTarget(s)} className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline">
                                                    Assign Room
                                                    <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                                        <span className="material-symbols-outlined text-5xl mb-2">event_available</span>
                                        <p className="text-sm font-bold uppercase tracking-widest">No sessions scheduled</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            <ScheduleFormModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onSubmit={handleCreate}
                loading={createLoading}
                councils={councils}
                groups={groups}
                rooms={rooms}
                filterSemesterId={activeSemesterId ?? ""}
            />

            {/* Edit Modal */}
            <ScheduleFormModal
                open={!!editTarget}
                onClose={() => setEditTarget(null)}
                onSubmit={handleEdit}
                loading={editLoading}
                councils={councils}
                groups={groups}
                rooms={rooms}
                filterSemesterId={activeSemesterId ?? ""}
                editData={editTarget}
            />

            {/* Bulk Create Modal */}
            <BulkCreateModal open={bulkOpen} onClose={() => setBulkOpen(false)} onSubmit={handleBulkCreate} loading={bulkLoading} councils={councils} groups={groups} rooms={rooms} filterSemesterId={activeSemesterId ?? ""} />

            {/* Assign Room Modal */}
            <AssignRoomModal schedule={assignTarget} onClose={() => setAssignTarget(null)} onSave={handleAssignRoom} loading={assignLoading} rooms={rooms} />

            {/* Delete Confirm Modal */}
            <DeleteConfirmModal schedule={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleteLoading} />
        </div>
    );
};

export default ScheduleManagement;
