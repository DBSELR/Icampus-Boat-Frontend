import React from "react";
import { Save, RotateCcw } from "lucide-react";
import "./BatchesMH.css";

const BatchesMH: React.FC = () => {

    return (

        <div className="dbs-groupchange-container">

            <div className="dbs-admissions-form-header">

                <div>
                    <h2>BATCHES_MH</h2>
                    <p>Manage Batch Details</p>
                </div>

            </div>


            <div className="dbs-admissions-stepper-form-card">

                <div className="dbs-form-card">

                    <h3>Batches Management</h3>


                    <div className="dbs-timetable-grid">


                        {/* Row 1 */}

                        <div className="dbs-input-box dbs-double-select">

                            <label>Regulation & Batch</label>

                            <div>

                                <select>
                                    <option>Select Regulation</option>
                                </select>

                                <select>
                                    <option>Select Batch</option>
                                </select>

                            </div>

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



                        {/* Row 2 */}

                        <div className="dbs-input-box">

                            <label>Programme</label>

                            <select>
                                <option>Select Programme</option>
                            </select>

                        </div>



                        <div className="dbs-input-box">

                            <label>Subtype</label>

                            <select>
                                <option>Select Subtype</option>
                            </select>

                        </div>



                        {/* Row 3 */}

                        <div className="dbs-input-box">

                            <label>Branch</label>

                            <select>
                                <option>Select Branch</option>
                            </select>

                        </div>



                        <div className="dbs-input-box">

                            <label>Day</label>

                            <select>
                                <option>Select Day</option>
                            </select>

                        </div>



                        {/* Row 4 */}

                        <div className="dbs-input-box">

                            <label>Period</label>

                            <select>
                                <option>Select Period</option>
                            </select>

                        </div>



                        <div className="dbs-input-box">

                            <label>Subject(s)</label>

                            <select>
                                <option>Select Subject(s)</option>
                            </select>

                        </div>



                        {/* Row 5 */}

                        <div className="dbs-input-box">

                            <label>Lecturer</label>

                            <select>
                                <option>Select Lecturer</option>
                            </select>

                        </div>



                        <div className="dbs-input-box">

                            <label>Batch Count</label>

                            <input
                                type="text"
                                placeholder="Enter Batch Count"
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

                            Clear

                        </button>


                    </div>


                </div>

            </div>

        </div>

    );

};


export default BatchesMH;