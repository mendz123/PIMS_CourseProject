import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import { assessmentService } from "../../services/assessmentService";
import { groupService } from "../../services/groupService";
import { semesterService } from "../../services/semesterService";
import type { TeacherGroupDto, GroupSubmissionDto, SaveGradesByCriteriaDto } from "../../services/groupService";
import type { SemesterDto } from "../../services/semesterService";
import type { AssessmentWithCriteriaDto } from "../../types/assessment.types";

interface StudentGrade {
    userId: number;
    fullName: string;
    criteriaScores: { [assessmentId: number]: { [criteriaId: number]: number | '' } };
    totalScore?: number;
}


interface GroupGrading {
    groupId: number;
    groupName: string;
    students: StudentGrade[];
    submittedDocs?: GroupSubmissionDto[];
}

const CriteriaGradingPage: React.FC = () => {
    const [semesters, setSemesters] = useState<SemesterDto[]>([]);
    const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
    const [assessments, setAssessments] = useState<AssessmentWithCriteriaDto[]>([]);
    const [groups, setGroups] = useState<GroupGrading[]>([]);
    const [expandedGroups, setExpandedGroups] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewingDocsGroup, setViewingDocsGroup] = useState<GroupGrading | null>(null);

    // New filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAssessmentId, setSelectedAssessmentId] = useState<number | null>(null);

    // Grading State
    const [groupComments, setGroupComments] = useState<{ [groupId: number]: string }>({});
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
            } catch (error) {
                console.error("Failed to fetch initial data for CriteriaGradingPage", error);
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
            if (currentAssessments.length > 0) {
                // Tự động chọn đợt đầu tiên
                setSelectedAssessmentId(currentAssessments[0].assessmentId);
            } else {
                setSelectedAssessmentId(null);
            }
        } catch (error) {
            console.error("Failed to fetch assessments", error);
            setAssessments([]);
            setSelectedAssessmentId(null);
        }

        // 2. Fetch Groups independently
        try {
            const groupsRes = await groupService.getGroupsByTeacher(selectedSemesterId);
            if (groupsRes?.data) {
                const initComments: any = {};
                const mappedGroups: GroupGrading[] = groupsRes.data.map((g: TeacherGroupDto) => {
                    let overallComment = "";
                    if (g.teacherComments) {
                        const values = Object.values(g.teacherComments).filter(c => c && c.trim().length > 0);
                        if (values.length > 0) overallComment = values[0]; // Có thể thay đổi tuỳ assessment
                    }
                    initComments[g.groupId] = overallComment;

                    return {
                        groupId: g.groupId,
                        groupName: g.groupName,
                        submittedDocs: g.submittedDocs,
                        students: g.students ? g.students.map(s => {
                            // Extract CriteriaScores mapping from backend if it exists
                            // Here logic expects structure: scores[assessmentId][criteriaId]
                            const sScores: any = {};

                            // Load existing criteria scores if mapped
                            if (s.criteriaScores) {
                                Object.keys(s.criteriaScores).forEach(aIdStr => {
                                    const aId = Number(aIdStr);
                                    if (!sScores[aId]) sScores[aId] = {};
                                    const cScores = s.criteriaScores![aId];
                                    Object.keys(cScores).forEach(cIdStr => {
                                        sScores[aId][Number(cIdStr)] = cScores[Number(cIdStr)];
                                    });
                                });
                            }

                            return {
                                userId: s.userId,
                                fullName: s.fullName,
                                criteriaScores: sScores,
                                totalScore: s.totalScore
                            };
                        }) : []
                    };
                });
                setGroups(mappedGroups);
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

    // Theo dõi thay đổi Assessment để load lại Comment tương ứng
    useEffect(() => {
        if (!selectedAssessmentId || groups.length === 0) return;
        // Thực tế backend chưa tách TeacherComment theo Assessment rõ ràng trong api get
        // Nhưng tạm thời ta cập nhật comment theo AssessmentId nếu API trả ra Map

        // (Lưu ý: Đoạn này phụ thuộc vào `g.teacherComments` map từ BE trả về trên TeacherGroupDto)
        // Hiện tại initComments chỉ lấy comment đầu tiên, nhưng ta có thể lấy đúng comment của Assessment
    }, [selectedAssessmentId, groups]);

    useEffect(() => {
        fetchSemesterData();
    }, [selectedSemesterId]);

    const toggleGroup = (groupId: number) => {
        setExpandedGroups(prev =>
            prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
        );
    };

    const handleCriteriaScoreChange = (assessmentId: number, criteriaId: number, score: string, groupIndex: number, studentIndex: number) => {
        const newGroups = [...groups];
        const student = newGroups[groupIndex].students[studentIndex];

        if (!student.criteriaScores[assessmentId]) {
            student.criteriaScores[assessmentId] = {};
        }

        if (score === '') {
            student.criteriaScores[assessmentId][criteriaId] = '';
        } else {
            let numScore = parseFloat(score);
            if (isNaN(numScore)) return;
            if (numScore > 10) numScore = 10;
            if (numScore < 0) numScore = 0;
            student.criteriaScores[assessmentId][criteriaId] = numScore;
        }

        setGroups(newGroups);
    };

    const handleCommentChange = (groupId: number, comment: string) => {
        setGroupComments(prev => ({
            ...prev,
            [groupId]: comment
        }));
    };

    const calculateCurrentAssessmentScore = (student: StudentGrade, assessment: AssessmentWithCriteriaDto) => {
        if (!student.criteriaScores[assessment.assessmentId] || !assessment.criteria || assessment.criteria.length === 0) return '--';

        let total = 0;
        let hasGrades = false;

        assessment.criteria.forEach(c => {
            const score = student.criteriaScores[assessment.assessmentId]?.[c.criteriaId];
            if (score !== undefined && score !== '') {
                total += (score as number) * (c.weight / 100);
                hasGrades = true;
            }
        });

        return hasGrades ? total.toFixed(2) : '--';
    };

    const handleSaveGrades = async () => {
        if (!selectedAssessmentId) {
            toast.error("Vui lòng chọn một đợt đánh giá để lưu điểm!");
            return;
        }

        setIsSaving(true);
        try {
            const groupsToSave = searchQuery.trim() === '' ? groups : groups.filter(g => g.groupName.toLowerCase().includes(searchQuery.toLowerCase()));
            let saveCount = 0;

            for (const group of groupsToSave) {
                const payloadStr: SaveGradesByCriteriaDto = {
                    assessmentId: selectedAssessmentId,
                    groupId: group.groupId,
                    teacherComment: groupComments[group.groupId] || "",
                    studentScores: []
                };

                group.students.forEach(student => {
                    const mappedScores = student.criteriaScores[selectedAssessmentId];
                    if (mappedScores) {
                        const cleanScores: { [key: number]: number } = {};
                        let hasAnyScore = false;
                        Object.keys(mappedScores).forEach(cIdStr => {
                            const val = mappedScores[Number(cIdStr)] as any;
                            // Bỏ qua giá trị rỗng hoặc undefined
                            if (val !== undefined && val !== null && val !== '') {
                                cleanScores[Number(cIdStr)] = parseFloat(val);
                                hasAnyScore = true;
                            }
                        });

                        if (hasAnyScore) {
                            payloadStr.studentScores.push({
                                userId: student.userId,
                                criteriaScores: cleanScores
                            });
                        }
                    }
                });

                // Lưu nếu có điểm hoặc có nhận xét
                if (payloadStr.studentScores.length > 0 || payloadStr.teacherComment!.trim() !== '') {
                    await assessmentService.saveGradesByCriteria(payloadStr);
                    saveCount++;
                }
            }

            if (saveCount > 0) {
                toast.success("Lưu điểm tiêu chí thành công!");
                await fetchSemesterData();
            } else {
                toast.error("Không có thay đổi nào để lưu!");
            }
        }
        catch (error: any) {
            console.error("Lỗi khi lưu điểm tiêu chí:", error);
            const msg = error?.response?.data?.message || "Đã xảy ra lỗi khi lưu điểm tiêu chí.";
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    };

    const currentAssessment = assessments.find(a => a.assessmentId === selectedAssessmentId);

    return (
        <div className="flex h-screen overflow-hidden bg-[#f6f6f8] text-[#111318]">
            <TeacherSidebar currentPath="/teacher/grading-criteria" />

            <main className="flex-1 overflow-y-auto">
                <TeacherHeader title="Chấm điểm sinh viên theo Tiêu chí" subtitle="Đánh giá năng lực dựa trên các tiêu chí cụ thể của từng đợt." />

                {loading ? (
                    <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-3 text-gray-500 font-medium">Đang tải dữ liệu...</span>
                    </div>
                ) : (
                    <div className="p-8 max-w-[1400px] mx-auto space-y-6">
                        {/* 1. Filter Section */}
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
                                    <span className="text-sm font-medium text-[#616f89]">Đợt đánh giá:</span>
                                    <select
                                        className={`p-2 border rounded-lg outline-none text-sm font-medium transition-colors ${(!assessments || assessments.length === 0)
                                            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                            : "border-[#dbdfe6] focus:border-primary text-[#616f89]"
                                            }`}
                                        value={selectedAssessmentId?.toString() || ''}
                                        onChange={(e) => setSelectedAssessmentId(Number(e.target.value))}
                                        disabled={!assessments || assessments.length === 0}
                                    >
                                        {(!assessments || assessments.length === 0) && (
                                            <option value="" disabled>-- Không có đợt đánh giá --</option>
                                        )}
                                        {assessments.map(a => (
                                            <option key={a.assessmentId} value={a.assessmentId}>
                                                {a.title} ({a.weight}%)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* 2. Grading Table Section */}
                        {currentAssessment ? (
                            <div className="bg-white rounded-xl border border-[#dbdfe6] shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between px-6 py-4 bg-[#f8f9fa] border-b border-[#dbdfe6]">
                                    <h2 className="text-base font-bold text-primary">Các tiêu chí của {currentAssessment.title}</h2>
                                    <span className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-lg">Trọng số: {currentAssessment.weight}%</span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[800px]">
                                        <thead>
                                            <tr className="bg-[#f8f9fa] border-b border-[#dbdfe6]">
                                                <th className="px-6 py-4 text-xs font-bold uppercase w-[250px] sticky left-0 bg-[#f8f9fa] z-10 border-r">Nhóm / Sinh viên</th>
                                                {currentAssessment.criteria?.map(c => (
                                                    <th key={c.criteriaId} className="px-4 py-4 text-xs font-bold uppercase text-center bg-blue-50/50 min-w-[120px]">
                                                        {c.criteriaName} <br />
                                                        <span className="text-blue-600">({c.weight}%)</span>
                                                    </th>
                                                ))}
                                                <th className="px-6 py-4 text-xs font-bold uppercase text-center bg-orange-50/50">Điểm Đợt</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#dbdfe6]">
                                            {groups.filter(group => searchQuery.trim() === '' || group.groupName.toLowerCase().includes(searchQuery.toLowerCase())).map((group, groupIndex) => (
                                                <React.Fragment key={group.groupId}>
                                                    {/* Group Row */}
                                                    <tr className="bg-gray-50/50 cursor-pointer hover:bg-gray-100" onClick={() => toggleGroup(group.groupId)}>
                                                        <td className="px-6 py-4 flex items-center gap-2 font-bold text-primary sticky left-0 bg-gray-50/50 hover:bg-gray-100 border-r z-10">
                                                            <span className={`material-symbols-outlined transition-transform ${expandedGroups.includes(group.groupId) ? 'rotate-180' : ''}`}>
                                                                keyboard_arrow_down
                                                            </span>
                                                            {group.groupName}
                                                        </td>
                                                        <td colSpan={(currentAssessment.criteria?.length || 0) + 1} className="px-6 py-4 text-right">
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

                                                    {/* Students Rows */}
                                                    {expandedGroups.includes(group.groupId) && group.students.map((student, studentIndex) => (
                                                        <tr key={student.userId} className="animate-in slide-in-from-top-1 duration-200">
                                                            <td className="px-10 py-4 text-sm font-medium border-r sticky left-0 bg-white z-10">{student.fullName}</td>
                                                            {currentAssessment.criteria?.map(c => (
                                                                <td key={c.criteriaId} className="px-4 py-4 text-center border-r">
                                                                    <input
                                                                        type="number" step="0.1" max="10" min="0" placeholder="0.0"
                                                                        value={(student.criteriaScores[currentAssessment.assessmentId]?.[c.criteriaId]) ?? ''}
                                                                        onChange={(e) => handleCriteriaScoreChange(currentAssessment.assessmentId, c.criteriaId, e.target.value, groupIndex, studentIndex)}
                                                                        disabled={!group.submittedDocs || group.submittedDocs.length === 0}
                                                                        className={`w-[70px] px-2 py-1.5 border border-[#dbdfe6] rounded-md text-center focus:ring-2 focus:ring-primary outline-none transition-shadow ${(!group.submittedDocs || group.submittedDocs.length === 0) ? 'bg-gray-100 cursor-not-allowed text-gray-400' : ''}`}
                                                                    />
                                                                </td>
                                                            ))}

                                                            {/* Preview Calculated Assessment Score */}
                                                            <td className="px-4 py-4 border-r text-center font-bold text-orange-600 bg-orange-50/20">
                                                                {calculateCurrentAssessmentScore(student, currentAssessment)}
                                                            </td>
                                                        </tr>
                                                    ))}

                                                    {/* Group Comment Row */}
                                                    {expandedGroups.includes(group.groupId) && (
                                                        <tr className="bg-blue-50/20">
                                                            <td className="px-10 py-3 text-sm font-medium border-r text-right italic text-gray-600 sticky left-0 bg-blue-50/20 z-10">
                                                                Nhận xét đợt {currentAssessment.title}:
                                                            </td>
                                                            <td colSpan={(currentAssessment.criteria?.length || 0) + 1} className="px-4 py-3">
                                                                <textarea
                                                                    rows={2}
                                                                    placeholder={`Nhập lời phê của Giảng viên cho đợt ${currentAssessment.title}...`}
                                                                    value={groupComments[group.groupId] ?? ""}
                                                                    onChange={(e) => handleCommentChange(group.groupId, e.target.value)}
                                                                    disabled={!group.submittedDocs || group.submittedDocs.length === 0}
                                                                    className={`w-full p-3 text-sm border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-shadow ${(!group.submittedDocs || group.submittedDocs.length === 0) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                                />
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="p-6 bg-gray-50 border-t border-[#dbdfe6] flex justify-end gap-3 rounded-b-xl">
                                    <button className="px-6 py-2 border border-[#dbdfe6] text-[#616f89] font-bold rounded-xl hover:bg-white transition-colors">Hủy</button>
                                    <button
                                        onClick={handleSaveGrades}
                                        disabled={isSaving}
                                        className={`px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        {isSaving ? "Đang lưu..." : "Lưu điểm tiêu chí"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-[#dbdfe6] p-12 shadow-sm text-center">
                                <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">analytics</span>
                                <h3 className="text-lg font-bold text-gray-700">Chưa chọn Đợt đánh giá</h3>
                                <p className="text-gray-500 mt-2">Vui lòng chọn một đợt đánh giá từ danh sách phía trên để bắt đầu chấm điểm theo tiêu chí.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Document View Modal */}
                {viewingDocsGroup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="px-6 py-4 border-b border-[#dbdfe6] flex items-center justify-between bg-gray-50/50">
                                <h3 className="text-lg font-bold text-[#111318]">Tài liệu nộp - {viewingDocsGroup.groupName}</h3>
                                <button onClick={() => setViewingDocsGroup(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="p-6 max-h-[60vh] overflow-y-auto bg-[#f8f9fa]">
                                {viewingDocsGroup.submittedDocs && viewingDocsGroup.submittedDocs.length > 0 ? (
                                    <ul className="space-y-3">
                                        {viewingDocsGroup.submittedDocs.map(doc => (
                                            <li key={doc.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-[#dbdfe6] hover:border-primary/50 hover:shadow-md transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                                                        <span className="material-symbols-outlined text-orange-600 text-2xl">description</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-[#111318] line-clamp-1" title={doc.name}>{doc.name}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">
                                                            {doc.submittedAt ? new Date(doc.submittedAt).toLocaleString('vi-VN') : 'Chưa rõ thời gian'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <a href={doc.url} download={doc.name} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-lg transition-colors shrink-0" title="Tải xuống">
                                                    <span className="material-symbols-outlined text-[20px]">download</span>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center py-8">
                                        <span className="material-symbols-outlined text-gray-300 text-5xl mb-2">folder_off</span>
                                        <p className="text-gray-500 font-medium">Không có tài liệu nào được nộp trong đợt này</p>
                                    </div>
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

export default CriteriaGradingPage;
