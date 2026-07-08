import React from "react";
import { Save, X } from "lucide-react";
import "./AdminPermissions.css";

const AdminPermissions = () => {

    return (

        <div className="dbs-groupchange-container">

            <div className="dbs-admissions-form-header">
                <div>
                    <h2>Admin Permissions</h2>
                    <p>Create & Manage Admin Permissions</p>
                </div>
            </div>

            <div className="dbs-admissions-stepper-form-card">

                <div className="dbs-form-card">

                    <h3>Permission Details</h3>

                    <div className="dbs-timetable-grid">

                        {/* Row 1 */}

                        <div className="dbs-input-box dbs-double-select">

                            <label>From & To Date</label>

                            <div>

                                <input type="date" />

                                <input type="date" />

                            </div>

                        </div>

                        <div className="dbs-input-box">

                            <label>Shift</label>

                            <select>
                                <option>Select Shift</option>
                                <option>Shift-1</option>
                                <option>Shift-2</option>
                            </select>

                        </div>

                        {/* Row 2 */}

                        <div className="dbs-input-box">

                            <label>Programme</label>

                            <select>
                                <option>Select Programme</option>
                            </select>

                        </div>

                        <div className="dbs-input-box">

                            <label>Branch</label>

                            <select>
                                <option>Select Branch</option>
                            </select>

                        </div>

                        {/* Row 3 */}

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

                        <div className="dbs-input-box">

                            <label>Section</label>

                            <select>
                                <option>Select Section</option>
                            </select>

                        </div>

                    </div>

                    <div className="dbs-form-actions-row">

                        <button className="dbs-form-save-btn">
                            <Save size={16} />
                            Save
                        </button>

                        <button className="dbs-form-cancel-btn">
                            <X size={16} />
                            Cancel
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default AdminPermissions;