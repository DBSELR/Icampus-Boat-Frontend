import React, { useState } from "react";
import "./ResetPassword.css";
import { Eye, EyeOff, LockKeyhole, RotateCcw } from "lucide-react";
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
      console.log("Reset Password Response:", response);

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
    <div className="dbs-reset-container">
      <div className="dbs-reset-header">
        <div>
          <h2>Reset Password</h2>
          <p>Update user password securely</p>
        </div>
      </div>

      <div className="dbs-reset-card">
        <div className="dbs-reset-title">
          <LockKeyhole size={22} />
          <h3>Password Reset Information</h3>
        </div>

        <div className="dbs-reset-grid">
          <div className="dbs-reset-input">
            <label>User ID</label>

            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              onBlur={handleGetUserName}
              placeholder="Enter user id"
            />
          </div>

          <div className="dbs-reset-input">
            <label>User Name</label>

            <input
              type="text"
              value={userName}
              readOnly
              placeholder="User name"
            />
          </div>

          <div className="dbs-reset-input dbs-reset-full">
            <label>Reset Password</label>

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className="dbs-reset-actions">
          <button className="dbs-reset-cancel" onClick={handleCancel}>
            Cancel
          </button>

          <button className="dbs-reset-save" onClick={handleReset}>
            <RotateCcw size={16} />
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
