import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  Eye,
  Check,
  ArrowLeft,
  ArrowRight,
  Search,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  UserCheck,
  ShieldAlert,
  Award,
  CreditCard,
  GraduationCap,
  Users,
  User,
} from "lucide-react";
import { toast } from "sonner";
import "./Admissions.css";
import "./Admissions_VIew.css";
import {
  getBranch,
  getProgramme,
  getReguList,
  getYear,
} from "../../../apis/Common";
import {
  loadAdmissionData,
  loadAdmissionInitialFields,
} from "../../../apis/AdmissionsApis";
import { getPhotoSign } from "../../../utils/studentPhotoSignStorage";
import Footer from "../../../common/Footer";

// Form steps definition
const STEPS = [
  "Academic Info",
  "Student Details",
  "Parent Details",
  "Previous Education",
  "Fees Scope",
  "Review & Summary",
];

// Helper to convert DD-MM-YYYY or ISO dates to YYYY-MM-DD for <input type="date" />
const parseApiDate = (dateStr: any) => {
  if (!dateStr) return "";
  const s = String(dateStr).trim();
  if (!s || s === "null" || s === "undefined") return "";

  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // If DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const month = dmyMatch[2].padStart(2, "0");
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // If ISO string
  if (s.includes("T")) {
    return s.split("T")[0];
  }

  const timestamp = Date.parse(s);
  if (!isNaN(timestamp)) {
    return new Date(timestamp).toISOString().split("T")[0];
  }
  return "";
};

// Case-insensitive helper for extracting property values from backend objects
const getVal = (obj: any, ...keys: string[]) => {
  if (!obj) return "";
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  const objKeys = Object.keys(obj);
  for (const k of keys) {
    const matched = objKeys.find((ok) => ok.toLowerCase() === k.toLowerCase());
    if (matched && obj[matched] !== undefined && obj[matched] !== null) {
      return obj[matched];
    }
  }
  return "";
};

