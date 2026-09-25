import axios from "axios";
import { API_BASE } from "../config";

export interface ProgrammeItem {
  COURSECODE?: string;
  coursecode?: string;
  CourseCode?: string;
  COURSE?: string;
  Course?: string;
  PROGRAMME?: string;
  Programme?: string;
  COURSENAME?: string;
  coursename?: string;
  CourseName?: string;
  NAME?: string;
  name?: string;
  [key: string]: any;
}

export interface YearItem {
  YEAR?: string | number;
  Year?: string | number;
  year?: string | number;
  STDYEAR?: string | number;
  StdYear?: string | number;
  stdyear?: string | number;
  STUDYINGYEAR?: string | number;
  StudyingYear?: string | number;
  ID?: string | number;
  id?: string | number;
  DATA?: string;
  data?: string;
  [key: string]: any;
}

export interface BranchItem {
  BRANCHCODE?: string;
  branchcode?: string;
  BranchCode?: string;
  BRANCH?: string;
  Branch?: string;
  BRANCHNAME?: string;
  branchname?: string;
  BranchName?: string;
  NAME?: string;
  name?: string;
  [key: string]: any;
}

export interface SectionItem {
  SECTIONNAME?: string;
  sectionname?: string;
  SectionName?: string;
  SECTION?: string;
  Section?: string;
  section?: string;
  SEC?: string;
  Sec?: string;
  sec?: string;
  [key: string]: any;
}

export interface SubjectItem {
  SUBJECTCODE?: string;
  subjectcode?: string;
  SubjectCode?: string;
  SUB_CODE?: string;
  sub_code?: string;
  SUBCODE?: string;
  SubCode?: string;
  subcode?: string;
  SUBJECTNAME?: string;
  subjectname?: string;
  SubjectName?: string;
  SUBNAME?: string;
  SubName?: string;
  subname?: string;
  SUBJECT?: string;
  Subject?: string;
  NAME?: string;
  name?: string;
  [key: string]: any;
}

export interface MidTypeItem {
  MIDTYPE?: string;
  midtype?: string;
  MidType?: string;
  MIDTYPE_ID?: string;
  MidType_Id?: string;
  EXAMTYPE?: string;
  ExamType?: string;
  examtype?: string;
  [key: string]: any;
}

export interface StudentMarkRow {
  sno?: number;
  ID?: string | number;
  id?: string | number;
  RegistrationNo?: string;
  REGNO?: string;
  regno?: string;
  Marks?: string;
  marks?: string;
  TH?: string | number;
  CP?: string | number;
  PERCENTAGE?: string | number;
  TLMCode?: string;
  [key: string]: any;
}

export interface StudentAttendanceItem {
  id?: string;
  registrationNo?: string;
  marks?: string;
  tlmCode?: string;
  tc?: string;
  pc?: string;
  perc?: string;
}

export interface SubjectFilterParams {
  userId?: string;
  programme?: string;
  branch?: string;
  year?: string;
  semester?: string;
  section?: string;
  academicYear?: string;
  stream?: string;
  subjectCode?: string;
}

export interface MaxMinMarksFilterParams {
  academicYear?: string;
  programme?: string;
  branch?: string;
  year?: string;
  semester?: string;
  section?: string;
  subjectCode?: string;
  midType?: string;
}

const getFallbackUrl = (base: string, endpoint: string) => {
  const fullUrl = `${base}${endpoint}`;
  if (fullUrl.startsWith("https://")) {
    return fullUrl.replace("https://", "http://");
  }
  if (fullUrl.startsWith("http://")) {
    return fullUrl.replace("http://", "https://");
  }
  return fullUrl;
};

const fetchGetWithFallback = async (endpoint: string, config: any) => {
  try {
    const response = await axios.get(`${API_BASE}${endpoint}`, config);
    return response.data;
  } catch (err: any) {
    if (err.code === "ERR_NETWORK" || err.message?.includes("Network Error")) {
      const fallbackUrl = getFallbackUrl(API_BASE, endpoint);
      try {
        const response = await axios.get(fallbackUrl, config);
        return response.data;
      } catch (fbErr) {
        throw fbErr;
      }
    }
    throw err;
  }
};

