import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Settings from "../../components/dashboard/Settings";
import Notification from "../../components/dashboard/Notification";

const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState("dashboard");

  return (
    <div className="bg-[#f6f6f8] min-h-screen font-display">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="bg-primary size-10 rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined">rocket_launch</span>
            </div>
            <div>
              <h1 className="text-[#111318] text-lg font-bold leading-tight">
                PIMS
              </h1>
              <p className="text-[#616f89] text-xs font-normal">
                Student Portal
              </p>
            </div>
          </div>
          <nav className="flex-1 px-4 flex flex-col gap-1">
            <div
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${activeTab === "dashboard" ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100"}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <span className="material-symbols-outlined">dashboard</span>
              <p className="text-sm font-medium">Dashboard</p>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
              <span className="material-symbols-outlined">group</span>
              <p className="text-sm font-medium">My Group</p>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
              <span className="material-symbols-outlined">assignment</span>
              <p className="text-sm font-medium">Progress Reports</p>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
              <span className="material-symbols-outlined">task</span>
              <p className="text-sm font-medium">Assessment</p>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
              <span className="material-symbols-outlined">notifications</span>
              <p className="text-sm font-medium">Notifications</p>
            </div>
            <div
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${activeTab === "settings" ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100"}`}
              onClick={() => setActiveTab("settings")}
            >
              <span className="material-symbols-outlined">settings</span>
              <p className="text-sm font-medium">Settings</p>
            </div>
          </nav>
          <div className="p-4 border-t border-gray-200">
            <div
              className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
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

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* Top Navigation Bar */}
          <header className="sticky top-0 z-10 flex items-center justify-between bg-white border-b border-gray-200 px-8 py-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900 capitalize">
                {activeTab} Dashboard
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <Notification />
              <button
                className={`p-2 rounded-lg transition-all ${activeTab === "settings" ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:text-primary"}`}
                onClick={() => setActiveTab("settings")}
              >
                <span className="material-symbols-outlined">settings</span>
              </button>
              <div
                className="h-10 w-10 rounded-full bg-cover bg-center border-2 border-primary"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCDnadSgEx4CX46drDPxSjtnPLMgxNliGkSyeHYu7O9zlNYVj_zdPn6Z-zQNLcW8Jih9fR1Rwbwc1vfeXju_j6JWLD8q8OSxBQpe_yuxCDmBZ2PFEibWInVDLKE5r44Nt5V6BWEGgctWIvVPmV5xTOZoN5QzduxrhSPoVYKZTF212z-H_dLuC-az0-Uc1uDraV1FMbEln5LGTeI5RaRilHER8yjQzgtf9DvIIBdOjiPGleeNI6QPese1Uh_jc5Gbv1AtJLiiEWhV_kR')",
                }}
              ></div>
            </div>
          </header>

          <div className="p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
            {activeTab === "dashboard" ? (
              <>
                {/* Project Overview & Progress Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider">
                          Approved
                        </span>
                        <h3 className="text-2xl font-bold mt-2 text-gray-900">
                          E-Commerce Microservices Platform
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">
                          CS402 Software Engineering Project • Spring 2024
                        </p>
                      </div>
                      <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                        View Full Details
                      </button>
                    </div>
                    <div className="mt-8">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Overall Completion
                        </span>
                        <span className="text-xl font-bold text-primary">
                          65%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-primary h-3 rounded-full"
                          style={{ width: "65%" }}
                        ></div>
                      </div>
                      <div className="flex items-center gap-2 mt-3 text-gray-500 text-xs">
                        <span className="material-symbols-outlined text-sm">
                          event
                        </span>
                        <span>
                          Next Milestone: Mid-term Demo (Oct 24, 2023)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-4">
                      Quick Stats
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-600 font-semibold uppercase">
                          Tasks Done
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          12/18
                        </p>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <p className="text-xs text-orange-600 font-semibold uppercase">
                          Pending
                        </p>
                        <p className="text-2xl font-bold text-orange-900">4</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-xs text-purple-600 font-semibold uppercase">
                          Days Left
                        </p>
                        <p className="text-2xl font-bold text-purple-900">14</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-xs text-green-600 font-semibold uppercase">
                          Reports
                        </p>
                        <p className="text-2xl font-bold text-green-900">3/5</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Group Status & Feedback Section */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Team Members (Left) */}
                  <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="font-bold text-lg text-gray-900">
                          Group Members
                        </h4>
                        <button className="text-primary text-sm font-medium hover:underline">
                          Manage Group
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Member 1 */}
                        <div className="p-4 border border-gray-100 rounded-xl flex items-center gap-4 hover:shadow-md transition">
                          <div
                            className="h-12 w-12 rounded-full bg-cover"
                            style={{
                              backgroundImage:
                                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuARK-MNu3pvxJEuFjwOvF-TFwvGUVTZE9godRyCWcIRzBvlqRcPHjOwtIOILpNkmM6aTyjg76Za65iw_PzNmypWGoDXjdYjLQunDfE5PRuuJ9yeoiJYiKGuYkY93oJofsMLYjmGCoIUq5w9DotDKt5ggmb64EiTNoilMKfKIQ2j8Zs0vWYcyqU1dUNBFyXE-XCT800Cj7L9XC6MDa9e0rYDYldWZI-ct8gTCSOoTeHCDmUClOJJZojssIbE42X6lGZ4Jy4VYgSp86nu')",
                            }}
                          ></div>
                          <div>
                            <p className="font-bold text-sm text-gray-900">
                              Alex Johnson
                            </p>
                            <p className="text-xs text-gray-500">
                              Scrum Master
                            </p>
                            <div className="flex gap-2 mt-2">
                              <span className="material-symbols-outlined text-xs text-primary cursor-pointer">
                                mail
                              </span>
                              <span className="material-symbols-outlined text-xs text-primary cursor-pointer">
                                chat
                              </span>
                            </div>
                          </div>
                        </div>
                        {/* Member 2 */}
                        <div className="p-4 border border-gray-100 rounded-xl flex items-center gap-4 hover:shadow-md transition">
                          <div
                            className="h-12 w-12 rounded-full bg-cover"
                            style={{
                              backgroundImage:
                                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB0qWBMZAmjqtcy1UOkyVHUJCqm9iFuZWVicYwQOXg7ub6PMBGAQDOPI8pm1vYGT21LeYiRQIu2221bBKmMsytO2TGL78MncNLOYqvfb2kibGsEiQ8H3Aodg1TDxvHccHCmZqd4baIapYoMmMc_O1nYqDiH2_QnDpFs1d53Kg2Dq7Yo3fgaYHp-qpeG84ApzLaYd4zg_MXNxDXoPp9ugfjhdKauGnTiK6XImtgyO87yVtKtY2aVW3XnPa-PR2yg5-o9R8QQWCrlvSkz')",
                            }}
                          ></div>
                          <div>
                            <p className="font-bold text-sm text-gray-900">
                              Sarah Chen
                            </p>
                            <p className="text-xs text-gray-500">
                              Backend Developer
                            </p>
                            <div className="flex gap-2 mt-2">
                              <span className="material-symbols-outlined text-xs text-primary cursor-pointer">
                                mail
                              </span>
                              <span className="material-symbols-outlined text-xs text-primary cursor-pointer">
                                chat
                              </span>
                            </div>
                          </div>
                        </div>
                        {/* Member 3 */}
                        <div className="p-4 border border-gray-100 rounded-xl flex items-center gap-4 hover:shadow-md transition">
                          <div
                            className="h-12 w-12 rounded-full bg-cover"
                            style={{
                              backgroundImage:
                                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDqaHrylieiCpWPzlLzBTUEcfGLSmDfysKss9MHTWb_o_WCnG_T0WQMG5yPeZu8GvaXR9Oe8j2_5c-rYi19za3QBLCKezHm2d5Io7yG7ipN2qcip0fW7xdcgUWPkdqmR93kIC5CA0HuBj0wJuob549IEDMgtb_nJ87HzxFAX49R4GAN1-Sw1lRvmou5zyMvkX6ktisXWx9u5DUmbvvbQLu_0nNt3MJCpcZS1ap2EhQGyTWG2SYt0aoGJIw_S9a1ZtrLjdQSaHcjdi1V')",
                            }}
                          ></div>
                          <div>
                            <p className="font-bold text-sm text-gray-900">
                              Marcus Wu
                            </p>
                            <p className="text-xs text-gray-500">
                              Frontend Developer
                            </p>
                            <div className="flex gap-2 mt-2">
                              <span className="material-symbols-outlined text-xs text-primary cursor-pointer">
                                mail
                              </span>
                              <span className="material-symbols-outlined text-xs text-primary cursor-pointer">
                                chat
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Reports Timeline */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h4 className="font-bold text-lg text-gray-900 mb-6">
                        Milestones & Reports
                      </h4>
                      <div className="space-y-6 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                        {/* Milestone 1 */}
                        <div className="relative pl-8">
                          <div className="absolute left-0 top-1 size-[24px] rounded-full bg-green-500 border-4 border-white flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-[12px] font-bold">
                              check
                            </span>
                          </div>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-gray-900">
                                Requirement Specification
                              </p>
                              <p className="text-sm text-gray-500">
                                PR #01 Submitted on Oct 01, 2023
                              </p>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">
                              SUBMITTED
                            </span>
                          </div>
                        </div>
                        {/* Milestone 2 */}
                        <div className="relative pl-8">
                          <div className="absolute left-0 top-1 size-[24px] rounded-full bg-primary border-4 border-white animate-pulse"></div>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-gray-900">
                                Architecture & Design
                              </p>
                              <p className="text-sm text-gray-500">
                                PR #02 Due: Oct 15, 2023
                              </p>
                            </div>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-bold">
                              IN PROGRESS
                            </span>
                          </div>
                        </div>
                        {/* Milestone 3 */}
                        <div className="relative pl-8">
                          <div className="absolute left-0 top-1 size-[24px] rounded-full bg-gray-300 border-4 border-white"></div>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-gray-900">
                                Mid-term Demo
                              </p>
                              <p className="text-sm text-gray-500">
                                PR #03 Due: Oct 24, 2023
                              </p>
                            </div>
                            <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full font-bold">
                              PENDING
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lecturer Feedback (Right Sidebar) */}
                  <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                    <div className="flex items-center gap-2 mb-6">
                      <span className="material-symbols-outlined text-primary">
                        feedback
                      </span>
                      <h4 className="font-bold text-lg text-gray-900">
                        Recent Feedback
                      </h4>
                    </div>
                    <div className="space-y-4">
                      {/* Comment 1 */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="size-6 rounded-full bg-cover bg-gray-300"
                            style={{
                              backgroundImage:
                                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCrcSVFc0es2C7FTRBEXyTrkM_jguu3N_-JC1Sfy40UEUXuG9shVQoUSYwIKuF0btpDvdPBZRRKGO4GPAzac4u7OpfS_JwG6cGu4jINWulnkyABhJLoqA0yH84fVXuTXFBMMAOAnXxS4KPYsfLLZNTqaGOejUwQOOgaLIsh0XzqEiE-tYDcqRbL65eWvjMpj6oXP7KoEnZ4LcyAe8ltvJBhdx729gZrgA6XldnmxUmoBxWtK0yQn-DcexuCgyd8qsYZQBQu-ytH-KBw')",
                            }}
                          ></div>
                          <p className="text-xs font-bold text-gray-700">
                            Prof. Miller
                          </p>
                          <span className="text-[10px] text-gray-400">
                            2h ago
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          "Excellent progress on the API documentation. Make
                          sure to include the OAuth2 flow in the next update."
                        </p>
                      </div>
                      {/* Comment 2 */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="size-6 rounded-full bg-cover bg-gray-300"
                            style={{
                              backgroundImage:
                                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBsahg-fwPSsP_Ytgb14gqEZ9mXRri_bNKEI6yQoxZGmhzRakv73ldNHOZ2bi-VC6FyiqKOz0Lakrv6uJYfpSNOtilE6SiLROUZoPFvgt5KZGsWF8TkL1AJrd6T25TSZnwD2BHvH6Kgsm4fBpiLaaAOC4CJB8BhztE40cb3xiqnopSJuCEKxeMCF9QdB-mFUIiROk6FOg7lvTQrv6iHP19_svCjrI9doQ761ICNvGR5LKfm1UaSSF2KKWo1ASBEIdFe-re-l5HeL5W7')",
                            }}
                          ></div>
                          <p className="text-xs font-bold text-gray-700">
                            TA Jessica
                          </p>
                          <span className="text-[10px] text-gray-400">
                            1d ago
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          "Please update the Gantt chart in the repository. The
                          design phase seems to be running behind schedule."
                        </p>
                      </div>
                      {/* Comment 3 */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="size-6 rounded-full bg-cover bg-gray-300"
                            style={{
                              backgroundImage:
                                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCLNgejSCgKwG22pvwiZ-PYI_Z5VsPHG7pcXM7m5ax4BXv0apyfTkSp9EyKXusjnxo6IaJG8mGLiucF--oVZBQWpUbqh5GUAn8GVj4uNLS0SNYrYe6GoL54JJHb6vu393oNxeCf-v6rA5tNLmew-VETa9mxlSd9jZKeEd36QxEPFgW8fG8ei9EgvpVPe4NNjSmTu3jLauxdBAznHyMZ68srEr_AH6LRsdtrf3NXVyrkmIu9EB7YnjAHym-oHpuIqMrWQNczdzrJCElL')",
                            }}
                          ></div>
                          <p className="text-xs font-bold text-gray-700">
                            Prof. Miller
                          </p>
                          <span className="text-[10px] text-gray-400">
                            3d ago
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          "Requirement document approved. Good breakdown of user
                          stories."
                        </p>
                      </div>
                      <button className="w-full py-2 text-primary text-sm font-bold border border-primary/20 rounded-lg hover:bg-primary/5 transition">
                        View All Feedback
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : activeTab === "settings" ? (
              <Settings />
            ) : (
              <div className="bg-white border border-gray-100 rounded-xl p-12 text-center shadow-sm">
                <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">
                  construction
                </span>
                <h3 className="text-xl font-bold text-gray-900">
                  Under Construction
                </h3>
                <p className="text-gray-500 mt-2">
                  The {activeTab} section is currently being developed.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
