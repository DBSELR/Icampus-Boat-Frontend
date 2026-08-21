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
  Trash2,
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
import { useDropzone } from "react-dropzone";
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
import Footer from "../../../common/Footer";

// Form steps definition
const STEPS = [
  "Academic Info",
  "Student Details",
  "Parent Details",
  "Previous Education",
  "Fees Scope",
  "Upload Docs",
  "Review & Submit",
];

const parseApiDate = (value?: string | null) => {
  if (!value) return "";
  const match = String(value).match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return "";
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`;
};

const toApiDate = (value?: string | null) => {
  if (!value) return "";
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return value;
  const [, yyyy, mm, dd] = match;
  return `${dd}-${mm}-${yyyy}`;
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

  // Confirmation dialog overlays
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

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
      joiningAcademicYear: "2025-2026",
      currentAcademicYear: "2025-2026",
      cet: "EAPCET",
      hallTicket: "",
      rank: "",
      branchRank: "",
      interHallTicketNo: "",
      ugRank: "",
      jnanaBhumiId: "",
      regulation: "R23",
      libraryMemberGroup: "General Student",
      apaarId: "",

      // 2. Student Details - Personal / Identity
      name: "",
      dob: "",
      gender: "Male",
      nationality: "Indian",
      motherTongue: "Telugu",
      religion: "Hindu",
      bloodGroup: "O+",
      differentlyAbled: "No",
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
      status: "Enrolled",
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

      // Intermediate
      interCollege: "",
      interMarks: "",
      interBoardDetail: "BIEAP",
      interAggregateDetail: "",
      interPassingDateDetail: "",
      interMaths: "",
      interPhysics: "",
      interChemistry: "",

      // UG
      ugCollege: "",
      ugMarks: "",
      ugHallTicket: "",
      ugUniversity: "",
      ugAggregateDetail: "",
      ugPassingDateDetail: "",

      // 5. Fees Scope
      scholarshipAmount: "0",
      boysHostelFee: "0",
      ladiesHostelFee: "0",
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

  // Dropzone setup for document uploads
  const onDrop = (acceptedFiles: File[]) => {
    toast.success(`${acceptedFiles.length} file(s) attached successfully!`);
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // Confirmation modal triggers
  const confirmDeleteStudent = (studentSerialNo: string) => {
    setDeleteTargetId(studentSerialNo);
  };

  const executeDelete = () => {
    if (deleteTargetId) {
      // TODO: also call a DELETE endpoint (e.g. /api/Admission/{id}) once
      // one exists — this only removes the row from local state/UI so far.
      setStudentData((prev) =>
        prev.filter((s) => s.STUDENTSERIALNO !== deleteTargetId),
      );
      toast.success(`Record ${deleteTargetId} deleted successfully.`);
      setDeleteTargetId(null);
    }
  };

  const handleEditStudent = (student: any) => {
    setIsEditingId(student.STUDENTSERIALNO);
    reset({
      admDate: parseApiDate(student.ADMISSIONDATE),
      sNo: student.STUDENTSERIALNO || "",
      admNo: student.AdmNo || "",
      regNo: student.REGISTRATIONNO || "",
      course: student.Course || "01-B.Tech",
      branch: student.BranchName || "05-COMPUTER SCIENCE AND ENGINEERING",
      admittedYear: student.AYEAR != null ? String(student.AYEAR) : "1",
      admittedSem: student.ASEMESTER != null ? String(student.ASEMESTER) : "1",
      year: student.SYEAR != null ? String(student.SYEAR) : "1",
      sem: student.SSEMESTER != null ? String(student.SSEMESTER) : "1",
      section: student.SECTION || "A",
      joiningAcademicYear: student.ACADAMICYEAR || "2025-2026",
      currentAcademicYear: student.ACADAMICYEAR || "2025-2026",
      cet: "EAPCET",
      hallTicket: "",
      rank: "",
      branchRank: "",
      interHallTicketNo: "",
      ugRank: "",
      jnanaBhumiId: "",
      regulation: "R23",
      libraryMemberGroup: "General Student",
      apaarId: "",
      name: student.SNAME || "",
      dob: parseApiDate(student.DOB),
      gender: student.GENDER || "Male",
      nationality: "Indian",
      motherTongue: "Telugu",
      religion: student.RELIGION || "Hindu",
      bloodGroup: "O+",
      differentlyAbled: "No",
      caste: student.CASTE || "OC",
      subcaste: student.SUBCASTE || "",
      category: "General",
      allottedQuota: "Convenor",
      // NOTE: API's MODEOFADM (e.g. "Spot (Cat-A)") uses different labels
      // than this select's options (CET / Direct / Management) — stored
      // as-is so nothing is lost, but the dropdown may show unselected.
      modeOfAdmission: student.MODEOFADM || "CET",
      categoryOfAdmission: "Regular",
      mole1: "",
      mole2: "",
      studentMobile: "",
      studentEmail: "",
      address: "",
      state: "Andhra Pradesh",
      rationCardNo: "",
      incomeCertNo: "",
      aadhaarNo: "",
      activeStatus: "Active",
      isActive: true,
      scholor: false,
      le: false,
      staffChild: false,
      nsp: false,
      status: student.status || "Enrolled",
      statusDate: new Date().toISOString().split("T")[0],
      statusReason: "Regular Admission",
      fatherName: "",
      fatherOccupation: "",
      fatherIncome: "",
      parentMobile: "",
      mobileNo1: "",
      mobileNo2: "",
      parentAadhaarNo: "",
      motherName: "",
      motherAadhaarNo: "",
      sscSchool: "",
      sscMarks: "",
      sscHallTicket: "",
      sscBoard: "SSC Board AP",
      sscStudied: "Regular",
      sscAggregate: "",
      sscPassingDate: "",
      interCollege: "",
      interMarks: "",
      interBoardDetail: "BIEAP",
      interAggregateDetail: "",
      interPassingDateDetail: "",
      ugCollege: "",
      ugMarks: "",
      ugHallTicket: "",
      ugUniversity: "",
      ugAggregateDetail: "",
      ugPassingDateDetail: "",
      scholarshipAmount: student.TUITIONFEE || "0",
      boysHostelFee: "0",
      ladiesHostelFee: "0",
      spotFee: student.MISCELLANEOUSFEE || "0",
    });

    setPhotoPreview("");
    setPhotoFile(null);
    setSignaturePreview("");
    setSignatureFile(null);

    setCurrentStep(0);
    toast.info(`Loaded student profile: ${student.SNAME}`);
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
    const finalSNo =
      data.sNo || `9${Math.floor(100 + Math.random() * 900)}/25-26`;
    const finalAdmNo =
      data.admNo || `25MDS${Math.floor(10 + Math.random() * 89)}`;
    const finalRegNo =
      data.regNo || `25MDS${Math.floor(10 + Math.random() * 89)}`;
    const upperName = (data.name || "NEW STUDENT").toUpperCase();

    const savePayload = {
      ident: isEditingId || "0",
      studentSerialNo: finalSNo,
      admNo: finalAdmNo,
      registrationNo: finalRegNo,
      admissionDate: toApiDate(data.admDate),
      dob: toApiDate(data.dob),
      sName: upperName,
      searchName: upperName,
      modeofAdm: data.modeOfAdmission,
      programme: data.course,
      branch: data.branch,
      section: data.section,
      aYear: data.admittedYear,
      sYear: data.year,
      acadamicYear: data.currentAcademicYear,
      jAcadamicYear: data.joiningAcademicYear,
      aSemester: data.admittedSem,
      sSemester: data.sem,
      caste: data.caste,
      subCaste: data.subcaste,
      gender: data.gender,
      nationality: data.nationality,
      religion: data.religion,
      bloodGrp: data.bloodGroup,
      ph: data.differentlyAbled,
      schAmount: data.scholarshipAmount,
      bhFee: data.boysHostelFee,
      lhFee: data.ladiesHostelFee,
      spotAdmFee: data.spotFee,
      rank: data.rank,
      hallTicketNo: data.hallTicket,
      hallTicket: "",
      sscSchoolName: data.sscSchool,
      sscMarksPercentage: data.sscMarks,
      fName: data.fatherName,
      parentOccupation: data.fatherOccupation,
      income: data.fatherIncome,
      mName: data.motherName,
      address: data.address,
      parentMbNo: data.parentMobile,
      parentMbNo2: data.mobileNo2,
      stdMobNo: data.studentMobile,
      aadhaarNo: data.aadhaarNo,
      rationcardNo: data.rationCardNo,
      icNo: data.incomeCertNo,
      emailid: data.studentEmail,
      status: data.status,
      ssC_HallTicketNo: data.sscHallTicket,
      ssC_Board: data.sscBoard,
      sscStudied: data.sscStudied,
      ssC_Aggregate: data.sscAggregate,
      ssC_MYPassing: data.sscPassingDate,
      int_CollegeName: data.interCollege,
      int_MarksPerc: data.interMarks,
      int_HallTicketNo: data.interHallTicketNo,
      int_Board: data.interBoardDetail,
      int_Aggregate: data.interAggregateDetail,
      int_MYPassing: data.interPassingDateDetail,
      uG_CollegeName: data.ugCollege,
      uG_MarksPerc: data.ugMarks,
      uG_HallTicketNo: data.ugHallTicket,
      uG_University: data.ugUniversity,
      uG_Aggregate: data.ugAggregateDetail,
      uG_MYPassing: data.ugPassingDateDetail,
      isactive: data.isActive,
      reason: data.statusReason,
      date: toApiDate(data.statusDate),
      aStatus: data.activeStatus,
      branchRank: data.branchRank,
      mole1: data.mole1,
      mole2: data.mole2,
      states: data.state,
      category: data.category,
      motherTongue: data.motherTongue,
      maths: data.interMaths,
      physics: data.interPhysics,
      chemistry: data.interChemistry,
      le: data.le,
      fac_Child: data.staffChild,
      jnanaBhumiId: data.jnanaBhumiId,
      regulation: data.regulation,
      mAadharNo: data.motherAadhaarNo,
      librarymembergroup: data.libraryMemberGroup,
      schlor: data.scholor,
      modeofCtgy: data.categoryOfAdmission,
      allottedQuota: data.allottedQuota,
      nsp: data.nsp,
      apaar: data.apaarId,

      cet: data.cet,
      ugRank: data.ugRank,
      mobileNo1: data.mobileNo1,
      parentAadhaarNo: data.parentAadhaarNo,
    };

    try {
      setIsSubmitting(true);
      await saveAdmission(savePayload);

      toast.success(
        isEditingId
          ? "Student details updated successfully!"
          : "New student registration completed!",
      );
      setIsEditingId(null);
      fetchAdmissions();

      // Reset form after submit
      reset();
      setPhotoPreview("");
      setPhotoFile(null);
      setSignaturePreview("");
      setSignatureFile(null);
      setCurrentStep(0);
    } catch (error) {
      console.error("Error saving admission:", error);
      toast.error("Failed to save student registration. Please try again.");
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
    // Convert the mock webcam image into a real File object so the "Save
    // Student Registry" step can upload it exactly like a manually chosen file.
    try {
      const response = await fetch(mockPhotoSelection);
      const blob = await response.blob();
      const extension = blob.type.split("/")[1] || "jpg";
      const capturedFile = new File([blob], `webcam-capture.${extension}`, {
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
    const matchesSearch =
      (s.SNAME || "").toLowerCase().includes(tableSearch.toLowerCase()) ||
      (s.AdmNo || "").toLowerCase().includes(tableSearch.toLowerCase()) ||
      (s.STUDENTSERIALNO || "")
        .toLowerCase()
        .includes(tableSearch.toLowerCase());
    const matchesCourse =
      filterCourse === "All" || (s.Course || "").includes(filterCourse);
    const matchesBranch =
      filterBranch === "All" || (s.BranchName || "").includes(filterBranch);
    const matchesSection =
      filterSection === "All" || s.SECTION === filterSection;
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
          <h2>Student Admission Form</h2>
          <p>Structured 5-Step Academic & Student Enrolment Console</p>
        </div>
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
                  <label>Student Serial No. *</label>
                  <input
                    type="text"
                    {...register("sNo", { required: true })}
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
                    {programe.map((item: any, index: number) => (
                      <option
                        key={index}
                        value={item.COURSECODE ?? item.COURSE_CODE ?? item.ID}
                      >
                        {item.COURSE ?? item.PROGRAMME ?? item.NAME}
                      </option>
                    ))}
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

                    {branches.map((item: any) => (
                      <option key={item.BRANCHCODE} value={item.BRANCHCODE}>
                        {item.BRANCHNAME}
                      </option>
                    ))}
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

                    {admittedYears.map((year) => (
                      <option key={year.ID} value={year.ID}>
                        {year.DATA}
                      </option>
                    ))}
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

                    {years.map((year) => (
                      <option key={year.ID} value={year.ID}>
                        {year.DATA}
                      </option>
                    ))}
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

                    {regulations.map((regu, index) => (
                      <option key={index} value={regu.regulation}>
                        {regu.regulation}
                      </option>
                    ))}
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
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                    <div className="dbs-input-box">
                      <label>Caste *</label>

                      <select {...register("caste")}>
                        <option value="">Select Caste</option>

                        {castes.map((item, index) => (
                          <option key={index} value={item.Caste}>
                            {item.Caste}
                          </option>
                        ))}
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
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              setPhotoFile(file);
                              setPhotoPreview(URL.createObjectURL(file));
                              toast.success("Image file attached successfully");
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
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              setSignatureFile(file);
                              setSignaturePreview(URL.createObjectURL(file));
                              toast.success(
                                "Signature file attached successfully",
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
                    <label>UG College Name *</label>
                    <input
                      type="text"
                      {...register("ugCollege")}
                      placeholder="Degree / Engineering College"
                    />
                  </div>
                  <div className="dbs-input-box">
                    <label>UG Marks Percentage *</label>
                    <input
                      type="text"
                      {...register("ugMarks")}
                      placeholder="Aggregate CGPA / %"
                    />
                  </div>
                  <div className="dbs-input-box">
                    <label>UG Hall Ticket No. *</label>
                    <input
                      type="text"
                      {...register("ugHallTicket")}
                      placeholder="UG Roll / Hall Ticket No."
                    />
                  </div>

                  <div className="dbs-input-box">
                    <label>University *</label>
                    <input
                      type="text"
                      {...register("ugUniversity")}
                      placeholder="JNTUK / AU / SVU"
                    />
                  </div>
                  <div className="dbs-input-box">
                    <label>UG Aggregate *</label>
                    <input
                      type="text"
                      {...register("ugAggregateDetail")}
                      placeholder="Aggregate Score"
                    />
                  </div>
                  <div className="dbs-input-box">
                    <label>UG Month & Year of Passing *</label>
                    <input
                      type="text"
                      {...register("ugPassingDateDetail")}
                      placeholder="e.g. May 2025"
                    />
                  </div>
                  <div className="dbs-input-box dbs-grid-col-span-3">
                    <label>Rank *</label>
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
              <div className="dbs-form-grid-2">
                <div className="dbs-input-box">
                  <label>Scholarship Amount *</label>
                  <input
                    type="text"
                    {...register("scholarshipAmount", { required: true })}
                    placeholder="INR Amount (e.g. 15000)"
                  />
                </div>
                <div className="dbs-input-box">
                  <label>Spot Admission Fee *</label>
                  <input
                    type="text"
                    {...register("spotFee", { required: true })}
                    placeholder="INR Amount (e.g. 2000)"
                  />
                </div>
                <div className="dbs-input-box">
                  <label>Boys Hostel Fee *</label>
                  <input
                    type="text"
                    {...register("boysHostelFee", { required: true })}
                    placeholder="INR Amount per year"
                  />
                </div>
                <div className="dbs-input-box">
                  <label>Ladies Hostel Fee *</label>
                  <input
                    type="text"
                    {...register("ladiesHostelFee", { required: true })}
                    placeholder="INR Amount per year"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Upload Documents */}
        {currentStep === 5 && (
          <div className="dbs-stepper-slide">
            <div className="dbs-form-card">
              <div className="dbs-card-title-row">
                <Upload className="dbs-card-title-icon" size={20} />
                <h3>Upload Academic Certificates (Drag & Drop)</h3>
              </div>

              <div
                {...getRootProps()}
                className={`dbs-file-dropzone ${isDragActive ? "dbs-dropzone-active" : ""}`}
              >
                <input {...getInputProps()} />
                <Upload size={36} className="dbs-dropzone-icon" />
                {isDragActive ? (
                  <p>Drop certification files here...</p>
                ) : (
                  <p>
                    Drag & drop SSC Memo, Inter Certificate, Transfer
                    Certificate, and Caste/Income Memos here, or click to
                    browse.
                  </p>
                )}
                <span className="dbs-dropzone-sub">
                  Supported formats: PDF, JPG, PNG (Max 5MB per file)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Review & Submit */}
        {currentStep === 6 && (
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
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
          >
            <ArrowLeft size={16} />
            <span>Previous</span>
          </button>

          <button
            type="submit"
            className="dbs-stepper-next-btn"
            disabled={isSubmitting}
          >
            {currentStep === STEPS.length - 1 ? (
              <>
                <Save size={16} />
                <span>
                  {isSubmitting ? "Saving..." : "Save Student Registry"}
                </span>
              </>
            ) : (
              <>
                <span>Next Step</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
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
                {currentData.map((student, idx) => (
                  <tr key={student.STUDENTSERIALNO ?? idx}>
                    <td>{startIndex + idx + 1}</td>

                    <td>{student.AdmNo}</td>

                    <td className="dbs-table-student-name">{student.SNAME}</td>

                    <td>
                      <span className="dbs-pill-category">
                        {student.Course}
                      </span>
                    </td>

                    <td className="dbs-table-branch-td">
                      {student.BranchName}
                    </td>

                    <td>
                      <div className="dbs-table-actions-row">
                        <button
                          type="button"
                          className="dbs-table-action-icon-btn dbs-btn-edit"
                          onClick={() => handleEditStudent(student)}
                          title="Edit Student Record"
                        >
                          <Edit3 size={14} />
                        </button>

                        <button
                          type="button"
                          className="dbs-table-action-icon-btn dbs-btn-delete"
                          onClick={() =>
                            confirmDeleteStudent(student.STUDENTSERIALNO)
                          }
                          title="Delete Student Record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* --- CONFIRMATION DELETE DIALOG OVERLAY --- */}
      {deleteTargetId && (
        <div className="dbs-search-overlay-modal dbs-z-index-high">
          <div className="dbs-search-modal-box dbs-confirm-modal-box">
            <div className="dbs-confirm-modal-body">
              <AlertTriangle size={36} className="dbs-warning-danger-icon" />
              <h3>Delete Student Record?</h3>
              <p>
                Are you sure you want to delete student{" "}
                <strong>{deleteTargetId}</strong>? This operation cannot be
                undone.
              </p>
            </div>
            <div className="dbs-confirm-modal-actions">
              <button
                type="button"
                className="dbs-confirm-btn-cancel"
                onClick={() => setDeleteTargetId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="dbs-confirm-btn-delete"
                onClick={executeDelete}
              >
                Delete Permanently
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
 


