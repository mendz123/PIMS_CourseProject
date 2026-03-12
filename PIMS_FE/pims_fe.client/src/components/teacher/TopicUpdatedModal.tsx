import React, { useEffect, useState } from 'react';
import { X, BookOpen, FileText, Loader2 } from 'lucide-react';
import { groupService } from '../../services/groupService';
import type { GroupDetailDto } from '../../types/group.types';

interface Props {
    groupId: number;
    onClose: () => void;
}

const TopicUpdatedModal: React.FC<Props> = ({ groupId, onClose }) => {
    const [detail, setDetail] = useState<GroupDetailDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        groupService.getGroupDetail(groupId)
            .then(res => { if (res.success) setDetail(res.data); })
            .finally(() => setLoading(false));
    }, [groupId]);

    const project = detail?.project;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 relative flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <BookOpen size={20} className="text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Topic Updated</h3>
                            <p className="text-xs text-gray-500">Review the updated topic information</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
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
                        <p className="text-center text-sm text-gray-400 py-10">Could not load topic details.</p>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-blue-50 rounded-xl p-4">
                                <p className="text-xs text-gray-500 mb-1">Group Name</p>
                                <p className="text-xl font-bold text-gray-900">{detail.groupName}</p>
                            </div>
                            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <BookOpen size={14} className="text-purple-600" />
                                    <p className="text-xs font-bold text-purple-700">Topic Title</p>
                                </div>
                                <p className="text-sm font-bold text-gray-900">{project?.title ?? '—'}</p>
                            </div>
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText size={14} className="text-gray-600" />
                                    <p className="text-xs font-bold text-gray-700">Description</p>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {project?.description || 'No description provided.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TopicUpdatedModal;
