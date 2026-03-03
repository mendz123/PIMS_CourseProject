import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
    roomService,
    type RoomDto,
    type CreateRoomDto,
    type UpdateRoomDto,
} from "../../services/roomService";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormState {
    roomName: string;
    building: string;
    capacity: string; // string so empty input works
}

const EMPTY_FORM: FormState = { roomName: "", building: "", capacity: "" };

// ─── Room Modal (Create / Edit) ───────────────────────────────────────────────

interface ModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (form: FormState) => Promise<void>;
    initial?: FormState;
    loading: boolean;
    mode: "create" | "edit";
}

const RoomModal: React.FC<ModalProps> = ({
    open,
    onClose,
    onSubmit,
    initial = EMPTY_FORM,
    loading,
    mode,
}) => {
    const [form, setForm] = useState<FormState>(initial);
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

    useEffect(() => {
        setForm(initial);
        setErrors({});
    }, [initial, open]);

    const validate = (): boolean => {
        const e: Partial<Record<keyof FormState, string>> = {};
        if (!form.roomName.trim()) e.roomName = "Room name is required";
        if (form.roomName.length > 100) e.roomName = "Max 100 characters";
        if (form.capacity !== "" && (isNaN(Number(form.capacity)) || Number(form.capacity) < 1 || Number(form.capacity) > 1000))
            e.capacity = "Capacity must be 1–1000";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        await onSubmit(form);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#dbdfe6]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <span className="material-symbols-outlined text-primary text-xl">
                                {mode === "create" ? "add_home" : "edit"}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[#111318]">
                                {mode === "create" ? "Create Room" : "Edit Room"}
                            </h2>
                            <p className="text-xs text-[#616f89] mt-0.5">
                                {mode === "create" ? "Add a new defense room" : "Update room details"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg text-[#616f89] hover:bg-[#f6f6f8] transition-all">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Room Name */}
                    <div>
                        <label className="block text-sm font-semibold text-[#111318] mb-1.5">
                            Room Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.roomName}
                            onChange={(e) => {
                                setForm((p) => ({ ...p, roomName: e.target.value }));
                                setErrors((p) => ({ ...p, roomName: undefined }));
                            }}
                            placeholder="e.g. A101"
                            maxLength={100}
                            className={`w-full px-4 py-2.5 text-sm rounded-xl border transition-all outline-none focus:ring-2 focus:ring-primary/30 ${errors.roomName ? "border-red-400 bg-red-50" : "border-[#dbdfe6] focus:border-primary"
                                }`}
                        />
                        {errors.roomName && (
                            <p className="text-xs text-red-500 mt-1">{errors.roomName}</p>
                        )}
                    </div>

                    {/* Building */}
                    <div>
                        <label className="block text-sm font-semibold text-[#111318] mb-1.5">
                            Building
                        </label>
                        <input
                            type="text"
                            value={form.building}
                            onChange={(e) => setForm((p) => ({ ...p, building: e.target.value }))}
                            placeholder="e.g. Building A"
                            maxLength={100}
                            className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#dbdfe6] outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                    </div>

                    {/* Capacity */}
                    <div>
                        <label className="block text-sm font-semibold text-[#111318] mb-1.5">
                            Capacity
                        </label>
                        <input
                            type="number"
                            value={form.capacity}
                            onChange={(e) => {
                                setForm((p) => ({ ...p, capacity: e.target.value }));
                                setErrors((p) => ({ ...p, capacity: undefined }));
                            }}
                            placeholder="e.g. 30"
                            min={1}
                            max={1000}
                            className={`w-full px-4 py-2.5 text-sm rounded-xl border transition-all outline-none focus:ring-2 focus:ring-primary/30 ${errors.capacity ? "border-red-400 bg-red-50" : "border-[#dbdfe6] focus:border-primary"
                                }`}
                        />
                        {errors.capacity && (
                            <p className="text-xs text-red-500 mt-1">{errors.capacity}</p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-[#dbdfe6] text-[#616f89] hover:bg-[#f6f6f8] transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <span className="material-symbols-outlined text-sm">
                                    {mode === "create" ? "add" : "save"}
                                </span>
                            )}
                            {mode === "create" ? "Create Room" : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const RoomManagement: React.FC = () => {
    const [rooms, setRooms] = useState<RoomDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [editTarget, setEditTarget] = useState<RoomDto | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<RoomDto | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchRooms = useCallback(async () => {
        try {
            setLoading(true);
            const res = await roomService.getAllRooms();
            setRooms(res.data ?? []);
        } catch {
            toast.error("Failed to load rooms");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRooms(); }, [fetchRooms]);

    const filtered = rooms.filter(
        (r) =>
            r.roomName.toLowerCase().includes(search.toLowerCase()) ||
            (r.building ?? "").toLowerCase().includes(search.toLowerCase()),
    );

    const openCreate = () => {
        setEditTarget(null);
        setModalMode("create");
        setModalOpen(true);
    };

    const openEdit = (r: RoomDto) => {
        setEditTarget(r);
        setModalMode("edit");
        setModalOpen(true);
    };

    const editInitial: FormState = editTarget
        ? {
            roomName: editTarget.roomName,
            building: editTarget.building ?? "",
            capacity: editTarget.capacity?.toString() ?? "",
        }
        : EMPTY_FORM;

    const handleSubmit = async (form: FormState) => {
        setSubmitLoading(true);
        try {
            if (modalMode === "create") {
                const dto: CreateRoomDto = {
                    roomName: form.roomName.trim(),
                    building: form.building.trim() || undefined,
                    capacity: form.capacity !== "" ? Number(form.capacity) : undefined,
                };
                await roomService.createRoom(dto);
                toast.success("Room created successfully!");
            } else if (editTarget) {
                const dto: UpdateRoomDto = {
                    roomName: form.roomName.trim() || undefined,
                    building: form.building.trim() || undefined,
                    capacity: form.capacity !== "" ? Number(form.capacity) : undefined,
                };
                await roomService.updateRoom(editTarget.roomId, dto);
                toast.success("Room updated successfully!");
            }
            setModalOpen(false);
            await fetchRooms();
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message ?? "An error occurred";
            toast.error(msg);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await roomService.deleteRoom(deleteTarget.roomId);
            toast.success(`Room "${deleteTarget.roomName}" deleted`);
            setDeleteTarget(null);
            await fetchRooms();
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message ?? "Failed to delete room";
            toast.error(msg);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-[#111318] tracking-tight">
                        Room Management
                    </h2>
                    <p className="text-[#616f89] mt-1 text-sm">
                        Manage rooms available for defense sessions.
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-xl">add_home</span>
                    Create Room
                </button>
            </div>

            {/* Search + count */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#616f89] text-lg">search</span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or building..."
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-[#dbdfe6] bg-white outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                </div>
                <span className="text-xs text-[#616f89] whitespace-nowrap">
                    {filtered.length} room{filtered.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-[#616f89] text-sm">Loading rooms…</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white border border-[#dbdfe6] rounded-xl flex flex-col items-center justify-center py-20 gap-3 text-center shadow-sm">
                    <span className="material-symbols-outlined text-6xl text-[#dbdfe6]">meeting_room</span>
                    <p className="text-[#111318] font-semibold">No rooms found</p>
                    <p className="text-[#616f89] text-sm">
                        {search ? "Try a different search term." : `Click "Create Room" to add your first room.`}
                    </p>
                </div>
            ) : (
                <div className="bg-white border border-[#dbdfe6] rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-[#f6f6f8] border-b border-[#dbdfe6]">
                            <tr>
                                <th className="text-left px-5 py-3 text-xs font-bold text-[#616f89] uppercase tracking-wider">Room</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-[#616f89] uppercase tracking-wider">Building</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-[#616f89] uppercase tracking-wider">Capacity</th>
                                <th className="text-right px-5 py-3 text-xs font-bold text-[#616f89] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#dbdfe6]">
                            {filtered.map((room) => (
                                <tr key={room.roomId} className="hover:bg-[#f6f6f8] transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <span className="material-symbols-outlined text-primary text-base">meeting_room</span>
                                            </div>
                                            <span className="font-semibold text-[#111318]">{room.roomName}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-[#616f89]">
                                        {room.building ?? <span className="italic text-[#b0b8c9]">—</span>}
                                    </td>
                                    <td className="px-5 py-3.5 text-[#616f89]">
                                        {room.capacity
                                            ? <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-sm">group</span>{room.capacity} seats</span>
                                            : <span className="italic text-[#b0b8c9]">—</span>
                                        }
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => openEdit(room)}
                                                title="Edit"
                                                className="p-1.5 rounded-lg text-[#616f89] hover:bg-primary/10 hover:text-primary transition-all"
                                            >
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(room)}
                                                title="Delete"
                                                className="p-1.5 rounded-lg text-[#616f89] hover:bg-red-50 hover:text-red-500 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create/Edit Modal */}
            <RoomModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                initial={editInitial}
                loading={submitLoading}
                mode={modalMode}
            />

            {/* Delete Confirm Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-xl">
                                <span className="material-symbols-outlined text-red-500 text-xl">delete_forever</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-[#111318]">Delete Room</h3>
                                <p className="text-xs text-[#616f89] mt-0.5">This action cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-sm text-[#616f89]">
                            Are you sure you want to delete room{" "}
                            <span className="font-semibold text-[#111318]">"{deleteTarget.roomName}"</span>?
                            {" "}Rooms currently in use by a defense session cannot be deleted.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleteLoading}
                                className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-[#dbdfe6] text-[#616f89] hover:bg-[#f6f6f8] transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteLoading}
                                className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {deleteLoading ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                )}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomManagement;
