import React, { useEffect, useState } from "react";
import { Save, AlertCircle } from "lucide-react";
import "./Subjects.css";
import {
  getRegulationList,
  getProgrammeLoad,
  getBranchLoad,
  getYearList,
  saveSubjectMaster,
  getSubjectList,
  deleteSubjectMaster,
  checkPaperOrder,
} from "../../../apis/SettingsApis";
import { toast } from "sonner";
import { Edit3, Trash2 } from "lucide-react";
import Footer from "../../../common/Footer";
import DeleteModal from "../../../common/DeleteModal";

interface Regulation {
  regulation: string;
}

interface Programme {
  course: string;
  courseCode: string;
}

interface Branch {
  branchName: string;
  branchCode: string;
}

interface Year {
  iD: string;
  dATA: string;
}

interface Subject {
  sID: string;
  sUBJECTCODE: string;
  sUBJECTNAME: string;
  subjectShortName: string;
  pAP_ORDER: number;
}

const Subjects = () => {
  const [isElective, setIsElective] = useState(false);
  const [isMinor, setIsMinor] = useState(false);
  const [isHonor, setIsHonor] = useState(false);

  const [editSubjectId, setEditSubjectId] = useState<string | null>(null);

  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [selectedRegulation, setSelectedRegulation] = useState("0");
  const [loadingRegulations, setLoadingRegulations] = useState(false);

  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [selectedProgramme, setSelectedProgramme] = useState("0");
  const [loadingProgrammes, setLoadingProgrammes] = useState(false);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("0");
  const [loadingBranches, setLoadingBranches] = useState(false);

  const [years, setYears] = useState<Year[]>([]);
  const [selectedYear, setSelectedYear] = useState("0");
  const [loadingYears, setLoadingYears] = useState(false);

  const [selectedSemester, setSelectedSemester] = useState("0");

  const [selectedStream, setSelectedStream] = useState("1");

  const [periodType, setPeriodType] = useState("");

  const [electiveValue, setElectiveValue] = useState("N");
  const [minorValue, setMinorValue] = useState<number | null>(null);
  const [honorValue, setHonorValue] = useState<number | null>(null);

  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [subjectShortName, setSubjectShortName] = useState("");

  const [paperOrder, setPaperOrder] = useState("");

  const [electiveCode, setElectiveCode] = useState("");
  const [electiveName, setElectiveName] = useState("");
  const [electiveShortName, setElectiveShortName] = useState("");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  const [subtype, setSubtype] = useState(0);

  const [isEditing, setIsEditing] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [editingPaperOrderId, setEditingPaperOrderId] = useState<string | null>(
    null,
  );

  const [paperOrderValue, setPaperOrderValue] = useState<number>(0);

  const [selectedPaperOrderSubject, setSelectedPaperOrderSubject] =
    useState<any>(null);

  const [showPaperOrderUpdate, setShowPaperOrderUpdate] = useState(false);

  const [marks, setMarks] = useState<any>({
    sessionalMaxMarks: "",
    sessionalMinMarks: "",
    assignmentMaxMarks: "",
    assignmentMinMarks: "",
    onlineQuizMaxmarks: "",
    onlineQuizMinmarks: "",
    objectiveMaxmarks: "",
    objectiveMinmarks: "",
    attendenceMaxMarks: "",
    attendenceMinMarks: "",
    daytoDayMaxMarks: "",
    daytoDayMinMarks: "",
    internalTestMaxMarks: "",
    internalTestMinMarks: "",
    viVaVoiceMaxMarks: "",
    viVaVoiceMinMarks: "",
    recordMaxMarks: "",
    recordeMinMarks: "",
    reportPresentattionMax: "",
    reportPresentattionMin: "",
    labInternalMaxMarks: "",
    labInternalMinMarks: "",
    oralTestMax: "",
    oralTestMin: "",
    ciE100Max: "",
    ciE100Min: "",
    ciE75Max: "",
    ciE75Min: "",
    ciE60Max: "",
    ciE60Min: "",
    ciE50Max: "",
    ciE50Min: "",
    ciE40Max: "",
    ciE40Min: "",
    extMax: "",
    extMin: "",
    drawMaxMarks: "",
    drawMinMarks: "",
  });

  const enableElectiveFields = isElective || isMinor || isHonor;
  // const sortedStudents = []; // Placeholder for sorted students data

  const theoryMarks = [
    "Sessional Marks",
    "Assignment Marks",
    "Objective Marks",
    "Online Quiz Marks",
    "Attendance Marks",
    "Report Presentation Marks",
    "Drawing Sheet Marks",
  ];

  const practicalMarks = [
    "Day to Day Marks",
    "Internal Test Marks",
    "Viva voce Marks",
    "Record Marks",
    "Lab Internal Marks",
    "Oral Test",
    "CIE100 Marks",
    "CIE75 Marks",
    "CIE60 Marks",
    "CIE50 Marks",
    "CIE40 Marks",
    "External Marks",
  ];

  const marksKeyMap: any = {
    "Sessional Marks": ["sessionalMaxMarks", "sessionalMinMarks"],
    "Assignment Marks": ["assignmentMaxMarks", "assignmentMinMarks"],
    "Objective Marks": ["objectiveMaxmarks", "objectiveMinmarks"],
    "Online Quiz Marks": ["onlineQuizMaxmarks", "onlineQuizMinmarks"],
    "Attendance Marks": ["attendenceMaxMarks", "attendenceMinMarks"],
    "Report Presentation Marks": [
      "reportPresentattionMax",
      "reportPresentattionMin",
    ],
    "Drawing Sheet Marks": ["drawMaxMarks", "drawMinMarks"],

    "Day to Day Marks": ["daytoDayMaxMarks", "daytoDayMinMarks"],
    "Internal Test Marks": ["internalTestMaxMarks", "internalTestMinMarks"],
    "Viva voce Marks": ["viVaVoiceMaxMarks", "viVaVoiceMinMarks"],
    "Record Marks": ["recordMaxMarks", "recordeMinMarks"],
    "Lab Internal Marks": ["labInternalMaxMarks", "labInternalMinMarks"],
    "Oral Test": ["oralTestMax", "oralTestMin"],
    "CIE100 Marks": ["ciE100Max", "ciE100Min"],
    "CIE75 Marks": ["ciE75Max", "ciE75Min"],
    "CIE60 Marks": ["ciE60Max", "ciE60Min"],
    "CIE50 Marks": ["ciE50Max", "ciE50Min"],
    "CIE40 Marks": ["ciE40Max", "ciE40Min"],
    "External Marks": ["extMax", "extMin"],
  };

  const marksFields =
    periodType === "T" ? theoryMarks : periodType === "P" ? practicalMarks : [];

  const resetForm = () => {
    setEditSubjectId("");
    setSelectedRegulation("0");
    setSelectedProgramme("0");
    setSelectedBranch("0");
    setSelectedYear("0");
    setSelectedSemester("0");
    setSelectedStream("1");

    setSubjectCode("");
    setSubjectName("");
    setSubjectShortName("");
    setPaperOrder("");

    setPeriodType("");

    setElectiveCode("");
    setElectiveName("");
    setElectiveShortName("");

    setIsElective(false);
    setIsMinor(false);
    setIsHonor(false);
    setElectiveValue("N");
    setSubtype(0);

    setMarks({
      sessionalMaxMarks: "",
      sessionalMinMarks: "",
      assignmentMaxMarks: "",
      assignmentMinMarks: "",
      onlineQuizMaxmarks: "",
      onlineQuizMinmarks: "",
      objectiveMaxmarks: "",
      objectiveMinmarks: "",
      attendenceMaxMarks: "",
      attendenceMinMarks: "",
      daytoDayMaxMarks: "",
      daytoDayMinMarks: "",
      internalTestMaxMarks: "",
      internalTestMinMarks: "",
      viVaVoiceMaxMarks: "",
      viVaVoiceMinMarks: "",
      recordMaxMarks: "",
      recordeMinMarks: "",
      reportPresentattionMax: "",
      reportPresentattionMin: "",
      labInternalMaxMarks: "",
      labInternalMinMarks: "",
      oralTestMax: "",
      oralTestMin: "",
      ciE100Max: "",
      ciE100Min: "",
      ciE75Max: "",
      ciE75Min: "",
      ciE60Max: "",
      ciE60Min: "",
      ciE50Max: "",
      ciE50Min: "",
      ciE40Max: "",
      ciE40Min: "",
      extMax: "",
      extMin: "",
      drawMaxMarks: "",
      drawMinMarks: "",
    });
  };

  const handleSaveSubject = async () => {
    // Prevent multiple values separated by comma
    if (
      subjectCode.includes(",") ||
      subjectName.includes(",") ||
      subjectShortName.includes(",")
    ) {
      toast.error(
        "Only one Subject Code, Subject Name and Subject Short Name is allowed",
      );
      return;
    }

    const payload = {
      sid: String(editSubjectId || ""),
      programme: selectedProgramme,
      p_code: "0",
      b_code: "0",
      branch: selectedBranch,
      year: selectedYear,
      semester: selectedSemester,
      subjectCode,
      subjectName,
      academicYear: localStorage.getItem("academicYear") || "2025-2026",
      financialYear: "0",
      ...marks,
      stream: selectedStream,
      peroidType: periodType,
      iselective: electiveValue,
      status: "1",
      elective_pcodes: electiveCode,
      elective_pNames: electiveName,
      pap_Order: paperOrder,
      elcnames: electiveName,
      subtype: isMinor ? "1" : isHonor ? "2" : "0",
      regu: selectedRegulation,
      subjectShortName,
      electiveShortName,
      userid: "0",
      displayDate: "0",
      date: "0",
    };

    try {
      const response = await saveSubjectMaster(payload);

      if (response?.rowsAffected > 0) {
        toast.success(
          editSubjectId
            ? "Subject updated successfully!"
            : "Subject saved successfully!",
        );

        // keep current filters while refreshing table
        await fetchSubjects();

        // clear edit mode after reload
        setEditSubjectId(null);
        setIsEditing(false);
        setIsEditMode(false);

        resetForm();
      } else {
        toast.error(
          response?.message ||
            (editSubjectId
              ? "Failed to update the subject!"
              : "Failed to save the subject!"),
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save subject");
    }
  };

  const handleCancel = () => {
    setEditSubjectId(null);
    setIsEditMode(false);

    // reset dropdown fields
    setSelectedRegulation("0");
    setSelectedProgramme("0");
    setSelectedBranch("0");
    setSelectedYear("0");
    setSelectedSemester("0");
    setSelectedStream("1");

    // reset remaining form fields
    resetForm();
  };

  const handleUpdatePaperOrder = async () => {
    if (!selectedPaperOrderSubject) return;

    try {
      setLoadingSubjects(true);

      const updatedSubject = {
        ...selectedPaperOrderSubject,
        pAP_ORDER: paperOrderValue,
      };

      const payload = {
        Programme: selectedProgramme || "",
        Branch: selectedBranch || "",
        Year: selectedYear || "",
        Semester: selectedSemester || "",
        SubjectCode: updatedSubject.sUBJECTCODE,
        // SubjectName: updatedSubject.sUBJECTNAME,
        // AcademicYear: localStorage.getItem("academicYear") || "2025-2026",
        Stream: selectedStream || "",
        Pap_Order: String(updatedSubject.pAP_ORDER),
        Regu: selectedRegulation || "",
      };

      console.log("CHECK PAPER ORDER PAYLOAD", payload);

      const response = await checkPaperOrder(payload);
      console.log("CHECK PAPER ORDER RESPONSE", response);
      toast.success("Paper oder updated!");

      // Update only selected row after API success
      setSubjects((prev) =>
        prev.map((sub) =>
          sub.sID === updatedSubject.sID
            ? {
                ...sub,
                pAP_ORDER: paperOrderValue,
              }
            : sub,
        ),
      );

      setEditingPaperOrderId(null);
      setShowPaperOrderUpdate(false);
      setSelectedPaperOrderSubject(null);
    } catch (error) {
      console.error("Paper order update failed", error);
    } finally {
      setLoadingSubjects(false);
    }
  };

  useEffect(() => {
    if (editSubjectId && years.length > 0) {
      const exists = years.find((x) => x.iD === selectedYear);
      if (!exists) {
        setSelectedYear("0");
      }
    }
  }, [years]);

  const handleEdit = (item: any) => {
    setIsEditMode(true);
    console.log("EDIT DATA", item);
    setEditSubjectId(String(item.sID));

    // Text fields
    setSubjectCode(item.sUBJECTCODE || "");
    setSubjectName(item.sUBJECTNAME || "");
    setSubjectShortName(item.subjectShortName || "");

    // Dropdowns
    setSelectedRegulation(item.regu || "0");
    setSelectedProgramme(item.cOURSECODE?.split("-")[0] || "0");
    setSelectedBranch(item.bRANCHCODE?.split("-")[0] || "0");
    setSelectedYear(item.yEAR || "0");
    setSelectedSemester(item.sEMESTER || "0");
    setSelectedStream(String(item.sTREAM || "1"));

    // Other fields
    setPaperOrder(String(item.pAP_ORDER || ""));
    setPeriodType(item.periodType || "");

    // Elective
    setElectiveCode(item.eLEC_CODES || "");
    setElectiveName(item.eLEC_NAMES || "");
    setElectiveShortName(item.electiveShortName || "");

    // Sub Type
    const type = Number(item.subtype || 0);

    setSubtype(type);
    setIsMinor(type === 1);
    setIsHonor(type === 2);
    setIsElective(item.iS_ELECTIVE === "Y");
    setElectiveValue(item.iS_ELECTIVE || "N");

    // Marks
    setMarks({
      sessionalMaxMarks: item.sESSIONALMAXMARKS || "",
      sessionalMinMarks: item.sESSIONALMINMARKS || "",

      assignmentMaxMarks: item.assMaxMarks || "",
      assignmentMinMarks: item.assMinMarks || "",

      onlineQuizMaxmarks: item.oQMaxMarks || "",
      onlineQuizMinmarks: item.oQMinMarks || "",

      objectiveMaxmarks: item.objMaxMarks || "",
      objectiveMinmarks: item.objMinMarks || "",

      attendenceMaxMarks: item.attMaxMarks || "",
      attendenceMinMarks: item.attMinMarks || "",

      daytoDayMaxMarks: item.dayMaxMarks || "",
      daytoDayMinMarks: item.dayMinMarks || "",

      internalTestMaxMarks: item.intTestMaxMarks || "",
      internalTestMinMarks: item.intTestMinMarks || "",

      viVaVoiceMaxMarks: item.vivomaxMarks || "",
      viVaVoiceMinMarks: item.vivoMinMarks || "",

      recordMaxMarks: item.recordMaxMarks || "",
      recordeMinMarks: item.recordMinMarks || "",

      reportPresentattionMax: item.rptPrstMaxMks || "",
      reportPresentattionMin: item.rptPrstMinMks || "",

      labInternalMaxMarks: item.labIntMaxMks || "",
      labInternalMinMarks: item.labIntMinMks || "",

      oralTestMax: item.oralMaxMks || "",
      oralTestMin: item.oralMinMks || "",

      ciE100Max: item.maxCIE || "",
      ciE100Min: item.minCIE || "",

      ciE75Max: item.maxCIE75 || "",
      ciE75Min: item.minCIE75 || "",

      ciE60Max: item.maxCIE60 || "",
      ciE60Min: item.minCIE60 || "",

      ciE50Max: item.maxCIE50 || "",
      ciE50Min: item.minCIE50 || "",

      ciE40Max: item.maxCIE40 || "",
      ciE40Min: item.minCIE40 || "",

      extMax: item.labExtMaxMks || "",
      extMin: item.labExtMinMks || "",

      drawMaxMarks: item.drawShtMaxMks || "",
      drawMinMarks: item.drawShtMinMks || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    // fetchSubjects();
  };

  const handleDelete = async () => {
    try {
      if (!deleteItem?.sID) return;
      setDeleting(true);
      const response = await deleteSubjectMaster(String(deleteItem.sID));
      console.log("Delete Subject Response:", response);

      if (response.message == "Success") {
        toast.success("Subject deleted successfully!");
        setShowDeleteModal(false);
        setDeleteItem(null);
        // reload table
        await fetchSubjects();
      } else {
        toast.error(response.message || "Failed to delete subject!");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Something went wrong!");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!isEditMode) {
      fetchSubjects();
    }
  }, [
    selectedRegulation,
    selectedProgramme,
    selectedBranch,
    selectedYear,
    selectedSemester,
    selectedStream,
    isEditMode,
  ]);

  useEffect(() => {
    const fetchRegulations = async () => {
      try {
        setLoadingRegulations(true);
        const data = await getRegulationList();
        console.log("Regulation API Response =======>", data);
        setRegulations(data);
      } catch (error) {
        console.error("Unable to load regulations", error);
      } finally {
        setLoadingRegulations(false);
      }
    };

    const fetchProgrammes = async () => {
      try {
        setLoadingProgrammes(true);
        const academicYear = localStorage.getItem("academicYear");
        if (!academicYear) {
          console.error("Academic Year not found in local storage");
          return;
        }
        const data = await getProgrammeLoad(academicYear);
        console.log("Programme API Response =======>", data);
        setProgrammes(data);
      } catch (error) {
        console.error("Unable to load programmes", error);
      } finally {
        setLoadingProgrammes(false);
      }
    };
    fetchRegulations();
    fetchProgrammes();
  }, []);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        if (!selectedProgramme) {
          setBranches([]);
          return;
        }
        setLoadingBranches(true);
        const academicYear = localStorage.getItem("academicYear");
        if (!academicYear) {
          console.error("Academic Year not found in local storage");
          return;
        }
        const data = await getBranchLoad(academicYear, selectedProgramme);
        console.log("Branch API Response =======>", data);
        setBranches(data);
      } catch (error) {
        console.error("Unable to load branches", error);
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, [selectedProgramme]);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        if (!selectedProgramme) {
          setYears([]);
          return;
        }
        setLoadingYears(true);
        const academicYear = localStorage.getItem("academicYear");

        if (!academicYear) {
          console.error("Academic Year not found in local storage");
          return;
        }

        const data = await getYearList(academicYear, selectedProgramme);
        console.log("Year API Response =======>", data);

        setYears(data);
      } catch (error) {
        console.error("Unable to load years", error);
      } finally {
        setLoadingYears(false);
      }
    };

    fetchYears();
  }, [selectedProgramme]);

  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    try {
      setLoadingSubjects(true);

      const payload = {
        sid: "",
        programme: selectedProgramme || "0",
        p_code: "0",
        b_code: selectedBranch || "0",
        midType: "0",
        examTypes: "0",
        branch: selectedBranch || "0",
        year: selectedYear || "0",
        semester: selectedSemester || "0",
        subjectCode: subjectCode || "0",
        subjectName: subjectName || "0",
        academicYear: localStorage.getItem("academicYear") || "2025-2026",
        financialYear: "0",
        stream: selectedStream || "0",
        peroidType: periodType || "0",
        iselective: isElective ? "Y" : "N",
        status: "0",
        elective_pcodes: electiveCode || "0",
        elective_pNames: electiveName || "0",
        pap_Order: paperOrder || "0",
        elcnames: electiveShortName || "0",
        subtype: subtype || "0",
        regu: selectedRegulation || "0",
        subjectShortName: subjectShortName || "0",
        electiveShortName: electiveShortName || "0",
        userid: "0",
        displayDate: "0",
        date: "0",
      };

      console.log("GET SUBJECTS PAYLOAD", payload);

      const response = await getSubjectList(payload);

      setSubjects(response || []);
    } catch (error) {
      console.error(error);
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

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

  const filteredSubjects = subjects.filter(
    (item) =>
      item.sUBJECTCODE?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sUBJECTNAME?.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const paginatedSubjects = filteredSubjects.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  const totalRecords = filteredSubjects.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = Math.min(startIndex + recordsPerPage, totalRecords);

  return (
    <div className="dbs-subject-container">
      {/* Header */}
      <div className="dbs-subject-form-header">
        <h2>Subject Master</h2>
      </div>

      {/* Form Card */}
      <div className="dbs-form-card">
        <h3>Subject Information</h3>

        <div className="dbs-subject-layout">
          {/* LEFT SIDE */}
          <div className="dbs-subject-left">
            <div className="dbs-form-grid-2">
              <div className="dbs-input-box">
                <label>Regulation</label>
                <select
                  value={selectedRegulation}
                  disabled={isEditMode}
                  onChange={(e) => setSelectedRegulation(e.target.value)}
                >
                  <option value="0">
                    {loadingRegulations ? "Loading..." : "Select Regulation"}
                  </option>
                  {regulations.map((item, index) => (
                    <option key={index} value={item.regulation}>
                      {item.regulation}
                    </option>
                  ))}
                </select>
              </div>

              <div className="dbs-input-box">
                <label>Programme</label>
                <select
                  value={selectedProgramme}
                  disabled={isEditMode}
                  onChange={(e) => setSelectedProgramme(e.target.value)}
                >
                  <option value="0">
                    {loadingProgrammes ? "Loading..." : "Select Programme"}
                  </option>
                  {programmes.map((item, index) => (
                    <option key={index} value={item.courseCode}>
                      {item.course}
                    </option>
                  ))}
                </select>
              </div>

              <div className="dbs-input-box">
                <label>Branch</label>
                <select
                  value={selectedBranch}
                  disabled={isEditMode}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                >
                  <option value="0">
                    {loadingBranches ? "Loading..." : "Select Branch"}
                  </option>
                  {branches.map((item, index) => (
                    <option key={index} value={item.branchCode}>
                      {item.branchName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="dbs-input-box">
                <label>Year</label>
                <select
                  value={selectedYear}
                  disabled={isEditMode}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="0">
                    {loadingYears ? "Loading..." : "Select Year"}
                  </option>
                  {years.map((item, index) => (
                    <option key={index} value={item.iD}>
                      {item.dATA}
                    </option>
                  ))}
                </select>
              </div>

              <div className="dbs-input-box">
                <label>Semester</label>
                <select
                  value={selectedSemester}
                  disabled={isEditMode}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                >
                  <option value="0">Select Semester</option>
                  <option value="1">I</option>
                  <option value="2">II</option>
                </select>
              </div>

              <div className="dbs-input-box">
                <label>Stream</label>
                <select
                  value={selectedStream}
                  disabled={isEditMode}
                  onChange={(e) => setSelectedStream(e.target.value)}
                >
                  <option value="1">1</option>
                </select>
              </div>

              <div className="dbs-input-box">
                <label>Subject Code</label>
                <input
                  value={subjectCode}
                  disabled={isEditMode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                />
              </div>

              <div className="dbs-input-box">
                <label>Subject Name</label>
                <input
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                />
              </div>

              <div className="dbs-input-box">
                <label>Subject Short Name</label>
                <input
                  value={subjectShortName}
                  onChange={(e) => setSubjectShortName(e.target.value)}
                />
              </div>

              <div className="dbs-input-box">
                <label>Minor / Honor</label>

                <div className="dbs-minor-honor-group">
                  <label className="dbs-checkbox-inline">
                    <input
                      type="checkbox"
                      checked={isElective}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setIsElective(checked);
                        if (checked) {
                          setElectiveValue("Y");
                          setMinorValue(null);
                          setHonorValue(null);
                          setIsMinor(false);
                          setIsHonor(false);
                        } else {
                          setElectiveValue("N");
                        }
                      }}
                    />
                    <span>Is Elective</span>
                  </label>

                  <label className="dbs-checkbox-inline">
                    <input
                      type="checkbox"
                      checked={subtype === 1}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSubtype(1);
                          setIsMinor(true);
                          setIsHonor(false);
                          setIsElective(false);
                          setElectiveValue("N");
                        } else {
                          setSubtype(0);
                          setIsMinor(false);
                        }
                      }}
                    />
                    <span>MINOR</span>
                  </label>

                  <label className="dbs-checkbox-inline">
                    <input
                      type="checkbox"
                      checked={subtype === 2}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSubtype(2);
                          setIsHonor(true);
                          setIsMinor(false);
                          setIsElective(false);
                          setElectiveValue("N");
                        } else {
                          setSubtype(0);
                          setIsHonor(false);
                        }
                      }}
                    />
                    <span>HONOR</span>
                  </label>
                </div>
              </div>

              <div className="dbs-input-box">
                <label>Paper Order</label>
                <input
                  type="text"
                  value={paperOrder}
                  disabled={isEditMode}
                  onChange={(e) => setPaperOrder(e.target.value)}
                />
              </div>

              <div className="dbs-input-box">
                <label>Period Type</label>
                <select
                  value={periodType}
                  onChange={(e) => setPeriodType(e.target.value)}
                >
                  <option value="">Select Period Type</option>
                  <option value="T">Theory</option>
                  <option value="P">Practical</option>
                </select>
              </div>

              <div className="dbs-input-box">
                <label>Elective Code</label>
                <input
                  type="text"
                  value={electiveCode}
                  onChange={(e) => setElectiveCode(e.target.value)}
                  disabled={!enableElectiveFields}
                />
              </div>

              <div className="dbs-input-box">
                <label>Elective Name</label>
                <input
                  type="text"
                  value={electiveName}
                  onChange={(e) => setElectiveName(e.target.value)}
                  disabled={!enableElectiveFields}
                />
              </div>

              <div className="dbs-input-box">
                <label>Elective Short Name</label>
                <input
                  type="text"
                  value={electiveShortName}
                  onChange={(e) => setElectiveShortName(e.target.value)}
                  disabled={!enableElectiveFields}
                />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="dbs-subject-right">
            <div className="dbs-marks-header">
              <span>Marks Type</span>
              <span>Maximum</span>
              <span>Minimum</span>
            </div>

            <div className="dbs-marks-scroll">
              {marksFields.map((field) => {
                const [maxKey, minKey] = marksKeyMap[field];

                return (
                  <div className="dbs-marks-row" key={field}>
                    <label>{field}</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Max"
                      value={marks[maxKey]}
                      onChange={(e) =>
                        setMarks({
                          ...marks,
                          [maxKey]: e.target.value,
                        })
                      }
                    />

                    <input
                      type="number"
                      min="0"
                      placeholder="Min"
                      value={marks[minKey]}
                      onChange={(e) =>
                        setMarks({
                          ...marks,
                          [minKey]: e.target.value,
                        })
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="dbs-form-actions-row">
          <button className="dbs-form-cancel-btn" onClick={handleCancel}>
            Cancel
          </button>

          <button className="dbs-form-save-btn" onClick={handleSaveSubject}>
            <Save size={16} />
            {editSubjectId ? "Update Subject" : "Save Subject"}
          </button>
        </div>
      </div>

      {/* ================= Table Header ================= */}
      <div className="dbs-programme-form-header dbs-table-head">
        <div>
          <h2>Subject Registry</h2>
          <p className="dbs-page-subtitle">Manage Subject Master Records</p>
        </div>

        <div className="dbs-table-search">
          <input
            type="text"
            placeholder="Search subject code or name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* ================= Table ================= */}
      <div className="dbs-table-container">
        {loadingSubjects ? (
          <div className="dbs-empty-state">Loading Subjects...</div>
        ) : filteredSubjects.length === 0 ? (
          <div className="dbs-empty-state">
            <AlertCircle className="dbs-empty-state-icon" />
            <div className="dbs-empty-state-title">
              {searchTerm ? "No matching subjects found" : "No records found"}
            </div>
          </div>
        ) : (
          <div className="dbs-table-card">
            <div
              className={
                subjects.length > 5
                  ? "dbs-table-scroll active-scroll"
                  : "dbs-table-scroll"
              }
            >
              <table className="dbs-data-table">
                <thead>
                  <tr>
                    <th>SLNo.</th>
                    <th>Subject Code</th>
                    <th>Subject Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedSubjects.map((item, index) => (
                    <tr key={item.sID}>
                      <td>
                        {editingPaperOrderId === item.sID ? (
                          <input
                            type="number"
                            value={paperOrderValue}
                            autoFocus
                            style={{ width: "60px", textAlign: "center" }}
                            onChange={(e) => {
                              setPaperOrderValue(Number(e.target.value));
                              setShowPaperOrderUpdate(true);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Escape") {
                                setEditingPaperOrderId(null);
                                setShowPaperOrderUpdate(false);
                              }
                            }}
                          />
                        ) : (
                          <span
                            className="dbs-paper-order-edit"
                            onClick={() => {
                              setEditingPaperOrderId(item.sID);
                              setPaperOrderValue(item.pAP_ORDER);
                              setSelectedPaperOrderSubject(item);
                            }}
                          >
                            {item.pAP_ORDER}
                          </span>
                        )}
                      </td>
                      <td>{item.sUBJECTCODE}</td>
                      <td>{item.sUBJECTNAME}</td>

                      <td>
                        <div className="dbs-actions">
                          <button
                            className="dbs-icon-btn edit"
                            onClick={() => handleEdit(item)}
                            title="Edit Subject"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            className="dbs-icon-btn delete"
                            onClick={() => {
                              setDeleteItem(item);
                              setShowDeleteModal(true);
                            }}
                            title="Delete Subject"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showPaperOrderUpdate && (
        <div className="dbs-paper-order-update-wrapper">
          <button
            className="dbs-update-paper-order-btn"
            onClick={handleUpdatePaperOrder}
          >
            Update Paper Order
          </button>
        </div>
      )}

      {/* ================= Table footer================= */}
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

      {/* Delete Confirmation Modal */}
      {/* {showDeleteModal && (
        <div className="dbs-subject-modal-overlay">
          <div className="dbs-subject-delete-modal">
            <div className="dbs-subject-delete-header">
              <Trash2 size={40} className="dbs-subject-delete-icon" />
              <h3>Delete Subject</h3>
            </div>

            <p>
              Are you sure you want to delete
              <strong> {deleteItem?.sUBJECTNAME}</strong>?
            </p>

            <div className="dbs-subject-delete-actions">
              <button
                className="dbs-subject-cancel-btn"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteItem(null);
                }}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                className="dbs-subject-delete-btn"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )} */}

      <DeleteModal
        open={showDeleteModal}
        title="Delete Subject"
        itemName={deleteItem?.sUBJECTNAME}
        loading={deleting}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteItem(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Subjects;
