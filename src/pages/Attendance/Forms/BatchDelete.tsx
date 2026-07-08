import React from "react";
import { Trash2 } from "lucide-react";
import "./BatchDelete.css";

const BatchDelete = () => {
  return (
    <div className="dbs-groupchange-container">

      <div className="dbs-admissions-form-header">
        <div>
          <h2>Batch Delete</h2>
          <p>Delete Existing Batch</p>
        </div>
      </div>

      <div className="dbs-admissions-stepper-form-card">

        <div className="dbs-form-card">

          <h3>Batch Details</h3>

          <div className="dbs-timetable-grid">

            <div className="dbs-input-box">
              <label>Day</label>
              <select>
                <option>Select Day</option>
              </select>
            </div>

            <div className="dbs-input-box">
              <label>Course</label>
              <select>
                <option>Select Course</option>
              </select>
            </div>

            <div className="dbs-input-box">
              <label>Branch</label>
              <select>
                <option>Select Branch</option>
              </select>
            </div>

            <div className="dbs-input-box dbs-double-select">
              <label>Year & Semester</label>

              <div>
                <select>
                  <option>Select Year</option>
                </select>

                <select>
                  <option>Select Semester</option>
                </select>
              </div>
            </div>

            <div className="dbs-input-box dbs-double-select">
              <label>Section & Period</label>

              <div>
                <select>
                  <option>Select Section</option>
                </select>

                <select>
                  <option>Select Period</option>
                </select>
              </div>
            </div>

            <div className="dbs-input-box">
              <label>Faculty</label>
              <select>
                <option>Select Faculty</option>
              </select>
            </div>

          </div>

          <div className="dbs-form-actions-row">

            <button className="dbs-form-delete-btn">
              <Trash2 size={16} />
              Delete Batch
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default BatchDelete;