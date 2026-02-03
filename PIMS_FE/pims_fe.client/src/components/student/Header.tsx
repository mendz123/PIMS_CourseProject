import React from "react";

interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
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
                    <div
                        className="h-10 w-10 rounded-full bg-cover bg-center border-2 border-primary"
                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCDnadSgEx4CX46drDPxSjtnPLMgxNliGkSyeHYu7O9zlNYVj_zdPn6Z-zQNLcW8Jih9fR1Rwbwc1vfeXju_j6JWLD8q8OSxBQpe_yuxCDmBZ2PFEibWInVDLKE5r44Nt5V6BWEGgctWIvVPmV5xTOZoN5QzduxrhSPoVYKZTF212z-H_dLuC-az0-Uc1uDraV1FMbEln5LGTeI5RaRilHER8yjQzgtf9DvIIBdOjiPGleeNI6QPese1Uh_jc5Gbv1AtJLiiEWhV_kR')" }}
                    ></div>
                </div>
            </div>
        </header>
    );
};

export default Header;