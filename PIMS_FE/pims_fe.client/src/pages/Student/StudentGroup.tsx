import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import toast, { Toaster } from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CloudUpload, FileText, Info, Loader2, SendHorizontal } from 'lucide-react';

const StudentGroup = () => {
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [iteration, setIteration] = useState('');
    const [currentDate] = useState(new Date());

    // Mock Data
    const projectInfo = {
        name: "Phần mềm quản lý đề tài PIMS",
        group: "Nhóm 07",
        mentor: "TS. Nguyễn Văn A",
        deadline: "Iteration 2 - 15/02/2026"
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'application/x-zip-compressed': ['.zip'],
            'application/x-rar-compressed': ['.rar'],
            'application/x-7z-compressed': ['.7z']
        },
        multiple: false,
        onDrop: acceptedFiles => {
            setSelectedFile(acceptedFiles[0]);
            toast.success(`Đã chọn file: ${acceptedFiles[0].name}`);
        }
    });

    const handleSubmit = async () => {
        if (!iteration || !selectedFile) {
            toast.error('Vui lòng chọn cột mốc và đính kèm file!');
            return;
        }

        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Logic gọi API của bạn ở đây...
            toast.success('Nộp báo cáo thành công lên Google Drive!');
            setSelectedFile(null);
        } catch (error) {
            toast.error('Có lỗi xảy ra: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Toaster position="top-right" />

            {/* Header trang (Nằm dưới Header chung của Layout) */}
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-[#0f172a]">Chào buổi sáng, Hoàng!</h2>
                <p className="text-gray-500 capitalize">{format(currentDate, 'eeee, dd/MM/yyyy', { locale: vi })}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Card A: Dự án hiện tại */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={24} /></div>
                            <h3 className="text-xl font-bold text-[#1e293b]">Dự án hiện tại của bạn</h3>
                        </div>
                        <div className="space-y-4 text-gray-600">
                            <p><span className="font-semibold text-gray-400 block text-sm">Tên dự án:</span> {projectInfo.name}</p>
                            <div className="grid grid-cols-2 gap-4">
                                <p><span className="font-semibold text-gray-400 block text-sm">Nhóm:</span> {projectInfo.group}</p>
                                <p><span className="font-semibold text-gray-400 block text-sm">Mentor:</span> {projectInfo.mentor}</p>
                            </div>
                            <p className="text-[#10b981] font-medium"><span className="font-semibold text-gray-400 block text-sm">Hạn nộp:</span> {projectInfo.deadline}</p>
                        </div>
                    </div>
                    <button className="mt-8 w-full py-3 border-2 border-[#10b981] text-[#10b981] rounded-xl font-bold hover:bg-[#10b981] hover:text-white transition-all">
                        Xem chi tiết dự án
                    </button>
                </section>

                {/* Card B: Thông báo */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-[#1e293b] mb-6">Thông báo mới nhất</h3>
                    <ul className="space-y-4">
                        <li className="flex gap-4 pb-4 border-b border-gray-50 last:border-0">
                            <div className="w-2 h-2 mt-2 bg-red-400 rounded-full shrink-0"></div>
                            <p className="text-gray-600 text-sm">Hệ thống bảo trì đêm nay để nâng cấp máy chủ.</p>
                        </li>
                        <li className="flex gap-4 pb-4 border-b border-gray-50 last:border-0">
                            <div className="w-2 h-2 mt-2 bg-[#10b981] rounded-full shrink-0"></div>
                            <p className="text-gray-600 text-sm">TS. Nguyễn Văn A đã duyệt báo cáo Iteration 1.</p>
                        </li>
                    </ul>
                </section>

                {/* Card C: Nộp báo cáo */}
                <section className="bg-white p-8 rounded-2xl shadow-md border-t-4 border-t-[#10b981]">
                    <h3 className="text-2xl font-bold text-[#1e293b] mb-6">Nộp báo cáo tiến độ</h3>
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Cột mốc báo cáo</label>
                        <select
                            value={iteration}
                            onChange={(e) => setIteration(e.target.value)}
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none"
                        >
                            <option value="">Chọn Iteration...</option>
                            <option value="1">Iteration 1</option>
                            <option value="2">Iteration 2</option>
                            <option value="3">Iteration 3</option>
                        </select>
                    </div>

                    <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer mb-8 ${isDragActive ? 'border-[#10b981] bg-green-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                        <input {...getInputProps()} />
                        <CloudUpload size={48} className="mx-auto text-gray-300 mb-4" />
                        {selectedFile ? (
                            <div className="text-[#10b981] font-medium">
                                <p className="text-lg">{selectedFile.name}</p>
                                <p className="text-sm opacity-70">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-gray-500 font-medium">Kéo thả file hoặc nhấn để chọn bài nộp</p>
                                <p className="text-gray-400 text-sm mt-1">Hỗ trợ .zip, .rar, .7z</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-[#10b981] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-[#0da673] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <SendHorizontal />}
                        {loading ? 'ĐANG XỬ LÝ...' : 'NỘP BÀI NGAY'}
                    </button>
                </section>

                {/* Card D: Hướng dẫn */}
                <section className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-2 mb-6 text-slate-800">
                        <Info size={20} />
                        <h3 className="text-xl font-bold">Hướng dẫn nộp bài</h3>
                    </div>
                    <ul className="space-y-4 text-slate-600">
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-slate-200 text-slate-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                            <span>Đảm bảo chọn đúng cột mốc Iteration.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-slate-200 text-slate-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                            <span>Chỉ chấp nhận .zip, .rar hoặc .7z.</span>
                        </li>
                    </ul>
                </section>
            </div>

            <footer className="text-center py-12 text-gray-400 text-sm">
                PIMS © 2026. All rights reserved.
            </footer>
        </>
    );
};

export default StudentGroup;