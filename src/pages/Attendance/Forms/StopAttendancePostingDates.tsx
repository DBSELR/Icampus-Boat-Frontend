import React from "react";
import { Save, X, HelpCircle, Edit3, Trash2 } from "lucide-react";
import "./StopAttendancePostingDates.css";

const StopAttendancePostingDates: React.FC = () => {

    return (

        <div className="dbs-groupchange-container">


            {/* HEADER */}

            <div className="dbs-admissions-form-header">

                <div>

                    <h2>Stop Attendance Posting Dates</h2>

                    <p>Manage Attendance Posting Dates</p>

                </div>

            </div>



            {/* FORM */}

            <div className="dbs-admissions-stepper-form-card">

                <div className="dbs-form-card">


                    <h3>Attendance Posting Dates</h3>



                    <div className="dbs-timetable-grid">



                        <div className="dbs-input-box">

                            <label>Programme</label>

                            <select>

                                <option>Select Programme</option>

                            </select>

                        </div>



                        <div className="dbs-input-box dbs-double-select">

                            <label>Year & Sem</label>

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

                            <label>A Y Start Date</label>

                            <input type="date" />

                        </div>



                        <div className="dbs-input-box">

                            <label>Attendance Stop Date</label>

                            <input type="date" />

                        </div>



                        <div className="dbs-input-box">

                            <label>A Y End Date</label>

                            <input type="date" />

                        </div>




                        <div className="dbs-input-box dbs-checkbox">

                            <label>Dates Release</label>

                            <div>

                                <input type="checkbox" />

                                <span>Release Dates</span>

                            </div>

                        </div>



                    </div>




                    <div className="dbs-form-actions-row">


                        <button className="dbs-form-cancel-btn">

                            <X size={16}/>

                            Cancel

                        </button>



                        <button className="dbs-form-save-btn">

                            <Save size={16}/>

                            Save

                        </button>



                    </div>



                </div>


            </div>





            {/* TABLE */}

            <div className="dbs-dashboard-card dbs-datatable-card">


                <div className="dbs-datatable-header-area">

                    <div>

                        <h3>Attendance Posting Dates List</h3>

                        <p>Configured attendance stop dates</p>

                    </div>

                </div>




                <div className="dbs-table-container">


                    <div className="dbs-empty-state">


                        <HelpCircle className="dbs-empty-state-icon" />


                        <div className="dbs-empty-state-title">

                            No Records Found

                        </div>


                        <div className="dbs-empty-state-desc">

                            Add attendance posting dates using the form above.

                        </div>


                    </div>



                    {/* When data available use below table */}

                    {/*
                    <table className="dbs-data-table">

                        <thead>

                            <tr>

                                <th>Academic Year</th>
                                <th>Course</th>
                                <th>Studying Year</th>
                                <th>Semester</th>
                                <th>A Y Start Date</th>
                                <th>Attendance Stop Date</th>
                                <th>A Y End Date</th>
                                <th>Old Dates</th>
                                <th>Edit</th>
                                <th>Delete</th>

                            </tr>

                        </thead>


                        <tbody>

                            <tr>

                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>

                                <td>

                                    <button className="dbs-btn-edit">

                                        <Edit3 size={14}/>

                                    </button>

                                </td>


                                <td>

                                    <button className="dbs-btn-delete">

                                        <Trash2 size={14}/>

                                    </button>

                                </td>


                            </tr>

                        </tbody>

                    </table>
                    */}


                </div>


            </div>


        </div>

    );

};


export default StopAttendancePostingDates;