import React, { useEffect, useState } from "react";
import "./EMPDEPWISE.css";
import {
  getDeptWiseDetails,
  getLoadEmpDept,
  updateLoginStatus,
} from "../../../apis/SettingsApis";
import { toast } from "sonner";
import Footer from "../../../common/Footer";
import { AlertCircle } from "lucide-react";

const EMPDEPWISE = () => {
  const [departmentList, setDepartmentList] = useState<any[]>([]);
  const [department, setDepartment] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [status, setStatus] = useState("");
  const [employeeList, setEmployeeList] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);

  const fetchDepartment = async () => {
    try {
      const response = await getLoadEmpDept();
      setDepartmentList(response || []);
    } catch (error) {
      console.error("Department Error:", error);
      setDepartmentList([]);
    }
  };

  const fetchEmployeeDetails = async () => {
    try {
      const payload = {
        dept: department,
        workMode: workMode,
        active: status || "-1",
      };
      const response = await getDeptWiseDetails(payload);
      setEmployeeList(response || []);
    } catch (error) {
      console.error("Employee Details Error:", error);
      setEmployeeList([]);
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
    setEmployeeList(updatedList);

    const payload = {
      empID: updatedList[index].empID,
      flag: updatedList[index].flag,
      otp: updatedList[index].otp,
    };

    try {
      const response = await updateLoginStatus(payload);

      if (response.message === "Success") {
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
    setCurrentPage(1);
    fetchEmployeeDetails();
  }, [department, workMode, status]);

  // ================= Pagination =================
  const totalRecords = employeeList.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentData = employeeList.slice(startIndex, endIndex);

  const getPagination = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push("...");
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="dbs-empdepwise-container">
      {/* ================= Page Header ================= */}
      <div className="dbs-empdepwise-header">
        <div>
          <h2>Employee Department Wise</h2>
          <p className="dbs-page-subtitle">
            Manage employee access configuration based on department, work mode
            and status
          </p>
        </div>
      </div>

      {/* ================= Filter ================= */}
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

      {/* ================= Table Header ================= */}

      <div className="dbs-empdepwise-header dbs-table-head">
        <div>
          <h2>Employee Registry</h2>
          <p className="dbs-page-subtitle">
            View and manage employee login and OTP access permissions
          </p>
        </div>
      </div>

      {/* ================= Table ================= */}

      <div className="dbs-empdepwise-table-card">
        {employeeList.length === 0 ? (
          <div className="dbs-empty-state">
            <AlertCircle className="dbs-empty-state-icon" />
            <div className="dbs-empty-state-title">No records found</div>
            <div className="dbs-empty-state-desc">
              No employee records are available for the selected filters.
            </div>
          </div>
        ) : (
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
                {currentData.map((item: any, index: number) => (
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
                            startIndex + index,
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
                            startIndex + index,
                            "otp",
                            e.target.checked,
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= Footer ================= */}

      <Footer
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        recordsPerPage={recordsPerPage}
        setRecordsPerPage={setRecordsPerPage}
        totalRecords={totalRecords}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        getPagination={getPagination}
      />
    </div>
  );
};

export default EMPDEPWISE;
