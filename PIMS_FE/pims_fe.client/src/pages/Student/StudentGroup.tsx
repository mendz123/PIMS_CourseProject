import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { Users, UserPlus, BookOpen, GraduationCap, Lock, Loader2, X, Crown, User, Info } from 'lucide-react';
import axios from 'axios';
import { useGroup } from '../../hooks/useGroup';
import { groupService } from '../../services/groupService';
import type { GroupMemberDto } from '../../types/group.types';
import InviteMemberModal from '../../components/student/InviteMemberModal';
import InviteMentorModal from '../../components/student/InviteMentorModal';
import RegisterTopicModal from '../../components/student/RegisterTopicModal';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
    CREATED:     { label: 'CREATED',     color: 'bg-blue-100 text-blue-700' },
    FORMING:     { label: 'FORMING',     color: 'bg-yellow-100 text-yellow-700' },
    SUBMITTED:   { label: 'SUBMITTED',   color: 'bg-purple-100 text-purple-700' },
    APPROVED:    { label: 'APPROVED',    color: 'bg-green-100 text-green-700' },
    IN_PROGRESS: { label: 'IN_PROGRESS', color: 'bg-cyan-100 text-cyan-700' },
    COMPLETED:   { label: 'COMPLETED',   color: 'bg-emerald-100 text-emerald-700' },
    CANCELLED:   { label: 'CANCELLED',   color: 'bg-red-100 text-red-700' },
};

const StudentGroup: React.FC = () => {
const { group, hasGroup, groupLoading, refetchGroup } = useGroup();

const [showModal, setShowModal] = useState(false);
const [groupName, setGroupName] = useState('');
const [nameError, setNameError] = useState('');
const [creating, setCreating] = useState(false);
const [showInviteModal, setShowInviteModal] = useState(false);
const [showInviteMentorModal, setShowInviteMentorModal] = useState(false);
const [showRegisterTopicModal, setShowRegisterTopicModal] = useState(false);
const [members, setMembers] = useState<GroupMemberDto[]>([]);
const [membersLoading, setMembersLoading] = useState(false);

const isForming = !!group && group.statusId >= 2;
const canRegisterTopic = !!group && group.isLeader && group.statusId === 2 && !!group.mentorId;
const canInviteMentor = !!group && group.isLeader && isForming && !group.mentorId;

useEffect(() => {
    if (!hasGroup) { setMembers([]); return; }
    setMembersLoading(true);
    groupService.getMyGroupDetail()
        .then(res => { if (res.success && res.data) setMembers(res.data.members ?? []); })
        .catch(() => {})
        .finally(() => setMembersLoading(false));
}, [hasGroup, group?.memberCount]);

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
                                                Leader
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-500 text-sm mt-1">
                                        {group!.semesterName} &bull; {group!.memberCount}/5 members
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <ActionButton
                            icon={<BookOpen size={24} />}
                            label="Đề Tài"
                            description={
                                canRegisterTopic
                                    ? 'Đăng ký đề tài cho nhóm'
                                    : !group!.isLeader
                                    ? 'Chỉ trưởng nhóm mới đăng ký được'
                                    : !group!.mentorId
                                    ? 'Mời mentor trước khi đăng ký đề tài'
                                    : group!.statusId > 2
                                    ? `Đề tài: ${group!.statusName}`
                                    : 'Mở khi nhóm có mentor'
                            }
                            locked={!canRegisterTopic}
                            lockReason={
                                !group!.isLeader
                                    ? 'Chỉ trưởng nhóm thực hiện được'
                                    : !group!.mentorId
                                    ? 'Nhóm chưa có mentor'
                                    : group!.statusId > 2
                                    ? `Trạng thái: ${group!.statusName}`
                                    : 'Mở khi nhóm đạt FORMING + có mentor'
                            }
                            onClick={() => setShowRegisterTopicModal(true)}
                        />
                        <ActionButton
                            icon={<UserPlus size={24} />}
                            label="Invite Member"
                            description={group!.isLeader ? 'Add member to group' : 'Only the leader can invite'}
                            locked={!group!.isLeader}
                            lockReason="Chỉ trưởng nhóm thực hiện được"
                            onClick={() => setShowInviteModal(true)}
                        />
                        <ActionButton
                            icon={<GraduationCap size={24} />}
                            label="Mentor"
                            description={
                                group!.mentorId
                                    ? `Assigned: ${group!.mentorName || 'Mentor'}`
                                    : canInviteMentor
                                    ? 'Invite a supervisor'
                                    : !group!.isLeader
                                    ? 'Leader only'
                                    : 'Unlocks at 4–5 members (FORMING)'
                            }
                            locked={!canInviteMentor && !group!.mentorId}
                            lockReason={
                                !group!.isLeader
                                    ? 'Leader only'
                                    : 'Unlocks at FORMING status'
                            }
                            onClick={() => setShowInviteMentorModal(true)}
                        />
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                            <Users size={16} className="text-primary" />
                            <h4 className="text-sm font-bold text-gray-900">Members</h4>
                            <span className="ml-auto text-xs text-gray-400">{group!.memberCount}/5</span>
                        </div>
                        {membersLoading ? (
                            <div className="p-6 flex justify-center">
                                <Loader2 size={20} className="animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {members.map(m => (
                                    <div key={m.userId} className="flex items-center gap-3 px-5 py-3">
                                        <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">
                                            {m.fullName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{m.fullName}</p>
                                            <p className="text-xs text-gray-400">ID: {m.userId} &bull; {m.email}</p>
                                        </div>
                                        {m.userId === group!.leaderId ? (
                                            <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                                <Crown size={10} /> Leader
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                                <User size={10} /> Member
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
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

            {/* ───── MODAL MỜI MENTOR ───── */}
            {showInviteMentorModal && group && (
                <InviteMentorModal
                    groupId={group.groupId}
                    onClose={() => setShowInviteMentorModal(false)}
                    onSuccess={() => {
                        setShowInviteMentorModal(false);
                        refetchGroup();
                    }}
                />
            )}

            {/* ───── MODAL ĐĂNG KÝ ĐỀ TÀI ───── */}
            {showRegisterTopicModal && group && (
                <RegisterTopicModal
                    groupId={group.groupId}
                    onClose={() => setShowRegisterTopicModal(false)}
                    onSuccess={() => {
                        setShowRegisterTopicModal(false);
                        toast.success('Đăng ký đề tài thành công! Đang chờ mentor xét duyệt.');
                        refetchGroup();
                    }}
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