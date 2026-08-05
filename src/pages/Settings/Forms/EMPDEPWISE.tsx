import React, { useEffect, useState } from "react";

import "./EMPDEPWISE.css";
import {
  getDeptWiseDetails,
  getLoadEmpDept,
  updateLoginStatus,
} from "../../../apis/SettingsApis";
import { toast } from "sonner";

const EMPDEPWISE = () => {
  const [departmentList, setDepartmentList] = useState<any[]>([]);

  const [department, setDepartment] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [status, setStatus] = useState("");

  const [employeeList, setEmployeeList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDepartment = async () => {
    try {
      const response = await getLoadEmpDept();
      // console.log("Department Response:", response);
      setDepartmentList(response || []);
    } catch (error) {
      console.log("Department Error:", error);

      setDepartmentList([]);
    }
  };

  const fetchEmployeeDetails = async () => {
    try {
      setLoading(true);

      const payload = {
        dept: department,
        workMode: workMode,
        active: status || "-1", // Default to "-1" if status is empty
      };

      // console.log("Filter Payload:", payload);
      const response = await getDeptWiseDetails(payload);
      console.log("Employee Details:", response);
      setEmployeeList(response || []);
    } catch (error) {
      console.log("Employee Details Error:", error);

      setEmployeeList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginStatusChange = async (
    index: number,
    type: "flag" | "otp",
    checked: boolean,
  ) => {
    const previousList = [...employeeList];

    const updatedList = [...employeeList];
    updatedList[index] = {
      ...updatedList[index],
      [type]: checked ? "Y" : "N",
    };

    // Optimistic UI update
    setEmployeeList(updatedList);

    const payload = {
      empID: updatedList[index].empID,
      flag: updatedList[index].flag,
      otp: updatedList[index].otp,
    };

    try {
      console.log("Payload:", payload);
      const response = await updateLoginStatus(payload);
      console.log(response);

      if (response.message === "Success") {
        console.log(
          `Updated successfully. Rows affected: ${response.rowsAffected}`,
        );
        toast.success("Status Updated successfully");
      } else {
        setEmployeeList(previousList);
        toast.error(response.message);
      }
    } catch (error) {
      setEmployeeList(previousList);
      console.error("Login Status Error:", error);
      toast.error("Failed to update.");
    }
  };

  useEffect(() => {
    fetchDepartment();
  }, []);

  useEffect(() => {
    fetchEmployeeDetails();
  }, [department, workMode, status]);

  return (
    <div className="dbs-empdepwise-container">
      <div className="dbs-empdepwise-header">
        <h2>Employee Department Wise</h2>
      </div>

      <div className="dbs-empdepwise-filter-card">
        <h3>Employee Configuration</h3>

        <div className="dbs-empdepwise-form-grid">
          <div className="dbs-empdepwise-input-box">
            <label>Department</label>

            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">Select Department</option>
              {departmentList.map((item: any, index: number) => (
                <option key={index} value={item.dEPARTMENTCODE}>
                  {item.dEPARTMENT}
                </option>
              ))}
            </select>
          </div>

          <div className="dbs-empdepwise-input-box">
            <label>Work Mode</label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
            >
              <option value="">Select Work Mode</option>
              <option value="TEACHING">TEACHING</option>
              <option value="NON-TEACHING">NON-TEACHING</option>
              <option value="OTHERS">OTHERS</option>
            </select>
          </div>

          <div className="dbs-empdepwise-input-box">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="-1">Select Status</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="dbs-empdepwise-table-card">
        <div className="dbs-empdepwise-table-header">
          <h3>Employee List</h3>
          <span>Total Records : {employeeList.length}</span>
        </div>

        <div className="dbs-empdepwise-table-scroll">
          <table className="dbs-empdepwise-data-table">
            <thead>
              <tr>
                <th>EMPID</th>
                <th>EMPLOYEENAME</th>
                <th>WORKMODE</th>
                <th>Login</th>
                <th>OTP</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} align="center">
                    Loading...
                  </td>
                </tr>
              ) : employeeList.length === 0 ? (
                <tr>
                  <td colSpan={5} align="center">
                    No Records Found
                  </td>
                </tr>
              ) : (
                employeeList.map((item: any, index: number) => (
                  <tr key={index}>
                    <td>{item.empID}</td>
                    <td>{item.employeeName}</td>
                    <td>{item.workmode}</td>

                    <td>
                      <input
                        type="checkbox"
                        checked={item.flag === "Y"}
                        onChange={(e) =>
                          handleLoginStatusChange(
                            index,
                            "flag",
                            e.target.checked,
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="checkbox"
                        checked={item.otp === "Y"}
                        onChange={(e) =>
                          handleLoginStatusChange(
                            index,
                            "otp",
                            e.target.checked,
                          )
                        }
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EMPDEPWISE;
