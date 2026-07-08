import React from "react";
import { Save, X } from "lucide-react";
import "./Batches.css";

const Batches = () => {

    return (

        <div className="dbs-groupchange-container">

            <div className="dbs-admissions-form-header">
                <div>
                    <h2>Batches</h2>
                    <p>Create & Manage Student Batches</p>
                </div>
            </div>

            <div className="dbs-admissions-stepper-form-card">

                <div className="dbs-form-card">

                    <h3>Batch Details</h3>

                    <div className="dbs-timetable-grid">

                        <div className="dbs-input-box">
                            <label>Shift</label>

                            <select>
                                <option>Select Shift</option>
                            </select>
                        </div>

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

                            <label>Stream & Section</label>

                            <div>

                                <select>
                                    <option>Select Stream</option>
                                </select>

                                <select>
                                    <option>Select Section</option>
                                </select>

                            </div>

                        </div>

                        <div className="dbs-input-box">
                            <label>Day</label>

                            <select>
                                <option>Select Day</option>
                            </select>
                        </div>

                        <div className="dbs-input-box">
                            <label>Period</label>

                            <select>
                                <option>Select Period</option>
                            </select>
                        </div>

                        <div className="dbs-input-box">
                            <label>Subject(s)</label>

                            <select>
                                <option>Select Subject</option>
                            </select>
                        </div>

                        <div className="dbs-input-box">
                            <label>Lecturer</label>

                            <select>
                                <option>Select Lecturer</option>
                            </select>
                        </div>

                        <div className="dbs-input-box">
                            <label>Batch Count</label>

                            <input
                                type="number"
                                placeholder="Enter Batch Count"
                            />
                        </div>

                    </div>

                    <div className="dbs-form-actions-row">

                        <button className="dbs-form-save-btn">
                            <Save size={16}/>
                            Save
                        </button>

                        <button className="dbs-form-cancel-btn">
                            <X size={16}/>
                            Cancel
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default Batches;