import React, { useState, useEffect } from "react";
import { Search, ArrowUpRight, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Footer from "../../../common/Footer";
import "./StudentPromotion.css";
import {
  getPromotionAcademicYears,
  getPromotionCourses,
  getPromotionBranches,
  getPromotionYears,
  getPromotionSemesters,
  getPromotionStudents,
  promoteStudents
} from "../../../apis/AdmissionsApis";

export const StudentPromotion: React.FC = () => {
  // Dropdowns state lists
  const [academicYearsList, setAcademicYearsList] = useState<any[]>([]);
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [branchesList, setBranchesList] = useState<any[]>([]);
  const [yearsList, setYearsList] = useState<any[]>([]);
  const [semestersList, setSemestersList] = useState<any[]>([]);

  // Promotion suggestion lists returned by API
  const [promoteYearsList, setPromoteYearsList] = useState<string[]>([]);
  const [promoteStudyYearsList, setPromoteStudyYearsList] = useState<string[]>([]);
  const [promoteSemsList, setPromoteSemsList] = useState<string[]>([]);

  // Search form state
  const [searchForm, setSearchForm] = useState({
    academicYear: "",
    course: "",
    branch: "",
    year: "",
    sem: "",
  });

  // Promote form state
  const [promoForm, setPromoForm] = useState({
    promoteYear: "",
    spromoteYear: "",
    promoteSem: "",
  });

  // Data table & UI state
  const [students, setStudents] = useState<any[]>([]);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(false);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [promoting, setPromoting] = useState<boolean>(false);

  // Pagination state for common Footer
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [recordsPerPage, setRecordsPerPage] = useState<number>(5);

  // Helper to extract item values safely
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

  // Initial load: Academic Years
  useEffect(() => {
    const fetchAcademicYears = async () => {
      setLoadingInitial(true);
      try {
        const res = await getPromotionAcademicYears();
        if (res.success && res.data) {
          setAcademicYearsList(res.data);
        }
      } catch (error) {
        toast.error("Failed to load academic years list.");
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchAcademicYears();
  }, []);

  // When Academic Year changes -> Load Courses & Semesters
  useEffect(() => {
    if (!searchForm.academicYear) {
      setCoursesList([]);
      setSemestersList([]);
      setBranchesList([]);
      setYearsList([]);
      return;
    }

    const fetchCoursesAndSems = async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          getPromotionCourses(searchForm.academicYear),
          getPromotionSemesters(searchForm.academicYear)
        ]);

        if (cRes.success && cRes.data) setCoursesList(cRes.data);
        if (sRes.success && sRes.data) setSemestersList(sRes.data);
      } catch (error) {
        console.error("Failed to load courses or semesters", error);
      }
    };

    fetchCoursesAndSems();
  }, [searchForm.academicYear]);

  // When Course changes -> Load Branches & Years
  useEffect(() => {
    if (!searchForm.course || !searchForm.academicYear) {
      setBranchesList([]);
      setYearsList([]);
      return;
    }

    const fetchBranchesAndYears = async () => {
      try {
        const [bRes, yRes] = await Promise.all([
          getPromotionBranches(searchForm.course, searchForm.academicYear),
          getPromotionYears(searchForm.course, searchForm.academicYear)
        ]);

        if (bRes.success && bRes.data) setBranchesList(bRes.data);
        if (yRes.success && yRes.data) setYearsList(yRes.data);
      } catch (error) {
        console.error("Failed to load branches or studying years", error);
      }
    };

    fetchBranchesAndYears();
  }, [searchForm.course, searchForm.academicYear]);

  // Search input change handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchForm(prev => {
      const next = { ...prev, [name]: value };
      if (name === "academicYear") {
        next.course = "";
        next.branch = "";
        next.year = "";
        next.sem = "";
      } else if (name === "course") {
        next.branch = "";
        next.year = "";
        next.sem = "";
      }
      return next;
    });
  };

  // Promote input change handler
  const handlePromoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPromoForm(prev => ({ ...prev, [name]: value }));
  };

  // Clear search form
  const handleClearSearch = () => {
    setSearchForm({
      academicYear: "",
      course: "",
      branch: "",
      year: "",
      sem: "",
    });
    setPromoForm({
      promoteYear: "",
      spromoteYear: "",
      promoteSem: "",
    });
    setStudents([]);
    setPromoteYearsList([]);
    setPromoteStudyYearsList([]);
    setPromoteSemsList([]);
    setCurrentPage(1);
  };

  // Display button -> Fetch students list & promotion suggestions
  const handleDisplay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchForm.academicYear || !searchForm.course || !searchForm.sem) {
      toast.error("Please select Academic Year, Course, and Sem.");
      return;
    }

    setLoadingStudents(true);
    try {
      const res = await getPromotionStudents({
        AcademicYear: searchForm.academicYear,
        CourseCode: searchForm.course,
        BranchCode: searchForm.branch,
        Year: searchForm.year,
        Semester: searchForm.sem,
      });

      if (res.success && res.data) {
        const stdList = res.data.studentsList || [];
        setStudents(stdList);
        setCurrentPage(1);

        const sug = res.data.suggestions || {};
        const pSems = sug.promoteSems || [];
        const pYears = sug.promoteYears || [];
        const pStudyYears = sug.promoteStudyYears || [];

        setPromoteSemsList(pSems);
        setPromoteYearsList(pYears);
        setPromoteStudyYearsList(pStudyYears);

        setPromoForm({
          promoteYear: pYears[0] || "",
          spromoteYear: pStudyYears[0] || "",
          promoteSem: pSems[0] || "",
        });

        if (stdList.length === 0) {
          toast.info("Student List is Empty..");
        } else {
          toast.success(`Found ${stdList.length} active student record(s).`);
        }
      }
    } catch (error) {
      toast.error("Failed to fetch student list for promotion.");
    } finally {
      setLoadingStudents(false);
    }
  };

  // Promote button -> Post promotion request
  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchForm.academicYear || !searchForm.course || students.length === 0 || !promoForm.promoteSem) {
      toast.error("Please select all required search & promotion fields before promoting.");
      return;
    }

    setPromoting(true);
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    //console.log(userData,"hi")
    try {
      const payload = {
        AcademicYear: searchForm.academicYear,
        Course: searchForm.course,
        Branch: searchForm.branch,
        Year: searchForm.year,
        Sem: searchForm.sem,
        PromoteSem: promoForm.promoteSem,
        PromoteYear: promoForm.promoteYear,
        SPromoteYear: promoForm.spromoteYear,
        UserId: userData.userId || "admin",
      };

      const res = await promoteStudents(payload);
      if (res.success) {
        toast.success(res.message || "Student Promoted Successfully..");
        handleClearSearch();
      } else {
        toast.error(res.message || "Failed to promote students.");
      }
    } catch (error) {
      toast.error("Error occurred while promoting students.");
    } finally {
      setPromoting(false);
    }
  };

  // Pagination logic
  const totalRecords = students.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = Math.min(startIndex + recordsPerPage, totalRecords);
  const currentItems = students.slice(startIndex, endIndex);

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
      <div className="dbs-admissions-form-header">
        <div>
          <h2>Student Promotion Console</h2>
          <p>Search active student batches and promote them to next academic level / semester</p>
        </div>
      </div>

      {/* 1. SEARCH STUDENTS CARD */}
      <form className="dbs-admissions-stepper-form-card" onSubmit={handleDisplay}>
        <div className="dbs-form-card">

          <div className="dbs-card-title-row">
            <h3>Search Students</h3>
            {loadingInitial && <RefreshCw size={16} className="dbs-spin dbs-text-primary ml-auto" />}
          </div>

          <div className="dbs-form-grid-3">

            {/* Academic Year */}
            <div className="dbs-input-box">
              <label>Academic Year *</label>
              <select
                name="academicYear"
                value={searchForm.academicYear}
                onChange={handleSearchChange}
              >
                <option value="">Select Academic Year</option>
                {academicYearsList.map((ay, idx) => {
                  const val = getItemValue(ay, "AcadamicYear", "ACADEMICYEAR");
                  return <option key={idx} value={val}>{val}</option>;
                })}
              </select>
            </div>

            {/* Course */}
            <div className="dbs-input-box">
              <label>Course *</label>
              <select
                name="course"
                value={searchForm.course}
                onChange={handleSearchChange}
                disabled={!searchForm.academicYear}
              >
                <option value="">Select Course</option>
                {coursesList.map((c, idx) => {
                  const code = getItemValue(c, "CourseCode", "COURSECODE");
                  const label = getItemLabel(c, "Course", "COURSE");
                  return <option key={idx} value={code}>{label}</option>;
                })}
              </select>
            </div>

            {/* Branch */}
            <div className="dbs-input-box">
              <label>Branch</label>
              <select
                name="branch"
                value={searchForm.branch}
                onChange={handleSearchChange}
                disabled={!searchForm.course}
              >
                <option value="">Select Branch</option>
                {branchesList.map((b, idx) => {
                  const code = getItemValue(b, "BranchCode", "BRANCHCODE");
                  const label = getItemLabel(b, "BranchName", "BranchCode");
                  return <option key={idx} value={code}>{label}</option>;
                })}
              </select>
            </div>

            {/* Year */}
            <div className="dbs-input-box">
              <label>Year</label>
              <select 
                name="year" 
                value={searchForm.year} 
                onChange={handleSearchChange}
                disabled={!searchForm.course}
              >
                <option value="">Select Year</option>
                {yearsList.length > 0 ? (
                  yearsList.map((y, idx) => {
                    const idVal = getItemValue(y, "ID", "SYear");
                    const dataVal = getItemLabel(y, "DATA", "SYear");
                    return <option key={idx} value={idVal}>{dataVal}</option>;
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

            {/* Sem */}
            <div className="dbs-input-box">
              <label>Sem *</label>
              <select 
                name="sem" 
                value={searchForm.sem} 
                onChange={handleSearchChange}
                disabled={!searchForm.academicYear}
              >
                <option value="">Select Sem</option>
                {semestersList.length > 0 ? (
                  semestersList.map((s, idx) => {
                    const val = getItemValue(s, "SSemester", "SSEMESTER");
                    return <option key={idx} value={val}>{val}</option>;
                  })
                ) : (
                  <>
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </>
                )}
              </select>
            </div>

          </div>

          {/* ACTION BUTTONS */}
          <div className="dbs-form-actions-row">

            <button type="submit" className="dbs-form-save-btn" disabled={loadingStudents}>
              {loadingStudents ? <RefreshCw size={16} className="dbs-spin" /> : <Search size={16} />}
              <span>{loadingStudents ? "Fetching..." : "Display"}</span>
            </button>

            <button
              type="button"
              className="dbs-form-cancel-btn"
              onClick={handleClearSearch}
            >
              Cancel
            </button>

          </div>

        </div>
      </form>

      {/* 2. PROMOTE STUDENTS CARD */}
      <form className="dbs-admissions-stepper-form-card" onSubmit={handlePromote}>
        <div className="dbs-form-card">

          <h3>Promote Students</h3>

          <div className="dbs-form-grid-3">

            {/* Promoted Academic Year */}
            <div className="dbs-input-box">
              <label>Academic Year *</label>
              <select
                name="promoteYear"
                value={promoForm.promoteYear}
                onChange={handlePromoChange}
                disabled={students.length === 0}
              >
                <option value="">Select Academic Year</option>
                {promoteYearsList.length > 0 ? (
                  promoteYearsList.map((py, idx) => <option key={idx} value={py}>{py}</option>)
                ) : (
                  <option value={searchForm.academicYear}>{searchForm.academicYear}</option>
                )}
              </select>
            </div>

            {/* Promoted Year (Studying Year) */}
            <div className="dbs-input-box">
              <label>Year</label>
              <select 
                name="spromoteYear" 
                value={promoForm.spromoteYear} 
                onChange={handlePromoChange}
                disabled={students.length === 0}
              >
                <option value="">Select Year</option>
                {promoteStudyYearsList.length > 0 ? (
                  promoteStudyYearsList.map((sy, idx) => <option key={idx} value={sy}>{sy}</option>)
                ) : (
                  <option value="All Year">All Year</option>
                )}
              </select>
            </div>

            {/* Promoted Sem */}
            <div className="dbs-input-box">
              <label>Sem *</label>
              <select 
                name="promoteSem" 
                value={promoForm.promoteSem} 
                onChange={handlePromoChange}
                disabled={students.length === 0}
              >
                <option value="">Select Sem</option>
                {promoteSemsList.length > 0 ? (
                  promoteSemsList.map((ps, idx) => <option key={idx} value={ps}>{ps}</option>)
                ) : (
                  <>
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </>
                )}
              </select>
            </div>

          </div>

          {/* PROMOTE BUTTON */}
          <div className="dbs-form-actions-row">

            <button type="submit" className="dbs-form-promote-btn" disabled={promoting || students.length === 0}>
              {promoting ? <RefreshCw size={16} className="dbs-spin" /> : <ArrowUpRight size={16} />}
              <span>{promoting ? "Promoting Students..." : "Promote"}</span>
            </button>

          </div>

        </div>
      </form>

      {/* 3. ENROLLED STUDENTS DATATABLE */}
      <div className="dbs-dashboard-card dbs-datatable-card">
        <div className="dbs-datatable-header-area">
          <div>
            <h3>Active Enrolled Students List</h3>
            <p>Showing {students.length} student records for promotion</p>
          </div>
        </div>

        {/* Table Container */}
        <div className="dbs-table-container">
          {loadingStudents ? (
            <div className="dbs-empty-state">
              <RefreshCw size={24} className="dbs-spin dbs-empty-state-icon" />
              <div className="dbs-empty-state-title">Loading student records...</div>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="dbs-empty-state">
              <AlertCircle className="dbs-empty-state-icon" />
              <div className="dbs-empty-state-title">No student records loaded</div>
              <div className="dbs-empty-state-desc">Select search parameters above and click Display to fetch active student list.</div>
            </div>
          ) : (
            <div className="dbs-table-card">
              <div className="dbs-table-scroll active-scroll">
                <table className="dbs-data-table">
                  <thead>
                    <tr>
                      <th>Sl. No</th>
                      <th>Student S.No.</th>
                      <th>Reg. No</th>
                      <th>Adm. Date</th>
                      <th>Student Name</th>
                      <th>Branch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((student, idx) => {
                      const slNo = startIndex + idx + 1;
                      const sNo = student.STUDENTSERIALNO || student.StudentSerialNo || "N/A";
                      const regNo = student.REGISTRATIONNO || student.RegistrationNo || "N/A";
                      const admDate = student.ADMISSIONDATE || student.AdmissionDate || "N/A";
                      const sName = student.SNAME || student.StudentName || "N/A";
                      const branchName = student.BranchName || student.BRANCHNAME || student.Branch || "N/A";

                      return (
                        <tr key={idx}>
                          <td>{slNo}</td>
                          <td><strong>{sNo}</strong></td>
                          <td className="dbs-font-mono dbs-text-primary">{regNo}</td>
                          <td>{admDate}</td>
                          <td className="dbs-table-student-name">{sName}</td>
                          <td className="dbs-table-branch-td">{branchName}</td>
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

    </div>
  );
};

export default StudentPromotion;