/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { API_BASE } from "../config";

/* ==========================================================================
   ATTENDANCE MODULE APIS
   Consolidated API services for all Attendance module forms:
   1. Admin Permissions
   2. Check Attendance
   3. Period Adjustment
   4. TimeTable
   ========================================================================== */

/* ==========================================================================
   1. ADMIN PERMISSIONS
   ========================================================================== */

export interface NoAttendanceLecturersPayload {
  programme: string;
  branch: string;
  section: string;
  day: string;
  semester: string;
  sYear: string;
  acdYr: string;
  date: string;
  toDate: string;
}

export interface NoAttendanceLecturerItem {
  aDay?: string;
  class?: string;
  grpid?: string;
  aDate?: string;
  Semister?: number | string;
  SYear?: string;
  Section?: string;
  aSubject?: string;
  Period_Range?: string;
  AcadamicYear?: string;
  FacultyID?: string;
  Course?: string;
  BSName?: string;
  BranchName?: string;
  [key: string]: any;
}

export interface NoAttendanceLecturersResponse {
  success: boolean;
  data: NoAttendanceLecturerItem[];
}

/**
 * POST /api/Admin_Permissions/no-attendance-lecturers
 * Loads the list of faculty who have not posted attendance for given criteria
 */
export const getNoAttendanceLecturers = async (
  payload: NoAttendanceLecturersPayload,
): Promise<NoAttendanceLecturerItem[]> => {
  try {
    console.log(
      "POST /api/Admin_Permissions/no-attendance-lecturers Payload:",
      payload,
    );
    const response = await axios.post<NoAttendanceLecturersResponse>(
      `${API_BASE}Admin_Permissions/no-attendance-lecturers`,
      payload,
    );
    console.log(
      "POST /api/Admin_Permissions/no-attendance-lecturers Response:",
      response.data,
    );

    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data?.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data as unknown as NoAttendanceLecturerItem[];
    }
    return [];
  } catch (error) {
    console.error("Admin_Permissions/no-attendance-lecturers error:", error);
    throw error;
  }
};

export interface AdminPermissionItemPayload {
  lecturer: string;
  subject: string;
  granted: boolean;
}

export interface SaveAdminPermissionsPayload {
  programme: string;
  branch: string;
  sYear: string;
  semester: string;
  section: string;
  fromDate: string;
  toDate: string;
  acdYr: string;
  permissions: AdminPermissionItemPayload[];
}

export interface SaveAdminPermissionsResponse {
  success: boolean;
  message: string;
  totalSaved?: number;
  [key: string]: any;
}

/**
 * POST /api/Admin_Permissions/save-permissions
 * Saves admin permissions for selected faculty and subjects
 */
export const saveAdminPermissions = async (
  payload: SaveAdminPermissionsPayload,
): Promise<SaveAdminPermissionsResponse> => {
  try {
    console.log(
      "POST /api/Admin_Permissions/save-permissions Payload:",
      payload,
    );
    const response = await axios.post<SaveAdminPermissionsResponse>(
      `${API_BASE}Admin_Permissions/save-permissions`,
      payload,
    );
    console.log(
      "POST /api/Admin_Permissions/save-permissions Response:",
      response.data,
    );
    return response.data;
  } catch (error) {
    console.error("Admin_Permissions/save-permissions error:", error);
    throw error;
  }
};

/* ==========================================================================
   2. CHECK ATTENDANCE
   ========================================================================== */

export interface LoadPeriodsPayload {
  acdYr: string;
  lecturer: string;
  date: string;
  shift: string;
  programme: string;
  branch: string;
  semester: string;
  section: string;
  sYear: string;
}

export interface PeriodItem {
  period?: string | number;
  periodNo?: string | number;
  PERIOD?: string | number;
  PERIODNO?: string | number;
  FRM_TO_PERIODS?: string;
  SUBJECTNAME?: string;
  subjectName?: string;
  sUBJECTNAME?: string;
  SUBJECT?: string;
  subject?: string;
  SUBJECTCODE?: string;
  subjectCode?: string;
  SUBCODE?: string;
  subCode?: string;
  time?: string;
  TIME?: string;
  lecturer?: string;
  lecturerName?: string;
  isMarked?: boolean;
  status?: string;
  [key: string]: any;
}

export interface LoadStudentsPayload {
  period: string;
  lecturer: string;
  date: string;
  academicYear: string;
  section: string;
  branch: string;
  sYear: string;
  programme: string;
  semester: string;
  isPractical: boolean;
  srNo: string;
  erNo: string;
}

export interface StudentAttendanceItem {
  STUDENTSERIALNO?: string;
  REGISTRATIONNO?: string;
  SNAME?: string;
  SECTION?: string;
  SSEMESTER?: number | string;
  PARENTMBNO?: string;
  LE?: boolean;
  STATUS?: string;
  SDATE?: string;
  ATTDATE?: string;
  SUBTYPE?: string | null;
  PROGRAMME?: string;
  BRANCH?: string;
  SYEAR?: number | string;
  ROLLNO?: string;
  SUBJECTNAME?: string;
  SUB_CODE?: string;
  ATT?: "A" | "P" | string;
  DAYTAUGHT?: string;
  DD?: string;
  REMARKS?: string | null;
  SNO?: number;
  SLNO?: number;
  // Fallbacks
  id?: string | number;
  rollNo?: string;
  regNo?: string;
  registrationNo?: string;
  studentName?: string;
  name?: string;
  isPresent?: boolean;
  status?: "P" | "A" | "Present" | "Absent" | string;
  percentage?: string | number;
  [key: string]: any;
}

/**
 * POST /api/CheckAttendance/periods
 * Loads period schedule slots for given date, lecturer, and academic criteria
 */
export const loadCheckAttendancePeriods = async (
  payload: LoadPeriodsPayload,
): Promise<PeriodItem[]> => {
  try {
    const response = await axios.post(
      `${API_BASE}CheckAttendance/periods`,
      payload,
    );
    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data?.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (Array.isArray(response.data?.result)) {
      return response.data.result;
    }
    if (response.data?.periods && Array.isArray(response.data.periods)) {
      return response.data.periods;
    }
    return [];
  } catch (error) {
    console.warn("CheckAttendance/periods error:", error);
    throw error;
  }
};

/**
 * POST /api/CheckAttendance/students
 * Loads student attendance grid for a specific period, lecturer, and class
 */
export const loadCheckAttendanceStudents = async (
  payload: LoadStudentsPayload,
): Promise<StudentAttendanceItem[]> => {
  try {
    const response = await axios.post(
      `${API_BASE}CheckAttendance/students`,
      payload,
    );
    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data?.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (Array.isArray(response.data?.result)) {
      return response.data.result;
    }
    if (response.data?.students && Array.isArray(response.data.students)) {
      return response.data.students;
    }
    return [];
  } catch (error) {
    console.warn("CheckAttendance/students error:", error);
    throw error;
  }
};

