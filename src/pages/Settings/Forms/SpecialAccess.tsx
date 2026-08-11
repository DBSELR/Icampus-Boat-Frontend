import React, { useEffect, useState } from "react";
import "./SpecialAccess.css";
import { AlertCircle, RotateCcw } from "lucide-react";
import {
  getEmployess,
  getERPForms,
  getERPModulesList,
  getSPAList,
  saveSPAAccess,
} from "../../../apis/SettingsApis";
import { toast } from "sonner";
import Footer from "../../../common/Footer";

const SpecialAccess = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedForm, setSelectedForm] = useState("");
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);
  const [loadingForms, setLoadingForms] = useState(false);
  const [sapList, setSapList] = useState<any[]>([]);
  const [loadingSAPList, setLoadingSAPList] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const totalRecords = sapList.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = Math.min(startIndex + recordsPerPage, totalRecords);
  const currentData = sapList.slice(startIndex, startIndex + recordsPerPage);

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

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await getEmployess();
      setEmployees(response || []);
    } catch (error) {
      console.error("Employee Error", error);
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchModules = async () => {
    try {
      setLoadingModules(true);
      const response = await getERPModulesList();
      setModules(response || []);
    } catch (error) {
      console.error("Module Error", error);
      setModules([]);
    } finally {
      setLoadingModules(false);
    }
  };

  const fetchForms = async (moduleId: string) => {
    try {
      setLoadingForms(true);
      const response = await getERPForms({
        menuID: moduleId,
      });
      setForms(response || []);
    } catch (error) {
      console.error("Forms Error", error);
      setForms([]);
    } finally {
      setLoadingForms(false);
    }
  };

  const fetchSAPList = async () => {
    try {
      if (!selectedEmployee) {
        setSapList([]);
        return;
      }
      setLoadingSAPList(true);
      const response = await getSPAList({
        userGroup: selectedEmployee,
      });
      setSapList(response || []);
      setCurrentPage(1);
    } catch (error) {
      console.error("SAP List Error", error);
      setSapList([]);
    } finally {
      setLoadingSAPList(false);
    }
  };

  const handleSaveAccess = async (item: any) => {
    try {
      if (!selectedEmployee) {
        toast.error("Please select Employee");
        return;
      }

      const payload = {
        userGroup: selectedEmployee,
        menuID: String(item.mENUID),
        sMenuID: String(item.sMENUID),
        isActive: item.isActive,
      };
      const response = await saveSPAAccess(payload);
      if (response?.message === "Success" && response?.rowsAffected > 0) {
        toast.success("Special access saved successfully");
        await fetchSAPList();
      } else {
        throw new Error("Save failed");
      }
    } catch (error) {
      console.error("Save Access Error", error);
      toast.error("Failed to save special access");
    }
  };

  const handleActiveChange = (index: number) => {
    setSapList((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              isActive:
                item.isActive === "Y" || item.isActive === "SA" ? "N" : "Y",
            }
          : item,
      ),
    );
  };

  const handleClear = () => {
    setSelectedEmployee("");
    setSelectedModule("");
    setSelectedForm("");

    setForms([]);
    setSapList([]);

    setCurrentPage(1);
  };

  useEffect(() => {
    fetchEmployees();
    fetchModules();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchSAPList();
    } else {
      setSapList([]);
    }
  }, [selectedEmployee]);

  useEffect(() => {
    if (selectedModule) {
      fetchForms(selectedModule);
    } else {
      setForms([]);
      setSelectedForm("");
    }
  }, [selectedModule]);

  return (
    <div className="dbs-special-container">
      <div className="dbs-special-header">
        <div>
          <h2>Special Access Registry</h2>
          <p>Manage employee special access permissions</p>
        </div>
      </div>

      <div className="dbs-special-form-card">
        <h3>Access Information</h3>
        <div className="dbs-special-form-grid">
          {/* EMPLOYEE */}
          <div className="dbs-special-field">
            <label>Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">
                {loadingEmployees ? "Loading Employees..." : "Select Employee"}
              </option>
              {employees.map((emp: any) => (
                <option key={emp.eMPID} value={emp.empId || emp.eMPID}>
                  {emp.nAME || emp.name}
                </option>
              ))}
            </select>
          </div>

          {/* MODULE */}
          <div className="dbs-special-field">
            <label>ERP Module</label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
            >
              <option value="">
                {loadingModules ? "Loading Modules..." : "Select ERP Module"}
              </option>
              {modules.map((item: any) => (
                <option key={item.mENUID} value={item.mENUID}>
                  {item.text}
                </option>
              ))}
            </select>
          </div>

          {/* FORM */}
          <div className="dbs-special-field">
            <label>Form</label>
            <select
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
            >
              <option value="">
                {loadingForms ? "Loading Forms..." : "Select Form"}
              </option>
              {forms.map((item: any) => (
                <option key={item.sMENUID} value={item.sMENUID}>
                  {item.mENUTEXT}
                </option>
              ))}
            </select>
          </div>

          {/* CLEAR BUTTON */}
          <div className="dbs-special-action-field">
            <label></label>
            <div className="dbs-special-actions">
              <button
                type="button"
                className="dbs-special-reset-btn"
                onClick={handleClear}
              >
                <RotateCcw size={16} />
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="dbs-special-table-header">
        <div>
          <h2>Special Access Records</h2>
          <p>Configure and manage employee special access permissions</p>
        </div>
      </div>

      <div className="dbs-special-table-container">
        {loadingSAPList ? (
          <div className="dbs-empty-state">
            <div className="dbs-empty-state-title">
              Loading access records...
            </div>

            <div className="dbs-empty-state-desc">
              Please wait while the special access records are being loaded.
            </div>
          </div>
        ) : sapList.length === 0 ? (
          <div className="dbs-empty-state">
            <AlertCircle className="dbs-empty-state-icon" />

            <div className="dbs-empty-state-title">No records found</div>

            <div className="dbs-empty-state-desc">
              Select an employee to view and manage special access permissions.
            </div>
          </div>
        ) : (
          <div className="dbs-special-table-card">
            <div
              className={
                sapList.length > 5
                  ? "dbs-special-table-scroll active-scroll"
                  : "dbs-special-table-scroll"
              }
            >
              <table className="dbs-special-table">
                <thead>
                  <tr>
                    <th>SL.NO</th>
                    <th>Type</th>
                    <th>Module</th>
                    <th>Form(s)</th>
                    <th>Active</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentData.map((item: any, index: number) => (
                    <tr
                      key={item.iD || `${item.mENUID}-${item.sMENUID}`}
                      className={
                        item.isActive === "Y"
                          ? "dbs-active-row"
                          : item.isActive === "SA"
                            ? "dbs-special-access-row"
                            : ""
                      }
                    >
                      <td>{startIndex + index + 1}</td>
                      <td>{item.fORMTYPE || "-"}</td>
                      <td>{item.mODULE || "-"}</td>
                      <td>{item.mENUTEXT || "-"}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={
                            item.isActive === "Y" || item.isActive === "SA"
                          }
                          className="dbs-special-checkbox"
                          onChange={() =>
                            handleActiveChange(startIndex + index)
                          }
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="dbs-special-submit-btn"
                          onClick={() => handleSaveAccess(item)}
                        >
                          Submit
                        </button>
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

export default SpecialAccess;
