import React, { useState } from "react";
import { Save, Trash2, Edit3, AlertTriangle, HelpCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import "./SectionMaster.css";

const SectionMaster = () => {
  const sortedStudents = []; // Placeholder for sorted students data
  return (
    <div className="dbs-department-container">
      {/* Header */}
      <div className="dbs-department-form-header">
        <h2>Section Master</h2>
      </div>

      {/* Form Card */}
      <div className="dbs-form-card">
        <h3>Section Information</h3>
        <div className="dbs-form-grid-5">
          <div className="dbs-input-box">
            <label>Programme</label>
            <select></select>
          </div>
          <div className="dbs-input-box">
            <label>Branch</label>
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
            <label>Section</label>
            <input type="text" />
          </div>
          <div className="dbs-input-box">
            <label>Section</label>
            <input type="text" />
          </div>
          <div className="dbs-input-box">
            <label>Section</label>
            <input type="text" />
          </div>
          <div className="dbs-input-box">
            <label>Section</label>
            <input type="text" />
          </div>
          <div className="dbs-input-box">
            <label>Section</label>
            <input type="text" />
          </div>
          <div className="dbs-input-box">
            <label>Section</label>
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
                    Save Section
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
                                 Dept code  
                               </th>
                               <th  style={{ cursor: 'pointer' }}>
                                 Department 
                               </th>
                               <th  style={{ cursor: 'pointer' }}>
                                 Department Type 
                               </th>
                               <th>Description</th>
                               <th>Actions</th>
                             </tr>
                           </thead>
                         </table>
                 )}
               </div>
      


    </div>
  );
}

export default SectionMaster