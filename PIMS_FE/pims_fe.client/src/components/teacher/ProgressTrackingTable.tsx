import React from "react";

interface ProgressItem {
    groupName: string;
    leadStudent: string;
    milestone: string;
    progress: number;
    status: string;
    statusColorClass: string;
}

interface ProgressTrackingTableProps {
    items: ProgressItem[];
    totalCount: number;
}

const ProgressTrackingTable: React.FC<ProgressTrackingTableProps> = ({ items, totalCount }) => {
    return (
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
                        {items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-[#111318] text-sm font-semibold tracking-tight">
                                    {item.groupName}
                                </td>
                                <td className="px-6 py-4 text-[#616f89] text-sm">{item.leadStudent}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-[#616f89] font-medium whitespace-nowrap">
                                            {item.milestone}
                                        </span>
                                        <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-primary h-full" style={{ width: `${item.progress}%` }}></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${item.statusColorClass}`}>
                                        {item.status}
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
                        ))}
                    </tbody>
                </table>
                <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
                    <span className="text-xs text-[#616f89]">Showing {items.length} of {totalCount} groups</span>
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
    );
};

export default ProgressTrackingTable;
