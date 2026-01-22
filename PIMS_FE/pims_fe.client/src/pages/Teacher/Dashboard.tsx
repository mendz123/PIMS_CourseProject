import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const TeacherDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="flex h-screen overflow-hidden bg-[#f6f6f8] text-[#111318] font-display">
            {/* SideNavBar Component */}
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
                        <a className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary" href="#">
                            <span className="material-symbols-outlined text-[20px]">dashboard</span>
                            <p className="text-sm font-semibold">Dashboard</p>
                        </a>
                        <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#616f89] hover:bg-gray-100 transition-colors" href="#">
                            <span className="material-symbols-outlined text-[20px]">fact_check</span>
                            <p className="text-sm font-medium">Project Approvals</p>
                        </a>
                        <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#616f89] hover:bg-gray-100 transition-colors" href="#">
                            <span className="material-symbols-outlined text-[20px]">trending_up</span>
                            <p className="text-sm font-medium">Group Progress</p>
                        </a>
                        <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#616f89] hover:bg-gray-100 transition-colors" href="#">
                            <span className="material-symbols-outlined text-[20px]">grade</span>
                            <p className="text-sm font-medium">Grading</p>
                        </a>
                        <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#616f89] hover:bg-gray-100 transition-colors" href="#">
                            <span className="material-symbols-outlined text-[20px]">group</span>
                            <p className="text-sm font-medium">Student List</p>
                        </a>
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

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-[#f6f6f8]">
                {/* Page Heading Component */}
                <header className="p-8 pb-0 max-w-[1200px] mx-auto">
                    <div className="flex flex-wrap justify-between items-end gap-4">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-[#111318] text-3xl font-black tracking-tight">Lecturer Overview</h2>
                            <p className="text-[#616f89] text-sm font-normal">
                                Welcome back, {user?.fullName || "Dr. Sarah Jenkins"}. You have 12 pending tasks.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 bg-white p-1.5 rounded-lg border border-[#dbdfe6]">
                            <div
                                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8"
                                style={{
                                    backgroundImage:
                                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuALSk2G9Ojz1Q_QnQlex4qpx7roesE-GxUpVpNhkPl8ue1WQ8dpoS7LjNCJkBNEiNntiMZJc4_xlc_AtMsxohgj-E-UA15FuDZWOQjqrb1u2vXj-fFPjDpsf71-UctSBTKmCYX5d1NtlZ0ON1Uqa2uLpUxsIGTmnOe2mMFJp8Zin1-4xCUKNhKZaEwco9QJ_-KULl4qNMnlSpRIcL8sucq_pnBxpkHXASE1t8am7DUje2VTSOeUVK827I_XFqmG2bxCsJQBUptAM6He')",
                                }}
                            ></div>
                            <span className="text-sm font-medium pr-2">
                                {user?.fullName?.split(" ").pop() || "S. Jenkins"}
                            </span>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-[1200px] mx-auto space-y-8">
                    {/* Stats Component */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-[#dbdfe6] shadow-sm">
                            <div className="flex justify-between items-start">
                                <p className="text-[#616f89] text-sm font-medium uppercase tracking-wider">
                                    Pending Proposals
                                </p>
                                <span className="material-symbols-outlined text-primary">description</span>
                            </div>
                            <p className="text-[#111318] tracking-tight text-3xl font-bold">12</p>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-[#07883b] text-sm font-bold">+2%</span>
                                <span className="text-[#616f89] text-xs">from last week</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-[#dbdfe6] shadow-sm">
                            <div className="flex justify-between items-start">
                                <p className="text-[#616f89] text-sm font-medium uppercase tracking-wider">
                                    Active Groups
                                </p>
                                <span className="material-symbols-outlined text-orange-500">groups_2</span>
                            </div>
                            <p className="text-[#111318] tracking-tight text-3xl font-bold">24</p>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-[#e73908] text-sm font-bold">-1%</span>
                                <span className="text-[#616f89] text-xs">from last week</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-[#dbdfe6] shadow-sm">
                            <div className="flex justify-between items-start">
                                <p className="text-[#616f89] text-sm font-medium uppercase tracking-wider">
                                    Unreviewed Reports
                                </p>
                                <span className="material-symbols-outlined text-green-500">pending_actions</span>
                            </div>
                            <p className="text-[#111318] tracking-tight text-3xl font-bold">08</p>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-[#07883b] text-sm font-bold">+5%</span>
                                <span className="text-[#616f89] text-xs">from last week</span>
                            </div>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Pending Topic Approvals */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-[#111318] text-xl font-bold">Pending Topic Approvals</h2>
                                <button className="text-primary text-sm font-semibold hover:underline">View All</button>
                            </div>
                            {/* Table Component */}
                            <div className="overflow-hidden rounded-xl border border-[#dbdfe6] bg-white shadow-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-6 py-4 text-[#111318] text-xs font-bold uppercase tracking-wider">
                                                Group ID
                                            </th>
                                            <th className="px-6 py-4 text-[#111318] text-xs font-bold uppercase tracking-wider">
                                                Proposed Title
                                            </th>
                                            <th className="px-6 py-4 text-[#111318] text-xs font-bold uppercase tracking-wider text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#dbdfe6]">
                                        <tr className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-[#616f89] text-sm font-medium">G-201</td>
                                            <td className="px-6 py-4">
                                                <p className="text-[#111318] text-sm font-semibold">
                                                    AI-driven Logistics Optimization
                                                </p>
                                                <p className="text-xs text-[#616f89]">Submitted: Oct 24, 2023</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded hover:bg-blue-700">
                                                        Approve
                                                    </button>
                                                    <button className="px-3 py-1.5 border border-[#dbdfe6] text-[#111318] text-xs font-bold rounded hover:bg-gray-50">
                                                        Review
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-[#616f89] text-sm font-medium">G-205</td>
                                            <td className="px-6 py-4">
                                                <p className="text-[#111318] text-sm font-semibold">
                                                    Blockchain for Supply Chain
                                                </p>
                                                <p className="text-xs text-[#616f89]">Submitted: Oct 25, 2023</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded hover:bg-blue-700">
                                                        Approve
                                                    </button>
                                                    <button className="px-3 py-1.5 border border-[#dbdfe6] text-[#111318] text-xs font-bold rounded hover:bg-gray-50">
                                                        Review
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-[#616f89] text-sm font-medium">G-212</td>
                                            <td className="px-6 py-4">
                                                <p className="text-[#111318] text-sm font-semibold">
                                                    IoT Smart Irrigation System
                                                </p>
                                                <p className="text-xs text-[#616f89]">Submitted: Oct 26, 2023</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded hover:bg-blue-700">
                                                        Approve
                                                    </button>
                                                    <button className="px-3 py-1.5 border border-[#dbdfe6] text-[#111318] text-xs font-bold rounded hover:bg-gray-50">
                                                        Review
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Right Column: Performance Distribution Chart */}
                        <div className="space-y-4">
                            <h2 className="text-[#111318] text-xl font-bold px-1">Performance Distribution</h2>
                            <div className="rounded-xl border border-[#dbdfe6] bg-white p-6 shadow-sm">
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-1 text-sm font-medium">
                                            <span>Exceeding Expectation</span>
                                            <span className="text-primary">45%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div className="bg-primary h-2 rounded-full" style={{ width: "45%" }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1 text-sm font-medium">
                                            <span>On Track</span>
                                            <span className="text-[#07883b]">35%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className="bg-[#07883b] h-2 rounded-full"
                                                style={{ width: "35%" }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1 text-sm font-medium">
                                            <span>Delayed</span>
                                            <span className="text-orange-500">15%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className="bg-orange-500 h-2 rounded-full"
                                                style={{ width: "15%" }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1 text-sm font-medium">
                                            <span>Critical</span>
                                            <span className="text-red-500">5%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div className="bg-red-500 h-2 rounded-full" style={{ width: "5%" }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-[#dbdfe6]">
                                    <div className="flex items-center justify-center gap-2 text-[#616f89] text-sm">
                                        <span className="material-symbols-outlined text-[18px]">info</span>
                                        <span>Based on mid-semester reviews</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Tracking Table */}
                    <section className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-4 px-1">
                            <h2 className="text-[#111318] text-xl font-bold">Progress Tracking Table</h2>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                                        search
                                    </span>
                                    <input
                                        className="pl-10 pr-4 py-2 bg-white border border-[#dbdfe6] rounded-lg text-sm w-64 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        placeholder="Search groups..."
                                        type="text"
                                    />
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#dbdfe6] rounded-lg text-sm font-semibold hover:bg-gray-50">
                                    <span className="material-symbols-outlined text-[18px]">filter_list</span>
                                    Filter
                                </button>
                            </div>
                        </div>
                        <div className="overflow-hidden rounded-xl border border-[#dbdfe6] bg-white shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-6 py-4 text-[#111318] text-xs font-bold uppercase tracking-wider">
                                            Group Name
                                        </th>
                                        <th className="px-6 py-4 text-[#111318] text-xs font-bold uppercase tracking-wider">
                                            Lead Student
                                        </th>
                                        <th className="px-6 py-4 text-[#111318] text-xs font-bold uppercase tracking-wider">
                                            Milestone
                                        </th>
                                        <th className="px-6 py-4 text-[#111318] text-xs font-bold uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-[#111318] text-xs font-bold uppercase tracking-wider text-right">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#dbdfe6]">
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-[#111318] text-sm font-semibold tracking-tight">
                                            Eco-Trackers
                                        </td>
                                        <td className="px-6 py-4 text-[#616f89] text-sm">Marcus Aurelius</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-[#616f89] font-medium whitespace-nowrap">
                                                    Phase 2: Prototype
                                                </span>
                                                <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                    <div className="bg-primary h-full" style={{ width: "65%" }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#07883b]/10 text-[#07883b]">
                                                On Track
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-primary text-sm font-bold flex items-center gap-1 ml-auto hover:text-blue-700">
                                                <span className="material-symbols-outlined text-[18px]">
                                                    chat_bubble_outline
                                                </span>
                                                Feedback
                                            </button>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-[#111318] text-sm font-semibold tracking-tight">
                                            Cyber-Shield
                                        </td>
                                        <td className="px-6 py-4 text-[#616f89] text-sm">Elena Rodriguez</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-[#616f89] font-medium whitespace-nowrap">
                                                    Phase 3: Testing
                                                </span>
                                                <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                    <div className="bg-primary h-full" style={{ width: "85%" }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-500">
                                                Review Required
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-primary text-sm font-bold flex items-center gap-1 ml-auto hover:text-blue-700">
                                                <span className="material-symbols-outlined text-[18px]">
                                                    chat_bubble_outline
                                                </span>
                                                Feedback
                                            </button>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-[#111318] text-sm font-semibold tracking-tight">
                                            Data Miners
                                        </td>
                                        <td className="px-6 py-4 text-[#616f89] text-sm">Kevin Smith</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-[#616f89] font-medium whitespace-nowrap">
                                                    Phase 1: Design
                                                </span>
                                                <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                    <div className="bg-primary h-full" style={{ width: "30%" }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#07883b]/10 text-[#07883b]">
                                                On Track
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-primary text-sm font-bold flex items-center gap-1 ml-auto hover:text-blue-700">
                                                <span className="material-symbols-outlined text-[18px]">
                                                    chat_bubble_outline
                                                </span>
                                                Feedback
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
                                <span className="text-xs text-[#616f89]">Showing 3 of 24 groups</span>
                                <div className="flex gap-2">
                                    <button className="p-1 border border-[#dbdfe6] rounded bg-white text-gray-400 hover:text-primary">
                                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                    </button>
                                    <button className="p-1 border border-[#dbdfe6] rounded bg-white text-gray-400 hover:text-primary">
                                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <footer className="p-8 pt-0 max-w-[1200px] mx-auto text-center">
                    <p className="text-[#616f89] text-xs font-medium">
                        © 2024 Project-based Learning Management System (PIMS) - Version 2.4.1
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default TeacherDashboard;
