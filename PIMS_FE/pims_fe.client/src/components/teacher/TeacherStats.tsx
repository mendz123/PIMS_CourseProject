import React from "react";
import StatCard from "./StatCard";

const TeacherStats: React.FC = () => {
    // These could eventually come from props or a custom hook
    const stats = [
        { label: "Pending Proposals", value: "12", icon: "description", trend: { value: "2%", isUp: true } },
        { label: "Active Groups", value: "24", icon: "groups_2", trend: { value: "1%", isUp: false }, iconColorClass: "text-orange-500" },
        { label: "Unreviewed Reports", value: "08", icon: "pending_actions", trend: { value: "5%", isUp: true }, iconColorClass: "text-green-500" },
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
