import React, { useEffect, useState } from 'react';
import { X, BookOpen, Check, XCircle, Loader2, Users, Crown } from 'lucide-react';
import axios from 'axios';
import { groupService } from '../../services/groupService';
import type { TopicReviewDto } from '../../types/group.types';

interface Props {
    groupId: number;
    onClose: () => void;
    onApproved: () => void;
    onRejected: () => void;
}

const TopicReviewModal: React.FC<Props> = ({ groupId, onClose, onApproved, onRejected }) => {
    const [topic, setTopic] = useState<TopicReviewDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [responding, setResponding] = useState<'approve' | 'reject' | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await groupService.getPendingTopicRequests();
                if (res.success && res.data) {
                    const found = res.data.find(t => t.groupId === groupId) ?? null;
                    setTopic(found);
                    if (!found) setError('Topic not found or already reviewed.');
                } else {
                    setError('Could not load topic details.');
                }
            } catch {
                setError('Could not load topic details.');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [groupId]);

    const handleApprove = async () => {
        setResponding('approve');
        setError('');
        try {
            const res = await groupService.approveTopicRequest(groupId);
            if (res.success) {
                onApproved();
            } else {
                setError(res.message || 'Failed to approve topic.');
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
            const res = await groupService.rejectTopicRequest(groupId);
            if (res.success) {
                onRejected();
            } else {
                setError(res.message || 'Failed to reject topic.');
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
                            <BookOpen size={20} className="text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Topic Review</h3>
                            <p className="text-xs text-gray-500">Review and approve or reject this topic</p>
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
                        <div className="flex justify-center items-center h-32">
                            <Loader2 size={28} className="animate-spin text-primary" />
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 py-8 text-sm">{error}</div>
                    ) : topic ? (
                        <div className="space-y-4">
                            {/* Group info */}
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                                    <Users size={18} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Group</p>
                                    <p className="text-sm font-bold text-gray-900">{topic.groupName}</p>
                                </div>
                                <div className="ml-auto flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                                    <Crown size={11} />
                                    {topic.leaderName}
                                </div>
                            </div>

                            {/* Topic Name */}
                            <div>
                                <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wide">Topic Name</p>
                                <p className="text-sm font-bold text-gray-900 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                                    {topic.topicName}
                                </p>
                            </div>

                            {/* Description */}
                            <div>
                                <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wide">Description</p>
                                <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 leading-relaxed whitespace-pre-wrap">
                                    {topic.description}
                                </p>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                                    {error}
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                {topic && (
                    <div className="flex gap-3 p-6 border-t border-gray-100 shrink-0">
                        <button
                            onClick={handleReject}
                            disabled={!!responding}
                            className="flex-1 py-3 border-2 border-red-200 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {responding === 'reject' ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                            {responding === 'reject' ? 'Rejecting...' : 'Reject'}
                        </button>
                        <button
                            onClick={handleApprove}
                            disabled={!!responding}
                            className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {responding === 'approve' ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            {responding === 'approve' ? 'Approving...' : 'Approve'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopicReviewModal;
