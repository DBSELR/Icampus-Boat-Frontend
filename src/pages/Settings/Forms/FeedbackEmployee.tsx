import React, { useEffect, useState } from "react";
import "./FeedbackEmployee.css";
import { Save } from "lucide-react";
import { toast } from "sonner";
import {
  getEmployeeDetails,
  saveFeedBackReg,
} from "../../../apis/SettingsApis";

const FeedbackEmployee = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [department, setDepartment] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [feedback, setFeedback] = useState("");

  const fetchEmployeeDetails = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const empId = user?.userId;

      if (!empId) {
        toast.error("Employee id not found");
        return;
      }

      const response = await getEmployeeDetails(empId);

      console.log("Employee Details:", response);

      if (response && response.length > 0) {
        const employee = response[0];

        setEmployeeId(employee.empid || "");
        setEmployeeName(employee.empName?.trim() || "");
        setDepartment(employee.dept || "");
        setMobileNo(employee.mobileNo || "");
      }
    } catch (error) {
      console.error("Employee details error", error);

      toast.error("Failed to load employee details");
    }
  };

  useEffect(() => {
    fetchEmployeeDetails();
  }, []);

  const handleSave = async () => {
    if (!employeeId || !employeeName || !department || !mobileNo || !feedback) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const payload = {
        empid: employeeId,
        name: employeeName,
        department: department,
        mobileNo: mobileNo,
        complaint: feedback,
        userId: user?.userId || "",
        userType: "EMPLOYEE",
      };

      console.log("Feedback Save Payload:", payload);
      const response = await saveFeedBackReg(payload);
      console.log("Save Feedback Response:", response);

      if (response?.message === "Success" || response?.rowsAffected > 0) {
        toast.success("Feedback submitted successfully");
        setFeedback("");
      } else {
        toast.error(response?.message || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Save Feedback Error:", error);

      toast.error("Something went wrong");
    }
  };

  const handleCancel = () => {
    setFeedback("");
  };

  return (
    <div className="dbs-feedback-container">
      <div className="dbs-feedback-header">
        <div>
          <h2>Employee Feedback</h2>

          <p>Submit employee feedback details and comments</p>
        </div>
      </div>

      <div className="dbs-feedback-card">
        <h3>Employee Information</h3>

        <div className="dbs-feedback-grid">
          <div className="dbs-feedback-input">
            <label>Employee Id</label>

            <input value={employeeId} disabled />
          </div>

          <div className="dbs-feedback-input">
            <label>Employee Name</label>

            <input value={employeeName} disabled />
          </div>

          <div className="dbs-feedback-input">
            <label>Department</label>

            <input value={department} disabled />
          </div>

          <div className="dbs-feedback-input">
            <label>Mobile No</label>

            <input value={mobileNo} disabled />
          </div>

          <div className="dbs-feedback-input dbs-feedback-full">
            <label>Feedback</label>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter your feedback..."
            />
          </div>
        </div>

        <div className="dbs-feedback-actions">
          <button className="dbs-feedback-cancel" onClick={handleCancel}>
            Cancel
          </button>

          <button className="dbs-feedback-save" onClick={handleSave}>
            <Save size={16} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackEmployee;
