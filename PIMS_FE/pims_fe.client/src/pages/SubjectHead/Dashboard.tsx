import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Settings from "../../components/dashboard/Settings";
import Notification from "../../components/dashboard/Notification";

const SubjectHeadDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState("subject-overview");

  return (
    <div className="flex min-h-screen bg-[#f6f6f8] text-[#111318] font-display">
      {/* Side Navigation */}
      <aside className="w-64 border-r border-[#dbdfe6] bg-white flex flex-col fixed h-full z-20">
        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-lg p-1.5 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-2xl">
                school
              </span>
            </div>
            <div>
              <h1 className="text-[#111318] text-base font-bold leading-none">
                PIMS Dashboard
              </h1>
              <p className="text-[#616f89] text-xs mt-1">Head of Subject</p>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            <button
              className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all w-full ${activeTab === "subject-overview" ? "bg-primary/10 text-primary" : "text-[#616f89] hover:bg-[#f6f6f8]"}`}
              onClick={() => setActiveTab("subject-overview")}
            >
              <span className="material-symbols-outlined text-[22px]">
                dashboard
              </span>
              <span className="text-sm">Subject Overview</span>
            </button>
            <button
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all w-full ${activeTab === "faculty-management" ? "bg-primary/10 text-primary" : "text-[#616f89] hover:bg-[#f6f6f8]"}`}
              onClick={() => setActiveTab("faculty-management")}
            >
              <span className="material-symbols-outlined text-[22px]">
                groups
              </span>
              <span className="text-sm">Faculty Management</span>
            </button>
            <a
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#616f89] hover:bg-[#f6f6f8] transition-colors"
              href="/subject-head/assessments"
            >
              <span className="material-symbols-outlined text-[22px]">
                menu_book
              </span>
              <span className="text-sm">Syllabus &amp; Assessment</span>
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#616f89] hover:bg-[#f6f6f8] transition-colors"
              href="#"
            >
              <span className="material-symbols-outlined text-[22px]">
                bar_chart
              </span>
              <span className="text-sm">Performance Analytics</span>
            </a>
            <button
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all w-full ${activeTab === "settings" ? "bg-primary/10 text-primary" : "text-[#616f89] hover:bg-[#f6f6f8]"}`}
              onClick={() => setActiveTab("settings")}
            >
              <span className="material-symbols-outlined text-[22px]">
                settings
              </span>
              <span className="text-sm">Settings</span>
            </button>
          </nav>
        </div>
        <div className="mt-auto p-4 flex flex-col gap-4">
          <div className="bg-[#f6f6f8] p-4 rounded-xl flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCfEreAXEz26Ko6praZ0G1SFeoRfgXQpL4VTkmzK2IKAgJraHpEKQxZ03RbhY5RybSTS0efxBPDoRioCZBjR9Bhg4FKXhr9tsCzRo33uYGd9dzL-e_t3uZaWAvw58J60yT3DlhYVumJvOHykWthGg-NAhgWDZTokUCADmvpr8un1se23K8P_cDwEeIByhu4Kb2nQSD_pYn583FPPqGB1Kpn6ys648um_g4OJCuzF6FQjUII0odVNl3xmgFaJIpRsI_N190xvtijcyNK')",
              }}
            ></div>
            <div>
              <p className="text-xs font-bold text-[#111318]">
                {user?.fullName || "Dr. Sarah Jenkins"}
              </p>
              <p className="text-[10px] text-[#616f89]">Senior Lecturer</p>
            </div>
          </div>
          <button className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-primary/90 transition-all">
            <span className="material-symbols-outlined text-sm">download</span>
            Export Reports
          </button>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full border border-[#dbdfe6] text-[#616f89] py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 bg-[#f6f6f8] min-h-screen">
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
                {activeTab.replace(/-/g, " ")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Notification />
            <button
              className={`p-2 rounded-lg transition-all ${activeTab === "settings" ? "bg-primary text-white" : "bg-[#f6f6f8] text-[#616f89] hover:text-primary"}`}
              onClick={() => setActiveTab("settings")}
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
          {activeTab === "subject-overview" ? (
            <>
              {/* Top Row: Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-[#dbdfe6] shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[#616f89] text-sm font-medium">
                      Subject Success Rate
                    </p>
                    <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      +2.1%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-[#111318]">88.4%</h3>
                    <span className="text-[#616f89] text-xs">vs 86.3% avg</span>
                  </div>
                  <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: "88.4%" }}
                    ></div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-[#dbdfe6] shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[#616f89] text-sm font-medium">
                      Avg. Feedback Time
                    </p>
                    <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      -0.5%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-[#111318]">
                      2.4 Days
                    </h3>
                    <span className="text-[#616f89] text-xs">Target: 48h</span>
                  </div>
                  <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: "65%" }}
                    ></div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-[#dbdfe6] shadow-sm border-l-4 border-l-amber-500">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[#616f89] text-sm font-medium">
                      Pending Audits
                    </p>
                    <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      +4 new
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-[#111318]">12</h3>
                    <span className="text-[#616f89] text-xs">
                      Requires Action
                    </span>
                  </div>
                  <div className="mt-4 flex gap-1">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                    <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                  </div>
                </div>
              </div>

              {/* Mid Row: Master Assessment & Success Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Master Assessment Schema */}
                <div className="lg:col-span-1 bg-white rounded-xl border border-[#dbdfe6] overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-[#dbdfe6] bg-slate-50 flex justify-between items-center">
                    <h2 className="font-bold text-[#111318] text-base">
                      Master Assessment Schema
                    </h2>
                    <button className="text-primary text-xs font-bold hover:underline">
                      Edit Weights
                    </button>
                  </div>
                  <div className="p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-400">
                          article
                        </span>
                        <span className="text-sm text-[#111318]">
                          Final Examination
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">40%</span>
                        <span className="material-symbols-outlined text-slate-300 group-hover:text-primary cursor-pointer text-lg">
                          lock
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-400">
                          inventory_2
                        </span>
                        <span className="text-sm text-[#111318]">
                          Capstone Project
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">30%</span>
                        <span className="material-symbols-outlined text-slate-300 group-hover:text-primary cursor-pointer text-lg">
                          lock
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-400">
                          group
                        </span>
                        <span className="text-sm text-[#111318]">
                          Group Presentation
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">20%</span>
                        <span className="material-symbols-outlined text-slate-300 group-hover:text-primary cursor-pointer text-lg">
                          lock
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between group border-b border-dashed border-[#dbdfe6] pb-4">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-400">
                          quiz
                        </span>
                        <span className="text-sm text-[#111318]">
                          Periodic Quizzes
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">10%</span>
                        <span className="material-symbols-outlined text-slate-300 group-hover:text-primary cursor-pointer text-lg">
                          lock
                        </span>
                      </div>
                    </div>
                    <button className="mt-2 w-full bg-primary/10 text-primary py-2 rounded-lg text-xs font-bold hover:bg-primary/20 transition-all">
                      Standardize All Sections
                    </button>
                  </div>
                </div>

                {/* Project Success Rates Visual */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-[#dbdfe6] shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-[#dbdfe6] flex justify-between items-center">
                    <div>
                      <h2 className="font-bold text-[#111318] text-base">
                        Project Success Rates by Section
                      </h2>
                      <p className="text-xs text-[#616f89]">
                        Comparison of Semester 1 2024 results
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-xs border border-[#dbdfe6] rounded-lg font-medium text-[#616f89]">
                        Weekly
                      </button>
                      <button className="px-3 py-1 text-xs bg-primary text-white rounded-lg font-medium">
                        Monthly
                      </button>
                    </div>
                  </div>
                  <div className="p-6 h-[240px] flex items-end justify-between gap-4">
                    {/* ... chart bars ... */}
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-primary/20 rounded-t-lg relative group h-[180px]">
                        <div
                          className="absolute bottom-0 w-full bg-primary rounded-t-lg transition-all duration-500"
                          style={{ height: "160px" }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-[#616f89] font-bold">
                        SEC-01
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-primary/20 rounded-t-lg relative group h-[180px]">
                        <div
                          className="absolute bottom-0 w-full bg-primary rounded-t-lg transition-all duration-500"
                          style={{ height: "140px" }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-[#616f89] font-bold">
                        SEC-02
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-primary/20 rounded-t-lg relative group h-[180px]">
                        <div
                          className="absolute bottom-0 w-full bg-amber-500 rounded-t-lg transition-all duration-500"
                          style={{ height: "110px" }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-[#616f89] font-bold">
                        SEC-03
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-primary/20 rounded-t-lg relative group h-[180px]">
                        <div
                          className="absolute bottom-0 w-full bg-primary rounded-t-lg transition-all duration-500"
                          style={{ height: "170px" }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-[#616f89] font-bold">
                        SEC-04
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-primary/20 rounded-t-lg relative group h-[180px]">
                        <div
                          className="absolute bottom-0 w-full bg-primary rounded-t-lg transition-all duration-500"
                          style={{ height: "155px" }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-[#616f89] font-bold">
                        SEC-05
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Lecturer Activity & QC Panel */}
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Lecturer Activity Table */}
                <div className="xl:col-span-3 bg-white rounded-xl border border-[#dbdfe6] shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-[#dbdfe6] flex justify-between items-center">
                    <h2 className="font-bold text-[#111318] text-base">
                      Lecturer Performance & Activity
                    </h2>
                    <button className="flex items-center gap-1 text-xs text-primary font-bold">
                      View Full Faculty{" "}
                      <span className="material-symbols-outlined text-sm">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-[#616f89] text-xs font-bold uppercase tracking-wider">
                          <th className="px-6 py-4">Lecturer Name</th>
                          <th className="px-6 py-4">Sections</th>
                          <th className="px-6 py-4">Avg Feedback</th>
                          <th className="px-6 py-4">Consistency</th>
                          <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#dbdfe6]">
                        <tr className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold text-xs">
                                AJ
                              </div>
                              <span className="text-sm font-medium text-[#111318]">
                                Prof. Alan Johnson
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-bold uppercase">
                              SEC-01, SEC-04
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm">1.5 Days</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
                              Excellent
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-[#616f89] hover:text-primary transition-colors">
                              <span className="material-symbols-outlined text-lg">
                                more_horiz
                              </span>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Quality Control Panel */}
                <div className="xl:col-span-1 flex flex-col gap-6">
                  <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
                    <div className="p-4 bg-red-50 flex items-center gap-2 border-b border-red-100">
                      <span className="material-symbols-outlined text-red-500 text-lg">
                        emergency_home
                      </span>
                      <h3 className="text-xs font-bold text-red-700 uppercase tracking-widest">
                        Quality Alerts
                      </h3>
                    </div>
                    <div className="p-4 flex flex-col gap-4">
                      <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                        <div className="flex justify-between mb-1">
                          <p className="text-[10px] font-bold text-red-700">
                            HIGH VARIANCE
                          </p>
                          <span className="text-[10px] text-slate-400">
                            2h ago
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium">
                          SEC-02 Final Exam scores deviates &gt;30% from mean.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-primary p-5 rounded-xl text-white shadow-lg shadow-primary/20 flex flex-col gap-3 relative overflow-hidden">
                    <div className="relative z-10">
                      <h3 className="font-bold text-sm">
                        Upcoming Subject Audit
                      </h3>
                      <p className="text-xs text-white/80 mt-1">
                        External moderation begins in 14 days. Ensure all
                        schemas are locked.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : activeTab === "settings" ? (
            <Settings />
          ) : (
            <div className="bg-white border border-[#dbdfe6] rounded-xl p-12 text-center shadow-sm">
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
      </main>
    </div>
  );
};

export default SubjectHeadDashboard;
