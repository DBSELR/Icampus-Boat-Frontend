import React, { useEffect, useState } from "react";
import { Save, Edit3, Trash2, Search, RefreshCw, AlertTriangle, AlertCircle, Printer, FileText, X } from "lucide-react";
import { toast } from "sonner";
import "./Bonafide.css";
import {
    loadBonafideData,
    getBonafideStudentDetails,
    saveBonafideCertificate,
    deleteBonafideCertificate,
    getBonafideReport
} from "../../../apis/AdmissionsApis";
import Footer from "../../../common/Footer";

interface BonafideRecord {
    ID?: number | string;
    id?: string | number;
    Id?: string | number;
    CERTIFICATENO?: string;
    CertificateNO?: string;
    CertificateNo?: string;
    DATE?: string;
    Date?: string;
    SSNO?: string;
    Regno?: string;
    regNo?: string;
    DOB?: string;
    dob?: string;
    STUDENTNAME?: string;
    StudentName?: string;
    SName?: string;
    FATHERNAME?: string;
    FatherName?: string;
    FName?: string;
    COURSECODE?: string;
    Programme?: string;
    Course?: string;
    BRANCHCODE?: string;
    Branch?: string;
    BranchName?: string;
    YEAR?: string;
    Year?: string;
    SYear?: string;
    SEMISTER?: string;
    Semister?: string;
    Semester?: string;
    PURPOSE?: string;
    Purpose?: string;
    ACADEMICYEAR?: string;
    AcademicYear?: string;
    Address?: string;
    address?: string;
    CourseComplete?: string;
    courseCompletion?: string;
    [key: string]: any;
}

