import React, { useState } from 'react';
import { X, GraduationCap, Loader2, Send } from 'lucide-react';
import axios from 'axios';
import { groupService } from '../../services/groupService';

interface Props {
    groupId: number;
    onClose: () => void;
    onSuccess: () => void;
}

const InviteMentorModal: React.FC<Props> = ({ groupId, onClose, onSuccess }) => {
    const [userId, setUserId] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const handleInvite = async () => {
        const parsed = parseInt(userId.trim(), 10);
        if (!userId.trim() || isNaN(parsed) || parsed <= 0) {
            setError('Please enter a valid teacher ID.');
            return;
        }
        setError('');
        setSuccessMsg('');
        setLoading(true);
        try {
            const res = await groupService.inviteMentor(groupId, parsed, message.trim() || undefined);
            if (res.success) {
                setSuccessMsg(`Mentor invitation sent to teacher ID ${parsed} successfully!`);
                setUserId('');
                setMessage('');
                onSuccess();
            } else {
                setError(res.message || 'Failed to send mentor invitation.');
            }
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err)
                ? err.response?.data?.message ?? 'An error occurred. Please try again.'
                : 'An error occurred. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 relative">
                <button
                    onClick={() => !loading && onClose()}
                    disabled={loading}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <GraduationCap size={22} className="text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Invite Mentor</h3>
                        <p className="text-xs text-gray-500">Enter the ID of the teacher you want as mentor</p>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Teacher ID <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        min={1}
                        value={userId}
                        onChange={(e) => { setUserId(e.target.value); setError(''); setSuccessMsg(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                        placeholder="Enter teacher user ID..."
                        disabled={loading}
                        autoFocus
                        className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-primary/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                            error ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-primary'
                        }`}
                    />
                    {error && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">{error}</p>}
                    {successMsg && <p className="text-emerald-600 text-xs mt-1.5 font-medium">{successMsg}</p>}
                </div>

                <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Message <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Add a message to the teacher..."
                        disabled={loading}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                    />
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-5 text-xs text-amber-700 space-y-1">
                    <p className="font-semibold">Requirements to invite a mentor:</p>
                    <ul className="space-y-0.5 text-amber-600 list-disc list-inside">
                        <li>Group must be in <strong>FORMING</strong> status (4–5 members)</li>
                        <li>Teacher must exist and have an active account</li>
                        <li>Group must not already have a mentor</li>
                        <li>No pending mentor invitation already sent</li>
                    </ul>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => !loading && onClose()}
                        disabled={loading}
                        className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleInvite}
                        disabled={loading}
                        className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        {loading ? 'Sending...' : 'Send Invitation'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InviteMentorModal;
