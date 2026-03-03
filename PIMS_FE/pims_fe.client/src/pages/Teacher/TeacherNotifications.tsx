import React from "react";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import TeacherNotificationsContent from "../../components/teacher/TeacherNotificationsContent";

const TeacherNotifications: React.FC = () => {
    return (
        <div className="flex h-screen overflow-hidden bg-[#f6f6f8] text-[#111318] font-display">
            <TeacherSidebar currentPath="/teacher/notifications" />

            <main className="flex-1 overflow-y-auto bg-[#f6f6f8]">
                <TeacherHeader
                    title="Notifications"
                    subtitle="Your latest updates and mentor invitations from student groups."
                />

                <div className="p-8 max-w-[1200px] mx-auto">
                    <TeacherNotificationsContent />
                </div>
            </main>
        </div>
    );
};

export default TeacherNotifications;
