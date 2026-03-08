import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import { assessmentService } from "../../services/assessmentService";
import { groupService } from "../../services/groupService";
import { semesterService } from "../../services/semesterService";
import type { TeacherGroupDto, GroupSubmissionDto } from "../../services/groupService";
import type { SemesterDto } from "../../services/semesterService";
import type { AssessmentWithCriteriaDto } from "../../types/assessment.types";

interface StudentGrade {
    userId: number;
    fullName: string;
    scores: { [assessmentId: number]: number };
    comment: string;
    totalScore?: number;
    criteriaScores?: { [assessmentId: number]: { [criteriaId: number]: number } };
}


interface GroupGrading {
    groupId: number;
    groupName: string;
    students: StudentGrade[]; // Currently API only returns counts, will mock students for UI demo if not returned
    submittedDocs?: GroupSubmissionDto[];
}

const GradingPage: React.FC = () => {
    const [semesters, setSemesters] = useState<SemesterDto[]>([]);
    const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
    const [assessments, setAssessments] = useState<AssessmentWithCriteriaDto[]>([]);
    const [groups, setGroups] = useState<GroupGrading[]>([]);
    const [expandedGroups, setExpandedGroups] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewingDocsGroup, setViewingDocsGroup] = useState<GroupGrading | null>(null);

    // New filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAssessmentId, setSelectedAssessmentId] = useState<number | 'all'>('all');

    // Grading State
    const [groupComments, setGroupComments] = useState<{ [groupId: number]: string }>({});
    const [studentScores, setStudentScores] = useState<{ [userId: number]: { [assessmentId: number]: number } }>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // 1. Lấy danh sách học kỳ
                const semestersRes = await semesterService.getAllSemesters();
                if (semestersRes.data) {
                    const activeSemesters = semestersRes.data.filter(s => s.isActive);
                    setSemesters(activeSemesters);
                    if (activeSemesters.length > 0) {
                        setSelectedSemesterId(activeSemesters[0].semesterId);
                    }
                }

                // Map API data -> UI State
                // (Groups will be fetched separately when semester is selected)
            } catch (error) {
                console.error("Failed to fetch initial data for GradingPage", error);
            } finally {
                // setLoading(false) will be handled after fetching assessments and groups
            }
        };
        fetchInitialData();
    }, []);

    const fetchSemesterData = async () => {
        if (!selectedSemesterId) return;
        setLoading(true);

        // 1. Fetch Assessments independently
        let currentAssessments: AssessmentWithCriteriaDto[] = [];
        try {
            const assessmentRes = await assessmentService.getAssessmentsWithCriteria(selectedSemesterId);
            currentAssessments = assessmentRes.data || [];
            setAssessments(currentAssessments);
        } catch (error) {
            console.error("Failed to fetch assessments", error);
            setAssessments([]);
        }

        // 2. Fetch Groups independently
        try {
            const groupsRes = await groupService.getGroupsByTeacher(selectedSemesterId);
            if (groupsRes?.data) {
                const initScores: any = {};
                const initComments: any = {};
                const mappedGroups: GroupGrading[] = groupsRes.data.map((g: TeacherGroupDto) => {
                    let overallComment = "";
                    if (g.teacherComments) {
                        const values = Object.values(g.teacherComments).filter(c => c && c.trim().length > 0);
                        if (values.length > 0) overallComment = values[0];
                    }
                    initComments[g.groupId] = overallComment;
                    return {
                        groupId: g.groupId,
                        groupName: g.groupName,
                        submittedDocs: g.submittedDocs,
                        students: g.students ? g.students.map(s => {
                            initScores[s.userId] = s.scores || {};
                            return {
                                userId: s.userId,
                                fullName: s.fullName,
                                scores: {},
                                comment: "",
                                totalScore: s.totalScore,
                                criteriaScores: s.criteriaScores
                            };
                        }) : []
                    };
                });
                setGroups(mappedGroups);
                setStudentScores(initScores);
                setGroupComments(initComments);
            } else {
                setGroups([]);
            }
        } catch (error) {
            console.error("Failed to fetch groups data", error);
            setGroups([]);
        }

        setLoading(false);
    };

    // Reset assessments and groups when semester changes
    useEffect(() => {
        fetchSemesterData();
    }, [selectedSemesterId]);

    const toggleGroup = (groupId: number) => {
        setExpandedGroups(prev =>
            prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
        );
    };

    const handleScoreChange = (userId: number, assessmentId: number, score: string) => {
        if (score === '') {
            setStudentScores(prev => ({
                ...prev,
                [userId]: {
                    ...prev[userId],
                    [assessmentId]: '' as any
                }
            }));
            return;
        }

        let numScore = parseFloat(score);
        if (isNaN(numScore)) return;

        if (numScore > 10) numScore = 10;
        if (numScore < 0) numScore = 0;

        setStudentScores(prev => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                [assessmentId]: numScore
            }
        }));
    };

    const handleCommentChange = (groupId: number, comment: string) => {
        setGroupComments(prev => ({
            ...prev,
            [groupId]: comment
        }));
    };

    const handleSaveGrades = async () => {
        setIsSaving(true);
        try {
            // Chuẩn bị payload cho từng nhóm đã được mở (hoặc tất cả), lọc theo search
            const groupsToSave = searchQuery.trim() === '' ? groups : groups.filter(g => g.groupName.toLowerCase().includes(searchQuery.toLowerCase()));

            let saveCount = 0;
            const assessmentsToProcess = selectedAssessmentId === 'all'
                ? assessments
                : assessments.filter(a => a.assessmentId === selectedAssessmentId);

            for (const group of groupsToSave) {
                for (const assessment of assessmentsToProcess) {
                    const groupScorePayload: any = {
                        assessmentId: assessment.assessmentId,
                        groupId: group.groupId,
                        teacherComment: groupComments[group.groupId] || "",
                        studentScores: []
                    };

                    group.students.forEach(student => {
                        const mappedScore = studentScores[student.userId]?.[assessment.assessmentId];
                        if (mappedScore !== undefined && mappedScore !== '' as any) {
                            groupScorePayload.studentScores.push({
                                userId: student.userId,
                                score: parseFloat(mappedScore.toString())
                            });
                        }
                    });

                    // Chỉ lưu nếu có nhập điểm hoặc có nhận xét
                    if (groupScorePayload.studentScores.length > 0 || groupScorePayload.teacherComment.trim() !== '') {
                        await assessmentService.saveGrades(groupScorePayload);
                        saveCount++;
                    }
                }
            }
            if (saveCount > 0) {
                toast.success("Lưu điểm thành công!");
                // Re-fetch data to reflect newly calculated total scores
                await fetchSemesterData();
            } else {
                toast.error("Không có thay đổi nào để lưu hoặc nhóm chưa nộp bài! (Phải có bài nộp mới lưu được Nhận xét)");
            }
        }
        catch (error) {
            console.error("Lỗi khi lưu điểm:", error);
            toast.error("Đã xảy ra lỗi khi lưu điểm.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#f6f6f8] text-[#111318]">
            <TeacherSidebar currentPath="/teacher/grading" />

            <main className="flex-1 overflow-y-auto">
                <TeacherHeader title="Tổng điểm sinh viên" subtitle="Tổng Điểm Của Sing Viên Trong Kì Học." />

                {loading ? (
                    <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-3 text-gray-500 font-medium">Đang tải dữ liệu...</span>
                    </div>
                ) : (
                    <div className="p-8 max-w-[1400px] mx-auto space-y-6">
                        {/* 1. Chọn Assessment */}
                        <section className="bg-white rounded-xl border border-[#dbdfe6] p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold uppercase text-[#616f89]">Chọn giai đoạn đánh giá</h3>
                                <select
                                    className="p-2 border border-[#dbdfe6] rounded-lg outline-none focus:border-primary text-sm font-medium text-[#616f89]"
                                    value={selectedSemesterId || ''}
                                    onChange={(e) => setSelectedSemesterId(Number(e.target.value))}
                                >
                                    <option value="" disabled>-- Chọn học kỳ --</option>
                                    {semesters.map(s => (
                                        <option key={s.semesterId} value={s.semesterId}>
                                            {s.semesterName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Bộ lọc theo nhóm và tiêu chí */}
                            <div className="mt-4 flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-3 relative">
                                    <span className="material-symbols-outlined absolute left-3 text-gray-400 font-bold" style={{ fontSize: '18px' }}>search</span>
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên nhóm..."
                                        className="pl-9 pr-4 py-2 border border-[#dbdfe6] rounded-lg outline-none focus:border-primary text-sm font-medium text-[#111318] w-64"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-[#616f89]">Lọc theo Đợt:</span>
                                    <select
                                        className={`p-2 border rounded-lg outline-none text-sm font-medium transition-colors ${(!assessments || assessments.length === 0)
                                            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                            : "border-[#dbdfe6] focus:border-primary text-[#616f89]"
                                            }`}
                                        value={selectedAssessmentId.toString()}
                                        onChange={(e) => setSelectedAssessmentId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                        disabled={!assessments || assessments.length === 0}
                                        title={(!assessments || assessments.length === 0) ? "Không có dữ liệu Đợt để lọc" : ""}
                                    >
                                        <option value="all">
                                            {(!assessments || assessments.length === 0)
                                                ? "-- Không có Đợt --"
                                                : "-- Tất cả các Đợt --"}
                                        </option>
                                        {assessments.map(a => (
                                            <option key={a.assessmentId} value={a.assessmentId}>
                                                {a.title} ({a.weight}%)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* 2. Bảng chấm điểm theo tiêu chí  */}
                        <div className="bg-white rounded-xl border border-[#dbdfe6] shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#f8f9fa] border-b border-[#dbdfe6]">
                                        <th className="px-6 py-4 text-xs font-bold uppercase w-[250px]">Nhóm / Sinh viên</th>
                                        {assessments.filter(a => selectedAssessmentId === 'all' || a.assessmentId === selectedAssessmentId).map(a => (
                                            <th key={a.assessmentId} className="px-4 py-4 text-xs font-bold uppercase text-center bg-orange-50/30">
                                                {a.title} <br />
                                                <span className="text-orange-600">({a.weight}%)</span>
                                            </th>
                                        ))}
                                        {/*<th className="px-6 py-4 text-xs font-bold uppercase text-center">Đánh giá chung</th>*/}
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-right">Tổng điểm</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#dbdfe6]">
                                    {groups.filter(group => searchQuery.trim() === '' || group.groupName.toLowerCase().includes(searchQuery.toLowerCase())).map(group => (
                                        <React.Fragment key={group.groupId}>
                                            {/* Hàng Nhóm - Accordion Header */}
                                            <tr className="bg-gray-50/50 cursor-pointer hover:bg-gray-100" onClick={() => toggleGroup(group.groupId)}>
                                                <td className="px-6 py-4 flex items-center gap-2 font-bold text-primary">
                                                    <span className={`material-symbols-outlined transition-transform ${expandedGroups.includes(group.groupId) ? 'rotate-180' : ''}`}>
                                                        keyboard_arrow_down
                                                    </span>
                                                    {group.groupName}
                                                </td>
                                                <td colSpan={(assessments.filter(a => selectedAssessmentId === 'all' || a.assessmentId === selectedAssessmentId).length || 0) + 2} className="px-6 py-4 text-right">
                                                    {group.submittedDocs && group.submittedDocs.length > 0 ? (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setViewingDocsGroup(group); }}
                                                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">description</span>
                                                            Xem tài liệu ({group.submittedDocs.length})
                                                        </button>
                                                    ) : (
                                                        <span className="text-sm text-gray-400 italic">Chưa nộp bài</span>
                                                    )}
                                                </td>
                                            </tr>

                                            {/* Hàng Sinh viên - Accordion Content */}
                                            {expandedGroups.includes(group.groupId) && group.students.map(student => (
                                                <tr key={student.userId} className="animate-in slide-in-from-top-1 duration-200">
                                                    <td className="px-10 py-4 text-sm font-medium border-r">{student.fullName}</td>
                                                    {assessments.filter(a => selectedAssessmentId === 'all' || a.assessmentId === selectedAssessmentId).map(a => {
                                                        const hasCriteriaGrades = student.criteriaScores && student.criteriaScores[a.assessmentId] && Object.keys(student.criteriaScores[a.assessmentId]).length > 0;
                                                        const isDisabled = !group.submittedDocs || group.submittedDocs.length === 0;

                                                        return (
                                                            <td key={a.assessmentId} className="px-4 py-4 text-center border-r">
                                                                {hasCriteriaGrades ? (
                                                                    <div className="w-16 mx-auto px-2 py-1 bg-green-50 border border-green-200 text-green-700 rounded text-center text-sm font-bold" title="Điểm đã được chấm chi tiết theo tiêu chí">
                                                                        {studentScores[student.userId]?.[a.assessmentId] !== undefined ? studentScores[student.userId]?.[a.assessmentId] : '--'}
                                                                    </div>
                                                                ) : (
                                                                    <input
                                                                        type="number" step="0.1" max="10" min="0" placeholder="0.0"
                                                                        value={studentScores[student.userId]?.[a.assessmentId] ?? ''}
                                                                        onChange={(e) => handleScoreChange(student.userId, a.assessmentId, e.target.value)}
                                                                        disabled={isDisabled}
                                                                        className={`w-16 px-2 py-1 border border-[#dbdfe6] rounded text-center focus:ring-1 focus:ring-primary outline-none ${isDisabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : ''}`}
                                                                    />
                                                                )}
                                                            </td>
                                                        );
                                                    })}

                                                    {/* Ô Checkbox Đánh giá chung (bỏ textarea ở đây, chuyển lên cấp Nhóm hoặc để 1 text chung) 
                                                    Nhưng để layout đẹp, ta giữ textarea trống hoặc chỉ là text "--" cho sinh viên, 
                                                    và hiển thị text cho Group */}
                                                    {/*<td className="px-4 py-4 border-r text-center text-sm text-gray-400">*/}
                                                    {/*    --*/}
                                                    {/*</td>*/}
                                                    <td className="px-6 py-4 text-right font-bold text-orange-600">
                                                        {student.totalScore !== undefined && student.totalScore !== null
                                                            ? student.totalScore.toFixed(2)
                                                            : '--'}
                                                    </td>
                                                </tr>
                                            ))}

                                            {/* Row Nhận xét cấp Group */}
                                            {expandedGroups.includes(group.groupId) && (
                                                <tr className="bg-orange-50/20">
                                                    <td colSpan={2} className="px-10 py-3 text-sm font-medium border-r text-right italic text-gray-600">
                                                        Nhận xét chung cho nhóm {group.groupName}:
                                                    </td>
                                                    <td colSpan={(assessments.filter(a => selectedAssessmentId === 'all' || a.assessmentId === selectedAssessmentId).length || 0) + 1} className="px-4 py-3">
                                                        <textarea
                                                            rows={2}
                                                            placeholder="Nhập lời phê của Giảng viên cho nhóm này..."
                                                            value={groupComments[group.groupId] ?? ""}
                                                            onChange={(e) => handleCommentChange(group.groupId, e.target.value)}
                                                            disabled={!group.submittedDocs || group.submittedDocs.length === 0}
                                                            className={`w-full p-2 text-sm border border-orange-200 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none ${(!group.submittedDocs || group.submittedDocs.length === 0) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                        />
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>

                            <div className="p-6 bg-gray-50 border-t border-[#dbdfe6] flex justify-end gap-3">
                                <button className="px-6 py-2 border border-[#dbdfe6] text-[#616f89] font-bold rounded-xl hover:bg-white">Hủy</button>
                                <button
                                    onClick={handleSaveGrades}
                                    disabled={isSaving}
                                    className={`px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {isSaving ? "Đang lưu..." : "Lưu điểm"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Xem Tài Liệu */}
                {viewingDocsGroup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="px-6 py-4 border-b border-[#dbdfe6] flex items-center justify-between bg-gray-50/50">
                                <h3 className="text-lg font-bold text-[#111318]">Tài liệu nộp - {viewingDocsGroup.groupName}</h3>
                                <button onClick={() => setViewingDocsGroup(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="p-6 max-h-[60vh] overflow-y-auto">
                                {viewingDocsGroup.submittedDocs && viewingDocsGroup.submittedDocs.length > 0 ? (
                                    <ul className="space-y-3">
                                        {viewingDocsGroup.submittedDocs.map(doc => (
                                            <li key={doc.id} className="flex items-center justify-between p-3 rounded-xl border border-[#dbdfe6] hover:border-primary/50 hover:bg-primary/5 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-orange-500 text-3xl">picture_as_pdf</span>
                                                    <div>
                                                        <p className="text-sm font-bold text-[#111318] break-all">{doc.name}</p>
                                                        <p className="text-xs text-gray-500">Nộp lúc: {doc.submittedAt}</p>
                                                    </div>
                                                </div>
                                                <a href={doc.url} download={doc.name} target="_blank" rel="noopener noreferrer" className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors shrink-0" title="Tải xuống">
                                                    <span className="material-symbols-outlined">download</span>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center py-6 text-gray-500">Không có tài liệu nào được nộp.</div>
                                )}
                            </div>
                            <div className="px-6 py-4 border-t border-[#dbdfe6] bg-gray-50 flex justify-end">
                                <button onClick={() => setViewingDocsGroup(null)} className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors">
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default GradingPage;