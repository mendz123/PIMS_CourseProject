import React, { useState } from "react";
import { X, UserPlus, Loader2, Send } from "lucide-react";
import axios from "axios";
import { groupService } from "../../services/groupService";
import { userService } from "../../services/userService";
import EmailAutocompleteInput from "../shared/EmailAutocompleteInput";

interface Props {
  groupId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const InviteMemberModal: React.FC<Props> = ({
  groupId,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleInvite = async () => {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const res = await groupService.inviteMember(groupId, trimmed);
      if (res.success) {
        setSuccessMsg(`Invitation sent to ${trimmed} successfully!`);
        setEmail("");
        onSuccess();
      } else {
        setError(res.message || "Failed to send invitation.");
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ??
          "An error occurred. Please try again.")
        : "An error occurred. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 relative">
        <button
          onClick={handleClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <UserPlus size={22} className="text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Invite Member</h3>
            <p className="text-xs text-gray-500">
              Enter the email of the student you want to invite
            </p>
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Student Email <span className="text-red-500">*</span>
          </label>
          <EmailAutocompleteInput
            value={email}
            onChange={(v) => { setEmail(v); setError(""); setSuccessMsg(""); }}
            onSelect={(s) => { setEmail(s.email); setError(""); setSuccessMsg(""); }}
            fetchSuggestions={userService.searchStudents}
            placeholder="Enter student email..."
            disabled={loading}
            hasError={!!error}
          />
          {error && (
            <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
              {error}
            </p>
          )}
          {successMsg && (
            <p className="text-emerald-600 text-xs mt-1.5 font-medium">
              {successMsg}
            </p>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-5 text-xs text-amber-700 space-y-1">
          <p className="font-semibold">Invitation requirements:</p>
          <ul className="space-y-0.5 text-amber-600 list-disc list-inside">
            <li>Student must exist in the system</li>
            <li>Account must be active</li>
            <li>Not already in a group in the current semester</li>
            <li>Group must have fewer than 5 members</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClose}
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
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            {loading ? "Sending..." : "Send Invitation"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteMemberModal;
