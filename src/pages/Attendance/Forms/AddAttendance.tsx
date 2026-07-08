import React, { useState } from "react";
import { Search, RotateCcw, HelpCircle } from "lucide-react";
import "./AddAttendance.css";

interface AttendanceRecord {
    id: number;
    regNo: string;
    studentName: string;
    programme: string;
    branch: string;
    year: string;
    semester: string;
    percentage: string;
}

const AddAttendance: React.FC = () => {

    const [showTable, setShowTable] = useState(false);

    const [records] = useState<AttendanceRecord[]>([
        {
            id: 1,
            regNo: "101",
            studentName: "Student Name 1",
            programme: "B.Tech",
            branch: "CSE",
            year: "2",
            semester: "4",
            percentage: "85%"
        },
        {
            id: 2,
            regNo: "102",
            studentName: "Student Name 2",
            programme: "B.Tech",
            branch: "ECE",
            year: "2",
            semester: "4",
            percentage: "78%"
        }
    ]);


    const handleSearch = () => {
        setShowTable(true);
    };


    const handleReset = () => {
        setShowTable(false);
    };


    return (

        <div className="dbs-groupchange-container">


            {/* HEADER */}

            <div className="dbs-admissions-form-header">

                <div>

                    <h2>ADD ATTENDANCE</h2>

                    <p>Add Student Attendance Details</p>

                </div>

            </div>



            {/* FILTER CARD */}

            <div className="dbs-admissions-stepper-form-card">

                <div className="dbs-form-card">


                    <h3>Attendance Filters</h3>


                    <div className="dbs-timetable-grid">


                        <div className="dbs-input-box">

                            <label>Programme</label>

                            <select>
                                <option>Select Programme</option>
                            </select>

                        </div>



                        <div className="dbs-input-box">

                            <label>Branch</label>

                            <select>
                                <option>Select Branch</option>
                            </select>

                        </div>



                        <div className="dbs-input-box">

                            <label>Year</label>

                            <select>
                                <option>Select Year</option>
                            </select>

                        </div>




                        <div className="dbs-input-box">

                            <label>Semester</label>

                            <select>
                                <option>Select Semester</option>
                            </select>

                        </div>




                        <div className="dbs-input-box">

                            <label>Section</label>

                            <select>
                                <option>Select Section</option>
                            </select>

                        </div>




                        <div className="dbs-input-box dbs-double-select">

                            <label>From & To Percentage</label>

                            <div>

                                <input
                                    type="number"
                                    placeholder="From %"
                                />


                                <input
                                    type="number"
                                    placeholder="To %"
                                />

                            </div>

                        </div>


                    </div>




                    <div className="dbs-form-actions-row">


                        <button
                            className="dbs-form-save-btn"
                            onClick={handleSearch}
                        >

                            <Search size={16}/>

                            Search

                        </button>



                        {/* <button
                            className="dbs-form-delete-btn"
                            onClick={handleReset}
                        >

                            <RotateCcw size={16}/>

                            Reset

                        </button> */}


                    </div>


                </div>


            </div>





            {/* TABLE */}

            <div className="dbs-dashboard-card dbs-datatable-card">


                <div className="dbs-datatable-header-area">

                    <div>

                        <h3>Attendance Details</h3>

                        <p>Student attendance list</p>

                    </div>

                </div>



                <div className="dbs-table-container">


                    {!showTable ? (

                        <div className="dbs-empty-state">

                            <HelpCircle className="dbs-empty-state-icon"/>


                            <div className="dbs-empty-state-title">

                                No Records Found

                            </div>


                            <div className="dbs-empty-state-desc">

                                Apply filters and search to view attendance details.

                            </div>


                        </div>


                    ) : (


                        <table className="dbs-data-table">


                            <thead>

                                <tr>

                                    <th>Reg No</th>

                                    <th>Student Name</th>

                                    <th>Programme</th>

                                    <th>Branch</th>

                                    <th>Year</th>

                                    <th>Semester</th>

                                    <th>Percentage</th>

                                </tr>

                            </thead>



                            <tbody>

                                {records.map((item) => (

                                    <tr key={item.id}>

                                        <td>{item.regNo}</td>

                                        <td>{item.studentName}</td>

                                        <td>{item.programme}</td>

                                        <td>{item.branch}</td>

                                        <td>{item.year}</td>

                                        <td>{item.semester}</td>

                                        <td>{item.percentage}</td>

                                    </tr>

                                ))}

                            </tbody>


                        </table>


                    )}


                </div>


            </div>


        </div>

    );

};


export default AddAttendance;