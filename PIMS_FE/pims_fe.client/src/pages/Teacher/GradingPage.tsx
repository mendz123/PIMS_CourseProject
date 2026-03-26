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
                // 1. Get semester list
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
            const assessmentRes = await assessmentService.getAssessmentsWithCriteria(selectedSemesterId, true);
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
                <TeacherHeader title="Student Total Scores" subtitle="Total scores of students in the semester." />

                {loading ? (
                    <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-3 text-gray-500 font-medium">Loading data...</span>
                    </div>
                ) : (
                    <div className="p-8 max-w-[1400px] mx-auto space-y-6">
                        {/* 1. Assessment Selection */}
                        <section className="bg-white rounded-xl border border-[#dbdfe6] p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold uppercase text-[#616f89]">Select Assessment Period</h3>
                                <select
                                    className="p-2 border border-[#dbdfe6] rounded-lg outline-none focus:border-primary text-sm font-medium text-[#616f89]"
                                    value={selectedSemesterId || ''}
                                    onChange={(e) => setSelectedSemesterId(Number(e.target.value))}
                                >
                                    <option value="" disabled>-- Select Semester --</option>
                                    {semesters.map(s => (
                                        <option key={s.semesterId} value={s.semesterId}>
                                            {s.semesterName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Group and criteria filters */}
                            <div className="mt-4 flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-3 relative">
                                    <span className="material-symbols-outlined absolute left-3 text-gray-400 font-bold" style={{ fontSize: '18px' }}>search</span>
                                    <input
                                        type="text"
                                        placeholder="Search by group name..."
                                        className="pl-9 pr-4 py-2 border border-[#dbdfe6] rounded-lg outline-none focus:border-primary text-sm font-medium text-[#111318] w-64"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-[#616f89]">Filter by Period:</span>
                                    <select
                                        className={`p-2 border rounded-lg outline-none text-sm font-medium transition-colors ${(!assessments || assessments.length === 0)
                                            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                            : "border-[#dbdfe6] focus:border-primary text-[#616f89]"
                                            }`}
                                        value={selectedAssessmentId.toString()}
                                        onChange={(e) => setSelectedAssessmentId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                        disabled={!assessments || assessments.length === 0}
                                        title={(!assessments || assessments.length === 0) ? "No assessment data to filter" : ""}
                                    >
                                        <option value="all">
                                            {(!assessments || assessments.length === 0)
                                                ? "-- No Assessments --"
                                                : "-- All Assessments --"}
                                        </option>
                                        {assessments.map(a => (
                                            <option key={a.assessmentId} value={a.assessmentId}>
                                                {a.title} {!a.isRetake && `(${a.weight}%)`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* 2. Grading table by criteria */}
                        <div className="bg-white rounded-xl border border-[#dbdfe6] shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#f8f9fa] border-b border-[#dbdfe6]">
                                        <th className="px-6 py-4 text-xs font-bold uppercase w-[250px]">Group / Student</th>
                                        {assessments.filter(a => selectedAssessmentId === 'all' || a.assessmentId === selectedAssessmentId).map(a => (
                                            <th key={a.assessmentId} className="px-4 py-4 text-xs font-bold uppercase text-center bg-orange-50/30">
                                                {a.title} <br />
                                                {!a.isRetake && (
                                                    <span className="text-orange-600">({a.weight}%)</span>
                                                )}
                                            </th>
                                        ))}
                                        {/*<th className="px-6 py-4 text-xs font-bold uppercase text-center">Đánh giá chung</th>*/}
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-right">Total Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#dbdfe6]">
                                    {groups
                                        .filter(group => searchQuery.trim() === '' || group.groupName.toLowerCase().includes(searchQuery.toLowerCase()))
                                        .slice((currentPage - 1) * groupsPerPage, currentPage * groupsPerPage)
                                        .map(group => (
                                            <React.Fragment key={group.groupId}>
                                                {/* Group Row - Accordion Header */}
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

                                                {/* Student Row - Accordion Content */}
                                                {expandedGroups.includes(group.groupId) && group.students.map(student => (
                                                    <tr key={student.userId} className="animate-in slide-in-from-top-1 duration-200">
                                                        <td className="px-10 py-4 text-sm font-medium border-r">{student.fullName}</td>
                                                        {assessments.filter(a => selectedAssessmentId === 'all' || a.assessmentId === selectedAssessmentId).map(a => {
                                                            const score = studentScores[student.userId]?.[a.assessmentId];
                                                            const hasCriteriaGrades = student.criteriaScores && student.criteriaScores[a.assessmentId] && Object.keys(student.criteriaScores[a.assessmentId]).length > 0;
                                                            const isFailedFinalScore = a.isFinal && score !== undefined && score !== null && score < 4;

                                                            return (
                                                                <td key={a.assessmentId} className="px-4 py-4 text-center border-r">
                                                                    {score !== undefined ? (
                                                                        <div 
                                                                            className={`w-16 mx-auto px-2 py-1 border rounded text-center text-sm font-bold ${
                                                                                isFailedFinalScore
                                                                                ? "bg-rose-50 border-rose-200 text-rose-700"
                                                                                : hasCriteriaGrades 
                                                                                ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                                                                                : "bg-blue-50 border-blue-200 text-blue-700"
                                                                            }`} 
                                                                            title={isFailedFinalScore ? "Final exam score is below the passing threshold (4.0)" : (hasCriteriaGrades ? "Score has been graded in detail by criteria" : "Direct assessment score")}
                                                                        >
                                                                            {score}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-400 font-medium">--</span>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}

                                                        {/* General Review Checkbox (removed textarea here, moved to Group level or kept as common text) 
                                                    But to keep the layout nice, we keep the textarea empty or just text "--" for students, 
                                                    and display text for the Group */}
                                                        {/*<td className="px-4 py-4 border-r text-center text-sm text-gray-400">*/}
                                                        {/*    --*/}
                                                        {/*</td>*/}
                                                        <td className="px-6 py-4 text-right">
                                                            {student.totalScore !== undefined && student.totalScore !== null ? (
                                                                (() => {
                                                                    const hasFailedFinal = (student.criteriaScores && Object.keys(student.criteriaScores).some(aId => {
                                                                        const a = assessments.find(ax => ax.assessmentId === Number(aId));
                                                                        return a?.isFinal && (studentScores[student.userId]?.[Number(aId)] ?? 0) < 4;
                                                                    })) || assessments.some(a => a.isFinal && (studentScores[student.userId]?.[a.assessmentId] ?? 0) < 4);
                                                                    
                                                                    if (student.totalScore === null || student.totalScore === undefined) {
                                                                        return <span className="font-bold text-gray-400 text-right w-full block">--</span>;
                                                                    }

                                                                    const isPassed = student.totalScore >= 5 && !hasFailedFinal;
                                                                    
                                                                    return (
                                                                        <div className="flex flex-col items-end gap-1">
                                                                            <span className={`font-bold ${!isPassed ? 'text-red-600' : 'text-emerald-600'}`}>
                                                                                {student.totalScore.toFixed(2)}
                                                                            </span>
                                                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${!isPassed ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                                                {!isPassed ? 'Failed' : 'Passed'}
                                                                            </span>
                                                                            {hasFailedFinal && (
                                                                                <span className="text-[9px] text-red-400 font-bold italic text-right break-words max-w-[80px]">Final {"<"} 4.0</span>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })()
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
                                                            General comments for group {group.groupName}:
                                                        </td>
                                                        <td colSpan={(assessments.filter(a => selectedAssessmentId === 'all' || a.assessmentId === selectedAssessmentId).length || 0) + 1} className="px-4 py-3">
                                                            <div className="w-full p-2 text-sm border border-orange-200 rounded-lg bg-white/50 min-h-[40px] text-gray-700">
                                                                {groupComments[group.groupId] || <span className="text-gray-400 italic">No comments yet</span>}
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
                                        Showing {Math.min((currentPage - 1) * groupsPerPage + 1, groups.filter(group => searchQuery.trim() === '' || group.groupName.toLowerCase().includes(searchQuery.toLowerCase())).length)} - {Math.min(currentPage * groupsPerPage, groups.filter(group => searchQuery.trim() === '' || group.groupName.toLowerCase().includes(searchQuery.toLowerCase())).length)} of {groups.filter(group => searchQuery.trim() === '' || group.groupName.toLowerCase().includes(searchQuery.toLowerCase())).length} groups
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 border border-[#dbdfe6] rounded-lg text-sm font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
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
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* View Documents Modal */}
                {viewingDocsGroup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="px-6 py-4 border-b border-[#dbdfe6] flex items-center justify-between bg-gray-50/50">
                                <h3 className="text-lg font-bold text-[#111318]">Submitted documents - {viewingDocsGroup.groupName}</h3>
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
                                                        <p className="text-xs text-gray-500">Submitted at: {doc.submittedAt}</p>
                                                    </div>
                                                </div>
                                                <a href={doc.url} download={doc.name} target="_blank" rel="noopener noreferrer" className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors shrink-0" title="Download">
                                                    <span className="material-symbols-outlined">download</span>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center py-6 text-gray-500">No documents have been submitted.</div>
                                )}
                            </div>
                            <div className="px-6 py-4 border-t border-[#dbdfe6] bg-gray-50 flex justify-end">
                                <button onClick={() => setViewingDocsGroup(null)} className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors">
                                    Close
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