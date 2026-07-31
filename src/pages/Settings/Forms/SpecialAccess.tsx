import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import "./SpecialAccess.css";
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
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  const totalRecords = sapList.length;

  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const startIndex = (currentPage - 1) * recordsPerPage;

  const endIndex = Math.min(startIndex + recordsPerPage, totalRecords);

  const paginatedSAPList = sapList.slice(
    startIndex,
    startIndex + recordsPerPage,
  );

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
      console.log("Employee Error", error);
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
      console.log("Module Error", error);
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
      console.log("Forms Error", error);
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
      console.log("SAP List Error", error);
      setSapList([]);
    } finally {
      setLoadingSAPList(false);
    }
  };

  // SAVE ACCESS FROM TABLE ACTION
  const handleSaveAccess = async (item: any) => {
    try {
      if (!selectedEmployee) {
        alert("Please select Employee");
        return;
      }

      const payload = {
        userGroup: selectedEmployee,
        menuID: String(item.mENUID),
        sMenuID: String(item.sMENUID),
        isActive: item.isActive, // current checkbox value
      };

      console.log("Save Payload", payload);

      const response = await saveSPAAccess(payload);

      console.log("Save Response", response);

      if (response?.message === "Success" && response?.rowsAffected > 0) {
        toast.success("Special access saved successfully");
        fetchSAPList();
      } else {
        throw new Error("Save failed");
      }
    } catch (error) {
      console.log("Save Access Error", error);
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

  useEffect(() => {
    if (selectedEmployee) {
      fetchSAPList();
    }
  }, [selectedEmployee]);

  useEffect(() => {
    fetchEmployees();
    fetchModules();
  }, []);

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
        <h2>Special Access</h2>
      </div>

      <div className="dbs-special-card">
        <h3>Assign Special Access</h3>

        <div className="dbs-special-filter-row">
          <div className="dbs-special-input">
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

          <div className="dbs-special-input">
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

          <div className="dbs-special-input">
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
        </div>
      </div>

      <div className="dbs-programme-form-header dbs-table-head">
        <div>
          <h2>Special Access Registry</h2>
          <p className="dbs-page-subtitle">
            Manage employee special access permissions
          </p>
        </div>
      </div>

      <div className="dbs-special-table-scroll">
        <table className="dbs-special-table">
          <thead>
            <tr>
              <th>S.No.</th>
              <th>Type</th>
              <th>Module</th>
              <th>Form(s)</th>
              <th>Active</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loadingSAPList ? (
              <tr>
                <td colSpan={6}>Loading Access...</td>
              </tr>
            ) : sapList.length === 0 ? (
              <tr>
                <td colSpan={6}>No Records Found</td>
              </tr>
            ) : (
              paginatedSAPList.map((item, index) => (
                <tr
                  key={item.iD}
                  className={
                    item.isActive === "Y"
                      ? "dbs-active-row"
                      : item.isActive === "SA"
                        ? "dbs-special-access-row"
                        : ""
                  }
                >
                  <td>{startIndex + index + 1}</td>

                  <td>{item.fORMTYPE}</td>

                  <td>{item.mODULE}</td>

                  <td>{item.mENUTEXT}</td>

                  <td>
                    <input
                      type="checkbox"
                      checked={item.isActive === "Y" || item.isActive === "SA"}
                      className="dbs-active-checkbox"
                      onChange={() => handleActiveChange(startIndex + index)}
                    />
                  </td>

                  <td>
                    <button
                      className="dbs-add-action-btn"
                      title="Add Access"
                      onClick={() => handleSaveAccess(item)}
                    >
                      Submit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
