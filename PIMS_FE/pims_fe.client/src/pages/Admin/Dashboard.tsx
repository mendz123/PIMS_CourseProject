import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const sidebarItems = [
    { id: "overview", icon: "dashboard", label: "Overview" },
    { id: "users", icon: "group", label: "Users Management" },
    { id: "courses", icon: "school", label: "Courses" },
    { id: "reports", icon: "analytics", label: "Reports" },
    { id: "settings", icon: "settings", label: "Settings" },
  ];

  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      icon: "group",
      color: "bg-blue-500",
      trend: "+12%",
    },
    {
      title: "Active Courses",
      value: "42",
      icon: "book",
      color: "bg-purple-500",
      trend: "+5%",
    },
    {
      title: "New Signups",
      value: "128",
      icon: "person_add",
      color: "bg-emerald-500",
      trend: "+18%",
    },
    {
      title: "Revenue",
      value: "$12,450",
      icon: "payments",
      color: "bg-amber-500",
      trend: "+8%",
    },
  ];

  const recentActivities = [
    {
      user: "John Doe",
      action: "Created a new course",
      time: "2 hours ago",
      icon: "add_circle",
    },
    {
      user: "Jane Smith",
      action: "Updated profile",
      time: "4 hours ago",
      icon: "edit",
    },
    {
      user: "Mike Johnson",
      action: "Registered for React 101",
      time: "5 hours ago",
      icon: "how_to_reg",
    },
    {
      user: "Sarah Williams",
      action: "Posted a new announcement",
      time: "1 day ago",
      icon: "campaign",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex transition-colors duration-300">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-white/5 flex flex-col z-20">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="p-2 bg-primary rounded-lg">
            <span className="material-symbols-outlined text-white">
              admin_panel_settings
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            PIMS Admin
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span
                className={`material-symbols-outlined transition-colors ${activeTab === item.id ? "text-white" : "text-slate-500 group-hover:text-white"}`}
              >
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <button
            onClick={() => navigate("/")}
            className="cursor-pointer hover:text-white hover:bg-white/5 transition-all w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="font-medium">Back to Home</span>
          </button>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="cursor-pointer  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">
              Welcome back, {user?.fullName || "Admin"}
            </h2>
            <p className="text-slate-400 mt-1">
              Here's what's happening today.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 text-white relative cursor-pointer hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined text-[20px]">
                notifications
              </span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
              {user?.fullName?.charAt(0) || "A"}
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-slate-900 border border-white/5 p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`p-3 rounded-xl ${stat.color} bg-opacity-10 text-${stat.color.split("-")[1]}-400 group-hover:bg-opacity-20 transition-all`}
                >
                  <span className="material-symbols-outlined">{stat.icon}</span>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-1 rounded-lg font-bold">
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">
                {stat.value}
              </h3>
              <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900 border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Recent Activity</h3>
              <button className="text-sm text-primary hover:text-primary-light font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">
                      {activity.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {activity.user}{" "}
                      <span className="text-slate-400 font-normal">
                        {activity.action}
                      </span>
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <h3 className="text-xl font-bold mb-2 relative z-10">
              Quick Action
            </h3>
            <p className="text-white/80 text-sm mb-6 relative z-10">
              Create a new course or manage existing ones efficiently.
            </p>

            <div className="space-y-3 relative z-10">
              <button className="w-full py-3 bg-white text-primary font-bold rounded-xl shadow-lg hover:bg-slate-50 transition-colors">
                + Create New Course
              </button>
              <button className="w-full py-3 bg-black/20 text-white font-bold rounded-xl border border-white/20 hover:bg-black/30 transition-colors">
                Manage Users
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
