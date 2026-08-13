import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { 
  Camera, RotateCw, Check, X, Upload, Save, ArrowLeft, ArrowRight, Trash2, 
  Edit3, Search, Filter, RefreshCw, AlertTriangle, AlertCircle, FileText, CheckCircle,
  UserCheck, ShieldAlert, Award, CreditCard, GraduationCap, Users, User, FileSpreadsheet
} from "lucide-react";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import "./Admissions_VIew.css";

// Form steps definition
const STEPS = [
  "Academic Info",
  "Student Details",
  "Parent Details",
  "Previous Education",
  "Fees Scope",
  "Upload Docs",
  "Review & Submit"
];

// Initial mock dataset
const INITIAL_STUDENTS = [
  { 
    sNo: "9808/25-26", admNo: "25MDS06", regNo: "25MDS06", admDate: "2025-10-23", 
    name: "SHAIK MOHAMMED GHOUSE JANI", course: "02-M.Tech", branch: "88-Data Science(CSE)", 
    year: "1", sem: "1", section: "A", photo: "", sscSchool: "St. Joseph High School", sscMarks: "85", 
    fatherName: "Shaik Ghouse", fatherMobile: "9876543210", category: "General", isActive: true,
    scholarshipAmount: "15000", spotFee: "2000", boysHostelFee: "45000", ladiesHostelFee: "0"
  },
  { 
    sNo: "9807/25-26", admNo: "25MDS05", regNo: "25MDS05", admDate: "2025-10-23", 
    name: "GUDIMELLI MONIKA", course: "02-M.Tech", branch: "88-Data Science(CSE)", 
    year: "1", sem: "1", section: "A", photo: "", sscSchool: "Montessori English Medium", sscMarks: "92", 
    fatherName: "G. Srinivasa Rao", fatherMobile: "8765432109", category: "BC-B", isActive: true,
    scholarshipAmount: "20000", spotFee: "0", boysHostelFee: "0", ladiesHostelFee: "48000"
  },
  { 
    sNo: "9806/25-26", admNo: "25MDS04", regNo: "25MDS04", admDate: "2025-10-23", 
    name: "DARAPUNENI BHAVYA", course: "02-M.Tech", branch: "88-Data Science(CSE)", 
    year: "1", sem: "1", section: "A", photo: "", sscSchool: "Nirmala High School", sscMarks: "88", 
    fatherName: "D. Prasad", fatherMobile: "7654321098", category: "OC", isActive: true,
    scholarshipAmount: "0", spotFee: "5000", boysHostelFee: "0", ladiesHostelFee: "0"
  },
  { 
    sNo: "9805/25-26", admNo: "25MBA167", regNo: "25MBA167", admDate: "2025-10-22", 
    name: "TALAM BHARGAVI", course: "03-MBA", branch: "125-MASTER OF BUSINESS ADMINISTRATION", 
    year: "1", sem: "1", section: "B", photo: "", sscSchool: "Aditya Public School", sscMarks: "90", 
    fatherName: "T. Narayana", fatherMobile: "9812345678", category: "SC", isActive: true,
    scholarshipAmount: "35000", spotFee: "0", boysHostelFee: "0", ladiesHostelFee: "45000"
  },
  { 
    sNo: "9804/25-26", admNo: "25MBA165", regNo: "25MBA165", admDate: "2025-10-22", 
    name: "MUCHINTALA HARI KRISHNA", course: "03-MBA", branch: "125-MASTER OF BUSINESS ADMINISTRATION", 
    year: "1", sem: "1", section: "B", photo: "", sscSchool: "ZPHS School", sscMarks: "78", 
    fatherName: "M. Kondaiah", fatherMobile: "8899776655", category: "BC-A", isActive: true,
    scholarshipAmount: "12000", spotFee: "1000", boysHostelFee: "42000", ladiesHostelFee: "0"
  }
];

