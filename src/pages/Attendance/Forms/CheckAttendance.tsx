import React from "react";
import { RotateCcw } from "lucide-react";
import "./CheckAttendance.css";

const CheckAttendance = () => {

    return (

        <div className="dbs-groupchange-container">

            <div className="dbs-admissions-form-header">
                <div>
                    <h2>Check Attendance</h2>
                    <p>View Student Attendance Details</p>
                </div>
            </div>

            <div className="dbs-admissions-stepper-form-card">

                <div className="dbs-form-card">

                    <h3>Check Attendance</h3>

                    <p className="dbs-attendance-note">
                        NOTE : RED COLOUR INDICATES ABSENT
                    </p>

                    <div className="dbs-timetable-grid">

                        <div className="dbs-input-box dbs-double-select">

                            <label>Date & Shift</label>

                            <div>

                                <input type="date" />

                                <select>
                                    <option>Select Shift</option>
                                    <option>Shift-1</option>
                                    <option>Shift-2</option>
                                </select>

                            </div>

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

                    </div>

                    <div className="dbs-form-actions-row">

                        <button className="dbs-form-delete-btn">
                            <RotateCcw size={16} />
                            Reset
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default CheckAttendance;