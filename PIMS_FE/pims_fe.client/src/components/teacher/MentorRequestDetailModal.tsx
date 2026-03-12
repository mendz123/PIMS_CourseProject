import React, { useEffect, useState } from 'react';
import { X, Crown, Check, Loader2, UserCircle2, GraduationCap, MessageSquare, BookOpen } from 'lucide-react';
import axios from 'axios';
import { groupService } from '../../services/groupService';
import type { MentorRequestDetailDto } from '../../types/group.types';

interface Props {
    requestId: number;
    onClose: () => void;
    onAccepted: () => void;
    onRejected: () => void;
}

const MentorRequestDetailModal: React.FC<Props> = ({ requestId, onClose, onAccepted, onRejected }) => {
    const [detail, setDetail] = useState<MentorRequestDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [responding, setResponding] = useState<'accept' | 'reject' | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await groupService.getMentorRequestDetail(requestId);
                if (res.success) setDetail(res.data);
                else setError('Could not load request details.');
            } catch {
                setError('Could not load request details.');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [requestId]);

    const handleAccept = async () => {
        setResponding('accept');
        setError('');
        try {
            const res = await groupService.acceptMentorRequest(requestId);
            if (res.success) {
                onAccepted();
            } else {
                setError(res.message || 'Failed to accept request.');
            }
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err)
                ? err.response?.data?.message ?? 'An error occurred.'
                : 'An error occurred.';
            setError(msg);
        } finally {
            setResponding(null);
        }
    };

    const handleReject = async () => {
        setResponding('reject');
        setError('');
        try {
            const res = await groupService.rejectMentorRequest(requestId);
            if (res.success) {
                onRejected();
            } else {
                setError(res.message || 'Failed to reject request.');
            }
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err)
                ? err.response?.data?.message ?? 'An error occurred.'
                : 'An error occurred.';
            setError(msg);
        } finally {
            setResponding(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 relative flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <GraduationCap size={20} className="text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Mentor Request Details</h3>
                            <p className="text-xs text-gray-500">Review group info before deciding</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={!!responding}
                        className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
                            <Loader2 size={20} className="animate-spin" />
                            <span className="text-sm">Loading...</span>
                        </div>
                    ) : !detail ? (
                        <div className="text-center py-10 text-gray-400 text-sm">
                            Could not load request details.
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {/* Group Info */}
                            <div className="bg-blue-50 rounded-xl p-4">
                                <p className="text-xs text-gray-500 mb-1">Group Name</p>
                                <p className="text-xl font-bold text-gray-900">{detail.groupName}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    Requested by leader:{' '}
                                    <span className="font-semibold text-gray-700">{detail.leaderName}</span>
                                </p>
                            </div>

                            {/* Message from leader */}
                            {detail.message && (
                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MessageSquare size={14} className="text-amber-600" />
                                        <p className="text-xs font-bold text-amber-700">Message from leader</p>
                                    </div>
                                    <p className="text-sm text-gray-700 italic">"{detail.message}"</p>
                                </div>
                            )}

                            {/* Registered Topic */}
                            {detail.topic && (
                                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BookOpen size={14} className="text-purple-600" />
                                        <p className="text-xs font-bold text-purple-700">Registered Topic</p>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 mb-1">{detail.topic.title}</p>
                                    <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{detail.topic.description}</p>
                                </div>
                            )}

                            {/* Members */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-bold text-gray-800">Group Members</p>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {detail.memberCount}/5
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {detail.members.map((m) => (
                                        <div
                                            key={m.userId}
                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                                        >
                                            {m.avatarUrl ? (
                                                <img
                                                    src={m.avatarUrl}
                                                    alt={m.fullName}
                                                    className="size-9 rounded-full object-cover shrink-0"
                                                />
                                            ) : (
                                                <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                    <UserCircle2 size={20} className="text-primary" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{m.fullName}</p>
                                                <p className="text-xs text-gray-500 truncate">{m.email}</p>
                                            </div>
                                            {m.userId === detail.leaderId && (
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">
                                                    <Crown size={10} />
                                                    Leader
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <p className="text-red-500 text-xs text-center">{error}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {detail && detail.status === 'Pending' && (
                    <div className="flex gap-3 p-6 border-t border-gray-100 shrink-0">
                        <button
                            onClick={handleReject}
                            disabled={!!responding}
                            className="flex-1 py-3 flex items-center justify-center gap-2 border border-red-200 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                            {responding === 'reject' ? <Loader2 size={15} className="animate-spin" /> : <X size={15} />}
                            Decline
                        </button>
                        <button
                            onClick={handleAccept}
                            disabled={!!responding}
                            className="flex-1 py-3 flex items-center justify-center gap-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 disabled:opacity-70"
                        >
                            {responding === 'accept' ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                            Accept as Mentor
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MentorRequestDetailModal;
