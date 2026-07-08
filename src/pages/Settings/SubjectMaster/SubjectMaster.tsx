import React, { useState } from "react";
import { Save, Trash2, Edit3, AlertTriangle, HelpCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import "./SubjectMaster.css";
import { getByDisplayValue } from "@testing-library/dom";

const SubjectMaster = () => {
    const sortedStudents = []; // Placeholder for sorted students data

    const marksFields = [
      "Sessional Marks",
      "Assignment Marks",
      "Objective Marks",
      "Online Quiz Marks",
      "Attendance Marks",
      "Report Presentation Marks",
      "Drawing Sheet Marks",
      "Day to Day Marks",
      "Internal Test Marks",
      "Viva voce Marks",
      "Record Marks",
      "Lab Internal Marks",
      "Oral Test",
      "CIE100 Marks",
      "CIE75 Marks",
      "CIE60 Marks",
      "CIE50 Marks",
      "CIE40 Marks",
      "External Marks",
    ];

  return (
    <div className="dbs-subject-container">
      {/* Header */}
      <div className="dbs-subject-form-header">
        <h2>Subject Master</h2>
      </div>

      {/* Form Card */}
      <div className="dbs-form-card">
        <h3>Subject Information</h3>
        <div className="dbs-form-grid-2">
          <div className="dbs-form-grid-2">
            <div className="dbs-input-box">
              <label>Regulation</label>
              <select></select>
            </div>
            <div className="dbs-input-box">
              <label>Programme</label>
              <select></select>
            </div>
            <div className="dbs-input-box">
              <label>Year</label>
              <select></select>
            </div>
            <div className="dbs-input-box">
              <label>Semester</label>
              <select></select>
            </div>
            <div className="dbs-input-box">
              <label>Stream</label>
              <select></select>
            </div>
            <div className="dbs-input-box">
              <label>Subject Code</label>
              <input type="text" />
            </div>
            <div className="dbs-input-box">
              <label>Subject Name</label>
              <input type="text" />
            </div>
            <div className="dbs-input-box">
              <label>Subject Shortname</label>
              <input type="text" />
            </div>
            <div className="dbs-input-box">
              <label>isElective</label>
              <input type="checkbox" />
            </div>
            <div className="dbs-input-box">
              <label>Mior/Honor</label>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <input type="checkbox" />
                <input type="checkbox" />
              </div>
            </div>

            <div className="dbs-input-box">
              <label>Paper order</label>
              <input type="text" />
            </div>
            <div className="dbs-input-box">
              <label>Period Type</label>
              <select></select>
            </div>

            <div className="dbs-input-box">
              <label>Elective Code</label>
              <input type="text" />
            </div>
            <div className="dbs-input-box">
              <label>Elective Name</label>
              <input type="text" />
            </div>
            <div className="dbs-input-box">
              <label>Elective Shortname</label>
              <input type="text" />
            </div>

            <div className="dbs-input-box">
              <label>Description</label>
              <input
                type="text"
                placeholder="Enter DescriptionEnter Like Bachelor Of Technology"
              />
            </div>
          </div>

          <div className="dbs-form-grid-2">
            {marksFields.map((field, index) => (
              <div className="dbs-form-grid-3" key={index}>
                <div className="dbs-input-box">
                  <label>{field}</label>
                </div>

                <div className="dbs-input-box">
                  <input type="text" placeholder="Max Marks" />
                </div>

                <div className="dbs-input-box">
                  <input type="text" placeholder="Min Marks" />
                </div>
              </div>
            ))}
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
                                SLNo. 
                              </th>
                              <th  style={{ cursor: 'pointer' }}>
                                Subject Code  
                              </th>
                              <th  style={{ cursor: 'pointer' }}>
                                Subject Name 
                              </th>                              
                              <th>Actions</th>
                            </tr>
                          </thead>
                        </table>
                )}
              </div>

    </div>
  );
}

export default SubjectMaster