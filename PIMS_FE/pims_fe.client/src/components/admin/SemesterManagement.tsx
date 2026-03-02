import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
    semesterService,
    type SemesterDto,
    type CreateSemesterDto,
    type UpdateSemesterDto,
} from "../../services/semesterService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
    semesterName: string;
    startDate: string;
    endDate: string;
    minGroupSize: number;
    maxGroupSize: number;
    isActive: boolean;
}

const EMPTY_FORM: FormState = {
    semesterName: "",
    startDate: "",
    endDate: "",
    minGroupSize: 1,
    maxGroupSize: 5,
    isActive: false,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (d: string | null) => {
    if (!d) return "—";
    const [year, month, day] = d.split("-");
    return `${day}/${month}/${year}`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (form: FormState) => Promise<void>;
    initial?: FormState;
    loading: boolean;
    mode: "create" | "edit";
}

const SemesterModal: React.FC<ModalProps> = ({
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

    const change = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value, type } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? (e.target as HTMLInputElement).checked
                    : type === "number"
                        ? Number(value)
                        : value,
        }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof FormState, string>> = {};
        if (!form.semesterName.trim())
            newErrors.semesterName = "Semester name is required";
        if (form.semesterName.length > 50)
            newErrors.semesterName = "Max 50 characters";
        if (!form.startDate) newErrors.startDate = "Start date is required";
        if (!form.endDate) newErrors.endDate = "End date is required";
        if (form.startDate && form.endDate && form.endDate <= form.startDate)
            newErrors.endDate = "End date must be after start date";
        if (form.minGroupSize < 1 || form.minGroupSize > 20)
            newErrors.minGroupSize = "Must be between 1 and 20";
        if (form.maxGroupSize < 1 || form.maxGroupSize > 20)
            newErrors.maxGroupSize = "Must be between 1 and 20";
        if (form.maxGroupSize < form.minGroupSize)
            newErrors.maxGroupSize = "Max must be ≥ Min group size";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        await onSubmit(form);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#dbdfe6]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <span className="material-symbols-outlined text-primary text-xl">
                                {mode === "create" ? "add_circle" : "edit"}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[#111318]">
                                {mode === "create" ? "Create New Semester" : "Edit Semester"}
                            </h2>
                            <p className="text-xs text-[#616f89] mt-0.5">
                                {mode === "create"
                                    ? "Fill in the details to create a new academic semester"
                                    : "Update the semester information below"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-[#616f89] hover:bg-[#f6f6f8] hover:text-[#111318] transition-all"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Semester Name */}
                    <div>
                        <label className="block text-sm font-semibold text-[#111318] mb-1.5">
                            Semester Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="semesterName"
                            value={form.semesterName}
                            onChange={change}
                            placeholder="e.g. Spring 2025"
                            maxLength={50}
                            className={`w-full px-4 py-2.5 text-sm rounded-xl border transition-all outline-none focus:ring-2 focus:ring-primary/30 ${errors.semesterName
                                ? "border-red-400 bg-red-50"
                                : "border-[#dbdfe6] bg-white focus:border-primary"
                                }`}
                        />
                        {errors.semesterName && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">error</span>
                                {errors.semesterName}
                            </p>
                        )}
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-[#111318] mb-1.5">
                                Start Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={form.startDate}
                                onChange={change}
                                className={`w-full px-4 py-2.5 text-sm rounded-xl border transition-all outline-none focus:ring-2 focus:ring-primary/30 ${errors.startDate
                                    ? "border-red-400 bg-red-50"
                                    : "border-[#dbdfe6] bg-white focus:border-primary"
                                    }`}
                            />
                            {errors.startDate && (
                                <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#111318] mb-1.5">
                                End Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                value={form.endDate}
                                onChange={change}
                                className={`w-full px-4 py-2.5 text-sm rounded-xl border transition-all outline-none focus:ring-2 focus:ring-primary/30 ${errors.endDate
                                    ? "border-red-400 bg-red-50"
                                    : "border-[#dbdfe6] bg-white focus:border-primary"
                                    }`}
                            />
                            {errors.endDate && (
                                <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>
                            )}
                        </div>
                    </div>

                    {/* Group Size */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-[#111318] mb-1.5">
                                Min Group Size{" "}
                                <span className="text-[#616f89] font-normal">(1–20)</span>
                            </label>
                            <input
                                type="number"
                                name="minGroupSize"
                                value={form.minGroupSize}
                                onChange={change}
                                min={1}
                                max={20}
                                className={`w-full px-4 py-2.5 text-sm rounded-xl border transition-all outline-none focus:ring-2 focus:ring-primary/30 ${errors.minGroupSize
                                    ? "border-red-400 bg-red-50"
                                    : "border-[#dbdfe6] bg-white focus:border-primary"
                                    }`}
                            />
                            {errors.minGroupSize && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errors.minGroupSize}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#111318] mb-1.5">
                                Max Group Size{" "}
                                <span className="text-[#616f89] font-normal">(1–20)</span>
                            </label>
                            <input
                                type="number"
                                name="maxGroupSize"
                                value={form.maxGroupSize}
                                onChange={change}
                                min={1}
                                max={20}
                                className={`w-full px-4 py-2.5 text-sm rounded-xl border transition-all outline-none focus:ring-2 focus:ring-primary/30 ${errors.maxGroupSize
                                    ? "border-red-400 bg-red-50"
                                    : "border-[#dbdfe6] bg-white focus:border-primary"
                                    }`}
                            />
                            {errors.maxGroupSize && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errors.maxGroupSize}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Is Active Toggle */}
                    <div className="flex items-center justify-between p-4 bg-[#f6f6f8] rounded-xl border border-[#dbdfe6]">
                        <div>
                            <p className="text-sm font-semibold text-[#111318]">
                                Set as Active Semester
                            </p>
                            <p className="text-xs text-[#616f89] mt-0.5">
                                Only one semester can be active at a time
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={form.isActive}
                                onChange={change}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary transition-colors"></div>
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
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
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Saving…
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-sm">
                                        {mode === "create" ? "add" : "save"}
                                    </span>
                                    {mode === "create" ? "Create Semester" : "Save Changes"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

interface DeleteConfirmProps {
    semester: SemesterDto | null;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    loading: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmProps> = ({
    semester,
    onClose,
    onConfirm,
    loading,
}) => {
    if (!semester) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-red-500 text-3xl">
                        warning
                    </span>
                </div>
                <h3 className="text-xl font-bold text-[#111318] mb-2">
                    Delete Semester?
                </h3>
                <p className="text-[#616f89] text-sm mb-6">
                    Are you sure you want to delete{" "}
                    <strong className="text-[#111318]">{semester.semesterName}</strong>?
                    This action cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-[#dbdfe6] text-[#616f89] hover:bg-[#f6f6f8] transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-sm">
                                    delete
                                </span>
                                Delete
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const SemesterManagement: React.FC = () => {
    const [semesters, setSemesters] = useState<SemesterDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [editTarget, setEditTarget] = useState<SemesterDto | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<SemesterDto | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Load semesters
    const fetchSemesters = useCallback(async () => {
        try {
            setLoading(true);
            const res = await semesterService.getAllSemesters();
            setSemesters(res.data ?? []);
        } catch {
            toast.error("Failed to load semesters");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSemesters();
    }, [fetchSemesters]);

    // Open create modal
    const openCreate = () => {
        setEditTarget(null);
        setModalMode("create");
        setModalOpen(true);
    };

    // Open edit modal
    const openEdit = (sem: SemesterDto) => {
        setEditTarget(sem);
        setModalMode("edit");
        setModalOpen(true);
    };

    // Submit create / edit
    const handleSubmit = async (form: FormState) => {
        setSubmitLoading(true);
        try {
            if (modalMode === "create") {
                const dto: CreateSemesterDto = { ...form };
                await semesterService.createSemester(dto);
                toast.success("Semester created successfully!");
            } else if (editTarget) {
                const dto: UpdateSemesterDto = { ...form };
                await semesterService.updateSemester(editTarget.semesterId, dto);
                toast.success("Semester updated successfully!");
            }
            setModalOpen(false);
            await fetchSemesters();
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message ?? "An error occurred";
            toast.error(msg);
        } finally {
            setSubmitLoading(false);
        }
    };

    // Quick toggle active
    const toggleActive = async (sem: SemesterDto) => {
        try {
            await semesterService.updateSemester(sem.semesterId, {
                isActive: !sem.isActive,
            });
            toast.success(
                !sem.isActive
                    ? `"${sem.semesterName}" is now active`
                    : `"${sem.semesterName}" deactivated`,
            );
            await fetchSemesters();
        } catch {
            toast.error("Failed to update semester status");
        }
    };

    // Delete semester
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await semesterService.deleteSemester(deleteTarget.semesterId);
            toast.success(`"${deleteTarget.semesterName}" deleted successfully`);
            setDeleteTarget(null);
            await fetchSemesters();
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message ?? "Failed to delete semester";
            toast.error(msg);
        } finally {
            setDeleteLoading(false);
        }
    };

    // Map editTarget → initial form values
    const editInitial: FormState = editTarget
        ? {
            semesterName: editTarget.semesterName ?? "",
            startDate: editTarget.startDate ?? "",
            endDate: editTarget.endDate ?? "",
            minGroupSize: editTarget.minGroupSize ?? 1,
            maxGroupSize: editTarget.maxGroupSize ?? 5,
            isActive: editTarget.isActive ?? false,
        }
        : EMPTY_FORM;

    const activeSemester = semesters.find((s) => s.isActive);

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-[#111318] tracking-tight">
                        Semester Management
                    </h2>
                    <p className="text-[#616f89] mt-1 text-sm">
                        Create and manage academic semesters for the system.
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-xl">add</span>
                    Create Semester
                </button>
            </div>

            {/* Active semester banner */}
            {activeSemester && (
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <span className="material-symbols-outlined text-primary">
                            calendar_today
                        </span>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-primary">
                            Current Active Semester
                        </p>
                        <p className="text-[#111318] text-sm font-semibold">
                            {activeSemester.semesterName}
                            <span className="text-[#616f89] font-normal ml-2">
                                {formatDate(activeSemester.startDate)} →{" "}
                                {formatDate(activeSemester.endDate)}
                            </span>
                        </p>
                    </div>
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">
                        Active
                    </span>
                </div>
            )}

            {/* Semester list */}
            <div className="bg-white border border-[#dbdfe6] rounded-xl shadow-sm overflow-hidden">
                {/* Table header */}
                <div className="p-5 border-b border-[#dbdfe6] flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#111318]">All Semesters</h3>
                    <span className="text-xs text-[#616f89] bg-[#f6f6f8] px-3 py-1 rounded-full font-medium">
                        {semesters.length} semester{semesters.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-[#616f89] text-sm">Loading semesters…</p>
                    </div>
                ) : semesters.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                        <span className="material-symbols-outlined text-6xl text-[#dbdfe6]">
                            event_busy
                        </span>
                        <p className="text-[#111318] font-semibold">No semesters found</p>
                        <p className="text-[#616f89] text-sm">
                            Click "Create Semester" to add your first semester.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#f6f6f8] border-b border-[#dbdfe6]">
                                    <th className="px-5 py-3 text-left text-xs font-bold text-[#616f89] uppercase tracking-wider">
                                        #
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-bold text-[#616f89] uppercase tracking-wider">
                                        Semester Name
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-bold text-[#616f89] uppercase tracking-wider">
                                        Duration
                                    </th>
                                    <th className="px-5 py-3 text-center text-xs font-bold text-[#616f89] uppercase tracking-wider">
                                        Group Size
                                    </th>
                                    <th className="px-5 py-3 text-center text-xs font-bold text-[#616f89] uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-5 py-3 text-right text-xs font-bold text-[#616f89] uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#dbdfe6]">
                                {semesters.map((sem, idx) => (
                                    <tr
                                        key={sem.semesterId}
                                        className={`hover:bg-[#f6f6f8] transition-colors ${sem.isActive ? "bg-primary/5" : ""}`}
                                    >
                                        <td className="px-5 py-4 text-[#616f89] font-medium">
                                            {idx + 1}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <span className="material-symbols-outlined text-primary text-base">
                                                        school
                                                    </span>
                                                </div>
                                                <span className="font-semibold text-[#111318]">
                                                    {sem.semesterName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-[#616f89]">
                                            <span className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-sm text-[#dbdfe6]">
                                                    date_range
                                                </span>
                                                {formatDate(sem.startDate)} → {formatDate(sem.endDate)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className="text-[#616f89]">
                                                {sem.minGroupSize ?? "—"} – {sem.maxGroupSize ?? "—"}{" "}
                                                <span className="text-xs">members</span>
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <button
                                                onClick={() => toggleActive(sem)}
                                                title="Toggle active status"
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all hover:opacity-80 ${sem.isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                                    }`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${sem.isActive ? "bg-green-500" : "bg-gray-400"}`}
                                                />
                                                {sem.isActive ? "Active" : "Inactive"}
                                            </button>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEdit(sem)}
                                                    title="Edit semester"
                                                    className="p-2 rounded-lg text-[#616f89] hover:bg-primary/10 hover:text-primary transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-lg">
                                                        edit
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(sem)}
                                                    title="Delete semester"
                                                    className="p-2 rounded-lg text-[#616f89] hover:bg-red-50 hover:text-red-500 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-lg">
                                                        delete
                                                    </span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modals */}
            <SemesterModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                initial={editInitial}
                loading={submitLoading}
                mode={modalMode}
            />
            <DeleteConfirmModal
                semester={deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                loading={deleteLoading}
            />
        </div>
    );
};

export default SemesterManagement;
