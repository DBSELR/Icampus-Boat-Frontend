import React from "react";
import { Save, RotateCcw } from "lucide-react";
import "./AttendanceByAdminMH.css";

const AttendanceByAdminMH: React.FC = () => {

    return (

        <div className="dbs-groupchange-container">


            <div className="dbs-admissions-form-header">

                <div>
                    <h2>ADMIN_ATTENDENCE</h2>
                    <p>Admin Attendance Entry</p>
                </div>

            </div>



            <div className="dbs-admissions-stepper-form-card">


                <div className="dbs-form-card">


                    <h3>Admin Attendance</h3>


                    <p className="dbs-attendance-note">
                        NOTE : RED COLOUR INDICATES ABSENT
                    </p>



                    <div className="dbs-timetable-grid">



                        {/* Row 1 */}

                        <div className="dbs-input-box dbs-double-select">

                            <label>Date & Shift</label>

                            <div>

                                <input type="date" />

                                <select>
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




                        {/* Row 2 */}

                        <div className="dbs-input-box">

                            <label>Subtype</label>

                            <select>
                                <option>Select Subtype</option>
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




                        {/* Row 4 */}

                        <div className="dbs-input-box">

                            <label>Lecturer</label>

                            <select>
                                <option>Select Lecturer</option>
                            </select>

                        </div>




                        <div className="dbs-input-box">

                            <label>Period(s)</label>

                            <select>
                                <option>Select Period</option>
                            </select>

                        </div>





                        {/* Row 5 */}

                        <div className="dbs-input-box">

                            <label>Teaching Method</label>

                            <select>
                                <option>Select Teaching Method</option>
                            </select>

                        </div>




                        <div className="dbs-input-box dbs-checkbox">

                            <label>&nbsp;</label>

                            <div>

                                <input type="checkbox" />

                                <span>Is Practical</span>

                            </div>

                        </div>





                        {/* Row 6 */}

                        <div className="dbs-input-box">

                            <label>Absent Number</label>

                            <input
                                type="text"
                                placeholder="Enter Serial No."
                            />

                        </div>





                        {/* Row 7 */}

                        <div className="dbs-input-box dbs-full-width">

                            <label>Absent Number(s)</label>

                            <textarea

                                rows={5}

                                placeholder="Enter absent numbers..."

                            />

                        </div>





                        {/* Row 8 */}

                        <div className="dbs-input-box dbs-full-width">

                            <label>Taught Chapter</label>

                            <textarea

                                rows={4}

                                placeholder="Enter taught chapter..."

                            />

                        </div>




                    </div>




                    <div className="dbs-form-actions-row">


                        <button className="dbs-form-save-btn">

                            <Save size={16} />

                            Save

                        </button>



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


export default AttendanceByAdminMH;