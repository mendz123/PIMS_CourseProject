import React from "react";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import GroupListContent from "../../components/shared/GroupListContent";

const GroupListPage: React.FC = () => {
    return (
        <div className="flex h-screen overflow-hidden bg-[#f6f6f8] text-[#111318] font-display">
            <TeacherSidebar currentPath="/teacher/groups" />

            <main className="flex-1 overflow-y-auto bg-[#f6f6f8]">
                <TeacherHeader
                    title="Group Management"
                    subtitle="View and manage all groups assigned to you in the current semester."
                />

                <div className="p-8 max-w-[1200px] mx-auto">
                    <GroupListContent showMentorInfo={false} />
                </div>
            </main>
        </div>
    );
};

export default GroupListPage;
