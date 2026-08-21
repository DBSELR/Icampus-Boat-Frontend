import React, { useEffect, useState } from "react";
import { Save, Edit3, Trash2, Search, RefreshCw, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import "./Group_change.css";
import {
    loadGroupChangeData,
    getStudentGroupDetails,
    getSectionsForBranch,
    validateNewRegNo,
    saveGroupChange,
    deleteGroupChange
} from "../../../apis/AdmissionsApis";
import Footer from "../../../common/Footer";

interface BranchOption {
    BranchCode: string;
    BRNAME: string;
}

interface SectionOption {
    SECTION: string;
}

interface BranchChangeRecord {
    Hid: string;
    Date: string;
    ReceiptNo: string;
    SSNO: string;
    Regno: string;
    StudentName: string;
    Course: string;
    Branch: string;
    ChangedGroup: string;
    Section: string;
    Year: string;
    NewRegno: string;
    Remarks?: string;
    [key: string]: any;
}

const GroupChange: React.FC = () => {
    const academicYear = localStorage.getItem("academicYear") || "2025-2026";

    // Form state
    const [form, setForm] = useState({
        hid: "0",
        receiptNo: "",
        date: new Date().toISOString().split("T")[0],
        admNo: "",
        courseBranchDisplay: "",
        courseCode: "",
        branchCode: "",
        regNo: "",
        year: "",
        studentName: "",
        changedBranch: "",
        rollNo: "",
        section: "",
        newRegNo: "",
        remarks: "",
    });

    // Dynamic dropdown lists
    const [branchesList, setBranchesList] = useState<BranchOption[]>([]);
    const [sectionsList, setSectionsList] = useState<SectionOption[]>([]);

    // Datatable state
    const [records, setRecords] = useState<BranchChangeRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchingStudent, setSearchingStudent] = useState<boolean>(false);
    const [validatingRegNo, setValidatingRegNo] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Datatable filtering & pagination
    const [tableSearch, setTableSearch] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [recordsPerPage, setRecordsPerPage] = useState<number>(5);

    // Load initial data (Auto receipt no, Branch change records, Default date)
    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const res = await loadGroupChangeData(academicYear);
            if (res.success && res.data) {
                setRecords(res.data.branchChangeList || []);
                setForm(prev => ({
                    ...prev,
                    receiptNo: res.data.autoReceiptNo || prev.receiptNo,
                    date: res.data.defaultDate || prev.date
                }));
            }
        } catch (error) {
            toast.error("Failed to load group change records.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, [academicYear]);

    // Handle student lookup by Admission/Registration No.
    const handleSearchStudent = async () => {
        const queryNo = form.admNo.trim();
        if (!queryNo) {
            toast.warning("Please enter an Admission or Registration Number.");
            return;
        }

        setSearchingStudent(true);
        try {
            const res = await getStudentGroupDetails(queryNo);
            if (res.success && res.student) {
                const s = res.student;
                setForm(prev => ({
                    ...prev,
                    studentName: s.studentName || "",
                    regNo: s.registrationNo || queryNo,
                    courseBranchDisplay: s.courseDisplay || "",
                    courseCode: s.courseCode || "",
                    branchCode: s.branchCode || "",
                    year: s.studyingYear || "",
                    changedBranch: "",
                    section: "",
                    newRegNo: ""
                }));
                setBranchesList(res.branches || []);
                setSectionsList([]);
                toast.success(`Student profile found: ${s.studentName}`);
            } else {
                toast.error(res.message || "SSNO not exist in StudentData.");
                setForm(prev => ({
                    ...prev,
                    studentName: "",
                    courseBranchDisplay: "",
                    courseCode: "",
                    branchCode: "",
                    regNo: "",
                    year: "",
                    changedBranch: "",
                    section: "",
                    newRegNo: ""
                }));
                setBranchesList([]);
                setSectionsList([]);
            }
        } catch (error) {
            toast.error("Error fetching student details.");
        } finally {
            setSearchingStudent(false);
        }
    };

    // Handle changed branch selection -> load available sections
    const handleBranchChangeSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedBranch = e.target.value;
        setForm(prev => ({ ...prev, changedBranch: selectedBranch, section: "" }));

        if (!selectedBranch) {
            setSectionsList([]);
            return;
        }

        try {
            const res = await getSectionsForBranch(
                academicYear,
                form.courseCode,
                selectedBranch,
                form.year
            );
            if (res.success) {
                setSectionsList(res.data || []);
            }
        } catch (error) {
            toast.error("Failed to load sections for selected branch.");
        }
    };

    // Validate new registration number uniqueness on blur
    const handleNewRegNoBlur = async () => {
        const newNo = form.newRegNo.trim();
        if (!newNo || !form.courseCode || !form.year) return;

        setValidatingRegNo(true);
        try {
            const res = await validateNewRegNo(academicYear, form.courseCode, form.year, newNo);
            if (res.exists) {
                toast.warning(`Registration No ${newNo} already exists!`);
                setForm(prev => ({ ...prev, newRegNo: "" }));
            }
        } catch (error) {
            console.error("New RegNo validation error", error);
        } finally {
            setValidatingRegNo(false);
        }
    };

    // Handle form field change
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // Reset Form
    const handleReset = () => {
        setForm({
            hid: "0",
            receiptNo: "",
            date: new Date().toISOString().split("T")[0],
            admNo: "",
            courseBranchDisplay: "",
            courseCode: "",
            branchCode: "",
            regNo: "",
            year: "",
            studentName: "",
            changedBranch: "",
            rollNo: "",
            section: "",
            newRegNo: "",
            remarks: "",
        });
        setBranchesList([]);
        setSectionsList([]);
        fetchInitialData();
    };

    // Save or Update Branch Change
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.admNo && !form.regNo) {
            toast.warning("Please enter and verify Admission/Registration No.");
            return;
        }

        if (!form.studentName) {
            toast.warning("Student details must be loaded before saving.");
            return;
        }

        if (!form.changedBranch) {
            toast.warning("Please select a target Changed Branch.");
            return;
        }

        if (!form.section) {
            toast.warning("Please select a Section.");
            return;
        }

        if (!form.newRegNo) {
            toast.warning("Please enter a New Registration Number.");
            return;
        }

        const payload = {
            hid: form.hid,
            date: form.date,
            receiptNo: form.receiptNo,
            regNo: form.regNo || form.admNo,
            studentName: form.studentName,
            course: form.courseCode,
            branch: form.branchCode,
            changedGroup: form.changedBranch,
            rollNo: form.rollNo,
            section: form.section,
            academicYear: academicYear,
            year: form.year,
            newRegNo: form.newRegNo,
            remarks: form.remarks
        };

        try {
            const res = await saveGroupChange(payload);
            if (res.success) {
                toast.success(res.message || "Group Change saved successfully!");
                handleReset();
            } else {
                toast.error(res.message || "Failed to save group change details.");
            }
        } catch (error) {
            toast.error("Server error while saving group change.");
        }
    };

    // Populate record for editing
    const handleEdit = async (record: BranchChangeRecord) => {
        const regNumber = record.Regno || record.SSNO || "";
        setForm(prev => ({
            ...prev,
            hid: record.Hid ? String(record.Hid) : "0",
            receiptNo: record.ReceiptNo || "",
            date: record.Date || prev.date,
            admNo: regNumber,
            regNo: regNumber,
            studentName: record.StudentName || "",
            courseBranchDisplay: `${record.Course || ""}-${record.Branch || ""}`,
            courseCode: record.Course || "",
            branchCode: record.Branch || "",
            year: record.Year || "",
            changedBranch: record.ChangedGroup || "",
            section: record.Section || "",
            newRegNo: record.NewRegno || "",
            remarks: record.Remarks || ""
        }));

        // Load available branches for this student's course
        if (regNumber) {
            try {
                const res = await getStudentGroupDetails(regNumber);
                if (res.success && res.branches) {
                    setBranchesList(res.branches);
                }
                if (record.ChangedGroup && res.student?.courseCode && record.Year) {
                    const secRes = await getSectionsForBranch(
                        academicYear,
                        res.student.courseCode,
                        record.ChangedGroup,
                        record.Year
                    );
                    if (secRes.success) setSectionsList(secRes.data || []);
                }
            } catch (err) {
                console.error("Error loading edit dropdowns", err);
            }
        }

        toast.info(`Editing group change for ${record.StudentName}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Execute Delete
    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            const res = await deleteGroupChange(deleteId);
            if (res.success) {
                toast.success("Record deleted successfully.");
                setDeleteId(null);
                fetchInitialData();
            } else {
                toast.error(res.message || "Failed to delete record.");
            }
        } catch (error) {
            toast.error("Error deleting group change record.");
        }
    };

    // Live datatable filtering & pagination calculations
    const filteredRecords = records.filter(r => {
        const query = tableSearch.toLowerCase();
        return (
            (r.StudentName || "").toLowerCase().includes(query) ||
            (r.Regno || "").toLowerCase().includes(query) ||
            (r.NewRegno || "").toLowerCase().includes(query) ||
            (r.ChangedGroup || "").toLowerCase().includes(query)
        );
    });

    const totalRecords = filteredRecords.length;
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = Math.min(startIndex + recordsPerPage, totalRecords);
    const currentItems = filteredRecords.slice(startIndex, endIndex);

    const getPagination = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 4) {
                pages.push(1, 2, 3, 4, 5, "...", totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="dbs-groupchange-container">

            {/* HEADER */}
            <div className="dbs-groupchange-form-header">
                <div>
                    <h2>Student Group Change / Branch Transfer Console</h2>
                    <p>Manage academic branch transfers, section allocations, and registry updates</p>
                </div>
                <div className="dbs-header-badge">
                    <span>Academic Year: <strong>{academicYear}</strong></span>
                </div>
            </div>

            {/* FORM CARD */}
            <form onSubmit={handleSave} className="dbs-form-card">
                <h3>Student Group Change Details</h3>

                <div className="dbs-form-grid-3">

                    {/* Receipt No */}
                    <div className="dbs-input-box">
                        <label>Receipt No (Auto)</label>
                        <input
                            name="receiptNo"
                            value={form.receiptNo}
                            readOnly
                            placeholder="Auto Generated"
                            style={{ backgroundColor: "var(--dbs-background)", fontWeight: 600 }}
                        />
                    </div>

                    {/* Date */}
                    <div className="dbs-input-box">
                        <label>Date *</label>
                        <input
                            type="text"
                            name="date"
                            value={form.date}
                            onChange={handleChange}
                            placeholder="dd-MM-yyyy"
                        />
                    </div>

                    {/* Adm No / Reg No Lookup */}
                    <div className="dbs-input-box">
                        <label>Adm No / Reg No *</label>
                        <div className="dbs-search-input-group">
                            <input
                                name="admNo"
                                value={form.admNo}
                                onChange={handleChange}
                                onBlur={() => { if (form.admNo && !form.studentName) handleSearchStudent(); }}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearchStudent(); } }}
                                placeholder="Enter Registration No."
                            />
                            <button
                                type="button"
                                className="dbs-input-search-btn"
                                onClick={handleSearchStudent}
                                disabled={searchingStudent}
                                title="Fetch Student Profile"
                            >
                                {searchingStudent ? <RefreshCw size={14} className="dbs-spin" /> : <Search size={14} />}
                            </button>
                        </div>
                    </div>

                    {/* Student Name */}
                    <div className="dbs-input-box">
                        <label>Student Name</label>
                        <input
                            name="studentName"
                            value={form.studentName}
                            readOnly
                            placeholder="Auto Fetched Student Name"
                            style={{ backgroundColor: "var(--dbs-background)", fontWeight: 600 }}
                        />
                    </div>

                    {/* Course & Branch Display */}
                    <div className="dbs-input-box">
                        <label>Current Course & Branch</label>
                        <input
                            name="courseBranchDisplay"
                            value={form.courseBranchDisplay}
                            readOnly
                            placeholder="Current Academic Stream"
                            style={{ backgroundColor: "var(--dbs-background)" }}
                        />
                    </div>

                    {/* Reg No */}
                    <div className="dbs-input-box">
                        <label>Original Reg No</label>
                        <input
                            name="regNo"
                            value={form.regNo}
                            readOnly
                            style={{ backgroundColor: "var(--dbs-background)" }}
                        />
                    </div>

                    {/* Year */}
                    <div className="dbs-input-box">
                        <label>Studying Year *</label>
                        <select name="year" value={form.year} onChange={handleChange}>
                            <option value="">Select Year</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                        </select>
                    </div>

                    {/* Changed Branch */}
                    <div className="dbs-input-box">
                        <label>Changed Branch *</label>
                        <select
                            name="changedBranch"
                            value={form.changedBranch}
                            onChange={handleBranchChangeSelect}
                        >
                            <option value="">Select Target Branch</option>
                            {branchesList.map((b, idx) => (
                                <option key={idx} value={b.BranchCode}>
                                    {b.BRNAME}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Roll No */}
                    <div className="dbs-input-box">
                        <label>Roll No</label>
                        <input
                            name="rollNo"
                            value={form.rollNo}
                            onChange={handleChange}
                            placeholder="Optional Roll No"
                        />
                    </div>

                    {/* Section */}
                    <div className="dbs-input-box">
                        <label>Section *</label>
                        <select
                            name="section"
                            value={form.section}
                            onChange={handleChange}
                        >
                            <option value="">Select Section</option>
                            {sectionsList.length > 0 ? (
                                sectionsList.map((s, idx) => (
                                    <option key={idx} value={s.SECTION}>
                                        Section {s.SECTION}
                                    </option>
                                ))
                            ) : (
                                <>
                                    <option value="A">Section A</option>
                                    <option value="B">Section B</option>
                                    <option value="C">Section C</option>
                                    <option value="D">Section D</option>
                                </>
                            )}
                        </select>
                    </div>

                    {/* New Reg No */}
                    <div className="dbs-input-box">
                        <label>New Reg No *</label>
                        <input
                            name="newRegNo"
                            value={form.newRegNo}
                            onChange={handleChange}
                            onBlur={handleNewRegNoBlur}
                            placeholder="New Allocated Reg No"
                        />
                    </div>

                    {/* Remarks */}
                    <div className="dbs-input-box dbs-grid-col-span-2">
                        <label>Remarks</label>
                        <textarea
                            name="remarks"
                            value={form.remarks}
                            onChange={handleChange}
                            placeholder="Transfer reason or administrative notes..."
                            rows={2}
                        />
                    </div>

                </div>

                <div className="dbs-form-actions-row">
                    <button type="button" className="dbs-form-cancel-btn" onClick={handleReset}>
                        Reset / Cancel
                    </button>

                    <button type="submit" className="dbs-form-save-btn">
                        <Save size={16} />
                        <span>{form.hid !== "0" ? "Update Record" : "Save Branch Change"}</span>
                    </button>
                </div>
            </form>

            {/* REACTIVE TABLE GRID */}
            <div className="dbs-table-container">
                <div className="dbs-table-header-row">
                    <div>
                        <h3>Active Group Change Registry</h3>
                        <p className="dbs-table-sub">Showing {filteredRecords.length} records</p>
                    </div>

                    <div className="dbs-table-search-wrapper">
                        <Search size={16} className="dbs-table-search-icon" />
                        <input
                            type="text"
                            placeholder="Search name, Reg No, or Branch..."
                            value={tableSearch}
                            onChange={(e) => {
                                setTableSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="dbs-table-search-input"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="dbs-empty-state">
                        <RefreshCw size={28} className="dbs-spin dbs-empty-state-icon" />
                        <div className="dbs-empty-state-title">Loading registry data...</div>
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <div className="dbs-empty-state">
                        <AlertCircle className="dbs-empty-state-icon" />
                        <div className="dbs-empty-state-title">No records found</div>
                        <div className="dbs-empty-state-desc">No group change records match your search query.</div>
                    </div>
                ) : (
                    <div className="dbs-table-card">
                        <div className="dbs-table-scroll active-scroll">
                            <table className="dbs-data-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Reg No / SSNO</th>
                                        <th>Student Name</th>
                                        <th>Original Stream</th>
                                        <th>Changed Branch</th>
                                        <th>Sec</th>
                                        <th>Year</th>
                                        <th>New Reg No</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((rec, idx) => (
                                        <tr key={idx}>
                                            <td>{rec.Date || rec.DATE}</td>
                                            <td className="dbs-font-mono">{rec.Regno || rec.SSNO}</td>
                                            <td className="dbs-table-student-name">{rec.StudentName || rec.SName}</td>
                                            <td>{rec.Course || rec.COURSE} - {rec.Branch || rec.BRANCH}</td>
                                            <td><span className="dbs-pill-branch">{rec.ChangedGroup || rec.CHANGEDGROUP}</span></td>
                                            <td>{rec.Section || rec.SECTION || "A"}</td>
                                            <td>{rec.Year || rec.SYear || "1"}</td>
                                            <td className="dbs-font-mono dbs-text-primary">{rec.NewRegno || rec.NEWREGNO}</td>
                                            <td>
                                                <div className="dbs-table-actions-row">
                                                    <button
                                                        type="button"
                                                        className="dbs-table-action-icon-btn dbs-btn-edit"
                                                        onClick={() => handleEdit(rec)}
                                                        title="Edit Record"
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="dbs-table-action-icon-btn dbs-btn-delete"
                                                        onClick={() => setDeleteId(String(rec.Hid || rec.HID))}
                                                        title="Delete Record"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* COMMON FOOTER COMPONENT */}
                <Footer
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    recordsPerPage={recordsPerPage}
                    setRecordsPerPage={setRecordsPerPage}
                    totalRecords={totalRecords}
                    totalPages={totalPages}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    getPagination={getPagination}
                />
            </div>

            {/* DELETE CONFIRMATION MODAL */}
            {deleteId && (
                <div className="dbs-search-overlay-modal">
                    <div className="dbs-search-modal-box dbs-confirm-modal-box">
                        <AlertTriangle size={36} className="dbs-warning-danger-icon" />
                        <h3>Delete Record?</h3>
                        <p>Are you sure you want to delete this group change record? This action cannot be undone.</p>

                        <div className="dbs-confirm-modal-actions">
                            <button
                                type="button"
                                className="dbs-form-cancel-btn"
                                onClick={() => setDeleteId(null)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="dbs-form-save-btn dbs-btn-danger"
                                onClick={handleDelete}
                            >
                                Delete Record
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default GroupChange;