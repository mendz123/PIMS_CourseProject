import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useGroup } from "../../hooks/useGroup";

const Sidebar: React.FC = () => {
    const { logout, user } = useAuth();
    const { hasGroup, groupLoading } = useGroup();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { name: "Dashboard", icon: "dashboard", path: "/student/dashboard", requiresGroup: true },
        { name: "My Group", icon: "group", path: "/student/group", requiresGroup: false },
        { name: "Progress Reports", icon: "assignment", path: "/student/reports", requiresGroup: true },
        { name: "Assessment", icon: "task", path: "/student/assessment", requiresGroup: true },
        { name: "Notifications", icon: "notifications", path: "/student/notifications", requiresGroup: false },
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
            <div className="p-6 flex items-center gap-3">
                <div className="bg-primary size-10 rounded-lg flex items-center justify-center text-white">
                    <span className="material-symbols-outlined">rocket_launch</span>
                </div>
                <div>
                    <h1 className="text-[#111318] text-lg font-bold leading-tight">PIMS</h1>
                    <p className="text-[#616f89] text-xs font-normal">Student Portal</p>
                </div>
            </div>

            <nav className="flex-1 px-4 flex flex-col gap-1">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const isLocked = !groupLoading && item.requiresGroup && !hasGroup;

                    return (
                        <div
                            key={item.path}
                            onClick={() => !isLocked && navigate(item.path)}
                            title={isLocked ? "Bạn cần có nhóm để truy cập mục này" : undefined}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                                isLocked
                                    ? "text-gray-300 cursor-not-allowed"
                                    : isActive
                                        ? "bg-primary/10 text-primary border-r-4 border-primary rounded-r-none cursor-pointer"
                                        : "text-gray-600 hover:bg-gray-100 cursor-pointer"
                            }`}
                        >
                            <span className={`material-symbols-outlined ${isActive && !isLocked ? "fill-1" : ""}`}>
                                {isLocked ? "lock" : item.icon}
                            </span>
                            <p className={`text-sm ${isActive && !isLocked ? "font-bold" : "font-medium"}`}>
                                {item.name}
                            </p>
                        </div>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-3">
                    <div
                        className="size-10 rounded-full bg-cover bg-center border-2 border-white shadow-sm"
                        style={{
                            backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "S")}&background=135bec&color=fff')`
                        }}
                    ></div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{user?.fullName || "Student"}</p>
                        <p className="text-[10px] text-gray-500 truncate">{user?.email || "student@pims.com"}</p>
                    </div>
                </div>
                <div
                    className="flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                    onClick={() => {
                        logout();
                        navigate("/login");
                    }}
                >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    <p className="text-sm font-bold">Sign Out</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;