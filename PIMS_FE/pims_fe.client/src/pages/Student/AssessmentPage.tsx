import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Trophy,
  Loader2,
  GraduationCap,
  Users,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ListChecks,
} from "lucide-react";
import { assessmentService } from "../../services/assessmentService";
import type {
  StudentMyAssessmentsDto,
  StudentAssessmentItemDto,
} from "../../types/assessment.types";

// ─── helpers ────────────────────────────────────────────────────────────────

function fmtDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function fmtTime(timeStr?: string) {
  if (!timeStr) return "—";
  return timeStr.slice(0, 5); // "HH:mm"
}

function fmtDefenseDate(dateStr?: string) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function deadlineStatus(
  deadline?: string,
): "overdue" | "soon" | "normal" | "none" {
  if (!deadline) return "none";
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff < 0) return "overdue";
  if (diff < 3 * 24 * 60 * 60 * 1000) return "soon";
  return "normal";
}

const DEFENSE_STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING: {
    label: "Pending Confirmation",
    color: "bg-yellow-100 text-yellow-700",
  },
  CONFIRMED: { label: "Confirmed", color: "bg-green-100 text-green-700" },
  DONE: { label: "Completed", color: "bg-blue-100 text-blue-700" },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700" },
};

// ─── ScoreBadge ─────────────────────────────────────────────────────────────

const ScoreBadge: React.FC<{ score?: number; isPassed?: boolean }> = ({
  score,
  isPassed,
}) => {
  if (score === undefined || score === null) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
        <AlertCircle size={12} /> No Score Yet
      </span>
    );
  }
  const passed = isPassed ?? score >= 5;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${
        passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      {passed ? <CheckCircle size={14} /> : <XCircle size={14} />}
      {score.toFixed(1)} / 10
    </span>
  );
};

// ─── DeadlineBadge ──────────────────────────────────────────────────────────

