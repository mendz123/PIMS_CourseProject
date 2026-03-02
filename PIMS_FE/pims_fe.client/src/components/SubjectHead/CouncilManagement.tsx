import React, { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import {
    councilService,
    type CouncilDto,
    type CreateCouncilDto,
    type UpdateCouncilDto,
    type TeacherInfo,
} from "../../services/councilService";
import {
    semesterService,
    type SemesterDto,
} from "../../services/semesterService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
    councilName: string;
    semesterId: number | "";
    memberUserIds: number[];
}

const EMPTY_FORM: FormState = {
    councilName: "",
    semesterId: "",
    memberUserIds: [],
};

// ─── Member Picker ─────────────────────────────────────────────────────────────

interface MemberPickerProps {
    selectedIds: number[];
    onChange: (ids: number[]) => void;
    teachers: TeacherInfo[];
    loadingTeachers: boolean;
}

const MemberPicker: React.FC<MemberPickerProps> = ({
    selectedIds,
    onChange,
    teachers,
    loadingTeachers,
}) => {
    const [search, setSearch] = useState("");

    const filtered = teachers.filter(
        (t) =>
            t.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            t.email?.toLowerCase().includes(search.toLowerCase()),
    );

    const toggle = (id: number) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((sid) => sid !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-[#111318]">
                    Council Members <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-[#616f89] bg-[#f6f6f8] px-2 py-0.5 rounded-full">
                    {selectedIds.length} selected
                </span>
            </div>

            {/* Search */}
            <div className="relative mb-2">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#616f89] text-lg">
                    search
                </span>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search teacher by name or email..."
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-[#dbdfe6] bg-white outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
            </div>

            {/* List */}
            <div className="border border-[#dbdfe6] rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                {loadingTeachers ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-6 text-center text-sm text-[#616f89]">
                        No teachers found
                    </div>
                ) : (
                    filtered.map((t) => {
                        const selected = selectedIds.includes(t.userId);
                        return (
                            <button
                                key={t.userId}
                                type="button"
                                onClick={() => toggle(t.userId)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-b border-[#dbdfe6] last:border-b-0 ${selected
                                    ? "bg-primary/5 hover:bg-primary/10"
                                    : "bg-white hover:bg-[#f6f6f8]"
                                    }`}
                            >
                                <div
                                    className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all ${selected
                                        ? "bg-primary border-primary"
                                        : "border-[#dbdfe6]"
                                        }`}
                                >
                                    {selected && (
                                        <span className="material-symbols-outlined text-white text-sm">
                                            check
                                        </span>
                                    )}
                                </div>
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-xs">
                                    {t.fullName?.charAt(0) ?? "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[#111318] truncate">
                                        {t.fullName}
                                    </p>
                                    <p className="text-xs text-[#616f89] truncate">{t.email}</p>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>

            {/* Selected chips */}
            {selectedIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedIds.map((id) => {
                        const t = teachers.find((u) => u.userId === id);
                        if (!t) return null;
                        return (
                            <span
                                key={id}
                                className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-medium"
                            >
                                {t.fullName}
                                <button
                                    type="button"
                                    onClick={() => toggle(id)}
                                    className="hover:opacity-70"
                                >
                                    <span className="material-symbols-outlined text-sm">
                                        close
                                    </span>
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ─── Council Modal (Create / Edit) ────────────────────────────────────────────

interface ModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (form: FormState) => Promise<void>;
    initial?: FormState;
    loading: boolean;
    mode: "create" | "edit";
    semesters: SemesterDto[];
    teachers: TeacherInfo[];
    loadingTeachers: boolean;
}

const CouncilModal: React.FC<ModalProps> = ({
    open,
    onClose,
    onSubmit,
    initial = EMPTY_FORM,
    loading,
    mode,
    semesters,
    teachers,
    loadingTeachers,
}) => {
    const [form, setForm] = useState<FormState>(initial);
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

    useEffect(() => {
        setForm(initial);
        setErrors({});
    }, [initial, open]);

    const validate = (): boolean => {
        const e: Partial<Record<keyof FormState, string>> = {};
        if (!form.councilName.trim()) e.councilName = "Council name is required";
        if (form.councilName.length > 100) e.councilName = "Max 100 characters";
        if (form.semesterId === "") e.semesterId = "Please select a semester";
        if (form.memberUserIds.length === 0)
            e.memberUserIds = "At least 1 member is required";
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#dbdfe6]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <span className="material-symbols-outlined text-primary text-xl">
                                {mode === "create" ? "group_add" : "edit"}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[#111318]">
                                {mode === "create"
                                    ? "Create Defense Council"
                                    : "Edit Defense Council"}
                            </h2>
                            <p className="text-xs text-[#616f89] mt-0.5">
                                {mode === "create"
                                    ? "Set up a new council for project defense evaluation"
                                    : "Update council details and members"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-[#616f89] hover:bg-[#f6f6f8] transition-all"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Scrollable Form body */}
                <form
                    onSubmit={handleSubmit}
                    className="flex-1 overflow-y-auto p-6 space-y-5"
                >
                    {/* Council Name */}
                    <div>
                        <label className="block text-sm font-semibold text-[#111318] mb-1.5">
                            Council Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.councilName}
                            onChange={(e) => {
                                setForm((p) => ({ ...p, councilName: e.target.value }));
                                setErrors((p) => ({ ...p, councilName: undefined }));
                            }}
                            placeholder="e.g. Council A — Spring 2025"
                            maxLength={100}
                            className={`w-full px-4 py-2.5 text-sm rounded-xl border transition-all outline-none focus:ring-2 focus:ring-primary/30 ${errors.councilName
                                ? "border-red-400 bg-red-50"
                                : "border-[#dbdfe6] bg-white focus:border-primary"
                                }`}
                        />
                        {errors.councilName && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">error</span>
                                {errors.councilName}
                            </p>
                        )}
                    </div>

                    {/* Semester */}
                    {mode === "create" && (
                        <div>
                            <label className="block text-sm font-semibold text-[#111318] mb-1.5">
                                Semester <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.semesterId}
                                onChange={(e) => {
                                    setForm((p) => ({
                                        ...p,
                                        semesterId: e.target.value ? Number(e.target.value) : "",
                                    }));
                                    setErrors((p) => ({ ...p, semesterId: undefined }));
                                }}
                                className={`w-full px-4 py-2.5 text-sm rounded-xl border transition-all outline-none focus:ring-2 focus:ring-primary/30 appearance-none bg-white ${errors.semesterId
                                    ? "border-red-400 bg-red-50"
                                    : "border-[#dbdfe6] focus:border-primary"
                                    }`}
                            >
                                <option value="">— Select semester —</option>
                                {semesters.map((s) => (
                                    <option key={s.semesterId} value={s.semesterId}>
                                        {s.semesterName}
                                        {s.isActive ? " (Active)" : ""}
                                    </option>
                                ))}
                            </select>
                            {errors.semesterId && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errors.semesterId}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Member Picker */}
                    <div>
                        <MemberPicker
                            selectedIds={form.memberUserIds}
                            onChange={(ids) => {
                                setForm((p) => ({ ...p, memberUserIds: ids }));
                                setErrors((p) => ({ ...p, memberUserIds: undefined }));
                            }}
                            teachers={teachers}
                            loadingTeachers={loadingTeachers}
                        />
                        {errors.memberUserIds && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">error</span>
                                {errors.memberUserIds}
                            </p>
                        )}
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="p-6 border-t border-[#dbdfe6] flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-[#dbdfe6] text-[#616f89] hover:bg-[#f6f6f8] transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
                        disabled={loading}
                        className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving…
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-sm">
                                    {mode === "create" ? "add" : "save"}
                                </span>
                                {mode === "create" ? "Create Council" : "Save Changes"}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const CouncilManagement: React.FC = () => {
    const [councils, setCouncils] = useState<CouncilDto[]>([]);
    const [semesters, setSemesters] = useState<SemesterDto[]>([]);
    const [teachers, setTeachers] = useState<TeacherInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingTeachers, setLoadingTeachers] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [editTarget, setEditTarget] = useState<CouncilDto | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [filterSemester, setFilterSemester] = useState<number | "">("");
    const [deleteTarget, setDeleteTarget] = useState<CouncilDto | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const teachersFetched = useRef(false); // prevent duplicate fetches

    // Load councils
    const fetchCouncils = useCallback(async () => {
        try {
            setLoading(true);
            const res = await councilService.getAllCouncils(
                filterSemester !== "" ? filterSemester : undefined,
            );
            setCouncils(res.data ?? []);
        } catch {
            toast.error("Failed to load councils");
        } finally {
            setLoading(false);
        }
    }, [filterSemester]);

    // Load semesters (for filter & form)
    const fetchSemesters = useCallback(async () => {
        try {
            const res = await semesterService.getAllSemesters();
            setSemesters(res.data ?? []);
        } catch {
            // silent fail
        }
    }, []);

    // Load teachers using the dedicated /api/user/teachers endpoint
    const fetchTeachers = useCallback(async () => {
        if (teachersFetched.current) return;
        teachersFetched.current = true;
        setLoadingTeachers(true);
        try {
            const res = await councilService.getTeachers();
            setTeachers(res.data ?? []);
        } catch {
            teachersFetched.current = false; // allow retry on error
            toast.error("Failed to load teacher list");
        } finally {
            setLoadingTeachers(false);
        }
    }, []);

    useEffect(() => {
        fetchCouncils();
        fetchSemesters();
    }, [fetchCouncils, fetchSemesters]);

    const openCreate = () => {
        setEditTarget(null);
        setModalMode("create");
        fetchTeachers();
        setModalOpen(true);
    };

    const openEdit = (c: CouncilDto) => {
        setEditTarget(c);
        setModalMode("edit");
        fetchTeachers();
        setModalOpen(true);
    };

    const handleSubmit = async (form: FormState) => {
        setSubmitLoading(true);
        try {
            if (modalMode === "create") {
                const dto: CreateCouncilDto = {
                    councilName: form.councilName,
                    semesterId: form.semesterId as number,
                    memberUserIds: form.memberUserIds,
                };
                await councilService.createCouncil(dto);
                toast.success("Council created successfully!");
            } else if (editTarget) {
                const dto: UpdateCouncilDto = {
                    councilName: form.councilName,
                    memberUserIds: form.memberUserIds,
                };
                await councilService.updateCouncil(editTarget.councilId, dto);
                toast.success("Council updated successfully!");
            }
            setModalOpen(false);
            await fetchCouncils();
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message ?? "An error occurred";
            toast.error(msg);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDeleteCouncil = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await councilService.deleteCouncil(deleteTarget.councilId);
            toast.success(`"${deleteTarget.councilName}" deleted successfully`);
            setDeleteTarget(null);
            await fetchCouncils();
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response
                    ?.data?.message ?? "Failed to delete council";
            toast.error(msg);
        } finally {
            setDeleteLoading(false);
        }
    };

    const editInitial: FormState = editTarget
        ? {
            councilName: editTarget.councilName,
            semesterId: editTarget.semesterId,
            memberUserIds: editTarget.members.map((m) => m.userId),
        }
        : EMPTY_FORM;

    const semesterName = (id: number) =>
        semesters.find((s) => s.semesterId === id)?.semesterName ?? `Semester ${id}`;

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-[#111318] tracking-tight">
                        Defense Council Management
                    </h2>
                    <p className="text-[#616f89] mt-1 text-sm">
                        Create and manage councils for project defense evaluation.
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-xl">group_add</span>
                    Create Council
                </button>
            </div>

            {/* Filter by semester */}
            <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#616f89] text-lg">
                    filter_list
                </span>
                <select
                    value={filterSemester}
                    onChange={(e) =>
                        setFilterSemester(e.target.value ? Number(e.target.value) : "")
                    }
                    className="px-3 py-2 text-sm rounded-xl border border-[#dbdfe6] bg-white outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                >
                    <option value="">All Semesters</option>
                    {semesters.map((s) => (
                        <option key={s.semesterId} value={s.semesterId}>
                            {s.semesterName}
                        </option>
                    ))}
                </select>
                <span className="text-xs text-[#616f89]">
                    {councils.length} council{councils.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Council list */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-[#616f89] text-sm">Loading councils…</p>
                </div>
            ) : councils.length === 0 ? (
                <div className="bg-white border border-[#dbdfe6] rounded-xl flex flex-col items-center justify-center py-20 gap-3 text-center shadow-sm">
                    <span className="material-symbols-outlined text-6xl text-[#dbdfe6]">
                        groups
                    </span>
                    <p className="text-[#111318] font-semibold">No councils found</p>
                    <p className="text-[#616f89] text-sm">
                        Click "Create Council" to add your first defense council.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {councils.map((council) => (
                        <div
                            key={council.councilId}
                            className="bg-white border border-[#dbdfe6] rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                        >
                            {/* Card header */}
                            <div className="p-5 border-b border-[#dbdfe6]">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-primary">
                                                gavel
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-[#111318] text-sm leading-tight truncate">
                                                {council.councilName}
                                            </h3>
                                            <p className="text-xs text-[#616f89] mt-0.5 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">
                                                    calendar_today
                                                </span>
                                                {semesterName(council.semesterId)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <button
                                            onClick={() => openEdit(council)}
                                            title="Edit council"
                                            className="p-1.5 rounded-lg text-[#616f89] hover:bg-primary/10 hover:text-primary transition-all"
                                        >
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget(council)}
                                            title="Delete council"
                                            className="p-1.5 rounded-lg text-[#616f89] hover:bg-red-50 hover:text-red-500 transition-all"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Members */}
                            <div className="p-4">
                                <p className="text-xs font-bold text-[#616f89] uppercase tracking-wider mb-3">
                                    Members ({council.members.length})
                                </p>
                                {council.members.length === 0 ? (
                                    <p className="text-xs text-[#616f89] italic">
                                        No members assigned
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {council.members.slice(0, 4).map((m) => (
                                            <div
                                                key={m.userId}
                                                className="flex items-center gap-2.5"
                                            >
                                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                                                    {m.fullName.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-[#111318] truncate">
                                                        {m.fullName}
                                                    </p>
                                                    <p className="text-[10px] text-[#616f89] truncate">
                                                        {m.email}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {council.members.length > 4 && (
                                            <p className="text-xs text-[#616f89] pl-9 italic">
                                                +{council.members.length - 4} more member
                                                {council.members.length - 4 > 1 ? "s" : ""}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Card footer */}
                            <div className="px-4 pb-4">
                                <button
                                    onClick={() => openEdit(council)}
                                    className="w-full py-2 text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-all"
                                >
                                    Edit Council
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit/Create Modal */}
            <CouncilModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                initial={editInitial}
                loading={submitLoading}
                mode={modalMode}
                semesters={semesters}
                teachers={teachers}
                loadingTeachers={loadingTeachers}
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
                                <h3 className="font-bold text-[#111318]">Delete Council</h3>
                                <p className="text-xs text-[#616f89] mt-0.5">This action cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-sm text-[#616f89]">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-[#111318]">"{deleteTarget.councilName}"</span>
                            {" "}and all its members?
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
                                onClick={handleDeleteCouncil}
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

export default CouncilManagement;