export const AdmissionView: React.FC = () => {
  const location = useLocation();
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  
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

  // Confirmation dialog overlays
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Search & Filter state for students database
  const [tableSearch, setTableSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("All");
  const [filterBranch, setFilterBranch] = useState("All");
  const [filterSection, setFilterSection] = useState("All");
  const [sortBy, setSortBy] = useState<string>("sNo");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // React Hook Form setup
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
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
      interCollegeName: "",
      interMarksPercentage: "",
      interHallTicketNo: "",
      interBoard: "BIEAP",
      interAggregate: "",
      interPassingDate: "",
      ugCollegeName: "",
      ugMarksPercentage: "",
      ugHallTicketNo: "",
      university: "",
      ugAggregate: "",
      ugPassingDate: "",
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
      interHallTicket: "",
      interBoardDetail: "BIEAP",
      interAggregateDetail: "",
      interPassingDateDetail: "",

      // UG
      ugCollege: "",
      ugMarks: "",
      ugHallTicket: "",
      ugUniversity: "",
      ugAggregateDetail: "",
      ugPassingDateDetail: "",
      ugRankDetail: "",

      // 5. Fees Scope
      scholarshipAmount: "0",
      boysHostelFee: "0",
      ladiesHostelFee: "0",
      spotFee: "0"
    }
  });

  const formData = watch();

  // Auto-save trigger simulation on form changes
  useEffect(() => {
    setIsSaving(true);
    const saveTimer = setTimeout(() => {
      setIsSaving(false);
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
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
  const confirmDeleteStudent = (sNo: string) => {
    setDeleteTargetId(sNo);
  };

  const executeDelete = () => {
    if (deleteTargetId) {
      setStudents(prev => prev.filter(s => s.sNo !== deleteTargetId));
      toast.success(`Record ${deleteTargetId} deleted successfully.`);
      setDeleteTargetId(null);
    }
  };

  const handleEditStudent = (student: any) => {
    setIsEditingId(student.sNo);
    reset({
      admDate: student.admDate || "",
      sNo: student.sNo || "",
      admNo: student.admNo || "",
      regNo: student.regNo || "",
      course: student.course || "01-B.Tech",
      branch: student.branch || "05-COMPUTER SCIENCE AND ENGINEERING",
      admittedYear: student.admittedYear || "1",
      admittedSem: student.admittedSem || "1",
      year: student.year || "1",
      sem: student.sem || "1",
      section: student.section || "A",
      joiningAcademicYear: student.joiningAcademicYear || "2025-2026",
      currentAcademicYear: student.currentAcademicYear || "2025-2026",
      cet: student.cet || "EAPCET",
      hallTicket: student.hallTicket || "",
      rank: student.rank || "",
      branchRank: student.branchRank || "",
      interCollegeName: student.interCollegeName || "",
      interMarksPercentage: student.interMarksPercentage || "",
      interHallTicketNo: student.interHallTicketNo || "",
      interBoard: student.interBoard || "BIEAP",
      interAggregate: student.interAggregate || "",
      interPassingDate: student.interPassingDate || "",
      ugCollegeName: student.ugCollegeName || "",
      ugMarksPercentage: student.ugMarksPercentage || "",
      ugHallTicketNo: student.ugHallTicketNo || "",
      university: student.university || "",
      ugAggregate: student.ugAggregate || "",
      ugPassingDate: student.ugPassingDate || "",
      ugRank: student.ugRank || "",
      jnanaBhumiId: student.jnanaBhumiId || "",
      regulation: student.regulation || "R23",
      libraryMemberGroup: student.libraryMemberGroup || "General Student",
      apaarId: student.apaarId || "",
      name: student.name || "",
      dob: student.dob || "",
      gender: student.gender || "Male",
      nationality: student.nationality || "Indian",
      motherTongue: student.motherTongue || "Telugu",
      religion: student.religion || "Hindu",
      bloodGroup: student.bloodGroup || "O+",
      differentlyAbled: student.differentlyAbled || "No",
      caste: student.caste || "OC",
      subcaste: student.subcaste || "",
      category: student.category || "General",
      allottedQuota: student.allottedQuota || "Convenor",
      modeOfAdmission: student.modeOfAdmission || "CET",
      categoryOfAdmission: student.categoryOfAdmission || "Regular",
      mole1: student.mole1 || "",
      mole2: student.mole2 || "",
      studentMobile: student.studentMobile || "",
      studentEmail: student.studentEmail || "",
      address: student.address || "",
      state: student.state || "Andhra Pradesh",
      rationCardNo: student.rationCardNo || "",
      incomeCertNo: student.incomeCertNo || "",
      aadhaarNo: student.aadhaarNo || "",
      activeStatus: student.activeStatus || "Active",
      isActive: student.isActive ?? true,
      scholor: student.scholor ?? false,
      le: student.le ?? false,
      staffChild: student.staffChild ?? false,
      nsp: student.nsp ?? false,
      status: student.status || "Enrolled",
      statusDate: student.statusDate || new Date().toISOString().split("T")[0],
      statusReason: student.statusReason || "Regular Admission",
      fatherName: student.fatherName || "",
      fatherOccupation: student.fatherOccupation || "",
      fatherIncome: student.fatherIncome || "",
      parentMobile: student.fatherMobile || student.parentMobile || "",
      mobileNo1: student.mobileNo1 || "",
      mobileNo2: student.mobileNo2 || "",
      parentAadhaarNo: student.parentAadhaarNo || "",
      motherName: student.motherName || "",
      motherAadhaarNo: student.motherAadhaarNo || "",
      sscSchool: student.sscSchool || "",
      sscMarks: student.sscMarks || "",
      sscHallTicket: student.sscHallTicket || "",
      sscBoard: student.sscBoard || "SSC Board AP",
      sscStudied: student.sscStudied || "Regular",
      sscAggregate: student.sscAggregate || "",
      sscPassingDate: student.sscPassingDate || "",
      interCollege: student.interCollege || "",
      interMarks: student.interMarks || "",
      interHallTicket: student.interHallTicket || "",
      interBoardDetail: student.interBoardDetail || "BIEAP",
      interAggregateDetail: student.interAggregateDetail || "",
      interPassingDateDetail: student.interPassingDateDetail || "",
      ugCollege: student.ugCollege || "",
      ugMarks: student.ugMarks || "",
      ugHallTicket: student.ugHallTicket || "",
      ugUniversity: student.ugUniversity || "",
      ugAggregateDetail: student.ugAggregateDetail || "",
      ugPassingDateDetail: student.ugPassingDateDetail || "",
      ugRankDetail: student.ugRankDetail || "",
      scholarshipAmount: student.scholarshipAmount || "0",
      boysHostelFee: student.boysHostelFee || "0",
      ladiesHostelFee: student.ladiesHostelFee || "0",
      spotFee: student.spotFee || "0"
    });

    if (student.photo) {
      setPhotoPreview(student.photo);
    } else {
      setPhotoPreview("");
    }
    setCurrentStep(0);
    toast.info(`Loaded student profile: ${student.name}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepSubmit = (data: any) => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Final Submission Handler
    const newRecord = {
      ...data,
      sNo: data.sNo || `9${Math.floor(100 + Math.random() * 900)}/25-26`,
      admNo: data.admNo || `25MDS${Math.floor(10 + Math.random() * 89)}`,
      regNo: data.regNo || `25MDS${Math.floor(10 + Math.random() * 89)}`,
      admDate: data.admDate,
      name: (data.name || "NEW STUDENT").toUpperCase(),
      course: data.course,
      branch: data.branch,
      year: data.year,
      sem: data.sem,
      section: data.section,
      photo: photoPreview || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop",
      fatherName: data.fatherName,
      fatherMobile: data.parentMobile
    };

    if (isEditingId) {
      setStudents(prev => prev.map(s => s.sNo === isEditingId ? newRecord : s));
      toast.success("Student details updated successfully!");
      setIsEditingId(null);
    } else {
      setStudents(prev => [newRecord, ...prev]);
      toast.success("New student registration completed!");
    }

    // Reset form after submit
    reset();
    setPhotoPreview("");
    setCurrentStep(0);
  };

  const handleWebcamCapture = () => {
    const mockAvatars = [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop"
    ];
    const randomIndex = Math.floor(Math.random() * mockAvatars.length);
    setMockPhotoSelection(mockAvatars[randomIndex]);
    setRotationAngle(0);
    setWebcamOpen(true);
  };

  const saveWebcamPhoto = () => {
    setPhotoPreview(mockPhotoSelection);
    setWebcamOpen(false);
    toast.success("Webcam photo attached successfully!");
  };

  // Filter students database
  const filteredStudents = students.filter(s => {
    const matchesSearch = (s.name || "").toLowerCase().includes(tableSearch.toLowerCase()) || 
                          (s.admNo || "").toLowerCase().includes(tableSearch.toLowerCase()) ||
                          (s.sNo || "").toLowerCase().includes(tableSearch.toLowerCase());
    const matchesCourse = filterCourse === "All" || (s.course || "").includes(filterCourse);
    const matchesBranch = filterBranch === "All" || (s.branch || "").includes(filterBranch);
    const matchesSection = filterSection === "All" || s.section === filterSection;
    return matchesSearch && matchesCourse && matchesBranch && matchesSection;
  });

  // Sort students database
  const sortedStudents = [...filteredStudents].sort((a: any, b: any) => {
    const aVal = a[sortBy] || "";
    const bVal = b[sortBy] || "";
    if (sortOrder === "asc") {
      return aVal.localeCompare ? aVal.localeCompare(bVal) : aVal - bVal;
    } else {
      return bVal.localeCompare ? bVal.localeCompare(aVal) : bVal - aVal;
    }
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedStudents.length / itemsPerPage);

  const triggerSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="dbs-admissions-container">
      
      {/* HEADER CONTROLS WITH AUTO SAVE INDICATOR */}
      <div className="dbs-admissions-form-header">
        <div>
          <h2>Student Admission View & Edit Console</h2>
          <p>Structured 5-Step Academic & Student Enrolment View</p>
        </div>
        <div className="dbs-autosave-indicator">
          {isSaving ? (
            <span className="dbs-autosave-saving"><RefreshCw size={14} className="dbs-spin" /> Draft Saving...</span>
          ) : (
            <span className="dbs-autosave-saved"><Check size={14} /> {lastSaved}</span>
          )}
        </div>
      </div>

      {/* --- 7-STEP HORIZONTAL STEPPER --- */}
      <div className="dbs-stepper-header-wrapper">
        {STEPS.map((step, idx) => {
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;
          return (
            <div key={idx} className="dbs-stepper-node-container" onClick={() => setCurrentStep(idx)} style={{ cursor: 'pointer' }}>
              <div className={`dbs-stepper-circle ${isActive ? "dbs-step-active" : ""} ${isCompleted ? "dbs-step-completed" : ""}`}>
                {isCompleted ? <Check size={14} /> : idx + 1}
              </div>
              <span className={`dbs-stepper-label ${isActive ? "dbs-label-active" : ""}`}>{step}</span>
              {idx < STEPS.length - 1 && <div className={`dbs-stepper-bar-connector ${idx < currentStep ? "dbs-bar-completed" : ""}`} />}
            </div>
          );
        })}
      </div>

      {/* --- FORM WRAPPER CARD --- */}
      <form onSubmit={handleSubmit(handleStepSubmit)} className="dbs-admissions-stepper-form-card">
        
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
                  <input type="date" {...register("admDate", { required: true })} />
                </div>
                <div className="dbs-input-box">
                  <label>Student Serial No. *</label>
                  <input type="text" {...register("sNo", { required: true })} placeholder="e.g. 9809/25-26" />
                </div>
                <div className="dbs-input-box">
                  <label>Admission No.</label>
                  <input type="text" {...register("admNo")} placeholder="e.g. 25MDS07" />
                </div>

                <div className="dbs-input-box">
                  <label>Registration No.</label>
                  <input type="text" {...register("regNo")} placeholder="e.g. 25MDS07" />
                </div>
                <div className="dbs-input-box">
                  <label>Programme *</label>
                  <select {...register("course")}>
                    <option value="01-B.Tech">01-B.Tech</option>
                    <option value="02-M.Tech">02-M.Tech</option>
                    <option value="03-MBA">03-MBA</option>
                    <option value="04-MCA">04-MCA</option>
                  </select>
                </div>
                <div className="dbs-input-box">
                  <label>Branch *</label>
                  <select {...register("branch")}>
                    <option value="05-COMPUTER SCIENCE AND ENGINEERING">05-COMPUTER SCIENCE AND ENGINEERING</option>
                    <option value="88-Data Science(CSE)">88-Data Science(CSE)</option>
                    <option value="125-MASTER OF BUSINESS ADMINISTRATION">125-MASTER OF BUSINESS ADMINISTRATION</option>
                    <option value="12-ELECTRONICS AND COMMUNICATION ENGINEERING">12-ELECTRONICS AND COMMUNICATION ENGINEERING</option>
                  </select>
                </div>

                <div className="dbs-input-box">
                  <label>Admitted Year *</label>
                  <select {...register("admittedYear")}>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>
                <div className="dbs-input-box">
                  <label>Admitted Semester *</label>
                  <select {...register("admittedSem")}>
                    <option value="1">Sem 1</option>
                    <option value="2">Sem 2</option>
                  </select>
                </div>
                <div className="dbs-input-box">
                  <label>Studying Year *</label>
                  <select {...register("year")}>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>

                <div className="dbs-input-box">
                  <label>Studying Semester *</label>
                  <select {...register("sem")}>
                    <option value="1">Sem 1</option>
                    <option value="2">Sem 2</option>
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
                  <input type="text" {...register("joiningAcademicYear")} placeholder="e.g. 2025-2026" />
                </div>

                <div className="dbs-input-box">
                  <label>Current Academic Year *</label>
                  <input type="text" {...register("currentAcademicYear")} placeholder="e.g. 2025-2026" />
                </div>
                <div className="dbs-input-box">
                  <label>CET *</label>
                  <input type="text" {...register("cet")} placeholder="e.g. EAPCET / ICET / PGECET" />
                </div>
                <div className="dbs-input-box">
                  <label>Hall Ticket *</label>
                  <input type="text" {...register("hallTicket")} placeholder="Entrance Hall Ticket No." />
                </div>

                <div className="dbs-input-box">
                  <label>Rank *</label>
                  <input type="text" {...register("rank")} placeholder="State / CET Rank" />
                </div>
                <div className="dbs-input-box">
                  <label>Branch Rank *</label>
                  <input type="text" {...register("branchRank")} placeholder="Branch Rank" />
                </div>
                <div className="dbs-input-box">
                  <label>Jnana Bhumi Id *</label>
                  <input type="text" {...register("jnanaBhumiId")} placeholder="Jnanabhumi Portal ID" />
                </div>

                <div className="dbs-input-box">
                  <label>Regulation *</label>
                  <select {...register("regulation")}>
                    <option value="R23">R23</option>
                    <option value="R20">R20</option>
                    <option value="R17">R17</option>
                  </select>
                </div>
                <div className="dbs-input-box">
                  <label>Library Member Group *</label>
                  <input type="text" {...register("libraryMemberGroup")} placeholder="e.g. General Student" />
                </div>
                <div className="dbs-input-box">
                  <label>APAAR ID</label>
                  <input type="text" {...register("apaarId")} placeholder="12-Digit APAAR Identity" />
                </div>
              </div>

              {/* Optional Inter / UG fields in Academic Info */}
              <div className="dbs-subcard-container mt-4">
                <h4 className="dbs-subcard-title">Inter / UG Quick Entry (Optional)asdf</h4>
                <div className="dbs-form-grid-3">
                  <div className="dbs-input-box">
                    <label>Inter College Name</label>
                    <input type="text" {...register("interCollegeName")} placeholder="College name" />
                  </div>
                  <div className="dbs-input-box">
                    <label>Inter Marks %</label>
                    <input type="text" {...register("interMarksPercentage")} placeholder="Percentage" />
                  </div>
                  <div className="dbs-input-box">
                    <label>Inter Hall Ticket No.</label>
                    <input type="text" {...register("interHallTicketNo")} placeholder="Hall ticket" />
                  </div>
                  <div className="dbs-input-box">
                    <label>Inter Board</label>
                    <input type="text" {...register("interBoard")} placeholder="Board" />
                  </div>
                  <div className="dbs-input-box">
                    <label>Inter Aggregate</label>
                    <input type="text" {...register("interAggregate")} placeholder="Total marks" />
                  </div>
                  <div className="dbs-input-box">
                    <label>Inter Month & Year of Passing</label>
                    <input type="text" {...register("interPassingDate")} placeholder="MM/YYYY" />
                  </div>

                  <div className="dbs-input-box">
                    <label>UG College Name *</label>
                    <input type="text" {...register("ugCollegeName")} placeholder="UG College" />
                  </div>
                  <div className="dbs-input-box">
                    <label>UG Marks % *</label>
                    <input type="text" {...register("ugMarksPercentage")} placeholder="Percentage" />
                  </div>
                  <div className="dbs-input-box">
                    <label>UG Hall Ticket No. *</label>
                    <input type="text" {...register("ugHallTicketNo")} placeholder="Hall Ticket" />
                  </div>
                  <div className="dbs-input-box">
                    <label>University *</label>
                    <input type="text" {...register("university")} placeholder="University Name" />
                  </div>
                  <div className="dbs-input-box">
                    <label>UG Aggregate *</label>
                    <input type="text" {...register("ugAggregate")} placeholder="CGPA / Marks" />
                  </div>
                  <div className="dbs-input-box">
                    <label>UG Month & Year of Passing *</label>
                    <input type="text" {...register("ugPassingDate")} placeholder="MM/YYYY" />
                  </div>
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
                      <label>Name of the Student *</label>
                      <input type="text" {...register("name", { required: true })} placeholder="Full Name in Block Letters" />
                    </div>
                    <div className="dbs-input-box">
                      <label>Date of Birth *</label>
                      <input type="date" {...register("dob", { required: true })} />
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
                      <input type="text" {...register("nationality")} placeholder="Indian" />
                    </div>
                    <div className="dbs-input-box">
                      <label>Mother Tongue *</label>
                      <input type="text" {...register("motherTongue")} placeholder="Telugu" />
                    </div>
                    <div className="dbs-input-box">
                      <label>Religion *</label>
                      <input type="text" {...register("religion")} placeholder="Hindu" />
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
                        <option value="OC">OC</option>
                        <option value="BC-A">BC-A</option>
                        <option value="BC-B">BC-B</option>
                        <option value="BC-C">BC-C</option>
                        <option value="BC-D">BC-D</option>
                        <option value="BC-E">BC-E</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                      </select>
                    </div>

                    <div className="dbs-input-box">
                      <label>Subcaste *</label>
                      <input type="text" {...register("subcaste")} placeholder="Subcaste details" />
                    </div>
                    <div className="dbs-input-box">
                      <label>Category *</label>
                      <input type="text" {...register("category")} placeholder="General / EWS" />
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
                        <option value="Lateral Entry (LE)">Lateral Entry (LE)</option>
                        <option value="Transfer">Transfer</option>
                      </select>
                    </div>
                    <div className="dbs-input-box">
                      <label>Mole 1 (Identification Mark)</label>
                      <input type="text" {...register("mole1")} placeholder="Identification Mark 1" />
                    </div>
                    <div className="dbs-input-box dbs-grid-col-span-2">
                      <label>Mole 2 (Identification Mark)</label>
                      <input type="text" {...register("mole2")} placeholder="Identification Mark 2" />
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
                      <input type="tel" {...register("studentMobile")} placeholder="10-Digit Mobile" />
                    </div>
                    <div className="dbs-input-box">
                      <label>Student Email-Id</label>
                      <input type="email" {...register("studentEmail")} placeholder="student@example.com" />
                    </div>
                    <div className="dbs-input-box">
                      <label>State *</label>
                      <input type="text" {...register("state")} placeholder="Andhra Pradesh" />
                    </div>
                    <div className="dbs-input-box">
                      <label>Ration Card No.</label>
                      <input type="text" {...register("rationCardNo")} placeholder="Ration Card Number" />
                    </div>
                    <div className="dbs-input-box">
                      <label>Income Certificate No.</label>
                      <input type="text" {...register("incomeCertNo")} placeholder="Income Cert No." />
                    </div>
                    <div className="dbs-input-box">
                      <label>Aadhaar No. *</label>
                      <input type="text" {...register("aadhaarNo", { required: true })} placeholder="12-Digit Aadhaar No." />
                    </div>
                    <div className="dbs-input-box dbs-grid-col-span-3">
                      <label>Address *</label>
                      <input type="text" {...register("address", { required: true })} placeholder="Complete Door No, Street, Village/City, Mandal, District" />
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
                      <label>Status</label>
                      <input type="text" {...register("status")} placeholder="Enrolled" />
                    </div>
                    <div className="dbs-input-box">
                      <label>Status Date</label>
                      <input type="date" {...register("statusDate")} />
                    </div>
                    <div className="dbs-input-box dbs-grid-col-span-3">
                      <label>Status Reason</label>
                      <input type="text" {...register("statusReason")} placeholder="Reason for status change if applicable" />
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
                      <span className="dbs-toggle-pill-text">Lateral Entry (LE)</span>
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

              {/* Photo Upload Side Panel */}
              <div className="dbs-form-card dbs-photo-upload-card flex-1">
                <h3>Student Photo Profile</h3>
                <div className="dbs-photo-preview-box">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Student Preview" className="dbs-preview-student-img" />
                  ) : (
                    <div className="dbs-no-img-text">No Photo Attached</div>
                  )}
                </div>
                <div className="dbs-photo-actions-box">
                  <button type="button" className="dbs-photo-btn dbs-btn-camera" onClick={handleWebcamCapture}>
                    <Camera size={14} />
                    <span>Webcam Capture</span>
                  </button>
                  <label className="dbs-photo-btn dbs-btn-upload">
                    <Upload size={14} />
                    <span>Upload Image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: "none" }} 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setPhotoPreview(URL.createObjectURL(e.target.files[0]));
                          toast.success("Image file attached successfully");
                        }
                      }}
                    />
                  </label>
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
                    <input type="text" {...register("fatherName", { required: true })} placeholder="Father Full Name" />
                  </div>
                  <div className="dbs-input-box">
                    <label>Parent Occupation</label>
                    <input type="text" {...register("fatherOccupation")} placeholder="Occupation / Business" />
                  </div>
                  <div className="dbs-input-box">
                    <label>Annual Income</label>
                    <input type="text" {...register("fatherIncome")} placeholder="Income in INR" />
                  </div>

                  <div className="dbs-input-box">
                    <label>Parent Mobile No. *</label>
                    <input type="tel" {...register("parentMobile", { required: true })} placeholder="Primary Mobile Number" />
                  </div>
                  <div className="dbs-input-box">
                    <label>Mobile No. 1</label>
                    <input type="tel" {...register("mobileNo1")} placeholder="Alternate Contact 1" />
                  </div>
                  <div className="dbs-input-box">
                    <label>Mobile No. 2</label>
                    <input type="tel" {...register("mobileNo2")} placeholder="Alternate Contact 2" />
                  </div>

                  <div className="dbs-input-box dbs-grid-col-span-3">
                    <label>Parent Aadhaar No. *</label>
                    <input type="text" {...register("parentAadhaarNo", { required: true })} placeholder="12-Digit Parent Aadhaar No." />
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
                    <input type="text" {...register("motherName")} placeholder="Mother Full Name" />
                  </div>
                  <div className="dbs-input-box">
                    <label>Mother's Aadhaar No.</label>
                    <input type="text" {...register("motherAadhaarNo")} placeholder="12-Digit Mother Aadhaar No." />
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
                    <input type="text" {...register("sscSchool")} placeholder="School Name" />
                  </div>
                  <div className="dbs-input-box">
                    <label>SSC Marks Percentage</label>
                    <input type="text" {...register("sscMarks")} placeholder="GPA / Percentage" />
                  </div>
                  <div className="dbs-input-box">
                    <label>SSC Hall Ticket No. *</label>
                    <input type="text" {...register("sscHallTicket", { required: true })} placeholder="SSC Hall Ticket Number" />
                  </div>

                  <div className="dbs-input-box">
                    <label>SSC Board</label>
                    <input type="text" {...register("sscBoard")} placeholder="SSC Board AP / CBSE" />
                  </div>
                  <div className="dbs-input-box">
                    <label>SSC Studied</label>
                    <input type="text" {...register("sscStudied")} placeholder="Regular / Private" />
                  </div>
                  <div className="dbs-input-box">
                    <label>SSC Aggregate</label>
                    <input type="text" {...register("sscAggregate")} placeholder="Total Marks / Max Marks" />
                  </div>

                  <div className="dbs-input-box dbs-grid-col-span-3">
                    <label>SSC Month & Year of Passing</label>
                    <input type="text" {...register("sscPassingDate")} placeholder="e.g. March 2021" />
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
                    <input type="text" {...register("interCollege")} placeholder="Junior College Name" />
                  </div>
                  <div className="dbs-input-box">
                    <label>Inter Marks Percentage</label>
                    <input type="text" {...register("interMarks")} placeholder="Percentage / CGPA" />
                  </div>
                  <div className="dbs-input-box">
                    <label>Inter Hall Ticket No.</label>
                    <input type="text" {...register("interHallTicket")} placeholder="Inter Hall Ticket" />
                  </div>

                  <div className="dbs-input-box">
                    <label>Inter Board</label>
                    <input type="text" {...register("interBoardDetail")} placeholder="BIEAP / TSBIE" />
                  </div>
                  <div className="dbs-input-box">
                    <label>Inter Aggregate</label>
                    <input type="text" {...register("interAggregateDetail")} placeholder="Aggregate Marks" />
                  </div>
                  <div className="dbs-input-box">
                    <label>Inter Month & Year of Passing</label>
                    <input type="text" {...register("interPassingDateDetail")} placeholder="e.g. March 2023" />
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
                    <input type="text" {...register("ugCollege")} placeholder="Degree / Engineering College" />
                  </div>
                  <div className="dbs-input-box">
                    <label>UG Marks Percentage *</label>
                    <input type="text" {...register("ugMarks")} placeholder="Aggregate CGPA / %" />
                  </div>
                  <div className="dbs-input-box">
                    <label>UG Hall Ticket No. *</label>
                    <input type="text" {...register("ugHallTicket")} placeholder="UG Roll / Hall Ticket No." />
                  </div>

                  <div className="dbs-input-box">
                    <label>University *</label>
                    <input type="text" {...register("ugUniversity")} placeholder="JNTUK / AU / SVU" />
                  </div>
                  <div className="dbs-input-box">
                    <label>UG Aggregate *</label>
                    <input type="text" {...register("ugAggregateDetail")} placeholder="Aggregate Score" />
                  </div>
                  <div className="dbs-input-box">
                    <label>UG Month & Year of Passing *</label>
                    <input type="text" {...register("ugPassingDateDetail")} placeholder="e.g. May 2025" />
                  </div>
                  <div className="dbs-input-box dbs-grid-col-span-3">
                    <label>Rank *</label>
                    <input type="text" {...register("ugRankDetail")} placeholder="University Rank / Medal" />
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
                  <input type="text" {...register("scholarshipAmount", { required: true })} placeholder="INR Amount (e.g. 15000)" />
                </div>
                <div className="dbs-input-box">
                  <label>Spot Admission Fee *</label>
                  <input type="text" {...register("spotFee", { required: true })} placeholder="INR Amount (e.g. 2000)" />
                </div>
                <div className="dbs-input-box">
                  <label>Boys Hostel Fee *</label>
                  <input type="text" {...register("boysHostelFee", { required: true })} placeholder="INR Amount per year" />
                </div>
                <div className="dbs-input-box">
                  <label>Ladies Hostel Fee *</label>
                  <input type="text" {...register("ladiesHostelFee", { required: true })} placeholder="INR Amount per year" />
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
              
              <div {...getRootProps()} className={`dbs-file-dropzone ${isDragActive ? "dbs-dropzone-active" : ""}`}>
                <input {...getInputProps()} />
                <Upload size={36} className="dbs-dropzone-icon" />
                {isDragActive ? (
                  <p>Drop certification files here...</p>
                ) : (
                  <p>Drag & drop SSC Memo, Inter Certificate, Transfer Certificate, and Caste/Income Memos here, or click to browse.</p>
                )}
                <span className="dbs-dropzone-sub">Supported formats: PDF, JPG, PNG (Max 5MB per file)</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Review & Submit */}
        {currentStep === 6 && (
          <div className="dbs-stepper-slide">
            <div className="dbs-form-card dbs-review-card">
              <h3>Review Details Before Final Registration</h3>
              <p className="dbs-review-warning">Please review all academic allocations, student contact details, parent information, and fee scopes before saving to active registry.</p>
              
              <div className="dbs-review-grid">
                <div className="dbs-review-item"><strong>Student Name:</strong> {formData.name || "N/A"}</div>
                <div className="dbs-review-item"><strong>Date of Admission:</strong> {formData.admDate || "N/A"}</div>
                <div className="dbs-review-item"><strong>Programme & Branch:</strong> {formData.course} - {formData.branch}</div>
                <div className="dbs-review-item"><strong>Year & Section:</strong> Year {formData.year}, Sem {formData.sem} ({formData.section})</div>
                <div className="dbs-review-item"><strong>Father's Name:</strong> {formData.fatherName || "N/A"}</div>
                <div className="dbs-review-item"><strong>Parent Contact:</strong> {formData.parentMobile || "N/A"}</div>
                <div className="dbs-review-item"><strong>Aadhaar Number:</strong> {formData.aadhaarNo || "N/A"}</div>
                <div className="dbs-review-item"><strong>Scholarship Amount:</strong> ₹{formData.scholarshipAmount || "0"}</div>
                <div className="dbs-review-item"><strong>Spot Fee:</strong> ₹{formData.spotFee || "0"}</div>
                <div className="dbs-review-item"><strong>Boys Hostel Fee:</strong> ₹{formData.boysHostelFee || "0"}</div>
                <div className="dbs-review-item"><strong>Ladies Hostel Fee:</strong> ₹{formData.ladiesHostelFee || "0"}</div>
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
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
          >
            <ArrowLeft size={16} />
            <span>Previous</span>
          </button>

          <button type="submit" className="dbs-stepper-next-btn">
            {currentStep === STEPS.length - 1 ? (
              <>
                <Save size={16} />
                <span>Save Student Registry</span>
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
              onChange={(e) => { setFilterCourse(e.target.value); setCurrentPage(1); }}
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
              onChange={(e) => { setFilterSection(e.target.value); setCurrentPage(1); }}
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
              <div className="dbs-empty-state-desc">Try resetting your filters or add a new student above.</div>
            </div>
          ) : (
            <table className="dbs-data-table">
              <thead>
                <tr>
                  <th onClick={() => triggerSort("sNo")} style={{ cursor: 'pointer' }}>
                    Serial No. {sortBy === "sNo" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => triggerSort("admNo")} style={{ cursor: 'pointer' }}>
                    ADM No. {sortBy === "admNo" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => triggerSort("name")} style={{ cursor: 'pointer' }}>
                    Student Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th>Programme</th>
                  <th>Branch</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((student, idx) => (
                  <tr key={idx}>
                    <td>{student.sNo}</td>
                    <td>{student.admNo}</td>
                    <td className="dbs-table-student-name">{student.name}</td>
                    <td><span className="dbs-pill-category">{student.course}</span></td>
                    <td className="dbs-table-branch-td">{student.branch}</td>
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
                          onClick={() => confirmDeleteStudent(student.sNo)}
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

        {/* Datatable Pagination Controls */}
        {totalPages > 1 && (
          <div className="dbs-table-pagination-row">
            <span>Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedStudents.length)} of {sortedStudents.length} items</span>
            
            <div className="dbs-pagination-buttons">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="dbs-pagination-nav-btn"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`dbs-pagination-page-btn ${currentPage === i + 1 ? "dbs-page-active" : ""}`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="dbs-pagination-nav-btn"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- WEBCAM PHOTO CAPTURE MODAL --- */}
      {webcamOpen && (
        <div className="dbs-search-overlay-modal">
          <div className="dbs-search-modal-box dbs-webcam-modal-box">
            <div className="dbs-dropdown-header">
              <span>Webcam Image Capture Console</span>
              <button className="dbs-panel-close-btn" onClick={() => setWebcamOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="dbs-webcam-console-body">
              <div className="dbs-webcam-stream-simulation-frame">
                <div 
                  className="dbs-webcam-simulation-canvas"
                  style={{ transform: `rotate(${rotationAngle}deg)` }}
                >
                  <img src={mockPhotoSelection} alt="Camera feed stream" className="dbs-simulated-video-feed" />
                  <div className="dbs-webcam-crop-frame-overlay" />
                </div>
                <div className="dbs-webcam-status-overlay">🔴 LIVE WEBCAM STREAM</div>
              </div>

              <div className="dbs-webcam-toolbar-row">
                <button 
                  type="button" 
                  className="dbs-toolbar-adjust-btn"
                  onClick={() => setRotationAngle(prev => (prev + 90) % 360)}
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
              <button type="button" className="dbs-form-cancel-btn" onClick={() => setWebcamOpen(false)}>
                Cancel
              </button>
              <button type="button" className="dbs-form-save-btn" onClick={saveWebcamPhoto}>
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
              <p>Are you sure you want to delete student <strong>{deleteTargetId}</strong>? This operation cannot be undone.</p>
            </div>
            <div className="dbs-confirm-modal-actions">
              <button type="button" className="dbs-confirm-btn-cancel" onClick={() => setDeleteTargetId(null)}>
                Cancel
              </button>
              <button type="button" className="dbs-confirm-btn-delete" onClick={executeDelete}>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdmissionView;
