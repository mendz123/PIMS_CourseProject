import React from "react";
import { useAuth } from "../../context/AuthContext";

interface TeacherHeaderProps {
    title: string;
    subtitle?: string;
}

const TeacherHeader: React.FC<TeacherHeaderProps> = ({ title, subtitle }) => {
    const { user } = useAuth();

    return (
        <header className="p-8 pb-0 max-w-[1200px] mx-auto">
            <div className="flex flex-wrap justify-between items-end gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-[#111318] text-3xl font-black tracking-tight">{title}</h2>
                    {subtitle && <p className="text-[#616f89] text-sm font-normal">{subtitle}</p>}
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
                        {user?.fullName?.split(" ").pop() || "Lecturer"}
                    </span>
                </div>
            </div>
        </header>
    );
};

export default TeacherHeader;
