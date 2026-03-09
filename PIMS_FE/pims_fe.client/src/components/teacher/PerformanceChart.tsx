import React from "react";

interface PerformanceItem {
    label: string;
    percentage: number;
    colorClass: string;
}

interface PerformanceChartProps {
    items: PerformanceItem[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ items }) => {
    return (
        <div className="space-y-4">
            <h2 className="text-[#111318] text-xl font-bold px-1">Performance Distribution</h2>
            <div className="rounded-xl border border-[#dbdfe6] bg-white p-6 shadow-sm">
                <div className="space-y-4">
                    {items.map((item, idx) => (
                        <div key={idx}>
                            <div className="flex justify-between mb-1 text-sm font-medium">
                                <span>{item.label}</span>
                                <span className={item.colorClass.startsWith('bg-') ? item.colorClass.replace('bg-', 'text-') : item.colorClass}>{item.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                    className={`${item.colorClass} h-2 rounded-full`}
                                    style={{ width: `${item.percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-8 pt-6 border-t border-[#dbdfe6]">
                    <div className="flex items-center justify-center gap-2 text-[#616f89] text-sm">
                        <span className="material-symbols-outlined text-[18px]">info</span>
                        <span>Based on current semester reviews</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceChart;
