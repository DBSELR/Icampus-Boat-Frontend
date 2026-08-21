import axios from "axios";
import { API_BASE } from "../config";

export const loadAdmissionData = async () => {
  try {
    const response = await axios.get(`${API_BASE}Admission/Griddata`);
    return response.data.data;
  } catch (error) {
    console.error("Delete Error", error);
    throw error;
  }
};

export const loadAdmissionInitialFields = async () => {
  try {
    const response = await axios.get(`${API_BASE}Admission/load`, {
      params: {
        academicYear: "2025-2026",
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Delete Error", error);
    throw error;
  }
};

export const saveAdmission = async (payload: any) => {
  try {
    const response = await axios.post(`${API_BASE}Admission/save`, payload);
    return response.data;
  } catch (error) {
    console.error("Save Admission Error", error);
    throw error;
  }
};

// =================Expenditure Master============
export const loadExpenditureMaster = async () => {
  try {
    // const academicYear = localStorage.getItem("academicYear") || "2025-2026";

    const response = await axios.get(
      `${API_BASE}ExpenditureMaster/ExpenditureMasterList`,
    );

    return response.data.data;
  } catch (error) {
    console.error("Load Expenditure Master Error", error);
    throw error;
  }
};

export const loadExpenditureYears = async (courseCode: string) => {
  try {
    const academicYear = localStorage.getItem("academicYear");

    const response = await axios.get(`${API_BASE}ExpenditureMaster/years`, {
      params: {
        courseCode,
        academicYear: academicYear || "2025-2026",
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("Load Expenditure Years Error", error);
    throw error;
  }
};

export const saveExpenditureMaster = async (data: {
  id: string | number;
  course: string;
  year: string | number;
  expenditureHeads: string;
  amount: string | number;
}) => {
  try {
    const response = await axios.post(
      `${API_BASE}ExpenditureMaster/save`,
      data,
    );

    return response.data;
  } catch (error) {
    console.error("Save Expenditure Master Error:", error);
    throw error;
  }
};

export const deleteExpenditureMaster = async (id: string) => {
  try {
    const response = await axios.delete(
      `${API_BASE}ExpenditureMaster/delete/${id}`,
    );

    return response.data;
  } catch (error) {
    console.error("Delete Expenditure Master Error:", error);
    throw error;
  }
};

// ==============Section Change==============
export const getSections = async (payload: {
  programme: string;
  branch: string;
  syear: string;
}) => {
  try {
    const response = await axios.get(`${API_BASE}SectionChange/sections`, {
      params: {
        programme: payload.programme,
        branch: payload.branch,
        syear: payload.syear,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error loading sections:", error);
    throw error;
  }
};

export const loadata = async (payload: any) => {
  try {
    const response = await axios.get(`${API_BASE}SectionChange/students`, {
      params: payload,
    });

    return response.data;
  } catch (error) {
    console.error("Error loading students:", error);
    throw error;
  }
};

export const updateSection = async (payload: {
  programme: string;
  branch: string;
  sYear: string;
  semester: string;
  academicYear: string;
  newSection: string;
  regNos: string[];
  userId: string;
}) => {
  try {
    const response = await axios.post(
      `${API_BASE}SectionChange/update`,
      payload,
    );

    return response.data;
  } catch (error) {
    console.error("Error updating student section:", error);
    throw error;
  }
};


// ===================== Group Change APIs =====================

export const loadGroupChangeData = async (academicYear?: string) => {
    try {
        const acyr = academicYear || localStorage.getItem("academicYear") || "";
        const response = await axios.get(`${API_BASE}GroupChange/load`, {
            params: { academicYear: acyr }
        });
        return response.data;
    } catch (error) {
        console.error("Error while loading Group Change initial data", error);
        throw error;
    }
};

export const getStudentGroupDetails = async (regNo: string) => {
    try {
        const response = await axios.get(`${API_BASE}GroupChange/student-details/${encodeURIComponent(regNo)}`);
        return response.data;
    } catch (error) {
        console.error("Error while loading student group details", error);
        throw error;
    }
};

export const getSectionsForBranch = async (
    academicYear: string, 
    courseCode: string, 
    branchCode: string, 
    year: string
) => {
    try {
        const response = await axios.get(`${API_BASE}GroupChange/sections`, {
            params: { academicYear, courseCode, branchCode, year }
        });
        return response.data;
    } catch (error) {
        console.error("Error while fetching sections for branch", error);
        throw error;
    }
};

export const validateNewRegNo = async (
    academicYear: string, 
    courseCode: string, 
    year: string, 
    newRegNo: string
) => {
    try {
        const response = await axios.get(`${API_BASE}GroupChange/validate-new-regno`, {
            params: { academicYear, courseCode, year, newRegNo }
        });
        return response.data;
    } catch (error) {
        console.error("Error while validating new registration number", error);
        throw error;
    }
};

export const saveGroupChange = async (payload: {
    hid?: string;
    date?: string;
    receiptNo?: string;
    regNo: string;
    studentName?: string;
    course?: string;
    branch?: string;
    changedGroup: string;
    rollNo?: string;
    section: string;
    academicYear: string;
    year: string;
    newRegNo: string;
    remarks?: string;
}) => {
    try {
        const response = await axios.post(`${API_BASE}GroupChange/save`, payload);
        return response.data;
    } catch (error) {
        console.error("Error while saving Group Change data", error);
        throw error;
    }
};

export const deleteGroupChange = async (hid: string) => {
    try {
        const response = await axios.delete(`${API_BASE}GroupChange/delete/${hid}`);
        return response.data;
    } catch (error) {
        console.error("Error while deleting Group Change record", error);
        throw error;
    }
};

// ===================== Bonafide Certificate APIs =====================

export const loadBonafideData = async (certificateNo?: string) => {
    try {
        const response = await axios.get(`${API_BASE}Bonafide/load`, {
            params: { certificateNo }
        });
        return response.data;
    } catch (error) {
        console.error("Error while loading Bonafide initial data", error);
        throw error;
    }
};

export const getBonafideStudentDetails = async (regNo: string) => {
    try {
        const response = await axios.get(`${API_BASE}Bonafide/registration-details/${encodeURIComponent(regNo)}`);
        return response.data;
    } catch (error) {
        console.error("Error while fetching Bonafide student details", error);
        throw error;
    }
};

export const saveBonafideCertificate = async (payload: {
    id?: string;
    CertificateNO?: string;
    Date?: string;
    RegistrationNo?: string;
    DOB?: string;
    StudentName?: string;
    FatherName?: string;
    Programme?: string;
    Branch?: string;
    Year?: string;
    Semister?: string;
    Purpose?: string;
    AcademicYear?: string;
    Reporttitle?: string;
    OriginalCertificate?: string;
    CourseComplete?: string;
}) => {
    try {
        const response = await axios.post(`${API_BASE}Bonafide/save`, payload);
        return response.data;
    } catch (error) {
        console.error("Error while saving Bonafide Certificate", error);
        throw error;
    }
};

export const deleteBonafideCertificate = async (id: string) => {
    try {
        const response = await axios.delete(`${API_BASE}Bonafide/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error while deleting Bonafide Certificate", error);
        throw error;
    }
};

export const getBonafideReport = async (id: string, ssNo: string, certificateNo: string) => {
    try {
        const response = await axios.get(`${API_BASE}Bonafide/report/${id}`, {
            params: { ssNo, certificateNo }
        });
        return response.data;
    } catch (error) {
        console.error("Error while fetching Bonafide report", error);
        throw error;
    }
};

// ===================== Study Certificate APIs =====================

export const loadStudyCertificateData = async () => {
    try {
        const response = await axios.get(`${API_BASE}StudyCertificate/load`);
        return response.data;
    } catch (error) {
        console.error("Error while loading Study Certificate initial data", error);
        throw error;
    }
};

export const getStudyCertificateStudentDetails = async (regNo: string) => {
    try {
        const response = await axios.get(`${API_BASE}StudyCertificate/student-details/${encodeURIComponent(regNo)}`);
        return response.data;
    } catch (error) {
        console.error("Error while fetching Study Certificate student details", error);
        throw error;
    }
};

export const saveStudyCertificate = async (payload: {
    Id?: string;
    SCNO?: string;
    Date?: string;
    RegNo: string;
    AdmissionDate?: string;
    StudentName?: string;
    FatherName?: string;
    Programme?: string;
    Branch?: string;
    Year?: string;
    FromDate?: string;
    ToDate?: string;
    SCType?: string;
    AcademicYear?: string;
    FACYR?: string;
    TACYR?: string;
    Conduct?: string;
    Type?: string;
    Purpose?: string;
}) => {
    try {
        const response = await axios.post(`${API_BASE}StudyCertificate/save`, payload);
        return response.data;
    } catch (error) {
        console.error("Error while saving Study Certificate", error);
        throw error;
    }
};

export const deleteStudyCertificate = async (id: string) => {
    try {
        const response = await axios.delete(`${API_BASE}StudyCertificate/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error while deleting Study Certificate", error);
        throw error;
    }
};

export const getStudyCertificatePrintData = async (id: string, ssno: string) => {
    try {
        const response = await axios.get(`${API_BASE}StudyCertificate/print-data`, {
            params: { id, ssno }
        });
        return response.data;
    } catch (error) {
        console.error("Error while fetching Study Certificate print data", error);
        throw error;
    }
};

// ===================== Course Completed Certificate APIs =====================

export const loadCourseCompletedData = async () => {
    try {
        const response = await axios.get(`${API_BASE}CourseCompleted/load`);
        return response.data;
    } catch (error) {
        console.error("Error while loading Course Completed initial data", error);
        throw error;
    }
};

export const getCourseCompletedStudentDetails = async (regNo: string) => {
    try {
        const response = await axios.get(`${API_BASE}CourseCompleted/student-details/${encodeURIComponent(regNo)}`);
        return response.data;
    } catch (error) {
        console.error("Error while fetching Course Completed student details", error);
        throw error;
    }
};

export const saveCourseCompleted = async (payload: {
    Id?: string;
    SCNO?: string;
    Date?: string;
    RegNo: string;
    AdmissionDate?: string;
    StudentName?: string;
    FatherName?: string;
    Programme?: string;
    Branch?: string;
    Year?: string;
    FromAcademicYear?: string;
    ToAcademicYear?: string;
    AcademicYear?: string;
    SCType?: string;
    Conduct?: string;
}) => {
    try {
        const response = await axios.post(`${API_BASE}CourseCompleted/save`, payload);
        return response.data;
    } catch (error) {
        console.error("Error while saving Course Completed Certificate", error);
        throw error;
    }
};

export const deleteCourseCompleted = async (id: string) => {
    try {
        const response = await axios.delete(`${API_BASE}CourseCompleted/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error while deleting Course Completed Certificate", error);
        throw error;
    }
};

export const getCourseCompletedPrintData = async (id: string, ssno: string) => {
    try {
        const response = await axios.get(`${API_BASE}CourseCompleted/print-data`, {
            params: { id, ssno }
        });
        return response.data;
    } catch (error) {
        console.error("Error while fetching Course Completed print data", error);
        throw error;
    }
};

// ===================== No Objection Certificate (NOC) APIs =====================

export const loadNoObjectionCertificateData = async (academicYear?: string) => {
    try {
        const acyr = academicYear || localStorage.getItem("academicYear") || "";
        const response = await axios.get(`${API_BASE}NoObjectionCertificate/load`, {
            params: { academicYear: acyr }
        });
        return response.data;
    } catch (error) {
        console.error("Error while loading No Objection Certificate initial data", error);
        throw error;
    }
};

export const getNoObjectionCertificateStudentDetails = async (regNo: string) => {
    try {
        const response = await axios.get(`${API_BASE}NoObjectionCertificate/student-details/${encodeURIComponent(regNo)}`);
        return response.data;
    } catch (error) {
        console.error("Error while fetching No Objection Certificate student details", error);
        throw error;
    }
};

export const saveNoObjectionCertificate = async (payload: {
    Id?: string;
    NocNo?: string;
    Date?: string;
    RegNo: string;
    AdmissionDate?: string;
    StudentName?: string;
    FatherName?: string;
    Programme?: string;
    Branch?: string;
    Year?: string;
    FromStudentTransfe?: string;
    ToStudentTransfe?: string;
    AffiliatingUniversity?: string;
    UniversityissuedtheNOC?: string;
    TotalintakeinIYear?: string;
    Quota?: string;
    Annualtuitionfee?: string;
    TuitionfeeChargeble?: string;
    ReasonForTransfer?: string;
    AcademicYear?: string;
    Principal?: string;
    JAccyr?: string;
    DateMonthlastExamination?: string;
    DetailsDiscontinue?: string;
    SeekingTransfer?: string;
    SeekingTransfer2?: string;
    NoOfUnfilled?: string;
    StydyYear?: string;
    StydyDetails?: string;
    Takenaccyr?: string;
    Noofunfilledseatsaccyr?: string;
}) => {
    try {
        const response = await axios.post(`${API_BASE}NoObjectionCertificate/save`, payload);
        return response.data;
    } catch (error) {
        console.error("Error while saving No Objection Certificate", error);
        throw error;
    }
};

export const deleteNoObjectionCertificate = async (id: string) => {
    try {
        const response = await axios.delete(`${API_BASE}NoObjectionCertificate/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error while deleting No Objection Certificate", error);
        throw error;
    }
};

export const getNoObjectionCertificatePrintData = async (ssno: string) => {
    try {
        const response = await axios.get(`${API_BASE}NoObjectionCertificate/print-data`, {
            params: { ssno }
        });
        return response.data;
    } catch (error) {
        console.error("Error while fetching No Objection Certificate print data", error);
        throw error;
    }
};

// ===================== TC Issues (Transfer Certificate) APIs =====================

export const loadTcIssuesData = async () => {
    try {
        const response = await axios.get(`${API_BASE}Tcissues/load`);
        return response.data;
    } catch (error) {
        console.error("Error while loading TC Issues initial data", error);
        throw error;
    }
};

export const getTcStudentDetails = async (regNo: string) => {
    try {
        const response = await axios.get(`${API_BASE}Tcissues/student-details/${encodeURIComponent(regNo)}`);
        return response.data;
    } catch (error) {
        console.error("Error while fetching TC student details", error);
        throw error;
    }
};

export const saveTcIssue = async (payload: {
    Tid?: string;
    SSNO: string;
    TCNo?: string;
    DateOfAdmission?: string;
    StudentName?: string;
    Fname?: string;
    DOB?: string;
    Religion?: string;
    Caste?: string;
    SubCaste?: string;
    ClassofLeaving?: string;
    Group?: string;
    Course?: string;
    FeeDue?: string;
    Nationality?: string;
    MotherTongue?: string;
    TCDate?: string;
    Conduct?: string;
    ReasonForLeaving?: string;
    DateofLeaving?: string;
    Mole1?: string;
    Mole2?: string;
    University?: string;
    ADMNO?: string;
    AcademicYear?: string;
    Scholar?: string;
    Qualified?: string;
}) => {
    try {
        const response = await axios.post(`${API_BASE}Tcissues/save`, payload);
        return response.data;
    } catch (error) {
        console.error("Error while saving TC issue details", error);
        throw error;
    }
};

export const deleteTcIssue = async (tid: string) => {
    try {
        const response = await axios.delete(`${API_BASE}Tcissues/delete/${tid}`);
        return response.data;
    } catch (error) {
        console.error("Error while deleting TC issue record", error);
        throw error;
    }
};

export const getTcPrintData = async (tid: string, ssno: string) => {
    try {
        const response = await axios.get(`${API_BASE}Tcissues/print-data`, {
            params: { tid, ssno }
        });
        return response.data;
    } catch (error) {
        console.error("Error while fetching TC print data", error);
        throw error;
    }
};

// ===================== Delete InActive Students APIs =====================

export const getDelInActiveProgrammes = async (academicYear?: string) => {
    try {
        const acyr = academicYear || localStorage.getItem("academicYear") || "";
        const response = await axios.get(`${API_BASE}DelInActiveStudent/programmes`, {
            params: { academicYear: acyr }
        });
        return response.data;
    } catch (error) {
        console.error("Error while fetching DelInActive programmes", error);
        throw error;
    }
};

export const getDelInActiveYears = async (programme: string, academicYear?: string) => {
    try {
        const acyr = academicYear || localStorage.getItem("academicYear") || "";
        const response = await axios.get(`${API_BASE}DelInActiveStudent/years`, {
            params: { programme, academicYear: acyr }
        });
        return response.data;
    } catch (error) {
        console.error("Error while fetching DelInActive years", error);
        throw error;
    }
};

export const getDelInActiveBranches = async (programme: string, academicYear?: string) => {
    try {
        const acyr = academicYear || localStorage.getItem("academicYear") || "";
        const response = await axios.get(`${API_BASE}DelInActiveStudent/branches`, {
            params: { programme, academicYear: acyr }
        });
        return response.data;
    } catch (error) {
        console.error("Error while fetching DelInActive branches", error);
        throw error;
    }
};

export const getDelInActiveSections = async (programme: string, branch: string, syear: string) => {
    try {
        const response = await axios.get(`${API_BASE}DelInActiveStudent/sections`, {
            params: { programme, branch, syear }
        });
        return response.data;
    } catch (error) {
        console.error("Error while fetching DelInActive sections", error);
        throw error;
    }
};

export const getDelInActiveStatuses = async (programme: string, branch: string, syear: string) => {
    try {
        const response = await axios.get(`${API_BASE}DelInActiveStudent/statuses`, {
            params: { programme, branch, syear }
        });
        return response.data;
    } catch (error) {
        console.error("Error while fetching DelInActive statuses", error);
        throw error;
    }
};

export const getDelInActiveStudents = async (params: {
    programme: string;
    branch: string;
    syear: string;
    semester: string;
    section: string;
    academicYear: string;
    status?: string;
}) => {
    try {
        const response = await axios.get(`${API_BASE}DelInActiveStudent/students`, {
            params
        });
        return response.data;
    } catch (error) {
        console.error("Error while fetching inactive students list", error);
        throw error;
    }
};

export const deleteInActiveStudents = async (payload: {
    programme?: string;
    branch?: string;
    sYear?: string;
    semester?: string;
    section: string;
    status?: string;
    academicYear?: string;
    regNos: string[];
    userId?: string;
}) => {
    try {
        const response = await axios.post(`${API_BASE}DelInActiveStudent/delete`, payload);
        return response.data;
    } catch (error) {
        console.error("Error while deleting inactive students", error);
        throw error;
    }
};


// ===================== Student Information APIs =====================

export const getStudentInfoColumns = async () => {
    try {
        const response = await axios.get(`${API_BASE}StudentInformation/columns`);
        return response.data;
    } catch (error) {
        console.error("Error while fetching Student Information columns", error);
        throw error;
    }
};

export const getStudentInfoProgrammes = async (academicYear?: string) => {
    try {
        const acyr = academicYear || localStorage.getItem("academicYear") || "";
        const response = await axios.get(`${API_BASE}StudentInformation/programmes`, {
            params: { academicYear: acyr }
        });
        return response.data;
    } catch (error) {
        console.error("Error while fetching Student Information programmes", error);
        throw error;
    }
};

export const getStudentInfoBranches = async (programme: string, academicYear?: string) => {
    try {
        const acyr = academicYear || localStorage.getItem("academicYear") || "";
        const response = await axios.get(`${API_BASE}StudentInformation/branches`, {
            params: { programme, academicYear: acyr }
        });
        return response.data;
    } catch (error) {
        console.error("Error while fetching Student Information branches", error);
        throw error;
    }
};

export const getStudentInfoYears = async (programme: string, academicYear?: string) => {
    try {
        const acyr = academicYear || localStorage.getItem("academicYear") || "";
        const response = await axios.get(`${API_BASE}StudentInformation/years`, {
            params: { programme, academicYear: acyr }
        });
        return response.data;
    } catch (error) {
        console.error("Error while fetching Student Information years", error);
        throw error;
    }
};

export const getStudentInfoFilterOptions = async (columnName: string) => {
    try {
        const response = await axios.get(`${API_BASE}StudentInformation/filter-options`, {
            params: { columnName }
        });
        return response.data;
    } catch (error) {
        console.error(`Error while fetching filter options for ${columnName}`, error);
        throw error;
    }
};

export const generateStudentInfoReport = async (payload: {
    academicYear: string;
    columns: string[];
    filters?: Record<string, string>;
}) => {
    try {
        const response = await axios.post(`${API_BASE}StudentInformation/report`, payload);
        return response.data;
    } catch (error) {
        console.error("Error while generating Student Information report", error);
        throw error;
    }
};