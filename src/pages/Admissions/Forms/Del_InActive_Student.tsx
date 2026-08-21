import React, { useEffect, useState } from "react";
import { Trash2, Search, RefreshCw, AlertTriangle, AlertCircle, Filter, Users } from "lucide-react";
import { toast } from "sonner";
import "./Del_InActive_Student.css";
import {
    getDelInActiveProgrammes,
    getDelInActiveYears,
    getDelInActiveBranches,
    getDelInActiveSections,
    getDelInActiveStatuses,
    getDelInActiveStudents,
    deleteInActiveStudents
} from "../../../apis/AdmissionsApis";
import Footer from "../../../common/Footer";

interface InActiveStudentRecord {
    COURSE?: string;
    Course?: string;
    CourseName?: string;
    CourseCode?: string;
    GRP?: string;
    Branch?: string;
    BranchName?: string;
    BranchCode?: string;
    SECTION?: string;
    Section?: string;
    section?: string;
    SNAME?: string;
    StudentName?: string;
    studentName?: string;
    REGNO?: string;
    Regno?: string;
    RegNo?: string;
    SSNO?: string;
    ssNo?: string;
    Status?: string;
    status?: string;
    paid?: string | number;
    Paid?: string | number;
    PaidAmount?: string | number;
    SYear?: string | number;
    Year?: string | number;
    Semester?: string | number;
    SEM?: string | number;
    IsActive?: boolean;
    [key: string]: any;
}

