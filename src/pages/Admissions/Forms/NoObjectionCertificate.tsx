import React, { useEffect, useState } from "react";
import { Save, Edit3, Trash2, Search, RefreshCw, AlertTriangle, AlertCircle, Printer, FileText, X } from "lucide-react";
import { toast } from "sonner";
import "./NoObjectionCertificate.css";
import {
    loadNoObjectionCertificateData,
    getNoObjectionCertificateStudentDetails,
    saveNoObjectionCertificate,
    deleteNoObjectionCertificate,
    getNoObjectionCertificatePrintData
} from "../../../apis/AdmissionsApis";
import Footer from "../../../common/Footer";

interface NocRecord {
    id?: string | number;
    ID?: string | number;
    Id?: string | number;
    NocNo?: string | number;
    NOCNO?: string | number;
    nocNo?: string | number;
    Date?: string;
    DATE?: string;
    SSno?: string;
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
    FromStudentTransfe?: string;
    FromCollege?: string;
    fromCollege?: string;
    ToStudentTransfe?: string;
    ToCollege?: string;
    toCollege?: string;
    AffiliatingUniversity?: string;
    affiliatingUniversity?: string;
    UniversityissuedtheNOC?: string;
    universityissuedtheNOC?: string;
    TotalintakeinIYear?: string;
    totalIntake?: string;
    Quota?: string;
    quota?: string;
    Annualtuitionfee?: string;
    tuitionPaid?: string;
    TuitionfeeChargeble?: string;
    tuitionfeeChargeble?: string;
    tuitionNewInstitution?: string;
    ReasonForTransfer?: string;
    reasonForTransfer?: string;
    AcademicYear?: string;
    academicYear?: string;
    Principal?: string;
    principalName?: string;
    JAccyr?: string;
    DOLExam?: string;
    DateMonthlastExamination?: string;
    DetailsDiscontinue?: string;
    discontinuationDetails?: string;
    SeekingTransfer?: string;
    SeekingTransferYear?: string;
    SeekingTransfer2?: string;
    NoOfUnfilled?: string;
    unfilledSeats?: string;
    StudyingAcyr?: string;
    StudyingDetails?: string;
    StydyDetails?: string;
    Takenaccyr?: string;
    Noofunfilledseatsaccyr?: string;
    [key: string]: any;
}

