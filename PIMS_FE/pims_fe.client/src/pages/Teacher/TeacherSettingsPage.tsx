import React from "react";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import Settings from "../../components/dashboard/Settings";
import { useAuth } from "../../context/AuthContext";

const TeacherSettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f6f8] text-[#111318] font-display">
      <TeacherSidebar currentPath="/teacher/settings" />

      <main className="flex-1 overflow-y-auto bg-[#f6f6f8]">
        <TeacherHeader
          title="Settings"
          subtitle={`Manage your profile and account settings, ${user?.fullName || "Lecturer"}.`}
        />

        <div className="p-8 max-w-[1200px] mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <Settings />
          </div>
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

export default TeacherSettingsPage;
