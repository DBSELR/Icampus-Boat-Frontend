import React, { useState } from "react";
import { Search, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import "./StudentPromotion.css";

const StudentPromotion: React.FC = () => {
  const [searchForm, setSearchForm] = useState({
    academicYear: "",
    course: "",
    branch: "",
    year: "",
    sem: "",
  });

  const [promoForm, setPromoForm] = useState({
    academicYear: "",
    year: "",
    sem: "",
  });

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSearchForm({ ...searchForm, [e.target.name]: e.target.value });
  };

  const handlePromoChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setPromoForm({ ...promoForm, [e.target.name]: e.target.value });
  };

  const handleClearSearch = () => {
    setSearchForm({
      academicYear: "",
      course: "",
      branch: "",
      year: "",
      sem: "",
    });
  };

  const handleDisplay = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Students fetched successfully");
  };

  const handlePromote = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Students promoted successfully");
  };

  return (
    <div className="dbs-groupchange-container">

      {/* HEADER */}
      <div className="dbs-admissions-form-header">
        <div>
          <h2>Student Promotion</h2>
          <p>Search and promote students to next academic level</p>
        </div>
      </div>

      {/* SEARCH STUDENTS */}
      <form className="dbs-admissions-stepper-form-card" onSubmit={handleDisplay}>
        <div className="dbs-form-card">

          <h3>Search Students</h3>

          <div className="dbs-form-grid-3">

            {/* Academic Year */}
            <div className="dbs-input-box">
              <label>Academic Year</label>
              <select
                name="academicYear"
                value={searchForm.academicYear}
                onChange={handleSearchChange}
              >
                <option value="">Select Academic Year</option>
                <option>2022-23</option>
                <option>2023-24</option>
                <option>2024-25</option>
              </select>
            </div>

            {/* Course */}
            <div className="dbs-input-box">
              <label>Course</label>
              <select
                name="course"
                value={searchForm.course}
                onChange={handleSearchChange}
              >
                <option value="">Select Course</option>
                <option>B.Tech</option>
                <option>M.Tech</option>
                <option>MBA</option>
              </select>
            </div>

            {/* Branch */}
            <div className="dbs-input-box">
              <label>Branch</label>
              <select
                name="branch"
                value={searchForm.branch}
                onChange={handleSearchChange}
              >
                <option value="">Select Branch</option>
                <option>CSE</option>
                <option>ECE</option>
                <option>MECH</option>
                <option>CIVIL</option>
              </select>
            </div>

            {/* Year */}
            <div className="dbs-input-box">
              <label>Year</label>
              <select name="year" value={searchForm.year} onChange={handleSearchChange}>
                <option value="">Select Year</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
              </select>
            </div>

            {/* Sem */}
            <div className="dbs-input-box">
              <label>Sem</label>
              <select name="sem" value={searchForm.sem} onChange={handleSearchChange}>
                <option value="">Select Sem</option>
                <option>1</option>
                <option>2</option>
              </select>
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
              onClick={handleClearSearch}
            >
              Cancel
            </button>

          </div>

        </div>
      </form>

      {/* PROMOTE STUDENTS */}
      <form className="dbs-admissions-stepper-form-card" onSubmit={handlePromote}>
        <div className="dbs-form-card">

          <h3>Promote Students</h3>

          <div className="dbs-form-grid-3">

            {/* Academic Year */}
            <div className="dbs-input-box">
              <label>Academic Year</label>
              <select
                name="academicYear"
                value={promoForm.academicYear}
                onChange={handlePromoChange}
              >
                <option value="">Select Academic Year</option>
                <option>2023-24</option>
                <option>2024-25</option>
                <option>2025-26</option>
              </select>
            </div>

            {/* Year */}
            <div className="dbs-input-box">
              <label>Year</label>
              <select name="year" value={promoForm.year} onChange={handlePromoChange}>
                <option value="">Select Year</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
              </select>
            </div>

            {/* Sem */}
            <div className="dbs-input-box">
              <label>Sem</label>
              <select name="sem" value={promoForm.sem} onChange={handlePromoChange}>
                <option value="">Select Sem</option>
                <option>1</option>
                <option>2</option>
              </select>
            </div>

          </div>

          {/* BUTTON */}
          <div className="dbs-form-actions-row">

            <button type="submit" className="dbs-form-reprint-btn">
              <ArrowUpRight size={16} />
              Promote
            </button>

          </div>

        </div>
      </form>

    </div>
  );
};

export default StudentPromotion;