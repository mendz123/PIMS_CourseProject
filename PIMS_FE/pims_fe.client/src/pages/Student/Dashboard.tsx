import React from "react";

const StudentDashboard: React.FC = () => {
    return (
        <div className="flex flex-col gap-8">
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
                            <span className="text-sm font-medium text-gray-700">Overall Completion</span>
                            <span className="text-xl font-bold text-primary">65%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="bg-primary h-3 rounded-full" style={{ width: "65%" }}></div>
                        </div>
                        <div className="flex items-center gap-2 mt-3 text-gray-500 text-xs">
                            <span className="material-symbols-outlined text-sm">event</span>
                            <span>Next Milestone: Mid-term Demo (Oct 24, 2023)</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-4">Quick Stats</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-600 font-semibold uppercase">Tasks Done</p>
                            <p className="text-2xl font-bold text-blue-900">12/18</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg">
                            <p className="text-xs text-orange-600 font-semibold uppercase">Pending</p>
                            <p className="text-2xl font-bold text-orange-900">4</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                            <p className="text-xs text-purple-600 font-semibold uppercase">Days Left</p>
                            <p className="text-2xl font-bold text-purple-900">14</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-xs text-green-600 font-semibold uppercase">Reports</p>
                            <p className="text-2xl font-bold text-green-900">3/5</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Group Status & Feedback Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="font-bold text-lg text-gray-900">Group Members</h4>
                            <button className="text-primary text-sm font-medium hover:underline">
                                Manage Group
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Member Card Component (Reusable) */}
                            {[1, 2, 3].map((id) => (
                                <div key={id} className="p-4 border border-gray-100 rounded-xl flex items-center gap-4 hover:shadow-md transition">
                                    <div className="h-12 w-12 rounded-full bg-cover bg-gray-200"
                                        style={{ backgroundImage: `url('http://googleusercontent.com/profile/picture/${id}')` }}>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">Member {id}</p>
                                        <p className="text-xs text-gray-500">Developer</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="material-symbols-outlined text-primary">feedback</span>
                        <h4 className="font-bold text-lg text-gray-900">Recent Feedback</h4>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600 italic">
                            "Excellent progress on the API documentation. Make sure to include the OAuth2 flow."
                        </div>
                        <button className="w-full py-2 text-primary text-sm font-bold border border-primary/20 rounded-lg hover:bg-primary/5 transition">
                            View All Feedback
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;