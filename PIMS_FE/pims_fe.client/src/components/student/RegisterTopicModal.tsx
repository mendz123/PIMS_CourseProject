import React, { useState } from "react";
import { X, BookOpen, Loader2, Send, RefreshCw } from "lucide-react";
import axios from "axios";
import { groupService } from "../../services/groupService";

interface Props {
  groupId: number;
  existingProject?: { title: string; description: string } | null;
  onClose: () => void;
  onSuccess: () => void;
}

const RegisterTopicModal: React.FC<Props> = ({
  groupId,
  existingProject,
  onClose,
  onSuccess,
}) => {
  const isUpdate = !!existingProject;
  const [topicName, setTopicName] = useState(existingProject?.title ?? "");
  const [description, setDescription] = useState(
    existingProject?.description ?? "",
  );
  const [errors, setErrors] = useState<{
    topicName?: string;
    description?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const newErrors: { topicName?: string; description?: string } = {};
    if (!topicName.trim()) newErrors.topicName = "Topic name is required.";
    if (!description.trim()) newErrors.description = "Description is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setServerError("");
    setLoading(true);
    try {
      const payload = {
        topicName: topicName.trim(),
        description: description.trim(),
      };
      const res = isUpdate
        ? await groupService.updateTopic(groupId, payload)
        : await groupService.registerTopic(groupId, payload);
      if (res.success) {
        onSuccess();
      } else {
        setServerError(
          res.message ||
            (isUpdate
              ? "Failed to update topic."
              : "Failed to register topic."),
        );
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ??
          "An error occurred. Please try again.")
        : "An error occurred. Please try again.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {isUpdate ? "Update Topic" : "Register Topic"}
              </h3>
              <p className="text-xs text-gray-500">
                {isUpdate
                  ? "Edit your topic information and resubmit to your mentor"
                  : "Fill in the topic information to submit to your mentor for review"}
              </p>
            </div>
          </div>
          <button
            onClick={() => !loading && onClose()}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Topic Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Topic Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={topicName}
              onChange={(e) => {
                setTopicName(e.target.value);
                setErrors((p) => ({ ...p, topicName: undefined }));
              }}
              placeholder="Enter topic name..."
              disabled={loading}
              className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-primary/30 ${
                errors.topicName
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200 focus:border-primary"
              }`}
            />
            {errors.topicName && (
              <p className="text-red-500 text-xs mt-1.5">{errors.topicName}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((p) => ({ ...p, description: undefined }));
              }}
              placeholder="Your topic description..."
              rows={5}
              disabled={loading}
              className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all resize-none focus:ring-2 focus:ring-primary/30 ${
                errors.description
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200 focus:border-primary"
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1.5">
                {errors.description}
              </p>
            )}
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
              {serverError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-100 shrink-0">
          <button
            onClick={() => !loading && onClose()}
            disabled={loading}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isUpdate ? (
              <RefreshCw size={16} />
            ) : (
              <Send size={16} />
            )}
            {loading
              ? isUpdate
                ? "Updating..."
                : "Sending..."
              : isUpdate
                ? "Update & Resubmit"
                : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterTopicModal;
