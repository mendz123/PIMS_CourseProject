import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { roomService, type RoomDto, type CreateRoomDto, type UpdateRoomDto } from "../../services/roomService";

// ─── Shared input class ───────────────────────────────────────────────────────
const inputCls = "w-full px-3 py-2.5 text-sm rounded-xl border border-[#dbdfe6] focus:border-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all";

// ─── Create Modal ─────────────────────────────────────────────────────────────

const CreateRoomModal: React.FC<{
    open: boolean; onClose: () => void;
    onSave: (dto: CreateRoomDto) => Promise<void>; loading: boolean;
}> = ({ open, onClose, onSave, loading }) => {
    const [form, setForm] = useState({ roomName: "", building: "", capacity: "" });
    useEffect(() => { if (open) setForm({ roomName: "", building: "", capacity: "" }); }, [open]);
    if (!open) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.roomName.trim()) { toast.error("Room name is required"); return; }
        await onSave({ roomName: form.roomName.trim(), building: form.building.trim() || undefined, capacity: form.capacity ? Number(form.capacity) : undefined });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center gap-3 p-6 border-b border-[#dbdfe6]">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <span className="material-symbols-outlined text-primary">meeting_room</span>
                    </div>
                    <div>
                        <h2 className="font-bold text-[#111318]">Add New Room</h2>
                        <p className="text-xs text-[#616f89]">Fill in room details below</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-[#111318] mb-1.5">Room Name <span className="text-red-500">*</span></label>
                        <input type="text" placeholder="e.g. Room 101" value={form.roomName}
                            onChange={e => setForm(p => ({ ...p, roomName: e.target.value }))} className={inputCls} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[#111318] mb-1.5">Building</label>
                        <input type="text" placeholder="e.g. Building A" value={form.building}
                            onChange={e => setForm(p => ({ ...p, building: e.target.value }))} className={inputCls} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[#111318] mb-1.5">Capacity</label>
                        <input type="number" placeholder="e.g. 30" value={form.capacity}
                            onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} min={1} className={inputCls} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-[#dbdfe6] text-[#616f89] hover:bg-[#f6f6f8]">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-60">
                            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            Create Room
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────

const EditRoomModal: React.FC<{
    room: RoomDto | null; onClose: () => void;
    onSave: (id: number, dto: UpdateRoomDto) => Promise<void>; loading: boolean;
}> = ({ room, onClose, onSave, loading }) => {
    const [form, setForm] = useState({ roomName: "", building: "", capacity: "" });

    useEffect(() => {
        if (room) setForm({
            roomName: room.roomName,
            building: room.building ?? "",
            capacity: room.capacity?.toString() ?? "",
        });
    }, [room]);

    if (!room) return null;

    const handleSubmit = async () => {
        if (!form.roomName.trim()) { toast.error("Room name is required"); return; }
        await onSave(room.roomId, {
            roomName: form.roomName.trim(),
            building: form.building.trim() || undefined,
            capacity: form.capacity ? Number(form.capacity) : undefined,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-[#dbdfe6]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-xl">
                            <span className="material-symbols-outlined text-amber-600">edit</span>
                        </div>
                        <div>
                            <h2 className="font-bold text-[#111318]">Edit Room</h2>
                            <p className="text-xs text-[#616f89]">Update room information</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl text-[#616f89] hover:bg-[#f6f6f8] flex items-center justify-center">
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-[#111318] mb-1.5">Room Name <span className="text-red-500">*</span></label>
                        <input type="text" value={form.roomName}
                            onChange={e => setForm(p => ({ ...p, roomName: e.target.value }))} className={inputCls} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[#111318] mb-1.5">Building</label>
                        <input type="text" value={form.building}
                            onChange={e => setForm(p => ({ ...p, building: e.target.value }))} className={inputCls} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[#111318] mb-1.5">Capacity</label>
                        <input type="number" value={form.capacity}
                            onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} min={1} className={inputCls} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-[#dbdfe6] text-[#616f89] hover:bg-[#f6f6f8]">
                            Cancel
                        </button>
                        <button onClick={handleSubmit} disabled={loading}
                            className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-amber-500 text-white hover:bg-amber-600 flex items-center justify-center gap-2 disabled:opacity-60">
                            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

const DeleteModal: React.FC<{
    room: RoomDto | null; onClose: () => void;
    onConfirm: () => Promise<void>; loading: boolean;
}> = ({ room, onClose, onConfirm, loading }) => {
    if (!room) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-xl">
                        <span className="material-symbols-outlined text-red-500">delete_forever</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-[#111318]">Delete Room</h3>
                        <p className="text-xs text-[#616f89] mt-0.5">This action cannot be undone</p>
                    </div>
                </div>
                <p className="text-sm text-[#616f89]">
                    Are you sure you want to delete <span className="font-bold text-[#111318]">{room.roomName}</span>?
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-[#dbdfe6] text-[#616f89] hover:bg-[#f6f6f8]">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                        className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-red-500 text-white hover:bg-red-600 flex items-center justify-center gap-2 disabled:opacity-60">
                        {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const RoomManagement: React.FC = () => {
    const [rooms, setRooms] = useState<RoomDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [editTarget, setEditTarget] = useState<RoomDto | null>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<RoomDto | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [search, setSearch] = useState("");

    const fetchRooms = useCallback(async () => {
        setLoading(true);
        try {
            const res = await roomService.getAllRooms();
            setRooms(res.data ?? []);
        } catch {
            toast.error("Failed to load rooms");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRooms(); }, [fetchRooms]);

    const handleCreate = async (dto: CreateRoomDto) => {
        setCreateLoading(true);
        try {
            await roomService.createRoom(dto);
            toast.success("Room created!");
            setCreateOpen(false);
            await fetchRooms();
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? "Failed to create room");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleEdit = async (id: number, dto: UpdateRoomDto) => {
        setEditLoading(true);
        try {
            await roomService.updateRoom(id, dto);
            toast.success("Room updated!");
            setEditTarget(null);
            await fetchRooms();
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? "Failed to update room");
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await roomService.deleteRoom(deleteTarget.roomId);
            toast.success("Room deleted!");
            setDeleteTarget(null);
            await fetchRooms();
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? "Failed to delete room");
        } finally {
            setDeleteLoading(false);
        }
    };

    const filtered = rooms.filter(r =>
        r.roomName.toLowerCase().includes(search.toLowerCase()) ||
        (r.building ?? "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-[#111318] tracking-tight">Room Management</h2>
                    <p className="text-[#616f89] mt-1 text-sm">Manage defense and exam rooms.</p>
                </div>
                <button
                    onClick={() => setCreateOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-xl">add</span>
                    Add Room
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-2xl border border-[#dbdfe6] shadow-sm">
                <div className="relative max-w-sm">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#616f89] text-xl">search</span>
                    <input
                        type="text" placeholder="Search rooms..." value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-[#dbdfe6] focus:border-primary outline-none transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-[#616f89] text-sm animate-pulse">Loading rooms…</p>
                </div>
            ) : (
                <div className="bg-white border border-[#dbdfe6] rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead className="bg-[#f8f9fb] border-b border-[#dbdfe6]">
                            <tr>
                                <th className="text-left px-5 py-4 text-xs font-bold text-[#616f89] uppercase tracking-wider">Room Name</th>
                                <th className="text-left px-5 py-4 text-xs font-bold text-[#616f89] uppercase tracking-wider">Building</th>
                                <th className="text-left px-5 py-4 text-xs font-bold text-[#616f89] uppercase tracking-wider">Capacity</th>
                                <th className="text-right px-5 py-4 text-xs font-bold text-[#616f89] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#dbdfe6]">
                            {filtered.map(room => (
                                <tr key={room.roomId} className="hover:bg-[#f8f9fb]/50 transition-colors group">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary text-lg">meeting_room</span>
                                            </div>
                                            <span className="font-bold text-[#111318]">{room.roomName}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-[#616f89]">{room.building ?? "—"}</td>
                                    <td className="px-5 py-4 text-[#616f89]">{room.capacity != null ? `${room.capacity} seats` : "—"}</td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => setEditTarget(room)}
                                                className="p-2 rounded-xl text-[#616f89] hover:bg-amber-50 hover:text-amber-500 transition-all"
                                                title="Edit Room"
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(room)}
                                                className="p-2 rounded-xl text-[#616f89] hover:bg-red-50 hover:text-red-500 transition-all"
                                                title="Delete Room"
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-30">
                                            <span className="material-symbols-outlined text-6xl">meeting_room</span>
                                            <p className="font-bold">No rooms found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <CreateRoomModal open={createOpen} onClose={() => setCreateOpen(false)} onSave={handleCreate} loading={createLoading} />
            <EditRoomModal room={editTarget} onClose={() => setEditTarget(null)} onSave={handleEdit} loading={editLoading} />
            <DeleteModal room={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleteLoading} />
        </div>
    );
};

export default RoomManagement;