const NoObjectionCertificate: React.FC = () => {
    const defaultAcademicYear = localStorage.getItem("academicYear") || "2025-2026";

    // Form State (Initially blank - data only loaded into datatable)
    const [form, setForm] = useState({
        id: "0",
        nocNo: "",
        date: new Date().toISOString().split("T")[0],
        regNo: "",
        admissionDate: "",
        studentName: "",
        fatherName: "",
        programme: "",
        branch: "",
        year: "",
        fromStudentTransfe: "",
        toStudentTransfe: "",
        affiliatingUniversity: "",
        universityissuedtheNOC: "Yes",
        totalintakeinIYear: "",
        quota: "",
        annualtuitionfee: "",
        tuitionfeeChargeble: "",
        reasonForTransfer: "",
        academicYear: defaultAcademicYear,
        principal: "",
        jAccyr: defaultAcademicYear,
        dateMonthlastExamination: "",
        detailsDiscontinue: "",
        seekingTransfer: "",
        seekingTransfer2: defaultAcademicYear,
        noOfUnfilled: "",
        stydyYear: defaultAcademicYear,
        stydyDetails: "",
        takenaccyr: defaultAcademicYear,
        noofunfilledseatsaccyr: ""
    });

    // Component States
    const [records, setRecords] = useState<NocRecord[]>([]);
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

    // Load initial data (only populates datatable list & auto NOC number/date)
    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const res = await loadNoObjectionCertificateData(form.academicYear);
            if (res.success && res.data) {
                // Populate datatable records
                setRecords(res.data.nocList || []);
                const formattedDefaultDate = formatDateInput(res.data.defaultDate) || new Date().toISOString().split("T")[0];
                setForm(prev => ({
                    ...prev,
                    nocNo: res.data.autoNocNo ? String(res.data.autoNocNo) : prev.nocNo,
                    date: formattedDefaultDate
                }));
            }
        } catch (error) {
            toast.error("Failed to load No Objection Certificate initial records.");
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
            const res = await getNoObjectionCertificateStudentDetails(queryNo);
            if (res.success && res.student) {
                const s = res.student;
                setForm(prev => ({
                    ...prev,
                    admissionDate: formatDateInput(s.admissionDate) || prev.admissionDate,
                    studentName: s.studentName || "",
                    fatherName: s.fatherName || "",
                    programme: s.programme || prev.programme,
                    branch: s.branch || prev.branch,
                    year: String(s.year || prev.year || "1"),
                    fromStudentTransfe: s.fromStudentTransfe || prev.fromStudentTransfe,
                    toStudentTransfe: s.toStudentTransfe || prev.toStudentTransfe,
                    affiliatingUniversity: s.affiliatingUniversity || prev.affiliatingUniversity,
                    universityissuedtheNOC: s.universityissuedtheNOC || prev.universityissuedtheNOC,
                    totalintakeinIYear: s.totalintakeinIYear || prev.totalintakeinIYear,
                    quota: s.quota || prev.quota,
                    annualtuitionfee: s.annualtuitionfee || prev.annualtuitionfee,
                    tuitionfeeChargeble: s.tuitionfeeChargeble || prev.tuitionfeeChargeble,
                    reasonForTransfer: s.reasonForTransfer || prev.reasonForTransfer,
                    principal: s.principal || prev.principal,
                    jAccyr: s.jAccyr || prev.jAccyr,
                    dateMonthlastExamination: s.dateMonthlastExamination ? formatDateInput(s.dateMonthlastExamination) : prev.dateMonthlastExamination,
                    detailsDiscontinue: s.detailsDiscontinue || prev.detailsDiscontinue,
                    seekingTransfer: s.seekingTransfer || prev.seekingTransfer,
                    seekingTransfer2: s.seekingTransfer2 || prev.seekingTransfer2,
                    noOfUnfilled: s.noOfUnfilled || prev.noOfUnfilled,
                    stydyYear: s.stydyYear || prev.stydyYear,
                    stydyDetails: s.stydyDetails || prev.stydyDetails,
                    takenaccyr: s.takenaccyr || prev.takenaccyr,
                    noofunfilledseatsaccyr: s.noofunfilledseatsaccyr || prev.noofunfilledseatsaccyr,
                    nocNo: s.nocNo ? String(s.nocNo) : prev.nocNo
                }));

                if (res.warning) {
                    toast.warning(res.warning);
                } else {
                    toast.success(`Student profile found: ${s.studentName}`);
                }
            } else {
                toast.error(res.message || "SSNO not exist in StudentData.");
            }
        } catch (error) {
            toast.error("Error searching student NOC details.");
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
            nocNo: "",
            date: new Date().toISOString().split("T")[0],
            regNo: "",
            admissionDate: "",
            studentName: "",
            fatherName: "",
            programme: "",
            branch: "",
            year: "",
            fromStudentTransfe: "",
            toStudentTransfe: "",
            affiliatingUniversity: "",
            universityissuedtheNOC: "Yes",
            totalintakeinIYear: "",
            quota: "",
            annualtuitionfee: "",
            tuitionfeeChargeble: "",
            reasonForTransfer: "",
            academicYear: defaultAcademicYear,
            principal: "",
            jAccyr: defaultAcademicYear,
            dateMonthlastExamination: "",
            detailsDiscontinue: "",
            seekingTransfer: "",
            seekingTransfer2: defaultAcademicYear,
            noOfUnfilled: "",
            stydyYear: defaultAcademicYear,
            stydyDetails: "",
            takenaccyr: defaultAcademicYear,
            noofunfilledseatsaccyr: ""
        });
        fetchInitialData();
    };

    // Save or Update No Objection Certificate with Form Validation
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Validate Registration Number
        if (!form.regNo.trim()) {
            toast.warning("Please enter Registration / Admission Number.");
            return;
        }

        // 2. Validate Student Name
        if (!form.studentName.trim()) {
            toast.warning("Student Name is required. Please search or enter Registration Number.");
            return;
        }

        // 3. Validate Issue Date
        if (!form.date) {
            toast.warning("Please select Issue Date.");
            return;
        }

        // 4. Validate College Transferring From
        if (!form.fromStudentTransfe.trim()) {
            toast.warning("Please enter College Transferring From.");
            return;
        }

        // 5. Validate College Transferring To
        if (!form.toStudentTransfe.trim()) {
            toast.warning("Please enter College Transferring To.");
            return;
        }

         // 6. Validate Admission Quota
        if (!form.quota.trim()) {
            toast.warning("Please select Admission Quota.");
            return;
        }

        // 7. Validate Reason For Transfer
        if (!form.reasonForTransfer.trim()) {
            toast.warning("Please enter Reason For Transfer.");
            return;
        }

       

        const payload = {
            Id: form.id === "0" ? "" : form.id,
            NocNo: form.nocNo,
            Date: form.date,
            RegNo: form.regNo,
            AdmissionDate: form.admissionDate,
            StudentName: form.studentName,
            FatherName: form.fatherName,
            Programme: form.programme,
            Branch: form.branch,
            Year: form.year,
            FromStudentTransfe: form.fromStudentTransfe,
            ToStudentTransfe: form.toStudentTransfe,
            AffiliatingUniversity: form.affiliatingUniversity,
            UniversityissuedtheNOC: form.universityissuedtheNOC,
            TotalintakeinIYear: form.totalintakeinIYear,
            Quota: form.quota,
            Annualtuitionfee: form.annualtuitionfee,
            TuitionfeeChargeble: form.tuitionfeeChargeble,
            ReasonForTransfer: form.reasonForTransfer,
            AcademicYear: form.academicYear,
            Principal: form.principal,
            JAccyr: form.jAccyr,
            DateMonthlastExamination: form.dateMonthlastExamination,
            DetailsDiscontinue: form.detailsDiscontinue,
            SeekingTransfer: form.seekingTransfer,
            SeekingTransfer2: form.seekingTransfer2,
            NoOfUnfilled: form.noOfUnfilled,
            StydyYear: form.stydyYear,
            StydyDetails: form.stydyDetails,
            Takenaccyr: form.takenaccyr,
            Noofunfilledseatsaccyr: form.noofunfilledseatsaccyr
        };

        try {
            const res = await saveNoObjectionCertificate(payload);
            if (res.success) {
                toast.success(res.message || "NOC details saved successfully!");
                handleReset();
            } else {
                toast.error(res.message || "Failed to save NOC details.");
            }
        } catch (error) {
            toast.error("Error saving No Objection Certificate.");
        }
    };

    // Edit Record
    const handleEdit = (record: NocRecord) => {
        const recId = String(record.id || record.ID || record.Id || "0");
        const nocNum = String(record.NocNo || record.NOCNO || record.nocNo || "");
        const regNumber = record.SSno || record.SSNO || record.RegistrationNo || record.RegNo || record.regNo || "";

        setForm({
            id: recId,
            nocNo: nocNum,
            date: formatDateInput(record.Date || record.DATE) || new Date().toISOString().split("T")[0],
            regNo: regNumber,
            admissionDate: formatDateInput(record.AdmissionDate) || "",
            studentName: record.StudentName || record.SName || record.studentName || "",
            fatherName: record.FatherName || record.FName || record.fatherName || "",
            programme: record.CourseCode || record.Programme || record.COURSE || record.Course || record.programme || "",
            branch: record.BranchCode || record.Branch || record.BRANCHNAME || record.BranchName || record.branch || "",
            year: String(record.Year || record.SYear || record.year || ""),
            fromStudentTransfe: record.FromStudentTransfe || record.FromCollege || record.fromCollege || "",
            toStudentTransfe: record.ToStudentTransfe || record.ToCollege || record.toCollege || "",
            affiliatingUniversity: record.AffiliatingUniversity || record.affiliatingUniversity || "JNTU,Kakinada",
            universityissuedtheNOC: record.UniversityissuedtheNOC || record.universityissuedtheNOC || "Yes",
            totalintakeinIYear: String(record.TotalintakeinIYear || record.totalIntake || "60"),
            quota: record.Quota || record.quota || "Convenor",
            annualtuitionfee: String(record.Annualtuitionfee || record.tuitionPaid || "70000"),
            tuitionfeeChargeble: String(record.TuitionfeeChargeble || record.tuitionfeeChargeble || record.tuitionNewInstitution || "70000"),
            reasonForTransfer: record.ReasonForTransfer || record.reasonForTransfer || "Family relocation",
            academicYear: record.AcademicYear || record.academicYear || defaultAcademicYear,
            principal: record.Principal || record.principalName || "Dr. K. Srinivas",
            jAccyr: record.JAccyr || defaultAcademicYear,
            dateMonthlastExamination: formatDateInput(record.DOLExam || record.DateMonthlastExamination) || "",
            detailsDiscontinue: record.DetailsDiscontinue || record.discontinuationDetails || "",
            seekingTransfer: String(record.SeekingTransfer || record.transferClass || ""),
            seekingTransfer2: record.SeekingTransferYear || record.SeekingTransfer2 || defaultAcademicYear,
            noOfUnfilled: String(record.NoOfUnfilled || record.unfilledSeats || "5"),
            stydyYear: record.StudyingAcyr || record.StydyYear || defaultAcademicYear,
            stydyDetails: record.StudyingDetails || record.StydyDetails || "",
            takenaccyr: record.Takenaccyr || defaultAcademicYear,
            noofunfilledseatsaccyr: String(record.Noofunfilledseatsaccyr || "3")
        });

        toast.info(`Editing NOC Certificate for ${record.StudentName || record.SName || record.studentName}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Delete Record
    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            const res = await deleteNoObjectionCertificate(deleteId);
            if (res.success) {
                toast.success("Record deleted successfully.");
                setDeleteId(null);
                fetchInitialData();
            } else {
                toast.error(res.message || "Failed to delete record.");
            }
        } catch (error) {
            toast.error("Error deleting NOC record.");
        }
    };

    // Generate Dynamic No Objection Certificate Report via Backend API
    const handlePrintReport = async (record?: NocRecord) => {
        const targetSsNo = record ? (record.SSno || record.SSNO || record.RegistrationNo || record.RegNo || record.regNo) : form.regNo;
        const targetNocNo = record ? String(record.NocNo || record.NOCNO || record.nocNo) : form.nocNo;

        if (!targetSsNo) {
            toast.warning("Registration number required for printing.");
            return;
        }

        setLoadingReport(true);
        try {
            const res = await getNoObjectionCertificatePrintData(targetSsNo || "");
            if (res.success && res.data && res.data.length > 0) {
                const pData = res.data[0];
                setReportModalData({
                    nocNo: targetNocNo || form.nocNo,
                    date: formatDateInput(pData.Date || record?.Date) || form.date,
                    studentName: pData.StudentName || pData.SName || record?.StudentName || form.studentName,
                    fatherName: pData.FatherName || pData.FName || record?.FatherName || form.fatherName,
                    programme: pData.CourseCode || pData.Programme || record?.Programme || form.programme,
                    branch: pData.BranchCode || pData.Branch || record?.Branch || form.branch,
                    year: pData.Year || record?.Year || form.year,
                    fromCollege: pData.FromStudentTransfe || record?.FromStudentTransfe || form.fromStudentTransfe,
                    toCollege: pData.ToStudentTransfe || record?.ToStudentTransfe || form.toStudentTransfe,
                    reasonForTransfer: pData.ReasonForTransfer || record?.ReasonForTransfer || form.reasonForTransfer,
                    affiliatingUniversity: pData.AffiliatingUniversity || record?.AffiliatingUniversity || form.affiliatingUniversity,
                    academicYear: pData.AcademicYear || record?.AcademicYear || form.academicYear
                });
                toast.success("NOC report loaded from server API.");
            } else {
                // Construct report modal data from current selected record / form
                setReportModalData({
                    nocNo: targetNocNo || form.nocNo,
                    date: formatDateInput(record?.Date) || form.date,
                    studentName: record?.StudentName || record?.SName || form.studentName,
                    fatherName: record?.FatherName || record?.FName || form.fatherName,
                    programme: record?.CourseCode || record?.Programme || form.programme,
                    branch: record?.BranchCode || record?.Branch || form.branch,
                    year: String(record?.Year || form.year),
                    fromCollege: record?.FromStudentTransfe || form.fromStudentTransfe,
                    toCollege: record?.ToStudentTransfe || form.toStudentTransfe,
                    reasonForTransfer: record?.ReasonForTransfer || form.reasonForTransfer,
                    affiliatingUniversity: record?.AffiliatingUniversity || form.affiliatingUniversity,
                    academicYear: record?.AcademicYear || form.academicYear
                });
                toast.info("Generated NOC report preview.");
            }
        } catch (error) {
            toast.error("API error while generating NOC report.");
        } finally {
            setLoadingReport(false);
        }
    };

    // Datatable calculations
    const filteredRecords = records.filter(r => {
        const query = tableSearch.toLowerCase();
        const sName = (r.StudentName || r.SName || r.studentName || "").toLowerCase();
        const rNo = (r.SSno || r.SSNO || r.RegistrationNo || r.RegNo || r.regNo || "").toLowerCase();
        const nocNo = String(r.NocNo || r.NOCNO || r.nocNo || "").toLowerCase();
        const fromCol = (r.FromStudentTransfe || r.FromCollege || "").toLowerCase();
        const toCol = (r.ToStudentTransfe || r.ToCollege || "").toLowerCase();
        return sName.includes(query) || rNo.includes(query) || nocNo.includes(query) || fromCol.includes(query) || toCol.includes(query);
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
        <div className="dbs-noc-container">

            {/* HEADER */}
            <div className="dbs-admissions-form-header">
                <div>
                    <h2>No Objection Certificate (NOC) Management</h2>
                    <p>Issue, verify, and track student college transfer & NOC approval registries</p>
                </div>
                <div className="dbs-header-badges-row">
                    <span className="dbs-badge-pill">Academic Year: <strong>{form.academicYear}</strong></span>
                    <span className="dbs-badge-pill dbs-pill-cert">Next NOC No: <strong>{form.nocNo || "Auto"}</strong></span>
                </div>
            </div>

            {/* FORM CARD */}
            <form onSubmit={handleSave} className="dbs-admissions-stepper-form-card">
                <div className="dbs-form-card">

                    <div className="dbs-card-title-row">
                        <FileText className="dbs-card-title-icon" size={20} />
                        <h3>Student Transfer & NOC Details</h3>
                    </div>

                    <div className="dbs-form-grid-3">

                        {/* NOC No */}
                        <div className="dbs-input-box">
                            <label>NOC No (Auto)</label>
                            <input
                                name="nocNo"
                                value={form.nocNo}
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
                                placeholder="e.g. B.Tech"
                            />
                        </div>

                        {/* Branch */}
                        <div className="dbs-input-box">
                            <label>Branch</label>
                            <input
                                name="branch"
                                value={form.branch}
                                onChange={handleChange}
                                placeholder="e.g. ELECTRICAL AND ELECTRONICS ENGINEERING"
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

                        {/* From College */}
                        <div className="dbs-input-box dbs-grid-col-span-2">
                            <label>College Transferring From *</label>
                            <input
                                name="fromStudentTransfe"
                                value={form.fromStudentTransfe}
                                onChange={handleChange}
                                placeholder="Name of institution student is transferring from"
                            />
                        </div>

                        {/* To College */}
                        <div className="dbs-input-box dbs-grid-col-span-2">
                            <label>College Transferring To *</label>
                            <input
                                name="toStudentTransfe"
                                value={form.toStudentTransfe}
                                onChange={handleChange}
                                placeholder="Name of institution student is seeking transfer to"
                            />
                        </div>

                        {/* Affiliating University */}
                        <div className="dbs-input-box">
                            <label>Affiliating University</label>
                            <input
                                name="affiliatingUniversity"
                                value={form.affiliatingUniversity}
                                onChange={handleChange}
                                placeholder="e.g. JNTUK / JNTU,Kakinada"
                            />
                        </div>

                        {/* University Issued NOC */}
                        <div className="dbs-input-box">
                            <label>University Issued NOC?</label>
                            <select
                                name="universityissuedtheNOC"
                                value={form.universityissuedtheNOC}
                                onChange={handleChange}
                            >
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>

                        {/* Quota */}
                        <div className="dbs-input-box">
                            <label>Admission Quota</label>
                            <select name="quota" value={form.quota} onChange={handleChange}>
                                <option value="">Select Quota</option>
                                <option value="Convener">Convener Quota</option>
                                <option value="Spot Admission">Spot Admission</option>
                                <option value="Management">Management Quota</option>
                            </select>
                        </div>

                        {/* Annual Tuition Fee */}
                        <div className="dbs-input-box">
                            <label>Annual Tuition Fee Paid (₹)</label>
                            <input
                                name="annualtuitionfee"
                                value={form.annualtuitionfee}
                                onChange={handleChange}
                                placeholder="e.g. 70000"
                            />
                        </div>

                        {/* Tuition Fee Chargeable */}
                        <div className="dbs-input-box">
                            <label>Tuition Fee Chargeable at New Inst (₹)</label>
                            <input
                                name="tuitionfeeChargeble"
                                value={form.tuitionfeeChargeble}
                                onChange={handleChange}
                                placeholder="e.g. 70000"
                            />
                        </div>

                        {/* Reason for Transfer */}
                        <div className="dbs-input-box dbs-grid-col-span-2">
                            <label>Reason For Transfer *</label>
                            <input
                                name="reasonForTransfer"
                                value={form.reasonForTransfer}
                                onChange={handleChange}
                                placeholder="e.g. Family relocation / Personal / Health"
                            />
                        </div>

                        {/* Principal Name */}
                        <div className="dbs-input-box">
                            <label>Principal Name</label>
                            <input
                                name="principal"
                                value={form.principal}
                                onChange={handleChange}
                                placeholder="e.g. Dr. K. Srinivas"
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
                            <span>{form.id !== "0" ? "Update NOC" : "Save NOC Certificate"}</span>
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
                        <h3>Issued NOC Registry</h3>
                        <p>Showing {filteredRecords.length} records</p>
                    </div>

                    <div className="dbs-table-search-wrapper">
                        <Search size={16} className="dbs-table-search-icon" />
                        <input
                            type="text"
                            placeholder="Search NOC No, Name, or Reg No..."
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
                                Create new No Objection Certificate entries using the form above.
                            </div>
                        </div>
                    ) : (
                        <div className="dbs-table-card">
                            <div className="dbs-table-scroll active-scroll">
                                <table className="dbs-data-table">
                                    <thead>
                                        <tr>
                                            <th>NOC No</th>
                                            <th>Reg No</th>
                                            <th>Student Name</th>
                                            <th>Programme & Branch</th>
                                            <th>Transfer Colleges</th>
                                            <th>Quota</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {currentItems.map((r, idx) => {
                                            const nocNo = String(r.NocNo || r.NOCNO || r.nocNo || "N/A");
                                            const regNo = r.SSno || r.SSNO || r.RegistrationNo || r.RegNo || r.regNo || "N/A";
                                            const name = r.StudentName || r.SName || r.studentName || "";
                                            const prog = r.CourseCode || r.Programme || r.COURSE || r.programme || "";
                                            const br = r.BranchCode || r.Branch || r.BRANCHNAME || r.branch || "";
                                            const fromCol = r.FromStudentTransfe || r.FromCollege || "Current";
                                            const toCol = r.ToStudentTransfe || r.ToCollege || "Target";
                                            const quota = r.Quota || r.quota || "Convenor";
                                            const recordId = String(r.id || r.ID || r.Id || "");

                                            return (
                                                <tr key={idx}>
                                                    <td className="dbs-font-mono dbs-text-primary">{nocNo}</td>
                                                    <td className="dbs-font-mono">{regNo}</td>
                                                    <td className="dbs-table-student-name">{name}</td>
                                                    <td>{prog} - {br}</td>
                                                    <td style={{ fontSize: "0.82rem" }}>
                                                        <div>From: <strong>{fromCol}</strong></div>
                                                        <div>To: <strong>{toCol}</strong></div>
                                                    </td>
                                                    <td><span className="dbs-pill-purpose">{quota}</span></td>

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
                        <h3>Delete NOC Record?</h3>
                        <p>Are you sure you want to delete this NOC entry? This action cannot be undone.</p>

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
                            <span>No Objection Certificate (API Generated)</span>
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
                                <h3>NO OBJECTION CERTIFICATE</h3>
                            </div>

                            <div className="dbs-cert-meta-row">
                                <span>Ref No: <strong>NOC/{reportModalData.nocNo}</strong></span>
                                <span>Date: <strong>{reportModalData.date}</strong></span>
                            </div>

                            <div className="dbs-cert-body-text">
                                <p>
                                    This institution has <strong>NO OBJECTION</strong> for the transfer of Mr. / Ms. <strong>{reportModalData.studentName}</strong>, 
                                    Son / Daughter of <strong>{reportModalData.fatherName}</strong>, 
                                    studying <strong>{reportModalData.programme} ({reportModalData.branch})</strong> Year <strong>{reportModalData.year}</strong>, 
                                    from <strong>{reportModalData.fromCollege || "LAKIREDDY BALI REDDY COLLEGE OF ENGINEERING"}</strong> to <strong>{reportModalData.toCollege || "Target Institution"}</strong> affiliated with <strong>{reportModalData.affiliatingUniversity}</strong>.
                                </p>
                                <p className="mt-3">
                                    The transfer is sought due to <strong>{reportModalData.reasonForTransfer}</strong>.
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
                                    <span>{form.principal || "PRINCIPAL"}</span>
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

export default NoObjectionCertificate;