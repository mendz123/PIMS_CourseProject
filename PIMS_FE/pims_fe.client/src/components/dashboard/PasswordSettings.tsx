import React, { useState } from "react";
import { toast } from "react-hot-toast";

const PasswordSettings: React.FC = () => {
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
    toast("Password change functionality is coming soon!");
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

export default PasswordSettings;
