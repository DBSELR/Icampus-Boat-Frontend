import React, { useState } from "react";
import { Save, Printer, Edit3, Trash2, HelpCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import "./StudyCertificate.css";

interface StudyCertificateRecord {
    id: number;
    certificateNo: string;
    regNo: string;
    studentName: string;
    programme: string;
    branch: string;
    year: string;
    certificateType: string;
    fromDate: string;
    toDate: string;
}

const StudyCertificate: React.FC = () => {
    const [records, setRecords] = useState<StudyCertificateRecord[]>([]);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [form, setForm] = useState({
        certificateNo: "",
        date: "",
        regNo: "",
        admissionDate: "",
        studentName: "",
        fatherName: "",
        programme: "",
        branch: "",
        year: "",
        fromDate: "",
        certificateType: "",
        toDate: "",
        fromAcademicYear: "",
        toAcademicYear: "",
        conduct: "",
        purpose: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleReset = () => {
        setForm({
            certificateNo: "",
            date: "",
            regNo: "",
            admissionDate: "",
            studentName: "",
            fatherName: "",
            programme: "",
            branch: "",
            year: "",
            fromDate: "",
            certificateType: "",
            toDate: "",
            fromAcademicYear: "",
            toAcademicYear: "",
            conduct: "",
            purpose: "",
        });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        const newRecord: StudyCertificateRecord = {
            id: Date.now(),
            certificateNo: form.certificateNo,
            regNo: form.regNo,
            studentName: form.studentName,
            programme: form.programme,
            branch: form.branch,
            year: form.year,
            certificateType: form.certificateType,
            fromDate: form.fromDate,
            toDate: form.toDate,
        };

        setRecords((prev) => [newRecord, ...prev]);

        toast.success("Study Certificate saved successfully");
        handleReset();
    };

    const handlePrint = (item: StudyCertificateRecord) => {
        toast.info(`Printing certificate for ${item.studentName}`);
        console.log("Print:", item);
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
                    <h2>Study Certificate</h2>
                    <p>Manage student study certificate records</p>
                </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSave} className="dbs-admissions-stepper-form-card">
                <div className="dbs-form-card">

                    <h3>Study Certificate Details</h3>

                    {/* 3 FIELDS PER ROW */}
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
                            <label>Admission Date</label>
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
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                            </select>
                        </div>

                        <div className="dbs-input-box">
                            <label>Certificate Type</label>
                            <select
                                name="certificateType"
                                value={form.certificateType}
                                onChange={handleChange}
                            >
                                <option value="">Select</option>
                                <option>Bonafide</option>
                                <option>Course Completion</option>
                                <option>Study Certificate</option>
                                <option>Conduct Certificate</option>
                            </select>
                        </div>

                        <div className="dbs-input-box">
                            <label>From Date</label>
                            <input type="date" name="fromDate" value={form.fromDate} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>To Date</label>
                            <input type="date" name="toDate" value={form.toDate} onChange={handleChange} />
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
                            <label>Purpose</label>
                            <input name="purpose" value={form.purpose} onChange={handleChange} />
                        </div>

                    </div>

                    {/* ACTIONS */}
                    <div className="dbs-form-actions-row">

                        <button type="button" className="dbs-form-cancel-btn" onClick={handleReset}>
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
                        <h3>Study Certificate Registry</h3>
                        <p>Issued certificates list</p>
                    </div>
                </div>

                <div className="dbs-table-container">

                    {records.length === 0 ? (
                        <div className="dbs-empty-state">
                            <HelpCircle className="dbs-empty-state-icon" />
                            <div className="dbs-empty-state-title">No Records Found</div>
                            <div className="dbs-empty-state-desc">
                                Add study certificate details using the form above
                            </div>
                        </div>
                    ) : (
                        <table className="dbs-data-table">
                            <thead>
                                <tr>
                                    <th>Cert No</th>
                                    <th>Reg No</th>
                                    <th>Student</th>
                                    <th>Programme</th>
                                    <th>Branch</th>
                                    <th>Year</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {records.map((item) => (
                                    <tr key={item.id}>
                                        <td><strong>{item.certificateNo}</strong></td>
                                        <td>{item.regNo}</td>
                                        <td>{item.studentName}</td>
                                        <td>{item.programme}</td>
                                        <td>{item.branch}</td>
                                        <td>{item.year}</td>

                                        <td>
                                            <div className="dbs-table-actions-row">

                                                <button
                                                    className="dbs-table-action-icon-btn dbs-btn-edit"
                                                    onClick={() => handlePrint(item)}
                                                >
                                                    <Printer size={14} />
                                                </button>

                                                <button
                                                    className="dbs-table-action-icon-btn dbs-btn-delete"
                                                    onClick={() => setDeleteId(item.id)}
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
                        <p>Are you sure you want to delete this record?</p>

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

export default StudyCertificate;