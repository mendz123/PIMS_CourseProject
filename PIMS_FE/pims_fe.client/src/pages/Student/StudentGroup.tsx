import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FileText, Users, AlertTriangle, UserPlus, Info, Bell } from 'lucide-react';

const StudentGroup = () => {
    const [currentDate] = useState(new Date());

    // Giả lập trạng thái từ Backend (Bạn sẽ thay thế bằng API thực tế)
    const [userStatus, setUserStatus] = useState({
        hasGroup: true,       // false nếu chưa có nhóm
        hasProject: false,    // false nếu nhóm chưa có dự án
    });

    // Mock dữ liệu danh sách nhóm (dùng khi chưa có nhóm)
    const availableGroups = [
        { id: 101, name: "Nhóm 01 - AI Research", members: 3, max: 5, mentor: "TS. Nguyễn Văn A" },
        { id: 102, name: "Nhóm 05 - Web E-com", members: 2, max: 4, mentor: "ThS. Lê Thị B" },
    ];

    const projectInfo = {
        name: "Phần mềm quản lý đề tài PIMS",
        group: "Nhóm 07",
        mentor: "TS. Nguyễn Văn A",
        deadline: "Iteration 2 - 15/02/2026"
    };

    return (
        <div className="max-w-7xl mx-auto">
            <Toaster position="top-right" />

            {/* Header chào mừng */}
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-[#0f172a]">Thông tin nhóm & Dự án</h2>
                <p className="text-gray-500 capitalize">{format(currentDate, 'eeee, dd/MM/yyyy', { locale: vi })}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* CỘT TRÁI & GIỮA: TRẠNG THÁI NHÓM/DỰ ÁN */}
                <div className="lg:col-span-2 space-y-8">

                    {!userStatus.hasGroup ? (
                        /* TRƯỜNG HỢP 1: CHƯA CÓ NHÓM */
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><UserPlus size={24} /></div>
                                <h3 className="text-xl font-bold text-[#1e293b]">Danh sách nhóm đang tuyển thành viên</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-gray-400 text-sm">
                                            <th className="pb-4 font-semibold">Tên Nhóm</th>
                                            <th className="pb-4 font-semibold text-center">Thành viên</th>
                                            <th className="pb-4 font-semibold">Mentor</th>
                                            <th className="pb-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-600">
                                        {availableGroups.map(group => (
                                            <tr key={group.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                                <td className="py-4 font-medium text-gray-900">{group.name}</td>
                                                <td className="py-4 text-center">{group.members}/{group.max}</td>
                                                <td className="py-4 text-sm">{group.mentor}</td>
                                                <td className="py-4 text-right">
                                                    <button className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary hover:text-white transition-all">
                                                        Xin gia nhập
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    ) : (
                        /* TRƯỜNG HỢP 2: ĐÃ CÓ NHÓM */
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={24} /></div>
                                <h3 className="text-xl font-bold text-[#1e293b]">Nhóm hiện tại: {projectInfo.group}</h3>
                            </div>

                            {!userStatus.hasProject ? (
                                /* CẢNH BÁO CHƯA CÓ DỰ ÁN */
                                <div className="flex flex-col items-center justify-center p-12 bg-amber-50 rounded-2xl border border-amber-100 text-center">
                                    <AlertTriangle size={48} className="text-amber-500 mb-4 animate-pulse" />
                                    <h4 className="text-lg font-bold text-amber-900">Nhóm chưa có dự án nào</h4>
                                    <p className="text-amber-700 mt-2 max-w-md">Vui lòng liên hệ Mentor hoặc đợi cập nhật từ hệ thống để bắt đầu thực hiện dự án.</p>
                                </div>
                            ) : (
                                /* THÔNG TIN DỰ ÁN KHI ĐÃ CÓ */
                                <div className="space-y-6">
                                    <div className="bg-slate-50 p-6 rounded-2xl flex items-start gap-4 border border-slate-100">
                                        <div className="p-3 bg-white shadow-sm rounded-xl text-primary"><FileText size={32} /></div>
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900">{projectInfo.name}</h4>
                                            <p className="text-gray-500 text-sm mt-1">Dự án chuyên ngành • Spring 2026</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <span className="text-gray-400 text-xs font-bold uppercase">Giảng viên hướng dẫn</span>
                                            <p className="font-semibold text-gray-900 mt-1">{projectInfo.mentor}</p>
                                        </div>
                                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                            <span className="text-emerald-600 text-xs font-bold uppercase">Hạn nộp báo cáo</span>
                                            <p className="font-semibold text-emerald-900 mt-1">{projectInfo.deadline}</p>
                                        </div>
                                    </div>
                                    <button className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                                        Xem tài liệu dự án
                                    </button>
                                </div>
                            )}
                        </section>
                    )}
                </div>

                {/* CỘT PHẢI: THÔNG BÁO & HƯỚNG DẪN */}
                <div className="space-y-8">
                    {/* THÔNG BÁO */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Bell size={20} /></div>
                            <h3 className="text-lg font-bold text-[#1e293b] ">Thông báo mới</h3>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex gap-4 pb-4 border-b border-gray-50 last:border-0">
                                <div className="w-1.5 h-1.5 mt-2 bg-red-400 rounded-full shrink-0"></div>
                                <p className="text-gray-600 text-xs leading-relaxed">Nhắc nhở nộp báo cáo Iteration 2 cho các nhóm đã có dự án.</p>
                            </li>
                            <li className="flex gap-4 pb-4 border-b border-gray-50 last:border-0">
                                <div className="w-1.5 h-1.5 mt-2 bg-blue-400 rounded-full shrink-0"></div>
                                <p className="text-gray-600 text-xs leading-relaxed">Đã cập nhật danh sách các nhóm chưa đủ thành viên kỳ này.</p>
                            </li>
                        </ul>
                    </section>

                    {/* HƯỚNG DẪN */}
                    <section className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Info size={18} className="text-primary" />
                            <h3 className="text-md font-bold text-white">Lưu ý sinh viên</h3>
                        </div>
                        <ul className="space-y-3 text-xs text-slate-400 leading-relaxed">
                            <li>• Mỗi nhóm chỉ được có tối đa 5 thành viên theo quy định của bộ môn.</li>
                            <li>• Sau khi vào nhóm, trưởng nhóm sẽ là người đại diện gán dự án.</li>
                            <li>• Mentor có quyền từ chối yêu cầu gia nhập nhóm nếu không phù hợp.</li>
                        </ul>
                    </section>
                </div>

            </div>

            {/*<footer className="text-center py-12 text-gray-400 text-sm">*/}
            {/*    PIMS © 2026 Student Portal System.*/}
            {/*</footer>*/}
        </div>
    );
};

export default StudentGroup;