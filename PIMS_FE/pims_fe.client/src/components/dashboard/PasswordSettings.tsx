import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import type { UserInfo } from "../../types";
import userService from "../../services/userService";

type FieldErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

const PasswordSettings: React.FC<{ user: UserInfo | null }> = ({ user }) => {
  const { refreshProfile } = useAuth();
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FieldErrors = {};

    if (!user?.isLoginGoogle && !passwords.currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required";
    }
    if (!passwords.newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (passwords.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }
    if (!passwords.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = "New password and confirm password do not match";
    }
    if (
      !user?.isLoginGoogle &&
      passwords.currentPassword &&
      passwords.currentPassword === passwords.newPassword
    ) {
      newErrors.newPassword = "New password must be different from current password";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    try {
      const response = await userService.changePassword(passwords);
      toast.success(response.message);
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      await refreshProfile();
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data &&
        typeof (err.response.data as { message?: unknown }).message === "string"
          ? (err.response.data as { message: string }).message
          : "Failed to change password";
      toast.error(message);
    }
  };

  return (
    <div className="password-section">
      <div className="password-section-header">
        <h4>Change Password</h4>
        <p>Update your password to keep your account secure.</p>
      </div>

      <form onSubmit={handleSubmit} className="password-form">
        {!user?.isLoginGoogle && (
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <div className="password-input-wrap">
              <input
                type={showCurrentPassword ? "text" : "password"}
                name="currentPassword"
                className={`form-input ${errors.currentPassword ? "form-input-error" : ""}`}
                value={passwords.currentPassword}
                onChange={handleChange}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                tabIndex={-1}
                aria-label={showCurrentPassword ? "Hide password" : "Show password"}
              >
                <span className="material-symbols-outlined">
                  {showCurrentPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {errors.currentPassword && (
              <p className="form-error">{errors.currentPassword}</p>
            )}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">New Password</label>
          <div className="password-input-wrap">
            <input
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              className={`form-input ${errors.newPassword ? "form-input-error" : ""}`}
              value={passwords.newPassword}
              onChange={handleChange}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowNewPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showNewPassword ? "Hide password" : "Show password"}
            >
              <span className="material-symbols-outlined">
                {showNewPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
          {errors.newPassword && (
            <p className="form-error">{errors.newPassword}</p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Confirm New Password</label>
          <div className="password-input-wrap">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              className={`form-input ${errors.confirmPassword ? "form-input-error" : ""}`}
              value={passwords.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              <span className="material-symbols-outlined">
                {showConfirmPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="form-error">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="submit-btn w-full sm:w-auto justify-center"
            disabled={
              (!user?.isLoginGoogle && !passwords.currentPassword.trim()) ||
              !passwords.newPassword.trim() ||
              !passwords.confirmPassword.trim()
            }
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