/* ==========================================================================
   3. PERIOD ADJUSTMENT
   ========================================================================== */

export interface PeriodAdjustmentDeptItem {
  DEPARTMENTCODE?: string;
  DEPARTMENT?: string;
  DepartmentCode?: string;
  Department?: string;
  departmentCode?: string;
  departmentName?: string;
  deptId?: string | number;
  deptName?: string;
  DeptCode?: string;
  DeptName?: string;
  description?: string;
  id?: string | number;
  [key: string]: any;
}

export interface PeriodAdjustmentFacultyItem {
  empId?: string;
  EmpID?: string;
  eMPID?: string;
  EMPID?: string;
  fname?: string;
  Fname?: string;
  FName1?: string;
  name?: string;
  facultyName?: string;
  lecturer?: string;
  lecturerName?: string;
  designation?: string;
  Designation?: string;
  dept?: string;
  workMode?: string;
  id?: string | number;
  [key: string]: any;
}

export interface AbsentFacultyTimetablePayload {
  lecturer: string;
  day: string;
  wdate: string;
  programme: string;
  semister: string;
  acdYr: string;
}

export interface AbsentFacultyTimetableRow {
  P_Subject?: string | null;
  Present_Subject?: string | null;
  Present_Lecturer?: string | null;
  PL?: string | null;
  WDate?: string | null;
  SHIFT?: string | number;
  DAY?: string;
  PROGRAMME?: string;
  Branch?: string;
  YEAR?: string | number;
  SEMISTER?: string | number;
  STREAM?: string;
  SECTION?: string;
  PERIOD?: string | number;
  SUBJECT?: string;
  DEPARTMENT?: string;
  LECTURER?: string;
  SPTIME?: string;
  PERIOD_TYPE?: string;
  FRM_TO_PERIODS?: string;
  SUB_CODE?: string;
  DEPT?: string;
  CANCEL?: string;
  [key: string]: any;
}

export interface AvailableFacultyPayload {
  fac: string; // "1", "2", "3", "4", "5"
  year: string;
  semister: string;
  branch: string;
  section: string;
  day: string;
  periodFrom: string;
  periodTo: string;
  programme: string;
  wdate: string;
  lecturer: string;
  acdYr: string;
}

export interface AvailableFacultyItem {
  Fname: string;
  Lecturer: string;
  fname?: string;
  lecturer?: string;
  [key: string]: any;
}

export interface AvailableFacultySubjectsPayload {
  year: string;
  semister: string;
  branch: string;
  section: string;
  day: string;
  periodFrom: string;
  periodTo: string;
  programme: string;
  wdate: string;
  lecturer: string;
  acdYr: string;
}

export interface AvailableFacultySubjectItem {
  LECTURER: string;
  SUB_CODE: string;
  Subject: string;
  Programme?: string | null;
  Branch?: string | null;
  Year?: string | null;
  Semister?: string | null;
  Section?: string | null;
  BSNAME?: string | null;
  BRANCHNAME?: string | null;
  [key: string]: any;
}

export interface SaveAdjustmentPayload {
  shiftNo: string;
  day: string;
  wdate: string;
  programme: string;
  branch: string;
  year: string;
  semister: string;
  section: string;
  period: string;
  subject: string;
  avL_Subject: string;
  department: string;
  lecturer: string;
  avL_Lecturert: string;
  stream: string;
  spTime: string;
  periodType: string;
  frrom_To_Periods: string;
  toperiod: string;
  reason: string;
  p_SubjectCode: string;
  l_SubjectCode: string;
}

export interface SaveAdjustmentResponse {
  success: boolean;
  message?: string;
  affectedRows?: number;
  [key: string]: any;
}

export interface DeleteAdjustmentPayload {
  shiftNo: string;
  day: string;
  branch: string;
  year: string;
  semister: string;
  section: string;
  stream: string;
  frrom_To_Periods: string;
  proc_type: string; // static "TT_ADJUST"
  wdate: string;
}

export interface DeleteAdjustmentResponse {
  success: boolean;
  message?: string;
  affectedRows?: number;
  [key: string]: any;
}

/**
 * GET /api/Period_Adjustment/departments
 */
export const getPeriodAdjustmentDepartments = async (
  empId: string = "",
  access: string = "ALL",
): Promise<PeriodAdjustmentDeptItem[]> => {
  try {
    const response = await axios.get(
      `${API_BASE}Period_Adjustment/departments`,
      {
        params: {
          Empid: empId,
          Access: access,
        },
      },
    );

    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching Period Adjustment departments:", error);
    return [];
  }
};

/**
 * POST /api/Period_Adjustment/faculty
 */
export const getPeriodAdjustmentFaculty = async (payload: {
  empId?: string;
  dept: string;
  workMode?: string;
  access?: string;
}): Promise<PeriodAdjustmentFacultyItem[]> => {
  try {
    const response = await axios.post(`${API_BASE}Period_Adjustment/faculty`, {
      empId: payload.empId ?? "",
      dept: payload.dept,
      workMode: payload.workMode ?? "Teaching",
      access: payload.access ?? "All",
    });

    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching Period Adjustment faculty:", error);
    return [];
  }
};

/**
 * POST /api/Period_Adjustment/absent-faculty-timetable
 */
export const getAbsentFacultyTimetable = async (
  payload: AbsentFacultyTimetablePayload,
): Promise<AbsentFacultyTimetableRow[]> => {
  try {
    const response = await axios.post(
      `${API_BASE}Period_Adjustment/absent-faculty-timetable`,
      {
        lecturer: payload.lecturer,
        day: payload.day,
        wdate: payload.wdate ?? "",
        programme: payload.programme,
        semister: payload.semister,
        acdYr: payload.acdYr,
      },
    );

    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching absent faculty timetable:", error);
    return [];
  }
};

/**
 * POST /api/Period_Adjustment/available-faculty
 */
export const getAvailableFaculty = async (
  payload: AvailableFacultyPayload,
): Promise<AvailableFacultyItem[]> => {
  try {
    const response = await axios.post(
      `${API_BASE}Period_Adjustment/available-faculty`,
      payload,
    );

    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching available faculty:", error);
    return [];
  }
};

/**
 * POST /api/Period_Adjustment/available-faculty-subjects
 */
export const getAvailableFacultySubjects = async (
  payload: AvailableFacultySubjectsPayload,
): Promise<AvailableFacultySubjectItem[]> => {
  try {
    const response = await axios.post(
      `${API_BASE}Period_Adjustment/available-faculty-subjects`,
      payload,
    );

    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching available faculty subjects:", error);
    return [];
  }
};

