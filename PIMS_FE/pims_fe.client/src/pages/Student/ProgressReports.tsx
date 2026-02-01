import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import toast, { Toaster } from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
    CloudUpload, FileText, Info, Loader2, SendHorizontal,
    Clock, User, ShieldCheck, AlertCircle, Download, BellRing, History
} from 'lucide-react';
import axios from 'axios';

const ProgressReports = () => {
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [iteration, setIteration] = useState('');
    const [currentDate] = useState(new Date());

    // 1. Trạng thái nhóm & Sinh viên (Lấy từ AuthContext của bạn)
    const [userStatus] = useState({
        hasGroup: true,
        groupName: "Nhóm 07",
        projectName: "E-Commerce Microservices Platform",
        studentName: "Lê Xuân Hoàng",
        mssv: "SE170000"
    });

    // 2. Mock dữ liệu Template (Bảng ProjectTemplates)
    const [templates] = useState([
        { id: 1, title: "Mẫu báo cáo Iteration 1 (SRS)", fileUrl: "#", type: "DOCX" },
        { id: 2, title: "Mẫu báo cáo thiết kế (Architecture)", fileUrl: "#", type: "PDF" },
    ]);

    // 3. Mock thông báo Deadline Assessment
    const [deadlines] = useState([
        { id: 1, title: "Iteration 1 - Requirement", date: new Date(2026, 1, 15), urgency: "high" },
    ]);

    // 4. Lịch sử nộp bài (Bảng ProjectSubmissions) - Giữ nguyên như bản cũ của bạn và thêm "Người nộp"
    const [submissionHistory, setSubmissionHistory] = useState([
        { id: 1, name: "Nhom07_IT1_Final.zip", date: "2026-01-15 14:30", status: "Approved", iteration: "Iteration 1", submitter: "Lê Xuân Hoàng", group: "Nhóm 07" },
        { id: 2, name: "Nhom07_IT2_Draft.rar", date: "2026-01-27 09:15", status: "Pending", iteration: "Iteration 2", submitter: "Nguyễn Văn B", group: "Nhóm 07" },
    ]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'application/x-zip-compressed': ['.zip'], 'application/x-rar-compressed': ['.rar'], 'application/x-7z-compressed': ['.7z'] },
        multiple: false,
        disabled: !userStatus.hasGroup,
        onDrop: (acceptedFiles) => {
            setSelectedFile(acceptedFiles[0]);
            toast.success(`Đã chọn: ${acceptedFiles[0].name}`);
        }
    });

    const handleSubmit = async () => {
        if (!iteration || !selectedFile) {
            toast.error('Vui lòng chọn Iteration và đính kèm file!');
            return;
        }

        const formData = new FormData();
        formData.append("ReportFile", selectedFile);
        formData.append("AssessmentId", iteration);

        setLoading(true);
        try {
            const response = await axios.post("https://localhost:7001/api/submissions/upload-report", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.success) {
                toast.success('Nộp báo cáo thành công!');
                setSelectedFile(null);
                setIteration('');
                // Sau khi nộp thành công, bạn nên gọi hàm fetch lại SubmissionHistory từ API
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            toast.error(errorMsg.includes('FK_Submission_Project') ? 'Lỗi: Nhóm chưa có dự án!' : 'Lỗi: ' + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            <Toaster position="top-right" />

            {/* HEADER */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[#0f172a]">Báo cáo tiến độ</h2>
                    <p className="text-gray-500 capitalize">{format(currentDate, 'eeee, dd/MM/yyyy', { locale: vi })}</p>
                </div>
                {userStatus.hasGroup && (
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
                        <div className="bg-primary/10 p-2 rounded-full text-primary"><User size={18} /></div>
                        <div className="text-sm">
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Sinh viên đang truy cập</p>
                            <p className="font-bold text-gray-700">{userStatus.studentName} ({userStatus.mssv})</p>
                        </div>
                    </div>
                )}
            </header>

            {!userStatus.hasGroup ? (
                /* GIAO DIỆN CHẶN NẾU CHƯA CÓ NHÓM */
                <div className="bg-white p-16 rounded-3xl shadow-sm border border-gray-100 text-center space-y-6">
                    <div className="bg-amber-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-amber-600">
                        <AlertCircle size={48} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-gray-900">Tính năng nộp bài bị khóa</h3>
                        <p className="text-gray-500 max-w-md mx-auto">Hệ thống ghi nhận bạn chưa thuộc nhóm nào. Bạn cần gia nhập nhóm để có <b>ProjectId</b> và <b>GroupId</b> trước khi nộp báo cáo.</p>
                    </div>
                    <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all">Đi đến Quản lý nhóm</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">

                        {/* 1. THÔNG BÁO DEADLINE SẮP TỚI */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {deadlines.map(dl => (
                                <div key={dl.id} className="bg-white p-4 rounded-2xl border-l-4 border-l-rose-500 shadow-sm flex items-center gap-4">
                                    <div className="p-3 bg-rose-50 text-rose-600 rounded-xl animate-pulse"><BellRing size={24} /></div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-[9px]">Sắp hết hạn</p>
                                        <p className="font-bold text-gray-800 text-sm">{dl.title}</p>
                                        <p className="text-rose-600 text-[10px] font-medium mt-1 italic">Còn {formatDistanceToNow(dl.date, { locale: vi })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 2. FORM NỘP BÀI CHÍNH */}
                        <section className="bg-white p-8 rounded-3xl shadow-md border border-gray-100 relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 text-primary rounded-lg"><CloudUpload size={24} /></div>
                                    <h3 className="text-xl font-bold text-[#1e293b]">Tải lên báo cáo mới</h3>
                                </div>
                                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase">{userStatus.groupName}</span>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Cột mốc báo cáo (Iteration)</label>
                                <select
                                    value={iteration}
                                    onChange={(e) => setIteration(e.target.value)}
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer"
                                >
                                    <option value="">-- Chọn đợt đánh giá --</option>
                                    <option value="1">Assessment 1: Requirement Specification</option>
                                    <option value="2">Assessment 2: System Architecture & Design</option>
                                    <option value="3">Assessment 3: Implementation & Testing</option>
                                </select>
                            </div>

                            <div {...getRootProps()} className={`border-2 border-dashed rounded-3xl p-14 text-center transition-all cursor-pointer mb-8 ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}>
                                <input {...getInputProps()} />
                                <CloudUpload size={64} className="mx-auto text-gray-300 mb-4" />
                                {selectedFile ? (
                                    <div className="text-primary font-bold">
                                        <p className="text-lg">{selectedFile.name}</p>
                                        <p className="text-xs opacity-60 font-normal">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-sm font-medium italic">Kéo thả file nén (.zip, .rar) vào đây để nộp bài</p>
                                )}
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-100"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <SendHorizontal size={20} />}
                                {loading ? 'ĐANG TẢI LÊN DRIVE...' : 'XÁC NHẬN NỘP BÁO CÁO'}
                            </button>
                        </section>

                        {/* 3. LỊCH SỬ NỘP BÀI (TỔNG HỢP MỚI + CŨ) */}
                        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-6">
                                <History size={20} className="text-gray-400" />
                                <h3 className="text-lg font-bold text-[#1e293b]">Lịch sử nộp bài của nhóm</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-[10px] text-gray-400 uppercase border-b border-gray-100 font-black tracking-widest">
                                        <tr>
                                            <th className="pb-3 px-2 text-center">Cột mốc</th>
                                            <th className="pb-3">Thông tin file</th>
                                            <th className="pb-3 text-center">Người nộp</th>
                                            <th className="pb-3 text-right">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {submissionHistory.map((sub) => (
                                            <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="py-4 px-2">
                                                    <div className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-1 rounded text-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                        {sub.iteration}
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">{sub.name}</p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium"><Clock size={10} /> {sub.date}</span>
                                                        <span className="text-[10px] text-primary font-bold italic">{sub.group}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600 mb-1">{sub.submitter.charAt(0)}</div>
                                                        <span className="text-[10px] font-medium text-gray-600">{sub.submitter}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${sub.status === 'Approved' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                                        {sub.status === 'Approved' ? '✓ Đã Duyệt' : '● Chờ Duyệt'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    {/* CỘT PHẢI: TEMPLATES & QUY ĐỊNH */}
                    <div className="space-y-6">
                        {/* 4. KHU VỰC TẢI TEMPLATES (PROJECT TEMPLATES) */}
                        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 border-t-4 border-t-emerald-500">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg font-bold italic"><Download size={20} /></div>
                                <h3 className="text-lg font-bold text-gray-900">Tải File mẫu</h3>
                            </div>
                            <div className="space-y-3">
                                {templates.map(tmp => (
                                    <a key={tmp.id} href={tmp.fileUrl} className="group flex items-center justify-between p-3 rounded-2xl border border-gray-50 hover:border-emerald-200 hover:bg-emerald-50 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="text-[9px] font-black bg-emerald-100 px-2 py-1 rounded text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-all uppercase">{tmp.type}</div>
                                            <p className="text-[11px] font-bold text-gray-700">{tmp.title}</p>
                                        </div>
                                        <Download size={14} className="text-gray-300 group-hover:text-emerald-600" />
                                    </a>
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-4 italic text-center">* Sinh viên vui lòng nộp bài đúng mẫu quy định.</p>
                        </section>

                        {/* Side: Hướng dẫn */}
                        <section className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Info size={20} className="text-primary" /> Lưu ý nộp
                            </h3>
                            <ul className="space-y-4 text-[11px] text-slate-400 leading-relaxed">
                                <li className="flex gap-2">
                                    <span className="text-primary font-bold underline">01</span>
                                    <span>Hệ thống tự động liên kết bài nộp với <b>Project ID</b> của nhóm bạn.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-primary font-bold underline">02</span>
                                    <span>Chỉ bản nộp cuối cùng trước deadline được tính là bản chính thức.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-primary font-bold underline">03</span>
                                    <span>File được tải trực tiếp lên Google Drive Admin với dung lượng không giới hạn.</span>
                                </li>
                            </ul>
                        </section>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgressReports;