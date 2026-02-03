import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const MainLayout: React.FC = () => {
    const location = useLocation();

    // Logic đặt tên tiêu đề Header dựa trên đường dẫn
    const getHeaderTitle = () => {
        switch (location.pathname) {
            case "/dashboard": return "Project Dashboard";
            case "/reports": return "Nộp báo cáo tiến độ";
            case "/group": return "My Group";
            default: return "Student Portal";
        }
    };

    return (
        <div className="bg-[#f6f6f8] min-h-screen flex overflow-hidden font-display">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-y-auto">
                <Header title={getHeaderTitle()} />
                <main className="p-8 w-full max-w-7xl mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;