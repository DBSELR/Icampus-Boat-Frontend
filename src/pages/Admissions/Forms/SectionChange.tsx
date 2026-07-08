import React, { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import "./SectionChange.css";

const SectionChange: React.FC = () => {
  const [form, setForm] = useState({
    course: "",
    branch: "",
    year: "",
    sem: "",
    section: "",
    newSection: "",
  });

  const [selectedCount, setSelectedCount] = useState(0);

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setForm({
      course: "",
      branch: "",
      year: "",
      sem: "",
      section: "",
      newSection: "",
    });
    setSelectedCount(0);
  };

  const handleDisplay = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Students loaded");
    setSelectedCount(0);
  };

  const handleUpdateSection = () => {
    toast.success("Section updated successfully");
  };

  return (
    <div className="dbs-groupchange-container">

      {/* HEADER */}
      <div className="dbs-admissions-form-header">
        <div>
          <h2>Section Change</h2>
          <p>Update student section for selected filters</p>
        </div>
      </div>

      {/* FORM */}
      <form className="dbs-admissions-stepper-form-card" onSubmit={handleDisplay}>
        <div className="dbs-form-card">

          <h3>Section Details</h3>

          <div className="dbs-form-grid-3">

            {/* COURSE */}
            <div className="dbs-input-box">
              <label>Course</label>
              <select name="course" value={form.course} onChange={handleChange}>
                <option value="">Select Course</option>
                <option>B.Tech</option>
                <option>M.Tech</option>
                <option>MBA</option>
              </select>
            </div>

            {/* BRANCH */}
            <div className="dbs-input-box">
              <label>Branch</label>
              <select name="branch" value={form.branch} onChange={handleChange}>
                <option value="">Select Branch</option>
                <option>CSE</option>
                <option>ECE</option>
                <option>MECH</option>
                <option>CIVIL</option>
              </select>
            </div>

            {/* YEAR */}
            <div className="dbs-input-box">
              <label>Year</label>
              <select name="year" value={form.year} onChange={handleChange}>
                <option value="">Select Year</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
              </select>
            </div>

            {/* SEM */}
            <div className="dbs-input-box">
              <label>Sem</label>
              <select name="sem" value={form.sem} onChange={handleChange}>
                <option value="">Select Sem</option>
                <option>1</option>
                <option>2</option>
              </select>
            </div>

            {/* SECTION */}
            <div className="dbs-input-box">
              <label>Section</label>
              <select name="section" value={form.section} onChange={handleChange}>
                <option value="">Select Section</option>
                <option>A</option>
                <option>B</option>
                <option>C</option>
              </select>
            </div>

            {/* NEW SECTION */}
            <div className="dbs-input-box">
              <label>New Section</label>
              <select name="newSection" value={form.newSection} onChange={handleChange}>
                <option value="">Select New Section</option>
                <option>A</option>
                <option>B</option>
                <option>C</option>
              </select>
            </div>

          </div>

          {/* COUNT */}
          <div style={{ marginTop: "12px", fontWeight: 600 }}>
            Selected Students Count : {selectedCount}
          </div>

          {/* BUTTONS */}
          <div className="dbs-form-actions-row">

            <button
              type="button"
              className="dbs-form-cancel-btn"
              onClick={handleReset}
            >
              Cancel
            </button>

            <button
              type="button"
              className="dbs-form-reprint-btn"
              onClick={handleUpdateSection}
            >
              <Save size={16} />
              Update Section
            </button>

          </div>

        </div>
      </form>

    </div>
  );
};

export default SectionChange;