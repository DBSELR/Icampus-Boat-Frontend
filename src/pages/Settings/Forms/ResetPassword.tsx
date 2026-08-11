import React, { useState } from "react";
import "./ResetPassword.css";
import { Eye, EyeOff, LockKeyhole, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { getUserName, resetPassword } from "../../../apis/SettingsApis";

const ResetPassword = () => {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleGetUserName = async () => {
    if (!userId) {
      setUserName("");
      return;
    }
    try {
      const response = await getUserName(userId);
      setUserName(response[0]?.userName || "");
    } catch (error) {
      console.error("Get User Name Error:", error);
      setUserName("");
      toast.error("User not found");
    }
  };

  const handleReset = async () => {
    if (!userId || !userName || !password) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      const response = await resetPassword(userId, password);

      if (response?.message === "Success" && response?.rowsAffected > 0) {
        toast.success("Password reset successfully");
        handleCancel();
      } else {
        toast.error("Password reset failed");
      }
    } catch (error) {
      console.error("Reset Password Error:", error);
      toast.error("Password reset failed");
    }
  };

  const handleCancel = () => {
    setUserId("");
    setUserName("");
    setPassword("");
  };

  return (
    <div className="dbs-programme-container">
      {/* Header */}
      <div className="dbs-programme-form-header">
        <div>
          <h2>Reset Password</h2>
          <p className="dbs-page-subtitle">Update user password securely</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="dbs-form-card">
        <h3>Password Reset Information</h3>
        <div className="dbs-form-grid-2">
          <div className="dbs-input-box">
            <label>User ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              onBlur={handleGetUserName}
              placeholder="Enter user id"
            />
          </div>

          <div className="dbs-input-box">
            <label>User Name</label>

            <input
              type="text"
              value={userName}
              readOnly
              placeholder="User name"
            />
          </div>

          <div className="dbs-input-box dbs-reset-password-field">
            <label>Reset Password</label>
            <div className="dbs-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
              />

              <button
                type="button"
                className="dbs-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className="dbs-footer-actions">
          <button className="dbs-btn-secondary" onClick={handleCancel}>
            <X size={16} />
            Cancel
          </button>

          <button className="dbs-btn-primary" onClick={handleReset}>
            <RotateCcw size={16} />
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
