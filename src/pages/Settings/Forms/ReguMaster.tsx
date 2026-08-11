import React, { useEffect, useState } from "react";
import {
  Save,
  Trash2,
  Edit3,
  AlertTriangle,
  HelpCircle,
  AlertCircle,
  SquarePen,
  X,
} from "lucide-react";
import { toast } from "sonner";
import "./ReguMaster.css";
import { fetchRegulation, saveRegu } from "../../../apis/SettingsApis";
import Footer from "../../../common/Footer";

const ReguMaster = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const sortedStudents = []; // Placeholder for sorted students data
  const ACYR = localStorage.getItem("academicYear");
  const userData = localStorage.getItem("user");

  let userId = "";

  if (userData) {
    const user = JSON.parse(userData);
    userId = user.userId;
  }

  interface reguLoad {
    rid: string;
    regulation: string;
    academicYear: string;
    userid: string;
  }

  interface reguSave {
    Regu: string;
  }

  const [reguInputs, setReguInputs] = useState<reguSave>({
    Regu: "",
  });

  const [reguLoad, setReguLoad] = useState<reguLoad[]>([]);
  const [reguLoading, setReguLoading] = useState(false);

  const fetchRegu = async () => {
    try {
      setReguLoading(true);
      const response = await fetchRegulation();
      setReguLoad(response || []);
      setCurrentPage(1);
    } catch (error) {
      toast.error("Fetching Regu Master Failed...!");
    } finally {
      setReguLoading(false);
    }
  };

  const oncancel = () => {
    setReguInputs({ Regu: "" });
    fetchRegu();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setReguInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const Handlesave = async () => {
    if (!reguInputs.Regu.trim()) {
      toast.error("Please enter Regulation");
      return;
    }

    try {
      const payload = {
        Regu: reguInputs.Regu.trim(),
        AcademicYear: ACYR,
        Userid: userId,
      };

      const response = await saveRegu(payload);

      if (response?.rowsAffected > 0) {
        toast.success("Regulation saved successfully!");
        oncancel();
      } else {
        toast.error("Failed to save Regulation!");
      }
    } catch (error) {
      toast.error("Failed to save Regulation");
    }
  };

  useEffect(() => {
    fetchRegu();
  }, []);

  const totalRecords = reguLoad.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentData = reguLoad.slice(startIndex, endIndex);

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
    <div className="dbs-regu-container">
      {/* Header */}
      <div className="dbs-regu-form-header">
        <div>
          <h2>Regulation Master</h2>
          <p className="dbs-page-subtitle">Manage regulation master records</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="dbs-form-card">
        <h3>Regulation Information</h3>
        <div className="dbs-form-grid-4">
          <div className="dbs-input-box">
            <label>Regulation</label>
            <input
              type="text"
              placeholder="Enter Regulation"
              name="Regu"
              value={reguInputs.Regu}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Form Buttons */}
        <div className="dbs-form-actions-row">
          <button
            type="button"
            className="dbs-form-cancel-btn"
            onClick={oncancel}
          >
            <X size={16} />
            Cancel
          </button>
          <button
            type="submit"
            className="dbs-form-save-btn"
            onClick={Handlesave}
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="dbs-table-head">
        <div>
          <h2>Regulation Registry</h2>
          <p className="dbs-page-subtitle">Manage regulation master records</p>
        </div>

        {/* <span className="dbs-total-badge">Total : {totalRecords}</span> */}
      </div>

      {/* Table */}
      <div className="dbs-table-container">
        {reguLoad.length === 0 ? (
          <div className="dbs-empty-state">
            <AlertCircle className="dbs-empty-state-icon" />
            <div className="dbs-empty-state-title">No records found</div>
            <div className="dbs-empty-state-desc">
              Add a new regulation to view records here.
            </div>
          </div>
        ) : (
          <div className="dbs-table-card">
            <div className="dbs-table-scroll active-scroll">
              <table className="dbs-data-table">
                <thead>
                  <tr>
                    <th>SL.NO</th>
                    <th>Regulation</th>
                    <th>Academic Year</th>
                  </tr>
                </thead>

                <tbody>
                  {currentData.map((reg, index) => (
                    <tr key={reg.rid}>
                      <td>{startIndex + index + 1}</td>
                      <td>{reg.regulation}</td>
                      <td>{reg.academicYear}</td>
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

export default ReguMaster;
