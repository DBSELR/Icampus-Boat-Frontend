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
import "./ProgrammeMaster.css";
import axios from "axios";
import { API_BASE } from "../../../config";
import Footer from "../../../common/Footer";

const ProgrammeMaster = () => {
  const ACYR = localStorage.getItem("academicYear");

  interface Payload {
    CID: string;
    COURSECODE: string;
    COURSE: string;
    DEGREE: string;
    YEAR: string;
    ACADEMICYEAR: string;
    FINANCIALYEAR: string;
  }

  const [progData, setProgData] = useState<Payload[]>([]);
  const [payLoad, setPayLoad] = useState({
    CID: "",
    COURSECODE: "",
    COURSE: "",
    DEGREE: "",
    YEAR: "",
    ACADEMICYEAR: "",
    FINANCIALYEAR: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);

  const data = {
    CID: payLoad.CID,
    COURSECODE: payLoad.COURSECODE,
    COURSE: payLoad.COURSE,
    DEGREE: payLoad.DEGREE,
    YEAR: payLoad.YEAR,
    ACADEMICYEAR: ACYR,
    FINANCIALYEAR: payLoad.FINANCIALYEAR,
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setPayLoad((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onCancel = () => {
    setPayLoad({
      CID: "",
      COURSECODE: "",
      COURSE: "",
      DEGREE: "",
      YEAR: "",
      ACADEMICYEAR: "",
      FINANCIALYEAR: "",
    });
  };

  const validation = () => {
    if (data.COURSECODE === "") {
      toast.warning("Enter Course code");
      return;
    }

    if (data.COURSE === "") {
      toast.warning("Enter Course");
      return;
    }

    if (data.DEGREE === "") {
      toast.warning("Enter Degree");
      return;
    }

    if (data.YEAR === "") {
      toast.warning("Enter Year");
      return;
    }

    return true;
  };

  const fetchProgrammeMaster = async () => {
    try {
      const resData = await axios.post(
        `${API_BASE}ProgrammeMaster/GetProgrammeMaster`,
        data,
      );
      setProgData(Array.isArray(resData.data) ? resData.data : []);
      // Move to first page after fetching
      setCurrentPage(1);
    } catch (error) {
      console.error("Programme Master Fetch Error:", error);
      toast.error("Failed to fetch Programme Data");
      setProgData([]);
      setCurrentPage(1);
    }
  };

  const onHandleSave = async () => {
    try {
      if (!validation()) return;
      await axios.post(`${API_BASE}ProgrammeMaster/SaveProgrammeMaster`, data);
      if (payLoad.CID) {
        toast.success("Programme Data Updated Successfully");
      } else {
        toast.success("Programme Data Saved Successfully");
      }
      onCancel();

      await fetchProgrammeMaster();
    } catch (error) {
      console.error("Save Programme Error:", error);
      toast.error("Failed to save Programme Data");
    }
  };

  const onHandleEdit = (pro: Payload) => {
    setPayLoad({
      CID: pro.CID.toString(),
      COURSECODE: pro.COURSECODE,
      COURSE: pro.COURSE,
      DEGREE: pro.DEGREE,
      YEAR: pro.YEAR.toString(),
      ACADEMICYEAR: pro.ACADEMICYEAR,
      FINANCIALYEAR: pro.FINANCIALYEAR,
    });
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchProgrammeMaster();
  }, []);

  const totalRecords = progData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = Math.min(startIndex + recordsPerPage, totalRecords);
  const currentData = progData.slice(startIndex, endIndex);

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
    <div className="dbs-programme-container">
      <div className="dbs-programme-header">
        <h2>Programme Master</h2>
        <p>Manage and maintain programme master information.</p>
      </div>

      <div className="dbs-programme-form-card">
        <h3>Programme Information</h3>
        <div className="dbs-programme-form-grid">
          <div className="dbs-programme-input-box">
            <label>Programme Code</label>
            <input
              type="text"
              placeholder="Enter Programme Code"
              value={payLoad.COURSECODE}
              name="COURSECODE"
              onChange={handleChange}
            />
          </div>

          <div className="dbs-programme-input-box">
            <label>Programme</label>
            <input
              type="text"
              placeholder="Enter Programme Name"
              value={payLoad.COURSE}
              name="COURSE"
              onChange={handleChange}
            />
          </div>

          <div className="dbs-programme-input-box">
            <label>Degree</label>
            <input
              type="text"
              placeholder="Enter Degree"
              value={payLoad.DEGREE}
              name="DEGREE"
              onChange={handleChange}
            />
          </div>

          <div className="dbs-programme-input-box">
            <label>Maximum Year(S)</label>
            <input
              type="text"
              placeholder="Enter Maximum Year(S)"
              value={payLoad.YEAR}
              name="YEAR"
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="dbs-programme-actions">
          <button
            type="button"
            className="dbs-programme-reset-btn"
            onClick={onCancel}
          >
            <X size={16} />
            Cancel
          </button>

          <button
            type="button"
            className="dbs-programme-save-btn"
            onClick={onHandleSave}
          >
            <Save size={16} />
            {payLoad.CID ? "Update " : "Save "}
          </button>
        </div>
      </div>

      <div className="dbs-programme-header">
        <div>
          <h3>Programme List</h3>

          <p>Manage and maintain programme master records.</p>
        </div>
      </div>

      <div className="dbs-programme-table-card">
        {progData.length === 0 ? (
          <div className="dbs-programme-empty">
            <AlertCircle className="dbs-programme-empty-icon" />
            <div className="dbs-programme-empty-title">No records found</div>
            <div className="dbs-programme-empty-desc">
              Add a new programme using the form above.
            </div>
          </div>
        ) : (
          <div className="dbs-programme-table-scroll">
            <table className="dbs-programme-data-table">
              <thead>
                <tr>
                  <th>SlNo.</th>
                  <th>Programme Code</th>
                  <th>Programme</th>
                  <th>Degree</th>
                  <th>Maximum Year(S)</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentData.map((pro, index) => (
                  <tr key={pro.CID}>
                    <td>{startIndex + index + 1}</td>
                    <td>{pro.COURSECODE}</td>
                    <td>{pro.COURSE}</td>
                    <td>{pro.DEGREE}</td>
                    <td>{pro.YEAR}</td>
                    <td>
                      <button
                        type="button"
                        className="dbs-programme-edit-btn"
                        onClick={() => onHandleEdit(pro)}
                      >
                        <Edit3 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {totalRecords > 0 && (
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
      )}
    </div>
  );
};

export default ProgrammeMaster;
