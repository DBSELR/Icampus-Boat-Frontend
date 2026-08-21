import React, { useEffect, useState } from "react";
import { Save, Edit3, Trash2, Search, RefreshCw, AlertTriangle, AlertCircle, Printer, FileCheck, X } from "lucide-react";
import { toast } from "sonner";
import "./CourseCompleted.css";
import {
    loadCourseCompletedData,
    getCourseCompletedStudentDetails,
    saveCourseCompleted,
    deleteCourseCompleted,
    getCourseCompletedPrintData
} from "../../../apis/AdmissionsApis";
import Footer from "../../../common/Footer";

interface CourseCompletedRecord {
    id?: string | number;
    ID?: string | number;
    Id?: string | number;
    SCno?: string | number;
    SCNO?: string | number;
    ScNo?: string | number;
    certificateNo?: string;
    Date?: string;
    DATE?: string;
    SSNo?: string;
    SSNO?: string;
    RegistrationNo?: string;
    RegNo?: string;
    regNo?: string;
    AdmissionDate?: string;
    StudentName?: string;
    SName?: string;
    studentName?: string;
    FatherName?: string;
    FName?: string;
    fatherName?: string;
    CourseCode?: string;
    Programme?: string;
    COURSE?: string;
    Course?: string;
    programme?: string;
    BranchCode?: string;
    Branch?: string;
    BRANCHNAME?: string;
    BranchName?: string;
    branch?: string;
    Year?: string | number;
    SYear?: string | number;
    year?: string | number;
    FromAcademicYear?: string;
    JAcadamicYear?: string;
    fromAcademicYear?: string;
    ToAcademicYear?: string;
    toAcademicYear?: string;
    Sctype?: string;
    SCType?: string;
    SCTYPE?: string;
    certificateType?: string;
    AcademicYear?: string;
    academicYear?: string;
    CONDUCT?: string;
    Conduct?: string;
    conduct?: string;
    [key: string]: any;
}

