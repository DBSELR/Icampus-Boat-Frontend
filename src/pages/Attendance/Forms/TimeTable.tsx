import React from "react";
import { Save, Trash2, X, Plus } from "lucide-react";
import "./TimeTable.css";

const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

const periods = [
    "Period-I",
    "Period-II",
    "Period-III",
    "Period-IV",
    "Period-V",
    "Period-VI",
    "Period-VII",
    "Period-VIII"
];

const TimeTable: React.FC = () => {

    return (

        <div className="dbs-groupchange-container">

            <div className="dbs-admissions-form-header">
                <div>
                    <h2>Time Table</h2>
                    <p>Create & Manage Timetable</p>
                </div>
            </div>

            <div className="dbs-admissions-stepper-form-card">

                <div className="dbs-form-card">

                    <h3>Time Table Details</h3>

                    <div className="dbs-timetable-grid">

                        {/* LEFT */}

                        <div className="dbs-input-box">
                            <label>Shift</label>
                            <select>
                                <option>Shift-1</option>
                            </select>
                        </div>

                        <div className="dbs-input-box">
                            <label>Programme</label>
                            <select />
                        </div>

                        <div className="dbs-input-box">
                            <label>Branch</label>
                            <select />
                        </div>

                        <div className="dbs-input-box dbs-double-select">
                            <label>Year & Semester</label>

                            <div>
                                <select />
                                <select />
                            </div>
                        </div>

                        <div className="dbs-input-box dbs-double-select">
                            <label>Stream & Section</label>

                            <div>
                                <select />
                                <select />
                            </div>
                        </div>

                        <div className="dbs-input-box dbs-double-select">
                            <label>Day & Date</label>

                            <div>
                                <select />
                                <input type="date" />
                            </div>
                        </div>

                        <div className="dbs-input-box dbs-double-select">
                            <label>Period Type</label>

                            <div>
                                <select />
                                <select />
                            </div>
                        </div>

                        <div className="dbs-input-box dbs-double-select">
                            <label>Period From & To</label>

                            <div>
                                <select />
                                <select />
                            </div>
                        </div>

                        <div className="dbs-input-box dbs-double-select">
                            <label>Department</label>

                            <div>
                                <select />
                                <select />
                            </div>
                        </div>

                        <div className="dbs-input-box">
                            <label>Period Timing</label>
                            <input placeholder="10:00 AM" />
                        </div>

                        <div className="dbs-input-box">
                            <label>Subject</label>
                            <select />
                        </div>

                        <div className="dbs-input-box dbs-lecturer-row">
                            <label>Lecturer</label>

                            <div>
                                <select />
                                <button className="dbs-btn-add">
                                    <Plus size={16}/>
                                    Add
                                </button>
                            </div>
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

                        <button className="dbs-form-delete-btn">
                            <Trash2 size={16}/>
                            Delete
                        </button>

                    </div>

                </div>

            </div>

            <div className="dbs-dashboard-card">

                <div className="dbs-table-container">

                    <table className="dbs-data-table">

                        <thead>

                        <tr>

                            <th>Day</th>

                            {periods.map(p=>(
                                <th key={p}>{p}</th>
                            ))}

                        </tr>

                        </thead>

                        <tbody>

                        {days.map(day=>(

                            <tr key={day}>

                                <td><strong>{day}</strong></td>

                                {periods.map(p=>(

                                    <td key={p}></td>

                                ))}

                            </tr>

                        ))}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

    );

};

export default TimeTable;