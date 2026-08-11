import React, { useEffect, useState } from "react";
import "./UserGroup.css";
import { AlertCircle, Save, X } from "lucide-react";
import {
  fetchDept,
  fetchUsergroup,
  fetchUserGroupEmpList,
  updateUserGroups,
} from "../../../apis/SettingsApis";
import axios from "axios";
import Footer from "../../../common/Footer";
import { toast } from "sonner";

const UserGroup = () => {
  interface Department {
    departmentCode: string;
    description: string;
  }

  interface UserGroup {
    userGroup: string;
  }

  interface EmpList {
    eMPID: string;
    eMPNAME: string;
    uSERGROUP: string;
  }

  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState("");
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [selectedUserGroup, setSelectedUserGroup] = useState("");
  const [loadingUserGroups, setLoadingUserGroups] = useState(false);
  const [empList, setEmpList] = useState<EmpList[]>([]);
  const [loadingEmpList, setLoadingEmpList] = useState(false);
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const totalRecords = empList.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentData = empList.slice(startIndex, endIndex);

  ///// Footer Index Starts /////
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
  ///// Footer Index Ends /////

  const fetchDepartment = async () => {
    try {
      setLoadingDepartments(true);
      const data = await fetchDept();
      setDepartments(data || []);
      setLoadingDepartments(false);
    } catch (error) {
      console.error("Unable to load Departments", error);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const fetchUserGroup = async () => {
    try {
      setLoadingUserGroups(true);
      const data = await fetchUsergroup();
      setUserGroups(data || []);
      setLoadingUserGroups(false);
    } catch (error) {
      console.error("Unable to load User Groups", error);
    } finally {
      setLoadingUserGroups(false);
    }
  };

  const fetchEmpData = async () => {
    try {
      setLoadingEmpList(true);
      const response = await fetchUserGroupEmpList(selectedDepartments);
      setEmpList(response);
    } catch (error) {
      console.error("Unable to Load Data...", error);
    } finally {
      setLoadingEmpList(false);
    }
  };

  const onCancel = () => {
    // Reset dropdowns
    setSelectedDepartments("");
    setSelectedUserGroup("");
    // Clear selected checkboxes
    setSelectedEmpIds([]);
    // Clear employee list (optional)
    setEmpList([]);
    // Reset pagination
    setCurrentPage(1);
    fetchEmpData();
  };

  const handleCheckboxChange = (empId: string, checked: boolean) => {
    setSelectedEmpIds((prev) => {
      const updated = checked
        ? prev.includes(empId)
          ? prev
          : [...prev, empId]
        : prev.filter((id) => id !== empId);

      return updated;
    });
  };

  const handleSave = async () => {
    if (!selectedUserGroup) {
      toast.error("Please select User Group");
      return;
    }
    if (selectedEmpIds.length === 0) {
      toast.error("Please select at least one employee");

      return;
    }
    try {
      await Promise.all(
        selectedEmpIds.map((empId) =>
          updateUserGroups(selectedUserGroup, empId),
        ),
      );
      toast.success("Employees updated successfully.");
      onCancel();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update employees.");
    }
  };

  useEffect(() => {
    fetchDepartment();
    fetchUserGroup();
  }, []);

  useEffect(() => {
    fetchEmpData();
  }, [selectedDepartments]);

  return (
    <div className="dbs-usergroup-container">
      {/* Header */}
      <div className="dbs-usergroup-header">
        <h2>User Group</h2>
        <p>Manage user group assignments and employee mapping</p>
      </div>
      {/* Form Card */}
      <div className="dbs-usergroup-form-card">
        <h3>Section Information</h3>

        <div className="dbs-usergroup-form-grid">
          <div className="dbs-usergroup-field">
            <label>Department</label>

            <select
              value={selectedDepartments}
              onChange={(e) => setSelectedDepartments(e.target.value)}
            >
              <option value="">
                {loadingDepartments ? "Loading..." : "Select Department"}
              </option>

              {departments.map((dept) => (
                <option key={dept.departmentCode} value={dept.departmentCode}>
                  {dept.description}
                </option>
              ))}
            </select>
          </div>

          <div className="dbs-usergroup-field">
            <label>User group</label>

            <select
              value={selectedUserGroup}
              onChange={(e) => setSelectedUserGroup(e.target.value)}
            >
              <option value="">
                {loadingUserGroups ? "Loading..." : "Select User Group"}
              </option>

              {userGroups.map((ug) => (
                <option key={ug.userGroup} value={ug.userGroup}>
                  {ug.userGroup}
                </option>
              ))}
            </select>
          </div>

          <div className="dbs-usergroup-action-field">
            <label></label>

            <div className="dbs-usergroup-actions">
              <button
                type="button"
                className="dbs-usergroup-reset-btn"
                onClick={onCancel}
              >
                <X size={16} />
                Cancel
              </button>

              <button
                type="submit"
                className="dbs-usergroup-save-btn"
                onClick={handleSave}
              >
                <Save size={16} />
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Table Header */}
      <div className="dbs-user-group-header">
        <div>
          <h2>Teaching Learning Methods Registry</h2>
          <p>Manage teaching and learning method records</p>
        </div>
      </div>
      {/* Table */}
      <div className="dbs-usergroup-table-container">
        {empList.length === 0 ? (
          <div className="dbs-empty-state">
            <AlertCircle className="dbs-empty-state-icon" />

            <div className="dbs-empty-state-title">No records found</div>

            <div className="dbs-empty-state-desc">
              No employee records are available for the selected department.
            </div>
          </div>
        ) : (
          <div className="dbs-usergroup-table-card">
            <div
              className={
                empList.length > 5
                  ? "dbs-usergroup-table-scroll active-scroll"
                  : "dbs-usergroup-table-scroll"
              }
            >
              <table className="dbs-usergroup-table">
                <thead>
                  <tr>
                    <th>SL.NO</th>
                    <th>Emp ID</th>
                    <th>Employee Name</th>
                    <th>Group</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {currentData.map((Emplist, index) => (
                    <tr key={Emplist.eMPID}>
                      <td>{startIndex + index + 1}</td>

                      <td>{Emplist.eMPID}</td>

                      <td>{Emplist.eMPNAME}</td>

                      <td>{Emplist.uSERGROUP}</td>

                      <td>
                        <input
                          type="checkbox"
                          checked={selectedEmpIds.includes(Emplist.eMPID)}
                          onChange={(e) =>
                            handleCheckboxChange(
                              Emplist.eMPID,
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
          </div>
        )}
      </div>
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

export default UserGroup;
