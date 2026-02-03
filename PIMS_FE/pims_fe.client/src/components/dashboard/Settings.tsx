import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Settings.css";
import ProfileSettings from "./ProfileSettings";
import PasswordSettings from "./PasswordSettings";

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
          <ProfileSettings user={user} />
        ) : (
          <PasswordSettings />
        )}
      </div>
    </div>
  );
};

export default Settings;
