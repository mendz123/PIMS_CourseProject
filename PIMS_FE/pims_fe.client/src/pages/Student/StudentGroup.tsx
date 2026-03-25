import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  Users,
  UserPlus,
  BookOpen,
  GraduationCap,
  Lock,
  Loader2,
  X,
  Crown,
  User,
  Info,
  CheckCircle,
  Clock,
  LogOut,
} from "lucide-react";
import axios from "axios";
import { useGroup } from "../../hooks/useGroup";
import { groupService } from "../../services/groupService";
import type { GroupMemberDto, ProjectDto } from "../../types/group.types";
import InviteMemberModal from "../../components/student/InviteMemberModal";
import InviteMentorModal from "../../components/student/InviteMentorModal";
import RegisterTopicModal from "../../components/student/RegisterTopicModal";
import UserInfoDrawer from "../../components/shared/UserInfoDrawer";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  CREATED: { label: "CREATED", color: "bg-blue-100 text-blue-700" },
  FORMING: { label: "FORMING", color: "bg-yellow-100 text-yellow-700" },
  SUBMITTED: { label: "SUBMITTED", color: "bg-purple-100 text-purple-700" },
  APPROVED: { label: "APPROVED", color: "bg-green-100 text-green-700" },
  IN_PROGRESS: { label: "IN_PROGRESS", color: "bg-cyan-100 text-cyan-700" },
  COMPLETED: { label: "COMPLETED", color: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "CANCELLED", color: "bg-red-100 text-red-700" },
};

