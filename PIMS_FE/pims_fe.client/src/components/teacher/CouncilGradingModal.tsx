import React, { useEffect, useState } from "react";
import { assessmentService } from "../../services/assessmentService";
import { groupService } from "../../services/groupService";
import type {
  AssessmentWithCriteriaDto,
  CouncilStudentScoreDto,
  SaveCouncilGradesDto,
} from "../../types/assessment.types";
import type { GroupMemberDto } from "../../types/group.types";
import type { DefenseScheduleDto } from "../../services/defenseScheduleService";
import { toast } from "react-hot-toast";

interface CouncilGradingModalProps {
  schedule: DefenseScheduleDto;
  onClose: () => void;
  onSuccess: () => void;
}

const CouncilGradingModal: React.FC<CouncilGradingModalProps> = ({
  schedule,
  onClose,
  onSuccess,
}) => {
  const [assessments, setAssessments] = useState<AssessmentWithCriteriaDto[]>([]);
  const [assessment, setAssessment] = useState<AssessmentWithCriteriaDto | null>(null);
  const [passedUserIds, setPassedUserIds] = useState<number[]>([]);
  const [members, setMembers] = useState<GroupMemberDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // local state for scores: { userId: { criteriaId: score } }
  const [studentScores, setStudentScores] = useState<
    Record<number, Record<number, number>>
  >({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Get Group Details to get members
        const groupRes = await groupService.getGroupDetail(schedule.groupId);
        const groupMembers = groupRes.data?.members ?? [];
        setMembers(groupMembers);

        // 2. Find the Final Assessments for this semester
        const semesterId = groupRes.data?.semesterId;
        if (semesterId) {
          const assessmentsRes = await assessmentService.getAssessmentsWithCriteria(
            semesterId,
          );
          const finalAssessments = assessmentsRes.data?.filter((a) => a.isFinal) || [];
          setAssessments(finalAssessments);
          if (finalAssessments.length > 0) {
            setAssessment(finalAssessments[0]);
          } else {
            toast.error("No final assessments found for this semester.");
          }
        }

        // 3. Fetch users who passed a final assessment previously
        const passedRes = await assessmentService.getUsersPassedFinal(schedule.groupId);
        setPassedUserIds(passedRes.data || []);
      } catch (error) {
        console.error("Error fetching grading data:", error);
        toast.error("Failed to load grading information.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [schedule.groupId]);

  useEffect(() => {
    if (assessment && members.length > 0) {
      const initialScores: Record<number, Record<number, number>> = {};
      members.forEach((m) => {
        initialScores[m.userId] = {};
        assessment.criteria.forEach((c) => {
          initialScores[m.userId][c.criteriaId] = 0;
        });
      });
      setStudentScores(initialScores);
    }
  }, [assessment, members]);

  const handleScoreChange = (
    userId: number,
    criteriaId: number,
    value: string,
  ) => {
    const score = parseFloat(value);
    if (isNaN(score)) return;

    // Constrain score between 0 and 10
    const clampedScore = Math.min(10, Math.max(0, score));

    setStudentScores((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [criteriaId]: clampedScore,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!assessment) return;

    setSubmitting(true);
    try {
      const studentScoresDto: CouncilStudentScoreDto[] = Object.entries(studentScores)
        .filter(([userIdStr]) => !passedUserIds.includes(parseInt(userIdStr)))
        .map(([userIdStr, criteriaScores]) => ({
          userId: parseInt(userIdStr),
          criteriaScores: criteriaScores,
        }));

      const payload: SaveCouncilGradesDto = {
        councilId: schedule.councilId,
        groupId: schedule.groupId,
        assessmentId: assessment.assessmentId,
        studentScores: studentScoresDto,
      };

      await assessmentService.saveCouncilGrades(payload);
      toast.success("Grades submitted successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error submitting grades:", error);
      toast.error(
        error?.response?.data?.message ?? "Failed to submit grades. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-10 flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-medium text-[#616f89]">
            Preparing grading session...
          </p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center space-y-4">
          <span className="material-symbols-outlined text-red-500 text-5xl">
            warning
          </span>
          <h3 className="text-lg font-bold">Configuration Error</h3>
          <p className="text-sm text-[#616f89]">
            No final assessment found for this semester. Please contact the administrator.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-8 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-5 border-b border-[#dbdfe6] flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10 rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-[20px]">
                gavel
              </span>
              <h3 className="text-lg font-bold text-[#111318]">
                Council Defense Grading
              </h3>
            </div>
            <p className="text-xs text-[#616f89]">
              Grading for Group: <span className="font-bold text-primary">{schedule.groupName}</span> | Session: {schedule.councilName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto space-y-10">
            {/* Criteria Info */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-blue-500 mt-0.5">info</span>
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                            <p className="text-sm font-semibold text-blue-900">Grading Assessment:</p>
                            <select 
                                value={assessment.assessmentId} 
                                onChange={(e) => {
                                    const selected = assessments.find(a => a.assessmentId === Number(e.target.value));
                                    if (selected) setAssessment(selected);
                                }}
                                className="px-3 py-1.5 text-sm rounded-lg border border-blue-200 focus:border-blue-500 outline-none shadow-sm bg-white text-blue-900 font-medium min-w-[200px]"
                            >
                                {assessments.map(a => (
                                    <option key={a.assessmentId} value={a.assessmentId}>{a.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {assessment.criteria.map(c => (
                            <span key={c.criteriaId} className="px-2 py-1 bg-white border border-blue-200 rounded-lg text-[11px] font-medium text-blue-700">
                                {c.criteriaName} ({c.weight}%)
                            </span>
                        ))}
                    </div>
                    <p className="text-[11px] text-blue-600 italic">Please enter scores from 0 to 10 for each criterion. Students who have 'Passed' previously are locked and cannot be graded.</p>
                </div>
                </div>
            </div>

          {members.map((member) => (
            <div key={member.userId} className="border border-[#dbdfe6] rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-black/5">
              <div className="px-6 py-4 bg-[#f8f9fa] border-b border-[#dbdfe6] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {member.fullName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111318] flex items-center gap-2">
                        {member.fullName}
                        {passedUserIds.includes(member.userId) && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-md border border-green-200 uppercase tracking-wide">
                                Passed Lần 1
                            </span>
                        )}
                    </h4>
                    <p className="text-[11px] text-[#616f89]">{member.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assessment.criteria.map((criteria) => (
                    <div key={criteria.criteriaId} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-[#616f89]">
                          {criteria.criteriaName}
                        </label>
                        <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-bold">
                          {criteria.weight}%
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          disabled={passedUserIds.includes(member.userId)}
                          value={studentScores[member.userId]?.[criteria.criteriaId] ?? ""}
                          onChange={(e) =>
                            handleScoreChange(
                              member.userId,
                              criteria.criteriaId,
                              e.target.value,
                            )
                          }
                          className={`w-full px-4 py-2 text-sm font-bold border border-[#dbdfe6] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${passedUserIds.includes(member.userId) ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
                          placeholder="0.0"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
                          / 10
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-[#dbdfe6] bg-gray-50 flex items-center justify-between sticky bottom-0 z-10 rounded-b-2xl">
          <div className="text-xs text-[#616f89] flex items-center gap-2">
            <span className="size-2 rounded-full bg-yellow-400 animate-pulse" />
            Once submitted, you can still update your scores until other members finish grading.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-2.5 text-sm font-bold text-[#616f89] border border-[#dbdfe6] rounded-xl hover:bg-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-2.5 text-sm font-bold text-white bg-primary rounded-xl shadow-lg ring-offset-2 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    progress_activity
                  </span>
                  Submitting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">
                    check_circle
                  </span>
                  Submit Final Grades
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouncilGradingModal;
