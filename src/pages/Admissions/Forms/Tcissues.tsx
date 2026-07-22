import React, { useState } from "react";
import { Save, Edit3, Trash2, HelpCircle, AlertTriangle, Printer } from "lucide-react";
import { toast } from "sonner";
import "./Tcissues.css";

interface TcRecord {
    id: number;
    regNo: string;
    tcNo: string;
    studentName: string;
    fatherName: string;
    dob: string;
    religion: string;
    caste: string;
    subCaste: string;
    classOfLeaving: string;
    course: string;
    branch: string;
    nationality: string;
    motherTongue: string;
    tcDate: string;
    conduct: string;
    reasonForLeaving: string;
    dateOfLeaving: string;
    mole1: string;
    mole2: string;
    qualifiedNextCourse: string;
    scholarship: string;
    university: string;
}

const TcIssue: React.FC = () => {
    const [records, setRecords] = useState<TcRecord[]>([]);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [form, setForm] = useState({
        regNo: "",
        tcNo: "",
        admissionDate: "",
        studentName: "",
        fatherName: "",
        dob: "",
        religion: "",
        caste: "",
        subCaste: "",
        classOfLeaving: "",
        course: "",
        branch: "",
        nationality: "",
        motherTongue: "",
        tcDate: "",
        conduct: "",
        reasonForLeaving: "",
        dateOfLeaving: "",
        mole1: "",
        mole2: "",
        qualifiedNextCourse: "",
        scholarship: "",
        university: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setForm({
            regNo: "",
            tcNo: "",
            admissionDate: "",
            studentName: "",
            fatherName: "",
            dob: "",
            religion: "",
            caste: "",
            subCaste: "",
            classOfLeaving: "",
            course: "",
            branch: "",
            nationality: "",
            motherTongue: "",
            tcDate: "",
            conduct: "",
            reasonForLeaving: "",
            dateOfLeaving: "",
            mole1: "",
            mole2: "",
            qualifiedNextCourse: "",
            scholarship: "",
            university: "",
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newRecord: TcRecord = {
            id: Date.now(),
            ...form,
        };

        setRecords((prev) => [newRecord, ...prev]);

        toast.success("TC Issued Successfully");
        resetForm();
    };

    const handleDelete = () => {
        if (deleteId) {
            setRecords(records.filter((r) => r.id !== deleteId));
            toast.success("Record deleted successfully");
            setDeleteId(null);
        }
    };

    return (
        <div className="dbs-groupchange-container">

            {/* HEADER */}
            <div className="dbs-admissions-form-header">
                <div>
                    <h2>Transfer Certificate</h2>
                    <p>Manage student TC issuance records</p>
                </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="dbs-admissions-stepper-form-card">
                <div className="dbs-form-card">

                    <h3>TC Issue Details</h3>

                    {/* 3 FIELDS PER ROW */}
                    <div className="dbs-form-grid-3">

                        <div className="dbs-input-box">
                            <label>Reg No</label>
                            <input name="regNo" value={form.regNo} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>TC No</label>
                            <input name="tcNo" value={form.tcNo} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>Date of Admission</label>
                            <input type="date" name="admissionDate" value={form.admissionDate} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>Student Name</label>
                            <input name="studentName" value={form.studentName} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>Father Name</label>
                            <input name="fatherName" value={form.fatherName} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>DOB</label>
                            <input type="date" name="dob" value={form.dob} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>Religion</label>
                            <input name="religion" value={form.religion} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>Caste</label>
                            <input name="caste" value={form.caste} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>Sub Caste</label>
                            <input name="subCaste" value={form.subCaste} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>Class of Leaving</label>
                            <input name="classOfLeaving" value={form.classOfLeaving} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>Course</label>
                            <input name="course" value={form.course} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>Branch</label>
                            <input name="branch" value={form.branch} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>Nationality</label>
                            <input name="nationality" value={form.nationality} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>Mother Tongue</label>
                            <input name="motherTongue" value={form.motherTongue} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>TC Date</label>
                            <input type="date" name="tcDate" value={form.tcDate} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>Conduct</label>
                            <select
                                name="conduct"
                                value={form.conduct}
                                onChange={handleChange}
                            >
                                <option value="">Select</option>
                                <option>Excellent</option>
                                <option>Very Good</option>
                                <option>Good</option>
                                <option>Satisfactory</option>
                                <option>Average</option>
                                <option>Poor</option>
                            </select>
                        </div>

                        <div className="dbs-input-box">
                            <label>Date of Leaving</label>
                            <input type="date" name="dateOfLeaving" value={form.dateOfLeaving} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>Mole 1</label>
                            <input name="mole1" value={form.mole1} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>Mole 2</label>
                            <input name="mole2" value={form.mole2} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>Qualified Next Course</label>
                            <select
                                name="qualifiedNextCourse"
                                value={form.qualifiedNextCourse}
                                onChange={handleChange}
                            >
                                <option value="">Select</option>
                                <option>Yes</option>
                                <option>No</option>
                                <option>Eligible</option>
                                <option>Not Eligible</option>
                            </select>
                        </div>

                        <div className="dbs-input-box">
                            <label>Scholarship</label>
                            <select
                                name="scholarship"
                                value={form.scholarship}
                                onChange={handleChange}
                            >
                                <option value="">Select</option>
                                <option>Yes</option>
                                <option>No</option>
                                <option>Fee Reimbursement</option>
                                <option>Merit Scholarship</option>
                            </select>
                        </div>

                        <div className="dbs-input-box">
                            <label>University</label>
                            <select
                                name="university"
                                value={form.university}
                                onChange={handleChange}
                            >
                                <option value="">Select</option>
                                <option>JNTUK</option>
                                <option>JNTUH</option>
                                <option>ANU</option>
                                <option>AU</option>
                                <option>SVU</option>
                            </select>
                        </div>

                    </div>
                    <div className="dbs-form-actions-row">

                        <button type="button" className="dbs-form-cancel-btn" onClick={resetForm}>
                            Cancel
                        </button>

                        <button type="submit" className="dbs-form-save-btn">
                            <Save size={16} />
                            Save
                        </button>

                        <button type="button" className="dbs-form-reprint-btn">
                            <Printer size={16} />
                            Reprint
                        </button>

                    </div>

                </div>
            </form>

            {/* TABLE */}
            <div className="dbs-dashboard-card dbs-datatable-card">

                <div className="dbs-datatable-header-area">
                    <div>
                        <h3>TC Registry</h3>
                        <p>All issued transfer certificates</p>
                    </div>
                </div>

                <div className="dbs-table-container">

                    {records.length === 0 ? (
                        <div className="dbs-empty-state">
                            <HelpCircle className="dbs-empty-state-icon" />
                            <div className="dbs-empty-state-title">No TC Records Found</div>
                            <div className="dbs-empty-state-desc">
                                Submit TC form to see records here
                            </div>
                        </div>
                    ) : (
                        <table className="dbs-data-table">
                            <thead>
                                <tr>
                                    <th>Reg No</th>
                                    <th>TC No</th>
                                    <th>Name</th>
                                    <th>Course</th>
                                    <th>Branch</th>
                                    <th>TC Date</th>
                                    <th>Leaving Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {records.map((r) => (
                                    <tr key={r.id}>
                                        <td><strong>{r.regNo}</strong></td>
                                        <td>{r.tcNo}</td>
                                        <td>{r.studentName}</td>
                                        <td>{r.course}</td>
                                        <td>{r.branch}</td>
                                        <td>{r.tcDate}</td>
                                        <td>{r.dateOfLeaving}</td>

                                        <td>
                                            <div className="dbs-table-actions-row">
                                                <button className="dbs-btn-edit">
                                                    <Edit3 size={14} />
                                                </button>

                                                <button
                                                    className="dbs-btn-delete"
                                                    onClick={() => setDeleteId(r.id)}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                </div>
            </div>

            {/* DELETE MODAL */}
            {deleteId && (
                <div className="dbs-search-overlay-modal">
                    <div className="dbs-search-modal-box dbs-confirm-modal-box">

                        <AlertTriangle size={36} />

                        <h3>Delete Record?</h3>
                        <p>Are you sure you want to delete this TC record?</p>

                        <div className="dbs-confirm-modal-actions">
                            <button onClick={() => setDeleteId(null)}>Cancel</button>
                            <button onClick={handleDelete}>Delete</button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default TcIssue;