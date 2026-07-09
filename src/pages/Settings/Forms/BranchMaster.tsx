import React, { useState } from "react";
import { Save, Trash2, Edit3, AlertTriangle, HelpCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import "./BranchMaster.css";

const BranchMaster = () => {
     const sortedStudents = []; // Placeholder for sorted students data
  return (
    <div className="dbs-branch-container">

      {/* Header */}
      <div className="dbs-branch-form-header">
        <h2>Branch Master</h2>
      </div>

      {/* Form Card */}
            <div className="dbs-form-card">
              <h3>Branch Information</h3>
              <div className="dbs-form-grid-4">

                <div className="dbs-input-box">
                  <label>Programme</label>
                  <select>
                  </select>
                </div>
                
                <div className="dbs-input-box">
                  <label>Department</label>
                  <select>
                  </select>
                </div>
                <div className="dbs-input-box">
                  <label>First Year Department</label>
                  <select>
                  </select> 
                </div>
                <div className="dbs-input-box">
                  <label>Branch code</label>
                  <input type="text" />
                </div>
                <div className="dbs-input-box">
                  <label>Branch Short Name</label>
                  <input type="text" />
                </div>
                <div className="dbs-input-box">
                  <label>Branch Name</label>
                  <input type="text" />
                </div>
              </div>
      
              {/* Form Buttons */}
                <div className="dbs-form-actions-row">
                  <button type="button" className="dbs-form-cancel-btn" >
                    Cancel / Reset
                  </button>
                  <button type="submit" className="dbs-form-save-btn">
                    <Save size={16} />
                    Save Branch
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
                                      Programme  
                                    </th>
                                    <th  style={{ cursor: 'pointer' }}>
                                      Department 
                                    </th>
                                    <th  style={{ cursor: 'pointer' }}>
                                      Branch code 
                                    </th>
                                    <th>Short Name</th>
                                    <th>Branch Name</th>
                                    <th>Actions</th>
                                  </tr>
                                </thead>
                              </table>
                      )}
                    </div>


    </div>
  )
}

export default BranchMaster