const StudentGroup: React.FC = () => {
  const { group, hasGroup, groupLoading, refetchGroup } = useGroup();

  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [nameError, setNameError] = useState("");
  const [creating, setCreating] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showInviteMentorModal, setShowInviteMentorModal] = useState(false);
  const [showRegisterTopicModal, setShowRegisterTopicModal] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [members, setMembers] = useState<GroupMemberDto[]>([]);
  const [project, setProject] = useState<ProjectDto | null>(null);
  const [membersLoading, setMembersLoading] = useState(false);
  const [detailRefetchCount, setDetailRefetchCount] = useState(0);
  const [selectedMember, setSelectedMember] = useState<GroupMemberDto | null>(
    null,
  );
  const [showUserDrawer, setShowUserDrawer] = useState(false);

  const isTopicApproved = !!group && group.statusId >= 4;
  const isTopicLocked = !!group && !!group.mentorId;
  const canRegisterOrUpdateTopic = !!group && group.isLeader && !isTopicLocked;
  const canInviteMentor =
    !!group && group.isLeader && group.statusId === 2 && !!project && !group.mentorId;
  const canInviteMember = !!group && group.isLeader && !isTopicApproved;
  const canLeaveGroup = !!group && !group.isLeader && !isTopicApproved;

  useEffect(() => {
    if (!hasGroup) {
      setMembers([]);
      setProject(null);
      return;
    }
    setMembersLoading(true);
    groupService
      .getMyGroupDetail()
      .then((res) => {
        if (res.success && res.data) {
          setMembers(res.data.members ?? []);
          setProject(res.data.project ?? null);
        }
      })
      .catch(() => {})
      .finally(() => setMembersLoading(false));
  }, [hasGroup, group?.memberCount, group?.statusId, detailRefetchCount]);

  const handleOpenModal = () => {
    setGroupName("");
    setNameError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (creating) return;
    setShowModal(false);
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      setNameError("Tên nhóm không được để trống.");
      return;
    }
    setNameError("");
    setCreating(true);
    try {
      const res = await groupService.createGroup(groupName.trim());
      if (res.success && res.data) {
        toast.success(`Tạo nhóm "${res.data.groupName}" thành công!`);
        setShowModal(false);
        await refetchGroup();
      } else {
        toast.error(res.message || "Tạo nhóm thất bại.");
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Đã xảy ra lỗi. Vui lòng thử lại.")
        : "Đã xảy ra lỗi. Vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  const statusInfo = group
    ? (STATUS_LABEL[group.statusName] ?? {
        label: group.statusName,
        color: "bg-gray-100 text-gray-700",
      })
    : null;

  const handleLeaveGroup = async () => {
    setLeaving(true);
    try {
      const res = await groupService.leaveGroup();
      if (res.success) {
        setShowLeaveConfirm(false);
        toast.success("You have left the group.");
        await refetchGroup();
      } else {
        toast.error(res.message || "Failed to leave the group.");
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ??
          "An error occurred. Please try again.")
        : "An error occurred. Please try again.";
      toast.error(msg);
    } finally {
      setLeaving(false);
    }
  };

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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bạn chưa có nhóm
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              Tạo nhóm mới để bắt đầu hành trình dự án của bạn trong học kỳ hiện
              tại.
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
                    <h2 className="text-2xl font-bold text-gray-900">
                      {group!.groupName}
                    </h2>
                    {statusInfo && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}
                      >
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
                    {group!.semesterName} &bull; {group!.memberCount}/6 members
                  </p>
                </div>
              </div>
              {!group!.isLeader && (
                <button
                  onClick={() => canLeaveGroup && setShowLeaveConfirm(true)}
                  disabled={!canLeaveGroup}
                  title={
                    isTopicApproved
                      ? "Cannot leave after topic is approved"
                      : undefined
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    canLeaveGroup
                      ? "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                      : "border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50"
                  }`}
                >
                  <LogOut size={15} />
                  Out Group
                  {isTopicApproved && (
                    <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">
                      Locked
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ActionButton
              icon={<BookOpen size={24} />}
              label="Topic"
              description={
                  isTopicLocked
                    ? "Locked after mentor accepts invitation"
                    : canRegisterOrUpdateTopic
                  ? project
                    ? "Update your registered topic"
                    : "Register a topic for your group"
                  : "Only the leader can register a topic"
              }
              locked={!canRegisterOrUpdateTopic}
                lockReason={
                  isTopicLocked
                    ? "Mentor accepted invitation, topic cannot be updated"
                    : "Only the leader can perform this action"
                }
              onClick={() => setShowRegisterTopicModal(true)}
            />
            <ActionButton
              icon={<UserPlus size={24} />}
              label="Invite Member"
              description={
                isTopicApproved
                  ? "Locked after topic approval"
                  : group!.isLeader
                    ? "Add member to group"
                    : "Only the leader can invite"
              }
              locked={!canInviteMember}
              lockReason={
                isTopicApproved
                  ? "Group topic has been approved"
                  : "Only the leader can do this"
              }
              onClick={() => setShowInviteModal(true)}
            />
            <ActionButton
              icon={<GraduationCap size={24} />}
              label="Mentor"
              description={
                group!.mentorId
                  ? `Assigned: ${group!.mentorName || "Mentor"}`
                  : canInviteMentor
                    ? "Invite a supervisor for your group"
                    : !group!.isLeader
                      ? "Leader only"
                      : !project
                        ? "Register a topic first"
                        : "Unlocks at 4–5 members (FORMING)"
              }
              locked={!canInviteMentor}
              lockReason={
                group!.mentorId
                  ? "Mentor already assigned"
                  : !group!.isLeader
                    ? "Leader only"
                    : !project
                      ? "Register a topic first"
                      : "Unlocks at FORMING status with a registered topic"
              }
              onClick={() => setShowInviteMentorModal(true)}
            />
          </div>

          {/* ───── REGISTERED TOPIC CARD ───── */}
          {project && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                <BookOpen size={16} className="text-primary" />
                <h4 className="text-sm font-bold text-gray-900">
                  Registered Topic
                </h4>
                <span
                  className={`ml-auto flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                    project.statusId === 3
                      ? "bg-green-100 text-green-700"
                      : group!.statusId === 3
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {project.statusId === 3 ? (
                    <>
                      <CheckCircle size={11} /> APPROVED
                    </>
                  ) : group!.statusId === 3 ? (
                    <>
                      <Clock size={11} /> AWAITING MENTOR
                    </>
                  ) : (
                    <>
                      <BookOpen size={11} /> DRAFT
                    </>
                  )}
                </span>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">
                    Topic Name
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {project.title}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">
                    Description
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {project.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <Users size={16} className="text-primary" />
              <h4 className="text-sm font-bold text-gray-900">Members</h4>
              <span className="ml-auto text-xs text-gray-400">
                {group!.memberCount}/5
              </span>
            </div>
            {membersLoading ? (
              <div className="p-6 flex justify-center">
                <Loader2 size={20} className="animate-spin text-primary" />
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {members.map((m) => (
                  <div
                    key={m.userId}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">
                      {m.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        onClick={() => {
                          setSelectedMember(m);
                          setShowUserDrawer(true);
                        }}
                        className="text-sm font-semibold text-gray-900 truncate cursor-pointer hover:text-primary transition-colors"
                        title="Click to view details"
                      >
                        {m.fullName}
                      </p>
                      <p className="text-xs text-gray-400">
                        ID: {m.userId} &bull; {m.email}
                      </p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
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
                onChange={(e) => {
                  setGroupName(e.target.value);
                  setNameError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="Nhập tên nhóm..."
                disabled={creating}
                autoFocus
                className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-primary/30 ${
                  nameError
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 focus:border-primary"
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
                {creating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <UserPlus size={16} />
                )}
                {creating ? "Đang tạo..." : "Tạo Nhóm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───── MODAL XÁC NHẬN OUT GROUP ───── */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-7 relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <LogOut size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Leave Group</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to leave{" "}
              <span className="font-semibold text-gray-900">
                {group!.groupName}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => !leaving && setShowLeaveConfirm(false)}
                disabled={leaving}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveGroup}
                disabled={leaving}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {leaving ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <LogOut size={15} />
                )}
                {leaving ? "Leaving..." : "Leave Group"}
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
          existingProject={
            project
              ? {
                  title: project.title ?? "",
                  description: project.description ?? "",
                }
              : null
          }
          onClose={() => setShowRegisterTopicModal(false)}
          onSuccess={() => {
            setShowRegisterTopicModal(false);
            toast.success(
              project
                ? "Đề tài đã được cập nhật thành công."
                : "Đề tài đã được đăng ký thành công.",
            );
            setDetailRefetchCount((c) => c + 1);
            refetchGroup();
          }}
        />
      )}

      {/* ───── USER INFO DRAWER ───── */}
      <UserInfoDrawer
        userId={selectedMember?.userId || null}
        isOpen={showUserDrawer}
        onClose={() => setShowUserDrawer(false)}
        isLeader={selectedMember?.userId === group?.leaderId}
      />
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

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  description,
  locked,
  lockReason,
  onClick,
}) => (
  <button
    onClick={locked ? undefined : onClick}
    disabled={locked}
    title={locked ? lockReason : undefined}
    className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 text-center transition-all w-full ${
      locked
        ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
        : "border-primary/20 bg-white text-primary hover:border-primary hover:shadow-md hover:shadow-blue-50 cursor-pointer"
    }`}
  >
    <div
      className={`p-3 rounded-xl ${locked ? "bg-gray-100" : "bg-primary/10"}`}
    >
      {locked ? <Lock size={24} className="text-gray-300" /> : icon}
    </div>
    <div>
      <p
        className={`font-bold text-sm ${locked ? "text-gray-300" : "text-gray-900"}`}
      >
        {label}
      </p>
      <p
        className={`text-xs mt-0.5 ${locked ? "text-gray-300" : "text-gray-500"}`}
      >
        {description}
      </p>
    </div>
    {locked && lockReason && (
      <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
        {lockReason}
      </span>
    )}
  </button>
);

export default StudentGroup;
