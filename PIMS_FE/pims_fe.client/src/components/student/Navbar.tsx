import React from 'react';
import { Bell, ChevronDown, LayoutDashboard, FolderOpen, UserCircle } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="bg-[#1e293b] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
            <div className="flex items-center gap-12">
                <h1 className="text-2xl font-bold tracking-tighter text-[#10b981]">PIMS</h1>
                <div className="hidden md:flex items-center gap-6">
                    <button className="flex items-center gap-2 hover:text-[#10b981] transition-colors font-medium">
                        <LayoutDashboard size={18} /> Dashboard
                    </button>
                    <button className="flex items-center gap-2 hover:text-[#10b981] transition-colors text-gray-400">
                        <FolderOpen size={18} /> Projects
                    </button>
                    <button className="flex items-center gap-2 hover:text-[#10b981] transition-colors text-gray-400">
                        <UserCircle size={18} /> Profile
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <button className="relative text-gray-400 hover:text-white transition-colors">
                    <Bell size={22} />
                    <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full border-2 border-[#1e293b]"></span>
                </button>
                <div className="flex items-center gap-3 border-l border-gray-700 pl-6">
                    <div className="w-9 h-9 bg-[#10b981] rounded-full flex items-center justify-center font-bold text-white">LH</div>
                    <span className="hidden sm:inline font-medium text-gray-200">Lê Xuân Hoàng</span>
                    <ChevronDown size={16} className="text-gray-400" />
                </div>
            </div>
        </nav>

    );
};

export default Navbar;