import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Camera,
  RotateCw,
  Check,
  X,
  Upload,
  Save,
  ArrowLeft,
  ArrowRight,
  Edit3,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  FileText,
  CheckCircle,
  UserCheck,
  ShieldAlert,
  Award,
  CreditCard,
  GraduationCap,
  Users,
  User,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import "./Admissions.css";
import {
  getBranch,
  getProgramme,
  getReguList,
  getYear,
} from "../../../apis/Common";
import {
  loadAdmissionData,
  loadAdmissionInitialFields,
  saveAdmission,
} from "../../../apis/AdmissionsApis";
import {
  savePhotoSign,
  getPhotoSign,
  fileToDataUrl,
} from "../../../utils/studentPhotoSignStorage";
import Footer from "../../../common/Footer";

// Form steps definition
const STEPS = [
  "Academic Info",
  "Student Details",
  "Parent Details",
  "Previous Education",
  "Fees Scope",
  "Review & Submit",
];

const getUserId = () => {
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed?.userId) return parsed.userId;
    }
    const directUserId = localStorage.getItem("userId");
    if (directUserId) return directUserId;
  } catch (err) {
    console.error("Error reading userId:", err);
  }
  return "NT125";
};

const parseApiDate = (value?: string | null) => {
  if (!value) return "";
  const str = String(value).trim();
  const matchDdMm = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (matchDdMm) {
    const [, dd, mm, yyyy] = matchDdMm;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  const matchYyyyMm = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (matchYyyyMm) {
    const [, yyyy, mm, dd] = matchYyyyMm;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  const parsedDate = new Date(str);
  if (!isNaN(parsedDate.getTime())) {
    const yyyy = parsedDate.getFullYear();
    const mm = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const dd = String(parsedDate.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  return str;
};

const getVal = (obj: any, ...keys: string[]) => {
  if (!obj || typeof obj !== "object") return "";
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") {
      return obj[k];
    }
  }
  const objEntries = Object.entries(obj);
  for (const k of keys) {
    const normalizedTarget = k.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const [objKey, val] of objEntries) {
      if (val !== undefined && val !== null && val !== "") {
        const normalizedObjKey = objKey.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (normalizedObjKey === normalizedTarget) {
          return val;
        }
      }
    }
  }
  return "";
};

export const AdmissionsEntry: React.FC = () => {
  const location = useLocation();
  const [programe, setPrograme] = useState<any[]>([]);
  const [castes, setCastes] = useState<{ Caste: string }[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [admittedYears, setAdmittedYears] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [regulations, setRegulations] = useState<any[]>([]);
  const [admissions] = useState<any[]>([]);

  const [studentData, setStudentData] = useState<any[]>([]);

  // Active step state
  const [currentStep, setCurrentStep] = useState(0);
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [editingIdent, setEditingIdent] = useState<string>("");
  const isEditingRef = useRef(false);

  // Auto-save Indicator state
  const [lastSaved, setLastSaved] = useState<string>("Draft Saved just now");
  const [isSaving, setIsSaving] = useState(false);

  // Webcam Mock modal states
  const [webcamOpen, setWebcamOpen] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [mockPhotoSelection, setMockPhotoSelection] = useState<string>("");
  const [photoPreview, setPhotoPreview] = useState<string>("");

  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Student signature preview + raw File object
  const [signaturePreview, setSignaturePreview] = useState<string>("");
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

  // Tracks the in-flight state of the final "Save Student Registry" API call
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter state for students database
  const [tableSearch, setTableSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("All");
  const [filterBranch, setFilterBranch] = useState("All");
  const [filterSection, setFilterSection] = useState("All");
  const [sortBy, setSortBy] = useState<string>("STUDENTSERIALNO");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
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
      cet: "EAPCET",
      set: "EAPCET",
      hallTicket: "",
      hallTicketNo: "",
      rank: "",
      setRank: "",
      branchRank: "",
      interHallTicketNo: "",
      ugRank: "",
      jnanaBhumiId: "",
      regulation: "R23",
      libraryMemberGroup: "Student",
      apaarId: "",

      // 2. Student Details - Personal / Identity
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

      // Student Contact
      studentMobile: "",
      studentEmail: "",
      address: "",
      state: "Andhra Pradesh",
      routePoint: "select route",
      rationCardNo: "",
      incomeCertNo: "",
      aadhaarNo: "",

      // Other Student Details
      activeStatus: "Active",
      isActive: true,
      scholor: false,
      le: false,
      staffChild: false,
      nsp: false,
      status: "",
      statusDate: new Date().toISOString().split("T")[0],
      statusReason: "Regular Admission",

      // 3. Parent Details - Father / Parent
      fatherName: "",
      fatherOccupation: "",
      fatherIncome: "",
      parentMobile: "",
      mobileNo1: "",
      mobileNo2: "",
      parentAadhaarNo: "",

      // Mother
      motherName: "",
      motherAadhaarNo: "",

      // 4. Previous Education - SSC
      sscSchool: "",
      sscMarks: "",
      sscHallTicket: "",
      sscBoard: "SSC Board AP",
      sscStudied: "Regular",
      sscAggregate: "",
      sscPassingDate: "",

      // Intermediate / Last Attended
      interCollege: "",
      interMarks: "",
      interBoardDetail: "BIEAP",
      interAggregateDetail: "",
      interPassingDateDetail: "",
      interMaths: "",
      interPhysics: "",
      interChemistry: "",
      lastAttendedCollegeName: "",
      groupSubjectsMarksPercentage: "",
      aggregate: "",
      myPassing: "",

      // UG
      ugCourse: "",
      ugCollege: "",
      ugMarks: "",
      ugHallTicket: "",
      ugUniversity: "",
      ugAggregateDetail: "",
      ugPassingDateDetail: "",

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

  // Auto-save trigger simulation on form changes
  useEffect(() => {
    setIsSaving(true);
    const saveTimer = setTimeout(() => {
      setIsSaving(false);
      const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setLastSaved(`Draft Saved at ${time}`);
    }, 1000);
    return () => clearTimeout(saveTimer);
  }, [formData]);

  // Keyboard shortcut Ctrl+S (Save draft manually)
  useEffect(() => {
    const handleSaveShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        toast.success("Draft saved successfully to local storage!");
      }
    };
    window.addEventListener("keydown", handleSaveShortcut);
    return () => window.removeEventListener("keydown", handleSaveShortcut);
  }, []);

  const handleEditStudent = async (student: any) => {
    isEditingRef.current = true;
    const rawIdent = getVal(student, "ident", "Ident", "id", "ID");
    const validNumericIdent = /^\d+$/.test(String(rawIdent).trim())
      ? String(rawIdent).trim()
      : "";
    setEditingIdent(validNumericIdent);

    const editId =
      getVal(
        student,
        "STUDENTSERIALNO",
        "studentSerialNo",
        "sNo",
        "ident",
        "Ident",
        "id",
        "ID",
      ) ||
      student.sNo ||
      validNumericIdent ||
      "";
    setIsEditingId(editId ? String(editId) : null);

    const rawCourse = String(
      getVal(
        student,
        "programme",
        "course",
        "Course",
        "COURSE",
        "COURSECODE",
        "ProgrammeCode",
        "programmeCode",
        "PROGRAMME",
      ) || "01",
    ).trim();

    const courseCodePrefix = rawCourse.includes("-")
      ? rawCourse.split("-")[0].trim()
      : rawCourse;

    let resolvedCourse = courseCodePrefix || rawCourse;

    if (programe && programe.length > 0) {
      const matchP = programe.find((p: any) => {
        const pCode = String(
          p.COURSECODE ?? p.COURSE_CODE ?? p.ID ?? p.ProgrammeCode ?? "",
        ).trim();
        const pName = String(
          p.COURSE ?? p.PROGRAMME ?? p.ProgrammeName ?? p.NAME ?? "",
        )
          .toLowerCase()
          .trim();
        return (
          pCode === rawCourse ||
          pCode === courseCodePrefix ||
          pName === rawCourse.toLowerCase() ||
          pName.includes(rawCourse.toLowerCase()) ||
          rawCourse.toLowerCase().includes(pName)
        );
      });
      if (matchP) {
        resolvedCourse = String(
          matchP.COURSECODE ??
            matchP.COURSE_CODE ??
            matchP.ID ??
            matchP.ProgrammeCode ??
            resolvedCourse,
        );
      }
    }

    let branchList: any[] = [];
    let yearList: any[] = [];
    if (resolvedCourse) {
      try {
        branchList = (await getBranch(resolvedCourse)) || [];
        setBranches(branchList);
      } catch (e) {
        console.error("Error fetching branches on edit:", e);
      }
      try {
        yearList = (await getYear(resolvedCourse)) || [];
        setYears(yearList);
        setAdmittedYears(yearList);
      } catch (e) {
        console.error("Error fetching years on edit:", e);
      }
    }

    const rawBranch = String(
      getVal(
        student,
        "branch",
        "BranchName",
        "BRANCH",
        "BRANCHCODE",
        "branchCode",
        "BRANCHNAME",
      ) || "",
    ).trim();

    const branchCodePrefix = rawBranch.includes("-")
      ? rawBranch.split("-")[0].trim()
      : rawBranch;

    let resolvedBranch = branchCodePrefix || rawBranch;
    if (branchList && branchList.length > 0) {
      const matchB = branchList.find((b: any) => {
        const bCode = String(
          b.BRANCHCODE ?? b.BranchCode ?? b.branchCode ?? b.ID ?? "",
        ).trim();
        const bName = String(
          b.BRANCHNAME ?? b.BranchName ?? b.branchName ?? b.NAME ?? "",
        )
          .toLowerCase()
          .trim();
        return (
          bCode === rawBranch ||
          bCode === branchCodePrefix ||
          bName === rawBranch.toLowerCase() ||
          bName.includes(rawBranch.toLowerCase()) ||
          rawBranch.toLowerCase().includes(bName)
        );
      });
      if (matchB) {
        resolvedBranch = String(
          matchB.BRANCHCODE ?? matchB.BranchCode ?? resolvedBranch,
        );
      }
    }

    const rawAdmittedYear = String(
      getVal(student, "aYear", "AYEAR", "admittedYear", "admitted_year") || "1",
    );
    const rawStudyingYear = String(
      getVal(student, "sYear", "SYEAR", "year", "YEAR", "studyingYear") || "1",
    );

    const rawPh = String(
      getVal(student, "ph", "PH", "differentlyAbled") || "NO",
    ).toUpperCase();
    const resolvedPh =
      rawPh === "YES" || rawPh === "Y" || rawPh === "TRUE" ? "YES" : "NO";

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
          "s_no",
        ),
      ),
      admNo: String(
        getVal(student, "admNo", "AdmNo", "ADMNO", "admissionNo", "adm_no"),
      ),
      regNo: String(
        getVal(
          student,
          "registrationNo",
          "regNo",
          "REGISTRATIONNO",
          "reg_no",
          "RegNo",
        ),
      ),
      course: resolvedCourse,
      branch: resolvedBranch,
      admittedYear: rawAdmittedYear,
      admittedSem: String(
        getVal(
          student,
          "aSemester",
          "ASEMESTER",
          "admittedSem",
          "admitted_sem",
        ) || "1",
      ),
      year: rawStudyingYear,
      sem: String(
        getVal(
          student,
          "sSemester",
          "SSEMESTER",
          "sem",
          "SEMESTER",
          "studyingSem",
        ) || "1",
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
          getVal(
            student,
            "acadamicYear",
            "currentAcademicYear",
            "ACADAMICYEAR",
          ) ||
          "2026-2027",
      ),
      currentAcademicYear: String(
        getVal(
          student,
          "acadamicYear",
          "currentAcademicYear",
          "ACADAMICYEAR",
          "academicYear",
        ) || "2026-2027",
      ),
      cet: String(getVal(student, "set", "SET", "cet", "CET") || "EAPCET"),
      hallTicket: String(
        getVal(
          student,
          "hallTicket",
          "HALLTICKET",
          "hallTicketNo",
          "HALLTICKETNO",
        ),
      ),
      rank: String(getVal(student, "rank", "RANK", "setRank", "SETRANK")),
      branchRank: String(
        getVal(student, "branchRank", "BRANCHRANK", "branch_rank"),
      ),
      jnanaBhumiId: String(
        getVal(student, "jnanaBhumiId", "JNANABHUMIID", "jnanabhumi_id"),
      ),
      regulation: String(getVal(student, "regulation", "REGULATION") || "R23"),
      libraryMemberGroup: String(
        getVal(
          student,
          "librarymembergroup",
          "LIBRARYMEMBERGROUP",
          "libraryMemberGroup",
        ) || "Student",
      ),
      apaarId: String(getVal(student, "apaar", "APAAR", "apaarId", "apaar_id")),
      name: String(
        getVal(
          student,
          "sName",
          "SNAME",
          "name",
          "studentName",
          "StudentName",
          "searchName",
        ),
      ),
      dob: parseApiDate(
        getVal(
          student,
          "dob",
          "DOB",
          "dateOfBirth",
          "DateOfBirth",
          "birthDate",
        ),
      ),
      gender: String(getVal(student, "gender", "GENDER") || "Male"),
      nationality: String(
        getVal(student, "nationality", "NATIONALITY") || "Indian",
      ),
      motherTongue: String(
        getVal(student, "motherTongue", "MOTHERTONGUE", "mother_tongue") ||
          "Telugu",
      ),
      religion: String(getVal(student, "religion", "RELIGION") || "Hindu"),
      bloodGroup: String(
        getVal(student, "bloodGrp", "BLOODGRP", "bloodGroup", "blood_grp") ||
          "B+ve",
      ),
      differentlyAbled: resolvedPh,
      caste: String(getVal(student, "caste", "CASTE") || "OC"),
      subcaste: String(getVal(student, "subCaste", "SUBCASTE", "subcaste")),
      category: String(getVal(student, "category", "CATEGORY") || "General"),
      allottedQuota: String(
        getVal(student, "allottedQuota", "ALLOTTEDQUOTA") || "Convenor",
      ),
      modeOfAdmission: String(
        getVal(student, "modeofAdm", "MODEOFADM", "modeOfAdmission") || "CET",
      ),
      categoryOfAdmission: String(
        getVal(student, "modeofCtgy", "MODEOFCTGY", "categoryOfAdmission") ||
          "Regular",
      ),
      mole1: String(getVal(student, "mole1", "MOLE1")),
      mole2: String(getVal(student, "mole2", "MOLE2")),
      studentMobile: String(
        getVal(student, "stdMobNo", "STDMOBNO", "studentMobile", "std_mobile"),
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
        getVal(student, "routePoint", "ROUTEPOINT", "route_point") ||
          "select route",
      ),
      rationCardNo: String(
        getVal(student, "rationcardNo", "RATIONCARDNO", "rationCardNo"),
      ),
      incomeCertNo: String(getVal(student, "icNo", "ICNO", "incomeCertNo")),
      aadhaarNo: String(getVal(student, "aadhaarNo", "AADHAARNO", "aadharNo")),
      activeStatus: String(
        getVal(
          student,
          "status",
          "STATUS",
          "aStatus",
          "ASTATUS",
          "activeStatus",
        ) || "Active",
      ),
      statusDate:
        parseApiDate(getVal(student, "date", "DATE", "statusDate")) ||
        new Date().toISOString().split("T")[0],
      statusReason: String(
        getVal(student, "reason", "REASON", "statusReason") ||
          "Regular Admission",
      ),
      isActive:
        String(getVal(student, "status", "STATUS")).toLowerCase() === "active"
          ? true
          : getVal(student, "isactive", "ISACTIVE") !== ""
            ? Boolean(getVal(student, "isactive", "ISACTIVE"))
            : true,
      scholor: Boolean(
        getVal(student, "schlor", "SCHLOR", "scholor", "scholarship"),
      ),
      le: Boolean(getVal(student, "le", "LE")),
      staffChild: Boolean(
        getVal(student, "fac_Child", "FAC_CHILD", "staffChild"),
      ),
      nsp: Boolean(getVal(student, "nsp", "NSP")),
      fatherName: String(
        getVal(student, "fName", "FNAME", "fatherName", "FatherName"),
      ),
      fatherOccupation: String(
        getVal(
          student,
          "parentOccupation",
          "PARENTOCCUPATION",
          "fatherOccupation",
        ),
      ),
      fatherIncome: String(getVal(student, "income", "INCOME", "fatherIncome")),
      parentMobile: String(
        getVal(student, "parentMbNo", "PARENTMBNO", "parentMobile"),
      ),
      mobileNo1: String(getVal(student, "mobileNo1", "MOBILENO1")),
      mobileNo2: String(
        getVal(student, "parentMbNo2", "PARENTMBNO2", "mobileNo2"),
      ),
      parentAadhaarNo: String(
        getVal(student, "parentAadhaarNo", "PARENTAADHAARNO", "parentAadharNo"),
      ),
      motherName: String(
        getVal(student, "mName", "MNAME", "motherName", "MotherName"),
      ),
      motherAadhaarNo: String(
        getVal(
          student,
          "mAadharNo",
          "MAADHARNO",
          "motherAadhaarNo",
          "motherAadharNo",
        ),
      ),
      sscSchool: String(
        getVal(student, "sscSchoolName", "SSCSCHOOLNAME", "sscSchool"),
      ),
      sscMarks: String(
        getVal(student, "sscMarksPercentage", "SSCMARKSPERCENTAGE", "sscMarks"),
      ),
      sscHallTicket: String(
        getVal(
          student,
          "ssC_HallTicketNo",
          "SSC_HALLTICKETNO",
          "sscHallTicket",
        ),
      ),
      sscBoard: String(
        getVal(student, "ssC_Board", "SSC_BOARD", "sscBoard") || "SSC Board AP",
      ),
      sscStudied: String(
        getVal(student, "sscStudied", "SSCSTUDIED") || "Regular",
      ),
      sscAggregate: String(
        getVal(student, "ssC_Aggregate", "SSC_AGGREGATE", "sscAggregate"),
      ),
      sscPassingDate: String(
        getVal(
          student,
          "ssC_MYPassing",
          "SSC_MYPASSING",
          "sscPassingDate",
          "myPassing",
          "MYPASSING",
        ),
      ),
      interCollege: String(
        getVal(
          student,
          "int_CollegeName",
          "INT_COLLEGENAME",
          "interCollege",
          "lastAttendedCollegeName",
          "LASTATTENDEDCOLLEGENAME",
        ),
      ),
      interMarks: String(
        getVal(
          student,
          "int_MarksPerc",
          "INT_MARKSPERC",
          "interMarks",
          "groupSubjectsMarksPercentage",
          "GROUPSUBJECTSMARKSPERCENTAGE",
        ),
      ),
      interHallTicketNo: String(
        getVal(
          student,
          "int_HallTicketNo",
          "INT_HALLTICKETNO",
          "interHallTicketNo",
        ),
      ),
      interBoardDetail: String(
        getVal(student, "int_Board", "INT_BOARD", "interBoardDetail") ||
          "BIEAP",
      ),
      interAggregateDetail: String(
        getVal(
          student,
          "int_Aggregate",
          "INT_AGGREGATE",
          "interAggregateDetail",
          "aggregate",
          "AGGREGATE",
        ),
      ),
      interPassingDateDetail: String(
        getVal(
          student,
          "int_MYPassing",
          "INT_MYPASSING",
          "interPassingDateDetail",
        ),
      ),
      interMaths: String(getVal(student, "maths", "MATHS", "interMaths")),
      interPhysics: String(
        getVal(student, "physics", "PHYSICS", "interPhysics"),
      ),
      interChemistry: String(
        getVal(student, "chemistry", "CHEMISTRY", "interChemistry"),
      ),
      lastAttendedCollegeName: String(
        getVal(
          student,
          "lastAttendedCollegeName",
          "LASTATTENDEDCOLLEGENAME",
          "int_CollegeName",
          "interCollege",
        ),
      ),
      groupSubjectsMarksPercentage: String(
        getVal(
          student,
          "groupSubjectsMarksPercentage",
          "GROUPSUBJECTSMARKSPERCENTAGE",
          "int_MarksPerc",
          "interMarks",
        ),
      ),
      aggregate: String(
        getVal(
          student,
          "aggregate",
          "AGGREGATE",
          "int_Aggregate",
          "interAggregateDetail",
        ),
      ),
      myPassing: String(
        getVal(
          student,
          "myPassing",
          "MYPASSING",
          "ssC_MYPassing",
          "sscPassingDate",
        ),
      ),
      ugCourse: String(getVal(student, "ugCourse", "UGCOURSE", "ug_course")),
      ugCollege: String(
        getVal(student, "uG_CollegeName", "UG_COLLEGENAME", "ugCollege"),
      ),
      ugMarks: String(
        getVal(student, "uG_MarksPerc", "UG_MARKSPERC", "ugMarks"),
      ),
      ugHallTicket: String(
        getVal(student, "uG_HallTicketNo", "UG_HALLTICKETNO", "ugHallTicket"),
      ),
      ugUniversity: String(
        getVal(student, "uG_University", "UG_UNIVERSITY", "ugUniversity"),
      ),
      ugAggregateDetail: String(
        getVal(student, "uG_Aggregate", "UG_AGGREGATE", "ugAggregateDetail"),
      ),
      ugPassingDateDetail: String(
        getVal(student, "uG_MYPassing", "UG_MYPASSING", "ugPassingDateDetail"),
      ),
      ugRank: String(getVal(student, "ugRank", "UGRANK")),
      fee_admType: String(getVal(student, "fee_admType", "FEE_ADMTYPE")),
      tuitionFee: String(getVal(student, "tuitionFee", "TUITIONFEE")),
      miscellaneousfee: String(
        getVal(student, "miscellaneousfee", "MISCELLANEOUSFEE"),
      ),
      scholarshipAmount: String(
        getVal(student, "schAmount", "SCHAMOUNT", "scholarshipAmount") || "0",
      ),
      boysHostelFee: String(
        getVal(student, "bhFee", "BHFEE", "boysHostelFee") || "0",
      ),
      ladiesHostelFee: String(
        getVal(student, "lhFee", "LHFEE", "ladiesHostelFee") || "0",
      ),
      busFee: String(getVal(student, "busFee", "BUSFEE") || "0"),
      donation: String(getVal(student, "donation", "DONATION") || "0"),
      spotFee: String(
        getVal(student, "spotAdmFee", "SPOTADMFEE", "spotFee") || "0",
      ),
    };

    reset(formValues);
    Object.keys(formValues).forEach((key) => {
      setValue(key as any, formValues[key]);
    });

    const admNo = String(
      formValues.admNo ||
        getVal(
          student,
          "AdmNo",
          "ADMNO",
          "admNo",
          "admissionNo",
          "admissionNumber",
        ) ||
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

    setPhotoFile(null);
    setSignatureFile(null);

    setCurrentStep(0);
    toast.info(`Loaded student profile: ${formValues.name || "Student"}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getFileExtension = (fileName: string) => {
    const match = fileName.match(/\.[0-9a-z]+$/i);
    return match ? match[0] : "";
  };

  const handleStepSubmit = async (data: any) => {
    console.log(data, "================1st step payload===============");
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Final Submission Handler
    const upperName = (data.name || "").toUpperCase();

    const savePayload = {
      ident: "",
      studentSerialNo: data.sNo || isEditingId || "",
      admNo: data.admNo || "",
      registrationNo: data.regNo || "",
      admissionDate: parseApiDate(data.admDate),
      dob: parseApiDate(data.dob),
      sName: upperName,
      searchName: upperName,
      modeofAdm: data.modeOfAdmission || "",
      programme: data.course || "",
      branch: data.branch || "",
      section: data.section || "",
      aYear: data.admittedYear ? String(data.admittedYear) : "1",
      sYear: data.year ? String(data.year) : "1",
      acadamicYear: data.currentAcademicYear || "",
      jAcadamicYear: data.joiningAcademicYear || "",
      aSemester: data.admittedSem ? String(data.admittedSem) : "1",
      sSemester: data.sem ? String(data.sem) : "1",
      caste: data.caste || "",
      subCaste: data.subcaste || "",
      gender: data.gender || "",
      nationality: data.nationality || "",
      religion: data.religion || "",
      bloodGrp: data.bloodGroup || "",
      ph: data.differentlyAbled || "",
      tuitionFee: data.tuitionFee || "",
      miscellaneousfee: data.miscellaneousfee || "",
      schAmount: data.scholarshipAmount || "",
      bhFee: data.boysHostelFee || "",
      lhFee: data.ladiesHostelFee || "",
      busFee: data.busFee || "",
      donation: data.donation || "",
      rank: data.rank || "",
      hallTicketNo: data.hallTicketNo || data.hallTicket || "",
      sscSchoolName: data.sscSchool || "",
      sscMarksPercentage: data.sscMarks || "",
      lastAttendedCollegeName:
        data.lastAttendedCollegeName || data.interCollege || "",
      groupSubjectsMarksPercentage:
        data.groupSubjectsMarksPercentage || data.interMarks || "",
      aggregate: data.aggregate || data.interAggregateDetail || "",
      myPassing: data.myPassing || data.sscPassingDate || "",
      fName: data.fatherName || "",
      parentOccupation: data.fatherOccupation || "",
      income: data.fatherIncome || "",
      mName: data.motherName || "",
      address: data.address || "",
      parentMbNo: data.parentMobile || "",
      parentMbNo2: data.mobileNo2 || "",
      stdMobNo: data.studentMobile || "",
      aadhaarNo: data.aadhaarNo || "",
      rationcardNo: data.rationCardNo || "",
      icNo: data.incomeCertNo || "",
      emailid: data.studentEmail || "",
      userId: getUserId(),
      status: isEditingId ? "UPDATE" : "INSERT",
      ssC_HallTicketNo: data.sscHallTicket || "",
      ssC_Board: data.sscBoard || "",
      sscStudied: data.sscStudied || "",
      ssC_Aggregate: data.sscAggregate || "",
      ssC_MYPassing: data.sscPassingDate || "",
      int_CollegeName: data.interCollege || "",
      int_MarksPerc: data.interMarks || "",
      int_HallTicketNo: data.interHallTicketNo || "",
      int_Board: data.interBoardDetail || "",
      int_Aggregate: data.interAggregateDetail || "",
      int_MYPassing: data.interPassingDateDetail || "",
      uG_CollegeName: data.ugCollege || "",
      uG_MarksPerc: data.ugMarks || "",
      uG_HallTicketNo: data.ugHallTicket || "",
      uG_University: data.ugUniversity || "",
      uG_Aggregate: data.ugAggregateDetail || "",
      uG_MYPassing: data.ugPassingDateDetail || "",
      fee_admType: data.fee_admType || "",
      isactive: Boolean(data.isActive),
      reason: data.statusReason || "",
      date: parseApiDate(data.statusDate),
      aStatus: data.activeStatus || "",
      set: data.set || data.cet || "",
      hallTicket: data.hallTicket || "",
      setRank: data.setRank || data.rank || "",
      branchRank: data.branchRank || "",
      mole1: data.mole1 || "",
      mole2: data.mole2 || "",
      states: data.state || "",
      category: data.category || "",
      routePoint: data.routePoint || "select route",
      motherTongue: data.motherTongue || "",
      maths: data.interMaths || "",
      physics: data.interPhysics || "",
      chemistry: data.interChemistry || "",
      spotAdmFee: data.spotFee || "",
      le: Boolean(data.le),
      fac_Child: Boolean(data.staffChild),
      jnanaBhumiId: data.jnanaBhumiId || "",
      regulation: data.regulation || "",
      mAadharNo: data.motherAadhaarNo || "",
      ugCourse: data.ugCourse || "",
      librarymembergroup: data.libraryMemberGroup || "Student",
      schlor: Boolean(data.scholor),
      modeofCtgy: data.categoryOfAdmission || "",
      allottedQuota: data.allottedQuota || "",
      nsp: Boolean(data.nsp),
      apaar: data.apaarId || "",
    };

    try {
      setIsSubmitting(true);
      const res = await saveAdmission(savePayload);

      // Save / update photo and signature in frontend Stu_Photo_Sign store (client-side)
      const primaryId =
        data.admNo || data.regNo || data.sNo || isEditingId || "student";
      if (photoPreview && photoPreview.startsWith("data:")) {
        await savePhotoSign(`P-${primaryId}`, photoPreview);
        if (data.regNo && data.regNo !== primaryId) {
          await savePhotoSign(`P-${data.regNo}`, photoPreview);
        }
      }
      if (signaturePreview && signaturePreview.startsWith("data:")) {
        await savePhotoSign(`S-${primaryId}`, signaturePreview);
        if (data.regNo && data.regNo !== primaryId) {
          await savePhotoSign(`S-${data.regNo}`, signaturePreview);
        }
      }

      toast.success(
        res?.message ||
          (isEditingId
            ? "Student details updated successfully!"
            : "New student registration saved successfully!"),
      );
      setIsEditingId(null);
      setEditingIdent("");
      fetchAdmissions();

      // Reset form after submit
      reset();
      setPhotoPreview("");
      setPhotoFile(null);
      setSignaturePreview("");
      setSignatureFile(null);
      setCurrentStep(0);
    } catch (error: any) {
      console.error("Error saving admission:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to save student registration. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWebcamCapture = () => {
    const mockAvatars = [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
    ];
    const randomIndex = Math.floor(Math.random() * mockAvatars.length);
    setMockPhotoSelection(mockAvatars[randomIndex]);
    setRotationAngle(0);
    setWebcamOpen(true);
  };

  const saveWebcamPhoto = async () => {
    try {
      const response = await fetch(mockPhotoSelection);
      const blob = await response.blob();
      const extension = blob.type.split("/")[1] || "jpg";
      const currentRegNo =
        getValues("regNo") || getValues("sNo") || isEditingId || "temp";
      const capturedFile = new File([blob], `P-${currentRegNo}.${extension}`, {
        type: blob.type,
      });
      setPhotoFile(capturedFile);
    } catch (error) {
      console.error("Error processing webcam capture:", error);
    }

    setPhotoPreview(mockPhotoSelection);
    setWebcamOpen(false);
    toast.success("Webcam photo attached successfully!");
  };

  // Filter students database (operates on the live API data, studentData)
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
  const sortedStudents = [...filteredStudents].sort((a: any, b: any) => {
    const aVal = a[sortBy] ?? "";
    const bVal = b[sortBy] ?? "";
    if (sortOrder === "asc") {
      return aVal.localeCompare
        ? aVal.localeCompare(bVal)
        : (aVal as number) - (bVal as number);
    } else {
      return bVal.localeCompare
        ? bVal.localeCompare(aVal)
        : (bVal as number) - (aVal as number);
    }
  });

  const totalRecords = filteredStudents.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = Math.min(startIndex + recordsPerPage, totalRecords);
  const currentData = sortedStudents.slice(startIndex, endIndex);

  const triggerSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const fetchPrograme = async () => {
    try {
      const response = await getProgramme();
      // console.log("======Students data======", response);
      setPrograme(response);
    } catch (error) {
      console.error("Error loading students data!");
    }
  };

  const fetchCastes = async () => {
    try {
      const response = await loadAdmissionInitialFields();
      setCastes(response.castes);
      // console.log(response.castes, "======Error loading castes======");
    } catch (error) {
      console.error("Error laoding Data..");
    }
  };

  const fetchAdmissions = async () => {
    try {
      const response = await loadAdmissionData();
      console.log("=========Response admissions=====", response);
      setStudentData(response || []);
    } catch (error) {
      console.error("Error fetching admissions!");
    }
  };

  const fetchBranch = async (courseCode: string) => {
    if (!courseCode) {
      setBranches([]);
      return;
    }
    try {
      const response = await getBranch(courseCode);
      setBranches(response || []);
      console.log(response, "==========branch load==================");
    } catch (error) {
      console.error("Error fetching branches!", error);
      setBranches([]);
    }
  };

  const fetchYears = async (courseCode: string) => {
    if (!courseCode) {
      setAdmittedYears([]);
      setYears([]);
      return;
    }
    try {
      const response = await getYear(courseCode);
      console.log("Response of years load================", response);
      setYears(response);
      setAdmittedYears(response);
    } catch (error) {
      console.error("Error fetching years!", error);
      setYears([]);
      setAdmittedYears([]);
    }
  };

  const fetchRegulations = async () => {
    try {
      const response = await getReguList();
      console.log("Response of getReguList load================", response);
      setRegulations(response);
    } catch (error) {
      console.error("Error fetching ReguList!", error);
      setRegulations([]);
    }
  };

  useEffect(() => {
    fetchPrograme();
    fetchCastes();
    fetchAdmissions();
    fetchRegulations();
  }, []);

  useEffect(() => {
    if (isEditingRef.current) {
      isEditingRef.current = false;
      return;
    }
    setValue("branch", "");
    setValue("admittedYear", "");
    setValue("year", "");

    if (selectedProgramme) {
      fetchBranch(selectedProgramme);
      fetchYears(selectedProgramme);
    } else {
      setBranches([]);
      setYears([]);
    }
  }, [selectedProgramme, setValue]);

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
      {/* HEADER CONTROLS WITH AUTO SAVE INDICATOR */}
      <div className="dbs-admissions-form-header">
        <div>
          <h2>
            {isEditingId ? "Edit Student Admission" : "Student Admission Form"}
          </h2>
          <p>
            {isEditingId
              ? `Updating record for Student Serial No: ${isEditingId}`
              : "Structured 6-Step Academic & Student Enrolment Console"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {isEditingId && (
            <button
              type="button"
              className="dbs-btn-secondary"
              style={{
                padding: "6px 12px",
                fontSize: "13px",
                cursor: "pointer",
                borderRadius: "6px",
                border: "1px solid #ccc",
                background: "#f8f9fa",
              }}
              onClick={() => {
                setIsEditingId(null);
                setEditingIdent("");
                reset();
                setPhotoPreview("");
                setPhotoFile(null);
                setSignaturePreview("");
                setSignatureFile(null);
                setCurrentStep(0);
                toast.info("Switched to new student registration mode.");
              }}
            >
              Cancel Edit
            </button>
          )}
          <div className="dbs-autosave-indicator">
            {isSaving ? (
              <span className="dbs-autosave-saving">
                <RefreshCw size={14} className="dbs-spin" /> Draft Saving...
              </span>
            ) : (
              <span className="dbs-autosave-saved">
                <Check size={14} /> {lastSaved}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* --- 7-STEP HORIZONTAL STEPPER --- */}
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
                {isCompleted ? <Check size={14} /> : idx + 1}
              </div>
              <span
                className={`dbs-stepper-label ${isActive ? "dbs-label-active" : ""}`}
              >
                {step}
              </span>
              {idx < STEPS.length - 1 && (
                <div
                  className={`dbs-stepper-bar-connector ${idx < currentStep ? "dbs-bar-completed" : ""}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* --- FORM WRAPPER CARD --- */}
      <form
        onSubmit={handleSubmit(handleStepSubmit)}
        className="dbs-admissions-stepper-form-card"
      >
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
                  <label>Date Of Admission *</label>
                  <input
                    type="date"
                    {...register("admDate", { required: true })}
                  />
                </div>
                <div className="dbs-input-box">
                  <label>Student Serial No.</label>
                  <input
                    type="text"
                    {...register("sNo")}
                    placeholder="e.g. 9809/25-26"
                  />
                </div>
                <div className="dbs-input-box">
                  <label>Admission No.</label>
                  <input
                    type="text"
                    {...register("admNo")}
                    placeholder="e.g. 25MDS07"
                  />
                </div>

                <div className="dbs-input-box">
                  <label>Registration No.</label>
                  <input
                    type="text"
                    {...register("regNo")}
                    placeholder="e.g. 25MDS07"
                  />
                </div>
                <div className="dbs-input-box">
                  <label>Programme *</label>

                  <select
                    {...register("course", {
                      required: "Programme is required",
                    })}
                  >
                    <option value="">Select Programme</option>
                    {programe.map((item: any, index: number) => {
                      const progCode =
                        item.COURSECODE ??
                        item.COURSE_CODE ??
                        item.ID ??
                        item.ProgrammeCode ??
                        item.programmeCode;
                      const progName =
                        item.COURSE ??
                        item.PROGRAMME ??
                        item.ProgrammeName ??
                        item.NAME;
                      return (
                        <option key={index} value={progCode}>
                          {progName}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="dbs-input-box">
                  <label>Branch *</label>

                  <select
                    {...register("branch", {
                      required: "Branch is required",
                    })}
                  >
                    <option value="">Select Branch</option>

                    {branches.map((item: any, index: number) => {
                      const bCode =
                        item.BRANCHCODE ??
                        item.BranchCode ??
                        item.branchCode ??
                        item.ID;
                      const bName =
                        item.BRANCHNAME ??
                        item.BranchName ??
                        item.branchName ??
                        item.NAME;
                      return (
                        <option key={index} value={bCode}>
                          {bName}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="dbs-input-box">
                  <label>Admitted Year *</label>

                  <select
                    {...register("admittedYear", {
                      required: "Admitted Year is required",
                    })}
                  >
                    <option value="">Select Year</option>

                    {admittedYears.map((year: any, index: number) => {
                      const yId = String(
                        year.ID ??
                          year.id ??
                          year.Year ??
                          year.year ??
                          year.YEAR,
                      );
                      const yData =
                        year.DATA ??
                        year.Data ??
                        year.data ??
                        year.YEAR ??
                        year.Year ??
                        `Year ${yId}`;
                      return (
                        <option key={index} value={yId}>
                          {yData}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="dbs-input-box">
                  <label>Admitted Semester *</label>
                  <select {...register("admittedSem")}>
                    <option value="1">I</option>
                    <option value="2">II</option>
                  </select>
                </div>
                <div className="dbs-input-box">
                  <label>Studying Year *</label>
                  <select
                    {...register("year", {
                      required: "Admitted Year is required",
                    })}
                  >
                    <option value="">Select Year</option>

                    {years.map((year: any, index: number) => {
                      const yId = String(
                        year.ID ??
                          year.id ??
                          year.Year ??
                          year.year ??
                          year.YEAR,
                      );
                      const yData =
                        year.DATA ??
                        year.Data ??
                        year.data ??
                        year.YEAR ??
                        year.Year ??
                        `Year ${yId}`;
                      return (
                        <option key={index} value={yId}>
                          {yData}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="dbs-input-box">
                  <label>Studying Semester *</label>
                  <select
                    {...register("sem", { required: "Semester is required" })}
                  >
                    <option value="">Select Semester</option>
                    <option value="1">I</option>
                    <option value="2">II</option>
                  </select>
                </div>
                <div className="dbs-input-box">
                  <label>Section</label>
                  <select {...register("section")}>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                  </select>
                </div>
                <div className="dbs-input-box">
                  <label>Joining Academic Year *</label>
                  <input
                    type="text"
                    {...register("joiningAcademicYear")}
                    placeholder="e.g. 2025-2026"
                  />
                </div>

                <div className="dbs-input-box">
                  <label>Current Academic Year *</label>
                  <input
                    type="text"
                    {...register("currentAcademicYear")}
                    placeholder="e.g. 2025-2026"
                  />
                </div>
                <div className="dbs-input-box">
                  <label>CET *</label>
                  <input
                    type="text"
                    {...register("cet")}
                    placeholder="e.g. EAPCET / ICET / PGECET"
                  />
                </div>
                <div className="dbs-input-box">
                  <label>Cet Hall Ticket *</label>
                  <input
                    type="text"
                    {...register("hallTicket")}
                    placeholder="Entrance Hall Ticket No."
                  />
                </div>

                <div className="dbs-input-box">
                  <label>Rank *</label>
                  <input
                    type="text"
                    {...register("rank")}
                    placeholder="State / CET Rank"
                  />
                </div>
                <div className="dbs-input-box">
                  <label>Branch Rank *</label>
                  <input
                    type="text"
                    {...register("branchRank")}
                    placeholder="Branch Rank"
                  />
                </div>
                <div className="dbs-input-box">
                  <label>Jnana Bhumi Id *</label>
                  <input
                    type="text"
                    {...register("jnanaBhumiId")}
                    placeholder="Jnanabhumi Portal ID"
                  />
                </div>

                <div className="dbs-input-box">
                  <label>Regulation *</label>
                  <select {...register("regulation")}>
                    <option value="">Select Regulation</option>

                    {regulations.map((regu: any, index: number) => {
                      const regVal =
                        typeof regu === "string"
                          ? regu
                          : (regu.regulation ??
                            regu.REGULATION ??
                            regu.Regulation ??
                            regu.NAME ??
                            regu.name);
                      return (
                        <option key={index} value={regVal}>
                          {regVal}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="dbs-input-box">
                  <label>Library Member Group *</label>
                  <input
                    type="text"
                    {...register("libraryMemberGroup")}
                    placeholder="e.g. General Student"
                  />
                </div>
                <div className="dbs-input-box">
                  <label>APAAR ID</label>
                  <input
                    type="text"
                    {...register("apaarId")}
                    placeholder="12-Digit APAAR Identity"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Student Details */}
        {currentStep === 1 && (
          <div className="dbs-stepper-slide">
            <div className="dbs-form-grid-image">
              <div className="dbs-flex-col-gap flex-2">
                {/* 2.1 Student Personal / Identity */}
                <div className="dbs-form-card">
                  <div className="dbs-card-title-row">
                    <User className="dbs-card-title-icon" size={20} />
                    <h3>2. Student Personal / Identity</h3>
                  </div>
                  <div className="dbs-form-grid-3">
                    <div className="dbs-input-box">
                      <label>Name of the *</label>
                      <input
                        type="text"
                        {...register("name", { required: true })}
                        placeholder="Full Name in Block Letters"
                      />
                    </div>
                    <div className="dbs-input-box">
                      <label>Date of Birth *</label>
                      <input
                        type="date"
                        {...register("dob", { required: true })}
                      />
                    </div>
                    <div className="dbs-input-box">
                      <label>Gender *</label>
                      <select {...register("gender")}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="dbs-input-box">
                      <label>Nationality *</label>
                      <input
                        type="text"
                        {...register("nationality")}
                        placeholder="Indian"
                      />
                    </div>
                    <div className="dbs-input-box">
                      <label>Mother Tongue *</label>
                      <input
                        type="text"
                        {...register("motherTongue")}
                        placeholder="Telugu"
                      />
                    </div>
                    <div className="dbs-input-box">
                      <label>Religion *</label>
                      <input
                        type="text"
                        {...register("religion")}
                        placeholder="Hindu"
                      />
                    </div>

                    <div className="dbs-input-box">
                      <label>Blood Group *</label>
                      <select {...register("bloodGroup")}>
                        <option value="A+">A+</option>
                        <option value="B+">B+</option>
                        <option value="O+">O+</option>
                        <option value="AB+">AB+</option>
                        <option value="A-">A-</option>
                        <option value="B-">B-</option>
                        <option value="O-">O-</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                    <div className="dbs-input-box">
                      <label>Differently Abled (PH) *</label>
                      <select {...register("differentlyAbled")}>
                        <option value="NO">No</option>
                        <option value="YES">Yes</option>
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                    <div className="dbs-input-box">
                      <label>Caste *</label>

                      <select {...register("caste")}>
                        <option value="">Select Caste</option>

                        {castes.map((item: any, index: number) => {
                          const casteVal =
                            item.Caste ??
                            item.CASTE ??
                            item.caste ??
                            item.NAME ??
                            item.Category;
                          return (
                            <option key={index} value={casteVal}>
                              {casteVal}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="dbs-input-box">
                      <label>Subcaste *</label>
                      <input
                        type="text"
                        {...register("subcaste")}
                        placeholder="Subcaste details"
                      />
                    </div>
                    <div className="dbs-input-box">
                      <label>Category *</label>
                      <input
                        type="text"
                        {...register("category")}
                        placeholder="General / EWS"
                      />
                    </div>
                    <div className="dbs-input-box">
                      <label>Allotted Quota *</label>
                      <select {...register("allottedQuota")}>
                        <option value="Convenor">Convenor Quota</option>
                        <option value="Management">Management Quota</option>
                        <option value="NRI">NRI Quota</option>
                        <option value="Spot">Spot Admission</option>
                      </select>
                    </div>

                    <div className="dbs-input-box">
                      <label>Mode of Admission *</label>
                      <select {...register("modeOfAdmission")}>
                        <option value="CET">CET</option>
                        <option value="Direct">Direct</option>
                        <option value="Management">Management</option>
                      </select>
                    </div>
                    <div className="dbs-input-box">
                      <label>Category of Admission *</label>
                      <select {...register("categoryOfAdmission")}>
                        <option value="Regular">Regular</option>
                        <option value="Lateral Entry (LE)">
                          Lateral Entry (LE)
                        </option>
                        <option value="Transfer">Transfer</option>
                      </select>
                    </div>
                    <div className="dbs-input-box">
                      <label>Mole 1 (Identification Mark)</label>
                      <input
                        type="text"
                        {...register("mole1")}
                        placeholder="Identification Mark 1"
                      />
                    </div>
                    <div className="dbs-input-box dbs-grid-col-span-2">
                      <label>Mole 2 (Identification Mark)</label>
                      <input
                        type="text"
                        {...register("mole2")}
                        placeholder="Identification Mark 2"
                      />
                    </div>
                  </div>
                </div>

                {/* 2.2 Student Contact */}
                <div className="dbs-form-card">
                  <div className="dbs-card-title-row">
                    <UserCheck className="dbs-card-title-icon" size={20} />
                    <h3>Student Contact Information</h3>
                  </div>
                  <div className="dbs-form-grid-3">
                    <div className="dbs-input-box">
                      <label>Student Mobile No.</label>
                      <input
                        type="tel"
                        {...register("studentMobile")}
                        placeholder="10-Digit Mobile"
                      />
                    </div>
                    <div className="dbs-input-box">
                      <label>Student Email-Id</label>
                      <input
                        type="email"
                        {...register("studentEmail")}
                        placeholder="student@example.com"
                      />
                    </div>
                    <div className="dbs-input-box">
                      <label>State *</label>
                      <input
                        type="text"
                        {...register("state")}
                        placeholder="Andhra Pradesh"
                      />
                    </div>
                    <div className="dbs-input-box">
                      <label>Route Point</label>
                      <input
                        type="text"
                        {...register("routePoint")}
                        placeholder="select route / pickup point"
                      />
                    </div>
                    <div className="dbs-input-box">
                      <label>Ration Card No.</label>
                      <input
                        type="text"
                        {...register("rationCardNo")}
                        placeholder="Ration Card Number"
                      />
                    </div>
                    <div className="dbs-input-box">
                      <label>Income Certificate No.</label>
                      <input
                        type="text"
                        {...register("incomeCertNo")}
                        placeholder="Income Cert No."
                      />
                    </div>
                    <div className="dbs-input-box">
                      <label>Aadhaar No. *</label>
                      <input
                        type="text"
                        {...register("aadhaarNo", { required: true })}
                        placeholder="12-Digit Aadhaar No."
                      />
                    </div>
                    <div className="dbs-input-box dbs-grid-col-span-3">
                      <label>Address *</label>
                      <input
                        type="text"
                        {...register("address", { required: true })}
                        placeholder="Complete Door No, Street, Village/City, Mandal, District"
                      />
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
                      <select {...register("activeStatus")}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Detained">Detained</option>
                        <option value="Discontinued">Discontinued</option>
                      </select>
                    </div>

                    <div className="dbs-input-box">
                      <label>Status Date</label>
                      <input type="date" {...register("statusDate")} />
                    </div>
                    <div className="dbs-input-box dbs-grid-col-span-3">
                      <label>Status Reason</label>
                      <input
                        type="text"
                        {...register("statusReason")}
                        placeholder="Reason for status change if applicable"
                      />
                    </div>
                  </div>

                  {/* Toggle switches for flags */}
                  <div className="dbs-flags-pill-row mt-3">
                    <label className="dbs-toggle-switch-label">
                      <input type="checkbox" {...register("isActive")} />
                      <span className="dbs-toggle-pill-text">IsActive</span>
                    </label>
                    <label className="dbs-toggle-switch-label">
                      <input type="checkbox" {...register("scholor")} />
                      <span className="dbs-toggle-pill-text">Scholor</span>
                    </label>
                    <label className="dbs-toggle-switch-label">
                      <input type="checkbox" {...register("le")} />
                      <span className="dbs-toggle-pill-text">
                        Lateral Entry (LE)
                      </span>
                    </label>
                    <label className="dbs-toggle-switch-label">
                      <input type="checkbox" {...register("staffChild")} />
                      <span className="dbs-toggle-pill-text">Staff Child</span>
                    </label>
                    <label className="dbs-toggle-switch-label">
                      <input type="checkbox" {...register("nsp")} />
                      <span className="dbs-toggle-pill-text">NSP Scholar</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Photo & Signature Upload Side Panel */}
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
                      <span className="dbs-upload-required">Required</span>
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
                          <Upload size={22} />
                          <span>No Photo Attached</span>
                        </div>
                      )}
                    </div>

                    <div className="dbs-photo-actions-box">
                      <button
                        type="button"
                        className="dbs-photo-btn dbs-btn-camera"
                        onClick={handleWebcamCapture}
                      >
                        <Camera size={14} />
                        <span>Webcam Capture</span>
                      </button>

                      <label className="dbs-photo-btn dbs-btn-upload">
                        <Upload size={14} />
                        <span>Upload Photo</span>

                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              const dataUrl = await fileToDataUrl(file);
                              setPhotoFile(file);
                              setPhotoPreview(dataUrl);
                              const currentId =
                                getValues("admNo") ||
                                getValues("regNo") ||
                                getValues("sNo") ||
                                isEditingId ||
                                "temp";
                              toast.success(`Photo attached: P-${currentId}`);
                            }
                          }}
                        />
                      </label>
                    </div>

                    <span className="dbs-upload-hint">JPG, PNG • Max 2 MB</span>
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
                          Clear signature on white background
                        </span>
                      </div>
                      <span className="dbs-upload-required">Required</span>
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
                          <Upload size={22} />
                          <span>No Signature Attached</span>
                        </div>
                      )}
                    </div>

                    <div className="dbs-photo-actions-box">
                      <label className="dbs-photo-btn dbs-btn-upload">
                        <Upload size={14} />
                        <span>Upload Signature</span>

                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              const dataUrl = await fileToDataUrl(file);
                              setSignatureFile(file);
                              setSignaturePreview(dataUrl);
                              const currentId =
                                getValues("admNo") ||
                                getValues("regNo") ||
                                getValues("sNo") ||
                                isEditingId ||
                                "temp";
                              toast.success(
                                `Signature attached: S-${currentId}`,
                              );
                            }
                          }}
                        />
                      </label>
                    </div>

                    <span className="dbs-upload-hint">JPG, PNG • Max 1 MB</span>
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
              {/* Father / Parent Details */}
              <div className="dbs-form-card">
                <div className="dbs-card-title-row">
                  <Users className="dbs-card-title-icon" size={20} />
                  <h3>3. Parent Details - Father / Parent</h3>
                </div>
                <div className="dbs-form-grid-3">
                  <div className="dbs-input-box">
                    <label>Father's Name *</label>
                    <input
                      type="text"
                      {...register("fatherName", { required: true })}
                      placeholder="Father Full Name"
                    />
                  </div>
                  <div className="dbs-input-box">
                    <label>Parent Occupation</label>
                    <input
                      type="text"
                      {...register("fatherOccupation")}
                      placeholder="Occupation / Business"
                    />
                  </div>
                  <div className="dbs-input-box">
                    <label>Annual Income</label>
                    <input
                      type="text"
                      {...register("fatherIncome")}
                      placeholder="Income in INR"
                    />
                  </div>

                  <div className="dbs-input-box">
                    <label>Parent Mobile No. *</label>
                    <input
                      type="tel"
                      {...register("parentMobile", { required: true })}
                      placeholder="Primary Mobile Number"
                    />
                  </div>
                  <div className="dbs-input-box">
                    <label>Mobile No. 1</label>
                    <input
                      type="tel"
                      {...register("mobileNo1")}
                      placeholder="Alternate Contact 1"
                    />
                  </div>
                  <div className="dbs-input-box">
                    <label>Mobile No. 2</label>
                    <input
                      type="tel"
                      {...register("mobileNo2")}
                      placeholder="Alternate Contact 2"
                    />
                  </div>

                  <div className="dbs-input-box dbs-grid-col-span-3">
                    <label>Parent Aadhaar No. *</label>
                    <input
                      type="text"
                      {...register("parentAadhaarNo", { required: true })}
                      placeholder="12-Digit Parent Aadhaar No."
                    />
                  </div>
                </div>
              </div>

              {/* Mother Details */}
              <div className="dbs-form-card">
                <div className="dbs-card-title-row">
                  <User className="dbs-card-title-icon" size={20} />
                  <h3>Mother Details</h3>
                </div>
                <div className="dbs-form-grid-2">
                  <div className="dbs-input-box">
                    <label>Mother's Name</label>
                    <input
                      type="text"
                      {...register("motherName")}
                      placeholder="Mother Full Name"
                    />
                  </div>
                  <div className="dbs-input-box">
                    <label>Mother's Aadhaar No.</label>
                    <input
                      type="text"
                      {...register("motherAadhaarNo")}
                      placeholder="12-Digit Mother Aadhaar No."
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
              {/* SSC Section */}
              <div className="dbs-form-card">
                <div className="dbs-card-title-row">
                  <Award className="dbs-card-title-icon" size={20} />
                  <h3>4. Previous Education - SSC (10th Standard)</h3>
                </div>
                <div className="dbs-form-grid-3">
                  <div className="dbs-input-box">
                    <label>SSC School Name</label>
                    <input
                      type="text"
                      {...register("sscSchool")}
                      placeholder="School Name"
                    />
                  </div>
                  <div className="dbs-input-box">
                    <label>SSC Marks Percentage</label>
                    <input
                      type="text"
                      {...register("sscMarks")}
                      placeholder="GPA / Percentage"
                    />
                  </div>
                  <div className="dbs-input-box">
                    <label>SSC Hall Ticket No. *</label>
                    <input
                      type="text"
                      {...register("sscHallTicket", { required: true })}
                      placeholder="SSC Hall Ticket Number"
                    />
                  </div>

                  <div className="dbs-input-box">
                    <label>SSC Board</label>
                    <input
                      type="text"
                      {...register("sscBoard")}
                      placeholder="SSC Board AP / CBSE"
                    />
                  </div>
                  <div className="dbs-input-box">
                    <label>SSC Studied</label>
                    <input
                      type="text"
                      {...register("sscStudied")}
                      placeholder="Regular / Private"
                    />
                  </div>
                  <div className="dbs-input-box">
                    <label>SSC Aggregate</label>
                    <input
                      type="text"
                      {...register("sscAggregate")}
                      placeholder="Total Marks / Max Marks"
                    />
                  </div>

                  <div className="dbs-input-box dbs-grid-col-span-3">
                    <label>SSC Month & Year of Passing</label>
                    <input
                      type="text"
                      {...register("sscPassingDate")}
                      placeholder="e.g. March 2021"
                    />
                  </div>
                </div>
              </div>

              {/* Intermediate Section */}
              <div className="dbs-form-card">
                <div className="dbs-card-title-row">
                  <Award className="dbs-card-title-icon" size={20} />
                  <h3>Intermediate / Diploma</h3>
                </div>
                <div className="dbs-form-grid-3">
                  <div className="dbs-input-box">
                    <label>Inter College Name</label>
                    <input
                      type="text"
                      {...register("interCollege")}
                      placeholder="Junior College Name"
                    />
                  </div>

                  <div className="dbs-input-box">
                    <label>Inter Marks Percentage</label>
                    <input
                      type="text"
                      {...register("interMarks")}
                      placeholder="Percentage / CGPA"
                    />
                  </div>

                  <div className="dbs-input-box">
                    <label>Inter Hall Ticket No.</label>
                    <input
                      type="text"
                      {...register("interHallTicketNo")}
                      placeholder="Inter Hall Ticket"
                    />
                  </div>

                  <div className="dbs-input-box">
                    <label>Inter Board</label>
                    <input
                      type="text"
                      {...register("interBoardDetail")}
                      placeholder="BIEAP / TSBIE"
                    />
                  </div>

                  <div className="dbs-input-box">
                    <label>Inter Aggregate</label>
                    <input
                      type="text"
                      {...register("interAggregateDetail")}
                      placeholder="Aggregate Marks"
                    />
                  </div>

                  <div className="dbs-input-box">
                    <label>Inter Month & Year of Passing</label>
                    <input
                      type="text"
                      {...register("interPassingDateDetail")}
                      placeholder="e.g. March 2023"
                    />
                  </div>

                  {/* Subject-wise Marks */}
                  <div className="dbs-input-box">
                    <label>Mathematics Marks</label>
                    <input
                      type="text"
                      {...register("interMaths")}
                      placeholder="Mathematics Marks"
                    />
                  </div>

                  <div className="dbs-input-box">
                    <label>Physics Marks</label>
                    <input
                      type="text"
                      {...register("interPhysics")}
                      placeholder="Physics Marks"
                    />
                  </div>

                  <div className="dbs-input-box">
                    <label>Chemistry Marks</label>
                    <input
                      type="text"
                      {...register("interChemistry")}
                      placeholder="Chemistry Marks"
                    />
                  </div>
                </div>
              </div>

              {/* UG Section */}
              <div className="dbs-form-card">
                <div className="dbs-card-title-row">
                  <GraduationCap className="dbs-card-title-icon" size={20} />
                  <h3>Undergraduate (UG) Details</h3>
                </div>
                <div className="dbs-form-grid-3">
                  <div className="dbs-input-box">
                    <label>UG Course</label>
                    <input
                      type="text"
                      {...register("ugCourse")}
                      placeholder="e.g. B.Tech / B.Sc / BCA"
                    />
                  </div>
                  <div className="dbs-input-box">
                    <label>UG College Name</label>
                    <input
                      type="text"
                      {...register("ugCollege")}
                      placeholder="Degree / Engineering College"
                    />
                  </div>
                  <div className="dbs-input-box">
                    <label>UG Marks Percentage</label>
                    <input
                      type="text"
                      {...register("ugMarks")}
                      placeholder="Aggregate CGPA / %"
                    />
                  </div>
                  <div className="dbs-input-box">
                    <label>UG Hall Ticket No.</label>
                    <input
                      type="text"
                      {...register("ugHallTicket")}
                      placeholder="UG Roll / Hall Ticket No."
                    />
                  </div>

                  <div className="dbs-input-box">
                    <label>University</label>
                    <input
                      type="text"
                      {...register("ugUniversity")}
                      placeholder="JNTUK / AU / SVU"
                    />
                  </div>
                  <div className="dbs-input-box">
                    <label>UG Aggregate</label>
                    <input
                      type="text"
                      {...register("ugAggregateDetail")}
                      placeholder="Aggregate Score"
                    />
                  </div>
                  <div className="dbs-input-box">
                    <label>UG Month & Year of Passing</label>
                    <input
                      type="text"
                      {...register("ugPassingDateDetail")}
                      placeholder="e.g. May 2025"
                    />
                  </div>
                  <div className="dbs-input-box dbs-grid-col-span-2">
                    <label>Rank</label>
                    <input
                      type="text"
                      {...register("ugRank")}
                      placeholder="University Rank / Medal"
                    />
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
                  <input
                    type="text"
                    {...register("fee_admType")}
                    placeholder="e.g. Regular / Convenor"
                  />
                </div>
                <div className="dbs-input-box">
                  <label>Tuition Fee</label>
                  <input
                    type="text"
                    {...register("tuitionFee")}
                    placeholder="Tuition Fee Amount"
                  />
                </div>
                <div className="dbs-input-box">
                  <label>Miscellaneous Fee</label>
                  <input
                    type="text"
                    {...register("miscellaneousfee")}
                    placeholder="Misc Fee Amount"
                  />
                </div>
                <div className="dbs-input-box">
                  <label>Scholarship Amount</label>
                  <input
                    type="text"
                    {...register("scholarshipAmount")}
                    placeholder="INR Amount (e.g. 15000)"
                  />
                </div>
                <div className="dbs-input-box">
                  <label>Spot Admission Fee</label>
                  <input
                    type="text"
                    {...register("spotFee")}
                    placeholder="INR Amount (e.g. 2000)"
                  />
                </div>
                <div className="dbs-input-box">
                  <label>Boys Hostel Fee</label>
                  <input
                    type="text"
                    {...register("boysHostelFee")}
                    placeholder="INR Amount per year"
                  />
                </div>
                <div className="dbs-input-box">
                  <label>Ladies Hostel Fee</label>
                  <input
                    type="text"
                    {...register("ladiesHostelFee")}
                    placeholder="INR Amount per year"
                  />
                </div>
                <div className="dbs-input-box">
                  <label>Bus Fee</label>
                  <input
                    type="text"
                    {...register("busFee")}
                    placeholder="Transport / Bus Fee"
                  />
                </div>
                <div className="dbs-input-box">
                  <label>Donation Fee</label>
                  <input
                    type="text"
                    {...register("donation")}
                    placeholder="Donation Amount"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Review & Submit */}
        {currentStep === 5 && (
          <div className="dbs-stepper-slide">
            <div className="dbs-form-card dbs-review-card">
              <h3>Review Details Before Final Registration</h3>
              <p className="dbs-review-warning">
                Please review all academic allocations, student contact details,
                parent information, and fee scopes before saving to active
                registry.
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

              <div className="dbs-print-acknowledgement-row mt-4">
                <label className="dbs-checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span>Generate admission slip receipt after saving</span>
                </label>
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

          {currentStep < STEPS.length - 1 ? (
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
          ) : (
            <button
              type="submit"
              className="dbs-stepper-next-btn"
              disabled={isSubmitting}
            >
              <Save size={16} />
              <span>
                {isSubmitting
                  ? isEditingId
                    ? "Updating..."
                    : "Saving..."
                  : isEditingId
                    ? "Update Student Record"
                    : "Save Student Registry"}
              </span>
            </button>
          )}
        </div>
      </form>

      {/* --- ENROLLMENT DATATABLE LIST --- */}
      <div className="dbs-dashboard-card dbs-datatable-card">
        <div className="dbs-datatable-header-area">
          <div>
            <h3>Active Enrolled Students Registry</h3>
            <p>Showing {filteredStudents.length} student records</p>
          </div>

          <div className="dbs-datatable-filters-row">
            {/* Table Search Input */}
            <div className="dbs-search-box-wrapper">
              <Search size={16} className="dbs-search-box-icon" />
              <input
                type="text"
                placeholder="Search name, S.No or ID..."
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="dbs-table-search-input"
              />
            </div>

            {/* Course Filter */}
            <select
              value={filterCourse}
              onChange={(e) => {
                setFilterCourse(e.target.value);
                setCurrentPage(1);
              }}
              className="dbs-table-select-filter"
            >
              <option value="All">All Courses</option>
              <option value="B.Tech">B.Tech</option>
              <option value="M.Tech">M.Tech</option>
              <option value="MBA">MBA</option>
            </select>

            {/* Section Filter */}
            <select
              value={filterSection}
              onChange={(e) => {
                setFilterSection(e.target.value);
                setCurrentPage(1);
              }}
              className="dbs-table-select-filter"
            >
              <option value="All">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>
          </div>
        </div>

        {/* Reactive Table Grid */}
        <div className="dbs-table-container">
          {sortedStudents.length === 0 ? (
            <div className="dbs-empty-state">
              <AlertCircle className="dbs-empty-state-icon" />
              <div className="dbs-empty-state-title">No records found</div>
              <div className="dbs-empty-state-desc">
                Try resetting your filters or add a new student above.
              </div>
            </div>
          ) : (
            <table className="dbs-data-table">
              <thead>
                <tr>
                  <th
                    onClick={() => triggerSort("STUDENTSERIALNO")}
                    style={{ cursor: "pointer" }}
                  >
                    Serial No.{" "}
                    {sortBy === "STUDENTSERIALNO" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => triggerSort("AdmNo")}
                    style={{ cursor: "pointer" }}
                  >
                    ADM No.{" "}
                    {sortBy === "AdmNo" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => triggerSort("SNAME")}
                    style={{ cursor: "pointer" }}
                  >
                    Student Name{" "}
                    {sortBy === "SNAME" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th>Programme</th>
                  <th>Branch</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((student, idx) => {
                  const studentName = String(
                    getVal(student, "SNAME", "sName", "StudentName", "name"),
                  );
                  const admNo = String(
                    getVal(student, "AdmNo", "ADMNO", "admNo"),
                  );
                  const course = String(
                    getVal(student, "Course", "COURSE", "programme"),
                  );
                  const branch = String(
                    getVal(student, "BranchName", "BRANCHNAME", "branch"),
                  );
                  const sNo = String(
                    getVal(
                      student,
                      "STUDENTSERIALNO",
                      "studentSerialNo",
                      "sNo",
                      "ident",
                      "id",
                    ),
                  );

                  return (
                    <tr key={sNo || idx}>
                      <td>{startIndex + idx + 1}</td>
                      <td>{admNo || "-"}</td>
                      <td className="dbs-table-student-name">
                        {studentName || "-"}
                      </td>
                      <td>
                        <span className="dbs-pill-category">
                          {course || "-"}
                        </span>
                      </td>
                      <td className="dbs-table-branch-td">{branch || "-"}</td>
                      <td>
                        <div className="dbs-table-actions-row">
                          <button
                            type="button"
                            className="dbs-table-action-icon-btn dbs-btn-edit"
                            onClick={() => handleEditStudent(student)}
                            title="Update Student Record"
                          >
                            <Edit3 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- WEBCAM PHOTO CAPTURE MODAL --- */}
      {webcamOpen && (
        <div className="dbs-search-overlay-modal">
          <div className="dbs-search-modal-box dbs-webcam-modal-box">
            <div className="dbs-dropdown-header">
              <span>Webcam Image Capture Console</span>
              <button
                className="dbs-panel-close-btn"
                onClick={() => setWebcamOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="dbs-webcam-console-body">
              <div className="dbs-webcam-stream-simulation-frame">
                <div
                  className="dbs-webcam-simulation-canvas"
                  style={{ transform: `rotate(${rotationAngle}deg)` }}
                >
                  <img
                    src={mockPhotoSelection}
                    alt="Camera feed stream"
                    className="dbs-simulated-video-feed"
                  />
                  <div className="dbs-webcam-crop-frame-overlay" />
                </div>
                <div className="dbs-webcam-status-overlay">
                  🔴 LIVE WEBCAM STREAM
                </div>
              </div>

              <div className="dbs-webcam-toolbar-row">
                <button
                  type="button"
                  className="dbs-toolbar-adjust-btn"
                  onClick={() => setRotationAngle((prev) => (prev + 90) % 360)}
                >
                  <RotateCw size={14} />
                  <span>Rotate 90°</span>
                </button>
                <button
                  type="button"
                  className="dbs-toolbar-adjust-btn"
                  onClick={handleWebcamCapture}
                >
                  <RefreshCw size={14} />
                  <span>Re-snap Image</span>
                </button>
              </div>
            </div>

            <div className="dbs-webcam-modal-footer">
              <button
                type="button"
                className="dbs-form-cancel-btn"
                onClick={() => setWebcamOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="dbs-form-save-btn"
                onClick={saveWebcamPhoto}
              >
                <CheckCircle size={15} />
                <span>Crop & Save Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
  );
};

export default AdmissionsEntry;
