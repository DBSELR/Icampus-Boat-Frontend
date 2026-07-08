import React from "react";
import { Eye } from "lucide-react";
import "./DayWiseAttendance.css";

const DayWiseAttendance = () => {

    return (
        <div className="dbs-groupchange-container">

            <div className="dbs-admissions-form-header">
                <div>
                    <h2>Student Day To Day Attendance</h2>
                    <p>View Student Attendance Details</p>
                </div>
            </div>

            <div className="dbs-admissions-stepper-form-card">

                <div className="dbs-form-card">

                    <h3>Day Wise Attendance</h3>

                    <div className="dbs-timetable-grid">

                        <div className="dbs-input-box">
                            <label>Registration No.</label>

                            <input
                                type="text"
                                placeholder="Enter Registration Number"
                            />
                        </div>

                        <div className="dbs-input-box">
                            <label>From Date</label>

                            <input type="date" />
                        </div>

                        <div className="dbs-input-box">
                            <label>To Date</label>

                            <input type="date" />
                        </div>

                    </div>

                    <div className="dbs-form-actions-row">

                        <button className="dbs-view-btn">
                            <Eye size={16} />
                            View
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default DayWiseAttendance;