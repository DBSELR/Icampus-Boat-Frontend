import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import "./DeleteInActiveStudents.css";

const DeleteInActiveStudents: React.FC = () => {
  const [form, setForm] = useState({
    course: "",
    branch: "",
    year: "",
    sem: "",
    section: "",
    status: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setForm({
      course: "",
      branch: "",
      year: "",
      sem: "",
      section: "",
      status: "",
    });
  };

  const handleDelete = () => {
    toast.success("Inactive students deleted successfully");
  };

  return (
    <div className="dbs-groupchange-container">

      {/* HEADER */}
      <div className="dbs-admissions-form-header">
        <div>
          <h2>Delete Inactive Students</h2>
          <p>Remove inactive student records based on filters</p>
        </div>
      </div>

      {/* FORM */}
      <form className="dbs-admissions-stepper-form-card">
        <div className="dbs-form-card">

          <h3>Student Filters</h3>

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

            {/* STATUS */}
            <div className="dbs-input-box">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="">Select Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>

          </div>

          {/* ACTIONS */}
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
              onClick={handleDelete}
            >
              <Trash2 size={16} />
              Delete
            </button>

          </div>

        </div>
      </form>

    </div>
  );
};

export default DeleteInActiveStudents;