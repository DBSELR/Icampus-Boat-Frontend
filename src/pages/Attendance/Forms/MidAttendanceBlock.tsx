import React from "react";
import { Save, X } from "lucide-react";
import "./MidAttendanceBlock.css";

const MidAttendanceBlock: React.FC = () => {

    return (

        <div className="dbs-groupchange-container">


            <div className="dbs-admissions-form-header">

                <div>

                    <h2>MidAttendance_Block</h2>

                    <p>Block Mid Attendance</p>

                </div>

            </div>




            <div className="dbs-admissions-stepper-form-card">


                <div className="dbs-form-card">


                    <h3>Mid Attendance Block</h3>




                    <div className="dbs-timetable-grid">



                        {/* Row 1 */}

                        <div className="dbs-input-box">

                            <label>Programme</label>

                            <select>

                                <option>Select Programme</option>

                            </select>

                        </div>




                        <div className="dbs-input-box">

                            <label>Year</label>

                            <select>

                                <option>Select Year</option>

                            </select>

                        </div>





                        {/* Row 2 */}

                        <div className="dbs-input-box">

                            <label>Semester</label>

                            <select>

                                <option>Select Semester</option>

                            </select>

                        </div>




                        <div className="dbs-input-box">

                            <label>Branch</label>

                            <select>

                                <option>Select Branch</option>

                            </select>

                        </div>





                        {/* Row 3 */}

                        <div className="dbs-input-box">

                            <label>Period</label>

                            <select>

                                <option>Select Period</option>

                            </select>

                        </div>




                        <div className="dbs-input-box dbs-double-select">

                            <label>From & To Date</label>

                            <div>

                                <input type="date" />

                                <input type="date" />

                            </div>

                        </div>



                    </div>





                    <div className="dbs-form-actions-row">



                        <button className="dbs-form-save-btn">

                            <Save size={16} />

                            Save

                        </button>




                        <button className="dbs-form-delete-btn">

                            <X size={16} />

                            Cancel

                        </button>



                    </div>



                </div>


            </div>


        </div>

    );

};


export default MidAttendanceBlock;