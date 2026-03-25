import React, { useEffect, useState } from "react";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import TeacherStats from "../../components/teacher/TeacherStats";
import TopicApprovalsTable from "../../components/teacher/TopicApprovalsTable";
import PerformanceChart from "../../components/teacher/PerformanceChart";
import ProgressTrackingTable from "../../components/teacher/ProgressTrackingTable";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/api/Dashboard/teacher-overview');
        if (response.data && response.data.data) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f6f8] text-[#111318] font-display">
      <TeacherSidebar currentPath="/teacher/dashboard" />

      <main className="flex-1 overflow-y-auto bg-[#f6f6f8]">
        <TeacherHeader
          title="Lecturer Overview"
          subtitle={`Welcome back, ${user?.fullName || "Lecturer"}. You have 12 pending tasks.`}
        />

        <div className="p-8 max-w-[1200px] mx-auto space-y-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-gray-500 font-medium">Đang tải dữ liệu tổng quan...</span>
            </div>
          ) : dashboardData ? (
            <>
              <TeacherStats
                activeGroupsCount={dashboardData.activeGroupsCount}
                pendingProposalsCount={dashboardData.pendingProposalsCount}
                unreviewedReportsCount={dashboardData.unreviewedReportsCount}
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <TopicApprovalsTable items={dashboardData.topicApprovals || []} />
                </div>
                <div className="lg:col-span-1">
                  <PerformanceChart items={dashboardData.performanceData || []} />
                </div>
              </div>

              <ProgressTrackingTable items={dashboardData.progressItems || []} totalCount={dashboardData.activeGroupsCount} />
            </>
          ) : (
            <div className="text-center p-8 text-gray-500">Failed to load dashboard data.</div>
          )}
        </div>

        <footer className="p-8 pt-0 max-w-[1200px] mx-auto text-center">
          <p className="text-[#616f89] text-xs font-medium">
            © 2024 Project-based Learning Management System (PIMS) - Version
            2.4.1
          </p>
        </footer>
      </main>
    </div>
  );
};

export default TeacherDashboard;
