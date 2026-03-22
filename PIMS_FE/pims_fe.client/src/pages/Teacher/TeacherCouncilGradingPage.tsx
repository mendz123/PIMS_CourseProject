import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import { assessmentService } from "../../services/assessmentService";
import { councilService, type CouncilDto } from "../../services/councilService";
import { defenseScheduleService, type DefenseScheduleDto } from "../../services/defenseScheduleService";
import { groupService } from "../../services/groupService";
import type { 
  AssessmentWithCriteriaDto, 
  CouncilStudentScoreDto, 
  SaveCouncilGradesDto 
} from "../../types/assessment.types";
import type { GroupMemberDto } from "../../types/group.types";
import { toast } from "react-hot-toast";

const TeacherCouncilGradingPage: React.FC = () => {
    const { councilId } = useParams<{ councilId: string }>();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [council, setCouncil] = useState<CouncilDto | null>(null);
    const [schedules, setSchedules] = useState<DefenseScheduleDto[]>([]);
    const [assessment, setAssessment] = useState<AssessmentWithCriteriaDto | null>(null);
    const [assessments, setAssessments] = useState<AssessmentWithCriteriaDto[]>([]);
    const [passedUserIds, setPassedUserIds] = useState<number[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
    const [groupMembers, setGroupMembers] = useState<GroupMemberDto[]>([]);
    const [studentScores, setStudentScores] = useState<Record<number, Record<number, number>>>({});

    const fetchCouncilDetails = useCallback(async () => {
        setLoading(true);
        try {
            let id: number | null = councilId ? parseInt(councilId) : null;

            // 1. If no ID, try to find the teacher's active councils
            if (!id) {
                const mySchedulesRes = await defenseScheduleService.getMySchedule();
                const mySchedules = mySchedulesRes.data ?? [];
                
                if (mySchedules.length > 0) {
                    const councilIds = Array.from(new Set(mySchedules.map(s => s.councilId)));
                    id = councilIds[0];
                } else {
                    setLoading(false);
                    return;
                }
            }

            if (!id) {
                 setLoading(false);
                 return;
            }

            // 2. Fetch Council Info
            const councilRes = await councilService.getCouncilById(id);
            setCouncil(councilRes.data);

            // 3. Fetch Schedules for this council
            const schedulesRes = await defenseScheduleService.getAll(undefined, id);
            const councilSchedules = schedulesRes.data ?? [];
            setSchedules(councilSchedules);

            // 4. Fetch Final Assessment
            if (councilRes.data) {
                const assessmentsRes = await assessmentService.getAssessmentsWithCriteria(councilRes.data.semesterId);
                const allAssessments = assessmentsRes.data ?? [];
                
                const finalAssessments = allAssessments.filter(a => a.isFinal) || [];
                setAssessments(finalAssessments);
                
                const final = finalAssessments.find(a => {
                    const title = a.title?.toLowerCase() || "";
                    return title.includes("final") || 
                           title.includes("hội đồng") || 
                           title.includes("kết thúc") ||
                           title.includes("bảo vệ") ||
                           title.includes("tổng kết") ||
                           title.includes("cuối kỳ");
                }) || finalAssessments[finalAssessments.length - 1]; // Fallback to the last assessment if nothing matches
                
                if (final) {
                    setAssessment(final);
                    if (final.criteria.length === 0) {
                        toast.error(`Đợt đánh giá "${final.title}" chưa có tiêu chí chấm điểm.`);
                    }
                } else {
                    toast.error("Không tìm thấy đợt đánh giá nào cho học kỳ này.");
                }
            }

            if (councilSchedules.length > 0) {
                const dates = Array.from(new Set(councilSchedules.map(s => s.defenseDate?.toString()).filter(Boolean))) as string[];
                dates.sort();
                
                // If no date selected yet, pick the first one
                if (dates.length > 0 && !selectedDate) {
                    const firstDate = dates[0];
                    setSelectedDate(firstDate);
                    
                    // Also select the first group of that date
                    const firstGroupOfDate = councilSchedules.find(s => s.defenseDate?.toString() === firstDate);
                    if (firstGroupOfDate && !selectedGroupId) {
                        setSelectedGroupId(firstGroupOfDate.groupId);
                    }
                } else if (!selectedGroupId) {
                    // Fallback for councils with no dates set (unlikely but possible)
                    setSelectedGroupId(councilSchedules[0].groupId);
                }
            }
        } catch (error) {
            console.error("Error fetching council data:", error);
            toast.error("Không thể tải thông tin hội đồng.");
        } finally {
            setLoading(false);
        }
    }, [councilId]); // Removed selectedGroupId to prevent infinite loop

    useEffect(() => {
        fetchCouncilDetails();
    }, [fetchCouncilDetails]);

    useEffect(() => {
        const fetchGroupMembers = async () => {
            if (!selectedGroupId || !assessment || !council) return;
            try {
                const res = await groupService.getGroupDetail(selectedGroupId);
                const members = res.data?.members ?? [];
                setGroupMembers(members);

                // Fetch passed users
                try {
                    const passedRes = await assessmentService.getUsersPassedFinal(selectedGroupId, assessment.assessmentId);
                    setPassedUserIds(passedRes.data || []);
                } catch(e) { console.error("Error fetching passed users", e); }

                // Fetch existing scores for this group and council
                let existingScoresMap: Record<number, Record<number, number>> = {};
                try {
                    const gradesRes = await assessmentService.getCouncilGrades(council.councilId, selectedGroupId);
                    const grades = gradesRes.data ?? [];
                    console.log(`Fetched ${grades.length} existing grades for group ${selectedGroupId}`);
                    
                    grades.forEach((g: any) => {
                        // Handle both camelCase and PascalCase from API
                        const uId = g.userId ?? g.UserId;
                        const cId = g.criteriaId ?? g.CriteriaId;
                        const val = g.score ?? g.Score ?? 0;
                        
                        if (uId !== undefined && cId !== undefined) {
                            if (!existingScoresMap[uId]) existingScoresMap[uId] = {};
                            existingScoresMap[uId][cId] = val;
                        }
                    });
                } catch (err) {
                    console.error("Error fetching existing grades:", err);
                }

                // Initialize scores
                const initialScores: Record<number, Record<number, number>> = {};
                members.forEach(m => {
                    initialScores[m.userId] = {};
                    assessment.criteria.forEach(c => {
                        const savedScore = existingScoresMap[m.userId]?.[c.criteriaId];
                        initialScores[m.userId][c.criteriaId] = savedScore ?? 0;
                    });
                });
                
                console.log("Setting student scores:", initialScores);
                setStudentScores(initialScores);
            } catch (error) {
                console.error("Error fetching group members:", error);
                toast.error("Không thể tải danh sách sinh viên của nhóm.");
            }
        };
        fetchGroupMembers();
    }, [selectedGroupId, assessment, council]);

    const handleScoreChange = (userId: number, criteriaId: number, value: string) => {
        const score = parseFloat(value);
        if (isNaN(score)) return;
        const clampedScore = Math.min(10, Math.max(0, score));

        setStudentScores(prev => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                [criteriaId]: clampedScore
            }
        }));
    };

    const calculateStudentTotal = (userId: number) => {
        if (!assessment) return 0;
        const scores = studentScores[userId] || {};
        let total = 0;
        assessment.criteria.forEach(c => {
            const score = scores[c.criteriaId] || 0;
            total += (score * (c.weight / 100));
        });
        return total;
    };

    const handleSubmit = async () => {
        if (!council || !selectedGroupId || !assessment) return;

        setSubmitting(true);
        try {
            const studentScoresDto: CouncilStudentScoreDto[] = Object.entries(studentScores)
                .filter(([userIdStr]) => !passedUserIds.includes(parseInt(userIdStr)))
                .map(([userIdStr, criteriaScores]) => ({
                    userId: parseInt(userIdStr),
                    criteriaScores
                }));

            const payload: SaveCouncilGradesDto = {
                councilId: council.councilId,
                groupId: selectedGroupId,
                assessmentId: assessment.assessmentId,
                studentScores: studentScoresDto
            };

            await assessmentService.saveCouncilGrades(payload);
            toast.success("Đã lưu điểm thành công!");
            
            // Refresh council details (this will update 'assessment' and 'council' states)
            // which in turn triggers the useEffect for fetching group members and grades.
            await fetchCouncilDetails();
            
            // If the state doesn't trigger a re-fetch (e.g. same object references), 
            // we can slightly toggle the selectedGroupId to force a refresh if absolutely necessary,
            // but fetchCouncilDetails updates multiple states so it should be fine.
        } catch (error: any) {
            console.error("Error submitting grades:", error);
            toast.error(error?.response?.data?.message ?? "Lỗi khi lưu điểm.");
        } finally {
            setSubmitting(false);
        }
    };

    const availableDates = Array.from(new Set(schedules.map(s => s.defenseDate?.toString()).filter(Boolean))) as string[];
    availableDates.sort();

    const filteredSchedules = selectedDate 
        ? schedules.filter(s => s.defenseDate?.toString() === selectedDate) 
        : schedules;

    const currentSchedule = schedules.find(s => s.groupId === selectedGroupId);

    return (
        <div className="flex h-screen overflow-hidden bg-[#f6f6f8] text-[#111318]">
            <TeacherSidebar currentPath="/teacher/council-grading" />

            <main className="flex-1 overflow-y-auto">
                <TeacherHeader 
                    title={council?.councilName || "Chấm điểm hội đồng"} 
                    subtitle={`Học kỳ: ${council?.semesterName || "..."} - Đánh giá kết quả bảo vệ đồ án của các nhóm sinh viên.`} 
                />

                <div className="p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-white rounded-3xl border border-[#dbdfe6] shadow-sm">
                            <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p className="text-sm font-medium text-gray-500">Đang tải thông tin hội đồng...</p>
                        </div>
                    ) : !council ? (
                        <div className="max-w-md w-full mx-auto bg-white rounded-3xl border border-[#dbdfe6] p-10 text-center space-y-6 shadow-sm">
                            <div className="size-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto text-primary">
                                <span className="material-symbols-outlined text-4xl">gavel</span>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-gray-900">Không có hội đồng bảo vệ</h2>
                                <p className="text-sm text-gray-500">
                                    Bạn chưa được phân công vào bất kỳ hội đồng bảo vệ nào trong học kỳ này. 
                                    Vui lòng kiểm tra lại lịch bảo vệ hoặc liên hệ với giáo vụ.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
                            {/* LEFT COLUMN: COUNCIL INFO & GROUP LIST */}
                            <div className="xl:col-span-3 space-y-6">
                                {/* Council Card */}
                                <div className="bg-white rounded-3xl border border-[#dbdfe6] p-6 shadow-sm">
                                    <h3 className="text-xs font-bold uppercase text-[#616f89] mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-[18px]">meeting_room</span>
                                        Thông tin hội đồng
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                            <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Phòng / Địa điểm</p>
                                            <p className="text-sm font-bold text-gray-800">{currentSchedule?.roomName || "N/A"}</p>
                                            {/*<p className="text-[11px] text-primary/60 mt-1 italic">{currentSchedule?.location || "Địa điểm chưa xác định"}</p>*/}
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-bold text-[#616f89] uppercase tracking-wider mb-2">Thành viên hội đồng</p>
                                            <div className="space-y-2">
                                                {council?.members.map(m => (
                                                    <div key={m.userId} className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                                                        <div className="size-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                                                            {m.fullName.charAt(0)}
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className="text-xs font-bold text-gray-800 truncate">{m.fullName}</p>
                                                            <p className="text-[10px] text-gray-400 truncate">{m.email}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Date Selection */}
                                {availableDates.length > 1 && (
                                    <div className="bg-white rounded-3xl border border-[#dbdfe6] p-4 shadow-sm">
                                        <p className="text-[10px] font-bold text-[#616f89] uppercase tracking-wider mb-3 px-2">Ngày bảo vệ</p>
                                        <div className="flex flex-wrap gap-2">
                                            {availableDates.map(date => (
                                                <button
                                                    key={date}
                                                    onClick={() => {
                                                        setSelectedDate(date);
                                                        // Automatically select the first group of the new date
                                                        const firstGroupOfDate = schedules.find(s => s.defenseDate?.toString() === date);
                                                        if (firstGroupOfDate) setSelectedGroupId(firstGroupOfDate.groupId);
                                                    }}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                                        selectedDate === date 
                                                        ? 'bg-primary text-white shadow-md' 
                                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {new Date(date).toLocaleDateString('vi-VN')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Group List */}
                                <div className="bg-white rounded-3xl border border-[#dbdfe6] overflow-hidden shadow-sm">
                                    <div className="p-6 border-b border-[#dbdfe6]">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-bold uppercase text-[#616f89] flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary text-[18px]">groups</span>
                                                Danh sách nhóm
                                            </h3>
                                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-lg text-[10px] font-bold">
                                                {filteredSchedules.length} nhóm
                                            </span>
                                        </div>
                                        {selectedDate && (
                                            <p className="text-[10px] text-primary/60 mt-2 font-medium italic">
                                                Ngày: {new Date(selectedDate).toLocaleDateString('vi-VN')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto">
                                        {filteredSchedules.map(s => (
                                            <button
                                                key={s.groupId}
                                                onClick={() => setSelectedGroupId(s.groupId)}
                                                className={`w-full p-4 flex items-center justify-between transition-all border-l-4 ${
                                                    selectedGroupId === s.groupId 
                                                    ? 'bg-primary/5 border-primary' 
                                                    : 'border-transparent hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="text-left">
                                                    <p className={`text-sm font-bold ${selectedGroupId === s.groupId ? 'text-primary' : 'text-gray-700'}`}>
                                                        {s.groupName}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">
                                                        {s.startTime?.substring(0, 5) || "N/A"} - {s.endTime?.substring(0, 5) || "N/A"}
                                                    </p>
                                                </div>
                                                {s.status?.toUpperCase() === 'COMPLETED' ? (
                                                     <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
                                                ) : (
                                                    <span className="size-2 rounded-full bg-amber-400" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: GRADING INTERFACE */}
                            <div className="xl:col-span-9 space-y-6">
                                {/* Status Alert */}
                                {currentSchedule?.status?.toUpperCase() === 'COMPLETED' && (
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 text-emerald-800 animate-in fade-in slide-in-from-top-2">
                                        <span className="material-symbols-outlined text-emerald-500">verified</span>
                                        <p className="text-sm font-medium">Nhóm này đã hoàn thành chấm điểm hội đồng. Bạn vẫn có thể xem lại hoặc cập nhật nếu cần thiết.</p>
                                    </div>
                                )}

                                <div className="bg-white rounded-3xl border border-[#dbdfe6] p-8 shadow-sm space-y-10 min-h-[600px]">
                                    {/* Selected Group Header */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#dbdfe6] pb-8">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-2xl font-black text-gray-900">{currentSchedule?.groupName}</h2>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                    currentSchedule?.status?.toUpperCase() === 'COMPLETED' 
                                                    ? 'bg-emerald-100 text-emerald-700' 
                                                    : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {currentSchedule?.status || "PENDING"}
                                                </span>
                                            </div>
                                            <div className="mt-4 flex items-center gap-3">
                                                <p className="text-sm font-semibold text-blue-900">Bài kiểm tra (Assessment):</p>
                                                <select 
                                                    value={assessment?.assessmentId || ""} 
                                                    onChange={(e) => {
                                                        const selected = assessments.find(a => a.assessmentId === Number(e.target.value));
                                                        if (selected) setAssessment(selected);
                                                    }}
                                                    className="px-4 py-2 text-sm rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none shadow-sm bg-white text-gray-800 font-medium min-w-[250px] transition-all"
                                                >
                                                    {assessments.map(a => (
                                                        <option key={a.assessmentId} value={a.assessmentId}>{a.title}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                            className="px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg ring-offset-2 hover:bg-primary/90 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shrink-0"
                                        >
                                            {submitting ? (
                                                <span className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <span className="material-symbols-outlined text-[20px]">save</span>
                                            )}
                                            {submitting ? "Đang lưu..." : "Lưu điểm hội đồng"}
                                        </button>
                                    </div>

                                    {!assessment ? (
                                        <div className="flex flex-col items-center justify-center p-12 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800 text-center">
                                            <span className="material-symbols-outlined text-4xl mb-4">warning</span>
                                            <h3 className="text-lg font-bold">Không tìm thấy tiêu chí</h3>
                                            <p className="text-sm mt-2">Hệ thống không tìm thấy tiêu chí chấm điểm Final cho học kỳ này.</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Criteria Legend */}
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                                {assessment.criteria.map(c => (
                                                    <div key={c.criteriaId} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate" title={c.criteriaName}>
                                                            {c.criteriaName}
                                                        </p>
                                                        <p className="text-xs font-black text-primary mt-1">{c.weight}%</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Students Loop */}
                                            <div className="space-y-8">
                                                {groupMembers.map((member) => (
                                                    <div key={member.userId} className="group p-1 rounded-[2rem] hover:bg-primary/5 transition-all">
                                                        <div className="bg-white border border-[#dbdfe6] rounded-[1.8rem] overflow-hidden group-hover:border-primary/20 shadow-sm transition-all">
                                                            <div className="px-6 py-4 bg-gray-50/50 border-b border-[#dbdfe6] flex items-center justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="size-12 rounded-2xl bg-white border border-[#dbdfe6] shadow-sm flex items-center justify-center font-black text-gray-400 group-hover:text-primary transition-colors">
                                                                        {member.fullName.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                                                            {member.fullName}
                                                                            {passedUserIds.includes(member.userId) && (
                                                                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-200 uppercase tracking-wide">
                                                                                    Passed Lần 1
                                                                                </span>
                                                                            )}
                                                                        </h4>
                                                                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest mt-0.5">{member.email}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-6 items-center">
                                                                    <div className="text-right border-r border-[#dbdfe6] pr-6">
                                                                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tiến độ chấm</p>
                                                                       <p className="text-sm font-black text-primary">
                                                                          {Object.values(studentScores[member.userId] || {}).filter(v => v > 0).length} / {assessment.criteria.length}
                                                                       </p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                       <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Điểm dự tính</p>
                                                                       <p className={`text-xl font-black ${calculateStudentTotal(member.userId) < 4 ? 'text-rose-500' : 'text-primary'}`}>
                                                                          {calculateStudentTotal(member.userId).toFixed(2)}
                                                                       </p>
                                                                       {calculateStudentTotal(member.userId) < 4 && (
                                                                           <p className="text-[9px] font-bold text-rose-400 uppercase mt-1">Không đạt</p>
                                                                       )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
                                                                {assessment.criteria.map(criteria => (
                                                                    <div key={criteria.criteriaId} className="space-y-3">
                                                                        <div className="flex justify-between items-center text-xs">
                                                                            <label className="font-bold text-gray-600 truncate max-w-[120px]" title={criteria.criteriaName}>
                                                                                {criteria.criteriaName}
                                                                            </label>
                                                                            <span className="text-gray-400 font-bold">{criteria.weight}%</span>
                                                                        </div>
                                                                        <div className="relative group/input">
                                                                            <input
                                                                                type="number"
                                                                                step="0.1"
                                                                                min="0"
                                                                                max="10"
                                                                                disabled={passedUserIds.includes(member.userId)}
                                                                                value={studentScores[member.userId]?.[criteria.criteriaId] ?? ""}
                                                                                onChange={(e) => handleScoreChange(member.userId, criteria.criteriaId, e.target.value)}
                                                                                className={`w-full h-12 px-4 bg-gray-50 border border-[#dbdfe6] rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-black text-gray-900 group-hover/input:border-primary/30 ${passedUserIds.includes(member.userId) ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
                                                                                placeholder="0.0"
                                                                            />
                                                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300">/ 10</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TeacherCouncilGradingPage;
