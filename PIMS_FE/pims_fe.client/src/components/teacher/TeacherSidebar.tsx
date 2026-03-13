import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { notificationService } from "../../services/notificationService";

interface TeacherSidebarProps {
  currentPath?: string;
}

const TeacherSidebar: React.FC<TeacherSidebarProps> = ({
  currentPath = "/teacher",
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = React.useState<number>(0);

  React.useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationService.getUnreadCount();
        if (response && response.success) {
          setUnreadCount(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    fetchUnreadCount();

    // Optional: Refresh count periodically (e.g., every 1 minute)
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    {
      icon: "dashboard",
      label: "Dashboard",
      path: "/teacher/dashboard",
      active: currentPath === "/teacher/dashboard",
    },
    {
      icon: "fact_check",
      label: "Project Approvals",
      path: "/teacher/approvals",
      active: currentPath === "/teacher/approvals",
    },
    {
      icon: "groups",
      label: "Group Management",
      path: "/teacher/groups",
      active: currentPath === "/teacher/groups",
    },
    {
      icon: "trending_up",
      label: "Group Progress",
      path: "/teacher/progress",
      active: currentPath === "/teacher/progress",
    },
    {
      icon: "grade",
      label: "Grading",
      path: "/teacher/grading",
      active: currentPath === "/teacher/grading",
    },
    {
      icon: "checklist",
      label: "Criteria Grading",
      path: "/teacher/grading-criteria",
      active: currentPath === "/teacher/grading-criteria",
    },
    {
      icon: "group",
      label: "Student List",
      path: "/teacher/students",
      active: currentPath === "/teacher/students",
    },
    {
      icon: "notifications",
      label: "Notifications",
      path: "/teacher/notifications",
      active: currentPath === "/teacher/notifications",
      unreadCount: unreadCount,
    },
    {
      icon: "settings",
      label: "Settings",
      path: "/teacher/settings",
      active: currentPath === "/teacher/settings",
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-[#dbdfe6] bg-white hidden md:flex flex-col">
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary rounded-lg size-10 flex items-center justify-center text-white">
            <span className="material-symbols-outlined">school</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-[#111318] text-base font-bold leading-normal">
              PIMS Portal
            </h1>
            <p className="text-[#616f89] text-xs font-normal">
              Lecturer Dashboard
            </p>
          </div>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                item.active
                  ? "bg-primary/10 text-primary"
                  : "text-[#616f89] hover:bg-gray-100"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {item.icon}
              </span>
              <p
                className={`text-sm ${item.active ? "font-semibold" : "font-medium"}`}
              >
                {item.label}
              </p>
              {item.label === "Notifications" && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-6 space-y-3">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full flex items-center justify-center gap-2 rounded-lg h-10 px-4 border border-[#dbdfe6] text-[#616f89] text-sm font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">
              logout
            </span>
            <span className="truncate">Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default TeacherSidebar;