/**
 * POST /api/Period_Adjustment/save-adjustment
 */
export const savePeriodAdjustment = async (
  payload: SaveAdjustmentPayload,
): Promise<SaveAdjustmentResponse> => {
  const response = await axios.post(
    `${API_BASE}Period_Adjustment/save-adjustment`,
    payload,
  );
  return response.data;
};

/**
 * POST /api/Period_Adjustment/delete-adjustment
 */
export const deletePeriodAdjustment = async (
  payload: DeleteAdjustmentPayload,
): Promise<DeleteAdjustmentResponse> => {
  const response = await axios.post(
    `${API_BASE}Period_Adjustment/delete-adjustment`,
    payload,
  );
  return response.data;
};

/* ==========================================================================
   4. TIMETABLE
   ========================================================================== */

export interface TimeTableDepartment {
  DepartmentCode: string;
  Department: string;
}

export interface TimeTableSubject {
  SUBJECTNAME: string;
  SUBJECTCODE: string;
  Pap_order?: number;
  subtype?: string | null;
}

export interface TimeTableLecturer {
  FName1?: string;
  Fname: string;
  EmpID: string;
}

export interface TimeTableViewRow {
  ShiftNo?: string | number;
  Day?: string;
  WDate?: string;
  P_Subject?: string;
  Period?: string | number;
  Lecturer?: string;
  Department?: string;
  SpTime?: string;
  EpTime?: string;
  Period_Type?: string;
  SubCode?: string;
  Section?: string;
  Stream?: string;
  Year?: string | number;
  Semister?: string | number;
  [key: string]: any;
}

export interface SaveTimeTablePayload {
  id?: string;
  shiftNo: string;
  day: string;
  programme: string;
  branch: string;
  year: string;
  semister: string;
  stream: string;
  section: string;
  period: string;
  subject: string;
  department: string;
  lecturer: string;
  spTime: string;
  periodType: string;
  toperiod: string;
  frrom_To_Periods: string;
  subcode: string;
  epTime: string;
  academicYear: string;
  lecStatus: string;
  efrmdate: string;
  subtype: string;
}

export interface DeleteTimeTablePayload {
  shiftNo: string;
  day: string;
  branch: string;
  year: string;
  semister: string;
  section: string;
  stream: string;
  frrom_To_Periods: string;
  subcode: string;
  proc_type?: string;
  wdate: string;
}

/**
 * GET /api/TimeTable/departments
 */
export const getTimeTableDepartments = async (): Promise<
  TimeTableDepartment[]
> => {
  try {
    const response = await axios.get(`${API_BASE}TimeTable/departments`);
    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching TimeTable departments:", error);
    return [];
  }
};

/**
 * POST /api/TimeTable/subjects
 */
export const getTimeTableSubjects = async (payload: {
  acdYr: string;
  programme: string;
  branch: string;
  year: string;
  semister: string;
  stream: string;
  periodType: string;
  lecturer?: string;
  regu: string;
  subtype?: string;
}): Promise<TimeTableSubject[]> => {
  try {
    const response = await axios.post(`${API_BASE}TimeTable/subjects`, payload);
    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching TimeTable subjects:", error);
    return [];
  }
};

/**
 * POST /api/TimeTable/lecturers
 */
export const getTimeTableLecturers = async (payload: {
  programme: string;
  year: string;
  semister: string;
  subcode: string;
  department?: string;
}): Promise<TimeTableLecturer[]> => {
  try {
    const response = await axios.post(
      `${API_BASE}TimeTable/lecturers`,
      payload,
    );
    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching TimeTable lecturers:", error);
    return [];
  }
};

/**
 * POST /api/TimeTable/view
 */
export const getTimeTableView = async (payload: {
  shiftNo: string;
  programme: string;
  branch: string;
  year: string;
  semister: string;
  section: string;
  stream: string;
  acdYr: string;
}): Promise<TimeTableViewRow[]> => {
  try {
    const response = await axios.post(`${API_BASE}TimeTable/view`, payload);
    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching TimeTable view:", error);
    return [];
  }
};

/**
 * POST /api/TimeTable/save
 */
export const saveTimeTable = async (payload: SaveTimeTablePayload) => {
  try {
    const response = await axios.post(`${API_BASE}TimeTable/save`, payload);
    return response.data;
  } catch (error) {
    console.error("Error saving TimeTable:", error);
    throw error;
  }
};

/**
 * POST /api/TimeTable/delete
 */
