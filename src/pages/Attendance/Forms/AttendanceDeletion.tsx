import React from "react";
import { Trash2 } from "lucide-react";
import "./AttendanceDeletion.css";

const AttendanceDeletion = () => {

    return (

        <div className="dbs-groupchange-container">

            <div className="dbs-admissions-form-header">
                <div>
                    <h2>ADMIN PERMISSIONS</h2>
                    <p>Attendance Deletion</p>
                </div>
            </div>


            <div className="dbs-admissions-stepper-form-card">

                <div className="dbs-form-card">

                    <h3>Attendance Deletion</h3>


                    <div className="dbs-timetable-grid">


                        {/* Row 1 */}

                        <div className="dbs-input-box">
                            <label>Date</label>

                            <input type="date" />

                        </div>


                        <div className="dbs-input-box">

                            <label>Programme</label>

                            <select>
                                <option>Select Programme</option>
                            </select>

                        </div>



                        {/* Row 2 */}

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



                        {/* Row 3 */}

                        <div className="dbs-input-box">

                            <label>Section</label>

                            <select>
                                <option>Select Section</option>
                            </select>

                        </div>



                        <div className="dbs-input-box">

                            <label>Period</label>

                            <select>
                                <option>Select Period</option>
                            </select>

                        </div>



                        {/* Row 4 */}

                        <div className="dbs-input-box">

                            <label>Lecturer</label>

                            <select>
                                <option>Select Lecturer</option>
                            </select>

                        </div>



                        <div className="dbs-input-box">

                            <label>Subject</label>

                            <select>
                                <option>Select Subject</option>
                            </select>

                        </div>


                    </div>



                    <div className="dbs-form-actions-row">

                        <button className="dbs-form-delete-btn">

                            <Trash2 size={16} />

                            Delete

                        </button>

                    </div>


                </div>

            </div>

        </div>

    );

};


export default AttendanceDeletion;