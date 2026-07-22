import React, { useState } from "react";
import { Save, Edit3, Trash2, HelpCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import "./Group_change.css";

interface GroupChangeRecord {
    id: number;
    sname: string;
    course: string;
    branch: string;
    year: string;
    section: string;
    date: string;
    oldRegno: string;
    regno: string;
}

const GroupChange: React.FC = () => {
    const [records, setRecords] = useState<GroupChangeRecord[]>([]);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [form, setForm] = useState({
        receiptNo: "",
        date: "",
        admNo: "",
        courseBranch: "",
        regNo: "",
        year: "",
        studentName: "",
        changedBranch: "",
        rollNo: "",
        section: "",
        newRegNo: "",
        remarks: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleReset = () => {
        setForm({
            receiptNo: "",
            date: "",
            admNo: "",
            courseBranch: "",
            regNo: "",
            year: "",
            studentName: "",
            changedBranch: "",
            rollNo: "",
            section: "",
            newRegNo: "",
            remarks: "",
        });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        const newRecord: GroupChangeRecord = {
            id: Date.now(),
            sname: form.studentName,
            course: "B.Tech",
            branch: form.changedBranch,
            year: form.year,
            section: form.section,
            date: form.date,
            oldRegno: form.admNo,
            regno: form.newRegNo,
        };

        setRecords((prev) => [newRecord, ...prev]);
        toast.success("Group Change saved successfully");
        handleReset();
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
                    <h2>Group Change</h2>
                    <p>Manage student branch / group transfer records</p>
                </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSave} className="dbs-admissions-stepper-form-card">
                <div className="dbs-form-card">

                    <h3>Student Group Change Details</h3>

                    {/* ✅ NOW 3 FIELDS PER ROW */}
                    <div className="dbs-form-grid-3">

                        <div className="dbs-input-box">
                            <label>Receipt No</label>
                            <input name="receiptNo" value={form.receiptNo} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>Date</label>
                            <input type="date" name="date" value={form.date} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>Adm No / Reg No</label>
                            <input name="admNo" value={form.admNo} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>Course & Branch</label>
                            <input name="courseBranch" value={form.courseBranch} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>Reg No</label>
                            <input name="regNo" value={form.regNo} onChange={handleChange} />
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
                            <label>Student Name</label>
                            <input name="studentName" value={form.studentName} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>Changed Branch</label>
                            <select
                                name="changedBranch"
                                value={form.changedBranch}
                                onChange={handleChange}
                            >
                                <option value="">Select Branch</option>
                                <option value="Head Office">Head Office</option>
                                <option value="Vijayawada">Vijayawada</option>
                                <option value="Eluru">Eluru</option>
                                <option value="Hyderabad">Hyderabad</option>
                            </select>
                        </div>

                        <div className="dbs-input-box">
                            <label>Roll No</label>
                            <input name="rollNo" value={form.rollNo} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>Section</label>
                            <select
                                name="section"
                                value={form.section}
                                onChange={handleChange}
                            >
                                <option value="">Select Section</option>
                                <option value="Accounts">Accounts</option>
                                <option value="HR">HR</option>
                                <option value="IT">IT</option>
                                <option value="Sales">Sales</option>
                                <option value="Support">Support</option>
                            </select>
                        </div>

                        <div className="dbs-input-box">
                            <label>New Reg No</label>
                            <input name="newRegNo" value={form.newRegNo} onChange={handleChange} />
                        </div>

                        <div className="dbs-input-box">
                            <label>Remarks</label>
                            <textarea name="remarks" value={form.remarks} onChange={handleChange} />
                        </div>

                    </div>

                    <div className="dbs-form-actions-row">
                        <button type="button" className="dbs-form-cancel-btn" onClick={handleReset}>
                            Cancel
                        </button>

                        <button type="submit" className="dbs-form-save-btn">
                            <Save size={16} />
                            Save
                        </button>
                    </div>

                </div>
            </form>

            {/* TABLE */}
            <div className="dbs-dashboard-card dbs-datatable-card">

                <div className="dbs-datatable-header-area">
                    <div>
                        <h3>Group Change Registry</h3>
                        <p>Student transfer history records</p>
                    </div>
                </div>

                <div className="dbs-table-container">

                    {records.length === 0 ? (
                        <div className="dbs-empty-state">
                            <HelpCircle className="dbs-empty-state-icon" />
                            <div className="dbs-empty-state-title">
                                No Group Change Records Found
                            </div>
                            <div className="dbs-empty-state-desc">
                                Add student group changes using the form above.
                            </div>
                        </div>
                    ) : (
                        <table className="dbs-data-table">
                            <thead>
                                <tr>
                                    <th>SName</th>
                                    <th>Course</th>
                                    <th>Branch</th>
                                    <th>Year</th>
                                    <th>Section</th>
                                    <th>Date</th>
                                    <th>Old RegNo</th>
                                    <th>RegNo</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {records.map((item) => (
                                    <tr key={item.id}>
                                        <td><strong>{item.sname}</strong></td>
                                        <td>{item.course}</td>
                                        <td className="dbs-branch-td">{item.branch}</td>
                                        <td>Year {item.year}</td>
                                        <td>{item.section}</td>
                                        <td>{item.date}</td>
                                        <td>{item.oldRegno}</td>
                                        <td><strong>{item.regno}</strong></td>

                                        <td>
                                            <div className="dbs-table-actions-row">
                                                <button className="dbs-table-action-icon-btn dbs-btn-edit">
                                                    <Edit3 size={14} />
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
                            <button onClick={() => setDeleteId(null)}>
                                Cancel
                            </button>
                            <button onClick={handleDelete}>
                                Delete
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default GroupChange;