const BonafideCertificate: React.FC = () => {
    const defaultAcademicYear = localStorage.getItem("academicYear") || "2025-2026";

    // Form state
    const [form, setForm] = useState({
        id: "0",
        certificateNo: "0",
        date: new Date().toISOString().split("T")[0],
        regNo: "",
        dob: "",
        studentName: "",
        fatherName: "",
        programme: "",
        branch: "",
        year: "",
        semester: "",
        purpose: "",
        courseCompletion: "Completed",
        address: "",
        academicYear: defaultAcademicYear,
    });

    // Component states
    const [records, setRecords] = useState<BonafideRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchingStudent, setSearchingStudent] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [reportModalData, setReportModalData] = useState<any | null>(null);
    const [loadingReport, setLoadingReport] = useState<boolean>(false);

    // Datatable filter & pagination
    const [tableSearch, setTableSearch] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [recordsPerPage, setRecordsPerPage] = useState<number>(5);

    // Helper to format ISO dates (e.g., "2026-06-30T00:00:00" -> "2026-06-30")
    const formatDateInput = (dateStr?: string) => {
        if (!dateStr) return "";
        if (dateStr.includes("T")) {
            return dateStr.split("T")[0];
        }
        return dateStr;
    };

    // Initial load
    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const res = await loadBonafideData(form.certificateNo);
            if (res.success && res.data) {
                setRecords(res.data.certificates || []);
                setForm(prev => ({
                    ...prev,
                    certificateNo: res.data.nextCertificateNo || prev.certificateNo,
                    date: formatDateInput(res.data.defaultDate) || prev.date
                }));
            }
        } catch (error) {
            toast.error("Failed to load Bonafide certificate history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    // Handle student lookup by Registration / Admission No.
    const handleSearchStudent = async () => {
        const queryNo = form.regNo.trim();
        if (!queryNo) {
            toast.warning("Please enter a Registration or Admission Number.");
            return;
        }

        setSearchingStudent(true);
        try {
            const res = await getBonafideStudentDetails(queryNo);
            if (res.success && res.data) {
                const s = res.data;
                setForm(prev => ({
                    ...prev,
                    dob: formatDateInput(s.dob || s.DOB) || "",
                    studentName: s.studentName || s.STUDENTNAME || "",
                    fatherName: s.fatherName || s.FATHERNAME || "",
                    programme: s.programme || s.programmeCode || s.COURSECODE || "",
                    branch: s.branch || s.branchCode || s.BRANCHCODE || "",
                    year: String(s.year || s.YEAR || ""),
                    semester: String(s.semester || s.SEMISTER || ""),
                    address: s.address || s.Address || "",
                    courseCompletion: s.courseCompletion || s.CourseComplete || "Completed",
                    academicYear: s.academicYear || s.ACADEMICYEAR || defaultAcademicYear
                }));
                toast.success(`Student profile found: ${s.studentName || s.STUDENTNAME}`);
            } else {
                toast.error(res.message || "Registration No not found in Student Data.");
            }
        } catch (error) {
            toast.error("Error searching student details.");
        } finally {
            setSearchingStudent(false);
        }
    };

    // Form inputs handler
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // Reset Form
    const handleReset = () => {
        setForm({
            id: "0",
            certificateNo: "0",
            date: new Date().toISOString().split("T")[0],
            regNo: "",
            dob: "",
            studentName: "",
            fatherName: "",
            programme: "",
            branch: "",
            year: "",
            semester: "",
            purpose: "",
            courseCompletion: "Completed",
            address: "",
            academicYear: defaultAcademicYear,
        });
        fetchInitialData();
    };

    // Save or Update Certificate
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.regNo.trim()) {
            toast.warning("Please enter Registration Number.");
            return;
        }

        if (!form.studentName.trim()) {
            toast.warning("Student name is required. Verify registration number.");
            return;
        }

        if (!form.purpose.trim()) {
            toast.warning("Please enter Purpose for Bonafide certificate.");
            return;
        }

        const payload = {
            id: form.id === "0" ? "" : form.id,
            CertificateNO: form.certificateNo,
            Date: form.date,
            RegistrationNo: form.regNo,
            DOB: form.dob,
            StudentName: form.studentName,
            FatherName: form.fatherName,
            Programme: form.programme.split("-")[0],
            Branch: form.branch.split("_")[0],
            Year: form.year,
            Semister: form.semester,
            Purpose: form.purpose,
            AcademicYear: form.academicYear,
            Reporttitle: "BONAFIDE CERTIFICATE",
            OriginalCertificate: "YES",
            CourseComplete: form.courseCompletion,
        };

        try {
            const res = await saveBonafideCertificate(payload);
            if (res.success) {
                toast.success(res.message || "Bonafide Certificate Saved Successfully!");
                handleReset();
            } else {
                toast.error(res.message || "Failed to save Bonafide certificate.");
            }
        } catch (error) {
            toast.error("Error saving Bonafide certificate.");
        }
    };

    // Edit Record with full support for response fields (ID, CERTIFICATENO, DATE, SSNO, STUDENTNAME, etc.)
    const handleEdit = (record: BonafideRecord) => {
        const recId = String(record.ID || record.id || record.Id || "0");
        const regNumber = record.SSNO || record.Regno || record.regNo || "";
        
        setForm({
            id: recId,
            certificateNo: record.CERTIFICATENO || record.CertificateNO || record.CertificateNo || "",
            date: formatDateInput(record.DATE || record.Date) || new Date().toISOString().split("T")[0],
            regNo: regNumber,
            dob: formatDateInput(record.DOB || record.dob) || "",
            studentName: record.STUDENTNAME || record.StudentName || record.SName || "",
            fatherName: record.FATHERNAME || record.FatherName || record.FName || "",
            programme: record.COURSECODE || record.Programme || record.Course || "",
            branch: record.BRANCHCODE || record.Branch || record.BranchName || "",
            year: String(record.YEAR || record.Year || record.SYear || ""),
            semester: String(record.SEMISTER || record.Semister || record.Semester || ""),
            purpose: record.PURPOSE || record.Purpose || "",
            courseCompletion: record.CourseComplete || record.courseCompletion || "Completed",
            address: record.Address || record.address || "",
            academicYear: record.ACADEMICYEAR || record.AcademicYear || defaultAcademicYear,
        });

        toast.info(`Editing Bonafide record for ${record.STUDENTNAME || record.StudentName || record.SName}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Delete Record
    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            const res = await deleteBonafideCertificate(deleteId);
            if (res.success) {
                toast.success("Record deleted successfully.");
                setDeleteId(null);
                fetchInitialData();
            } else {
                toast.error(res.message || "Failed to delete record.");
            }
        } catch (error) {
            toast.error("Error deleting Bonafide record.");
        }
    };

    // Generate Dynamic Bonafide Certificate Report via Backend API
    const handleReprint = async (record?: BonafideRecord) => {
        const targetId = record ? String(record.ID || record.id || record.Id || "0") : form.id;
        const targetSsNo = record ? (record.SSNO || record.Regno || record.regNo) : form.regNo;
        const targetCertNo = record ? (record.CERTIFICATENO || record.CertificateNO || record.CertificateNo) : form.certificateNo;

        if (!targetSsNo) {
            toast.warning("Registration number required for generating report.");
            return;
        }

        setLoadingReport(true);
        try {
            const res = await getBonafideReport(targetId, targetSsNo || "", targetCertNo || "");
            if (res.success && res.data) {
                setReportModalData({
                    certificateNo: targetCertNo || form.certificateNo,
                    date: formatDateInput(record?.DATE || record?.Date) || form.date,
                    studentName: res.data.StudentName || record?.STUDENTNAME || record?.StudentName || form.studentName,
                    fatherName: res.data.FatherName || record?.FATHERNAME || record?.FatherName || form.fatherName,
                    programme: res.data.Programme || record?.COURSECODE || record?.Programme || form.programme,
                    branch: res.data.Branch || record?.BRANCHCODE || record?.Branch || form.branch,
                    purpose: res.data.Purpose || record?.PURPOSE || record?.Purpose || form.purpose,
                    academicYear: record?.ACADEMICYEAR || record?.AcademicYear || form.academicYear
                });
                toast.success("Certificate report loaded from server API.");
            } else {
                toast.error(res.message || "Failed to load report from server API.");
            }
        } catch (error) {
            toast.error("API error while generating Bonafide report.");
        } finally {
            setLoadingReport(false);
        }
    };

    // Datatable calculations
    const filteredRecords = records.filter(r => {
        const query = tableSearch.toLowerCase();
        const sName = (r.STUDENTNAME || r.StudentName || r.SName || "").toLowerCase();
        const rNo = (r.SSNO || r.Regno || r.regNo || "").toLowerCase();
        const cNo = (r.CERTIFICATENO || r.CertificateNO || r.CertificateNo || "").toLowerCase();
        const purp = (r.PURPOSE || r.Purpose || "").toLowerCase();
        return sName.includes(query) || rNo.includes(query) || cNo.includes(query) || purp.includes(query);
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
        <div className="dbs-bonafide-container">

            {/* HEADER */}
            <div className="dbs-admissions-form-header">
                <div>
                    <h2>Bonafide Certificate Management</h2>
                    <p>Issue, verify, and track student bonafide certificate registries</p>
                </div>
                <div className="dbs-header-badges-row">
                    <span className="dbs-badge-pill">Academic Year: <strong>{form.academicYear}</strong></span>
                    <span className="dbs-badge-pill dbs-pill-cert">Next Certificate: <strong>{form.certificateNo || "Auto"}</strong></span>
                </div>
            </div>

            {/* FORM CARD */}
            <form onSubmit={handleSave} className="dbs-admissions-stepper-form-card">
                <div className="dbs-form-card">

                    <div className="dbs-card-title-row">
                        <FileText className="dbs-card-title-icon" size={20} />
                        <h3>Bonafide Certificate Details</h3>
                    </div>

                    <div className="dbs-form-grid-3">

                        {/* Certificate No */}
                        <div className="dbs-input-box">
                            <label>Certificate No (Auto)</label>
                            <input
                                name="certificateNo"
                                value={form.certificateNo}
                                onChange={handleChange}
                                placeholder="Auto Generated"
                                style={{ backgroundColor: "var(--dbs-background)", fontWeight: 600 }}
                            />
                        </div>

                        {/* Date */}
                        <div className="dbs-input-box">
                            <label>Issue Date *</label>
                            <input
                                type="text"
                                name="date"
                                value={form.date}
                                onChange={handleChange}
                                placeholder="dd-MM-yyyy"
                            />
                        </div>

                        {/* Reg No Lookup */}
                        <div className="dbs-input-box">
                            <label>Registration / Admission No *</label>
                            <div className="dbs-search-input-group">
                                <input
                                    name="regNo"
                                    value={form.regNo}
                                    onChange={handleChange}
                                    onBlur={() => { if (form.regNo && !form.studentName) handleSearchStudent(); }}
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearchStudent(); } }}
                                    placeholder="Enter Reg No"
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

                        {/* DOB */}
                        <div className="dbs-input-box">
                            <label>Date of Birth</label>
                            <input
                                type="text"
                                name="dob"
                                value={form.dob}
                                onChange={handleChange}
                                placeholder="dd-MM-yyyy"
                            />
                        </div>

                        {/* Student Name */}
                        <div className="dbs-input-box">
                            <label>Student Name *</label>
                            <input
                                name="studentName"
                                value={form.studentName}
                                onChange={handleChange}
                                placeholder="Full Name in Block Letters"
                                style={{ fontWeight: 600 }}
                            />
                        </div>

                        {/* Father Name */}
                        <div className="dbs-input-box">
                            <label>Father's Name</label>
                            <input
                                name="fatherName"
                                value={form.fatherName}
                                onChange={handleChange}
                                placeholder="Father Name"
                            />
                        </div>

                        {/* Programme */}
                        <div className="dbs-input-box">
                            <label>Programme</label>
                            <input
                                name="programme"
                                value={form.programme}
                                onChange={handleChange}
                                placeholder="e.g. 01-B.Tech"
                            />
                        </div>

                        {/* Branch */}
                        <div className="dbs-input-box">
                            <label>Branch</label>
                            <input
                                name="branch"
                                value={form.branch}
                                onChange={handleChange}
                                placeholder="e.g. 04-ELECTRONICS AND COMMUNICATION ENGINEERING"
                            />
                        </div>

                        {/* Year & Semester */}
                        <div className="dbs-input-box">
                            <label>Studying Year / Sem</label>
                            <div className="dbs-form-grid-2" style={{ gap: "8px" }}>
                                <select name="year" value={form.year} onChange={handleChange}>
                                    <option value="">Year</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                                <select name="semester" value={form.semester} onChange={handleChange}>
                                    <option value="">Sem</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                </select>
                            </div>
                        </div>

                        {/* Course Completion */}
                        <div className="dbs-input-box">
                            <label>Course Completion Status</label>
                            <select name="courseCompletion" value={form.courseCompletion} onChange={handleChange}>
                                <option value="Completed">Completed</option>
                                <option value="Not Completed">Not Completed / Pursuing</option>
                            </select>
                        </div>

                        {/* Purpose */}
                        <div className="dbs-input-box dbs-grid-col-span-2">
                            <label>Purpose of Bonafide *</label>
                            <input
                                name="purpose"
                                value={form.purpose}
                                onChange={handleChange}
                                placeholder="e.g. PASSPORT / Bank Loan / Bus Pass"
                            />
                        </div>

                        {/* Address */}
                        <div className="dbs-input-box dbs-grid-col-span-3">
                            <label>Student Address</label>
                            <input
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                placeholder="Permanent address details"
                            />
                        </div>

                    </div>

                    {/* ACTIONS */}
                    <div className="dbs-form-actions-row">
                        <button type="button" className="dbs-form-cancel-btn" onClick={handleReset}>
                            Reset / Cancel
                        </button>

                        <button type="submit" className="dbs-form-save-btn">
                            <Save size={16} />
                            <span>{form.id !== "0" ? "Update Certificate" : "Save Certificate"}</span>
                        </button>

                        <button
                            type="button"
                            className="dbs-form-reprint-btn"
                            onClick={() => handleReprint()}
                            disabled={loadingReport}
                        >
                            {loadingReport ? <RefreshCw size={16} className="dbs-spin" /> : <Printer size={16} />}
                            <span>{loadingReport ? "Loading..." : "Print Report (API)"}</span>
                        </button>
                    </div>

                </div>
            </form>

            {/* DATATABLE */}
            <div className="dbs-dashboard-card dbs-datatable-card">

                <div className="dbs-datatable-header-area">
                    <div>
                        <h3>Issued Bonafide Certificates Registry</h3>
                        <p>Showing {filteredRecords.length} records</p>
                    </div>

                    <div className="dbs-table-search-wrapper">
                        <Search size={16} className="dbs-table-search-icon" />
                        <input
                            type="text"
                            placeholder="Search Certificate No, Name, or Reg No..."
                            value={tableSearch}
                            onChange={(e) => {
                                setTableSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="dbs-table-search-input"
                        />
                    </div>
                </div>

                <div className="dbs-table-container">
                    {loading ? (
                        <div className="dbs-empty-state">
                            <RefreshCw size={28} className="dbs-spin dbs-empty-state-icon" />
                            <div className="dbs-empty-state-title">Loading registry records...</div>
                        </div>
                    ) : filteredRecords.length === 0 ? (
                        <div className="dbs-empty-state">
                            <AlertCircle className="dbs-empty-state-icon" />
                            <div className="dbs-empty-state-title">No Records Found</div>
                            <div className="dbs-empty-state-desc">
                                Create new Bonafide Certificate entries using the form above.
                            </div>
                        </div>
                    ) : (
                        <div className="dbs-table-card">
                            <div className="dbs-table-scroll active-scroll">
                                <table className="dbs-data-table">
                                    <thead>
                                        <tr>
                                            <th>Cert No</th>
                                            <th>Reg No</th>
                                            <th>Student Name</th>
                                            <th>Programme & Branch</th>
                                            <th>Year</th>
                                            <th>Purpose</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {currentItems.map((r, idx) => {
                                            const certNo = r.CERTIFICATENO || r.CertificateNO || r.CertificateNo || "N/A";
                                            const regNo = r.SSNO || r.Regno || r.regNo || "N/A";
                                            const name = r.STUDENTNAME || r.StudentName || r.SName || "";
                                            const prog = r.COURSECODE || r.Programme || r.Course || "";
                                            const br = r.BRANCHCODE || r.Branch || r.BranchName || "";
                                            const yr = r.YEAR || r.Year || r.SYear || "1";
                                            const sem = r.SEMISTER || r.Semister || r.Semester || "1";
                                            const purpose = r.PURPOSE || r.Purpose || "General";
                                            const recordId = String(r.ID || r.id || r.Id || "");

                                            return (
                                                <tr key={idx}>
                                                    <td className="dbs-font-mono dbs-text-primary">{certNo}</td>
                                                    <td className="dbs-font-mono">{regNo}</td>
                                                    <td className="dbs-table-student-name">{name}</td>
                                                    <td>{prog} - {br}</td>
                                                    <td>{yr}</td>
                                                    <td><span className="dbs-pill-purpose">{purpose}</span></td>

                                                    <td>
                                                        <div className="dbs-table-actions-row">
                                                            <button
                                                                type="button"
                                                                className="dbs-table-action-icon-btn dbs-btn-edit"
                                                                onClick={() => handleEdit(r)}
                                                                title="Edit Certificate"
                                                            >
                                                                <Edit3 size={14} />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="dbs-table-action-icon-btn dbs-btn-reprint"
                                                                onClick={() => handleReprint(r)}
                                                                title="Generate Report API"
                                                            >
                                                                <Printer size={14} />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="dbs-table-action-icon-btn dbs-btn-delete"
                                                                onClick={() => setDeleteId(recordId)}
                                                                title="Delete Certificate"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

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
                        <h3>Delete Bonafide Record?</h3>
                        <p>Are you sure you want to delete this certificate entry? This action cannot be undone.</p>

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

            {/* PRINTABLE REPORT PREVIEW MODAL */}
            {reportModalData && (
                <div className="dbs-search-overlay-modal">
                    <div className="dbs-search-modal-box dbs-report-modal-box">
                        <div className="dbs-dropdown-header">
                            <span>Bonafide Certificate (API Generated)</span>
                            <button className="dbs-panel-close-btn" onClick={() => setReportModalData(null)}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="dbs-certificate-paper-preview">
                            <div className="dbs-cert-header">
                                <h2>LAKIREDDY BALI REDDY COLLEGE OF ENGINEERING</h2>
                                <h4>(AUTONOMOUS)</h4>
                                <p>MYLAVARAM - 521230, NTR Dist, A.P.</p>
                            </div>

                            <div className="dbs-cert-title-badge">
                                <h3>BONAFIDE CERTIFICATE</h3>
                            </div>

                            <div className="dbs-cert-meta-row">
                                <span>Ref No: <strong>{reportModalData.certificateNo}</strong></span>
                                <span>Date: <strong>{reportModalData.date}</strong></span>
                            </div>

                            <div className="dbs-cert-body-text">
                                <p>
                                    This is to certify that Mr. / Ms. <strong>{reportModalData.studentName}</strong>, 
                                    Son / Daughter of <strong>{reportModalData.fatherName}</strong>, 
                                    is / was a bona fide student of this institution studying <strong>{reportModalData.programme} ({reportModalData.branch})</strong> during the academic year <strong>{reportModalData.academicYear}</strong>.
                                </p>
                                <p className="mt-3">
                                    This certificate is issued for the purpose of <strong>{reportModalData.purpose}</strong> on their request.
                                </p>
                            </div>

                            <div className="dbs-cert-footer-signatures">
                                <div className="dbs-sig-box">
                                    <span>Prepared By</span>
                                </div>
                                <div className="dbs-sig-box">
                                    <span>Verified By</span>
                                </div>
                                <div className="dbs-sig-box">
                                    <span>PRINCIPAL</span>
                                </div>
                            </div>
                        </div>

                        <div className="dbs-report-modal-footer">
                            <button type="button" className="dbs-form-cancel-btn" onClick={() => setReportModalData(null)}>
                                Close
                            </button>
                            <button type="button" className="dbs-form-save-btn" onClick={() => { window.print(); }}>
                                <Printer size={16} />
                                <span>Print Certificate</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default BonafideCertificate;