import React, { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { Users, UserPlus, BookOpen, GraduationCap, Lock, CheckCircle2, Info, Loader2, X } from 'lucide-react';
import axios from 'axios';
import { useGroup } from '../../hooks/useGroup';
import { groupService } from '../../services/groupService';
import InviteMemberModal from '../../components/student/InviteMemberModal';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
    CREATED: { label: 'Vừa tạo', color: 'bg-blue-100 text-blue-700' },
    FORMING: { label: 'Đang tuyển thành viên', color: 'bg-yellow-100 text-yellow-700' },
    SUBMITTED: { label: 'Đã nộp đề tài', color: 'bg-purple-100 text-purple-700' },
    APPROVED: { label: 'Mentor đã duyệt', color: 'bg-green-100 text-green-700' },
    IN_PROGRESS: { label: 'Đang thực hiện', color: 'bg-cyan-100 text-cyan-700' },
    COMPLETED: { label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-700' },
    CANCELLED: { label: 'Đã huỷ', color: 'bg-red-100 text-red-700' },
};

const StudentGroup: React.FC = () => {
const { group, hasGroup, groupLoading, refetchGroup } = useGroup();

const [showModal, setShowModal] = useState(false);
const [groupName, setGroupName] = useState('');
const [nameError, setNameError] = useState('');
const [creating, setCreating] = useState(false);
const [showInviteModal, setShowInviteModal] = useState(false);

const isForming = !!group && group.statusId >= 2;

    const handleOpenModal = () => {
        setGroupName('');
        setNameError('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        if (creating) return;
        setShowModal(false);
    };

    const handleCreate = async () => {
        if (!groupName.trim()) {
            setNameError('Tên nhóm không được để trống.');
            return;
        }
        setNameError('');
        setCreating(true);
        try {
            const res = await groupService.createGroup(groupName.trim());
            if (res.success && res.data) {
                toast.success(`Tạo nhóm "${res.data.groupName}" thành công!`);
                setShowModal(false);
                await refetchGroup();
            } else {
                toast.error(res.message || 'Tạo nhóm thất bại.');
            }
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err)
                ? err.response?.data?.message ?? 'Đã xảy ra lỗi. Vui lòng thử lại.'
                : 'Đã xảy ra lỗi. Vui lòng thử lại.';
            toast.error(msg);
        } finally {
            setCreating(false);
        }
    };

    const statusInfo = group
        ? (STATUS_LABEL[group.statusName] ?? { label: group.statusName, color: 'bg-gray-100 text-gray-700' })
        : null;

    if (groupLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-primary" size={36} />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <Toaster position="top-right" />

            {!hasGroup ? (
                /* ───── CHƯA CÓ NHÓM ───── */
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center text-center max-w-md w-full">
                        <div className="p-4 bg-primary/10 rounded-full mb-5">
                            <Users size={48} className="text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bạn chưa có nhóm</h2>
                        <p className="text-gray-500 text-sm mb-8">
                            Tạo nhóm mới để bắt đầu hành trình dự án của bạn trong học kỳ hiện tại.
                        </p>
                        <button
                            onClick={handleOpenModal}
                            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                        >
                            <UserPlus size={18} />
                            Tạo Nhóm
                        </button>
                    </div>

                    <div className="bg-slate-900 p-6 rounded-2xl text-white max-w-md w-full">
                        <div className="flex items-center gap-2 mb-3">
                            <Info size={16} className="text-primary" />
                            <h4 className="text-sm font-bold">Lưu ý sinh viên</h4>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-400 leading-relaxed">
                            <li>• Mỗi nhóm chỉ được có tối đa 6 thành viên theo quy định.</li>
                            <li>• Người tạo nhóm sẽ được gán làm trưởng nhóm.</li>
                            <li>• Sau khi tạo nhóm, bạn có thể mời thêm thành viên.</li>
                        </ul>
                    </div>
                </div>
            ) : (
                /* ───── ĐÃ CÓ NHÓM ───── */
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-xl">
                                    <Users size={28} className="text-primary" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h2 className="text-2xl font-bold text-gray-900">{group!.groupName}</h2>
                                        {statusInfo && (
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                                                {statusInfo.label}
                                            </span>
                                        )}
                                        {group!.isLeader && (
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                                                Trưởng nhóm
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-500 text-sm mt-1">
                                        {group!.semesterName} &bull; {group!.memberCount}/5 thành viên
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <ActionButton
                            icon={<BookOpen size={24} />}
                            label="Đề Tài"
                            description="Chọn & đăng ký đề tài"
                            locked={!isForming}
                            lockReason="Mở khi nhóm đạt 4–5 thành viên"
                            onClick={() => toast('Tính năng đang phát triển...', { icon: '🚧' })}
                        />
                        <ActionButton
                            icon={<UserPlus size={24} />}
                            label="Mời Thành Viên"
                            description={group!.isLeader ? 'Thêm thành viên vào nhóm' : 'Chỉ trưởng nhóm mới mời được'}
                            locked={!group!.isLeader}
                            lockReason="Chỉ trưởng nhóm thực hiện được"
                            onClick={() => setShowInviteModal(true)}
                        />
                        <ActionButton
                            icon={<GraduationCap size={24} />}
                            label="Mentor"
                            description="Yêu cầu giảng viên hướng dẫn"
                            locked={!isForming}
                            lockReason="Mở khi nhóm đạt 4–5 thành viên"
                            onClick={() => toast('Tính năng đang phát triển...', { icon: '🚧' })}
                        />
                    </div>

                    <div className="bg-slate-900 p-6 rounded-2xl text-white">
                        <div className="flex items-center gap-2 mb-3">
                            <Info size={16} className="text-primary" />
                            <h4 className="text-sm font-bold">Các bước tiếp theo</h4>
                        </div>
                        <ol className="space-y-2 text-xs text-slate-400 leading-relaxed list-none">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                                <span>Nhóm đã được tạo thành công.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                {isForming
                                    ? <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                                    : <span className="w-3.5 h-3.5 rounded-full border border-slate-500 shrink-0 mt-0.5" />
                                }
                                <span>Mời thêm thành viên để nhóm đạt từ 4–5 người.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-3.5 h-3.5 rounded-full border border-slate-500 shrink-0 mt-0.5" />
                                <span>Đăng ký đề tài sau khi nhóm ổn định.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-3.5 h-3.5 rounded-full border border-slate-500 shrink-0 mt-0.5" />
                                <span>Gửi yêu cầu Mentor khi đã có đề tài.</span>
                            </li>
                        </ol>
                    </div>
                </div>
            )}

            {/* ───── MODAL TẠO NHÓM ───── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 relative">
                        <button
                            onClick={handleCloseModal}
                            disabled={creating}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <UserPlus size={22} className="text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Tạo Nhóm Mới</h3>
                        </div>

                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tên nhóm <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => { setGroupName(e.target.value); setNameError(''); }}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                placeholder="Nhập tên nhóm..."
                                disabled={creating}
                                autoFocus
                                className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-primary/30 ${
                                    nameError ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-primary'
                                }`}
                            />
                            {nameError && (
                                <p className="text-red-500 text-xs mt-1.5">{nameError}</p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleCloseModal}
                                disabled={creating}
                                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
                            >
                                Huỷ
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={creating}
                                className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {creating ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                                {creating ? 'Đang tạo...' : 'Tạo Nhóm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ───── MODAL MỜI THÀNH VIÊN ───── */}
            {showInviteModal && group && (
                <InviteMemberModal
                    groupId={group.groupId}
                    onClose={() => setShowInviteModal(false)}
                    onSuccess={refetchGroup}
                />
            )}
        </div>
    );
};

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
    description: string;
    locked: boolean;
    lockReason?: string;
    onClick?: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, description, locked, lockReason, onClick }) => (
    <button
        onClick={locked ? undefined : onClick}
        disabled={locked}
        title={locked ? lockReason : undefined}
        className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 text-center transition-all w-full ${
            locked
                ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                : 'border-primary/20 bg-white text-primary hover:border-primary hover:shadow-md hover:shadow-blue-50 cursor-pointer'
        }`}
    >
        <div className={`p-3 rounded-xl ${locked ? 'bg-gray-100' : 'bg-primary/10'}`}>
            {locked ? <Lock size={24} className="text-gray-300" /> : icon}
        </div>
        <div>
            <p className={`font-bold text-sm ${locked ? 'text-gray-300' : 'text-gray-900'}`}>{label}</p>
            <p className={`text-xs mt-0.5 ${locked ? 'text-gray-300' : 'text-gray-500'}`}>{description}</p>
        </div>
        {locked && lockReason && (
            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{lockReason}</span>
        )}
    </button>
);

export default StudentGroup;