export const AdmissionView: React.FC = () => {
  const [studentData, setStudentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Active step state
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Photo & Signature previews (Read-only)
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [signaturePreview, setSignaturePreview] = useState<string>("");

  // Dropdown list states
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [regulations, setRegulations] = useState<any[]>([]);
  const [castes, setCastes] = useState<any[]>([]);
  const [phOptions, setPhOptions] = useState<any[]>([]);

  // Search & Filter state for students database
  const [tableSearch, setTableSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("All");
  const [filterBranch, setFilterBranch] = useState("All");
  const [filterSection, setFilterSection] = useState("All");
  const [sortBy, setSortBy] = useState<string>("sNo");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);

  // React Hook Form setup (View-only)
  const { register, reset, setValue, watch } = useForm({
    defaultValues: {
      // 1. Academic Info
      admDate: new Date().toISOString().split("T")[0],
      sNo: "",
      admNo: "",
      regNo: "",
      course: "01-B.Tech",
      branch: "05-COMPUTER SCIENCE AND ENGINEERING",
      admittedYear: "1",
      admittedSem: "1",
      year: "1",
      sem: "1",
      section: "A",
      joiningAcademicYear: "2026-2027",
      currentAcademicYear: "2026-2027",
      cet: "CET",
      hallTicket: "",
      rank: "",
      branchRank: "",
      jnanaBhumiId: "",
      regulation: "R23",
      libraryMemberGroup: "Student",
      apaarId: "",

      // 2. Student Details
      name: "",
      dob: "",
      gender: "Male",
      nationality: "Indian",
      motherTongue: "Telugu",
      religion: "Hindu",
      bloodGroup: "B+ve",
      differentlyAbled: "NO",
      caste: "OC",
      subcaste: "",
      category: "General",
      allottedQuota: "Convenor",
      modeOfAdmission: "CET",
      categoryOfAdmission: "Regular",
      mole1: "",
      mole2: "",
      studentMobile: "",
      studentEmail: "",
      address: "",
      state: "Andhra Pradesh",
      routePoint: "select route",
      rationCardNo: "",
      incomeCertNo: "",
      aadhaarNo: "",
      activeStatus: "Active",
      statusDate: new Date().toISOString().split("T")[0],
      statusReason: "Regular Admission",
      isActive: true,
      scholor: false,
      le: false,
      staffChild: false,
      nsp: false,

      // 3. Parent Details
      fatherName: "",
      fatherOccupation: "",
      fatherIncome: "",
      parentMobile: "",
      mobileNo1: "",
      mobileNo2: "",
      parentAadhaarNo: "",
      motherName: "",
      motherAadhaarNo: "",

      // 4. Previous Education
      sscSchool: "",
      sscMarks: "",
      sscHallTicket: "",
      sscBoard: "BSEAP",
      sscPassingDate: "",
      sscStudied: "",
      sscAggregate: "",
      interCollege: "",
      interMarks: "",
      interHallTicketNo: "",
      interBoardDetail: "BIEAP",
      interAggregateDetail: "",
      interPassingDateDetail: "",
      interMaths: "",
      interPhysics: "",
      interChemistry: "",
      ugCourse: "",
      ugCollege: "",
      ugMarks: "",
      ugHallTicket: "",
      ugUniversity: "",
      ugAggregateDetail: "",
      ugPassingDateDetail: "",
      ugRank: "",

      // 5. Fees Scope
      fee_admType: "",
      tuitionFee: "",
      miscellaneousfee: "",
      scholarshipAmount: "0",
      boysHostelFee: "0",
      ladiesHostelFee: "0",
      busFee: "0",
      donation: "0",
      spotFee: "0",
    },
  });

  const formData = watch();
  const selectedProgramme = watch("course");

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const res = await loadAdmissionData();
      if (res && Array.isArray(res)) {
        setStudentData(res);
        // Pre-select first student if available and none selected
        if (res.length > 0 && !selectedStudent) {
          handleViewStudent(res[0]);
        }
      }
    } catch (error) {
      console.error("Error loading admissions view data:", error);
      toast.error("Failed to load admissions data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  // Fetch initial fields from API
  useEffect(() => {
    const fetchInitialFields = async () => {
      try {
        const data = await loadAdmissionInitialFields();
        if (data) {
          if (data.caste) setCastes(data.caste);
          if (data.differentlyAbled) setPhOptions(data.differentlyAbled);
          if (data.regulation) setRegulations(data.regulation);
        }
      } catch (error) {
        console.error("Error loading initial fields:", error);
      }
    };
    fetchInitialFields();
  }, []);

  // Fetch programmes on mount
  useEffect(() => {
    const fetchProgrammes = async () => {
      try {
        const response = await getProgramme();
        if (response && response.data) {
          setProgrammes(response.data);
        }
      } catch (error) {
        console.error("Error fetching programmes:", error);
      }
    };
    fetchProgrammes();
  }, []);

  // Cascading Branch and Year dropdown fetch on Programme change
  useEffect(() => {
    if (selectedProgramme) {
      const courseCode = selectedProgramme.includes("-")
        ? selectedProgramme.split("-")[0].trim()
        : selectedProgramme.trim();

      const fetchBranchesAndYears = async () => {
        try {
          const [branchRes, yearRes] = await Promise.all([
            getBranch(courseCode),
            getYear(courseCode),
          ]);
          if (branchRes && branchRes.data) {
            setBranches(branchRes.data);
          }
          if (yearRes && yearRes.data) {
            setYears(yearRes.data);
          }
        } catch (error) {
          console.error("Error fetching branches and years:", error);
        }
      };
      fetchBranchesAndYears();
    } else {
      setBranches([]);
      setYears([]);
    }
  }, [selectedProgramme]);

  // Load a student into the View-only form
  const handleViewStudent = async (student: any) => {
    setSelectedStudent(student);

    const rawCourse = String(
      getVal(
        student,
        "programme",
        "course",
        "Course",
        "Programme",
        "PROGRAMME",
        "COURSE",
      ) || "01-B.Tech",
    );
    const courseCode = rawCourse.includes("-")
      ? rawCourse.split("-")[0].trim()
      : rawCourse.trim();

    // Preload branches and years for courseCode
    if (courseCode) {
      try {
        const [branchRes, yearRes] = await Promise.all([
          getBranch(courseCode),
          getYear(courseCode),
        ]);
        if (branchRes && branchRes.data) setBranches(branchRes.data);
        if (yearRes && yearRes.data) setYears(yearRes.data);
      } catch (e) {
        console.error("Error fetching dependent options for view:", e);
      }
    }

    const rawBranch = String(
      getVal(
        student,
        "branch",
        "BranchName",
        "branchName",
        "BRANCHNAME",
        "BRANCH",
      ) || "05-COMPUTER SCIENCE AND ENGINEERING",
    );
    const branchCode = rawBranch.includes("-")
      ? rawBranch.split("-")[0].trim()
      : rawBranch.trim();

    const rawAdmittedYear = String(
      getVal(student, "aYear", "AYEAR", "admittedYear", "admitted_year") || "1",
    );
    const rawStudyingYear = String(
      getVal(
        student,
        "sYear",
        "SYEAR",
        "year",
        "studyingYear",
        "studying_year",
      ) || "1",
    );

    const resolvedCourse =
      programmes.find(
        (p) =>
          String(p.courseCode || p.code || p.id).trim() === courseCode ||
          String(p.courseName || p.name).trim() === rawCourse,
      )?.courseCode || rawCourse;

    const resolvedBranch = branchCode || rawBranch;

    const rawPh = String(
      getVal(student, "ph", "PH", "differentlyAbled", "differently_abled") ||
        "NO",
    );
    const resolvedPh =
      rawPh.toUpperCase() === "YES" ||
      rawPh === "1" ||
      rawPh.toUpperCase() === "TRUE"
        ? "YES"
        : "NO";

    const formValues: any = {
      admDate: parseApiDate(
        getVal(
          student,
          "admissionDate",
          "admDate",
          "ADMISSIONDATE",
          "DateOfAdmission",
        ),
      ),
      sNo: String(
        getVal(
          student,
          "studentSerialNo",
          "sNo",
          "STUDENTSERIALNO",
          "serialNo",
        ),
      ),
      admNo: String(getVal(student, "admNo", "AdmNo", "ADMNO", "admissionNo")),
      regNo: String(
        getVal(student, "registrationNo", "regNo", "REGISTRATIONNO", "RegNo"),
      ),
      course: resolvedCourse,
      branch: resolvedBranch,
      admittedYear: rawAdmittedYear,
      admittedSem: String(
        getVal(student, "aSemester", "ASEMESTER", "admittedSem") || "1",
      ),
      year: rawStudyingYear,
      sem: String(
        getVal(student, "sSemester", "SSEMESTER", "sem", "SEMESTER") || "1",
      ),
      section: String(getVal(student, "section", "SECTION") || "A"),
      joiningAcademicYear: String(
        getVal(
          student,
          "jAcadamicYear",
          "joiningAcademicYear",
          "JACADAMICYEAR",
          "jAcademicYear",
        ) ||
          getVal(student, "acadamicYear", "ACADAMICYEAR") ||
          "2026-2027",
      ),
      currentAcademicYear: String(
        getVal(
          student,
          "acadamicYear",
          "ACADAMICYEAR",
          "academicYear",
          "currentAcademicYear",
        ) || "2026-2027",
      ),
      cet: String(
        getVal(student, "set", "SET", "cet", "CET", "modeofAdm", "MODEOFADM") ||
          "CET",
      ),
      hallTicket: String(
        getVal(student, "hallTicket", "HALLTICKET", "hallTicketNo"),
      ),
      rank: String(getVal(student, "rank", "RANK", "setRank", "SETRANK")),
      branchRank: String(
        getVal(student, "branchRank", "BRANCHRANK", "branch_rank"),
      ),
      jnanaBhumiId: String(getVal(student, "jnanaBhumiId", "JNANABHUMIID")),
      regulation: String(getVal(student, "regulation", "REGULATION") || "R23"),
      libraryMemberGroup: String(
        getVal(student, "librarymembergroup", "LIBRARYMEMBERGROUP") ||
          "Student",
      ),
      apaarId: String(getVal(student, "apaar", "APAAR", "apaarId")),
      name: String(
        getVal(student, "sName", "SNAME", "name", "studentName", "StudentName"),
      ),
      dob: parseApiDate(
        getVal(student, "dob", "DOB", "dateOfBirth", "DateOfBirth"),
      ),
      gender: String(getVal(student, "gender", "GENDER") || "Male"),
      nationality: String(
        getVal(student, "nationality", "NATIONALITY") || "Indian",
      ),
      motherTongue: String(
        getVal(student, "motherTongue", "MOTHERTONGUE") || "Telugu",
      ),
      religion: String(getVal(student, "religion", "RELIGION") || "Hindu"),
      bloodGroup: String(
        getVal(student, "bloodGrp", "BLOODGRP", "bloodGroup") || "B+ve",
      ),
      differentlyAbled: resolvedPh,
      caste: String(getVal(student, "caste", "CASTE") || "OC"),
      subcaste: String(getVal(student, "subCaste", "SUBCASTE", "subcaste")),
      category: String(getVal(student, "category", "CATEGORY") || "General"),
      allottedQuota: String(
        getVal(student, "allottedQuota", "ALLOTTEDQUOTA") || "Convenor",
      ),
      modeOfAdmission: String(
        getVal(student, "modeofAdm", "MODEOFADM") || "CET",
      ),
      categoryOfAdmission: String(
        getVal(student, "modeofCtgy", "MODEOFCTGY") || "Regular",
      ),
      mole1: String(getVal(student, "mole1", "MOLE1")),
      mole2: String(getVal(student, "mole2", "MOLE2")),
      studentMobile: String(
        getVal(student, "stdMobNo", "STDMOBNO", "studentMobile"),
      ),
      studentEmail: String(
        getVal(student, "emailid", "EMAILID", "studentEmail", "email"),
      ),
      address: String(getVal(student, "address", "ADDRESS")),
      state: String(
        getVal(student, "states", "STATES", "state", "STATE") ||
          "Andhra Pradesh",
      ),
      routePoint: String(
        getVal(student, "routePoint", "ROUTEPOINT") || "select route",
      ),
      rationCardNo: String(
        getVal(student, "rationcardNo", "RATIONCARDNO", "rationCardNo"),
      ),
      incomeCertNo: String(getVal(student, "icNo", "ICNO", "incomeCertNo")),
      aadhaarNo: String(getVal(student, "aadhaarNo", "AADHAARNO")),
      activeStatus: String(
        getVal(student, "status", "STATUS", "aStatus", "ASTATUS") || "Active",
      ),
      statusDate:
        parseApiDate(getVal(student, "date", "DATE", "statusDate")) ||
        new Date().toISOString().split("T")[0],
      statusReason: String(
        getVal(student, "reason", "REASON", "statusReason") ||
          "Regular Admission",
      ),
      isActive:
        getVal(student, "isactive", "ISACTIVE", "isActive") === ""
          ? true
          : Boolean(getVal(student, "isactive", "ISACTIVE", "isActive")),
      scholor: Boolean(getVal(student, "schlor", "SCHLOR", "scholor")),
      le: Boolean(getVal(student, "le", "LE")),
      staffChild: Boolean(
        getVal(student, "fac_Child", "FAC_CHILD", "staffChild"),
      ),
      nsp: Boolean(getVal(student, "nsp", "NSP")),
      fatherName: String(
        getVal(student, "fName", "FNAME", "fatherName", "FatherName"),
      ),
      fatherOccupation: String(
        getVal(student, "parentOccupation", "PARENTOCCUPATION"),
      ),
      fatherIncome: String(getVal(student, "income", "INCOME")),
      parentMobile: String(
        getVal(student, "parentMbNo", "PARENTMBNO", "parentMobile"),
      ),
      mobileNo1: String(getVal(student, "mobileNo1", "MOBILENO1")),
      mobileNo2: String(
        getVal(student, "parentMbNo2", "PARENTMBNO2", "mobileNo2"),
      ),
      parentAadhaarNo: String(
        getVal(student, "parentAadhaarNo", "PARENTAADHAARNO"),
      ),
      motherName: String(
        getVal(student, "mName", "MNAME", "motherName", "MotherName"),
      ),
      motherAadhaarNo: String(
        getVal(student, "mAadharNo", "MAADHARNO", "motherAadhaarNo"),
      ),
      sscSchool: String(
        getVal(student, "sscSchoolName", "SSCSCHOOLNAME", "sscSchool"),
      ),
      sscMarks: String(
        getVal(student, "sscMarksPercentage", "SSCMARKSPERCENTAGE"),
      ),
      sscHallTicket: String(
        getVal(student, "ssC_HallTicketNo", "SSC_HALLTICKETNO"),
      ),
      sscBoard: String(
        getVal(student, "ssC_Board", "SSC_BOARD", "sscBoard") || "BSEAP",
      ),
      sscPassingDate: String(
        getVal(student, "ssC_MYPassing", "SSC_MYPASSING", "sscPassingDate"),
      ),
      sscStudied: String(getVal(student, "sscStudied", "SSCSTUDIED")),
      sscAggregate: String(
        getVal(student, "ssC_Aggregate", "SSC_AGGREGATE", "sscAggregate"),
      ),
      interCollege: String(
        getVal(
          student,
          "lastAttendedCollegeName",
          "int_CollegeName",
          "interCollege",
        ),
      ),
      interMarks: String(
        getVal(
          student,
          "groupSubjectsMarksPercentage",
          "int_MarksPerc",
          "interMarks",
        ),
      ),
      interHallTicketNo: String(
        getVal(student, "int_HallTicketNo", "INT_HALLTICKETNO"),
      ),
      interBoardDetail: String(
        getVal(student, "int_Board", "INT_BOARD") || "BIEAP",
      ),
      interAggregateDetail: String(
        getVal(student, "int_Aggregate", "INT_AGGREGATE", "aggregate"),
      ),
      interPassingDateDetail: String(
        getVal(student, "int_MYPassing", "INT_MYPASSING", "myPassing"),
      ),
      interMaths: String(getVal(student, "maths", "MATHS")),
      interPhysics: String(getVal(student, "physics", "PHYSICS")),
      interChemistry: String(getVal(student, "chemistry", "CHEMISTRY")),
      ugCourse: String(getVal(student, "ugCourse", "UGCOURSE")),
      ugCollege: String(getVal(student, "uG_CollegeName", "UG_COLLEGENAME")),
      ugMarks: String(getVal(student, "uG_MarksPerc", "UG_MARKSPERC")),
      ugHallTicket: String(
        getVal(student, "uG_HallTicketNo", "UG_HALLTICKETNO"),
      ),
      ugUniversity: String(getVal(student, "uG_University", "UG_UNIVERSITY")),
      ugAggregateDetail: String(
        getVal(student, "uG_Aggregate", "UG_AGGREGATE"),
      ),
      ugPassingDateDetail: String(
        getVal(student, "uG_MYPassing", "UG_MYPASSING"),
      ),
      ugRank: String(getVal(student, "ugRank", "UGRANK")),
      fee_admType: String(getVal(student, "fee_admType", "FEE_ADMTYPE")),
      tuitionFee: String(getVal(student, "tuitionFee", "TUITIONFEE")),
      miscellaneousfee: String(
        getVal(student, "miscellaneousfee", "MISCELLANEOUSFEE"),
      ),
      scholarshipAmount: String(
        getVal(student, "schAmount", "SCHAMOUNT") || "0",
      ),
      boysHostelFee: String(getVal(student, "bhFee", "BHFEE") || "0"),
      ladiesHostelFee: String(getVal(student, "lhFee", "LHFEE") || "0"),
      busFee: String(getVal(student, "busFee", "BUSFEE") || "0"),
      donation: String(getVal(student, "donation", "DONATION") || "0"),
      spotFee: String(getVal(student, "spotAdmFee", "SPOTADMFEE") || "0"),
    };

    reset(formValues);
    Object.keys(formValues).forEach((key) => {
      setValue(key as any, formValues[key]);
    });

    const admNo = String(
      formValues.admNo ||
        getVal(student, "AdmNo", "ADMNO", "admNo", "admissionNo") ||
        "",
    ).trim();

    const regNo = String(
      formValues.regNo ||
        getVal(
          student,
          "REGISTRATIONNO",
          "regNo",
          "RegistrationNo",
          "studentSerialNo",
          "sNo",
        ) ||
        "",
    ).trim();

    const primaryKey = admNo || regNo;

    // Check Stu_Photo_Sign store for existing photo comparing with admission number
    let storedPhoto = admNo ? await getPhotoSign(`P-${admNo}`) : null;
    if (!storedPhoto && regNo && regNo !== admNo) {
      storedPhoto = await getPhotoSign(`P-${regNo}`);
    }

    if (storedPhoto) {
      setPhotoPreview(storedPhoto);
    } else if (primaryKey) {
      setPhotoPreview(
        `/src/pages/Admissions/Stu_Photo_Sign/P-${encodeURIComponent(primaryKey)}.jpg`,
      );
    } else {
      setPhotoPreview("");
    }

    // Check Stu_Photo_Sign store for existing signature comparing with admission number
    let storedSign = admNo ? await getPhotoSign(`S-${admNo}`) : null;
    if (!storedSign && regNo && regNo !== admNo) {
      storedSign = await getPhotoSign(`S-${regNo}`);
    }

    if (storedSign) {
      setSignaturePreview(storedSign);
    } else if (primaryKey) {
      setSignaturePreview(
        `/src/pages/Admissions/Stu_Photo_Sign/S-${encodeURIComponent(primaryKey)}.jpg`,
      );
    } else {
      setSignaturePreview("");
    }

    setCurrentStep(0);
    toast.info(`Viewing profile: ${formValues.name || "Student"}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter students database
  const filteredStudents = studentData.filter((s) => {
    const studentName = String(
      getVal(s, "SNAME", "sName", "StudentName", "name"),
    );
    const admNo = String(getVal(s, "AdmNo", "ADMNO", "admNo"));
    const sNo = String(getVal(s, "STUDENTSERIALNO", "studentSerialNo", "sNo"));
    const course = String(getVal(s, "Course", "COURSE", "programme"));
    const branch = String(getVal(s, "BranchName", "BRANCHNAME", "branch"));
    const section = String(getVal(s, "SECTION", "section"));

    const matchesSearch =
      studentName.toLowerCase().includes(tableSearch.toLowerCase()) ||
      admNo.toLowerCase().includes(tableSearch.toLowerCase()) ||
      sNo.toLowerCase().includes(tableSearch.toLowerCase());

    const matchesCourse =
      filterCourse === "All" || course.includes(filterCourse);
    const matchesBranch =
      filterBranch === "All" || branch.includes(filterBranch);
    const matchesSection = filterSection === "All" || section === filterSection;

    return matchesSearch && matchesCourse && matchesBranch && matchesSection;
  });

  // Sort students database
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let aVal = a[sortBy] || "";
    let bVal = b[sortBy] || "";

    if (typeof aVal === "string") aVal = aVal.toLowerCase();
    if (typeof bVal === "string") bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const totalRecords = filteredStudents.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage) || 1;
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const paginatedStudents = sortedStudents.slice(startIndex, endIndex);

  const getPagination = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push("...");
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="dbs-admissions-container">
      {/* HEADER CONTROLS */}
      <div className="dbs-admissions-form-header">
        <div>
          <h2>Student Admission Details (View Only)</h2>
          <p>
            {selectedStudent
              ? `Viewing record for: ${getVal(selectedStudent, "SNAME", "sName", "StudentName") || "Student"} (Adm No: ${getVal(selectedStudent, "AdmNo", "ADMNO", "admNo") || "N/A"})`
              : "Structured 6-Step Academic & Student Enrolment Console"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div className="dbs-autosave-indicator">
            <span className="dbs-autosave-saved">
              <Check size={14} /> Read-Only View Mode
            </span>
          </div>
        </div>
      </div>

      {/* --- 6-STEP HORIZONTAL STEPPER --- */}
      <div className="dbs-stepper-header-wrapper">
        {STEPS.map((step, idx) => {
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;
          return (
            <div
              key={idx}
              className="dbs-stepper-node-container"
              onClick={() => setCurrentStep(idx)}
              style={{ cursor: "pointer" }}
            >
              <div
                className={`dbs-stepper-circle ${isActive ? "dbs-step-active" : ""} ${isCompleted ? "dbs-step-completed" : ""}`}
              >
                {idx + 1}
              </div>
              <span
                className={`dbs-stepper-label ${isActive ? "dbs-step-label-active" : ""}`}
              >
                {step}
              </span>
              {idx < STEPS.length - 1 && (
                <div
                  className={`dbs-stepper-line ${isCompleted ? "dbs-step-line-completed" : ""}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* MULTI-STEP SLIDES CONTAINER (VIEW ONLY)                   */}
      {/* ========================================================= */}
      <div>
        {/* STEP 1: Academic Info */}
        {currentStep === 0 && (
          <div className="dbs-stepper-slide">
            <div className="dbs-form-card">
              <div className="dbs-card-title-row">
                <GraduationCap className="dbs-card-title-icon" size={20} />
                <h3>1. Academic Info - Admission / Academic Details</h3>
              </div>
              <div className="dbs-form-grid-3">
                <div className="dbs-input-box">
                  <label>Date of Admission</label>
                  <input type="date" {...register("admDate")} disabled />
                </div>

                <div className="dbs-input-box">
                  <label>Student Serial No.</label>
                  <input
                    type="text"
                    {...register("sNo")}
                    placeholder="Auto Generated S.No"
                    disabled
                  />
                </div>

                <div className="dbs-input-box">
                  <label>Admission Number</label>
                  <input
                    type="text"
                    {...register("admNo")}
                    placeholder="Enter Admission No"
                    disabled
                  />
                </div>

                <div className="dbs-input-box">
                  <label>Registration Number</label>
                  <input
                    type="text"
                    {...register("regNo")}
                    placeholder="Enter Registration No"
                    disabled
                  />
                </div>

                <div className="dbs-input-box">
                  <label>Programme / Course</label>
                  <select {...register("course")} disabled>
                    {programmes.map((p) => {
                      const code = p.courseCode || p.code || p.id;
                      const name = p.courseName || p.name;
                      return (
                        <option key={code} value={code}>
                          {code}-{name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="dbs-input-box">
                  <label>Branch</label>
                  <select {...register("branch")} disabled>
                    {branches.map((b) => {
                      const code = b.branchCode || b.code || b.id;
                      const name = b.branchName || b.name;
                      return (
                        <option key={code} value={code}>
                          {code}-{name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="dbs-input-box">
                  <label>Admitted Year</label>
                  <select {...register("admittedYear")} disabled>
                    {years.map((y) => {
                      const val = String(y.year || y.id || y.name || y);
                      return (
                        <option key={val} value={val}>
                          Year {val}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="dbs-input-box">
                  <label>Admitted Semester</label>
                  <select {...register("admittedSem")} disabled>
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                </div>

                <div className="dbs-input-box">
                  <label>Studying Year</label>
                  <select {...register("year")} disabled>
                    {years.map((y) => {
                      const val = String(y.year || y.id || y.name || y);
                      return (
                        <option key={val} value={val}>
                          Year {val}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="dbs-input-box">
                  <label>Studying Semester</label>
                  <select {...register("sem")} disabled>
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                </div>

                <div className="dbs-input-box">
                  <label>Section</label>
                  <select {...register("section")} disabled>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                <div className="dbs-input-box">
                  <label>Joining Academic Year</label>
                  <input
                    type="text"
                    {...register("joiningAcademicYear")}
                    disabled
                  />
                </div>

                <div className="dbs-input-box">
                  <label>Current Academic Year</label>
                  <input
                    type="text"
                    {...register("currentAcademicYear")}
                    disabled
                  />
                </div>

                <div className="dbs-input-box">
                  <label>Common Entrance Test (CET)</label>
                  <input type="text" {...register("cet")} disabled />
                </div>

                <div className="dbs-input-box">
                  <label>CET Hall Ticket Number</label>
                  <input type="text" {...register("hallTicket")} disabled />
                </div>

                <div className="dbs-input-box">
                  <label>CET Rank</label>
                  <input type="text" {...register("rank")} disabled />
                </div>

                <div className="dbs-input-box">
                  <label>CET Branch Rank</label>
                  <input type="text" {...register("branchRank")} disabled />
                </div>

                <div className="dbs-input-box">
                  <label>JnanaBhumi Student ID</label>
                  <input type="text" {...register("jnanaBhumiId")} disabled />
                </div>

                <div className="dbs-input-box">
                  <label>Regulation</label>
                  <select {...register("regulation")} disabled>
                    {regulations.map((r) => {
                      const regVal = String(r.regulation || r.name || r);
                      return (
                        <option key={regVal} value={regVal}>
                          {regVal}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="dbs-input-box">
                  <label>Library Member Group</label>
                  <input
                    type="text"
                    {...register("libraryMemberGroup")}
                    disabled
                  />
                </div>

                <div className="dbs-input-box">
                  <label>APAAR / ABC ID</label>
                  <input type="text" {...register("apaarId")} disabled />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Student Details */}
        {currentStep === 1 && (
          <div className="dbs-stepper-slide">
            <div className="dbs-student-details-split-layout">
              <div className="dbs-student-details-main-pane flex-2">
                {/* 2.1 Personal Identification */}
                <div className="dbs-form-card">
                  <div className="dbs-card-title-row">
                    <User className="dbs-card-title-icon" size={20} />
                    <h3>2.1 Personal Identification</h3>
                  </div>
                  <div className="dbs-form-grid-3">
                    <div className="dbs-input-box dbs-grid-col-span-2">
                      <label>Full Student Name (BLOCK LETTERS)</label>
                      <input
                        type="text"
                        style={{ textTransform: "uppercase" }}
                        {...register("name")}
                        disabled
                      />
                    </div>

                    <div className="dbs-input-box">
                      <label>Date of Birth</label>
                      <input type="date" {...register("dob")} disabled />
                    </div>

                    <div className="dbs-input-box">
                      <label>Gender</label>
                      <select {...register("gender")} disabled>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Transgender">Transgender</option>
                      </select>
                    </div>

                    <div className="dbs-input-box">
                      <label>Nationality</label>
                      <input
                        type="text"
                        {...register("nationality")}
                        disabled
                      />
                    </div>

                    <div className="dbs-input-box">
                      <label>Mother Tongue</label>
                      <input
                        type="text"
                        {...register("motherTongue")}
                        disabled
                      />
                    </div>

                    <div className="dbs-input-box">
                      <label>Religion</label>
                      <input type="text" {...register("religion")} disabled />
                    </div>

                    <div className="dbs-input-box">
                      <label>Blood Group</label>
                      <select {...register("bloodGroup")} disabled>
                        <option value="A+ve">A+ve</option>
                        <option value="A-ve">A-ve</option>
                        <option value="B+ve">B+ve</option>
                        <option value="B-ve">B-ve</option>
                        <option value="O+ve">O+ve</option>
                        <option value="O-ve">O-ve</option>
                        <option value="AB+ve">AB+ve</option>
                        <option value="AB-ve">AB-ve</option>
                      </select>
                    </div>

                    <div className="dbs-input-box">
                      <label>Differently Abled (PH)</label>
                      <select {...register("differentlyAbled")} disabled>
                        {phOptions.map((ph) => {
                          const phVal = String(ph.name || ph.status || ph);
                          return (
                            <option key={phVal} value={phVal}>
                              {phVal}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="dbs-input-box">
                      <label>Caste Category</label>
                      <select {...register("caste")} disabled>
                        {castes.map((c) => {
                          const cVal = String(c.caste || c.name || c);
                          return (
                            <option key={cVal} value={cVal}>
                              {cVal}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="dbs-input-box">
                      <label>Subcaste</label>
                      <input type="text" {...register("subcaste")} disabled />
                    </div>

                    <div className="dbs-input-box">
                      <label>Category</label>
                      <select {...register("category")} disabled>
                        <option value="General">General</option>
                        <option value="OBC">OBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                      </select>
                    </div>

                    <div className="dbs-input-box">
                      <label>Allotted Quota</label>
                      <select {...register("allottedQuota")} disabled>
                        <option value="Convenor">Convenor Quota</option>
                        <option value="Management">Management Quota</option>
                        <option value="Spot">Spot Admission</option>
                      </select>
                    </div>

                    <div className="dbs-input-box">
                      <label>Mode of Admission</label>
                      <select {...register("modeOfAdmission")} disabled>
                        <option value="CET">CET Counselling</option>
                        <option value="Spot">Spot Round</option>
                        <option value="Management">Management Direct</option>
                      </select>
                    </div>

                    <div className="dbs-input-box">
                      <label>Category of Admission</label>
                      <select {...register("categoryOfAdmission")} disabled>
                        <option value="Regular">Regular Admission</option>
                        <option value="Lateral Entry">Lateral Entry</option>
                        <option value="Transfer">College Transfer</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2.2 Contact Information */}
                <div className="dbs-form-card">
                  <div className="dbs-card-title-row">
                    <UserCheck className="dbs-card-title-icon" size={20} />
                    <h3>2.2 Identification Moles & Address Details</h3>
                  </div>
                  <div className="dbs-form-grid-3">
                    <div className="dbs-input-box dbs-grid-col-span-3">
                      <label>Personal Identification Mole 1</label>
                      <input type="text" {...register("mole1")} disabled />
                    </div>

                    <div className="dbs-input-box dbs-grid-col-span-3">
                      <label>Personal Identification Mole 2</label>
                      <input type="text" {...register("mole2")} disabled />
                    </div>

                    <div className="dbs-input-box">
                      <label>Student Mobile Number</label>
                      <input
                        type="text"
                        {...register("studentMobile")}
                        disabled
                      />
                    </div>

                    <div className="dbs-input-box dbs-grid-col-span-2">
                      <label>Student Email Address</label>
                      <input
                        type="email"
                        {...register("studentEmail")}
                        disabled
                      />
                    </div>

                    <div className="dbs-input-box dbs-grid-col-span-3">
                      <label>Permanent Residential Address</label>
                      <textarea rows={2} {...register("address")} disabled />
                    </div>

                    <div className="dbs-input-box">
                      <label>State</label>
                      <input type="text" {...register("state")} disabled />
                    </div>

                    <div className="dbs-input-box">
                      <label>Route Point (College Transport)</label>
                      <input type="text" {...register("routePoint")} disabled />
                    </div>

                    <div className="dbs-input-box">
                      <label>Ration Card Number</label>
                      <input
                        type="text"
                        {...register("rationCardNo")}
                        disabled
                      />
                    </div>

                    <div className="dbs-input-box">
                      <label>Income Certificate No.</label>
                      <input
                        type="text"
                        {...register("incomeCertNo")}
                        disabled
                      />
                    </div>

                    <div className="dbs-input-box">
                      <label>Student Aadhaar Number</label>
                      <input type="text" {...register("aadhaarNo")} disabled />
                    </div>
                  </div>
                </div>

                {/* 2.3 Other Student Details */}
                <div className="dbs-form-card">
                  <div className="dbs-card-title-row">
                    <ShieldAlert className="dbs-card-title-icon" size={20} />
                    <h3>Other Student Details & Flags</h3>
                  </div>
                  <div className="dbs-form-grid-3">
                    <div className="dbs-input-box">
                      <label>Active Status</label>
                      <select {...register("activeStatus")} disabled>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Detained">Detained</option>
                        <option value="Discontinued">Discontinued</option>
                      </select>
                    </div>

                    <div className="dbs-input-box">
                      <label>Status Date</label>
                      <input type="date" {...register("statusDate")} disabled />
                    </div>
                    <div className="dbs-input-box dbs-grid-col-span-3">
                      <label>Status Reason</label>
                      <input
                        type="text"
                        {...register("statusReason")}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="dbs-flags-pill-row mt-3">
                    <label className="dbs-toggle-switch-label">
                      <input
                        type="checkbox"
                        {...register("isActive")}
                        disabled
                      />
                      <span className="dbs-toggle-pill-text">IsActive</span>
                    </label>
                    <label className="dbs-toggle-switch-label">
                      <input
                        type="checkbox"
                        {...register("scholor")}
                        disabled
                      />
                      <span className="dbs-toggle-pill-text">Scholor</span>
                    </label>
                    <label className="dbs-toggle-switch-label">
                      <input type="checkbox" {...register("le")} disabled />
                      <span className="dbs-toggle-pill-text">
                        Lateral Entry (LE)
                      </span>
                    </label>
                    <label className="dbs-toggle-switch-label">
                      <input
                        type="checkbox"
                        {...register("staffChild")}
                        disabled
                      />
                      <span className="dbs-toggle-pill-text">Staff Child</span>
                    </label>
                    <label className="dbs-toggle-switch-label">
                      <input type="checkbox" {...register("nsp")} disabled />
                      <span className="dbs-toggle-pill-text">NSP Scholar</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Photo & Signature Preview Panel */}
              <div className="dbs-form-card dbs-photo-upload-card flex-1">
                <h3>Student Photo & Signature</h3>

                <div className="dbs-upload-items-wrapper">
                  {/* Student Photo */}
                  <div className="dbs-upload-item">
                    <div className="dbs-upload-item-header">
                      <div>
                        <label className="dbs-upload-item-title">
                          Student Photo
                        </label>
                        <span className="dbs-upload-item-subtitle">
                          Passport-size photograph
                        </span>
                      </div>
                    </div>

                    <div className="dbs-photo-preview-box">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Student Preview"
                          className="dbs-preview-student-img"
                          onError={() => setPhotoPreview("")}
                        />
                      ) : (
                        <div className="dbs-upload-placeholder">
                          <User size={32} />
                          <span>No Photo Attached</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="dbs-upload-divider" />

                  {/* Student Signature */}
                  <div className="dbs-upload-item dbs-signature-upload-item">
                    <div className="dbs-upload-item-header">
                      <div>
                        <label className="dbs-upload-item-title">
                          Student Signature
                        </label>
                        <span className="dbs-upload-item-subtitle">
                          Official signature
                        </span>
                      </div>
                    </div>

                    <div className="dbs-signature-preview-box">
                      {signaturePreview ? (
                        <img
                          src={signaturePreview}
                          alt="Signature Preview"
                          className="dbs-preview-student-img"
                          onError={() => setSignaturePreview("")}
                        />
                      ) : (
                        <div className="dbs-upload-placeholder dbs-signature-placeholder">
                          <UserCheck size={32} />
                          <span>No Signature Attached</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Parent Details */}
        {currentStep === 2 && (
          <div className="dbs-stepper-slide">
            <div className="dbs-flex-col-gap">
              <div className="dbs-form-card">
                <div className="dbs-card-title-row">
                  <Users className="dbs-card-title-icon" size={20} />
                  <h3>3.1 Father / Primary Guardian Information</h3>
                </div>
                <div className="dbs-form-grid-3">
                  <div className="dbs-input-box">
                    <label>Father's Full Name</label>
                    <input type="text" {...register("fatherName")} disabled />
                  </div>

                  <div className="dbs-input-box">
                    <label>Father's Occupation</label>
                    <input
                      type="text"
                      {...register("fatherOccupation")}
                      disabled
                    />
                  </div>

                  <div className="dbs-input-box">
                    <label>Annual Family Income (₹)</label>
                    <input type="text" {...register("fatherIncome")} disabled />
                  </div>

                  <div className="dbs-input-box">
                    <label>Parent Primary Mobile</label>
                    <input type="text" {...register("parentMobile")} disabled />
                  </div>

                  <div className="dbs-input-box">
                    <label>Alternative Mobile No. 1</label>
                    <input type="text" {...register("mobileNo1")} disabled />
                  </div>

                  <div className="dbs-input-box">
                    <label>Emergency Mobile No. 2</label>
                    <input type="text" {...register("mobileNo2")} disabled />
                  </div>

                  <div className="dbs-input-box">
                    <label>Father / Guardian Aadhaar Number</label>
                    <input
                      type="text"
                      {...register("parentAadhaarNo")}
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className="dbs-form-card">
                <div className="dbs-card-title-row">
                  <Users className="dbs-card-title-icon" size={20} />
                  <h3>3.2 Mother Information</h3>
                </div>
                <div className="dbs-form-grid-3">
                  <div className="dbs-input-box">
                    <label>Mother's Full Name</label>
                    <input type="text" {...register("motherName")} disabled />
                  </div>

                  <div className="dbs-input-box">
                    <label>Mother's Aadhaar Number</label>
                    <input
                      type="text"
                      {...register("motherAadhaarNo")}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Previous Education */}
        {currentStep === 3 && (
          <div className="dbs-stepper-slide">
            <div className="dbs-flex-col-gap">
              {/* 4.1 Secondary School Certificate (SSC) */}
              <div className="dbs-form-card">
                <div className="dbs-card-title-row">
                  <Award className="dbs-card-title-icon" size={20} />
                  <h3>
                    4.1 Secondary School Certificate (SSC / 10th Standard)
                  </h3>
                </div>
                <div className="dbs-form-grid-3">
                  <div className="dbs-input-box dbs-grid-col-span-2">
                    <label>SSC School Name</label>
                    <input type="text" {...register("sscSchool")} disabled />
                  </div>

                  <div className="dbs-input-box">
                    <label>SSC Percentage / CGPA</label>
                    <input type="text" {...register("sscMarks")} disabled />
                  </div>

                  <div className="dbs-input-box">
                    <label>SSC Hall Ticket Number</label>
                    <input
                      type="text"
                      {...register("sscHallTicket")}
                      disabled
                    />
                  </div>

                  <div className="dbs-input-box">
                    <label>SSC Board of Examination</label>
                    <input type="text" {...register("sscBoard")} disabled />
                  </div>

                  <div className="dbs-input-box">
                    <label>SSC Month & Year of Passing</label>
                    <input
                      type="text"
                      {...register("sscPassingDate")}
                      disabled
                    />
                  </div>

                  <div className="dbs-input-box">
                    <label>Medium of Instruction</label>
                    <input type="text" {...register("sscStudied")} disabled />
                  </div>

                  <div className="dbs-input-box">
                    <label>SSC Aggregate Score</label>
                    <input type="text" {...register("sscAggregate")} disabled />
                  </div>
                </div>
              </div>

              {/* 4.2 Intermediate / +2 Standard */}
              <div className="dbs-form-card">
                <div className="dbs-card-title-row">
                  <Award className="dbs-card-title-icon" size={20} />
                  <h3>4.2 Intermediate / Higher Secondary (+2 / Diploma)</h3>
                </div>
                <div className="dbs-form-grid-3">
                  <div className="dbs-input-box dbs-grid-col-span-2">
                    <label>Intermediate College Name</label>
                    <input type="text" {...register("interCollege")} disabled />
                  </div>

                  <div className="dbs-input-box">
                    <label>Inter Group Marks (%)</label>
                    <input type="text" {...register("interMarks")} disabled />
                  </div>

                  <div className="dbs-input-box">
                    <label>Inter Hall Ticket Number</label>
                    <input
                      type="text"
                      {...register("interHallTicketNo")}
                      disabled
                    />
                  </div>

                  <div className="dbs-input-box">
                    <label>Inter Board of Education</label>
                    <input
                      type="text"
                      {...register("interBoardDetail")}
                      disabled
                    />
                  </div>

                  <div className="dbs-input-box">
                    <label>Inter Aggregate Total</label>
                    <input
                      type="text"
                      {...register("interAggregateDetail")}
                      disabled
                    />
                  </div>

                  <div className="dbs-input-box">
                    <label>Month & Year of Passing</label>
                    <input
                      type="text"
                      {...register("interPassingDateDetail")}
                      disabled
                    />
                  </div>

                  <div className="dbs-input-box">
                    <label>Mathematics Marks</label>
                    <input type="text" {...register("interMaths")} disabled />
                  </div>

                  <div className="dbs-input-box">
                    <label>Physics Marks</label>
                    <input type="text" {...register("interPhysics")} disabled />
                  </div>

                  <div className="dbs-input-box">
                    <label>Chemistry Marks</label>
                    <input
                      type="text"
                      {...register("interChemistry")}
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* 4.3 Undergraduate Details */}
              <div className="dbs-form-card">
                <div className="dbs-card-title-row">
                  <GraduationCap className="dbs-card-title-icon" size={20} />
                  <h3>4.3 Undergraduate Degree Details (If Applicable)</h3>
                </div>
                <div className="dbs-form-grid-3">
                  <div className="dbs-input-box">
                    <label>UG Course Degree</label>
                    <input type="text" {...register("ugCourse")} disabled />
                  </div>

                  <div className="dbs-input-box">
                    <label>UG College Name</label>
                    <input type="text" {...register("ugCollege")} disabled />
                  </div>

                  <div className="dbs-input-box">
                    <label>UG Marks Percentage / CGPA</label>
                    <input type="text" {...register("ugMarks")} disabled />
                  </div>

                  <div className="dbs-input-box">
                    <label>UG Hall Ticket Number</label>
                    <input type="text" {...register("ugHallTicket")} disabled />
                  </div>

                  <div className="dbs-input-box">
                    <label>Affiliated University</label>
                    <input type="text" {...register("ugUniversity")} disabled />
                  </div>

                  <div className="dbs-input-box">
                    <label>UG Aggregate Percentage</label>
                    <input
                      type="text"
                      {...register("ugAggregateDetail")}
                      disabled
                    />
                  </div>

                  <div className="dbs-input-box">
                    <label>UG Month & Year of Passing</label>
                    <input
                      type="text"
                      {...register("ugPassingDateDetail")}
                      disabled
                    />
                  </div>

                  <div className="dbs-input-box">
                    <label>UG Entrance Rank</label>
                    <input type="text" {...register("ugRank")} disabled />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Fees Scope */}
        {currentStep === 4 && (
          <div className="dbs-stepper-slide">
            <div className="dbs-form-card">
              <div className="dbs-card-title-row">
                <CreditCard className="dbs-card-title-icon" size={20} />
                <h3>5. Fees Scope & Scholarship Allocations</h3>
              </div>
              <div className="dbs-form-grid-3">
                <div className="dbs-input-box">
                  <label>Fee Admission Type</label>
                  <input type="text" {...register("fee_admType")} disabled />
                </div>

                <div className="dbs-input-box">
                  <label>Tuition Fee (₹)</label>
                  <input type="text" {...register("tuitionFee")} disabled />
                </div>

                <div className="dbs-input-box">
                  <label>Miscellaneous Fee (₹)</label>
                  <input
                    type="text"
                    {...register("miscellaneousfee")}
                    disabled
                  />
                </div>

                <div className="dbs-input-box">
                  <label>Scholarship Amount (₹)</label>
                  <input
                    type="text"
                    {...register("scholarshipAmount")}
                    disabled
                  />
                </div>

                <div className="dbs-input-box">
                  <label>Spot Admission Fee (₹)</label>
                  <input type="text" {...register("spotFee")} disabled />
                </div>

                <div className="dbs-input-box">
                  <label>Boys Hostel Fee (₹)</label>
                  <input type="text" {...register("boysHostelFee")} disabled />
                </div>

                <div className="dbs-input-box">
                  <label>Ladies Hostel Fee (₹)</label>
                  <input
                    type="text"
                    {...register("ladiesHostelFee")}
                    disabled
                  />
                </div>

                <div className="dbs-input-box">
                  <label>Bus / Transport Fee (₹)</label>
                  <input type="text" {...register("busFee")} disabled />
                </div>

                <div className="dbs-input-box">
                  <label>Donation Fee (₹)</label>
                  <input type="text" {...register("donation")} disabled />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Review & Summary */}
        {currentStep === 5 && (
          <div className="dbs-stepper-slide">
            <div className="dbs-form-card dbs-review-card">
              <h3>Student Registration Overview</h3>
              <p className="dbs-review-warning">
                Academic allocation, identity details, parent contacts, and fee
                summary.
              </p>

              <div className="dbs-review-grid">
                <div className="dbs-review-item">
                  <strong>Student Name:</strong> {formData.name || "N/A"}
                </div>
                <div className="dbs-review-item">
                  <strong>Date of Admission:</strong>{" "}
                  {formData.admDate || "N/A"}
                </div>
                <div className="dbs-review-item">
                  <strong>Programme & Branch:</strong> {formData.course} -{" "}
                  {formData.branch}
                </div>
                <div className="dbs-review-item">
                  <strong>Year & Section:</strong> Year {formData.year}, Sem{" "}
                  {formData.sem} ({formData.section})
                </div>
                <div className="dbs-review-item">
                  <strong>Father's Name:</strong> {formData.fatherName || "N/A"}
                </div>
                <div className="dbs-review-item">
                  <strong>Parent Contact:</strong>{" "}
                  {formData.parentMobile || "N/A"}
                </div>
                <div className="dbs-review-item">
                  <strong>Aadhaar Number:</strong> {formData.aadhaarNo || "N/A"}
                </div>
                <div className="dbs-review-item">
                  <strong>Scholarship Amount:</strong> ₹
                  {formData.scholarshipAmount || "0"}
                </div>
                <div className="dbs-review-item">
                  <strong>Spot Fee:</strong> ₹{formData.spotFee || "0"}
                </div>
                <div className="dbs-review-item">
                  <strong>Boys Hostel Fee:</strong> ₹
                  {formData.boysHostelFee || "0"}
                </div>
                <div className="dbs-review-item">
                  <strong>Ladies Hostel Fee:</strong> ₹
                  {formData.ladiesHostelFee || "0"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- NAVIGATION FOOTER BUTTONS --- */}
        <div className="dbs-stepper-actions-row">
          <button
            type="button"
            className="dbs-stepper-back-btn"
            onClick={() => {
              setCurrentStep((prev) => Math.max(0, prev - 1));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={currentStep === 0}
          >
            <ArrowLeft size={16} />
            <span>Previous</span>
          </button>

          {currentStep < STEPS.length - 1 && (
            <button
              type="button"
              className="dbs-stepper-next-btn"
              onClick={() => {
                setCurrentStep((prev) => Math.min(STEPS.length - 1, prev + 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <span>Next Step</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. ADMISSIONS DATABASE GRID TABLE                          */}
      {/* ========================================================= */}
      <div className="dbs-table-card">
        <div className="dbs-table-header-container">
          <div className="dbs-table-title-group">
            <h3>Admissions Registry Directory</h3>
            <span className="dbs-table-counter-badge">
              {filteredStudents.length} Records
            </span>
          </div>

          <div className="dbs-table-controls-row">
            <div className="dbs-search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search name, admission no, serial no..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
              />
            </div>

            <div className="dbs-filter-box">
              <Filter size={16} />
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
              >
                <option value="All">All Courses</option>
                {programmes.map((p) => {
                  const code = p.courseCode || p.code || p.id;
                  const name = p.courseName || p.name;
                  return (
                    <option key={code} value={code}>
                      {name || code}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="dbs-filter-box">
              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
              >
                <option value="All">All Branches</option>
                {branches.map((b) => {
                  const code = b.branchCode || b.code || b.id;
                  const name = b.branchName || b.name;
                  return (
                    <option key={code} value={code}>
                      {name || code}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="dbs-filter-box">
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
              >
                <option value="All">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>
            </div>

            <button
              className="dbs-refresh-btn"
              onClick={fetchAdmissions}
              title="Refresh Registry Data"
            >
              <RefreshCw size={16} className={loading ? "dbs-spin" : ""} />
            </button>
          </div>
        </div>

        <div className="dbs-table-container">
          <table className="dbs-custom-table">
            <thead>
              <tr>
                <th
                  onClick={() => setSortBy("sNo")}
                  style={{ cursor: "pointer" }}
                >
                  S.No / Serial
                </th>
                <th
                  onClick={() => setSortBy("admNo")}
                  style={{ cursor: "pointer" }}
                >
                  Adm No
                </th>
                <th
                  onClick={() => setSortBy("name")}
                  style={{ cursor: "pointer" }}
                >
                  Student Name
                </th>
                <th>Course & Branch</th>
                <th>Year / Sem / Sec</th>
                <th>Caste / Category</th>
                <th>Quota / Mode</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    <RefreshCw
                      className="dbs-spin"
                      size={24}
                      style={{ margin: "0 auto 10px auto" }}
                    />
                    <p>Loading Admissions registry...</p>
                  </td>
                </tr>
              ) : paginatedStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    <FileSpreadsheet
                      size={32}
                      style={{
                        margin: "0 auto 10px auto",
                        color: "var(--dbs-text-muted)",
                      }}
                    />
                    <p>No student admission records found.</p>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student, idx) => {
                  const studentSNo = String(
                    getVal(
                      student,
                      "STUDENTSERIALNO",
                      "studentSerialNo",
                      "sNo",
                      "serialNo",
                    ) || (currentPage - 1) * recordsPerPage + idx + 1,
                  );
                  const studentAdmNo = String(
                    getVal(student, "AdmNo", "ADMNO", "admNo", "admissionNo") ||
                      "N/A",
                  );
                  const studentName = String(
                    getVal(student, "SNAME", "sName", "StudentName", "name") ||
                      "N/A",
                  );
                  const courseName = String(
                    getVal(student, "Course", "COURSE", "programme") || "N/A",
                  );
                  const branchName = String(
                    getVal(student, "BranchName", "BRANCHNAME", "branch") ||
                      "N/A",
                  );
                  const year = String(
                    getVal(student, "SYEAR", "sYear", "year", "studyingYear") ||
                      "1",
                  );
                  const sem = String(
                    getVal(
                      student,
                      "SSEMESTER",
                      "sSemester",
                      "sem",
                      "SEMESTER",
                    ) || "1",
                  );
                  const section = String(
                    getVal(student, "SECTION", "section") || "A",
                  );
                  const caste = String(
                    getVal(student, "CASTE", "caste") || "OC",
                  );
                  const quota = String(
                    getVal(
                      student,
                      "MODEOFADM",
                      "modeofAdm",
                      "allottedQuota",
                    ) || "CET",
                  );
                  const status = String(
                    getVal(student, "status", "STATUS", "aStatus", "ASTATUS") ||
                      "Active",
                  );

                  return (
                    <tr
                      key={studentSNo + idx}
                      className={
                        selectedStudent &&
                        getVal(selectedStudent, "STUDENTSERIALNO", "sNo") ===
                          studentSNo
                          ? "dbs-row-selected"
                          : ""
                      }
                    >
                      <td>
                        <strong>{studentSNo}</strong>
                      </td>
                      <td>
                        <span className="dbs-badge-adm">{studentAdmNo}</span>
                      </td>
                      <td>
                        <span className="dbs-student-name-text">
                          {studentName}
                        </span>
                      </td>
                      <td>
                        <div className="dbs-course-branch-cell">
                          <span className="dbs-course-title">{courseName}</span>
                          <span className="dbs-branch-sub">{branchName}</span>
                        </div>
                      </td>
                      <td>
                        Year {year}, Sem {sem} ({section})
                      </td>
                      <td>{caste}</td>
                      <td>{quota}</td>
                      <td>
                        <span
                          className={`dbs-status-badge ${status.toLowerCase() === "active" ? "dbs-badge-active" : "dbs-badge-inactive"}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="dbs-action-btn dbs-action-view"
                          title="View Student Details"
                          onClick={() => handleViewStudent(student)}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Shared Table Pagination Footer */}
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

export default AdmissionView;