const CourseCompleted: React.FC = () => {
    const defaultAcademicYear = localStorage.getItem("academicYear") || "2025-2026";

    // Form State
    const [form, setForm] = useState({
        id: "0",
        scNo: "",
        date: new Date().toISOString().split("T")[0],
        regNo: "",
        admissionDate: "",
        studentName: "",
        fatherName: "",
        programme: "",
        branch: "",
        year: "",
        fromAcademicYear: "",
        toAcademicYear: defaultAcademicYear,
        scType: "Course Completion",
        academicYear: defaultAcademicYear,
        conduct: "Satisfactory",
    });

    // Component States
    const [records, setRecords] = useState<CourseCompletedRecord[]>([]);
    const [academicYearsList, setAcademicYearsList] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchingStudent, setSearchingStudent] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [reportModalData, setReportModalData] = useState<any | null>(null);
    const [loadingReport, setLoadingReport] = useState<boolean>(false);

    // Datatable filter & pagination
    const [tableSearch, setTableSearch] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [recordsPerPage, setRecordsPerPage] = useState<number>(5);

    // Helper to safely extract string value from academic year object or string
    const getAyValue = (ay: any): string => {
        if (!ay) return "";
        if (typeof ay === "string") return ay;
        if (typeof ay === "number") return String(ay);
        if (typeof ay === "object") {
            return ay.ACADEMICYEAR || ay.AcademicYear || ay.academicYear || ay.academicyear || String(Object.values(ay)[0] || "");
        }
        return String(ay);
    };

    // Helper to format dates into YYYY-MM-DD for HTML <input type="date">
    const formatDateInput = (dateStr?: string) => {
        if (!dateStr) return "";
        let clean = dateStr.trim();
        if (clean.includes("T")) {
            clean = clean.split("T")[0];
        }
        // If DD-MM-YYYY format, convert to YYYY-MM-DD
        if (/^\d{2}-\d{2}-\d{4}$/.test(clean)) {
            const [day, month, year] = clean.split("-");
            return `${year}-${month}-${day}`;
        }
        return clean;
    };

    // Load initial data (auto SC number, academic years, course completed list, default date)
    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const res = await loadCourseCompletedData();
            if (res.success && res.data) {
                setRecords(res.data.courseCompletedList || []);
                setAcademicYearsList(res.data.academicYears || []);
                const formattedDefaultDate = formatDateInput(res.data.defaultDate) || new Date().toISOString().split("T")[0];
                setForm(prev => ({
                    ...prev,
                    scNo: res.data.autoScNo ? String(res.data.autoScNo) : prev.scNo,
                    date: formattedDefaultDate
                }));
            }
        } catch (error) {
            toast.error("Failed to load Course Completed initial records.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    // Handle student lookup by Registration / Admission Number
    const handleSearchStudent = async () => {
        const queryNo = form.regNo.trim();
        if (!queryNo) {
            toast.warning("Please enter a Registration or Admission Number.");
            return;
        }

        setSearchingStudent(true);
        try {
            const res = await getCourseCompletedStudentDetails(queryNo);
            if (res.success && res.student) {
                const s = res.student;

                // Resolve From & To Academic Years with fallback calculation
                const fromAy = (s.fromAcademicYear || s.FromAcademicYear || s.JAcadamicYear || s.facYr || "").trim();
                let toAy = (s.toAcademicYear || s.ToAcademicYear || s.tacYr || "").trim();

                if (!toAy && fromAy && fromAy.includes("-")) {
                    const parts = fromAy.split("-");
                    const startYr = parseInt(parts[0], 10);
                    const endYr = parseInt(parts[1], 10);
                    if (!isNaN(startYr) && !isNaN(endYr)) {
                        const progLower = (s.programme || "").toLowerCase();
                        const duration = (progLower.includes("m.tech") || progLower.includes("mba") || progLower.includes("mca")) ? 1 : 3;
                        toAy = `${startYr + duration}-${endYr + duration}`;
                    }
                }

                if (!toAy) {
                    toAy = defaultAcademicYear;
                }

                // Ensure options exist in academicYearsList dropdown
                if (fromAy) {
                    setAcademicYearsList(prev => {
                        if (!prev.some(ay => getAyValue(ay) === fromAy)) {
                            return [...prev, { ACADEMICYEAR: fromAy }];
                        }
                        return prev;
                    });
                }
                if (toAy) {
                    setAcademicYearsList(prev => {
                        if (!prev.some(ay => getAyValue(ay) === toAy)) {
                            return [...prev, { ACADEMICYEAR: toAy }];
                        }
                        return prev;
                    });
                }

                setForm(prev => ({
                    ...prev,
                    admissionDate: formatDateInput(s.admissionDate) || prev.admissionDate,
                    studentName: s.studentName || "",
                    fatherName: s.fatherName || "",
                    programme: s.programme || "",
                    branch: s.branch || "",
                    year: String(s.year || ""),
                    fromAcademicYear: fromAy || prev.fromAcademicYear,
                    toAcademicYear: defaultAcademicYear||toAy ,
                    id: s.id ? String(s.id) : prev.id,
                    scNo: s.scNo ? String(s.scNo) : prev.scNo
                }));
                toast.success(`Student profile found: ${s.studentName}`);
            } else {
                toast.error(res.message || "SSNO not found in student data.");
            }
        } catch (error) {
            toast.error("Error searching student course completed details.");
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
            scNo: "",
            date: new Date().toISOString().split("T")[0],
            regNo: "",
            admissionDate: "",
            studentName: "",
            fatherName: "",
            programme: "",
            branch: "",
            year: "",
            fromAcademicYear: "",
            toAcademicYear: defaultAcademicYear,
            scType: "Course Completion",
            academicYear: defaultAcademicYear,
            conduct: "Satisfactory",
        });
        fetchInitialData();
    };

    // Save or Update Course Completed Certificate
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

        const payload = {
            Id: form.id === "0" ? "" : form.id,
            SCNO: form.scNo,
            Date: form.date,
            RegNo: form.regNo,
            AdmissionDate: form.admissionDate,
            StudentName: form.studentName,
            FatherName: form.fatherName,
            Programme: form.programme,
            Branch: form.branch,
            Year: form.year,
            FromAcademicYear: form.fromAcademicYear,
            ToAcademicYear: form.toAcademicYear,
            AcademicYear: form.academicYear,
            SCType: form.scType,
            Conduct: form.conduct
        };

        try {
            const res = await saveCourseCompleted(payload);
            if (res.success) {
                toast.success(res.message || "Course Completed details saved successfully!");
                handleReset();
            } else {
                toast.error(res.message || "Failed to save Course Completed details.");
            }
        } catch (error) {
            toast.error("Error saving Course Completed Certificate.");
        }
    };

    // Edit Record
    const handleEdit = (record: CourseCompletedRecord) => {
        const recId = String(record.id || record.ID || record.Id || "0");
        const scNumber = String(record.SCno || record.SCNO || record.ScNo || record.certificateNo || "");
        const regNumber = record.SSNo || record.SSNO || record.RegistrationNo || record.RegNo || record.regNo || "";

        setForm({
            id: recId,
            scNo: scNumber,
            date: formatDateInput(record.Date || record.DATE) || new Date().toISOString().split("T")[0],
            regNo: regNumber,
            admissionDate: formatDateInput(record.AdmissionDate) || "",
            studentName: record.StudentName || record.SName || record.studentName || "",
            fatherName: record.FatherName || record.FName || record.fatherName || "",
            programme: record.CourseCode || record.Programme || record.COURSE || record.Course || record.programme || "",
            branch: record.BranchCode || record.Branch || record.BRANCHNAME || record.BranchName || record.branch || "",
            year: String(record.Year || record.SYear || record.year || ""),
            fromAcademicYear: record.FromAcademicYear || record.JAcadamicYear || record.fromAcademicYear || "",
            toAcademicYear: record.ToAcademicYear || record.toAcademicYear || "",
            scType: record.SCTYPE || record.Sctype || record.SCType || record.certificateType || "Course Completion",
            academicYear: record.AcademicYear || record.academicYear || defaultAcademicYear,
            conduct: record.CONDUCT || record.Conduct || record.conduct || "Satisfactory"
        });

        toast.info(`Editing Course Completed Certificate for ${record.StudentName || record.SName || record.studentName}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Delete Record
    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            const res = await deleteCourseCompleted(deleteId);
            if (res.success) {
                toast.success("Record deleted successfully.");
                setDeleteId(null);
                fetchInitialData();
            } else {
                toast.error(res.message || "Failed to delete record.");
            }
        } catch (error) {
            toast.error("Error deleting Course Completed record.");
        }
    };

    // Generate Dynamic Course Completed Certificate Report via Backend API
    const handlePrintReport = async (record?: CourseCompletedRecord) => {
        const targetId = record ? String(record.id || record.ID || record.Id || "0") : form.id;
        const targetSsNo = record ? (record.SSNo || record.SSNO || record.RegistrationNo || record.RegNo || record.regNo) : form.regNo;
        const targetScNo = record ? String(record.SCno || record.SCNO || record.ScNo || record.certificateNo) : form.scNo;

        if (!targetSsNo) {
            toast.warning("Registration number required for printing.");
            return;
        }

        setLoadingReport(true);
        try {
            const res = await getCourseCompletedPrintData(targetId, targetSsNo || "");
            if (res.success && res.data && res.data.length > 0) {
                const pData = res.data[0];
                setReportModalData({
                    scNo: targetScNo || form.scNo,
                    date: formatDateInput(pData.Date || record?.Date) || form.date,
                    studentName: pData.StudentName || pData.SName || record?.StudentName || form.studentName,
                    fatherName: pData.FatherName || pData.FName || record?.FatherName || form.fatherName,
                    programme: pData.Programme || pData.CourseCode || pData.COURSE || record?.Programme || form.programme,
                    branch: pData.Branch || pData.BranchCode || pData.BRANCHNAME || record?.Branch || form.branch,
                    year: pData.Year || pData.SYear || record?.Year || form.year,
                    fromAcademicYear: pData.FromAcademicYear || record?.FromAcademicYear || form.fromAcademicYear,
                    toAcademicYear: pData.ToAcademicYear || record?.ToAcademicYear || form.toAcademicYear,
                    conduct: pData.Conduct || record?.CONDUCT || record?.Conduct || form.conduct,
                    academicYear: pData.AcademicYear || record?.AcademicYear || form.academicYear
                });
                toast.success("Course Completed report loaded from server API.");
            } else {
                // Construct report modal data from current selected record / form
                setReportModalData({
                    scNo: targetScNo || form.scNo,
                    date: formatDateInput(record?.Date) || form.date,
                    studentName: record?.StudentName || record?.SName || form.studentName,
                    fatherName: record?.FatherName || record?.FName || form.fatherName,
                    programme: record?.CourseCode || record?.Programme || record?.COURSE || form.programme,
                    branch: record?.BranchCode || record?.Branch || record?.BRANCHNAME || form.branch,
                    year: String(record?.Year || record?.SYear || form.year),
                    fromAcademicYear: record?.FromAcademicYear || record?.JAcadamicYear || form.fromAcademicYear,
                    toAcademicYear: record?.ToAcademicYear || form.toAcademicYear,
                    conduct: record?.CONDUCT || record?.Conduct || form.conduct,
                    academicYear: record?.AcademicYear || form.academicYear
                });
                toast.info("Generated Course Completed report preview.");
            }
        } catch (error) {
            toast.error("API error while generating Course Completed report.");
        } finally {
            setLoadingReport(false);
        }
    };

    // Datatable calculations
    const filteredRecords = records.filter(r => {
        const query = tableSearch.toLowerCase();
        const sName = (r.StudentName || r.SName || r.studentName || "").toLowerCase();
        const rNo = (r.SSNo || r.SSNO || r.RegistrationNo || r.RegNo || r.regNo || "").toLowerCase();
        const scNo = String(r.SCno || r.SCNO || r.ScNo || r.certificateNo || "").toLowerCase();
        const prog = (r.CourseCode || r.Programme || r.COURSE || r.programme || "").toLowerCase();
        return sName.includes(query) || rNo.includes(query) || scNo.includes(query) || prog.includes(query);
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
        <div className="dbs-coursecompleted-container">

            {/* HEADER */}
            <div className="dbs-admissions-form-header">
                <div>
                    <h2>Course Completed Certificate Management</h2>
                    <p>Issue, verify, and track student course completion registries</p>
                </div>
                <div className="dbs-header-badges-row">
                    <span className="dbs-badge-pill">Academic Year: <strong>{form.academicYear}</strong></span>
                    <span className="dbs-badge-pill dbs-pill-cert">Next Certificate: <strong>{form.scNo || "Auto"}</strong></span>
                </div>
            </div>

            {/* FORM CARD */}
            <form onSubmit={handleSave} className="dbs-admissions-stepper-form-card">
                <div className="dbs-form-card">

                    <div className="dbs-card-title-row">
                        <FileCheck className="dbs-card-title-icon" size={20} />
                        <h3>Course Completed Details</h3>
                    </div>

                    <div className="dbs-form-grid-3">

                        {/* Certificate No */}
                        <div className="dbs-input-box">
                            <label>Certificate No (Auto)</label>
                            <input
                                name="scNo"
                                value={form.scNo}
                                onChange={handleChange}
                                placeholder="Auto Generated"
                                style={{ backgroundColor: "var(--dbs-background)", fontWeight: 600 }}
                            />
                        </div>

                        {/* Date */}
                        <div className="dbs-input-box">
                            <label>Issue Date *</label>
                            <input
                                type="date"
                                name="date"
                                value={form.date}
                                onChange={handleChange}
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

                        {/* Admission Date */}
                        <div className="dbs-input-box">
                            <label>Admission Date</label>
                            <input
                                type="date"
                                name="admissionDate"
                                value={form.admissionDate}
                                onChange={handleChange}
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
                                placeholder="e.g. B.TECH"
                            />
                        </div>

                        {/* Branch */}
                        <div className="dbs-input-box">
                            <label>Branch</label>
                            <input
                                name="branch"
                                value={form.branch}
                                onChange={handleChange}
                                placeholder="e.g. INFORMATION TECHNOLOGY"
                            />
                        </div>

                        {/* Year */}
                        <div className="dbs-input-box">
                            <label>Studying Year</label>
                            <select name="year" value={form.year} onChange={handleChange}>
                                <option value="">Select Year</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                            </select>
                        </div>

                        {/* From Academic Year */}
                        <div className="dbs-input-box">
                            <label>From Academic Year</label>
                            <select name="fromAcademicYear" value={form.fromAcademicYear} onChange={handleChange}>
                                <option value="">Select Year</option>
                                {academicYearsList.length > 0 ? (
                                    academicYearsList.map((ay, i) => {
                                        const val = getAyValue(ay);
                                        return <option key={i} value={val}>{val}</option>;
                                    })
                                ) : (
                                    <>
                                        <option value="2020-2021">2020-2021</option>
                                        <option value="2021-2022">2021-2022</option>
                                        <option value="2022-2023">2022-2023</option>
                                        <option value="2023-2024">2023-2024</option>
                                        <option value="2024-2025">2024-2025</option>
                                        <option value="2025-2026">2025-2026</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* To Academic Year */}
                        <div className="dbs-input-box">
                            <label>To Academic Year</label>
                            <select name="toAcademicYear" value={form.toAcademicYear} onChange={handleChange}>
                                <option value="">Select Year</option>
                                {academicYearsList.length > 0 ? (
                                    academicYearsList.map((ay, i) => {
                                        const val = getAyValue(ay);
                                        return <option key={i} value={val}>{val}</option>;
                                    })
                                ) : (
                                    <>
                                        <option value="2020-2021">2020-2021</option>
                                        <option value="2021-2022">2021-2022</option>
                                        <option value="2022-2023">2022-2023</option>
                                        <option value="2023-2024">2023-2024</option>
                                        <option value="2024-2025">2024-2025</option>
                                        <option value="2025-2026">2025-2026</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Certificate Type */}
                        <div className="dbs-input-box">
                            <label>Certificate Type</label>
                            <select name="scType" value={form.scType} onChange={handleChange}>
                                <option value="Course Completion">Course Completion</option>
                                <option value="Study Certificate">Study Certificate</option>
                                <option value="Conduct Certificate">Conduct Certificate</option>
                                <option value="Bonafide">Bonafide</option>
                            </select>
                        </div>

                        {/* Conduct */}
                        <div className="dbs-input-box">
                            <label>Student Conduct</label>
                            <select name="conduct" value={form.conduct} onChange={handleChange}>
                                <option value="Satisfactory">Satisfactory</option>
                                <option value="Excellent">Excellent</option>
                                <option value="Very Good">Very Good</option>
                                <option value="Good">Good</option>
                                <option value="Average">Average</option>
                            </select>
                        </div>

                    </div>

                    {/* ACTIONS */}
                    <div className="dbs-form-actions-row">
                        <button type="button" className="dbs-form-cancel-btn" onClick={handleReset}>
                            Reset / Cancel
                        </button>

                        <button type="submit" className="dbs-form-save-btn">
                            <Save size={16} />
                            <span>{form.id !== "0" ? "Update Certificate" : "Save Course Completed"}</span>
                        </button>

                        <button
                            type="button"
                            className="dbs-form-reprint-btn"
                            onClick={() => handlePrintReport()}
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
                        <h3>Issued Course Completed Registry</h3>
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
                                Create new Course Completed Certificate entries using the form above.
                            </div>
                        </div>
                    ) : (
                        <div className="dbs-table-card">
                            <div className="dbs-table-scroll active-scroll">
                                <table className="dbs-data-table">
                                    <thead>
                                        <tr>
                                            <th>SC No</th>
                                            <th>Date</th>
                                            <th>Reg No</th>
                                            <th>Student Name</th>
                                            <th>Programme & Branch</th>
                                            <th>To ACYR Years</th>
                                            <th>Conduct</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {currentItems.map((r, idx) => {
                                            const scNo = String(r.SCno || r.SCNO || r.ScNo || r.certificateNo || "N/A");
                                            const date = String(r.Date?.split("T")[0] || "N/A");
                                            const regNo = r.SSNo || r.SSNO || r.RegistrationNo || r.RegNo || r.regNo || "N/A";
                                            const name = r.StudentName || r.SName || r.studentName || "";
                                            const prog = r.CourseCode || r.Programme || r.COURSE || r.programme || "";
                                            const br = r.BranchCode || r.Branch || r.BRANCHNAME || r.branch || "";
                                            const fromAy = r.FromAcademicYear || r.JAcadamicYear || r.fromAcademicYear || "";
                                            const toAy = r.ToAcademicYear || r.toAcademicYear || "";
                                            const conduct = r.CONDUCT || r.Conduct || r.conduct || "Satisfactory";
                                            const recordId = String(r.id || r.ID || r.Id || "");

                                            return (
                                                <tr key={idx}>
                                                    <td className="dbs-font-mono dbs-text-primary">{scNo}</td>
                                                    <td >{date}</td>
                                                    <td className="dbs-font-mono">{regNo}</td>
                                                    <td >{name}</td>
                                                    <td>{prog} - {br}</td>
                                                    <td>{toAy}</td>
                                                    <td><span className="dbs-pill-purpose">{conduct}</span></td>

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
                                                                onClick={() => handlePrintReport(r)}
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
                        <h3>Delete Course Completed Record?</h3>
                        <p>Are you sure you want to delete this course completed entry? This action cannot be undone.</p>

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
                            <span>Course Completion Certificate (API Generated)</span>
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
                                <h3>COURSE COMPLETION CERTIFICATE</h3>
                            </div>

                            <div className="dbs-cert-meta-row">
                                <span>Ref No: <strong>{reportModalData.scNo}</strong></span>
                                <span>Date: <strong>{reportModalData.date}</strong></span>
                            </div>

                            <div className="dbs-cert-body-text">
                                <p>
                                    This is to certify that Mr. / Ms. <strong>{reportModalData.studentName}</strong>, 
                                    Son / Daughter of <strong>{reportModalData.fatherName}</strong>, 
                                    bearing Registration No. <strong>{form.regNo}</strong>, 
                                    has successfully completed the <strong>{reportModalData.programme}</strong> course in <strong>{reportModalData.branch}</strong> branch during the academic years <strong>{reportModalData.fromAcademicYear || "N/A"}</strong> to <strong>{reportModalData.toAcademicYear || "N/A"}</strong>.
                                </p>
                                <p className="mt-3">
                                    During their period of study in this college, their conduct and character have been <strong>{reportModalData.conduct}</strong>.
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

export default CourseCompleted;