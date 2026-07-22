import React, { useState } from "react";
import { Save, Edit3, Trash2, HelpCircle, AlertTriangle, Printer } from "lucide-react";
import { toast } from "sonner";
import "./Bonafide.css";

interface BonafideRecord {
    id: number;
    regNo: string;
    studentName: string;
    programme: string;
    branch: string;
    year: string;
    purpose: string;
    academicYear: string;
}

const BonafideCertificate: React.FC = () => {
    const [records, setRecords] = useState<BonafideRecord[]>([]);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [form, setForm] = useState({
        certificateNo: "",
        date: "",
        regNo: "",
        dob: "",
        studentName: "",
        fatherName: "",
        programme: "",
        branch: "",
        year: "",
        semester: "",
        purpose: "",
        courseCompletion: "",
        address: "",
        academicYear: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setForm({
            certificateNo: "",
            date: "",
            regNo: "",
            dob: "",
            studentName: "",
            fatherName: "",
            programme: "",
            branch: "",
            year: "",
            semester: "",
            purpose: "",
            courseCompletion: "",
            address: "",
            academicYear: "",
        });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        const newRecord: BonafideRecord = {
            id: Date.now(),
            regNo: form.regNo,
            studentName: form.studentName,
            programme: form.programme,
            branch: form.branch,
            year: form.year,
            purpose: form.purpose,
            academicYear: form.academicYear,
        };

        setRecords((prev) => [newRecord, ...prev]);
        toast.success("Bonafide Certificate Saved");
        resetForm();
    };

    const handleDelete = () => {
        if (deleteId) {
            setRecords(records.filter((r) => r.id !== deleteId));
            toast.success("Deleted Successfully");
            setDeleteId(null);
        }
    };

    return (
        <div className="dbs-groupchange-container">

            {/* HEADER */}
            <div className="dbs-admissions-form-header">
                <div>
                    <h2>Bonafide Certificate</h2>
                    <p>Manage student bonafide certificate records</p>
                </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSave} className="dbs-admissions-stepper-form-card">
                <div className="dbs-form-card">

                    <h3>Bonafide Details</h3>

                    <div className="dbs-form-grid-3">

                        <div className="dbs-input-box">
                            <label>Certificate No</label>
                            <input name="certificateNo" value={form.certificateNo} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>Date</label>
                            <input type="date" name="date" value={form.date} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>Reg No</label>
                            <input name="regNo" value={form.regNo} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>DOB</label>
                            <input type="date" name="dob" value={form.dob} onChange={handleChange} />
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
                            <label>Programme</label>
                            <input name="programme" value={form.programme} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>Branch</label>
                            <input name="branch" value={form.branch} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>Year</label>
                            <select name="year" value={form.year} onChange={handleChange}>
                                <option value="">Select</option>
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                                <option>4</option>
                            </select>
                        </div>

                        <div className="dbs-input-box">
                            <label>Semester</label>
                            <select name="semester" value={form.semester} onChange={handleChange}>
                                <option value="">Select</option>
                                <option>1</option>
                                <option>2</option>
                            </select>
                        </div>

                        <div className="dbs-input-box">
                            <label>Purpose</label>
                            <input name="purpose" value={form.purpose} onChange={handleChange} />
                        </div>

                        {/* ✅ NOT TEXTAREA */}
                        <div className="dbs-input-box">
                            <label>Course Completion</label>
                            <select name="courseCompletion" value={form.courseCompletion} onChange={handleChange}>
                                <option value="">Select</option>
                                <option>Completed</option>
                                <option>Not Completed</option>
                            </select>
                        </div>

                        <div className="dbs-input-box">
                            <label>Address</label>
                            <input name="address" value={form.address} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>Academic Year</label>
                            <input name="academicYear" value={form.academicYear} onChange={handleChange} />
                        </div>

                    </div>

                    {/* ACTIONS */}
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
                        <h3>Bonafide Registry</h3>
                        <p>Issued certificates history</p>
                    </div>
                </div>

                <div className="dbs-table-container">

                    {records.length === 0 ? (
                        <div className="dbs-empty-state">
                            <HelpCircle className="dbs-empty-state-icon" />
                            <div className="dbs-empty-state-title">
                                No Records Found
                            </div>
                            <div className="dbs-empty-state-desc">
                                Add Bonafide Certificate details using the form above.
                            </div>
                        </div>
                    ) : (
                        <table className="dbs-data-table">
                            <thead>
                                <tr>
                                    <th>Reg No</th>
                                    <th>Name</th>
                                    <th>Programme</th>
                                    <th>Branch</th>
                                    <th>Year</th>
                                    <th>Purpose</th>
                                    <th>Academic Year</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {records.map((r) => (
                                    <tr key={r.id}>
                                        <td>{r.regNo}</td>
                                        <td>{r.studentName}</td>
                                        <td>{r.programme}</td>
                                        <td>{r.branch}</td>
                                        <td>{r.year}</td>
                                        <td>{r.purpose}</td>
                                        <td>{r.academicYear}</td>

                                        <td>
                                            <button className="dbs-btn-edit">
                                                <Edit3 size={14} />
                                            </button>

                                            <button className="dbs-btn-delete" onClick={() => setDeleteId(r.id)}>
                                                <Trash2 size={14} />
                                            </button>
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

                        <AlertTriangle size={30} />
                        <h3>Delete?</h3>

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

export default BonafideCertificate;