const fetchPostWithFallback = async (endpoint: string, payload: any) => {
  try {
    const response = await axios.post(`${API_BASE}${endpoint}`, payload);
    return response.data;
  } catch (err: any) {
    if (err.code === "ERR_NETWORK" || err.message?.includes("Network Error")) {
      const fallbackUrl = getFallbackUrl(API_BASE, endpoint);
      try {
        const response = await axios.post(fallbackUrl, payload);
        return response.data;
      } catch (fbErr) {
        throw fbErr;
      }
    }
    throw err;
  }
};

export const getProgrammes = async (academicYear: string, department?: string, userId?: string) => {
  return await fetchGetWithFallback("MarksEntry/programmes", {
    params: {
      academicYear: academicYear || "",
      AcademicYear: academicYear || "",
      department: department || "",
      Department: department || "",
      userId: userId || "",
      UserId: userId || ""
    }
  });
};

export const getYears = async (department: string, programme: string, academicYear: string, userId?: string) => {
  return await fetchGetWithFallback("MarksEntry/years", {
    params: {
      Department: department && department.trim() !== "" ? department : "0",
      DEPT: department && department.trim() !== "" ? department : "0",
      Programme: programme || "",
      CourseCode: programme || "",
      AcademicYear: academicYear || "",
      UserId: userId || ""
    }
  });
};

export const getBranches = async (course: string, academicYear: string, department?: string, userId?: string) => {
  return await fetchGetWithFallback("MarksEntry/branches", {
    params: {
      Course: course || "",
      COURSE: course || "",
      CourseCode: course || "",
      Programme: course || "",
      AcademicYear: academicYear || "",
      Department: department || "",
      UserId: userId || ""
    }
  });
};

export const getSections = async (programme: string, branch: string, year: string) => {
  return await fetchGetWithFallback("MarksEntry/sections", {
    params: {
      programme: programme || "",
      CourseCode: programme || "",
      branch: branch || "",
      BRANCHCODE: branch || "",
      year: year || "",
      STDYEAR: year || ""
    }
  });
};

export const getSubjects = async (params: SubjectFilterParams) => {
  const queryParams: Record<string, string> = {
    Programme: params.programme || "",
    CourseCode: params.programme || "",
    Course: params.programme || "",
    Branch: params.branch || "",
    BranchCode: params.branch || "",
    Year: params.year || "",
    Semester: params.semester || "",
    AcademicYear: params.academicYear || "",
    Stream: params.stream || "1"
  };
  if (params.userId) {
    queryParams.UserId = params.userId;
    queryParams.Lecturer = params.userId;
  }
  if (params.section) queryParams.Section = params.section;

  try {
    const res = await fetchGetWithFallback("MarksEntry/subjects", { params: queryParams });
    if (res) {
      const list = Array.isArray(res) ? res : (res.data ? (Array.isArray(res.data) ? res.data : (typeof res.data === "string" ? JSON.parse(res.data) : [])) : []);
      if (Array.isArray(list) && list.length > 0) return res;
    }
  } catch (e) {
    console.warn("MarksEntry/subjects failed, trying AdminMarksEntry/subjects", e);
  }

  // Fallback to AdminMarksEntry/subjects endpoint (which has UserId bound in model)
  return await fetchGetWithFallback("AdminMarksEntry/subjects", { params: queryParams });
};

// export const getMidTypes = async (params: SubjectFilterParams) => {
//   const queryParams: Record<string, string> = {
//     AcademicYear: params.academicYear || "",
//     Programme: params.programme || "",
//     CourseCode: params.programme || "",
//     Branch: params.branch || "",
//     BranchCode: params.branch || "",
//     Year: params.year || "",
//     Semester: params.semester || "",
//     Section: params.section || "",
//     SubjectCode: params.subjectCode || "",
//     Subject: params.subjectCode || "",
//     SUB_CODE: params.subjectCode || ""
//   };

