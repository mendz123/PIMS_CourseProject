import React, { useState, useEffect } from "react";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import {
  defenseScheduleService,
  type DefenseScheduleDto,
} from "../../services/defenseScheduleService";
import {
  councilService,
  type CouncilMemberDto,
} from "../../services/councilService";

// ─── Status helpers ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  PENDING: {
    label: "Pending",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    dot: "bg-yellow-500",
  },
  SCHEDULED: {
    label: "Scheduled",
    bg: "bg-blue-100",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  COMPLETED: {
    label: "Completed",
    bg: "bg-green-100",
    text: "text-green-700",
    dot: "bg-green-500",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-red-100",
    text: "text-red-600",
    dot: "bg-red-500",
  },
};

const getStatusCfg = (status: string | null) =>
  STATUS_CONFIG[status?.toUpperCase() ?? ""] ?? {
    label: status ?? "—",
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  };

// ─── Format helpers ────────────────────────────────────────────────────────────

const fmtDate = (d: string | null) => {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const fmtTime = (t: string | null) => {
  if (!t) return "—";
  // t is "HH:mm:ss"
  return t.substring(0, 5);
};

const isToday = (d: string | null) => {
  if (!d) return false;
  const today = new Date().toISOString().substring(0, 10);
  return d === today;
};

// ─── Component ─────────────────────────────────────────────────────────────────

const TeacherDefenseSchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<DefenseScheduleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchedule, setSelectedSchedule] =
    useState<DefenseScheduleDto | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await defenseScheduleService.getMySchedule();
        setSchedules(res.data ?? []);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ??
            "Failed to load schedule. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = schedules.filter(
    (s) =>
      searchQuery.trim() === "" ||
      s.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.councilName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.roomName ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f6f8] text-[#111318] font-display">
      <TeacherSidebar currentPath="/teacher/defense-schedule" />

      <main className="flex-1 overflow-y-auto bg-[#f6f6f8]">
        <TeacherHeader
          title="Defense Schedule"
          subtitle="Your assigned defense sessions in the current active semester."
        />

        <div className="p-8 max-w-[1200px] mx-auto space-y-6">
          {/* ── Search ── */}
          <div className="bg-white rounded-2xl border border-[#dbdfe6] shadow-sm p-5">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#616f89] text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search by group, council, room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#dbdfe6] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* ── Table / States ── */}
          <div className="bg-white rounded-2xl border border-[#dbdfe6] shadow-sm overflow-hidden">
            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState message={error} />
            ) : filtered.length === 0 ? (
              <EmptyState hasFilter={searchQuery !== ""} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#f8f9fa] border-b border-[#dbdfe6] text-[#616f89]">
                      <Th>Date / Time</Th>
                      <Th>Group</Th>
                      <Th>Council</Th>
                      <Th>Room / Location</Th>
                      <Th>Status</Th>
                      <Th align="right">Actions</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dbdfe6]">
                    {filtered.map((s) => {
                      const cfg = getStatusCfg(s.status);
                      const today = isToday(s.defenseDate);
                      return (
                        <tr
                          key={s.scheduleId}
                          className={`transition-colors hover:bg-[#f6f6f8] ${today ? "bg-blue-50/40" : ""}`}
                        >
                          {/* Date / Time */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {today && (
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                              )}
                              <div>
                                <p
                                  className={`font-semibold ${today ? "text-blue-600" : "text-[#111318]"}`}
                                >
                                  {fmtDate(s.defenseDate)}
                                  {today && (
                                    <span className="ml-2 text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
                                      TODAY
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-[#616f89] mt-0.5 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">
                                    schedule
                                  </span>
                                  {fmtTime(s.startTime)} – {fmtTime(s.endTime)}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Group */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-primary text-[14px]">
                                  groups
                                </span>
                              </div>
                              <span className="font-medium text-[#111318]">
                                {s.groupName}
                              </span>
                            </div>
                          </td>

                          {/* Council */}
                          <td className="px-6 py-4 text-[#616f89]">
                            {s.councilName || "—"}
                          </td>

                          {/* Room */}
                          <td className="px-6 py-4">
                            {s.roomName ? (
                              <div className="flex items-center gap-1.5 text-[#111318]">
                                <span className="material-symbols-outlined text-[16px] text-[#616f89]">
                                  meeting_room
                                </span>
                                <span>{s.roomName}</span>
                                {s.location && (
                                  <span className="text-xs text-[#616f89]">
                                    ({s.location})
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 italic">
                                Not assigned
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}
                            >
                              <span
                                className={`size-1.5 rounded-full ${cfg.dot}`}
                              />
                              {cfg.label}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => setSelectedSchedule(s)}
                                className="inline-flex items-center gap-1 text-[#616f89] text-xs font-semibold hover:text-[#111318] transition-colors"
                              >
                                View
                                <span className="material-symbols-outlined text-[14px]">
                                  chevron_right
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Footer */}
                <div className="px-6 py-3 bg-[#f8f9fa] border-t border-[#dbdfe6] text-xs text-[#616f89]">
                  Showing {filtered.length} of {schedules.length} sessions
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Detail Modal ── */}
      {selectedSchedule && (
        <DetailModal
          schedule={selectedSchedule}
          onClose={() => setSelectedSchedule(null)}
        />
      )}
    </div>
  );
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const Th: React.FC<{ children: React.ReactNode; align?: "left" | "right" }> = ({
  children,
  align = "left",
}) => (
  <th
    className={`px-6 py-3 text-xs font-bold uppercase tracking-wide ${
      align === "right" ? "text-right" : "text-left"
    }`}
  >
    {children}
  </th>
);

const LoadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#616f89]">
    <span className="material-symbols-outlined text-4xl animate-spin">
      progress_activity
    </span>
    <p className="text-sm font-medium">Loading schedule...</p>
  </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-500">
    <span className="material-symbols-outlined text-4xl">error</span>
    <p className="text-sm font-medium">{message}</p>
  </div>
);

const EmptyState: React.FC<{ hasFilter: boolean }> = ({ hasFilter }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#616f89]">
    <span className="material-symbols-outlined text-5xl text-[#dbdfe6]">
      event_busy
    </span>
    <p className="text-base font-bold text-[#111318]">
      {hasFilter ? "No matching sessions found" : "No defense sessions yet"}
    </p>
    <p className="text-sm text-center max-w-xs">
      {hasFilter
        ? "Try adjusting your filters or search keyword."
        : "You have not been assigned to any council or no sessions have been created."}
    </p>
  </div>
);

const DetailModal: React.FC<{
  schedule: DefenseScheduleDto;
  onClose: () => void;
}> = ({ schedule, onClose }) => {
  const cfg = getStatusCfg(schedule.status);
  const [members, setMembers] = useState<CouncilMemberDto[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);

  useEffect(() => {
    setMembersLoading(true);
    councilService
      .getCouncilById(schedule.councilId)
      .then((res) => setMembers(res.data?.members ?? []))
      .catch(() => setMembers([]))
      .finally(() => setMembersLoading(false));
  }, [schedule.councilId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#dbdfe6] flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[18px]">
                event
              </span>
            </div>
            <h3 className="text-base font-bold text-[#111318]">
              Session Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <DetailRow icon="groups" label="Group" value={schedule.groupName} />

          {/* Council name + members */}
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] text-[#616f89] shrink-0 mt-0.5">
              gavel
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#616f89]">Council</span>
                <span className="text-sm font-medium ml-4 text-right text-[#111318]">
                  {schedule.councilName}
                </span>
              </div>
              {/* Members list */}
              <div className="mt-2 border border-[#dbdfe6] rounded-xl overflow-hidden">
                {membersLoading ? (
                  <div className="flex items-center justify-center py-3 gap-2 text-[#616f89] text-xs">
                    <span className="material-symbols-outlined text-[16px] animate-spin">
                      progress_activity
                    </span>
                    Loading members...
                  </div>
                ) : members.length === 0 ? (
                  <p className="text-xs text-gray-400 italic text-center py-3">
                    No members found
                  </p>
                ) : (
                  <ul className="divide-y divide-[#dbdfe6]">
                    {members.map((m) => (
                      <li
                        key={m.userId}
                        className="flex items-center gap-2.5 px-3 py-2"
                      >
                        <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-primary text-[14px]">
                            person
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#111318] truncate">
                            {m.fullName}
                          </p>
                          <p className="text-[11px] text-[#616f89] truncate">
                            {m.email}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <DetailRow
            icon="calendar_month"
            label="Date"
            value={fmtDate(schedule.defenseDate)}
          />
          <DetailRow
            icon="schedule"
            label="Time"
            value={`${fmtTime(schedule.startTime)} – ${fmtTime(schedule.endTime)}`}
          />
          <DetailRow
            icon="meeting_room"
            label="Room"
            value={schedule.roomName ?? "Not assigned"}
            muted={!schedule.roomName}
          />
          {schedule.location && (
            <DetailRow
              icon="location_on"
              label="Location"
              value={schedule.location}
            />
          )}
          <div className="flex items-center gap-3 pt-1">
            <span className="material-symbols-outlined text-[20px] text-[#616f89] shrink-0">
              info
            </span>
            <div className="flex-1 flex justify-between items-center">
              <span className="text-sm text-[#616f89]">Status</span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}
              >
                <span className={`size-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#dbdfe6] bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-[#616f89] border border-[#dbdfe6] rounded-xl hover:bg-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailRow: React.FC<{
  icon: string;
  label: string;
  value: string;
  muted?: boolean;
}> = ({ icon, label, value, muted }) => (
  <div className="flex items-center gap-3">
    <span className="material-symbols-outlined text-[20px] text-[#616f89] shrink-0">
      {icon}
    </span>
    <div className="flex-1 flex justify-between items-center min-w-0">
      <span className="text-sm text-[#616f89]">{label}</span>
      <span
        className={`text-sm font-medium ml-4 text-right ${
          muted ? "text-gray-400 italic" : "text-[#111318]"
        }`}
      >
        {value}
      </span>
    </div>
  </div>
);

export default TeacherDefenseSchedulePage;
