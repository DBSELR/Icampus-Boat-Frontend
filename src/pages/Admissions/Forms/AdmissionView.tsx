import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { 
  Camera, RotateCw, Check, X, Upload, Save, ArrowLeft, ArrowRight, Trash2, 
  Edit3, Search, Filter, RefreshCw, AlertTriangle, AlertCircle, FileText, CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import "./AdmissionView.css";

// Form steps
const STEPS = [
  "Academic Info",
  "Student Details",
  "Parent Details",
  "Previous Education",
  "Fees Scope",
  "Upload Docs",
  "Review & Submit"
];

// Mock Student Database
const INITIAL_STUDENTS = [
  { sNo: "9808/25-26", admNo: "25MDS06", regNo: "25MDS06", admDate: "2025-10-23", name: "SHAIK MOHAMMED GHOUSE JANI", course: "02-M.Tech", branch: "88-Data Science(CSE)", year: "1", sem: "1", section: "A", photo: "", sscSchool: "St. Joseph", sscMarks: "85", fatherName: "Shaik Ghouse", fatherMobile: "9876543210" },
  { sNo: "9807/25-26", admNo: "25MDS05", regNo: "25MDS05", admDate: "2025-10-23", name: "GUDIMELLI MONIKA", course: "02-M.Tech", branch: "88-Data Science(CSE)", year: "1", sem: "1", section: "A", photo: "", sscSchool: "Montessori", sscMarks: "92", fatherName: "G. Srinivasa Rao", fatherMobile: "8765432109" },
  { sNo: "9806/25-26", admNo: "25MDS04", regNo: "25MDS04", admDate: "2025-10-23", name: "DARAPUNENI BHAVYA", course: "02-M.Tech", branch: "88-Data Science(CSE)", year: "1", sem: "1", section: "A", photo: "", sscSchool: "Nirmala High", sscMarks: "88", fatherName: "D. Prasad", fatherMobile: "7654321098" },
  { sNo: "9805/25-26", admNo: "25MBA167", regNo: "25MBA167", admDate: "2025-10-22", name: "TALAM BHARGAVI", course: "03-MBA", branch: "125-MASTER OF BUSINESS ADMINISTRATION", year: "1", sem: "1", section: "B", photo: "", sscSchool: "Aditya School", sscMarks: "90", fatherName: "T. Narayana", fatherMobile: "9812345678" },
  { sNo: "9804/25-26", admNo: "25MBA165", regNo: "25MBA165", admDate: "2025-10-22", name: "MUCHINTALA HARI KRISHNA", course: "03-MBA", branch: "125-MASTER OF BUSINESS ADMINISTRATION", year: "1", sem: "1", section: "B", photo: "", sscSchool: "ZPHS", sscMarks: "78", fatherName: "M. Kondaiah", fatherMobile: "8899776655" },
  { sNo: "9803/25-26", admNo: "25MBA166", regNo: "25MBA166", admDate: "2025-10-22", name: "ATHOTA YASWITHA", course: "03-MBA", branch: "125-MASTER OF BUSINESS ADMINISTRATION", year: "1", sem: "1", section: "B", photo: "", sscSchool: "Bhashyam School", sscMarks: "84", fatherName: "A. Venkatesh", fatherMobile: "7788990011" },
  { sNo: "9802/25-26", admNo: "25MBA164", regNo: "25MBA164", admDate: "2025-10-22", name: "BANOTHU TURUMALA SAI", course: "03-MBA", branch: "125-MASTER OF BUSINESS ADMINISTRATION", year: "1", sem: "1", section: "C", photo: "", sscSchool: "KV School", sscMarks: "81", fatherName: "B. Laxman", fatherMobile: "6677889900" },
  { sNo: "9801/25-26", admNo: "25MBA149", regNo: "25MBA149", admDate: "2025-10-22", name: "AALA VENKATA SRAVANI", course: "03-MBA", branch: "125-MASTER OF BUSINESS ADMINISTRATION", year: "1", sem: "1", section: "C", photo: "", sscSchool: "Sri Chaitanya", sscMarks: "89", fatherName: "A. Venkata Rao", fatherMobile: "9900112233" },
  { sNo: "9800/25-26", admNo: "25MBA147", regNo: "25MBA147", admDate: "2025-10-22", name: "DERANGULA GANGARAJU", course: "03-MBA", branch: "125-MASTER OF BUSINESS ADMINISTRATION", year: "1", sem: "1", section: "D", photo: "", sscSchool: "Holy Angels", sscMarks: "82", fatherName: "D. Rama Rao", fatherMobile: "8811223344" },
  { sNo: "9799/25-26", admNo: "25MBA148", regNo: "25MBA148", admDate: "2025-10-22", name: "MARAM NARENDRABABU", course: "03-MBA", branch: "125-MASTER OF BUSINESS ADMINISTRATION", year: "1", sem: "1", section: "D", photo: "", sscSchool: "Narayana E-Techno", sscMarks: "87", fatherName: "M. Subba Rao", fatherMobile: "7722334455" }
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

  // React Hook Form
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      admDate: new Date().toISOString().split("T")[0],
      sNo: "",
      admNo: "",
      regNo: "",
      course: "01-B.Tech",
      branch: "05-COMPUTER SCIENCE AND ENGINEERING",
      year: "1",
      sem: "1",
      section: "A",
      name: "",
      dob: "",
      gender: "Male",
      bloodGroup: "O+",
      religion: "Hindu",
      caste: "OC",
      subcaste: "",
      motherTongue: "Telugu",
      nationality: "Indian",
      differentlyAbled: "No",
      allottedQuota: "Convenor",
      modeOfAdmission: "CET",
      fatherName: "",
      fatherOccupation: "",
      fatherIncome: "",
      motherName: "",
      parentMobile: "",
      address: "",
      aadhaarNo: "",
      studentMobile: "",
      studentEmail: "",
      sscSchool: "",
      sscMarks: "",
      sscHallTicket: "",
      sscBoard: "SSC Board of AP",
      interCollege: "",
      interMarks: "",
      interHallTicket: "",
      scholarshipAmount: "0",
      hostelRequired: "No",
      spotFee: "0"
    }
  });

  const formData = watch();

  // Handle auto-save trigger on input changes
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

  // Custom confirmation dialog wrappers
  const confirmDeleteStudent = (sNo: string) => {
    setDeleteTargetId(sNo);
  };

  const executeDelete = () => {
    if (deleteTargetId) {
      setStudents(prev => prev.filter(s => s.sNo !== deleteTargetId));
      toast.success(`Record ${deleteTargetId} deleted.`);
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
      course: student.course || "",
      branch: student.branch || "",
      year: student.year || "1",
      sem: student.sem || "1",
      section: student.section || "A",
      name: student.name || "",
      dob: student.dob || "",
      gender: student.gender || "Male",
      bloodGroup: student.bloodGroup || "O+",
      religion: student.religion || "Hindu",
      caste: student.caste || "OC",
      subcaste: student.subcaste || "",
      motherTongue: student.motherTongue || "Telugu",
      nationality: student.nationality || "Indian",
      differentlyAbled: student.differentlyAbled || "No",
      allottedQuota: student.allottedQuota || "Convenor",
      modeOfAdmission: student.modeOfAdmission || "CET",
      fatherName: student.fatherName || "",
      fatherOccupation: student.fatherOccupation || "",
      fatherIncome: student.fatherIncome || "",
      motherName: student.motherName || "",
      parentMobile: student.fatherMobile || student.parentMobile || "",
      address: student.address || "",
      aadhaarNo: student.aadhaarNo || "",
      studentMobile: student.studentMobile || "",
      studentEmail: student.studentEmail || "",
      sscSchool: student.sscSchool || "",
      sscMarks: student.sscMarks || "",
      sscHallTicket: student.sscHallTicket || "",
      sscBoard: student.sscBoard || "SSC Board of AP",
      interCollege: student.interCollege || "",
      interMarks: student.interMarks || "",
      interHallTicket: student.interHallTicket || "",
      scholarshipAmount: student.scholarshipAmount || "0",
      hostelRequired: student.hostelRequired || "No",
      spotFee: student.spotFee || "0"
    });
    if (student.photo) {
      setPhotoPreview(student.photo);
    } else {
      setPhotoPreview("");
    }
    setCurrentStep(0);
    toast.info(`Editing record: ${student.name}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepSubmit = (data: any) => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Final Submission
    const newRecord = {
      sNo: data.sNo || `9${Math.floor(100 + Math.random() * 900)}/25-26`,
      admNo: data.admNo || `25MDS${Math.floor(10 + Math.random() * 89)}`,
      regNo: data.regNo || `25MDS${Math.floor(10 + Math.random() * 89)}`,
      admDate: data.admDate,
      name: data.name.toUpperCase(),
      course: data.course,
      branch: data.branch,
      year: data.year,
      sem: data.sem,
      section: data.section,
      photo: photoPreview || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop",
      sscSchool: data.sscSchool,
      sscMarks: data.sscMarks,
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

    // Reset Form
    reset();
    setPhotoPreview("");
    setCurrentStep(0);
  };

  const handleWebcamCapture = () => {
    // Generate a beautiful simulated photo profile
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
    toast.success("Webcam photo attached!");
  };

  // Live filter results
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(tableSearch.toLowerCase()) || 
                          s.admNo.toLowerCase().includes(tableSearch.toLowerCase()) ||
                          s.sNo.toLowerCase().includes(tableSearch.toLowerCase());
    const matchesCourse = filterCourse === "All" || s.course.includes(filterCourse);
    const matchesBranch = filterBranch === "All" || s.branch.includes(filterBranch);
    const matchesSection = filterSection === "All" || s.section === filterSection;
    return matchesSearch && matchesCourse && matchesBranch && matchesSection;
  });

  // Sorting
  const sortedStudents = [...filteredStudents].sort((a: any, b: any) => {
    const aVal = a[sortBy] || "";
    const bVal = b[sortBy] || "";
    if (sortOrder === "asc") {
      return aVal.localeCompare ? aVal.localeCompare(bVal) : aVal - bVal;
    } else {
      return bVal.localeCompare ? bVal.localeCompare(aVal) : bVal - aVal;
    }
  });

  // Pagination
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
          <h2>Student Admission Form</h2>
          <p>Register new profiles or edit academic registries.</p>
        </div>
        <div className="dbs-autosave-indicator">
          {isSaving ? (
            <span className="dbs-autosave-saving"><RefreshCw size={14} className="dbs-spin" /> Saving...</span>
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
            <div key={idx} className="dbs-stepper-node-container">
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
              <h3>Academic Allocation Details</h3>
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
                  </select>
                </div>
                <div className="dbs-input-box">
                  <label>Branch *</label>
                  <select {...register("branch")}>
                    <option value="05-COMPUTER SCIENCE AND ENGINEERING">05-COMPUTER SCIENCE AND ENGINEERING</option>
                    <option value="88-Data Science(CSE)">88-Data Science(CSE)</option>
                    <option value="125-MASTER OF BUSINESS ADMINISTRATION">125-MASTER OF BUSINESS ADMINISTRATION</option>
                  </select>
                </div>
                <div className="dbs-input-box">
                  <label>Studying Year / Semester *</label>
                  <div className="dbs-form-grid-2" style={{ gap: '8px' }}>
                    <select {...register("year")}>
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </select>
                    <select {...register("sem")}>
                      <option value="1">Sem 1</option>
                      <option value="2">Sem 2</option>
                    </select>
                  </div>
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
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Student Details */}
        {currentStep === 1 && (
          <div className="dbs-stepper-slide">
            <div className="dbs-form-grid-image">
              <div className="dbs-form-card">
                <h3>Personal Identity Details</h3>
                <div className="dbs-form-grid-2">
                  <div className="dbs-input-box">
                    <label>Name of the Student *</label>
                    <input type="text" {...register("name", { required: true })} placeholder="Full Name in Caps" />
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
                    <label>Blood Group *</label>
                    <select {...register("bloodGroup")}>
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="O+">O+</option>
                      <option value="AB+">AB+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div className="dbs-input-box">
                    <label>Religion / Nationality *</label>
                    <div className="dbs-form-grid-2" style={{ gap: '8px' }}>
                      <input type="text" {...register("religion")} placeholder="Religion" />
                      <input type="text" {...register("nationality")} placeholder="Nationality" />
                    </div>
                  </div>
                  <div className="dbs-input-box">
                    <label>Caste / Subcaste *</label>
                    <div className="dbs-form-grid-2" style={{ gap: '8px' }}>
                      <select {...register("caste")}>
                        <option value="OC">OC</option>
                        <option value="BC-A">BC-A</option>
                        <option value="BC-B">BC-B</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                      </select>
                      <input type="text" {...register("subcaste")} placeholder="Subcaste details" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo & Signature box */}
              <div className="dbs-form-card dbs-photo-upload-card">
                <h3>Profile Attachment</h3>
                <div className="dbs-photo-preview-box">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Student Preview" className="dbs-preview-student-img" />
                  ) : (
                    <div className="dbs-no-img-text">No Image Attached</div>
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

        {/* STEP 3: Parent & Family Details */}
        {currentStep === 2 && (
          <div className="dbs-stepper-slide">
            <div className="dbs-form-card">
              <h3>Parent & Communications Details</h3>
              <div className="dbs-form-grid-3">
                <div className="dbs-input-box">
                  <label>Father's Name *</label>
                  <input type="text" {...register("fatherName", { required: true })} placeholder="Father name" />
                </div>
                <div className="dbs-input-box">
                  <label>Parent Occupation</label>
                  <input type="text" {...register("fatherOccupation")} placeholder="Occupation" />
                </div>
                <div className="dbs-input-box">
                  <label>Annual Income *</label>
                  <input type="text" {...register("fatherIncome")} placeholder="Income in INR" />
                </div>
                <div className="dbs-input-box">
                  <label>Mother's Name *</label>
                  <input type="text" {...register("motherName", { required: true })} placeholder="Mother name" />
                </div>
                <div className="dbs-input-box">
                  <label>Parent Mobile No *</label>
                  <input type="tel" {...register("parentMobile", { required: true })} placeholder="10-digit number" />
                </div>
                <div className="dbs-input-box">
                  <label>Aadhaar Number *</label>
                  <input type="text" {...register("aadhaarNo", { required: true })} placeholder="12-digit number" />
                </div>
                <div className="dbs-input-box dbs-grid-col-span-2">
                  <label>Address *</label>
                  <input type="text" {...register("address", { required: true })} placeholder="Full communications address" />
                </div>
                <div className="dbs-input-box">
                  <label>Student Email-Id</label>
                  <input type="email" {...register("studentEmail")} placeholder="student@example.com" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Previous Education Details */}
        {currentStep === 3 && (
          <div className="dbs-stepper-slide">
            <div className="dbs-form-card">
              <h3>Previous Educational Achievements</h3>
              <div className="dbs-form-grid-3">
                <div className="dbs-input-box">
                  <label>SSC School Name *</label>
                  <input type="text" {...register("sscSchool", { required: true })} placeholder="School Name" />
                </div>
                <div className="dbs-input-box">
                  <label>SSC Marks Percentage *</label>
                  <input type="text" {...register("sscMarks", { required: true })} placeholder="e.g. 9.2 or 92%" />
                </div>
                <div className="dbs-input-box">
                  <label>SSC Hall Ticket No *</label>
                  <input type="text" {...register("sscHallTicket", { required: true })} placeholder="Hall Ticket Code" />
                </div>
                <div className="dbs-input-box">
                  <label>Intermediate College Name</label>
                  <input type="text" {...register("interCollege")} placeholder="Junior College" />
                </div>
                <div className="dbs-input-box">
                  <label>Inter Marks Percentage</label>
                  <input type="text" {...register("interMarks")} placeholder="e.g. 910/1000" />
                </div>
                <div className="dbs-input-box">
                  <label>Inter Hall Ticket No</label>
                  <input type="text" {...register("interHallTicket")} placeholder="Hall Ticket Code" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Fee & Hostel Scopes */}
        {currentStep === 4 && (
          <div className="dbs-stepper-slide">
            <div className="dbs-form-card">
              <h3>Fee and Hostel Scope Details</h3>
              <div className="dbs-form-grid-2">
                <div className="dbs-input-box">
                  <label>Scholarship Amount (If any) *</label>
                  <input type="text" {...register("scholarshipAmount")} placeholder="Amount in INR" />
                </div>
                <div className="dbs-input-box">
                  <label>Spot Admission Fee *</label>
                  <input type="text" {...register("spotFee")} placeholder="Collection amount" />
                </div>
                <div className="dbs-input-box">
                  <label>Hostel Required *</label>
                  <select {...register("hostelRequired")}>
                    <option value="No">No Hostel Required</option>
                    <option value="Boys">Boys Hostel Facility</option>
                    <option value="Girls">Ladies Hostel Facility</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Upload Documents */}
        {currentStep === 5 && (
          <div className="dbs-stepper-slide">
            <div className="dbs-form-card">
              <h3>Upload Certifications (Drag & Drop)</h3>
              
              <div {...getRootProps()} className={`dbs-file-dropzone ${isDragActive ? "dbs-dropzone-active" : ""}`}>
                <input {...getInputProps()} />
                <Upload size={36} className="dbs-dropzone-icon" />
                {isDragActive ? (
                  <p>Drop the certification files here...</p>
                ) : (
                  <p>Drag 'n' drop SSC Memo, Inter Memo, and Transfer Certificates here, or click to select files.</p>
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
              <h3>Review Details Before Final Save</h3>
              <p className="dbs-review-warning">Please double check academic stream allocation details before saving.</p>
              
              <div className="dbs-review-grid">
                <div className="dbs-review-item"><strong>Student Name:</strong> {formData.name || "N/A"}</div>
                <div className="dbs-review-item"><strong>Date of Admission:</strong> {formData.admDate || "N/A"}</div>
                <div className="dbs-review-item"><strong>Programme/Branch:</strong> {formData.course} - {formData.branch}</div>
                <div className="dbs-review-item"><strong>Section Allocation:</strong> Section {formData.section}</div>
                <div className="dbs-review-item"><strong>Father's Name:</strong> {formData.fatherName || "N/A"}</div>
                <div className="dbs-review-item"><strong>Parent Mobile:</strong> {formData.parentMobile || "N/A"}</div>
                <div className="dbs-review-item"><strong>SSC school:</strong> {formData.sscSchool || "N/A"} ({formData.sscMarks}%)</div>
                <div className="dbs-review-item"><strong>Hostel Facility:</strong> {formData.hostelRequired}</div>
              </div>

              <div className="dbs-print-acknowledgement-row">
                <label className="dbs-checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span>Print acknowledgement after saving</span>
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
                <span>Save Registry</span>
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
            <h3>Active Academic Registry</h3>
            <p>Showing {filteredStudents.length} students matching search parameters</p>
          </div>
          
          <div className="dbs-datatable-filters-row">
            {/* Table Search Input */}
            <div className="dbs-search-box-wrapper">
              <Search size={16} className="dbs-search-box-icon" />
              <input
                type="text"
                placeholder="Search name or ID..."
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
              <div className="dbs-empty-state-desc">Try clearing your filters or add a new student above.</div>
            </div>
          ) : (
            <table className="dbs-data-table">
              <thead>
                <tr>
                  <th onClick={() => triggerSort("sNo")} style={{ cursor: 'pointer' }}>
                    Serial No. {sortBy === "sNo" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => triggerSort("admNo")} style={{ cursor: 'pointer' }}>
                    ADM.No {sortBy === "admNo" && (sortOrder === "asc" ? "↑" : "↓")}
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
                          title="Edit Student details"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          type="button" 
                          className="dbs-table-action-icon-btn dbs-btn-delete"
                          onClick={() => confirmDeleteStudent(student.sNo)}
                          title="Delete Student from records"
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
              {/* Webcam stream canvas simulation */}
              <div className="dbs-webcam-stream-simulation-frame">
                <div 
                  className="dbs-webcam-simulation-canvas"
                  style={{ transform: `rotate(${rotationAngle}deg)` }}
                >
                  <img src={mockPhotoSelection} alt="Camera feed stream" className="dbs-simulated-video-feed" />
                  <div className="dbs-webcam-crop-frame-overlay" />
                </div>
                <div className="dbs-webcam-status-overlay">🔴 LIVE SIMULATION FEED</div>
              </div>

              {/* Adjustments toolbar */}
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
                  onClick={handleWebcamCapture} // Generates a new random mock photo
                >
                  <RefreshCw size={14} />
                  <span>Switch Candidate</span>
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

      {/* --- CUSTOM CONFIRMATION DELETE DIALOG OVERLAY --- */}
      {deleteTargetId && (
        <div className="dbs-search-overlay-modal dbs-z-index-high">
          <div className="dbs-search-modal-box dbs-confirm-modal-box">
            <div className="dbs-confirm-modal-body">
              <AlertTriangle size={36} className="dbs-warning-danger-icon" />
              <h3>Delete Student Record?</h3>
              <p>Are you sure you want to delete student <strong>{deleteTargetId}</strong>? This operation is permanent and cannot be undone.</p>
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