const DeleteInActiveStudents: React.FC = () => {
    const defaultAcademicYear = localStorage.getItem("academicYear") || "2025-2026";

    // Form Filter State (ASPX Controls: ddlprogramme, ddlBranch, ddlYear, ddlSem, ddlSection, ddlStatus)
    const [form, setForm] = useState({
        course: "",
        branch: "",
        year: "",
        sem: "",
        section: "",
        status: "",
        academicYear: defaultAcademicYear
    });

    // Cascading Dropdown Options Lists
    const [programmesList, setProgrammesList] = useState<any[]>([]);
    const [yearsList, setYearsList] = useState<any[]>([]);
    const [branchesList, setBranchesList] = useState<any[]>([]);
    const [sectionsList, setSectionsList] = useState<any[]>([]);
    const [statusesList, setStatusesList] = useState<any[]>([]);

    // Component States
    const [students, setStudents] = useState<InActiveStudentRecord[]>([]);
    const [selectedRegNos, setSelectedRegNos] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingFilters, setLoadingFilters] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [singleDeleteRegNo, setSingleDeleteRegNo] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<boolean>(false);

    // Datatable filter & pagination
    const [tableSearch, setTableSearch] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [recordsPerPage, setRecordsPerPage] = useState<number>(5);

    // Helper to safely extract label/value from API dropdown item
    const getItemValue = (item: any, primaryKey: string, secondaryKey: string) => {
        if (!item) return "";
        if (typeof item === "string") return item;
        return item[primaryKey] || item[secondaryKey] || String(Object.values(item)[0] || "");
    };

    const getItemLabel = (item: any, labelKey: string, fallbackKey: string) => {
        if (!item) return "";
        if (typeof item === "string") return item;
        return item[labelKey] || item[fallbackKey] || String(Object.values(item)[0] || "");
    };

    // Initial load: Fetch programmes list (ASPX Page_Load -> Programme())
    useEffect(() => {
        const fetchProgrammes = async () => {
            setLoadingFilters(true);
            try {
                const res = await getDelInActiveProgrammes(form.academicYear);
                if (res.success && res.data) {
                    setProgrammesList(res.data);
                }
            } catch (error) {
                toast.error("Failed to load programmes list.");
            } finally {
                setLoadingFilters(false);
            }
        };
        fetchProgrammes();
    }, [form.academicYear]);

    // ASPX: ddlprogramme_SelectedIndexChanged
    const handleProgrammeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCourse = e.target.value;
        setForm(prev => ({
            ...prev,
            course: selectedCourse,
            year: "",
            branch: "",
            sem: "",
            section: "",
            status: ""
        }));
        setYearsList([]);
        setBranchesList([]);
        setSectionsList([]);
        setStatusesList([]);
        setStudents([]);
        setSelectedRegNos([]);

        if (!selectedCourse) return;

        setLoadingFilters(true);
        try {
            const [yearsRes, branchesRes] = await Promise.all([
                getDelInActiveYears(selectedCourse, form.academicYear),
                getDelInActiveBranches(selectedCourse, form.academicYear)
            ]);

            if (yearsRes.success && yearsRes.data) setYearsList(yearsRes.data);
            if (branchesRes.success && branchesRes.data) setBranchesList(branchesRes.data);
        } catch (error) {
            toast.error("Failed to load years and branches.");
        } finally {
            setLoadingFilters(false);
        }
    };

    // Core GetData function to fetch inactive student records (ASPX GetData())
    const fetchData = async (currentFormState = form) => {
        if (!currentFormState.course || !currentFormState.branch || !currentFormState.year || !currentFormState.sem) {
            return;
        }

        setLoading(true);
        setSelectedRegNos([]);
        setSingleDeleteRegNo(null);
        try {
            const res = await getDelInActiveStudents({
                programme: currentFormState.course,
                branch: currentFormState.branch,
                syear: currentFormState.year,
                semester: currentFormState.sem,
                section: currentFormState.section,
                academicYear: currentFormState.academicYear,
                status: currentFormState.status
            });

            if (res.success && res.data) {
                setStudents(res.data);
            } else {
                setStudents([]);
            }
        } catch (error) {
            toast.error("Error loading inactive students list.");
        } finally {
            setLoading(false);
        }
    };

    // ASPX: ddlSem_SelectedIndexChanged (Loads Section List & Status, then executes GetData)
    const handleSemChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedSem = e.target.value;
        const updatedForm = { ...form, sem: selectedSem, section: "", status: "" };
        setForm(updatedForm);
        setSectionsList([]);
        setStatusesList([]);
        setStudents([]);
        setSelectedRegNos([]);

        if (!updatedForm.course || !updatedForm.branch || !updatedForm.year || !selectedSem) return;

        setLoadingFilters(true);
        try {
            const [secRes, statusRes] = await Promise.all([
                getDelInActiveSections(updatedForm.course, updatedForm.branch, updatedForm.year),
                getDelInActiveStatuses(updatedForm.course, updatedForm.branch, updatedForm.year)
            ]);

            if (secRes.success && secRes.data) setSectionsList(secRes.data);
            if (statusRes.success && statusRes.data) setStatusesList(statusRes.data);

            // Trigger GetData
            fetchData(updatedForm);
        } catch (error) {
            console.error("Error loading sections/statuses", error);
        } finally {
            setLoadingFilters(false);
        }
    };

    // ASPX: ddlSection_SelectedIndexChanged & ddlStatus_SelectedIndexChanged (Auto-triggers GetData)
    const handleAutoGetDataFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updatedForm = { ...form, [name]: value };
        setForm(updatedForm);
        fetchData(updatedForm);
    };

    // Manual Reset Filters
    const handleReset = () => {
        setForm({
            course: "",
            branch: "",
            year: "",
            sem: "",
            section: "",
            status: "",
            academicYear: defaultAcademicYear
        });
        setYearsList([]);
        setBranchesList([]);
        setSectionsList([]);
        setStatusesList([]);
        setStudents([]);
        setSelectedRegNos([]);
        setSingleDeleteRegNo(null);
        setTableSearch("");
        fetchData();
    };

    // Checkbox Selection Logic (ASPX toggle(source))
    const toggleSelectAllCurrentPage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const pageRegNos = currentItems.map(r => String(r.REGNO || r.Regno || r.RegNo || r.SSNO || r.ssNo || r.regNo || ""));
        if (e.target.checked) {
            setSelectedRegNos(prev => Array.from(new Set([...prev, ...pageRegNos])));
        } else {
            setSelectedRegNos(prev => prev.filter(id => !pageRegNos.includes(id)));
        }
    };

    const toggleSelectRow = (regNo: string) => {
        if (!regNo) return;
        setSelectedRegNos(prev =>
            prev.includes(regNo) ? prev.filter(id => id !== regNo) : [...prev, regNo]
        );
    };

    // Single Row Delete Action Handler
    const handleSingleDeleteClick = (regNo: string) => {
        setSingleDeleteRegNo(regNo);
        setShowDeleteModal(true);
    };

    // Bulk Delete Action Handler (ASPX btnDelete_Click)
    const handleBulkDeleteClick = () => {
        if (selectedRegNos.length === 0) {
            toast.warning("Please select at least one student to delete.");
            return;
        }
        setSingleDeleteRegNo(null);
        setShowDeleteModal(true);
    };

    // Confirm Delete Action (ASPX Del_IsActive_Students -> SP_Del_Students)
    const confirmDeleteStudents = async () => {
        const targetRegNos = singleDeleteRegNo ? [singleDeleteRegNo] : selectedRegNos;

        if (targetRegNos.length === 0) {
            toast.warning("Please select at least one student to delete.");
            return;
        }

        setDeleting(true);
        try {
            const targetStudent = students.find(s => String(s.REGNO || s.Regno || s.RegNo || s.SSNO || s.ssNo || s.regNo || "") === targetRegNos[0]);
            const payload = {
                programme: form.course || targetStudent?.CourseCode || targetStudent?.COURSE || "",
                branch: form.branch || targetStudent?.BranchCode || targetStudent?.GRP || "",
                sYear: form.year || String(targetStudent?.SYear || targetStudent?.Year || "1"),
                semester: form.sem || String(targetStudent?.Semester || targetStudent?.SEM || "1"),
                section: form.section || targetStudent?.Section || targetStudent?.SECTION || "A",
                status: form.status || targetStudent?.Status || "",
                academicYear: form.academicYear,
                regNos: targetRegNos,
                userId: localStorage.getItem("userId") || "admin"
            };

            const res = await deleteInActiveStudents(payload);
            if (res.success) {
                toast.success(res.message || "InActive Students Deleted successfully....!");
                setShowDeleteModal(false);
                setSingleDeleteRegNo(null);
                setSelectedRegNos(prev => prev.filter(id => !targetRegNos.includes(id)));
                handleReset();
            } else {
                toast.error(res.message || "InActive Students Deleted Error");
            }
        } catch (error) {
            toast.error("InActive Students Deleted Error");
        } finally {
            setDeleting(false);
        }
    };

    // Datatable calculations
    const filteredStudents = students.filter(r => {
        const query = tableSearch.toLowerCase();
        const sName = (r.SNAME || r.StudentName || r.studentName || "").toLowerCase();
        const rNo = (r.REGNO || r.Regno || r.RegNo || r.SSNO || r.ssNo || r.regNo || "").toLowerCase();
        const status = (r.Status || r.status || "").toLowerCase();
        const sec = (r.SECTION || r.Section || r.section || "").toLowerCase();
        const course = (r.COURSE || r.Course || "").toLowerCase();
        const branch = (r.GRP || r.Branch || "").toLowerCase();
        return sName.includes(query) || rNo.includes(query) || status.includes(query) || sec.includes(query) || course.includes(query) || branch.includes(query);
    });

    const totalRecords = filteredStudents.length;
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = Math.min(startIndex + recordsPerPage, totalRecords);
    const currentItems = filteredStudents.slice(startIndex, endIndex);

    const isAllPageSelected = currentItems.length > 0 && currentItems.every(r => {
        const id = String(r.REGNO || r.Regno || r.RegNo || r.SSNO || r.ssNo || r.regNo || "");
        return selectedRegNos.includes(id);
    });

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
        <div className="dbs-delinactive-container">

            {/* HEADER */}
            <div className="dbs-admissions-form-header">
                <div>
                    <h2>Delete InActive Students</h2>
                    <p>ASPX Admissions Registry - Inactive Student Deletion</p>
                </div>
                <div className="dbs-header-badges-row">
                    <span className="dbs-badge-pill">Academic Year: <strong>{form.academicYear}</strong></span>
                    {selectedRegNos.length > 0 && (
                        <span className="dbs-badge-pill dbs-pill-selected">
                            Selected: <strong>{selectedRegNos.length} Students</strong>
                        </span>
                    )}
                </div>
            </div>

            {/* FILTERS CARD (ASPX Controls) */}
            <form className="dbs-admissions-stepper-form-card" onSubmit={(e) => { e.preventDefault(); fetchData(); }}>
                <div className="dbs-form-card">

                    <div className="dbs-card-title-row">
                        <Filter className="dbs-card-title-icon" size={20} />
                        <h3>Student Search Filters</h3>
                        {loadingFilters && <RefreshCw size={16} className="dbs-spin dbs-text-primary ml-auto" />}
                    </div>

                    <div className="dbs-form-grid-3">

                        {/* COURSE (ddlprogramme) */}
                        <div className="dbs-input-box">
                            <label>Course *</label>
                            <select name="course" value={form.course} onChange={handleProgrammeChange}>
                                <option value="">Select Programme</option>
                                {programmesList.map((p, idx) => {
                                    const code = getItemValue(p, "CourseCode", "Course");
                                    const name = getItemLabel(p, "Course", "CourseCode");
                                    return <option key={idx} value={code}>{name}</option>;
                                })}
                            </select>
                        </div>

                        {/* BRANCH (ddlBranch) */}
                        <div className="dbs-input-box">
                            <label>Branch *</label>
                            <select name="branch" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} disabled={!form.course}>
                                <option value="">Select Branch</option>
                                {branchesList.map((b, idx) => {
                                    const code = getItemValue(b, "BranchCode", "BranchName");
                                    const name = getItemLabel(b, "BranchName", "BranchCode");
                                    return <option key={idx} value={code}>{name}</option>;
                                })}
                            </select>
                        </div>

                        {/* YEAR (ddlYear) */}
                        <div className="dbs-input-box">
                            <label>Year *</label>
                            <select name="year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} disabled={!form.course}>
                                <option value="">Select Year</option>
                                {yearsList.length > 0 ? (
                                    yearsList.map((y, idx) => {
                                        const val = getItemValue(y, "ID", "DATA");
                                        const label = getItemLabel(y, "DATA", "ID");
                                        return <option key={idx} value={val}>{label}</option>;
                                    })
                                ) : (
                                    <>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* SEM (ddlSem - AutoPostBack) */}
                        <div className="dbs-input-box">
                            <label>Sem *</label>
                            <select name="sem" value={form.sem} onChange={handleSemChange} disabled={!form.year}>
                                <option value="">Select Sem</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                            </select>
                        </div>

                        {/* SECTION (ddlSection - AutoPostBack) */}
                        <div className="dbs-input-box">
                            <label>Section</label>
                            <select name="section" value={form.section} onChange={handleAutoGetDataFilterChange} disabled={!form.sem}>
                                <option value="">Select Section</option>
                                {sectionsList.length > 0 ? (
                                    sectionsList.map((sec, idx) => {
                                        const val = getItemValue(sec, "Section", "SECTION");
                                        return <option key={idx} value={val}>{val}</option>;
                                    })
                                ) : (
                                    <>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="D">D</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* STATUS (ddlStatus - AutoPostBack) */}
                        <div className="dbs-input-box">
                            <label>Status</label>
                            <select name="status" value={form.status} onChange={handleAutoGetDataFilterChange}>
                                <option value="">Select Status</option>
                                {statusesList.length > 0 ? (
                                    statusesList.map((st, idx) => {
                                        const val = getItemValue(st, "Status", "status");
                                        return <option key={idx} value={val}>{val}</option>;
                                    })
                                ) : (
                                    <>
                                        <option value="Detained">Detained</option>
                                        <option value="Discontinued">Discontinued</option>
                                        <option value="Inactive">Inactive</option>
                                    </>
                                )}
                            </select>
                        </div>

                    </div>

                    {/* ACTIONS (ASPX btnDelete) */}
                    <div className="dbs-form-actions-row">
                        <button type="button" className="dbs-form-cancel-btn" onClick={handleReset}>
                            Reset
                        </button>

                        <button type="button" className="dbs-form-save-btn" onClick={() => fetchData()} disabled={loading}>
                            {loading ? <RefreshCw size={16} className="dbs-spin" /> : <Users size={16} />}
                            <span>Get InActive Students</span>
                        </button>

                        <button
                            type="button"
                            className="dbs-form-reprint-btn dbs-btn-danger"
                            onClick={handleBulkDeleteClick}
                            disabled={selectedRegNos.length === 0}
                        >
                            <Trash2 size={16} />
                            <span>Delete</span>
                        </button>
                    </div>

                </div>
            </form>

            {/* DATATABLE CARD WITH ASPX ORANGE TOTAL STUDENTS BANNER */}
            <div className="dbs-dashboard-card dbs-datatable-card">

                {/* ASPX SIGNATURE ORANGE TOTAL STUDENTS STATUS BANNER */}
                {/* <div className="dbs-total-students-bar">
                    <span className="dbs-total-students-text">
                        Total Students : <strong>{students.length}</strong>
                    </span>
                </div> */}

                <div className="dbs-datatable-header-area">
                    <div>
                        <h3>InActive Students Grid</h3>
                        <p>Showing {filteredStudents.length} of {students.length} records {selectedRegNos.length > 0 && `| ${selectedRegNos.length} Checked`}</p>
                    </div>

                    <div className="dbs-table-search-wrapper">
                        <Search size={16} className="dbs-table-search-icon" />
                        <input
                            type="text"
                            placeholder="Search REGNO, SNAME, Branch..."
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
                            <div className="dbs-empty-state-title">Loading inactive students...</div>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="dbs-empty-state">
                            <AlertCircle className="dbs-empty-state-icon" />
                            <div className="dbs-empty-state-title">No Inactive Students Found</div>
                            <div className="dbs-empty-state-desc">
                                Select filters above to populate inactive student records.
                            </div>
                        </div>
                    ) : (
                        <div className="dbs-table-card">
                            <div className="dbs-table-scroll active-scroll">
                                <table className="dbs-data-table">
                                    <thead>
                                        <tr>
                                            <th>Course</th>
                                            <th>Branch</th>
                                            <th>SECTION</th>
                                            <th>SNAME</th>
                                            <th>REGNO</th>
                                            <th>Status</th>
                                            <th>Paid Amount</th>
                                            <th style={{ width: "100px", textAlign: "center" }}>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                                                    <input
                                                        type="checkbox"
                                                        className="dbs-table-checkbox"
                                                        checked={isAllPageSelected}
                                                        onChange={toggleSelectAllCurrentPage}
                                                        title="Select All"
                                                    />
                                                    <span>Select All</span>
                                                </div>
                                            </th>
                                            {/* <th style={{ textAlign: "center" }}>Action</th> */}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {currentItems.map((r, idx) => {
                                            const courseVal = r.COURSE || r.Course || r.CourseCode || form.course || "N/A";
                                            const branchVal = r.GRP || r.Branch || r.BranchName || form.branch || "N/A";
                                            const secVal = r.SECTION || r.Section || r.section || form.section || "N/A";
                                            const sNameVal = r.SNAME || r.StudentName || r.studentName || "N/A";
                                            const regNoVal = String(r.REGNO || r.Regno || r.RegNo || r.SSNO || r.ssNo || r.regNo || "");
                                            const statusVal = r.Status || r.status || "Inactive";
                                            const paidVal = r.paid !== undefined ? r.paid : (r.Paid !== undefined ? r.Paid : (r.PaidAmount !== undefined ? r.PaidAmount : 0));
                                            const isSelected = selectedRegNos.includes(regNoVal);

                                            return (
                                                <tr key={idx} className={isSelected ? "dbs-tr-selected" : ""}>
                                                    <td><strong>{courseVal}</strong></td>
                                                    <td>{branchVal}</td>
                                                    <td>{secVal}</td>
                                                    <td className="dbs-table-student-name">{sNameVal}</td>
                                                    <td className="dbs-font-mono ">{regNoVal}</td>
                                                    <td>
                                                        <span className="dbs-pill-status">{statusVal}</span>
                                                    </td>
                                                    <td>₹{paidVal}</td>
                                                    <td style={{ textAlign: "center" }}>
                                                        <input
                                                            type="checkbox"
                                                            className="dbs-table-checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleSelectRow(regNoVal)}
                                                        />
                                                    </td>
                                                    {/* <td style={{ textAlign: "center" }}>
                                                        <div className="dbs-table-actions-row" style={{ justifyContent: "center" }}>
                                                            <button
                                                                type="button"
                                                                className="dbs-table-action-icon-btn dbs-btn-delete"
                                                                onClick={() => handleSingleDeleteClick(regNoVal)}
                                                                title="Delete Inactive Student"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td> */}
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

            {/* DELETE CONFIRMATION OVERLAY MODAL */}
            {showDeleteModal && (
                <div className="dbs-search-overlay-modal">
                    <div className="dbs-search-modal-box dbs-confirm-modal-box">
                        <AlertTriangle size={42} className="dbs-warning-danger-icon" />
                        <h3>Confirm Delete InActive Students?</h3>
                        <p>
                            {singleDeleteRegNo ? (
                                <>Are you sure you want to delete inactive student <strong>{singleDeleteRegNo}</strong>?</>
                            ) : (
                                <>Are you sure you want to delete <strong>{selectedRegNos.length}</strong> selected inactive student record(s)?</>
                            )}
                        </p>
                        <p className="dbs-modal-warning-subtext">This database operation cannot be reversed!</p>

                        <div className="dbs-confirm-modal-actions">
                            <button
                                type="button"
                                className="dbs-form-cancel-btn"
                                onClick={() => { setShowDeleteModal(false); setSingleDeleteRegNo(null); }}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="dbs-form-save-btn dbs-btn-danger"
                                onClick={confirmDeleteStudents}
                                disabled={deleting}
                            >
                                {deleting ? <RefreshCw size={16} className="dbs-spin" /> : <Trash2 size={16} />}
                                <span>{deleting ? "Deleting..." : "Delete"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default DeleteInActiveStudents;