import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Settings.css";

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<"profile" | "password">(
    "profile",
  );

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div className="settings-tabs">
          <button
            className={`settings-tab-btn ${activeSubTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveSubTab("profile")}
          >
            Profile Information
          </button>
          <button
            className={`settings-tab-btn ${activeSubTab === "password" ? "active" : ""}`}
            onClick={() => setActiveSubTab("password")}
          >
            Change Password
          </button>
        </div>
      </div>

      <div className="settings-content">
        {activeSubTab === "profile" ? (
          <ProfileSection user={user} />
        ) : (
          <ChangePasswordSection />
        )}
      </div>
    </div>
  );
};

const ProfileSection: React.FC<{ user: any }> = ({ user }) => {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    role: user?.roleName || "User",
    phoneNumber: "", // Placeholder as I don't see it in user object yet
    bio: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving profile:", formData);
    // Implementation for update profile will go here
  };

  return (
    <div className="profile-section">
      <div className="profile-grid">
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-large">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <button className="avatar-edit-btn">
              <span className="material-symbols-outlined text-[20px]">
                photo_camera
              </span>
            </button>
          </div>
          <div className="text-center lg:text-left">
            <h4 className="text-lg font-bold text-[#111318]">
              {user?.fullName}
            </h4>
            <p className="text-[#616f89] text-sm">{user?.roleName}</p>
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

const ChangePasswordSection: React.FC = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Changing password:", passwords);
    // Implementation for change password will go here
  };

  return (
    <div className="password-section">
      <div className="password-section-header">
        <h4>Change Password</h4>
        <p>Update your password to keep your account secure.</p>
      </div>

      <form onSubmit={handleSubmit} className="password-form">
        <div className="form-group">
          <label className="form-label">Current Password</label>
          <input
            type="password"
            name="currentPassword"
            className="form-input"
            value={passwords.currentPassword}
            onChange={handleChange}
            placeholder="••••••••"
          />
        </div>

        <div className="form-group">
          <label className="form-label">New Password</label>
          <input
            type="password"
            name="newPassword"
            className="form-input"
            value={passwords.newPassword}
            onChange={handleChange}
            placeholder="••••••••"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            className="form-input"
            value={passwords.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="submit-btn w-full sm:w-auto justify-center"
          >
            <span className="material-symbols-outlined">key</span>
            Update Password
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
