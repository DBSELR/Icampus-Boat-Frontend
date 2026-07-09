import React, { useState } from "react";
import {
  Save,
  Trash2,
  Edit3,
  AlertTriangle,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import "./FacultyMaster.css";

const FacultyMaster = () => {
  const sortedStudents = []; // Placeholder for sorted students data
    const subjects = [
    "Maths",
    "Physics",
    "Chemistry",
    "English",
    "Biology",
  ];
  return (
    <div className="dbs-faculty-container">
      {/* Header */}
      <div className="dbs-faculty-form-header">
        <h2>Faculty Master</h2>
      </div>

      {/* Form Card */}
      <div className="dbs-form-card">
        <h3>Department Information</h3>
        <div className="dbs-form-grid-3">
          <div className="dbs-input-box">
            <label>Programe</label>
            <select> </select>
            <label>Year</label>
            <select> </select>
            <label>Semester</label>
            <select> </select>
            <label>Department</label>
            <select> </select>
            <label>Department</label>
            <select> </select>
            <label>Faculty</label>
            <select> </select>
          </div>

          <div className="dbs-input-box">
            <label>Programe</label>
            <input type="text" placeholder="By Subject Name" />

            <select
              multiple
              className="form-control btn-circle input-sm" style={{height:320, marginTop: 10}}>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div className="dbs-input-box">
            {/* Reactive Table Grid */}
                    <div className="dbs-table-container">
                      {sortedStudents.length === 0 ? (
                        <div className="dbs-empty-state">
                          <AlertCircle className="dbs-empty-state-icon" />
                          <div className="dbs-empty-state-title">No records found</div>
                          <div className="dbs-empty-state-desc">Try clearing your filters or add a new student above.</div>
                        </div>
                      ) : (
                        <table className="dbs-data-table">
                                <thead>
                                  <tr>
                                    <th  style={{ cursor: 'pointer' }}>
                                      subject  
                                    </th>
                                    <th  style={{ cursor: 'pointer' }}>
                                      Faculty 
                                    </th>
                                    <th>Actions</th>
                                  </tr>
                                </thead>
                              </table>
                      )}
                    </div>
          </div>

        </div>

        {/* Form Buttons */}
        <div className="dbs-form-actions-row">
          <button type="button" className="dbs-form-cancel-btn">
            Cancel / Reset
          </button>
          <button type="submit" className="dbs-form-save-btn">
            <Save size={16} />
            Save Department
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacultyMaster;
