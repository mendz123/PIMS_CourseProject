import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface TeacherSidebarProps {
    currentPath?: string;
}

const TeacherSidebar: React.FC<TeacherSidebarProps> = ({ currentPath = "/teacher" }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { icon: "dashboard", label: "Dashboard", path: "/teacher", active: currentPath === "/teacher" },
        { icon: "fact_check", label: "Project Approvals", path: "/teacher/approvals", active: currentPath === "/teacher/approvals" },
        { icon: "trending_up", label: "Group Progress", path: "/teacher/progress", active: currentPath === "/teacher/progress" },
        { icon: "grade", label: "Grading", path: "/teacher/grading", active: currentPath === "/teacher/grading" },
        { icon: "group", label: "Student List", path: "/teacher/students", active: currentPath === "/teacher/students" },
    ];

    return (
        <aside className="w-64 flex-shrink-0 border-r border-[#dbdfe6] bg-white hidden md:flex flex-col">
            <div className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-primary rounded-lg size-10 flex items-center justify-center text-white">
                        <span className="material-symbols-outlined">school</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-[#111318] text-base font-bold leading-normal">PIMS Portal</h1>
                        <p className="text-[#616f89] text-xs font-normal">Lecturer Dashboard</p>
                    </div>
                </div>
                <nav className="flex flex-col gap-1 flex-1">
                    {navItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${item.active
                                    ? "bg-primary/10 text-primary"
                                    : "text-[#616f89] hover:bg-gray-100"
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                            <p className={`text-sm ${item.active ? "font-semibold" : "font-medium"}`}>{item.label}</p>
                        </button>
                    ))}
                </nav>
                <div className="mt-auto pt-6 space-y-3">
                    <button className="w-full flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-sm hover:bg-blue-700 transition-all">
                        <span className="material-symbols-outlined text-[18px]">campaign</span>
                        <span className="truncate">New Announcement</span>
                    </button>
                    <button
                        onClick={() => {
                            logout();
                            navigate("/login");
                        }}
                        className="w-full flex items-center justify-center gap-2 rounded-lg h-10 px-4 border border-[#dbdfe6] text-[#616f89] text-sm font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                    >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        <span className="truncate">Sign Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default TeacherSidebar;
