import React, { useEffect, useState, useRef } from "react";
import { Search, RefreshCw, AlertCircle, ChevronDown, CheckSquare, Square, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import "./StudentInformation.css";
import {
    getStudentInfoColumns,
    getStudentInfoFilterOptions,
    generateStudentInfoReport
} from "../../../apis/AdmissionsApis";
import Footer from "../../../common/Footer";

// Default columns available if API returns empty
const DEFAULT_COLUMNS = [
    "REGISTRATIONNO",
    "SNAME",
    "CourseCode",
    "BranchCode",
    "SECTION",
    "ADMISSIONDATE",
    "DOB",
    "GENDER",
    "CASTE",
    "MOBILENO",
    "TUITIONFEE"
];

// Columns that support header dropdown filtering in ASPX
const FILTERABLE_COLUMNS = [
    "Gender", "Course", "Branch", "SYear", "SSemester", "Section",
    "ModeofAdm", "Caste", "SubCaste", "Religion", "AcadamicYear",
    "AYear", "ASemester", "ParentOccupation", "SET_ADM_Type"
];

const StudentInformation: React.FC = () => {
    const defaultAcademicYear = localStorage.getItem("academicYear") || "2025-2026";

    // Columns state
    const [availableColumns, setAvailableColumns] = useState<string[]>([]);
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Header Dropdown Filter State (ASPX ddl_SelectedIndexChanged)
    const [headerFilters, setHeaderFilters] = useState<Record<string, string>>({});
    const [headerOptionsMap, setHeaderOptionsMap] = useState<Record<string, string[]>>({});

    // Report Dataset (ASPX ViewState["DT"] / gvStudentInformation)
    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Datatable Search & Pagination
    const [tableSearch, setTableSearch] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [recordsPerPage, setRecordsPerPage] = useState<number>(5);

    // Initial load: Fetch columns list
    useEffect(() => {
        const fetchColumns = async () => {
            try {
                const colsRes = await getStudentInfoColumns();
                if (colsRes.success && colsRes.data) {
                    const colNames = colsRes.data.map((c: any) =>
                        typeof c === "string" ? c : (c.Name || c.name || String(Object.values(c)[0] || ""))
                    );
                    setAvailableColumns(colNames.length > 0 ? colNames : DEFAULT_COLUMNS);
                } else {
                    setAvailableColumns(DEFAULT_COLUMNS);
                }
            } catch (error) {
                setAvailableColumns(DEFAULT_COLUMNS);
            }
        };
        fetchColumns();
    }, []);

    // Click outside handler for multiselect dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Column Multiselect Handlers
    const toggleColumnSelection = (colName: string) => {
        setSelectedColumns(prev =>
            prev.includes(colName) ? prev.filter(c => c !== colName) : [...prev, colName]
        );
    };

    const handleToggleSelectAll = () => {
        if (selectedColumns.length === availableColumns.length) {
            setSelectedColumns([]);
        } else {
            setSelectedColumns([...availableColumns]);
        }
    };

    // Text to display inside the dropdown select box (matching screenshot: "None selected")
    const getDropdownButtonText = () => {
        if (selectedColumns.length === 0) return "None selected";
        if (selectedColumns.length === availableColumns.length) return "All selected";
        if (selectedColumns.length === 1) return selectedColumns[0];
        return `${selectedColumns.length} selected`;
    };

    // Load Filter Options for Header Dropdowns (ASPX: BindData_DDL_*)
    const fetchHeaderFilterOptions = async (colName: string) => {
        if (headerOptionsMap[colName]) return;

        try {
            const res = await getStudentInfoFilterOptions(colName);
            if (res.success && res.data) {
                setHeaderOptionsMap(prev => ({ ...prev, [colName]: res.data }));
            }
        } catch (error) {
            console.error(`Failed to load header filter options for ${colName}`);
        }
    };

    // ASPX: Btnsave_Click1 / LoadDetails (Display Report)
    const handleDisplayReport = async (overrideFilters?: Record<string, string>) => {
        if (selectedColumns.length === 0) {
            toast.warning("Please select at least one field from Student Fields.");
            return;
        }

        setLoading(true);
        setCurrentPage(1);

        const activeFilters = overrideFilters || headerFilters;

        try {
            const payload = {
                academicYear: defaultAcademicYear,
                columns: selectedColumns,
                filters: activeFilters
            };

            const res = await generateStudentInfoReport(payload);
            if (res.success && res.data) {
                setReportData(res.data);
                toast.success(`Loaded ${res.data.length} student records.`);

                // Pre-fetch header filter options for active columns
                selectedColumns.forEach(col => {
                    if (FILTERABLE_COLUMNS.some(fc => fc.toLowerCase() === col.toLowerCase())) {
                        fetchHeaderFilterOptions(col);
                    }
                });
            } else {
                setReportData([]);
                toast.warning("Student List is Empty...");
            }
        } catch (error) {
            toast.error("Error generating student information report.");
        } finally {
            setLoading(false);
        }
    };

    // ASPX: ddl_SelectedIndexChanged (Header Dropdown Filter Change)
    const handleHeaderFilterChange = (colName: string, value: string) => {
        const updatedHeaderFilters = { ...headerFilters };
        if (value && value !== "Select") {
            updatedHeaderFilters[colName] = value;
        } else {
            delete updatedHeaderFilters[colName];
        }
        setHeaderFilters(updatedHeaderFilters);
        handleDisplayReport(updatedHeaderFilters);
    };

    // ASPX: btnCancel_Click (Cancel / Reset)
    const handleCancelReset = () => {
        setSelectedColumns([]);
        setHeaderFilters({});
        setReportData([]);
        setTableSearch("");
        setCurrentPage(1);
        setIsDropdownOpen(false);
    };

    // ASPX: BtnExport_Click (Excel Export as genuine .xlsx)
    const handleExcelExport = () => {
        if (reportData.length === 0) {
            toast.warning("Please Select Student Data..");
            return;
        }

        try {
            const worksheet = XLSX.utils.json_to_sheet(reportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "STUDENT_DATA");

            const now = new Date();
            const pad = (n: number) => (n < 10 ? "0" + n : n);
            const dateStr = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
            const fileName = `STUDENT_DATA_${dateStr}.xlsx`;

            XLSX.writeFile(workbook, fileName);

            toast.success(`Exported ${fileName} successfully!`);
        } catch (error) {
            console.error("Excel export error:", error);
            toast.error("Failed to export Excel report.");
        }
    };

    // Datatable filtering & pagination calculations
    const filteredReportData = reportData.filter(r => {
        if (!tableSearch.trim()) return true;
        const query = tableSearch.toLowerCase();
        return Object.values(r).some(val =>
            val !== null && val !== undefined && String(val).toLowerCase().includes(query)
        );
    });

    const totalRecords = filteredReportData.length;
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = Math.min(startIndex + recordsPerPage, totalRecords);
    const currentItems = filteredReportData.slice(startIndex, endIndex);

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

    const displayHeaders = reportData.length > 0 ? Object.keys(reportData[0]) : selectedColumns;

    return (
        <div className="dbs-studentinfo-container">

            {/* SINGLE TOP CONTROL BAR (MATCHING SCREENSHOT) */}
            <div className="dbs-studentinfo-top-bar">
                <div className="dbs-student-fields-group">
                    <label className="dbs-student-fields-label">Student Fields</label>

                    {/* CUSTOM MULTI-SELECT DROPDOWN ("None selected") */}
                    <div className="dbs-multiselect-dropdown-wrapper" ref={dropdownRef}>
                        <button
                            type="button"
                            className="dbs-multiselect-btn"
                            onClick={() => setIsDropdownOpen(prev => !prev)}
                        >
                            <span className="dbs-multiselect-btn-text">{getDropdownButtonText()}</span>
                            <ChevronDown size={14} className="dbs-multiselect-arrow" />
                        </button>

                        {/* DROPDOWN POPUP MENU */}
                        {isDropdownOpen && (
                            <div className="dbs-multiselect-popup">
                                <div className="dbs-multiselect-option dbs-multiselect-header-option" onClick={handleToggleSelectAll}>
                                    <input
                                        type="checkbox"
                                        checked={availableColumns.length > 0 && selectedColumns.length === availableColumns.length}
                                        readOnly
                                    />
                                    <strong>Select All</strong>
                                </div>
                                <div className="dbs-multiselect-divider" />
                                <div className="dbs-multiselect-options-list">
                                    {availableColumns.map((colName, idx) => {
                                        const isChecked = selectedColumns.includes(colName);
                                        return (
                                            <div
                                                key={idx}
                                                className="dbs-multiselect-option"
                                                onClick={() => toggleColumnSelection(colName)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    readOnly
                                                />
                                                <span>{colName}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ACTION BUTTONS (Display, Cancel, Excel Export) */}
                <div className="dbs-studentinfo-actions-group">
                    <button
                        type="button"
                        className="dbs-btn-aspx-display"
                        onClick={() => handleDisplayReport()}
                        disabled={loading}
                    >
                        {loading ? <RefreshCw size={14} className="dbs-spin" /> : null}
                        <span>Display</span>
                    </button>

                    <button
                        type="button"
                        className="dbs-btn-aspx-cancel"
                        onClick={handleCancelReset}
                    >
                        <span>Cancel</span>
                    </button>

                    <button
                        type="button"
                        className="dbs-btn-aspx-excel"
                        onClick={handleExcelExport}
                        disabled={reportData.length === 0}
                    >
                        <span>Excel Export</span>
                    </button>
                </div>
            </div>

            {/* DATATABLE & EMPTY STATE CARD (MATCHING SCREENSHOT) */}
            <div className="dbs-dashboard-card dbs-datatable-card">

                {reportData.length > 0 && (
                    <div className="dbs-datatable-header-area">
                        <div>
                            <p className="dbs-table-subtitle">
                                Showing {filteredReportData.length} of {reportData.length} records {Object.keys(headerFilters).length > 0 && `| ${Object.keys(headerFilters).length} Header Filters Active`}
                            </p>
                        </div>

                        <div className="dbs-table-search-wrapper">
                            <Search size={16} className="dbs-table-search-icon" />
                            <input
                                type="text"
                                placeholder="Search records..."
                                value={tableSearch}
                                onChange={(e) => {
                                    setTableSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="dbs-table-search-input"
                            />
                        </div>
                    </div>
                )}

                <div className="dbs-table-container">
                    {loading ? (
                        <div className="dbs-empty-state">
                            <RefreshCw size={24} className="dbs-spin dbs-empty-state-icon" />
                            <div className="dbs-empty-state-title">Generating Student Information Report...</div>
                        </div>
                    ) : reportData.length === 0 ? (
                        /* EXACT ASPX EMPTY DATA TEMPLATE BAR DISPLAY (MATCHING SCREENSHOT) */
                        <div className="dbs-aspx-empty-data-bar">
                            <span>Student List is Empty...</span>
                        </div>
                    ) : (
                        <div className="dbs-table-card">
                            <div className="dbs-table-scroll active-scroll">
                                <table className="dbs-data-table">
                                    <thead>
                                        <tr>
                                            <th>S.No</th>
                                            {displayHeaders.map((headerKey, idx) => {
                                                const isFilterable = FILTERABLE_COLUMNS.some(fc => fc.toLowerCase() === headerKey.toLowerCase());
                                                const options = headerOptionsMap[headerKey] || [];
                                                const activeVal = headerFilters[headerKey] || "";

                                                return (
                                                    <th key={idx}>
                                                        <div className="dbs-header-cell-stacked">
                                                            <span>{headerKey}</span>
                                                            {isFilterable && (
                                                                <select
                                                                    className="dbs-header-filter-select"
                                                                    value={activeVal}
                                                                    onChange={(e) => handleHeaderFilterChange(headerKey, e.target.value)}
                                                                    onClick={() => fetchHeaderFilterOptions(headerKey)}
                                                                >
                                                                    <option value="Select">Select</option>
                                                                    {options.map((opt, optIdx) => (
                                                                        <option key={optIdx} value={opt}>{opt}</option>
                                                                    ))}
                                                                </select>
                                                            )}
                                                        </div>
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {currentItems.map((row, rowIdx) => (
                                            <tr key={rowIdx}>
                                                <td>{startIndex + rowIdx + 1}</td>
                                                {displayHeaders.map((headerKey, colIdx) => {
                                                    const cellVal = row[headerKey] !== null && row[headerKey] !== undefined ? String(row[headerKey]) : "";
                                                    return (
                                                        <td key={colIdx}>
                                                            {headerKey.toUpperCase().includes("REGISTRATION") || headerKey.toUpperCase().includes("REGNO") ? (
                                                                <strong className="dbs-font-mono dbs-text-primary">{cellVal}</strong>
                                                            ) : (
                                                                cellVal
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* COMMON FOOTER COMPONENT */}
                {reportData.length > 0 && (
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
                )}

            </div>

        </div>
    );
};

export default StudentInformation;