import React from "react";
import StatCard from "./StatCard";

interface TeacherStatsProps {
    activeGroupsCount: number;
    pendingProposalsCount: number;
    unreviewedReportsCount: number;
}

const TeacherStats: React.FC<TeacherStatsProps> = ({ activeGroupsCount, pendingProposalsCount, unreviewedReportsCount }) => {
    const stats = [
        { label: "Pending Proposals", value: pendingProposalsCount.toString(), icon: "description" },
        { label: "Active Groups", value: activeGroupsCount.toString(), icon: "groups_2", iconColorClass: "text-orange-500" },
        { label: "Unreviewed Reports", value: unreviewedReportsCount.toString(), icon: "pending_actions", iconColorClass: "text-green-500" },
    ];

    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, idx) => (
                <StatCard key={idx} {...stat} />
            ))}
        </section>
    );
};

export default TeacherStats;
