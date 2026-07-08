import React from "react";
import { Send } from "lucide-react";
import "./ConsolidatedAttendanceAnalysis.css";

const ConsolidatedAttendanceAnalysis = () => {

    return (

        <div className="dbs-groupchange-container">


            <div className="dbs-admissions-form-header">

                <div>

                    <h2>CONSOLIDATED ATTENDANCE ANALYSIS</h2>

                    <p>View Consolidated Attendance Details</p>

                </div>

            </div>



            <div className="dbs-admissions-stepper-form-card">


                <div className="dbs-form-card">


                    <h3>Consolidated Attendance Analysis</h3>



                    <div className="dbs-timetable-grid">


                        {/* Row 1 */}

                        <div className="dbs-input-box">

                            <label>Academic Year</label>

                            <select>

                                <option>Select Academic Year</option>

                            </select>

                        </div>



                        <div className="dbs-input-box">

                            <label>Course</label>

                            <select>

                                <option>Select Course</option>

                            </select>

                        </div>




                        {/* Row 2 */}

                        <div className="dbs-input-box">

                            <label>Branch</label>

                            <select>

                                <option>Select Branch</option>

                            </select>

                        </div>



                        <div className="dbs-input-box">

                            <label>Sem Type</label>

                            <select>

                                <option>Select Semester Type</option>

                            </select>

                        </div>




                        {/* Row 3 */}

                        <div className="dbs-input-box">

                            <label>Sem</label>

                            <select>

                                <option>Select Semester</option>

                            </select>

                        </div>


                    </div>



                    <div className="dbs-form-actions-row">


                        <button className="dbs-push-btn">

                            <Send size={16} />

                            Push Data

                        </button>


                    </div>



                </div>


            </div>


        </div>

    );

};


export default ConsolidatedAttendanceAnalysis;