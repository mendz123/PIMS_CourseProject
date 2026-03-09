import React from "react";

interface StatCardProps {
    label: string;
    value: string | number;
    icon: string;
    trend?: {
        value: string;
        isUp: boolean;
    };
    iconColorClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, iconColorClass = "text-primary" }) => {
    return (
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-[#dbdfe6] shadow-sm">
            <div className="flex justify-between items-start">
                <p className="text-[#616f89] text-sm font-medium uppercase tracking-wider">
                    {label}
                </p>
                <span className={`material-symbols-outlined ${iconColorClass}`}>{icon}</span>
            </div>
            <p className="text-[#111318] tracking-tight text-3xl font-bold">{value}</p>
            {trend && (
                <div className="flex items-center gap-1 mt-1">
                    <span className={`${trend.isUp ? "text-[#07883b]" : "text-[#e73908]"} text-sm font-bold`}>
                        {trend.isUp ? "+" : ""}{trend.value}
                    </span>
                    <span className="text-[#616f89] text-xs">from last week</span>
                </div>
            )}
        </div>
    );
};

export default StatCard;
