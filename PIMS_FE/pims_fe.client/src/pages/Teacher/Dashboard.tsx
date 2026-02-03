import React from "react";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import TeacherStats from "../../components/teacher/TeacherStats";
import TopicApprovalsTable from "../../components/teacher/TopicApprovalsTable";
import PerformanceChart from "../../components/teacher/PerformanceChart";
import ProgressTrackingTable from "../../components/teacher/ProgressTrackingTable";
import { useAuth } from "../../context/AuthContext";

const TeacherDashboard: React.FC = () => {
    const { user } = useAuth();

    // Mock data for now (could be fetched from API)
    const topicApprovals = [
        { groupId: "G-201", title: "AI-driven Logistics Optimization", date: "Oct 24, 2023" },
        { groupId: "G-205", title: "Blockchain for Supply Chain", date: "Oct 25, 2023" },
        { groupId: "G-212", title: "IoT Smart Irrigation System", date: "Oct 26, 2023" },
    ];

    const performanceData = [
        { label: "Exceeding Expectation", percentage: 45, colorClass: "bg-primary" },
        { label: "On Track", percentage: 35, colorClass: "bg-[#07883b]" },
        { label: "Delayed", percentage: 15, colorClass: "bg-orange-500" },
        { label: "Critical", percentage: 5, colorClass: "bg-red-500" },
    ];

    const progressItems = [
        {
            groupName: "Eco-Trackers",
            leadStudent: "Marcus Aurelius",
            milestone: "Phase 2: Prototype",
            progress: 65,
            status: "On Track",
            statusColorClass: "bg-[#07883b]/10 text-[#07883b]"
        },
        {
            groupName: "Cyber-Shield",
            leadStudent: "Elena Rodriguez",
            milestone: "Phase 3: Testing",
            progress: 85,
            status: "Review Required",
            statusColorClass: "bg-orange-500/10 text-orange-500"
        },
        {
            groupName: "Data Miners",
            leadStudent: "Kevin Smith",
            milestone: "Phase 1: Design",
            progress: 30,
            status: "On Track",
            statusColorClass: "bg-[#07883b]/10 text-[#07883b]"
        }
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-[#f6f6f8] text-[#111318] font-display">
            <TeacherSidebar currentPath="/teacher" />

            <main className="flex-1 overflow-y-auto bg-[#f6f6f8]">
                <TeacherHeader
                    title="Lecturer Overview"
                    subtitle={`Welcome back, ${user?.fullName || "Lecturer"}. You have 12 pending tasks.`}
                />

                <div className="p-8 max-w-[1200px] mx-auto space-y-8">
                    <TeacherStats />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <TopicApprovalsTable items={topicApprovals} />
                        </div>
                        <div className="lg:col-span-1">
                            <PerformanceChart items={performanceData} />
                        </div>
                    </div>

                    <ProgressTrackingTable items={progressItems} totalCount={24} />
                </div>

                <footer className="p-8 pt-0 max-w-[1200px] mx-auto text-center">
                    <p className="text-[#616f89] text-xs font-medium">
                        © 2024 Project-based Learning Management System (PIMS) - Version 2.4.1
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default TeacherDashboard;