//   try {
//     const res = await fetchGetWithFallback("MarksEntry/mid-types", { params: queryParams });
//     if (res) {
//       const list = Array.isArray(res) ? res : (res.data ? (Array.isArray(res.data) ? res.data : (typeof res.data === "string" ? JSON.parse(res.data) : [])) : []);
//       if (Array.isArray(list) && list.length > 0) return res;
//     }
//   } catch (e) {
//     console.warn("MarksEntry/mid-types failed, trying AdminMarksEntry/mid-types", e);
//   }

//   return await fetchGetWithFallback("AdminMarksEntry/mid-types", { params: queryParams });
// };
export const getMidTypes = async (params: {
  academicYear: string;
  programme: string;
  branch: string;
  year: string;
  semester: string;
  section: string;
  subjectCode: string;
}) => {
  const response = await axios.get(
    `${API_BASE}Examinations/mid-types`,
    {
      params: params
    }
  );

  console.log("getMidTypes AXIOS RESPONSE:", response);
  console.log("getMidTypes RESPONSE DATA:", response.data);

  return response.data;
};
export const getMaxMinMarks = async (params: MaxMinMarksFilterParams) => {
  const queryParams = {
    AcademicYear: params.academicYear || "",
    Programme: params.programme || "",
    CourseCode: params.programme || "",
    Branch: params.branch || "",
    BranchCode: params.branch || "",
    Year: params.year || "",
    Semester: params.semester || "",
    Section: params.section || "",
    SubjectCode: params.subjectCode || "",
    SubjectName: params.subjectCode || "",
    Subject: params.subjectCode || "",
    MidType: params.midType || "",
    MIDTYPE: params.midType || ""
  };

  try {
    const res = await fetchGetWithFallback("MarksEntry/max-min-marks", { params: queryParams });
    if (res) {
      const list = Array.isArray(res) ? res : (res.data ? (Array.isArray(res.data) ? res.data : (typeof res.data === "string" ? JSON.parse(res.data) : [])) : []);
      if (Array.isArray(list) && list.length > 0) return res;
    }
  } catch (e) { }

  return await fetchGetWithFallback("AdminMarksEntry/max-min-marks", { params: queryParams });
};

export const getStudentMarks = async (params: {
  academicYear?: string;
  programme?: string;
  branch?: string;
  year?: string;
  semester?: string;
  section?: string;
  subjectCode?: string;
  midType?: string;
  userId?: string;
}) => {
  const queryParams = {
    AcademicYear: params.academicYear || "",
    Programme: params.programme || "",
    CourseCode: params.programme || "",
    Branch: params.branch || "",
    BranchCode: params.branch || "",
    Year: params.year || "",
    Semester: params.semester || "",
    Section: params.section || "",
    SubjectCode: params.subjectCode || "",
    SubjectName: params.subjectCode || "",
    Subject: params.subjectCode || "",
    MidType: params.midType || "",
    MIDTYPE: params.midType || "",
    UserId: params.userId || "",
    Lecturer: params.userId || ""
  };

  try {
    const res = await fetchGetWithFallback("MarksEntry/student-marks", { params: queryParams });
    if (res) {
      const list = Array.isArray(res) ? res : (res.data ? (Array.isArray(res.data) ? res.data : (typeof res.data === "string" ? JSON.parse(res.data) : [])) : []);
      if (Array.isArray(list) && list.length > 0) return res;
    }
  } catch (e) { }

  return await fetchGetWithFallback("AdminMarksEntry/student-marks", { params: queryParams });
};

export const saveAllMarks = async (payload: any) => {
  return await fetchPostWithFallback("MarksEntry/save-all", payload);
};

export const saveAttendanceMarks = async (payload: any) => {
  return await fetchPostWithFallback("MarksEntry/save-attendance", payload);
};
