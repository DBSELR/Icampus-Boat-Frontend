import React, { useState } from "react";
import { Save, Trash2, Edit3, AlertTriangle, HelpCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import "./ProgrammeMaster.css";

const ProgrammeMaster = () => {
  const sortedStudents = []; // Placeholder for sorted students data
  return (
    <div className="dbs-programme-container">

       {/* Header */}
      <div className="dbs-programme-form-header">
        <h2>Programme Master</h2>
      </div>

       {/* Form Card */}
      <div className="dbs-form-card">
        <h3>Programme Information</h3>
        <div className="dbs-form-grid-4">
          <div className="dbs-input-box">
            <label>Programme Code</label>
            <input type="text" placeholder="Enter Programme Code" />
          </div>
          <div className="dbs-input-box">
            <label>Programme</label>
            <input type="text" placeholder="Enter Programme Name" />
          </div>
          <div className="dbs-input-box">
            <label>Degree</label>
            <input type="text" placeholder="Enter Degree" />
          </div>
          <div className="dbs-input-box">
            <label>Maximum Year(S)</label>
            <input type="text" placeholder="Enter Maximum Year(S)" />
          </div>
        </div>

        {/* Form Buttons */}
          <div className="dbs-form-actions-row">
            <button type="button" className="dbs-form-cancel-btn" >
              Cancel / Reset
            </button>
            <button type="submit" className="dbs-form-save-btn">
              <Save size={16} />
              Save Programme
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
                          SlNo. 
                        </th>
                        <th  style={{ cursor: 'pointer' }}>
                          Programme code  
                        </th>
                        <th  style={{ cursor: 'pointer' }}>
                          Programme 
                        </th>
                        <th  style={{ cursor: 'pointer' }}>
                          Degree 
                        </th>
                        <th  style={{ cursor: 'pointer' }}>
                          Maximum Year(S) 
                        </th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                  </table>
                )}
              </div>


      
      </div>
  )
}

export default ProgrammeMaster