import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { userService } from "../../services/userService";
import { semesterService } from "../../services/semesterService";
import type { LecturerSummaryDto } from "../../types/user.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name: string | null) =>
  (name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
];

const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

// ─── Lecturer Detail Modal ────────────────────────────────────────────────────

interface LecturerDetailModalProps {
  lecturer: LecturerSummaryDto | null;
  onClose: () => void;
}

const LecturerDetailModal: React.FC<LecturerDetailModalProps> = ({
  lecturer,
  onClose,
}) => {
  if (!lecturer) return null;

  const displayName = lecturer.fullName ?? lecturer.email;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-primary/5 border-b border-[#dbdfe6] p-6 flex items-center gap-4">
          {lecturer.avatarUrl ? (
            <img
              src={lecturer.avatarUrl}
              alt={displayName}
              className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
            />
          ) : (
            <div
              className={`w-14 h-14 rounded-full ${avatarColor(lecturer.userId)} flex items-center justify-center text-white font-bold text-xl`}
            >
              {getInitials(lecturer.fullName)}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-lg font-bold text-[#111318]">{displayName}</h2>
            <p className="text-sm text-[#616f89]">{lecturer.email}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#616f89] hover:bg-[#f6f6f8] transition-all"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6 max-h-[60vh] overflow-y-auto">
          {/* Mentoring Groups */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-[20px]">
                groups
              </span>
              <h3 className="font-semibold text-[#111318]">
                Mentoring Groups
                <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-bold">
                  {lecturer.mentoringGroups.length}
                </span>
              </h3>
            </div>
            {lecturer.mentoringGroups.length === 0 ? (
              <p className="text-sm text-[#616f89] italic pl-7">
                No mentoring groups assigned.
              </p>
            ) : (
              <div className="flex flex-col gap-2 pl-7">
                {lecturer.mentoringGroups.map((g) => (
                  <div
                    key={g.groupId}
                    className="flex items-center justify-between bg-[#f6f6f8] rounded-lg px-4 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#616f89] text-[18px]">
                        group
                      </span>
                      <span className="text-sm font-medium text-[#111318]">
                        {g.groupName ?? `Group #${g.groupId}`}
                      </span>
                    </div>
                    <span className="text-xs text-[#616f89] bg-white border border-[#dbdfe6] px-2 py-0.5 rounded-full">
                      {g.semesterName ?? `Semester ${g.semesterId}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Council Defense Groups */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-amber-500 text-[20px]">
                gavel
              </span>
              <h3 className="font-semibold text-[#111318]">
                Defense Council Groups
                <span className="ml-2 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-bold">
                  {lecturer.councilGroups.length}
                </span>
              </h3>
            </div>
            {lecturer.councilGroups.length === 0 ? (
              <p className="text-sm text-[#616f89] italic pl-7">
                No defense council assignments.
              </p>
            ) : (
              <div className="flex flex-col gap-2 pl-7">
                {lecturer.councilGroups.map((cg, idx) => (
                  <div
                    key={`${cg.councilId}-${cg.groupId}-${idx}`}
                    className="flex items-center justify-between bg-amber-50 rounded-lg px-4 py-2.5 border border-amber-100"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-[#111318]">
                        {cg.groupName ?? `Group #${cg.groupId}`}
                      </span>
                      <span className="text-xs text-[#616f89]">
                        Council: {cg.councilName ?? `#${cg.councilId}`}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-xs text-[#616f89] bg-white border border-[#dbdfe6] px-2 py-0.5 rounded-full">
                        {cg.semesterName}
                      </span>
                      {cg.defenseDate && (
                        <span className="text-xs text-amber-700 font-medium">
                          {new Date(cg.defenseDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#dbdfe6] px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const LecturerListContent: React.FC = () => {
  const [lecturers, setLecturers] = useState<LecturerSummaryDto[]>([]);
  const [activeSemesterName, setActiveSemesterName] = useState<string | null>(
    null,
  );
  const [activeSemesterId, setActiveSemesterId] = useState<number | undefined>(
    undefined,
  );
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "mentoring" | "council">(
    "all",
  );
  const [loading, setLoading] = useState(false);
  const [selectedLecturer, setSelectedLecturer] =
    useState<LecturerSummaryDto | null>(null);

  const fetchData = useCallback(async (semId?: number) => {
    setLoading(true);
    try {
      const res = await userService.getLecturersSummary(semId);
      if (res.success) {
        setLecturers(res.data);
      } else {
        toast.error(res.message || "Failed to load lecturers.");
      }
    } catch {
      toast.error("Failed to load lecturers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    semesterService
      .getActiveSemester()
      .then((res) => {
        if (res.success && res.data) {
          setActiveSemesterName(res.data.semesterName);
          setActiveSemesterId(res.data.semesterId);
          fetchData(res.data.semesterId);
        } else {
          // No active semester — load all
          fetchData(undefined);
        }
      })
      .catch(() => fetchData(undefined));
  }, [fetchData]);

  const filtered = lecturers.filter((l) => {
    const term = search.toLowerCase();
    const matchSearch =
      (l.fullName ?? "").toLowerCase().includes(term) ||
      l.email.toLowerCase().includes(term);
    const matchRole =
      roleFilter === "all" ||
      (roleFilter === "mentoring" && l.mentoringGroups.length > 0) ||
      (roleFilter === "council" && l.councilGroups.length > 0);
    return matchSearch && matchRole;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111318]">Lecturer List</h1>
          <p className="text-sm text-[#616f89] mt-1">
            View all lecturers with their mentoring and defense council
            assignments.
          </p>
        </div>
        {activeSemesterName && (
          <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            {activeSemesterName}
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#616f89] text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-[#dbdfe6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          />
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#dbdfe6] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[22px]">
              person
            </span>
          </div>
          <div>
            <p className="text-xs text-[#616f89]">Total Lecturers</p>
            <p className="text-xl font-bold text-[#111318]">
              {filtered.length}
            </p>
          </div>
        </div>
        <button
          onClick={() =>
            setRoleFilter(roleFilter === "mentoring" ? "all" : "mentoring")
          }
          className={`p-4 flex items-center gap-3 rounded-xl border transition-all text-left ${
            roleFilter === "mentoring"
              ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200"
              : "bg-white border-[#dbdfe6] hover:border-emerald-300"
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-emerald-600 text-[22px]">
              groups
            </span>
          </div>
          <div>
            <p className="text-xs text-[#616f89]">Lecturers Mentoring</p>
            <p className="text-xl font-bold text-[#111318]">
              {lecturers.filter((l) => l.mentoringGroups.length > 0).length}
            </p>
          </div>
        </button>
        <button
          onClick={() =>
            setRoleFilter(roleFilter === "council" ? "all" : "council")
          }
          className={`p-4 flex items-center gap-3 rounded-xl border transition-all text-left ${
            roleFilter === "council"
              ? "bg-amber-50 border-amber-300 ring-2 ring-amber-200"
              : "bg-white border-[#dbdfe6] hover:border-amber-300"
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-amber-600 text-[22px]">
              gavel
            </span>
          </div>
          <div>
            <p className="text-xs text-[#616f89]">
              Lecturers in Defense Council
            </p>
            <p className="text-xl font-bold text-[#111318]">
              {lecturers.filter((l) => l.councilGroups.length > 0).length}
            </p>
          </div>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#dbdfe6] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-primary text-4xl animate-spin">
              refresh
            </span>
            <p className="text-sm text-[#616f89]">Loading lecturers…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-slate-300 text-5xl">
              person_off
            </span>
            <p className="text-sm text-[#616f89]">No lecturers found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f6f6f8] border-b border-[#dbdfe6]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#616f89] uppercase tracking-wide">
                    Lecturer
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#616f89] uppercase tracking-wide">
                    Mentoring Groups
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#616f89] uppercase tracking-wide">
                    Defense Council Groups
                  </th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dbdfe6]">
                {filtered.map((lecturer) => {
                  const displayName = lecturer.fullName ?? lecturer.email;
                  return (
                    <tr
                      key={lecturer.userId}
                      className="hover:bg-[#f6f6f8]/60 transition-colors"
                    >
                      {/* Lecturer info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {lecturer.avatarUrl ? (
                            <img
                              src={lecturer.avatarUrl}
                              alt={displayName}
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className={`w-9 h-9 rounded-full ${avatarColor(lecturer.userId)} flex items-center justify-center text-white font-bold text-sm`}
                            >
                              {getInitials(lecturer.fullName)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-[#111318]">
                              {displayName}
                            </p>
                            <p className="text-xs text-[#616f89]">
                              {lecturer.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Mentoring groups */}
                      <td className="px-5 py-4">
                        {lecturer.mentoringGroups.length === 0 ? (
                          <span className="text-xs text-[#616f89] italic">
                            None
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {lecturer.mentoringGroups.slice(0, 3).map((g) => (
                              <span
                                key={g.groupId}
                                className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"
                              >
                                {g.groupName ?? `#${g.groupId}`}
                              </span>
                            ))}
                            {lecturer.mentoringGroups.length > 3 && (
                              <span className="text-xs bg-[#f6f6f8] text-[#616f89] px-2 py-0.5 rounded-full">
                                +{lecturer.mentoringGroups.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Council groups */}
                      <td className="px-5 py-4">
                        {lecturer.councilGroups.length === 0 ? (
                          <span className="text-xs text-[#616f89] italic">
                            None
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {lecturer.councilGroups
                              .slice(0, 3)
                              .map((cg, idx) => (
                                <span
                                  key={`${cg.councilId}-${cg.groupId}-${idx}`}
                                  className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium"
                                >
                                  {cg.groupName ?? `#${cg.groupId}`}
                                </span>
                              ))}
                            {lecturer.councilGroups.length > 3 && (
                              <span className="text-xs bg-[#f6f6f8] text-[#616f89] px-2 py-0.5 rounded-full">
                                +{lecturer.councilGroups.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* View detail */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedLecturer(lecturer)}
                          className="flex items-center gap-1 text-xs text-primary font-bold hover:underline"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            open_in_new
                          </span>
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <LecturerDetailModal
        lecturer={selectedLecturer}
        onClose={() => setSelectedLecturer(null)}
      />
    </div>
  );
};

export default LecturerListContent;
