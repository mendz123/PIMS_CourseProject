import React, { useState } from "react";
import { userService } from "../../services/userService";
import type { UserInfo } from "../../types";

const ProfileSettings: React.FC<{ user: UserInfo | null }> = ({ user }) => {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    role: user?.role || "User",
    phoneNumber: user?.phoneNumber || "",
    bio: user?.bio || "",
    avatarUrl: user?.avatarUrl || "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving profile:", formData);

    try {
      const formPayload = new FormData();
      formPayload.append("fullName", formData.fullName);
      formPayload.append("phoneNumber", formData.phoneNumber);
      formPayload.append("bio", formData.bio);

      if (selectedFile) {
        formPayload.append("avatar", selectedFile);
        console.log("Uploading avatar:", selectedFile);
      }

      const response = await userService.updateProfile(formPayload);
      if (response.success) {
        console.log("Profile updated successfully", response.data);
      } else {
        console.error("Failed to update profile", response.message);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  // Cleanup object URL on unmount or when previewUrl changes
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="profile-section">
      <div className="profile-grid">
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrapper">
            {previewUrl || formData.avatarUrl ? (
              <img
                src={previewUrl || formData.avatarUrl}
                alt="Profile"
                className="profile-avatar-large object-cover"
              />
            ) : (
              <div className="profile-avatar-large">
                {user?.fullName?.charAt(0) || "U"}
              </div>
            )}
            <button
              className="avatar-edit-btn"
              onClick={handleAvatarClick}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">
                photo_camera
              </span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div className="text-center lg:text-left">
            <h4 className="text-lg font-bold text-[#111318]">
              {user?.fullName}
            </h4>
            <p className="text-[#616f89] text-sm">{user?.role}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group-grid">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="fullName"
                className="form-input"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                disabled
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              className="form-input"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+84 123 456 789"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bio (Optional)</label>
            <textarea
              name="bio"
              className="form-input min-h-[100px] resize-none"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us a little about yourself..."
            />
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" className="submit-btn">
              <span className="material-symbols-outlined">save</span>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
