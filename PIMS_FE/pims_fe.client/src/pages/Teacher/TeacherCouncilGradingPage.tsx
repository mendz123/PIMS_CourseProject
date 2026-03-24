import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import { assessmentService } from "../../services/assessmentService";
import { councilService, type CouncilDto } from "../../services/councilService";
import { defenseScheduleService, type DefenseScheduleDto } from "../../services/defenseScheduleService";
import { groupService } from "../../services/groupService";
import type {
    AssessmentWithCriteriaDto,
    CouncilStudentScoreDto
} from "../../types/assessment.types";
import type { GroupMemberDto } from "../../types/group.types";
import { toast } from "react-hot-toast";

const TeacherCouncilGradingPage: React.FC = () => {
    const { councilId } = useParams<{ councilId: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [council, setCouncil] = useState<CouncilDto | null>(null);
    const [schedules, setSchedules] = useState<DefenseScheduleDto[]>([]);
    const [assessments, setAssessments] = useState<AssessmentWithCriteriaDto[]>([]);
    const [passedUserIds, setPassedUserIds] = useState<number[]>([]);
    const [myCouncils, setMyCouncils] = useState<{ id: number; name: string }[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
    const [groupMembers, setGroupMembers] = useState<GroupMemberDto[]>([]);
    const [allSchedules, setAllSchedules] = useState<DefenseScheduleDto[]>([]);
    const [studentScores, setStudentScores] = useState<Record<number, Record<number, Record<number, number>>>>({});

    const fetchCouncilDetails = useCallback(async () => {
        setLoading(true);
        try {
            const mySchedulesRes = await defenseScheduleService.getMySchedule();
            const mySchedules = mySchedulesRes.data ?? [];
            const councilsFound = Array.from(
                new Map(mySchedules.map(s => [s.councilId, s.councilName])).entries()
            ).map(([id, name]) => ({ id, name }));
            setMyCouncils(councilsFound);

            let targetCouncilId: number | null = councilId ? parseInt(councilId) : null;
            if (!targetCouncilId && councilsFound.length > 0) {
                targetCouncilId = councilsFound[0].id;
            }

            if (!targetCouncilId) {
                setLoading(false);
                return;
            }

            const councilRes = await councilService.getCouncilById(targetCouncilId);
            setCouncil(councilRes.data);

            const allSchedulesRes = await defenseScheduleService.getAll(councilRes.data.semesterId);
            const allSemesterSchedules = allSchedulesRes.data ?? [];
            setAllSchedules(allSemesterSchedules);

            const councilSchedules = allSemesterSchedules.filter(s => s.councilId === targetCouncilId);
            setSchedules(councilSchedules);

            if (councilRes.data) {
                const assessmentsRes = await assessmentService.getAssessmentsWithCriteria(councilRes.data.semesterId);
                const finalAssessments = (assessmentsRes.data ?? []).filter(a => a.isFinal).sort((a, b) => a.assessmentId - b.assessmentId);
                setAssessments(finalAssessments);
            }

            if (councilSchedules.length > 0) {
                const dates = Array.from(new Set(councilSchedules.map(s => s.defenseDate?.toString()).filter(Boolean))) as string[];
                dates.sort();
                if (dates.length > 0) {
                    setSelectedDate(dates[0]);
                    const firstGroup = councilSchedules.find(s => s.defenseDate?.toString() === dates[0]);
                    if (firstGroup) setSelectedGroupId(firstGroup.groupId);
                } else {
                    setSelectedDate(null);
                    setSelectedGroupId(null);
                }
            } else {
                setSelectedDate(null);
                setSelectedGroupId(null);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Could not load council data.");
        } finally {
            setLoading(false);
        }
    }, [councilId]);

    useEffect(() => {
        fetchCouncilDetails();
    }, [fetchCouncilDetails]);

    useEffect(() => {
        const fetchGroupData = async () => {
            if (!selectedGroupId || assessments.length === 0 || !council) {
                setGroupMembers([]);
                return;
            }
            try {
                const [detailRes, passedRes] = await Promise.all([
                    groupService.getGroupDetail(selectedGroupId),
                    assessmentService.getUsersPassedFinal(selectedGroupId)
                ]);

                const members = detailRes.data?.members ?? [];
                setGroupMembers(members);
                setPassedUserIds(passedRes.data || []);

                const groupScheds = allSchedules
                    .filter(s => s.groupId === selectedGroupId)
                    .sort((a, b) => new Date(a.defenseDate || "").getTime() - new Date(b.defenseDate || "").getTime());

                let existingScoresMap: Record<number, Record<number, Record<number, number>>> = {};
                const gradePromises = groupScheds.map(async (sched) => {
                    existingScoresMap[sched.councilId] = {};
                    try {
                        const res = await assessmentService.getCouncilGrades(sched.councilId, selectedGroupId);
                        (res.data ?? []).forEach((g: any) => {
                            const uId = g.userId ?? g.UserId;
                            const crId = g.criteriaId ?? g.CriteriaId;
                            if (uId !== undefined && crId !== undefined) {
                                if (!existingScoresMap[sched.councilId][uId]) existingScoresMap[sched.councilId][uId] = {};
                                existingScoresMap[sched.councilId][uId][crId] = g.score ?? g.Score ?? 0;
                            }
                        });
                    } catch (e) { console.error("Grade fetch failed", e); }
                });

                await Promise.all(gradePromises);

                const initialScores: Record<number, Record<number, Record<number, number>>> = {};
                const assConfig = assessments[0]; 
                if (assConfig) {
                    groupScheds.forEach(sched => {
                        initialScores[sched.councilId] = {};
                        members.forEach(m => {
                            initialScores[sched.councilId][m.userId] = {};
                            assConfig.criteria.forEach(c => {
                                initialScores[sched.councilId][m.userId][c.criteriaId] = existingScoresMap[sched.councilId]?.[m.userId]?.[c.criteriaId] ?? 0;
                            });
                        });
                    });
                }
                setStudentScores(initialScores);
            } catch (error) { toast.error("Could not load group members."); }
        };
        fetchGroupData();
    }, [selectedGroupId, assessments, council, allSchedules]);

    const handleScoreChange = (cId: number, uId: number, critId: number, val: string) => {
        const score = parseFloat(val);
        if (isNaN(score)) return;
        const clamped = Math.min(10, Math.max(0, score));
        setStudentScores(prev => ({
            ...prev, [cId]: { ...prev[cId], [uId]: { ...prev[cId]?.[uId], [critId]: clamped } }
        }));
    };

    const isExpired = (defenseDate: string | Date | undefined | null) => {
        if (!defenseDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dDate = new Date(defenseDate);
        dDate.setHours(0, 0, 0, 0);
        return today.getTime() > dDate.getTime();
    };

    const calculateStudentTotal = (cId: number, uId: number) => {
        const assessment = assessments[0];
        if (!assessment) return 0;
        const scores = studentScores[cId]?.[uId] || {};
        return assessment.criteria.reduce((acc: number, c: any) => acc + ((scores[c.criteriaId] || 0) * (c.weight / 100)), 0);
    };

    const handleSubmit = async (isRetake: boolean) => {
        const assessment = assessments[0];
        if (!council || !selectedGroupId || !assessment) return;
        setSubmitting(true);
        try {
            const studentScoresDto: CouncilStudentScoreDto[] = Object.entries(studentScores[council.councilId] || {})
                .filter(([uIdStr]) => {
                    const uId = parseInt(uIdStr);
                    return groupMembers.some(m => m.userId === uId) && !(isRetake && passedUserIds.includes(uId));
                })
                .map(([uIdStr, criteriaScores]) => ({ userId: parseInt(uIdStr), criteriaScores }));

            await assessmentService.saveCouncilGrades({
                councilId: council.councilId,
                groupId: selectedGroupId,
                assessmentId: assessment.assessmentId,
                studentScores: studentScoresDto
            });
            toast.success("Grades saved successfully!");
            await fetchCouncilDetails();
        } catch (error: any) { toast.error("Error saving grades."); }
        finally { setSubmitting(false); }
    };

    const availableDates = Array.from(new Set(schedules.map(s => s.defenseDate?.toString()).filter(Boolean))) as string[];
    availableDates.sort();

    const filteredSchedules = selectedDate ? schedules.filter(s => s.defenseDate?.toString() === selectedDate) : schedules;
    const groupSchedules = allSchedules.filter(s => s.groupId === selectedGroupId).sort((a, b) => new Date(a.defenseDate || "").getTime() - new Date(b.defenseDate || "").getTime());
    const currentSchedule = schedules.find(s => s.groupId === selectedGroupId);

    return (
        <div className="flex h-screen overflow-hidden bg-[#f6f6f8] text-[#111318]">
            <TeacherSidebar currentPath="/teacher/council-grading" />
            <main className="flex-1 overflow-y-auto">
                <TeacherHeader 
                    title={council?.councilName || "Council Grading"}
                    subtitle={`Semester: ${council?.semesterName || "..."} - Evaluate project defense results for student groups.`}
                />
                <div className="p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-white rounded-3xl border border-[#dbdfe6] shadow-sm">
                            <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p className="text-sm font-medium text-gray-500">Loading information...</p>
                        </div>
                    ) : !council ? (
                        <div className="max-w-md w-full mx-auto bg-white rounded-3xl border border-[#dbdfe6] p-10 text-center space-y-6 shadow-sm">
                            <div className="size-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto text-primary"><span className="material-symbols-outlined text-4xl">gavel</span></div>
                            <h2 className="text-xl font-bold text-gray-900">No council found</h2>
                            <p className="text-sm text-gray-500">You are not assigned to any defense council this semester.</p>
                        </div>
                    ) : (
                        <div className="max-w-[1700px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
                            {/* LEFT SIDEBAR */}
                            <div className="xl:col-span-3 space-y-6">
                                <div className="bg-white rounded-3xl border border-[#dbdfe6] p-6 shadow-sm">
                                    <h3 className="text-xs font-bold uppercase text-[#616f89] mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">meeting_room</span>Council Information</h3>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                            <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Room & Date</p>
                                            <p className="text-sm font-bold text-gray-800">{currentSchedule?.roomName || "No Room"}</p>
                                            {currentSchedule?.defenseDate && <p className="text-[11px] text-primary/60 mt-1 font-medium">{new Date(currentSchedule.defenseDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-[#616f89] uppercase tracking-wider mb-2">Members</p>
                                            <div className="space-y-2">
                                                {council.members.map(m => (
                                                    <div key={m.userId} className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                                                        <div className="size-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-[10px]">{m.fullName.charAt(0)}</div>
                                                        <div className="overflow-hidden"><p className="text-xs font-bold text-gray-800 truncate">{m.fullName}</p><p className="text-[9px] text-gray-400 truncate">{m.email}</p></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {myCouncils.length > 1 && (
                                    <div className="bg-white rounded-3xl border border-[#dbdfe6] p-4 shadow-sm">
                                        <p className="text-[10px] font-bold text-[#616f89] uppercase tracking-wider mb-3 px-2">Switch Council</p>
                                        <select value={council.councilId} onChange={(e) => navigate(`/teacher/council-grading/${e.target.value}`)} className="w-full h-10 px-3 bg-gray-50 border border-[#dbdfe6] rounded-xl text-xs font-bold outline-none focus:border-primary">
                                            {myCouncils.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                {availableDates.length > 1 && (
                                    <div className="bg-white rounded-3xl border border-[#dbdfe6] p-4 shadow-sm">
                                        <p className="text-[10px] font-bold text-[#616f89] uppercase tracking-wider mb-3 px-2">Defense Dates</p>
                                        <div className="flex flex-wrap gap-2 px-1">
                                            {availableDates.map(d => (
                                                <button key={d} onClick={() => { setSelectedDate(d); const f = schedules.find(sx => sx.defenseDate?.toString() === d); if (f) setSelectedGroupId(f.groupId); }} className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all ${selectedDate === d ? 'bg-primary text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                                                    {new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="bg-white rounded-3xl border border-[#dbdfe6] overflow-hidden shadow-sm">
                                    <div className="p-6 border-b border-[#dbdfe6] flex justify-between items-center">
                                        <h3 className="text-xs font-bold uppercase text-[#616f89] flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">groups</span>Group List</h3>
                                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-lg text-[10px] font-bold">{filteredSchedules.length}</span>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto">
                                        {filteredSchedules.map(s => (
                                            <button key={s.groupId} onClick={() => setSelectedGroupId(s.groupId)} className={`w-full p-4 flex items-center justify-between border-l-4 transition-all ${selectedGroupId === s.groupId ? 'bg-primary/5 border-primary' : 'border-transparent hover:bg-gray-50'}`}>
                                                <div className="text-left">
                                                    <p className={`text-sm font-bold ${selectedGroupId === s.groupId ? 'text-primary' : 'text-gray-700'}`}>{s.groupName}</p>
                                                    <p className="text-[9px] text-gray-400 mt-1 uppercase flex items-center gap-1 font-medium">
                                                        <span className="material-symbols-outlined text-[12px]">calendar_month</span>
                                                        {s.defenseDate ? new Date(s.defenseDate).toLocaleDateString('en-US', { day: 'numeric', month: '2-digit' }) : "---"}
                                                        <span className="text-gray-200 mx-1">|</span>
                                                        {s.startTime?.substring(0, 5)} - {s.endTime?.substring(0, 5)}
                                                    </p>
                                                </div>
                                                {s.status?.toUpperCase() === 'COMPLETED' ? <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span> : <span className="size-2 rounded-full bg-amber-400" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* MAIN PANEL */}
                            <div className="xl:col-span-9 space-y-6">
                                {!selectedGroupId ? (
                                    <div className="flex flex-col items-center justify-center min-h-[600px] bg-white rounded-3xl border-2 border-dashed border-[#dbdfe6] text-center p-12">
                                        <div className="size-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6"><span className="material-symbols-outlined text-6xl">person_search</span></div>
                                        <h3 className="text-2xl font-black text-gray-900 mb-2">No Groups Selected</h3>
                                        <p className="text-gray-500 max-w-sm">Pick a group from the list to start evaluating performance results.</p>
                                    </div>
                                ) : (
                                    <>
                                        {currentSchedule?.status?.toUpperCase() === 'COMPLETED' && (
                                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 text-emerald-800"><span className="material-symbols-outlined text-emerald-500">verified</span><p className="text-sm font-medium">Grading for this group is completed. You can still modify scores if needed.</p></div>
                                        )}
                                        <div className="bg-white rounded-3xl border border-[#dbdfe6] p-8 shadow-sm space-y-10 min-h-[600px]">
                                            <div className="flex flex-col md:flex-row justify-between gap-6 border-b border-[#dbdfe6] pb-8">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h2 className="text-2xl font-black text-gray-900">{currentSchedule?.groupName}</h2>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${currentSchedule?.status?.toUpperCase() === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{currentSchedule?.status || "PENDING"}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[18px] text-primary">info</span>
                                                        Evaluate performance. Scores are averaged among council members.
                                                    </p>
                                                </div>
                                                <div className="flex flex-col gap-3 min-w-[240px]">
                                                    {groupSchedules.map((sched, idx) => {
                                                        if (sched.councilId !== council.councilId) return null;
                                                        const isRetake = idx > 0;
                                                        const expired = isExpired(sched.defenseDate);
                                                        return (
                                                            <button key={`save-${sched.scheduleId}`} onClick={() => handleSubmit(isRetake)} disabled={submitting || expired} className="w-full px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer">
                                                                {submitting ? <span className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-outlined text-[18px]">save</span>}
                                                                {submitting ? "Saving..." : (isRetake ? "Save Attempt 2 (Retake)" : "Save Attempt 1 (Final)")}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {assessments.length === 0 ? (
                                                <div className="p-12 bg-amber-50 rounded-2xl border border-amber-100 text-center text-amber-800"><span className="material-symbols-outlined text-4xl mb-4">warning</span><h3 className="text-lg font-bold">Criteria Not Found</h3><p className="text-sm">No grading criteria for Final assessments was found.</p></div>
                                            ) : (
                                                <div className="space-y-12">
                                                    {groupMembers.map(member => (
                                                        <div key={member.userId} className="p-1 rounded-[2.5rem] hover:bg-primary/5 transition-all group">
                                                            <div className="bg-white border border-[#dbdfe6] rounded-[2.3rem] overflow-hidden shadow-sm group-hover:border-primary/20 transition-all">
                                                                <div className="px-6 py-5 bg-gray-50/50 border-b border-[#dbdfe6] flex items-center gap-4">
                                                                    <div className="size-12 rounded-2xl bg-white border border-[#dbdfe6] shadow-sm flex items-center justify-center font-black text-gray-400 group-hover:text-primary transition-colors">{member.fullName.charAt(0)}</div>
                                                                    <div><h4 className="font-bold text-gray-900">{member.fullName}</h4><p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{member.email}</p></div>
                                                                </div>
                                                                <div className="p-8 space-y-8">
                                                                    {groupSchedules.map((sched, idx) => {
                                                                        const isRetake = idx > 0;
                                                                        const isPassedL1 = passedUserIds.includes(member.userId);
                                                                        const isMyCouncil = sched.councilId === council.councilId;
                                                                        const expired = isExpired(sched.defenseDate);
                                                                        const isLocked = !isMyCouncil || (isRetake && isPassedL1) || expired;
                                                                        return (
                                                                            <div key={`box-${sched.scheduleId}`} className={`p-6 rounded-3xl border ${isLocked ? (expired ? 'bg-rose-50/30 border-rose-100' : 'bg-emerald-50/30 border-emerald-100') : 'bg-gray-50/30 border-[#dbdfe6]'}`}>
                                                                                <div className="flex justify-between items-start mb-6">
                                                                                    <div className="space-y-2">
                                                                                        <h5 className="font-black text-gray-800 text-xs uppercase tracking-widest flex items-center gap-2"><span className="material-symbols-outlined text-primary text-lg">history_edu</span>{isRetake ? "FINAL (ATTEMPT 2 - RETAKE)" : "FINAL (ATTEMPT 1)"}</h5>
                                                                                        <div className="flex gap-2">
                                                                                            {isRetake && isPassedL1 && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded-lg uppercase">Passed Attempt 1</span>}
                                                                                            {expired && <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[9px] font-black rounded-lg uppercase">Deadline Passed</span>}
                                                                                            {!isMyCouncil && !expired && <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[9px] font-black rounded-lg uppercase">View Only</span>}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="text-right">
                                                                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
                                                                                        <p className={`text-2xl font-black ${calculateStudentTotal(sched.councilId, member.userId) < 4 ? 'text-rose-500' : 'text-primary'}`}>{calculateStudentTotal(sched.councilId, member.userId).toFixed(2)}</p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                                                                                    {assessments[0].criteria.map((crit: any) => (
                                                                                        <div key={crit.criteriaId} className="space-y-2 text-left">
                                                                                            <label className="text-[10px] font-bold text-gray-500 block truncate" title={crit.criteriaName}>{crit.criteriaName} ({crit.weight}%)</label>
                                                                                            <input type="number" step="0.1" min="0" max="10" disabled={isLocked} value={studentScores[sched.councilId]?.[member.userId]?.[crit.criteriaId] ?? ""} onChange={(e) => handleScoreChange(sched.councilId, member.userId, crit.criteriaId, e.target.value)} className={`w-full h-11 px-4 bg-white border border-[#dbdfe6] rounded-xl font-bold text-gray-900 outline-none transition-all ${isLocked ? 'bg-gray-100/50 cursor-not-allowed text-gray-400' : 'focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-primary/40 shadow-sm'}`} placeholder="0.0" />
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TeacherCouncilGradingPage;
