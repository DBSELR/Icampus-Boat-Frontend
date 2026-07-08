import React from "react";
import "./TimeAdjustment.css";

const TimeAdjustment = () => {

    return (

        <div className="dbs-groupchange-container">

            <div className="dbs-admissions-form-header">
                <div>
                    <h2>Period Adjustment</h2>
                    <p>Create & Manage Period Adjustment</p>
                </div>
            </div>

            <div className="dbs-admissions-stepper-form-card">

                <div className="dbs-form-card">

                    <h3>Period Adjustment Details</h3>

                    <div className="dbs-timetable-grid">

                        <div className="dbs-input-box">
                            <label>Department</label>

                            <select>
                                <option>Select Department</option>
                            </select>
                        </div>

                        <div className="dbs-input-box">
                            <label>Faculty</label>

                            <select>
                                <option>Select Faculty</option>
                            </select>
                        </div>

                        <div className="dbs-input-box">
                            <label>Programme</label>

                            <select>
                                <option>Select Programme</option>
                            </select>
                        </div>

                        <div className="dbs-input-box dbs-double-select">

                            <label>Semester & Date</label>

                            <div>

                                <select>
                                    <option>Select Semester</option>
                                </select>

                                <input type="date" />

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default TimeAdjustment;