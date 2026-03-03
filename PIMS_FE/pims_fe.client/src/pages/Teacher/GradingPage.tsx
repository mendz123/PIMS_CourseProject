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
    scores: { [criteriaId: number]: number };
    comment: string;
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
    const [selectedGroupId, setSelectedGroupId] = useState<number | 'all'>('all');
    const [selectedAssessmentId, setSelectedAssessmentId] = useState<number | 'all'>('all');

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

    // Reset assessments and groups when semester changes
    useEffect(() => {
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
                    const mappedGroups: GroupGrading[] = groupsRes.data.map((g: TeacherGroupDto) => ({
                        groupId: g.groupId,
                        groupName: g.groupName,
                        submittedDocs: g.submittedDocs,
                        students: Array.from({ length: g.memberCount }).map((_, i) => ({
                            userId: g.groupId * 100 + i, // Mock ID
                            fullName: `Thành viên ${i + 1} (Nhóm ${g.groupId})`,
                            scores: {},
                            comment: ""
                        }))
                    }));
                    setGroups(mappedGroups);
                } else {
                    setGroups([]);
                }
            } catch (error) {
                console.error("Failed to fetch groups data", error);
                setGroups([]);
            }

            setLoading(false);
        };
        fetchSemesterData();
    }, [selectedSemesterId]);

    const toggleGroup = (groupId: number) => {
        setExpandedGroups(prev =>
            prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
        );
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[#f6f6f8] text-[#111318]">
            <TeacherSidebar currentPath="/teacher/grading" />

            <main className="flex-1 overflow-y-auto">
                <TeacherHeader title="Chấm điểm sinh viên" subtitle="Đánh giá năng lực dựa trên các tiêu chí cụ thể." />

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
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-[#616f89]">Lọc theo nhóm:</span>
                                <select
                                    className="p-2 border border-[#dbdfe6] rounded-lg outline-none focus:border-primary text-sm font-medium text-[#616f89]"
                                    value={selectedGroupId.toString()}
                                    onChange={(e) => setSelectedGroupId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                >
                                    <option value="all">-- Tất cả các nhóm --</option>
                                    {groups.map(g => (
                                        <option key={g.groupId} value={g.groupId}>
                                            {g.groupName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-[#616f89]">Lọc theo tiêu chí:</span>
                                <select
                                    className={`p-2 border rounded-lg outline-none text-sm font-medium transition-colors ${(!assessments || assessments.length === 0)
                                        ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                        : "border-[#dbdfe6] focus:border-primary text-[#616f89]"
                                        }`}
                                    value={selectedAssessmentId.toString()}
                                    onChange={(e) => setSelectedAssessmentId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                    disabled={!assessments || assessments.length === 0}
                                    title={(!assessments || assessments.length === 0) ? "Không có dữ liệu tiêu chí để lọc" : ""}
                                >
                                    <option value="all">
                                        {(!assessments || assessments.length === 0)
                                            ? "-- Không có tiêu chí --"
                                            : "-- Tất cả các tiêu chí --"}
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
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-center">Đánh giá chung</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-right">Tổng điểm</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#dbdfe6]">
                                {groups.filter(g => selectedGroupId === 'all' || g.groupId === selectedGroupId).map(group => (
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
                                                {assessments.filter(a => selectedAssessmentId === 'all' || a.assessmentId === selectedAssessmentId).map(a => (
                                                    <td key={a.assessmentId} className="px-4 py-4 text-center border-r">
                                                        <input
                                                            type="number" step="0.1" max="10" min="0" placeholder="0.0"
                                                            className="w-16 px-2 py-1 border border-[#dbdfe6] rounded text-center focus:ring-1 focus:ring-primary outline-none"
                                                        />
                                                    </td>
                                                ))}
                                                <td className="px-4 py-4 border-r">
                                                    <textarea
                                                        rows={1} placeholder="Nhận xét..."
                                                        className="w-full p-2 text-sm border border-[#dbdfe6] rounded-lg focus:ring-1 focus:ring-primary outline-none"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-orange-600">--</td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>

                        <div className="p-6 bg-gray-50 border-t border-[#dbdfe6] flex justify-end gap-3">
                            <button className="px-6 py-2 border border-[#dbdfe6] text-[#616f89] font-bold rounded-xl hover:bg-white">Hủy</button>
                            <button className="px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-blue-700">Lưu điểm</button>
                        </div>
                    </div>
                </div>

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
                                                <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors shrink-0" title="Tải xuống">
                                                    <span className="material-symbols-outlined">download</span>
                                                </button>
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