import React, { useState } from "react";
import { Search, X, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import "./StudentData.css";

const options = [
  "Reg No",
  "Student Name",
  "Course",
  "Branch",
  "Year",
  "Academic Year",
];

const StudentDataExcelExport: React.FC = () => {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const toggleOption = (value: string) => {
    setSelectedFields((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handleCancel = () => {
    setSelectedFields([]);
  };

  const handleDisplay = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Students loaded");
  };

  const handleExport = () => {
    toast.success("Excel exported successfully");
  };

  return (
    <div className="dbs-groupchange-container">

      {/* HEADER */}
      <div className="dbs-admissions-form-header">
        <div>
          <h2>Student Data Excel Export</h2>
          <p>Filter students and export data to Excel</p>
        </div>
      </div>

      {/* FORM */}
      <form className="dbs-admissions-stepper-form-card" onSubmit={handleDisplay}>
        <div className="dbs-form-card">

          <h3>Student Fields</h3>

          <div className="dbs-form-grid-3">

            {/* CUSTOM DROPDOWN */}
            <div className="dbs-input-box custom-dropdown">

              <label>Student Fields</label>

              <div
                className="dropdown-box"
                onClick={() => setOpen(!open)}
              >
                {selectedFields.length > 0
                  ? selectedFields.join(", ")
                  : "Select Fields"}
              </div>

              {open && (
                <div className="dropdown-panel">
                  {options.map((opt) => (
                    <label key={opt} className="dropdown-item">
                      <input
                        type="checkbox"
                        checked={selectedFields.includes(opt)}
                        onChange={() => toggleOption(opt)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}

            </div>

          </div>

          {/* BUTTONS */}
          <div className="dbs-form-actions-row">

            <button type="submit" className="dbs-form-save-btn">
              <Search size={16} />
              Display
            </button>

            <button
              type="button"
              className="dbs-form-cancel-btn"
              onClick={handleCancel}
            >
              <X size={16} />
              Cancel
            </button>

            <button
              type="button"
              className="dbs-form-reprint-btn"
              onClick={handleExport}
            >
              <FileSpreadsheet size={16} />
              Export Excel
            </button>

          </div>

        </div>
      </form>

      {/* TABLE */}
      <div className="dbs-dashboard-card dbs-datatable-card">

        <div className="dbs-datatable-header-area">
          <div>
            <h3>Student List</h3>
            <p>Export filtered student data</p>
          </div>
        </div>

        <div className="dbs-table-container">

          <div className="dbs-empty-state">
            <div className="dbs-empty-state-title">
              Student List is Empty...
            </div>
            <div className="dbs-empty-state-desc">
              Please select fields and click Display
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default StudentDataExcelExport;