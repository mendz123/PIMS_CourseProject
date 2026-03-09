import React from "react";
import { useAuth } from "../../context/AuthContext";

interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    const { user } = useAuth();

    return (
        <header className="sticky top-0 z-10 flex items-center justify-between bg-white border-b border-gray-200 px-8 py-4">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            </div>
            <div className="flex items-center gap-6">
                <label className="relative flex items-center min-w-64">
                    <span className="material-symbols-outlined absolute left-3 text-gray-400">search</span>
                    <input
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary"
                        placeholder="Search tasks or files..."
                    />
                </label>
                <div className="flex items-center gap-3">
                    <button className="p-2 bg-gray-100 rounded-lg text-gray-600">
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                    <div className="flex items-center gap-3 pl-2 border-l border-gray-100">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-gray-900 leading-none">{user?.fullName || "Student"}</p>
                            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">{user?.role || "Student"}</p>
                        </div>
                        <div
                            className="h-10 w-10 rounded-full bg-cover bg-center border-2 border-primary"
                            style={{
                                backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "S")}&background=135bec&color=fff')`
                            }}
                        ></div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;