import React from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { GroupProvider } from "../../context/GroupContext";

const MainLayout: React.FC = () => {
    const location = useLocation();

    if (location.pathname === "/student" || location.pathname === "/student/") {
        return <Navigate to="/student/group" replace />;
    }

    const getHeaderTitle = () => {
        switch (location.pathname) {
            case "/student/dashboard": return "Project Dashboard";
            case "/student/reports": return "Nộp báo cáo tiến độ";
            case "/student/group": return "My Group";
            case "/student/notifications": return "Thông báo";
            case "/student/assessment": return "Assessment";
            default: return "Student Portal";
        }
    };

    return (
        <GroupProvider>
            <div className="bg-[#f6f6f8] min-h-screen flex overflow-hidden font-display">
                <Sidebar />
                <div className="flex-1 flex flex-col h-screen overflow-y-auto">
                    <Header title={getHeaderTitle()} />
                    <main className="p-8 w-full max-w-7xl mx-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </GroupProvider>
    );
};

export default MainLayout;