export const deleteTimeTable = async (payload: DeleteTimeTablePayload) => {
  try {
    const response = await axios.post(`${API_BASE}TimeTable/delete`, {
      ...payload,
      proc_type: "TT", // static for every delete
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting TimeTable:", error);
    throw error;
  }
};

/* ==========================================================================
   5. BATCH DELETE APIS
   ========================================================================== */

export interface BatchDeletePeriodLoadPayload {
  shift?: string;
  programme: string;
  branch: string;
  sYear: string;
  semester: string;
  stream?: string;
  section: string;
  day: string;
  academicYear: string;
}

export interface BatchDeleteFacultyPayload {
  day: string;
  programme: string;
  branch: string;
  sYear: string;
  section: string;
  semester: string;
  academicYear: string;
  period: string;
}

export interface BatchDeleteStudentsGridPayload {
  day: string;
  programme: string;
  branch: string;
  sYear: string;
  section: string;
  semester: string;
  lecturer?: string;
  academicYear: string;
  period?: string;
}

export interface DeleteBatchPayload {
  day: string;
  programme: string;
  branch: string;
  sYear: string;
  section: string;
  semester: string;
  lecturer: string;
  academicYear: string;
  userId: string;
  period: string;
}

/**
 * POST /api/BatchDelete/period-load
 */
export const loadBatchDeletePeriods = async (
  payload: BatchDeletePeriodLoadPayload,
) => {
  try {
    const response = await axios.post(`${API_BASE}BatchDelete/period-load`, {
      shift: payload.shift || "1",
      stream: payload.stream || "1",
      ...payload,
    });
    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data?.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data;
  } catch (error) {
    console.error("Error loading BatchDelete periods:", error);
    return [];
  }
};

/**
 * POST /api/BatchDelete/faculty
 */
export const loadBatchDeleteFaculty = async (
  payload: BatchDeleteFacultyPayload,
) => {
  try {
    const response = await axios.post(
      `${API_BASE}BatchDelete/faculty`,
      payload,
    );
    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data?.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data;
  } catch (error) {
    console.error("Error loading BatchDelete faculty:", error);
    return [];
  }
};

/**
 * POST /api/BatchDelete/batch-students
 */
export const loadBatchDeleteStudents = async (
  payload: BatchDeleteStudentsGridPayload,
) => {
  try {
    const response = await axios.post(`${API_BASE}BatchDelete/batch-students`, {
      lecturer: payload.lecturer || "",
      period: payload.period || "",
      ...payload,
    });
    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data?.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data;
  } catch (error) {
    console.error("Error loading BatchDelete students grid:", error);
    return [];
  }
};

/**
 * POST /api/BatchDelete/delete-batch
 */
export const deleteBatchApi = async (payload: DeleteBatchPayload) => {
  try {
    const response = await axios.post(
      `${API_BASE}BatchDelete/delete-batch`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting batch:", error);
    throw error;
  }
};

/* ==========================================================================
   5. ADD ATTENDANCE
   ========================================================================== */

export interface AddAttendanceListPayload {
  semister: string;
  programme: string;
  branch: string;
  year: string;
  section: string;
  academicYear: string;
  fPerc: string;
  tPerc: string;
}

export interface AddAttendanceStudentItem {
  REGNO?: string;
  RegistrationNo?: string;
  REGISTRATIONNO?: string;
  regNo?: string;
  regno?: string;
  HTNO?: string;
  TH?: number | string;
  TotalClasses?: number | string;
  TOTAL_CLASSES?: number | string;
  TOTALCLASSES?: number | string;
  total?: number | string;
  totalClasses?: number | string;
  TP?: number | string;
  PresentClasses?: number | string;
  PRESENT_CLASSES?: number | string;
  PRESENTCLASSES?: number | string;
  present?: number | string;
  presentClasses?: number | string;
  perc?: number | string;
  TCLASS?: number | string;
  PresentPercentage?: number | string;
  PRESENT_PERCENTAGE?: number | string;
  PRESENTPERCENTAGE?: number | string;
  percentage?: number | string;
  presentPct?: number | string;
  TA?: number | string;
  [key: string]: any;
}

/**
 * POST /api/AddAttendance/attendance-list
 * Loads 1st grid of students matching percentage range and criteria
 */
export const loadAddAttendanceList = async (
  payload: AddAttendanceListPayload,
): Promise<AddAttendanceStudentItem[]> => {
  try {
    const params = {
      ...payload,
      PROGRAMME: payload.programme,
      BRANCH: payload.branch,
      YEAR: payload.year,
      SEMISTER: payload.semister,
      SEMESTER: payload.semister,
      SECTION: payload.section,
      ACADEMICYEAR: payload.academicYear,
      FPERC: payload.fPerc,
      TPERC: payload.tPerc,
      fperc: payload.fPerc,
      tperc: payload.tPerc,
    };

    console.log("POST /api/AddAttendance/attendance-list payload:", payload);
    const response = await axios.post(
      `${API_BASE}AddAttendance/attendance-list`,
      payload,
      { params },
    );
    console.log(
      "POST /api/AddAttendance/attendance-list response:",
      response.data,
    );

    let resData = response.data;
    if (typeof resData === "string") {
      try {
        resData = JSON.parse(resData);
      } catch {}
    }

    if (resData?.success && Array.isArray(resData.data)) {
      return resData.data;
    }
    if (Array.isArray(resData?.data)) {
      return resData.data;
    }
    if (Array.isArray(resData)) {
      return resData;
    }
    if (Array.isArray(resData?.result)) {
      return resData.result;
    }
    if (Array.isArray(resData?.records)) {
      return resData.records;
    }
    if (Array.isArray(resData?.students)) {
      return resData.students;
    }
    if (Array.isArray(resData?.attendanceList)) {
      return resData.attendanceList;
    }
    if (Array.isArray(resData?.studentList)) {
      return resData.studentList;
    }
    if (Array.isArray(resData?.list)) {
      return resData.list;
    }
    return [];
  } catch (error) {
    console.error("Error loading AddAttendance attendance-list:", error);
    throw error;
  }
};

export interface StudentAbsSubjectsPayload {
  programme: string;
  branch: string;
  year: string;
  semister: string;
  section: string;
  regno: string;
  subcode: string;
}

export interface StudentAbsSubjectItem {
  SUBJECTCODE?: string;
  SUB_CODE?: string;
  subcode?: string;
  subCode?: string;
  code?: string;
  SUBJECTNAME?: string;
  subjectName?: string;
  name?: string;
  [key: string]: any;
}

/**
 * POST /api/AddAttendance/student-abs-subjects
 * Loads subjects that the student was absent in (for 2nd table dropdown)
 */
export const loadStudentAbsSubjects = async (
  payload: StudentAbsSubjectsPayload,
): Promise<StudentAbsSubjectItem[]> => {
  try {
    const params = {
      ...payload,
      PROGRAMME: payload.programme,
      BRANCH: payload.branch,
      YEAR: payload.year,
      SEMISTER: payload.semister,
      SEMESTER: payload.semister,
      SECTION: payload.section,
      REGNO: payload.regno,
      SUBCODE: payload.subcode,
    };
    const response = await axios.post(
      `${API_BASE}AddAttendance/student-abs-subjects`,
      payload,
      { params },
    );

    let resData = response.data;
    if (typeof resData === "string") {
      try {
        resData = JSON.parse(resData);
      } catch {}
    }

    if (resData?.success && Array.isArray(resData.data)) {
      return resData.data;
    }
    if (Array.isArray(resData?.data)) {
      return resData.data;
    }
    if (Array.isArray(resData)) {
      return resData;
    }
    if (Array.isArray(resData?.result)) {
      return resData.result;
    }
    if (Array.isArray(resData?.subjects)) {
      return resData.subjects;
    }
    if (Array.isArray(resData?.list)) {
      return resData.list;
    }
    return [];
  } catch (error) {
    console.error("Error loading AddAttendance student-abs-subjects:", error);
    throw error;
  }
};

export interface StudentAbsentDetailsPayload {
  programme: string;
  branch: string;
  year: string;
  semister: string;
  section: string;
  regno: string;
  subcode: string;
  academicYear: string;
}

export interface StudentAbsentDetailItem {
  AID?: number | string;
  ADATE?: string;
  ENTRYDATE?: string;
  date?: string;
  Date?: string;
  DATE?: string;
  ATTDATE?: string;
  ASUBJECT?: string;
  Subject?: string;
  subject?: string;
  SUBJECT?: string;
  subcode?: string;
  subCode?: string;
  SUB_CODE?: string;
  FACULTYID?: string;
  FACULTYNAME?: string;
  FACULTY?: string;
  Faculty?: string;
  faculty?: string;
  lecturer?: string;
  PEROID?: string | number;
  PERIOD_RANGE?: string | number;
  PERIOD?: string | number;
  Period?: string | number;
  period?: string | number;
  STATUS?: string;
  Status?: string;
  status?: string;
  att?: string;
  ATT?: string;
  selected?: boolean;
  [key: string]: any;
}

/**
 * POST /api/AddAttendance/student-absent-details
 * Loads 2nd grid of absent periods for the selected student
 */
export const loadStudentAbsentDetails = async (
  payload: StudentAbsentDetailsPayload,
): Promise<StudentAbsentDetailItem[]> => {
  try {
    const params = {
      ...payload,
      PROGRAMME: payload.programme,
      BRANCH: payload.branch,
      YEAR: payload.year,
      SEMISTER: payload.semister,
      SEMESTER: payload.semister,
      SECTION: payload.section,
      REGNO: payload.regno,
      SUBCODE: payload.subcode,
      ACADEMICYEAR: payload.academicYear,
    };
    const response = await axios.post(
      `${API_BASE}AddAttendance/student-absent-details`,
      payload,
      { params },
    );

    let resData = response.data;
    if (typeof resData === "string") {
      try {
        resData = JSON.parse(resData);
      } catch {}
    }

    if (resData?.success && Array.isArray(resData.data)) {
      return resData.data;
    }
    if (Array.isArray(resData?.data)) {
      return resData.data;
    }
    if (Array.isArray(resData)) {
      return resData;
    }
    if (Array.isArray(resData?.result)) {
      return resData.result;
    }
    if (Array.isArray(resData?.absentDetails)) {
      return resData.absentDetails;
    }
    if (Array.isArray(resData?.details)) {
      return resData.details;
    }
    if (Array.isArray(resData?.list)) {
      return resData.list;
    }
    return [];
  } catch (error) {
    console.error("Error loading AddAttendance student-absent-details:", error);
    throw error;
  }
};

export interface SaveAddAttendanceAbsenceItem {
  date: string;
  faculty: string;
  subcode: string;
  period: string;
  selected: boolean;
}

export interface SaveAddAttendancePayload {
  id?: string;
  regno: string;
  programme: string;
  branch: string;
  year: string;
  semister: string;
  section: string;
  academicYear: string;
  userId: string;
  fPerc: string;
  tPerc: string;
  absenceItems: SaveAddAttendanceAbsenceItem[];
}

/**
 * POST /api/AddAttendance/save-add-attendance
 * Saves added attendance records for student
 */
export const saveAddAttendanceApi = async (
  payload: SaveAddAttendancePayload,
) => {
  try {
    const response = await axios.post(
      `${API_BASE}AddAttendance/save-add-attendance`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error saving AddAttendance:", error);
    throw error;
  }
};

/* ==========================================================================
   EDIT EFRM DATE APIS
   ========================================================================== */

export interface EditEFRMProgrammeItem {
  Coursecode?: string;
  Course?: string;
  [key: string]: any;
}

export interface EditEFRMBranchItem {
  Branchcode?: string;
  BranchName?: string;
  [key: string]: any;
}

export interface EditEFRMYearItem {
  ID?: string;
  DATA?: string;
  [key: string]: any;
}

export interface EditEFRMSectionItem {
  Section?: string;
  [key: string]: any;
}

export interface EditEFRMPeriodItem {
  Shift?: string;
  day?: string;
  Programme?: string;
  Branch?: string;
  Section?: string;
  Semister?: number | string;
  FRM_TO_PERIODS?: string;
  stream?: string;
  cnt?: number;
  [key: string]: any;
}

export interface EditEFRMTimeTableItem {
  Course?: string;
  Branch?: string;
  year?: number | string;
  Sem?: number | string;
  Section?: string;
  Day?: string;
  Lecturer?: string;
  Sub_Code?: string;
  FRM_TO_PERIODS?: string;
  EFRMDate?: string;
  [key: string]: any;
}

export interface EditEFRMSectionsPayload {
  academicYear: string;
  programme: string;
  branch: string;
  sYear: string;
  semester: string;
}

export interface EditEFRMPeriodLoadPayload {
  shift: string;
  stream: string;
  academicYear: string;
  programme: string;
  branch: string;
  sYear: string;
  semester: string;
  section: string;
  day: string;
}

export interface EditEFRMTimeTableDataPayload {
  shift: string;
  stream: string;
  academicYear: string;
  programme: string;
  branch: string;
  sYear: string;
  semester: string;
  section: string;
  day: string;
  periodFrom: string;
}

export interface UpdateEFromDatePayload {
  shift: string;
  stream: string;
  academicYear: string;
  programme: string;
  branch: string;
  sYear: string;
  semester: string;
  section: string;
  day: string;
  periodFrom: string;
  newEFromDate: string;
  userId: string;
}

/**
 * GET /api/EditEFRMDate/programmes
 */
export const getEditEFRMProgrammes = async (
  acdYr: string,
): Promise<EditEFRMProgrammeItem[]> => {
  try {
    const response = await axios.get(
      `${API_BASE}EditEFRMDate/programmes?acdYr=${encodeURIComponent(acdYr)}`,
    );
    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching EditEFRMDate programmes:", error);
    return [];
  }
};

/**
 * GET /api/EditEFRMDate/branches
 */
export const getEditEFRMBranches = async (
  programme: string,
  acdYr: string,
): Promise<EditEFRMBranchItem[]> => {
  try {
    const response = await axios.get(
      `${API_BASE}EditEFRMDate/branches?programme=${encodeURIComponent(
        programme,
      )}&acdYr=${encodeURIComponent(acdYr)}`,
    );
    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching EditEFRMDate branches:", error);
    return [];
  }
};

/**
 * GET /api/EditEFRMDate/years
 */
export const getEditEFRMYears = async (
  programme: string,
  academicYear: string,
): Promise<EditEFRMYearItem[]> => {
  try {
    const response = await axios.get(
      `${API_BASE}EditEFRMDate/years?programme=${encodeURIComponent(
        programme,
      )}&academicYear=${encodeURIComponent(academicYear)}`,
    );
    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching EditEFRMDate years:", error);
    return [];
  }
};

/**
 * POST /api/EditEFRMDate/sections
 */
export const getEditEFRMSections = async (
  payload: EditEFRMSectionsPayload,
): Promise<EditEFRMSectionItem[]> => {
  try {
    const response = await axios.post(
      `${API_BASE}EditEFRMDate/sections`,
      payload,
    );
    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching EditEFRMDate sections:", error);
    return [];
  }
};

/**
 * POST /api/EditEFRMDate/period-load
 */
export const getEditEFRMPeriods = async (
  payload: EditEFRMPeriodLoadPayload,
): Promise<EditEFRMPeriodItem[]> => {
  try {
    const response = await axios.post(
      `${API_BASE}EditEFRMDate/period-load`,
      payload,
    );
    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching EditEFRMDate periods:", error);
    return [];
  }
};

/**
 * POST /api/EditEFRMDate/timetable-data
 */
export const getEditEFRMTimeTableData = async (
  payload: EditEFRMTimeTableDataPayload,
): Promise<EditEFRMTimeTableItem[]> => {
  try {
    const response = await axios.post(
      `${API_BASE}EditEFRMDate/timetable-data`,
      payload,
    );
    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching EditEFRMDate timetable-data:", error);
    return [];
  }
};

/**
 * POST /api/EditEFRMDate/update-efromdate
 */
export const updateEditEFRMDateApi = async (
  payload: UpdateEFromDatePayload,
) => {
  try {
    const response = await axios.post(
      `${API_BASE}EditEFRMDate/update-efromdate`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating EditEFRMDate:", error);
    throw error;
  }
};

// =================== Batches APIs ====================

export interface BatchProgrammeItem {
  Coursecode?: string;
  Course?: string;
  courseCode?: string;
  course?: string;
  [key: string]: any;
}

export interface BatchBranchItem {
  Branchcode?: string;
  BranchName?: string;
  branchCode?: string;
  branchName?: string;
  [key: string]: any;
}

export interface BatchYearItem {
  ID?: string;
  DATA?: string;
  id?: string;
  data?: string;
  [key: string]: any;
}

export interface BatchSectionItem {
  Section?: string;
  section?: string;
  [key: string]: any;
}

export interface BatchPeriodItem {
  Shift?: string;
  day?: string;
  Programme?: string;
  Branch?: string;
  Section?: string;
  Semister?: number;
  FRM_TO_PERIODS?: string;
  stream?: string;
  cnt?: number;
  [key: string]: any;
}

export interface BatchSubjectItem {
  SUB_CODE?: string;
  Subject?: string;
  subCode?: string;
  subject?: string;
  [key: string]: any;
}

export interface BatchLecturerItem {
  Fname?: string;
  lecturer?: string;
  fname?: string;
  [key: string]: any;
}

export interface BatchStudentItem {
  studentserialno?: string;
  RegistrationNo?: string;
  SName?: string;
  FacultyID?: string | null;
  Shift?: string | null;
  CourseCode?: string | null;
  BranchCode?: string | null;
  SYear?: string | null;
  Semister?: number | null;
  Section?: string | null;
  Day?: string | null;
  SUB_CODE?: string | null;
  Period_Range?: string | null;
  EntryDate?: string | null;
  UpdatedDate?: string | null;
  AcadamicYear?: string | null;
  id?: string | null;
  xNO?: number;
  IsActive?: string;
  StudentActive?: boolean;
  selected?: boolean;
  [key: string]: any;
}

export interface BatchPeriodLoadPayload {
  academicYear: string;
  shift: string;
  programme: string;
  branch: string;
  sYear: string;
  semester: string;
  stream: string;
  section: string;
  day: string;
}

export interface BatchSubjectsPayload {
  academicYear: string;
  shift: string;
  programme: string;
  branch: string;
  sYear: string;
  semester: string;
  stream: string;
  section: string;
  day: string;
  periodRange: string;
}

export interface BatchLecturersPayload {
  academicYear: string;
  shift: string;
  programme: string;
  branch: string;
  sYear: string;
  semester: string;
  stream: string;
  section: string;
  day: string;
  subjects: string;
  periodRange: string;
}

export interface BatchStudentsPayload {
  programme: string;
  branch: string;
  sYear: string;
  semester: string;
  section: string;
  stream: string;
  day: string;
  periodRange: string;
  academicYear: string;
  subjects: string;
  lecturer: string;
  isLecturerView?: boolean;
}

export interface SaveBatchStudentItemPayload {
  regNo: string;
  sName: string;
  selected: boolean;
}

export interface SaveBatchStudentsPayload {
  lecturer: string;
  shift: string;
  programme: string;
  branch: string;
  sYear: string;
  semester: string;
  section: string;
  stream?: string;
  day: string;
  periodFrom?: string;
  subjects: string;
  periodRange: string;
  academicYear: string;
  students: SaveBatchStudentItemPayload[];
}

export const getBatchProgrammes = async (
  acdYr?: string,
): Promise<BatchProgrammeItem[]> => {
  try {
    const response = await axios.get(`${API_BASE}Batches/programmes`, {
      params: { acdYr },
    });
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching batch programmes:", error);
    throw error;
  }
};

export const getBatchBranches = async (
  programme: string,
  acdYr?: string,
): Promise<BatchBranchItem[]> => {
  try {
    const response = await axios.get(`${API_BASE}Batches/branches`, {
      params: { programme, acdYr },
    });
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching batch branches:", error);
    throw error;
  }
};

export const getBatchYears = async (
  programme: string,
  academicYear?: string,
): Promise<BatchYearItem[]> => {
  try {
    const response = await axios.get(`${API_BASE}Batches/years`, {
      params: { programme, academicYear },
    });
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching batch years:", error);
    throw error;
  }
};

export const getBatchSections = async (payload: {
  academicYear: string;
  programme: string;
  sYear: string;
  semester: string;
  branch: string;
}): Promise<BatchSectionItem[]> => {
  try {
    const response = await axios.post(`${API_BASE}Batches/sections`, payload);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching batch sections:", error);
    throw error;
  }
};

export const getBatchPeriodLoad = async (
  payload: BatchPeriodLoadPayload,
): Promise<BatchPeriodItem[]> => {
  try {
    const response = await axios.post(
      `${API_BASE}Batches/period-load`,
      payload,
    );
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching batch period load:", error);
    throw error;
  }
};

export const getPeriods = getBatchPeriodLoad;

export const getBatchSubjects = async (
  payload: BatchSubjectsPayload,
): Promise<BatchSubjectItem[]> => {
  try {
    const response = await axios.post(`${API_BASE}Batches/subjects`, payload);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching batch subjects:", error);
    throw error;
  }
};

export const getBatchLecturers = async (
  payload: BatchLecturersPayload,
): Promise<BatchLecturerItem[]> => {
  try {
    const response = await axios.post(`${API_BASE}Batches/lecturers`, payload);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching batch lecturers:", error);
    throw error;
  }
};

export const getBatchStudents = async (
  payload: BatchStudentsPayload,
): Promise<BatchStudentItem[]> => {
  try {
    const response = await axios.post(`${API_BASE}Batches/students`, payload);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching batch students:", error);
    throw error;
  }
};

export const saveBatchStudents = async (
  payload: SaveBatchStudentsPayload,
): Promise<any> => {
  try {
    const response = await axios.post(
      `${API_BASE}Batches/save-batch-students`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error saving batch students:", error);
    throw error;
  }
};

// =================== Timetable Extra Hours APIs ====================

export interface ExtraCourseItem {
  CourseCode?: string;
  COURSE?: string;
  courseCode?: string;
  course?: string;
  [key: string]: any;
}

export interface ExtraBranchItem {
  BranchCode?: string;
  BRANCHNAME?: string;
  branchCode?: string;
  branchName?: string;
  [key: string]: any;
}

export interface ExtraYearItem {
  ID?: string;
  DATA?: string;
  id?: string;
  data?: string;
  [key: string]: any;
}

export interface ExtraDepartmentItem {
  DepartmentCode?: string;
  Department?: string;
  departmentCode?: string;
  department?: string;
  [key: string]: any;
}

export interface ExtraSubjectItem {
  SUBJECTCODE?: string;
  SUBJECTNAME?: string;
  SubjectCode?: string;
  SubjectName?: string;
  Pap_order?: number;
  subtype?: string | null;
  [key: string]: any;
}

export interface ExtraLecturerItem {
  EmpID?: string;
  Fname?: string;
  FName1?: string;
  empId?: string;
  fname?: string;
  [key: string]: any;
}

export interface ExtraTimetableItem {
  id?: number | string;
  EDATE?: string;
  Shift?: string;
  Day?: string;
  Programme?: string;
  Branch?: string;
  Year?: number | string;
  Semister?: number | string;
  Section?: string;
  Period?: number | string;
  Subject?: string;
  Department?: string;
  Lecturer?: string;
  Stream?: string;
  SPTime?: string;
  EPTime?: string;
  Period_type?: string;
  FRM_TO_PERIODS?: string;
  SUB_CODE?: string;
  [key: string]: any;
}

export interface ExtraSubjectPayload {
  programme: string;
  branch: string;
  year: string;
  semister: string;
  stream: string;
  periodType: string;
  lecturer?: string;
  regu?: string;
  subtype?: string;
  acdYr?: string;
}

export interface ExtraLecturerPayload {
  department?: string;
  year: string;
  semister: string;
  subcode: string;
  programme: string;
}

export interface ExtraTimingsPayload {
  shiftNo: string;
  programme: string;
  period?: string;
  toperiod?: string;
  year: string;
}

export interface ExtraViewPayload {
  year: string;
  semister: string;
  branch: string;
  stream: string;
  section: string;
  shiftNo: string;
  programme: string;
}

export interface ExtraSavePayload {
  id?: string;
  wdate: string;
  shiftNo: string;
  day: string;
  programme: string;
  branch: string;
  year: string;
  semister: string;
  stream: string;
  section: string;
  subject: string;
  subcode: string;
  department: string;
  lecturer: string;
  spTime: string;
  periodType: string;
  epTime?: string;
}

export const getExtraCourses = async (
  acdYr?: string,
): Promise<ExtraCourseItem[]> => {
  try {
    const response = await axios.get(
      `${API_BASE}Timetable_Extrahours/courses`,
      {
        params: { acdYr },
      },
    );
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching extra timetable courses:", error);
    throw error;
  }
};

export const getExtraBranches = async (
  programme: string,
  acdYr?: string,
): Promise<ExtraBranchItem[]> => {
  try {
    const response = await axios.get(
      `${API_BASE}Timetable_Extrahours/branches`,
      {
        params: { programme, acdYr },
      },
    );
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching extra timetable branches:", error);
    throw error;
  }
};

export const getExtraYears = async (
  programme: string,
  academicYear?: string,
): Promise<ExtraYearItem[]> => {
  try {
    const response = await axios.get(`${API_BASE}Timetable_Extrahours/years`, {
      params: { programme, academicYear },
    });
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching extra timetable years:", error);
    throw error;
  }
};

export const getExtraDepartments = async (): Promise<ExtraDepartmentItem[]> => {
  try {
    const response = await axios.get(
      `${API_BASE}Timetable_Extrahours/departments`,
    );
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching extra timetable departments:", error);
    throw error;
  }
};

export const getExtraPeriods = async (
  programme?: string,
  year?: string,
): Promise<any[]> => {
  try {
    const response = await axios.get(
      `${API_BASE}Timetable_Extrahours/periods`,
      {
        params: { programme, year },
      },
    );
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching extra timetable periods:", error);
    throw error;
  }
};

export const getExtraFacultyDept = async (
  lecturer: string,
): Promise<string> => {
  try {
    const response = await axios.get(
      `${API_BASE}Timetable_Extrahours/faculty-dept`,
      { params: { lecturer } },
    );
    const data = response.data?.data || response.data;
    if (Array.isArray(data) && data.length > 0) {
      return String(data[0]?.DEPT ?? data[0]?.dept ?? "").trim();
    }
    return "";
  } catch (error) {
    console.error("Error fetching faculty department:", error);
    return "";
  }
};

export const getExtraSections = async (payload: {
  acdYr: string;
  programme: string;
  branch: string;
  year: string;
  semister: string;
}): Promise<any[]> => {
  try {
    const response = await axios.post(
      `${API_BASE}Timetable_Extrahours/sections`,
      payload,
    );
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching extra timetable sections:", error);
    throw error;
  }
};

export const getExtraSubjects = async (
  payload: ExtraSubjectPayload,
): Promise<ExtraSubjectItem[]> => {
  try {
    const response = await axios.post(
      `${API_BASE}Timetable_Extrahours/subjects`,
      payload,
    );
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching extra timetable subjects:", error);
    throw error;
  }
};

export const getExtraLecturers = async (
  payload: ExtraLecturerPayload,
): Promise<ExtraLecturerItem[]> => {
  try {
    const response = await axios.post(
      `${API_BASE}Timetable_Extrahours/lecturers`,
      payload,
    );
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching extra timetable lecturers:", error);
    throw error;
  }
};

export const getExtraTimings = async (
  payload: ExtraTimingsPayload,
): Promise<any[]> => {
  try {
    const response = await axios.post(
      `${API_BASE}Timetable_Extrahours/timings`,
      payload,
    );
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching extra timetable timings:", error);
    throw error;
  }
};

export const viewTimeTableExtra = async (
  payload: ExtraViewPayload,
): Promise<ExtraTimetableItem[]> => {
  try {
    const response = await axios.post(
      `${API_BASE}Timetable_Extrahours/view-extra`,
      payload,
    );
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching extra timetable entries:", error);
    throw error;
  }
};

export const saveTimeTableExtra = async (
  payload: ExtraSavePayload,
): Promise<any> => {
  try {
    const response = await axios.post(
      `${API_BASE}Timetable_Extrahours/save-extra`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error saving extra timetable entry:", error);
    throw error;
  }
};

export const deleteTimeTableExtra = async (
  id: number | string,
): Promise<any> => {
  try {
    const response = await axios.delete(
      `${API_BASE}Timetable_Extrahours/delete-extra/${id}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting extra timetable entry:", error);
    throw error;
  }
};

// =============== Attendance by Admin ============

export interface AdminLecturerPayload {
  acdYr?: string;
  lecturer?: string;
  programme?: string;
  branch?: string;
  sYear?: string;
  semester?: string;
  section?: string;
  date?: string;
  subType?: string;
  shift?: string;
}

export interface AdminLecturerItem {
  LECTURER: string;
  FNAME: string;
}

export interface AdminPeriodsPayload {
  acdYr?: string;
  lecturer?: string;
  shift?: string;
  programme?: string;
  branch?: string;
  sYear?: string;
  semester?: string;
  section?: string;
  date?: string;
}

export interface AdminPeriodItem {
  FRM_TO_PERIODS: string;
  PROGRAMME?: string | null;
  BRANCH?: string | null;
  SUBJECTNAME?: string | null;
}

export interface AdminLoadStudentsPayload {
  lecturer?: string;
  period?: string;
  date?: string;
  academicYear?: string;
  programme?: string;
  branch?: string;
  sYear?: string;
  semester?: string;
  section?: string;
  isPractical?: boolean;
  srNo?: string;
  erNo?: string;
}

export interface AdminStudentAttendanceRecord {
  STUDENTSERIALNO?: string;
  REGISTRATIONNO?: string;
  SNAME?: string;
  SECTION?: string;
  SSEMESTER?: number | string;
  PARENTMBNO?: string;
  LE?: boolean;
  STATUS?: string | null;
  SDATE?: string | null;
  ATTDATE?: string | null;
  SUBTYPE?: string | null;
  PROGRAMME?: string;
  BRANCH?: string;
  SYEAR?: number | string;
  ROLLNO?: string;
  SUBJECTNAME?: string;
  SUB_CODE?: string;
  ATT?: string | null;
  DAYTAUGHT?: string | null;
  DD?: string | null;
  REMARKS?: string | null;
  SNO?: number;
  SLNO?: number;
}

export interface AdminStudentSubmissionItem {
  sNo: number;
  regNo: string | null;
  status: string | null;
  remarks: string;
}

export interface SaveAdminAttendancePayload {
  lecturer?: string;
  semester?: string;
  programme?: string;
  branch?: string;
  sYear?: string;
  section?: string;
  period?: string;
  subjects?: string;
  academicYear?: string;
  day?: string;
  date?: string;
  srNo?: string;
  erNo?: string;
  dayTaught?: string;
  attStat?: string;
  query?: string;
  periodRange?: string;
  tlm?: string;
  students?: AdminStudentSubmissionItem[];
}

export interface SaveAdminAttendancePermissionPayload {
  programme?: string;
  branch?: string;
  sYear?: string;
  section?: string;
  semester?: string;
  lecturer?: string;
  subject?: string;
  date?: string;
  acdYr?: string;
}

/**
 * GET /api/Admin_Attendance/tlm
 * Fetches Teaching Learning Methods
 */
export const getTLM = async (academicYearParam?: string) => {
  try {
    const year =
      academicYearParam || localStorage.getItem("academicYear") || "";
    const response = await axios.get(`${API_BASE}Admin_Attendance/tlm`, {
      params: {
        academicYear: year,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching TLM data:", error);
    throw error;
  }
};
export const getAdminAttendanceTLM = getTLM;

/**
 * POST /api/Admin_Attendance/lecturers
 * Loads lecturers list for AttendanceByAdmin form
 */
export const loadAdminAttendanceLecturers = async (
  payload: AdminLecturerPayload,
) => {
  try {
    const response = await axios.post(
      `${API_BASE}Admin_Attendance/lecturers`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error loading admin attendance lecturers:", error);
    throw error;
  }
};

/**
 * POST /api/Admin_Attendance/periods
 * Loads period options for selected lecturer and criteria
 */
export const loadAdminAttendancePeriods = async (
  payload: AdminPeriodsPayload,
) => {
  try {
    const response = await axios.post(
      `${API_BASE}Admin_Attendance/periods`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error loading admin attendance periods:", error);
    throw error;
  }
};
export const loadPeriods = loadAdminAttendancePeriods;

/**
 * POST /api/Admin_Attendance/students
 * Loads students roster grid
 */
export const loadAdminAttendanceStudents = async (
  payload: AdminLoadStudentsPayload,
) => {
  try {
    const response = await axios.post(
      `${API_BASE}Admin_Attendance/students`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error loading admin attendance students:", error);
    throw error;
  }
};

/**
 * POST /api/Admin_Attendance/save-subjectwise
 * Saves admin subject-wise attendance
 */
export const saveAdminAttendanceSubjectWise = async (
  payload: SaveAdminAttendancePayload,
) => {
  try {
    const response = await axios.post(
      `${API_BASE}Admin_Attendance/save-subjectwise`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error saving admin attendance:", error);
    throw error;
  }
};

/**
 * POST /api/Admin_Attendance/save-permissions
 * Saves admin attendance permissions
 */
export const saveAdminAttendancePermissions = async (
  payload: SaveAdminAttendancePermissionPayload,
) => {
  try {
    const response = await axios.post(
      `${API_BASE}Admin_Attendance/save-permissions`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error saving admin attendance permissions:", error);
    throw error;
  }
};

// ======================Edit Attendance APIs=====================
export const loadEditAttendanceTlm = async (academicYear: string) => {
  try {
    const response = await axios.get(`${API_BASE}Edit_Attendance/tlm`, {
      params: {
        academicYear: academicYear,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error loading edit attendance data:", error);
    throw error;
  }
};

export const loadEditAttendancePeriods = async (payload: any) =>{
  try{
    const response = await axios.post(`${API_BASE}Edit_Attendance/periods`, payload);
    return response.data;
  }catch(error){
    console.error("Error loading priods:", error)
    throw error;
  }
}

export const loadEditAttendanceLecturers = async (payload: any) => {
  try{
    const response = await axios.post(`${API_BASE}Edit_Attendance/lecturers`, payload);
    return response.data;
  }catch(error){
    console.error("Error laoding lecturers:", error)
    throw error;
  }
}

export const loadEditAttendanceOldLecturers = async (payload: any) =>{
  try{
    const response = await axios.post(`${API_BASE}Edit_Attendance/old-lecturers`, payload);
    return response.data;
  }catch(error){
    console.error("Error loading old lecturers:", error)
    throw error;  
  }
};

export const loadEditAttendanceStudents = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}Edit_Attendance/students`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error loading edit attendance students:", error);
    throw error;
  }
};

export const saveEditAttendanceSubjectWise = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}Edit_Attendance/save-subjectwise`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error saving edit attendance subject wise:", error);
    throw error;
  }
};