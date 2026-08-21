import React, { useEffect, useState } from "react";
import { Save, Edit3, Trash2, Search, RefreshCw, AlertTriangle, AlertCircle, Printer, FileText, X } from "lucide-react";
import { toast } from "sonner";
import "./Tcissues.css";
import {
    loadTcIssuesData,
    getTcStudentDetails,
    saveTcIssue,
    deleteTcIssue,
    getTcPrintData
} from "../../../apis/AdmissionsApis";
import Footer from "../../../common/Footer";

interface TcRecord {
    TID?: string | number;
    id?: string | number;
    Tid?: string | number;
    SSNO?: string;
    ssNo?: string;
    RegNo?: string;
    regNo?: string;
    TCNo?: string | number;
    tcNo?: string | number;
    DateAdmission?: string;
    dateAdmission?: string;
    AdmissionDate?: string;
    StudentName?: string;
    SNAME?: string;
    studentName?: string;
    Fname?: string;
    FNAME?: string;
    fname?: string;
    fatherName?: string;
    DOB?: string;
    dob?: string;
    Religion?: string;
    religion?: string;
    Caste?: string;
    caste?: string;
    SubCaste?: string;
    subCaste?: string;
    ClassLeaving?: string;
    ClassofLeaving?: string;
    classOfLeaving?: string;
    Group?: string;
    group?: string;
    Course?: string;
    course?: string;
    FeeDue?: string | number;
    feeDue?: string | number;
    Nationality?: string;
    nationality?: string;
    MotherTongue?: string;
    motherTongue?: string;
    TCDate?: string;
    tcDate?: string;
    Conduct?: string;
    conduct?: string;
    ReasonForLeaving?: string;
    reasonForLeaving?: string;
    DateofLeaving?: string;
    dateOfLeaving?: string;
    Mole1?: string;
    mole1?: string;
    Mole2?: string;
    mole2?: string;
    University?: string;
    university?: string;
    Qualified?: string;
    qualified?: string;
    Scholar?: string;
    scholar?: string;
    [key: string]: any;
}

