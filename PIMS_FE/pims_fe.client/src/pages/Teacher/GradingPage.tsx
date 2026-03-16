import React, { useState, useEffect } from "react";
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

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const groupsPerPage = 10;

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
        setCurrentPage(1); // Reset page on semester change
    }, [selectedSemesterId]);

    // Reset page when search or assessment filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedAssessmentId]);

    const toggleGroup = (groupId: number) => {
        setExpandedGroups(prev =>
            prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
        );
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
                                    {groups
                                        .filter(group => searchQuery.trim() === '' || group.groupName.toLowerCase().includes(searchQuery.toLowerCase()))
                                        .slice((currentPage - 1) * groupsPerPage, currentPage * groupsPerPage)
                                        .map(group => (
                                            <React.Fragment key={group.groupId}>
                                                {/* Hàng Nhóm - Accordion Header */}
                                                <tr className="bg-gray-50/50 cursor-pointer hover:bg-gray-100" onClick={() => toggleGroup(group.groupId)}>
                                                    <td className="px-6 py-4 flex items-center gap-2 font-bold text-primary">
                                                        <span className={`material-symbols-outlined transition-transform ${expandedGroups.includes(group.groupId) ? 'rotate-180' : ''}`}>
                                                            keyboard_arrow_down
                                                        </span>
                                                        {group.groupName}
                                                    </td>
                                                    <td colSpan={(assessments.filter(a => selectedAssessmentId === 'all' || a.assessmentId === selectedAssessmentId).length || 0) + 1} className="px-6 py-4 text-right">
                                                    </td>
                                                </tr>

                                                {/* Hàng Sinh viên - Accordion Content */}
                                                {expandedGroups.includes(group.groupId) && group.students.map(student => (
                                                    <tr key={student.userId} className="animate-in slide-in-from-top-1 duration-200">
                                                        <td className="px-10 py-4 text-sm font-medium border-r">{student.fullName}</td>
                                                        {assessments.filter(a => selectedAssessmentId === 'all' || a.assessmentId === selectedAssessmentId).map(a => {
                                                            const score = studentScores[student.userId]?.[a.assessmentId];
                                                            const hasCriteriaGrades = student.criteriaScores && student.criteriaScores[a.assessmentId] && Object.keys(student.criteriaScores[a.assessmentId]).length > 0;

                                                            return (
                                                                <td key={a.assessmentId} className="px-4 py-4 text-center border-r">
                                                                    {score !== undefined ? (
                                                                        <div 
                                                                            className={`w-16 mx-auto px-2 py-1 border rounded text-center text-sm font-bold ${
                                                                                hasCriteriaGrades 
                                                                                ? "bg-green-50 border-green-200 text-green-700" 
                                                                                : "bg-blue-50 border-blue-200 text-blue-700"
                                                                            }`} 
                                                                            title={hasCriteriaGrades ? "Điểm đã được chấm chi tiết theo tiêu chí" : "Điểm đánh giá trực tiếp"}
                                                                        >
                                                                            {score}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-400 font-medium">--</span>
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
                                                        <td className="px-6 py-4 text-right">
                                                            {student.totalScore !== undefined && student.totalScore !== null ? (
                                                                <div className="flex flex-col items-end gap-1">
                                                                    <span className={`font-bold ${student.totalScore < 5 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                                        {student.totalScore.toFixed(2)}
                                                                    </span>
                                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${student.totalScore < 5 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                                        {student.totalScore < 5 ? 'Failed' : 'Passed'}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="font-bold text-gray-400">--</span>
                                                            )}
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
                                                            <div className="w-full p-2 text-sm border border-orange-200 rounded-lg bg-white/50 min-h-[40px] text-gray-700">
                                                                {groupComments[group.groupId] || <span className="text-gray-400 italic">Chưa có nhận xét</span>}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                </tbody>
                            </table>

                            {/* Pagination Controls */}
                            {groups.filter(group => searchQuery.trim() === '' || group.groupName.toLowerCase().includes(searchQuery.toLowerCase())).length > groupsPerPage && (
                                <div className="p-4 bg-gray-50 border-t border-[#dbdfe6] flex items-center justify-between rounded-b-xl">
                                    <span className="text-sm text-[#616f89]">
                                        Hiển thị {Math.min((currentPage - 1) * groupsPerPage + 1, groups.filter(group => searchQuery.trim() === '' || group.groupName.toLowerCase().includes(searchQuery.toLowerCase())).length)} - {Math.min(currentPage * groupsPerPage, groups.filter(group => searchQuery.trim() === '' || group.groupName.toLowerCase().includes(searchQuery.toLowerCase())).length)} trong tổng số {groups.filter(group => searchQuery.trim() === '' || group.groupName.toLowerCase().includes(searchQuery.toLowerCase())).length} nhóm
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 border border-[#dbdfe6] rounded-lg text-sm font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Trước
                                        </button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: Math.ceil(groups.filter(group => searchQuery.trim() === '' || group.groupName.toLowerCase().includes(searchQuery.toLowerCase())).length / groupsPerPage) }, (_, i) => i + 1).map(page => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${currentPage === page ? 'bg-primary text-white' : 'text-[#616f89] hover:bg-white border border-[#dbdfe6] border-transparent hover:border-[#dbdfe6]'}`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(Math.ceil(groups.filter(group => searchQuery.trim() === '' || group.groupName.toLowerCase().includes(searchQuery.toLowerCase())).length / groupsPerPage), p + 1))}
                                            disabled={currentPage === Math.ceil(groups.filter(group => searchQuery.trim() === '' || group.groupName.toLowerCase().includes(searchQuery.toLowerCase())).length / groupsPerPage)}
                                            className="px-3 py-1 border border-[#dbdfe6] rounded-lg text-sm font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Sau
                                        </button>
                                    </div>
                                </div>
                            )}
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