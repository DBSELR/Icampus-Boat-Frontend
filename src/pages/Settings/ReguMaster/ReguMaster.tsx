import React, { useState } from "react";
import { Save, Trash2, Edit3, AlertTriangle, HelpCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import "./ReguMaster.css";

const ReguMaster = () => {
    const sortedStudents = []; // Placeholder for sorted students data
  return (
    <div className="dbs-regu-container">

      {/* Header */}
      <div className="dbs-regu-form-header">
        <h2>Regulation Master</h2>
      </div>

      {/* Form Card */}
      <div className="dbs-form-card">
        <h3>Regulation Information</h3>
        <div className="dbs-form-grid-4">
          <div className="dbs-input-box">
            <label>Regulation</label>
            <input type="text" placeholder="Enter Regulation" />
          </div>
          
        </div>

         {/* Form Buttons */}
          <div className="dbs-form-actions-row">
            <button type="button" className="dbs-form-cancel-btn" >
              Cancel / Reset
            </button>
            <button type="submit" className="dbs-form-save-btn">
              <Save size={16} />
              Save Regulation
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
                          Regulation  
                        </th>
                        <th  style={{ cursor: 'pointer' }}>
                          AcademicYear 
                        </th>                        
                      </tr>
                    </thead>
                  </table>
          )}
        </div>  
        </div>
  )
}

export default ReguMaster