const TcIssue: React.FC = () => {
    const defaultAcademicYear = localStorage.getItem("academicYear") || "2025-2026";

    // Form State (Initially blank - data only populated into datatable)
    const [form, setForm] = useState({
        tid: "0",
        ssNo: "",
        tcNo: "",
        dateAdmission: "",
        studentName: "",
        fname: "",
        dob: "",
        religion: "",
        caste: "",
        subCaste: "",
        classOfLeaving: "",
        group: "",
        course: "",
        feeDue: "0",
        nationality: "INDIAN",
        motherTongue: "",
        tcDate: new Date().toISOString().split("T")[0],
        conduct: "",
        reasonForLeaving: "", // Reason For Leaving field
        dateOfLeaving: "",
        mole1: "",
        mole2: "",
        university: "",
        qualified: "YES",
        scholar: "YES",
        academicYear: defaultAcademicYear
    });

    // Component States
    const [records, setRecords] = useState<TcRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchingStudent, setSearchingStudent] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [reportModalData, setReportModalData] = useState<any | null>(null);
    const [loadingReport, setLoadingReport] = useState<boolean>(false);

    // Datatable filter & pagination
    const [tableSearch, setTableSearch] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [recordsPerPage, setRecordsPerPage] = useState<number>(5);

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

    // Load initial data (populates datatable list & auto TC number/date)
    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const res = await loadTcIssuesData();
            if (res.success && res.data) {
                setRecords(res.data.tcIssuesList || []);
                const formattedDefaultDate = formatDateInput(res.data.defaultDate) || new Date().toISOString().split("T")[0];
                setForm(prev => ({
                    ...prev,
                    tcNo: res.data.autoTcNo ? String(res.data.autoTcNo) : prev.tcNo,
                    tcDate: formattedDefaultDate
                }));
            }
        } catch (error) {
            toast.error("Failed to load TC Issues initial records.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    // Handle student lookup by Registration / Admission Number
    const handleSearchStudent = async () => {
        const queryNo = form.ssNo.trim();
        if (!queryNo) {
            toast.warning("Please enter a Registration or Admission Number.");
            return;
        }

        setSearchingStudent(true);
        try {
            const res = await getTcStudentDetails(queryNo);
            if (res.success && res.student) {
                const s = res.student;
                setForm(prev => ({
                    ...prev,
                    tid: String(s.tid || "0"),
                    tcNo: s.tcNo ? String(s.tcNo) : prev.tcNo,
                    ssNo: s.ssNo || queryNo,
                    dateAdmission: formatDateInput(s.dateOfAdmission) || prev.dateAdmission,
                    studentName: s.studentName || "",
                    fname: s.fname || "",
                    dob: formatDateInput(s.dob) || prev.dob,
                    religion: s.religion || prev.religion || "",
                    caste: s.caste || prev.caste || "",
                    subCaste: s.subCaste || prev.subCaste || "",
                    classOfLeaving: s.classOfLeaving || prev.classOfLeaving || "",
                    group: s.group || prev.group || "",
                    course: s.course || prev.course || "",
                    feeDue: String(s.feeDue || res.calculatedFeeDue || "0"),
                    nationality: s.nationality || prev.nationality || "INDIAN",
                    motherTongue: s.motherTongue || prev.motherTongue || "",
                    tcDate: formatDateInput(s.tcDate) || prev.tcDate,
                    conduct: s.conduct || prev.conduct || "",
                    reasonForLeaving: s.reasonForLeaving || prev.reasonForLeaving || "",
                    dateOfLeaving: formatDateInput(s.dateOfLeaving) || prev.dateOfLeaving,
                    mole1: s.mole1 || prev.mole1 || "",
                    mole2: s.mole2 || prev.mole2 || "",
                    university: s.university || prev.university || "",
                    qualified: s.qualified || prev.qualified || "YES",
                    scholar: s.scholar || prev.scholar || "YES"
                }));

                if (res.hasFeeDueBlock) {
                    toast.error(res.warningMessage || "Please Clear Fee Dues before issuing TC.");
                } else if (res.warningMessage) {
                    toast.warning(res.warningMessage);
                } else {
                    toast.success(`Student profile found: ${s.studentName}`);
                }
            } else {
                toast.error(res.message || "Registration Number not existed in student data.");
            }
        } catch (error) {
            toast.error("Error searching student TC details.");
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
            tid: "0",
            ssNo: "",
            tcNo: "",
            dateAdmission: "",
            studentName: "",
            fname: "",
            dob: "",
            religion: "",
            caste: "",
            subCaste: "",
            classOfLeaving: "",
            group: "",
            course: "",
            feeDue: "0",
            nationality: "INDIAN",
            motherTongue: "Telugu",
            tcDate: new Date().toISOString().split("T")[0],
            conduct: "SATISFACTORY",
            reasonForLeaving: "",
            dateOfLeaving: "",
            mole1: "",
            mole2: "",
            university: "JNTUK",
            qualified: "YES",
            scholar: "YES",
            academicYear: defaultAcademicYear
        });
        fetchInitialData();
    };

    // Save or Update Transfer Certificate Issue
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Validate Registration Number
        if (!form.ssNo.trim()) {
            toast.warning("Please enter Registration / Admission Number.");
            return;
        }

        // 2. Validate Student Name
        if (!form.studentName.trim()) {
            toast.warning("Student Name is required. Please search or enter Registration Number.");
            return;
        }

        // 3. Validate TC Date
        if (!form.tcDate) {
            toast.warning("Please select TC Date.");
            return;
        }

        // 4. Validate Class of Leaving
        if (!form.classOfLeaving.trim()) {
            toast.warning("Please enter Class of Leaving.");
            return;
        }

        // 5. Validate Date of Leaving
        if (!form.dateOfLeaving) {
            toast.warning("Please select Date of Leaving.");
            return;
        }

        // 6. Validate Conduct
        if (!form.conduct) {
            toast.warning("Please select Conduct.");
            return;
        }

        // 6. Validate Reason For Leaving
        if (!form.reasonForLeaving.trim()) {
            toast.warning("Please enter Reason For Leaving.");
            return;
        }

        // 7. Validate University
        if (!form.university) {
            toast.warning("Please select university.");
            return;
        }

        const payload = {
            Tid: form.tid === "0" ? "" : form.tid,
            SSNO: form.ssNo,
            TCNo: form.tcNo,
            DateOfAdmission: form.dateAdmission,
            StudentName: form.studentName,
            Fname: form.fname,
            DOB: form.dob,
            Religion: form.religion,
            Caste: form.caste,
            SubCaste: form.subCaste,
            ClassofLeaving: form.classOfLeaving,
            Group: form.group,
            Course: form.course,
            FeeDue: form.feeDue,
            Nationality: form.nationality,
            MotherTongue: form.motherTongue,
            TCDate: form.tcDate,
            Conduct: form.conduct,
            ReasonForLeaving: form.reasonForLeaving,
            DateofLeaving: form.dateOfLeaving,
            Mole1: form.mole1,
            Mole2: form.mole2,
            University: form.university,
            ADMNO: form.ssNo,
            AcademicYear: form.academicYear,
            Scholar: form.scholar,
            Qualified: form.qualified
        };

        try {
            const res = await saveTcIssue(payload);
            if (res.success) {
                toast.success(res.message || "TC details saved successfully!");
                handleReset();
            } else {
                toast.error(res.message || "Failed to save TC details.");
            }
        } catch (error) {
            toast.error("Error saving Transfer Certificate.");
        }
    };

    // Edit Record
    const handleEdit = (record: TcRecord) => {
        const tidVal = String(record.TID || record.id || record.Tid || "0");
        const tcNum = String(record.TCNo || record.tcNo || "");
        const regNumber = record.SSNO || record.ssNo || record.RegNo || record.regNo || "";

        setForm({
            tid: tidVal,
            ssNo: regNumber,
            tcNo: tcNum,
            dateAdmission: formatDateInput(record.DateAdmission || record.dateAdmission || record.AdmissionDate) || "",
            studentName: record.StudentName || record.SNAME || record.studentName || "",
            fname: record.Fname || record.FNAME || record.fname || record.fatherName || "",
            dob: formatDateInput(record.DOB || record.dob) || "",
            religion: record.Religion || record.religion || "Hindu",
            caste: record.Caste || record.caste || "OC",
            subCaste: record.SubCaste || record.subCaste || "",
            classOfLeaving: record.ClassLeaving || record.ClassofLeaving || record.classOfLeaving || "",
            group: record.Group || record.group || "",
            course: record.Course || record.course || "",
            feeDue: String(record.FeeDue || record.feeDue || "0"),
            nationality: record.Nationality || record.nationality || "INDIAN",
            motherTongue: record.MotherTongue || record.motherTongue || "Telugu",
            tcDate: formatDateInput(record.TCDate || record.tcDate) || new Date().toISOString().split("T")[0],
            conduct: record.Conduct || record.conduct || "SATISFACTORY",
            reasonForLeaving: record.ReasonForLeaving || record.reasonForLeaving || "",
            dateOfLeaving: formatDateInput(record.DateofLeaving || record.dateOfLeaving) || "",
            mole1: record.Mole1 || record.mole1 || "",
            mole2: record.Mole2 || record.mole2 || "",
            university: record.University || record.university || "JNTUK",
            qualified: record.Qualified || record.qualified || "YES",
            scholar: record.Scholar || record.scholar || "YES",
            academicYear: record.AcademicYear || defaultAcademicYear
        });

        toast.info(`Editing TC record for ${record.StudentName || record.SNAME || record.studentName}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Delete Record
    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            const res = await deleteTcIssue(deleteId);
            if (res.success) {
                toast.success("Record deleted successfully.");
                setDeleteId(null);
                fetchInitialData();
            } else {
                toast.error(res.message || "Failed to delete record.");
            }
        } catch (error) {
            toast.error("Error deleting TC record.");
        }
    };

    // Generate Dynamic Transfer Certificate Report via Backend API
    const handlePrintReport = async (record?: TcRecord) => {
        const targetTid = record ? String(record.TID || record.id || record.Tid) : form.tid;
        const targetSsNo = record ? (record.SSNO || record.ssNo || record.RegNo || record.regNo) : form.ssNo;

        if (!targetSsNo) {
            toast.warning("Registration number required for printing.");
            return;
        }

        setLoadingReport(true);
        try {
            const res = await getTcPrintData(targetTid || "0", targetSsNo || "");
            if (res.success && res.data && res.data.length > 0) {
                const pData = res.data[0];
                setReportModalData({
                    tcNo: pData.TCNo || pData.tcNo || form.tcNo,
                    ssNo: targetSsNo,
                    studentName: pData.StudentName || pData.SNAME || record?.StudentName || form.studentName,
                    fname: pData.Fname || pData.FNAME || record?.Fname || form.fname,
                    dob: formatDateInput(pData.DOB || record?.DOB) || form.dob,
                    religion: pData.Religion || record?.Religion || form.religion,
                    caste: pData.Caste || record?.Caste || form.caste,
                    subCaste: pData.SubCaste || record?.SubCaste || form.subCaste,
                    classOfLeaving: pData.ClassLeaving || pData.ClassofLeaving || record?.ClassLeaving || form.classOfLeaving,
                    group: pData.Group || record?.Group || form.group,
                    course: pData.Course || record?.Course || form.course,
                    tcDate: formatDateInput(pData.TCDate || record?.TCDate) || form.tcDate,
                    dateOfLeaving: formatDateInput(pData.DateofLeaving || record?.DateofLeaving) || form.dateOfLeaving,
                    conduct: pData.Conduct || record?.Conduct || form.conduct,
                    reasonForLeaving: pData.ReasonForLeaving || record?.ReasonForLeaving || form.reasonForLeaving,
                    mole1: pData.Mole1 || record?.Mole1 || form.mole1,
                    mole2: pData.Mole2 || record?.Mole2 || form.mole2,
                    university: pData.University || record?.University || form.university,
                    qualified: pData.Qualified || record?.Qualified || form.qualified,
                    scholar: pData.Scholar || record?.Scholar || form.scholar
                });
                toast.success("TC report loaded from Successfully.");
            } else {
                setReportModalData({
                    tcNo: record?.TCNo || record?.tcNo || form.tcNo,
                    ssNo: targetSsNo,
                    studentName: record?.StudentName || record?.SNAME || form.studentName,
                    fname: record?.Fname || record?.FNAME || form.fname,
                    dob: formatDateInput(record?.DOB) || form.dob,
                    religion: record?.Religion || form.religion,
                    caste: record?.Caste || form.caste,
                    subCaste: record?.SubCaste || form.subCaste,
                    classOfLeaving: record?.ClassLeaving || record?.ClassofLeaving || form.classOfLeaving,
                    group: record?.Group || form.group,
                    course: record?.Course || form.course,
                    tcDate: formatDateInput(record?.TCDate) || form.tcDate,
                    dateOfLeaving: formatDateInput(record?.DateofLeaving) || form.dateOfLeaving,
                    conduct: record?.Conduct || form.conduct,
                    reasonForLeaving: record?.ReasonForLeaving || form.reasonForLeaving,
                    mole1: record?.Mole1 || form.mole1,
                    mole2: record?.Mole2 || form.mole2,
                    university: record?.University || form.university,
                    qualified: record?.Qualified || form.qualified,
                    scholar: record?.Scholar || form.scholar
                });
                toast.info("Generated TC report preview.");
            }
        } catch (error) {
            toast.error("Error while generating TC report.");
        } finally {
            setLoadingReport(false);
        }
    };

    // Datatable calculations
    const filteredRecords = records.filter(r => {
        const query = tableSearch.toLowerCase();
        const sName = (r.StudentName || r.SNAME || r.studentName || "").toLowerCase();
        const rNo = (r.SSNO || r.ssNo || r.RegNo || r.regNo || "").toLowerCase();
        const tcNo = String(r.TCNo || r.tcNo || "").toLowerCase();
        const courseStr = (r.Course || r.course || "").toLowerCase();
        const groupStr = (r.Group || r.group || "").toLowerCase();
        return sName.includes(query) || rNo.includes(query) || tcNo.includes(query) || courseStr.includes(query) || groupStr.includes(query);
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
        <div className="dbs-tc-container">

            {/* HEADER */}
            <div className="dbs-admissions-form-header">
                <div>
                    <h2>Transfer Certificate (TC) Management</h2>
                    <p>Issue, verify, and track student transfer certificate registries</p>
                </div>
                <div className="dbs-header-badges-row">
                    <span className="dbs-badge-pill">Academic Year: <strong>{form.academicYear}</strong></span>
                    <span className="dbs-badge-pill dbs-pill-cert">Next TC No: <strong>{form.tcNo || "Auto"}</strong></span>
                </div>
            </div>

            {/* FORM CARD */}
            <form onSubmit={handleSave} className="dbs-admissions-stepper-form-card">
                <div className="dbs-form-card">

                    <div className="dbs-card-title-row">
                        <FileText className="dbs-card-title-icon" size={20} />
                        <h3>TC Issue Details</h3>
                    </div>

                    <div className="dbs-form-grid-3">

                        {/* Reg No Lookup */}
                        <div className="dbs-input-box">
                            <label>Reg No / SSNO *</label>
                            <div className="dbs-search-input-group">
                                <input
                                    name="ssNo"
                                    value={form.ssNo}
                                    onChange={handleChange}
                                    onBlur={() => { if (form.ssNo && !form.studentName) handleSearchStudent(); }}
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

                        {/* TC No */}
                        <div className="dbs-input-box">
                            <label>TC No (Auto)</label>
                            <input
                                name="tcNo"
                                value={form.tcNo}
                                onChange={handleChange}
                                placeholder="Auto Generated"
                                style={{ backgroundColor: "var(--dbs-background)", fontWeight: 600 }}
                            />
                        </div>

                        {/* Date of Admission */}
                        <div className="dbs-input-box">
                            <label>Date of Admission</label>
                            <input
                                type="date"
                                name="dateAdmission"
                                value={form.dateAdmission}
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
                                name="fname"
                                value={form.fname}
                                onChange={handleChange}
                                placeholder="Father Name"
                            />
                        </div>

                        {/* DOB */}
                        <div className="dbs-input-box">
                            <label>Date of Birth (DOB)</label>
                            <input
                                type="date"
                                name="dob"
                                value={form.dob}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Religion */}
                        <div className="dbs-input-box">
                            <label>Religion</label>
                            <input
                                name="religion"
                                value={form.religion}
                                onChange={handleChange}
                                placeholder="e.g. Hindu / Muslim / Christian"
                            />
                        </div>

                        {/* Caste */}
                        <div className="dbs-input-box">
                            <label>Caste</label>
                            <input
                                name="caste"
                                value={form.caste}
                                onChange={handleChange}
                                placeholder="e.g. OC / BC / SC / ST"
                            />
                        </div>

                        {/* Sub Caste */}
                        <div className="dbs-input-box">
                            <label>Sub Caste</label>
                            <input
                                name="subCaste"
                                value={form.subCaste}
                                onChange={handleChange}
                                placeholder="e.g. VYSYA / REDDY / KAPU / MALA"
                            />
                        </div>

                        {/* Course */}
                        <div className="dbs-input-box">
                            <label>Course / Programme</label>
                            <input
                                name="course"
                                value={form.course}
                                onChange={handleChange}
                                placeholder="e.g. B.Tech / M.Tech / MBA"
                            />
                        </div>

                        {/* Group / Branch */}
                        <div className="dbs-input-box">
                            <label>Group / Branch</label>
                            <input
                                name="group"
                                value={form.group}
                                onChange={handleChange}
                                placeholder="e.g. COMPUTER SCIENCE AND ENGINEERING"
                            />
                        </div>

                        {/* Class of Leaving */}
                        <div className="dbs-input-box">
                            <label>Class of Leaving *</label>
                            <input
                                name="classOfLeaving"
                                value={form.classOfLeaving}
                                onChange={handleChange}
                                placeholder="e.g. IV-B.Tech / II-M.Tech"
                            />
                        </div>

                        {/* Date of Leaving */}
                        <div className="dbs-input-box">
                            <label>Date of Leaving *</label>
                            <input
                                type="date"
                                name="dateOfLeaving"
                                value={form.dateOfLeaving}
                                onChange={handleChange}
                            />
                        </div>

                        {/* TC Issue Date */}
                        <div className="dbs-input-box">
                            <label>TC Issue Date *</label>
                            <input
                                type="date"
                                name="tcDate"
                                value={form.tcDate}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Conduct */}
                        <div className="dbs-input-box">
                            <label>Conduct</label>
                            <select name="conduct" value={form.conduct} onChange={handleChange}>
                                <option value="">Select Conduct</option>
                                <option value="SATISFACTORY">SATISFACTORY</option>
                                <option value="GOOD">GOOD</option>
                                <option value="VERY GOOD">VERY GOOD</option>
                                <option value="EXCELLENT">EXCELLENT</option>
                            </select>
                        </div>

                        {/* Reason For Leaving (Requested Field) */}
                        <div className="dbs-input-box dbs-grid-col-span-2">
                            <label>Reason For Leaving *</label>
                            <input
                                name="reasonForLeaving"
                                value={form.reasonForLeaving}
                                onChange={handleChange}
                                placeholder="e.g. IV-B.Tech-COMPUTER SCIENCE AND ENGINEERING / Course Completion"
                            />
                        </div>

                        {/* University */}
                        <div className="dbs-input-box">
                            <label>University</label>
                            <select name="university" value={form.university} onChange={handleChange}>
                                <option value="">Select University</option>
                                <option value="JNTUK">JNTUK</option>
                                <option value="JNTUH">JNTUH</option>
                                <option value="ANU">ANU</option>
                                <option value="AU">AU</option>
                                <option value="SVU">SVU</option>
                            </select>
                        </div>

                        {/* Mole 1 */}
                        <div className="dbs-input-box">
                            <label>Mole 1 (Identification Mark)</label>
                            <input
                                name="mole1"
                                value={form.mole1}
                                onChange={handleChange}
                                placeholder="Identification mark 1"
                            />
                        </div>

                        {/* Mole 2 */}
                        <div className="dbs-input-box">
                            <label>Mole 2 (Identification Mark)</label>
                            <input
                                name="mole2"
                                value={form.mole2}
                                onChange={handleChange}
                                placeholder="Identification mark 2"
                            />
                        </div>

                        {/* Qualified Next Course */}
                        <div className="dbs-input-box">
                            <label>Qualified Next Course?</label>
                            <select name="qualified" value={form.qualified} onChange={handleChange}>
                                <option value="YES">YES</option>
                                <option value="NO">NO</option>
                                <option value="ELIGIBLE">ELIGIBLE</option>
                                <option value="NOT ELIGIBLE">NOT ELIGIBLE</option>
                            </select>
                        </div>

                        {/* Scholar */}
                        <div className="dbs-input-box">
                            <label>Scholarship Student?</label>
                            <select name="scholar" value={form.scholar} onChange={handleChange}>
                                <option value="YES">YES</option>
                                <option value="NO">NO</option>
                            </select>
                        </div>

                        {/* Nationality */}
                        <div className="dbs-input-box">
                            <label>Nationality</label>
                            <input
                                name="nationality"
                                value={form.nationality}
                                onChange={handleChange}
                                placeholder="e.g. INDIAN"
                            />
                        </div>

                        {/* Mother Tongue */}
                        <div className="dbs-input-box">
                            <label>Mother Tongue</label>
                            <input
                                name="motherTongue"
                                value={form.motherTongue}
                                onChange={handleChange}
                                placeholder="e.g. Telugu"
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
                            <span>{form.tid !== "0" ? "Update TC" : "Save TC"}</span>
                        </button>

                        <button
                            type="button"
                            className="dbs-form-reprint-btn"
                            onClick={() => handlePrintReport()}
                            disabled={loadingReport}
                        >
                            {loadingReport ? <RefreshCw size={16} className="dbs-spin" /> : <Printer size={16} />}
                            <span>{loadingReport ? "Loading..." : "Print Report"}</span>
                        </button>
                    </div>

                </div>
            </form>

            {/* DATATABLE */}
            <div className="dbs-dashboard-card dbs-datatable-card">

                <div className="dbs-datatable-header-area">
                    <div>
                        <h3>TC Registry</h3>
                        <p>Showing {filteredRecords.length} records</p>
                    </div>

                    <div className="dbs-table-search-wrapper">
                        <Search size={16} className="dbs-table-search-icon" />
                        <input
                            type="text"
                            placeholder="Search TC No, Name, or Reg No..."
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
                            <div className="dbs-empty-state-title">Loading TC records...</div>
                        </div>
                    ) : filteredRecords.length === 0 ? (
                        <div className="dbs-empty-state">
                            <AlertCircle className="dbs-empty-state-icon" />
                            <div className="dbs-empty-state-title">No TC Records Found</div>
                            <div className="dbs-empty-state-desc">
                                Create new Transfer Certificate entries using the form above.
                            </div>
                        </div>
                    ) : (
                        <div className="dbs-table-card">
                            <div className="dbs-table-scroll active-scroll">
                                <table className="dbs-data-table">
                                    <thead>
                                        <tr>
                                            <th>TC No</th>
                                            <th>Reg No</th>
                                            <th>Student Name</th>
                                            <th>Course & Branch</th>
                                            <th>Class of Leaving</th>
                                            <th>Reason For Leaving</th>
                                            <th>TC Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {currentItems.map((r, idx) => {
                                            const tcNo = String(r.TCNo || r.tcNo || "N/A");
                                            const regNo = r.SSNO || r.ssNo || r.RegNo || r.regNo || "N/A";
                                            const name = r.StudentName || r.SNAME || r.studentName || "";
                                            const course = r.Course || r.course || "";
                                            const branch = r.Group || r.group || "";
                                            const classLeaving = r.ClassLeaving || r.ClassofLeaving || r.classOfLeaving || "";
                                            const reason = r.ReasonForLeaving || r.reasonForLeaving || "";
                                            const tcDate = r.TCDate || r.tcDate || "";
                                            const recordId = String(r.TID || r.id || r.Tid || "");

                                            return (
                                                <tr key={idx}>
                                                    <td className="dbs-font-mono dbs-text-primary">{tcNo}</td>
                                                    <td className="dbs-font-mono">{regNo}</td>
                                                    <td className="dbs-table-student-name">{name}</td>
                                                    <td>{course} - {branch}</td>
                                                    <td>{classLeaving}</td>
                                                    <td style={{ fontSize: "0.82rem" }}>{reason}</td>
                                                    <td>{tcDate}</td>

                                                    <td>
                                                        <div className="dbs-table-actions-row">
                                                            <button
                                                                type="button"
                                                                className="dbs-table-action-icon-btn dbs-btn-edit"
                                                                onClick={() => handleEdit(r)}
                                                                title="Edit TC Certificate"
                                                            >
                                                                <Edit3 size={14} />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="dbs-table-action-icon-btn dbs-btn-reprint"
                                                                onClick={() => handlePrintReport(r)}
                                                                title="Generate Report"
                                                            >
                                                                <Printer size={14} />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="dbs-table-action-icon-btn dbs-btn-delete"
                                                                onClick={() => setDeleteId(recordId)}
                                                                title="Delete TC Certificate"
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
                        <h3>Delete TC Record?</h3>
                        <p>Are you sure you want to delete this TC entry? This action cannot be undone.</p>

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
                            <span>Transfer Certificate</span>
                            <button className="dbs-panel-close-btn" onClick={() => setReportModalData(null)}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="dbs-certificate-paper-preview">
                            <div className="dbs-cert-header">
                                <h2>LAKIREDDY BALI REDDY COLLEGE OF ENGINEERING</h2>
                                <h4>(AUTONOMOUS)</h4>
                                <p>MYLAVARAM - 521230, NTR Dist, A.P. | Affiliated to {reportModalData.university || "JNTUK"}</p>
                            </div>

                            <div className="dbs-cert-title-badge">
                                <h3>TRANSFER CERTIFICATE</h3>
                            </div>

                            <div className="dbs-cert-meta-row">
                                <span>TC No: <strong>{reportModalData.tcNo}</strong></span>
                                <span>Reg No: <strong>{reportModalData.ssNo}</strong></span>
                                <span>TC Issue Date: <strong>{reportModalData.tcDate}</strong></span>
                            </div>

                            <div className="dbs-cert-details-grid">
                                <div className="dbs-cert-line">1. Name of the Student: <strong>{reportModalData.studentName}</strong></div>
                                <div className="dbs-cert-line">2. Father's Name: <strong>{reportModalData.fname}</strong></div>
                                <div className="dbs-cert-line">3. Date of Birth: <strong>{reportModalData.dob}</strong></div>
                                <div className="dbs-cert-line">4. Religion & Caste: <strong>{reportModalData.religion} - {reportModalData.caste} ({reportModalData.subCaste})</strong></div>
                                <div className="dbs-cert-line">5. Course & Branch: <strong>{reportModalData.course} - {reportModalData.group}</strong></div>
                                <div className="dbs-cert-line">6. Class of Leaving: <strong>{reportModalData.classOfLeaving}</strong></div>
                                <div className="dbs-cert-line">7. Date of Leaving: <strong>{reportModalData.dateOfLeaving}</strong></div>
                                <div className="dbs-cert-line">8. Reason For Leaving: <strong>{reportModalData.reasonForLeaving}</strong></div>
                                <div className="dbs-cert-line">9. Conduct & Character: <strong>{reportModalData.conduct}</strong></div>
                                <div className="dbs-cert-line">10. Identification Marks:
                                    <div>i) {reportModalData.mole1 || "NIL"}</div>
                                    <div>ii) {reportModalData.mole2 || "NIL"}</div>
                                </div>
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

export default TcIssue;