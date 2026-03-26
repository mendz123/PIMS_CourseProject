import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useGroup } from "../../hooks/useGroup";
import { groupService } from "../../services/groupService";
import { assessmentService } from "../../services/assessmentService";
import type { GroupDetailDto } from "../../types/group.types";
import type { StudentMyAssessmentsDto } from "../../types/assessment.types";
import { format, differenceInDays, parseISO, isFuture } from "date-fns";
import { Loader2, Users, BookOpen, FileText, MessageSquare } from "lucide-react";

const StudentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { hasGroup, groupLoading } = useGroup();
    const [groupDetail, setGroupDetail] = useState<GroupDetailDto | null>(null);
    const [assessmentsData, setAssessmentsData] = useState<StudentMyAssessmentsDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!groupLoading && !hasGroup) {
            navigate("/student/group", { replace: true });
        }
    }, [groupLoading, hasGroup, navigate]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // Fetch both in parallel
            const [groupRes, assessmentRes] = await Promise.allSettled([
                groupService.getMyGroupDetail(),
                assessmentService.getMyAssessments()
            ]);

            if (groupRes.status === 'fulfilled' && groupRes.value.success && groupRes.value.data) {
                setGroupDetail(groupRes.value.data);
            } else if (groupRes.status === 'fulfilled' && !groupRes.value.success) {
                console.error("Group fetch failed:", groupRes.value.message);
            }

            if (assessmentRes.status === 'fulfilled' && assessmentRes.value.success && assessmentRes.value.data) {
                setAssessmentsData(assessmentRes.value.data);
            } else if (assessmentRes.status === 'fulfilled' && !assessmentRes.value.success) {
                console.error("Assessments fetch failed:", assessmentRes.value.message);
            }
            
            // If both failed fundamentally (not just 404), show error
            if (groupRes.status === 'rejected' && assessmentRes.status === 'rejected') {
                setError("Failed to load dashboard data. Please try again later.");
            }

        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (hasGroup) {
            fetchData();
        } else if (!groupLoading) {
            setLoading(false);
        }
    }, [hasGroup, groupLoading, fetchData]);

    const stats = useMemo(() => {
        if (!assessmentsData) return null;

        const allAssessments = assessmentsData.assessments || [];
        const gradedAssessments = allAssessments.filter(a => a.score !== undefined && a.score !== null);
        const totalWeight = allAssessments.reduce((sum, a) => sum + (a.weight || 0), 0);

        const completionPercentage = totalWeight > 0
            ? Math.round((gradedAssessments.reduce((sum, a) => sum + (a.weight || 0), 0) / totalWeight) * 100)
            : 0;

        const pendingAssessments = allAssessments.filter(a =>
            (a.score === undefined || a.score === null) &&
            a.startDate && !isFuture(parseISO(a.startDate))
        );

        const nextMilestone = allAssessments
            .filter(a => a.deadline && isFuture(parseISO(a.deadline)))
            .sort((a, b) => parseISO(a.deadline!).getTime() - parseISO(b.deadline!).getTime())[0];

        const daysLeft = nextMilestone && nextMilestone.deadline
            ? differenceInDays(parseISO(nextMilestone.deadline), new Date())
            : null;

        const reportsCount = gradedAssessments.length;

        const latestFeedback = allAssessments
            .filter(a => a.teacherComment)
            .sort((a, b) => (b.assessmentId - a.assessmentId))[0]?.teacherComment;

        return {
            completionPercentage,
            tasksDone: gradedAssessments.length,
            tasksTotal: allAssessments.length,
            pending: pendingAssessments.length,
            daysLeft,
            reportsCount,
            nextMilestone,
            latestFeedback
        };
    }, [assessmentsData]);

    if (groupLoading || loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-gray-500 font-medium">Loading project dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-600">
                <p className="text-lg font-medium">{error}</p>
                <button onClick={fetchData} className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition">
                    Retry
                </button>
            </div>
        );
    }

    if (!hasGroup) return null;

    const project = groupDetail?.project;
    const semesterName = groupDetail?.semesterName || "Current Semester";
    const statusColor = project?.statusId === 3 || project?.statusId === 4
        ? "bg-green-100 text-green-700"
        : project?.statusId === 1 || project?.statusId === 2
            ? "bg-yellow-100 text-yellow-700"
            : "bg-gray-100 text-gray-700";

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            {/* Project Overview & Progress Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${statusColor}`}>
                                {project?.statusName || "No Topic Registered"}
                            </span>
                            <h3 className="text-2xl font-bold mt-2 text-gray-900 group">
                                {project?.title || "Project Not Yet Assigned"}
                            </h3>
                            <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                                <BookOpen className="h-3.5 w-3.5" />
                                {semesterName}
                            </p>
                        </div>
                        <Link
                            to="/student/group"
                            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
                        >
                            View Projects
                        </Link>
                    </div>
                    <div className="mt-8">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                            <span className="text-xl font-bold text-primary">{stats?.completionPercentage || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                            <div
                                className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${stats?.completionPercentage || 0}%` }}
                            ></div>
                        </div>
                        <div className="flex flex-col">
                            <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Upcoming Deadline</h4>
                            {stats?.nextMilestone ? (
                                <span className="text-sm font-medium">
                                    Next Milestone: {stats.nextMilestone.title} 
                                    {stats.nextMilestone.deadline && (
                                        <> ({format(parseISO(stats.nextMilestone.deadline), "MMM d, yyyy")})</>
                                    )}
                                </span>
                            ) : (
                                <span className="text-sm text-gray-400">No upcoming milestones</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Quick Stats
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-600 font-semibold uppercase">Assessments</p>
                            <p className="text-2xl font-bold text-blue-900">
                                {stats?.tasksDone}/{stats?.tasksTotal}
                            </p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg">
                            <p className="text-xs text-orange-600 font-semibold uppercase">Pending</p>
                            <p className="text-2xl font-bold text-orange-900">{stats?.pending || 0}</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                            <p className="text-xs text-purple-600 font-semibold uppercase">Days Left</p>
                            <p className="text-2xl font-bold text-purple-900">{stats?.daysLeft !== null ? stats.daysLeft : "N/A"}</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-xs text-green-600 font-semibold uppercase">Reports</p>
                            <p className="text-2xl font-bold text-green-900">
                                {stats?.reportsCount}/{stats?.tasksTotal}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Group Status & Feedback Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                Group Members
                            </h4>
                            <Link to="/student/group" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                                Manage Group
                                <span className="material-symbols-outlined text-xs">arrow_forward</span>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {groupDetail?.members?.map((member) => (
                                <div key={member.userId} className="p-4 border border-gray-100 rounded-xl flex items-center gap-4 hover:shadow-md transition-all group">
                                    <div className="h-12 w-12 rounded-full bg-cover bg-gray-200 border-2 border-transparent group-hover:border-primary/20"
                                        style={{ backgroundImage: member.avatarUrl ? `url(${member.avatarUrl})` : "none" }}>
                                        {!member.avatarUrl && <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold uppercase">{member.fullName.charAt(0)}</div>}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-sm text-gray-900 truncate">{member.fullName}</p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            {member.userId === groupDetail.leaderId ? "Group Leader" : "Member"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                    <div className="flex items-center gap-2 mb-6">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        <h4 className="font-bold text-lg text-gray-900">Recent Feedback</h4>
                    </div>
                    <div className="space-y-4">
                        {stats?.latestFeedback ? (
                            <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600 italic border-l-4 border-primary">
                                "{stats.latestFeedback}"
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-400 italic">
                                No feedback received yet.
                            </div>
                        )}
                        <Link
                            to="/student/assessment"
                            className="w-full py-2.5 text-primary text-sm font-bold border border-primary/20 rounded-lg hover:bg-primary/5 transition flex items-center justify-center gap-1"
                        >
                            View Assessments
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;