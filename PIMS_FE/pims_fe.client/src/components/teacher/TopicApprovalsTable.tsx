import React from "react";

interface ApprovalItem {
    groupId: string;
    title: string;
    date: string;
}

interface TopicApprovalsTableProps {
    items: ApprovalItem[];
}

const TopicApprovalsTable: React.FC<TopicApprovalsTableProps> = ({ items }) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-[#111318] text-xl font-bold">Pending Topic Approvals</h2>
                <button className="text-primary text-sm font-semibold hover:underline">View All</button>
            </div>
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
                        {items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-[#616f89] text-sm font-medium">{item.groupId}</td>
                                <td className="px-6 py-4">
                                    <p className="text-[#111318] text-sm font-semibold">
                                        {item.title}
                                    </p>
                                    <p className="text-xs text-[#616f89]">Submitted: {item.date}</p>
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
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TopicApprovalsTable;
