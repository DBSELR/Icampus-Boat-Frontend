import React from "react";
import { Pencil } from "lucide-react";
import "./EditEFRMDate.css";

const EditEFRMDate = () => {
    return (

        <div className="dbs-groupchange-container">

            <div className="dbs-admissions-form-header">
                <div>
                    <h2>Edit EFRM Date</h2>
                    <p>Update Existing EFRM Date</p>
                </div>
            </div>

            <div className="dbs-admissions-stepper-form-card">

                <div className="dbs-form-card">

                    <h3>EFRM Details</h3>

                    <div className="dbs-timetable-grid">

                        {/* Row 1 */}

                        <div className="dbs-input-box">
                            <label>Day</label>

                            <select>
                                <option>Select Day</option>
                            </select>
                        </div>

                        <div className="dbs-input-box">
                            <label>Course</label>

                            <select>
                                <option>Select Course</option>
                            </select>
                        </div>

                        {/* Row 2 */}

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

                            <label>Branch & Section</label>

                            <div>

                                <select>
                                    <option>Select Branch</option>
                                </select>

                                <select>
                                    <option>Select Section</option>
                                </select>

                            </div>

                        </div>

                        {/* Row 3 */}

                        <div className="dbs-input-box">

                            <label>FromToPeriod</label>

                            <select>
                                <option>Select FromToPeriod</option>
                                <option>Period-I to Period-II</option>
                                <option>Period-II to Period-III</option>
                                <option>Period-III to Period-IV</option>
                                <option>Period-IV to Period-V</option>
                            </select>

                        </div>

                        <div className="dbs-input-box">

                            <label>New EFRM Date</label>

                            <input type="date" />

                        </div>

                    </div>

                    <div className="dbs-form-actions-row">

                        <button className="dbs-form-save-btn">
                            <Pencil size={16} />
                            Edit EFRM Date
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );
};

export default EditEFRMDate;