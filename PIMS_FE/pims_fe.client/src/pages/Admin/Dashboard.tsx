import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import Settings from "../../components/dashboard/Settings";
import UserManagement from "../../components/admin/UserManagement";
import NotificationNavbar from "../../components/dashboard/NotificationNavbar";
import Notifications from "../../components/dashboard/Notifications";
import "./Dashboard.css";

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get active tab from URL query param "tab", default to "overview" if missing
  const activeTab = searchParams.get("tab") || "overview";

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  const sidebarItems = [
    { id: "overview", icon: "dashboard", label: "Overview" },
    { id: "users", icon: "group", label: "Users Management" },
    { id: "notifications", icon: "notifications", label: "Notifications" },
    { id: "settings", icon: "settings", label: "Settings" },
  ];

  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      icon: "group",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Active Courses",
      value: "42",
      icon: "book",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      trend: "+5%",
      trendUp: true,
    },
    {
      title: "New Signups",
      value: "128",
      icon: "person_add",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      trend: "+18%",
      trendUp: true,
    },
    {
      title: "Revenue",
      value: "$12,450",
      icon: "payments",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      trend: "+8%",
      trendUp: true,
    },
  ];

  const recentActivities = [
    {
      user: "John Doe",
      action: "Created a new course",
      time: "2 hours ago",
      icon: "add_circle",
      initials: "JD",
      color: "bg-blue-100 text-blue-600",
    },
    {
      user: "Jane Smith",
      action: "Updated profile",
      time: "4 hours ago",
      icon: "edit",
      initials: "JS",
      color: "bg-purple-100 text-purple-600",
    },
    {
      user: "Mike Johnson",
      action: "Registered for React 101",
      time: "5 hours ago",
      icon: "how_to_reg",
      initials: "MJ",
      color: "bg-green-100 text-green-600",
    },
    {
      user: "Sarah Williams",
      action: "Posted a new announcement",
      time: "1 day ago",
      icon: "campaign",
      initials: "SW",
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f6f8] flex font-display">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-[#dbdfe6] flex flex-col z-20">
        <div className="p-6 flex items-center gap-3 border-b border-[#dbdfe6]">
          <div className="p-2 bg-primary rounded-lg">
            <span className="material-symbols-outlined text-white">
              admin_panel_settings
            </span>
          </div>
          <div>
            <h1 className="text-base font-bold text-[#111318] leading-none">
              PIMS Admin
            </h1>
            <p className="text-[#616f89] text-xs mt-1">System Administration</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-[#616f89] hover:bg-[#f6f6f8]"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#dbdfe6] space-y-2">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#616f89] hover:bg-[#f6f6f8] transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">
              arrow_back
            </span>
            <span className="text-sm font-medium">Back to Home</span>
          </button>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#616f89] hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">
              logout
            </span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#dbdfe6] px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <a
                className="text-[#616f89] text-sm font-medium hover:text-primary transition-colors"
                href="#"
              >
                Dashboard
              </a>
              <span className="text-[#616f89] text-sm">/</span>
              <span className="text-[#111318] text-sm font-bold capitalize">
                {activeTab}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationNavbar />
            <div className="flex items-center gap-3 bg-[#f6f6f8] p-1.5 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                {user?.fullName?.charAt(0) || "A"}
              </div>
              <span className="text-sm font-medium pr-2">
                {user?.fullName || "Admin"}
              </span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {activeTab === "overview" ? (
            <>
              {/* Welcome Header */}
              <div className="mb-8">
                <h2 className="text-3xl font-black text-[#111318] tracking-tight">
                  Welcome back, {user?.fullName || "Admin"}
                </h2>
                <p className="text-[#616f89] mt-1">
                  Here's what's happening today.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white border border-[#dbdfe6] p-6 rounded-xl shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                        <span
                          className={`material-symbols-outlined ${stat.iconColor}`}
                        >
                          {stat.icon}
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          stat.trendUp
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {stat.trend}
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold text-[#111318] mb-1">
                      {stat.value}
                    </h3>
                    <p className="text-[#616f89] text-sm font-medium">
                      {stat.title}
                    </p>
                  </div>
                ))}
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white border border-[#dbdfe6] rounded-xl shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-[#dbdfe6] flex justify-between items-center">
                    <h3 className="text-lg font-bold text-[#111318]">
                      Recent Activity
                    </h3>
                    <button className="text-sm text-primary font-semibold hover:underline">
                      View All
                    </button>
                  </div>
                  <div className="divide-y divide-[#dbdfe6]">
                    {recentActivities.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 hover:bg-[#f6f6f8] transition-colors"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${activity.color}`}
                        >
                          {activity.initials}
                        </div>
                        <div className="flex-1">
                          <p className="text-[#111318] font-medium text-sm">
                            {activity.user}{" "}
                            <span className="text-[#616f89] font-normal">
                              {activity.action}
                            </span>
                          </p>
                          <p className="text-[#616f89] text-xs mt-1">
                            {activity.time}
                          </p>
                        </div>
                        <button className="text-[#616f89] hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-lg">
                            more_horiz
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                  <div className="bg-primary p-6 rounded-xl text-white shadow-lg shadow-primary/20 relative overflow-hidden">
                    <div className="relative z-10">
                      <h3 className="text-lg font-bold mb-2">Quick Actions</h3>
                      <p className="text-white/80 text-sm mb-6">
                        Create a new course or manage existing ones efficiently.
                      </p>
                      <div className="space-y-3">
                        <button className="w-full py-3 bg-white text-primary font-bold rounded-lg hover:bg-slate-50 transition-colors text-sm">
                          + Create New Course
                        </button>
                        <button className="w-full py-3 bg-white/20 text-white font-bold rounded-lg border border-white/20 hover:bg-white/30 transition-colors text-sm">
                          Manage Users
                        </button>
                      </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-20">
                      <span className="material-symbols-outlined text-8xl">
                        rocket_launch
                      </span>
                    </div>
                  </div>

                  {/* System Status */}
                  <div className="bg-white border border-[#dbdfe6] rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-[#111318] mb-4">
                      System Status
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1 text-sm font-medium">
                          <span className="text-[#616f89]">Server Load</span>
                          <span className="text-green-600">24%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: "24%" }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1 text-sm font-medium">
                          <span className="text-[#616f89]">Database</span>
                          <span className="text-primary">58%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: "58%" }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1 text-sm font-medium">
                          <span className="text-[#616f89]">Storage</span>
                          <span className="text-amber-600">72%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-amber-500 h-2 rounded-full"
                            style={{ width: "72%" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : activeTab === "notifications" ? (
            <Notifications />
          ) : activeTab === "settings" ? (
            <Settings />
          ) : activeTab === "users" ? (
            <UserManagement />
          ) : (
            <div className="bg-white border border-[#dbdfe6] rounded-xl p-12 text-center">
              <span className="material-symbols-outlined text-6xl text-[#616f89] mb-4">
                construction
              </span>
              <h3 className="text-xl font-bold text-[#111318]">
                Under Construction
              </h3>
              <p className="text-[#616f89] mt-2">
                The {activeTab} section is currently being developed.
              </p>
            </div>
          )}
        </div>

        <footer className="p-8 pt-0 max-w-7xl mx-auto text-center">
          <p className="text-[#616f89] text-xs font-medium">
            © 2024 Project-based Learning Management System (PIMS) - Version
            2.4.1
          </p>
        </footer>
      </main>
    </div>
  );
};

export default AdminDashboard;
