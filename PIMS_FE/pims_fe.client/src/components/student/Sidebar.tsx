import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Cập nhật path có tiền tố /student để khớp với routes.tsx
    const menuItems = [
        { name: "Dashboard", icon: "dashboard", path: "/student/dashboard" },
        { name: "My Group", icon: "group", path: "/student/group" },
        { name: "Progress Reports", icon: "assignment", path: "/student/reports" },
        { name: "Assessment", icon: "task", path: "/student/assessment" },
        { name: "Notifications", icon: "notifications", path: "/student/notifications" },
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
                    // Kiểm tra xem đường dẫn hiện tại có khớp với item.path không
                    const isActive = location.pathname === item.path;

                    return (
                        <div
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${isActive
                                    ? "bg-primary/10 text-primary border-r-4 border-primary rounded-r-none"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            <span className={`material-symbols-outlined ${isActive ? "fill-1" : ""}`}>
                                {item.icon}
                            </span>
                            <p className={`text-sm ${isActive ? "font-bold" : "font-medium"}`}>
                                {item.name}
                            </p>
                        </div>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-200">
                <div
                    className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                    onClick={() => {
                        logout();
                        navigate("/login");
                    }}
                >
                    <span className="material-symbols-outlined">logout</span>
                    <p className="text-sm font-medium">Sign Out</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;