const DeadlineBadge: React.FC<{ deadline?: string }> = ({ deadline }) => {
  const status = deadlineStatus(deadline);
  if (status === "none")
    return <span className="text-gray-400 text-sm">No Deadline</span>;
  const styles = {
    overdue: "bg-red-50 text-red-600 border border-red-200",
    soon: "bg-orange-50 text-orange-600 border border-orange-200",
    normal: "bg-gray-50 text-gray-600 border border-gray-200",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${styles[status]}`}
    >
      <Calendar size={12} />
      {status === "overdue" ? "Overdue: " : "Deadline: "}
      {fmtDate(deadline)}
    </span>
  );
};

// ─── DefenseInfoCard ────────────────────────────────────────────────────────

const DefenseInfoCard: React.FC<{ item: StudentAssessmentItemDto }> = ({
  item,
}) => {
  const statusInfo = item.defenseStatus
    ? (DEFENSE_STATUS_LABEL[item.defenseStatus] ?? {
        label: item.defenseStatus,
        color: "bg-gray-100 text-gray-600",
      })
    : null;

  return (
    <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
      <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <GraduationCap size={14} /> Defense Schedule Information
      </p>

      {!item.defenseDate ? (
        <p className="text-gray-400 italic text-xs">
          Defense schedule has not been arranged. Please wait for notification
          from the Department Head.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar size={15} className="text-indigo-500 shrink-0" />
            <span>
              <span className="text-gray-500">Date: </span>
              <span className="font-semibold">
                {fmtDefenseDate(item.defenseDate)}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <Clock size={15} className="text-indigo-500 shrink-0" />
            <span>
              <span className="text-gray-500">Time: </span>
              <span className="font-semibold">
                {fmtTime(item.defenseStartTime)} –{" "}
                {fmtTime(item.defenseEndTime)}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <MapPin size={15} className="text-indigo-500 shrink-0" />
            {item.roomName ? (
              <span>
                <span className="text-gray-500">Room: </span>
                <span className="font-semibold">{item.roomName}</span>
                {item.roomLocation && (
                  <span className="text-gray-400"> — {item.roomLocation}</span>
                )}
              </span>
            ) : (
              <span className="text-gray-400 italic">Room not assigned</span>
            )}
          </div>

          {statusInfo && (
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusInfo.color}`}
              >
                {statusInfo.label}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── AssessmentCard ─────────────────────────────────────────────────────────

const AssessmentCard: React.FC<{
  item: StudentAssessmentItemDto;
  index: number;
}> = ({ item, index }) => {
  const [expanded, setExpanded] = useState(true);
  const dlStatus = deadlineStatus(item.deadline);

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm transition-all ${
        item.isFinal ? "border-indigo-200" : "border-gray-100"
      }`}
    >
      {/* ── Card header (always visible) ── */}
      <button
        className="w-full flex items-center justify-between p-5 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Number badge */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              item.isFinal
                ? "bg-indigo-100 text-indigo-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {index + 1}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-gray-900 text-base">
                {item.title}
              </span>
              {item.isFinal && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                  <Trophy size={11} /> FINAL
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                Weight: {item.weight}%
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <DeadlineBadge deadline={item.deadline} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-3 shrink-0">
          <ScoreBadge score={item.score} isPassed={item.isPassed} />
          {expanded ? (
            <ChevronUp size={18} className="text-gray-400" />
          ) : (
            <ChevronDown size={18} className="text-gray-400" />
          )}
        </div>
      </button>

      {/* ── Expanded body ── */}
      {expanded && (
        <div className="px-5 pb-5">
          <div className="border-t border-gray-100 pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Start Date</p>
                <p className="font-semibold text-gray-800">
                  {fmtDate(item.startDate)}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Deadline</p>
                <p
                  className={`font-semibold ${
                    dlStatus === "overdue"
                      ? "text-red-600"
                      : dlStatus === "soon"
                        ? "text-orange-600"
                        : "text-gray-800"
                  }`}
                >
                  {fmtDate(item.deadline)}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Score</p>
                <p className="font-semibold text-gray-800">
                  {item.score !== undefined && item.score !== null
                    ? item.score.toFixed(1)
                    : "—"}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Result</p>
                <p
                  className={`font-semibold ${
                    item.score === undefined || item.score === null
                      ? "text-gray-400"
                      : item.isPassed
                        ? "text-green-600"
                        : "text-red-600"
                  }`}
                >
                  {item.score === undefined || item.score === null
                    ? "N/A"
                    : item.isPassed
                      ? "Passed"
                      : "Failed"}
                </p>
              </div>
            </div>

            {/* Defense info – chỉ hiện với final assessment */}
            {item.description && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <BookOpen size={13} /> Description
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {item.description}
                </p>
              </div>
            )}

            {/* Assessment Criteria */}
            {item.criteria && item.criteria.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-xl">
                <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ListChecks size={13} /> Assessment Criteria
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-green-200">
                        <th className="text-left pb-2 pr-4 text-xs font-semibold text-green-700 uppercase tracking-wide">
                          #
                        </th>
                        <th className="text-left pb-2 pr-4 text-xs font-semibold text-green-700 uppercase tracking-wide">
                          Criteria Name
                        </th>
                        <th className="text-right pb-2 text-xs font-semibold text-green-700 uppercase tracking-wide">
                          Weight
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.criteria.map((c, ci) => (
                        <tr
                          key={c.criteriaId}
                          className={`border-b border-green-100 last:border-0 ${
                            ci % 2 === 0 ? "bg-white/50" : ""
                          }`}
                        >
                          <td className="py-2 pr-4 text-gray-400 text-xs w-6">
                            {ci + 1}
                          </td>
                          <td className="py-2 pr-4 text-gray-700 font-medium">
                            {c.criteriaName}
                          </td>
                          <td className="py-2 text-right">
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                              {c.weight}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td
                          colSpan={2}
                          className="pt-2 text-xs text-gray-400 font-semibold"
                        >
                          Total
                        </td>
                        <td className="pt-2 text-right">
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-green-200 text-green-800">
                            {item.criteria.reduce((s, c) => s + c.weight, 0)}%
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {item.teacherComment && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MessageSquare size={13} /> Teacher Comment
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {item.teacherComment}
                </p>
              </div>
            )}

            {item.isFinal && <DefenseInfoCard item={item} />}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────

const AssessmentPage: React.FC = () => {
  const [data, setData] = useState<StudentMyAssessmentsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    assessmentService
      .getMyAssessments()
      .then((res) => {
        if (res.success) setData(res.data);
        else setError(res.message || "Failed to load data.");
      })
      .catch(() => setError("Unable to connect to server."))
      .finally(() => setLoading(false));
  }, []);

  // ── Loading ──────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
        <Loader2 size={36} className="animate-spin text-primary" />
        <span>Loading assessment information...</span>
      </div>
    );
  }

  // ── Error ────────────────────────────────
  if (error) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-red-100">
        <XCircle size={40} className="text-red-400 mx-auto mb-3" />
        <p className="text-gray-700 font-semibold text-lg mb-1">
          Failed to Load Data
        </p>
        <p className="text-gray-400 text-sm">{error}</p>
      </div>
    );
  }

  // ── No group ─────────────────────────────
  if (!data) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
        <Users size={40} className="text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-lg">
          You are not in any group for the current semester.
        </p>
      </div>
    );
  }

  // Lấy kết quả điểm từ backend
  const totalScore = data.totalScore;
  const isTotalPassed = data.isPassed;

  const gradedCount = data.assessments.filter(
    (a) => a.score !== undefined && a.score !== null,
  ).length;
  const totalCount = data.assessments.length;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Project + Group info ────────────────── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <BookOpen size={22} className="text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900">
                  {data.projectTitle ?? "No Project Title"}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                  {data.semesterName}
                </span>
              </div>
              {data.projectDescription && (
                <p className="text-gray-500 text-sm mt-1 max-w-2xl">
                  {data.projectDescription}
                </p>
              )}
              <div className="flex items-center gap-1.5 mt-2 text-gray-500 text-sm">
                <Users size={14} />
                <span>{data.groupName}</span>
              </div>
            </div>
          </div>

          {/* Điểm tích lũy + kết quả tổng */}
          <div
            className={`rounded-2xl px-6 py-4 text-center min-w-[180px] border ${
              isTotalPassed === false
                ? "bg-gradient-to-br from-red-50 to-rose-50 border-red-200"
                : isTotalPassed === true
                  ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                  : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
            }`}
          >
            <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">
              Accumulated Score
            </p>
            <p
              className={`text-3xl font-extrabold ${
                isTotalPassed === false
                  ? "text-red-600"
                  : isTotalPassed === true
                    ? "text-green-600"
                    : "text-primary"
              }`}
            >
              {totalScore !== undefined && totalScore !== null ? totalScore.toFixed(2) : "--"}
            </p>
            <div className="mt-2">
              {totalScore === undefined || totalScore === null ? null : isTotalPassed === true ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  <CheckCircle size={12} /> PASS
                </span>
              ) : isTotalPassed === false ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                  <XCircle size={12} /> FAIL
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                  In Progress
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {gradedCount}/{totalCount} assessments graded
            </p>
          </div>
        </div>
      </div>

      {/* ── Progress bar ─────────────────────────── */}
      {totalCount > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">Grading Progress</span>
            <span className="text-primary font-bold">
              {gradedCount}/{totalCount}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${(gradedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Assessment list ───────────────────────── */}
      <div>
        <h3 className="font-bold text-gray-800 text-base mb-3 flex items-center gap-2">
          <Trophy size={18} className="text-yellow-500" />
          Assessment List ({totalCount})
        </h3>

        {totalCount === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 text-gray-400">
            No assessments found for this semester.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {data.assessments.map((item, idx) => (
              <AssessmentCard key={item.assessmentId} item={item} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentPage;
