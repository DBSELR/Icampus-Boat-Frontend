import axios from "axios";
import { API_BASE } from "../config";

export interface AcademicYear {
  iD: number;
  aCADEMICYEAR: string;
  iSACTIVE: string;
  aY: string;
}

interface LoadAcademicYearSuccessResponse {
  success: true;
  data: AcademicYear[];
  message: string;
}

interface LoadAcademicYearErrorResponse {
  success: false;
  data: null;
  message: string;
  status?: number;
}

export type LoadAcademicYearResponse =
  | LoadAcademicYearSuccessResponse
  | LoadAcademicYearErrorResponse;

// ==============Financial Academic==================
export const loadAcademicYearsApi =
  async (): Promise<LoadAcademicYearResponse> => {
    try {
      const response = await axios.get(
        `${API_BASE}FinancialAcadamicYear/LoadData`,
      );

      return {
        success: true,
        data: response.data,
        message: "Academic Years loaded successfully.",
      };
    } catch (error: any) {
      console.error("Load Academic Year Error:", error);

      const message =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        "Failed to load Academic Years.";

      return {
        success: false,
        data: null,
        message,
        status: error.response?.status,
      };
    }
  };

export const saveFinancialAcademicYearApi = async (data: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}FinancialAcadamicYear/SaveFinancialAcadamicYear`,
      data,
    );

    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const deleteFinancialAcademicYearApi = async (payload: any) => {
  const response = await axios.post(
    `${API_BASE}FinancialAcadamicYear/DeleteFinancialAcademicYear`,
    payload,
  );

  return response.data;
};

export const updateFinancialAcademicYearStatusApi = async (payload: any) => {
  const response = await axios.post(
    `${API_BASE}FinancialAcadamicYear/ISActiveUpdate`,
    payload,
  );

  return response.data;
};

// ================Subject==============
export const getRegulationList = async () => {
  try {
    const response = await axios.get(
      `${API_BASE}SubjectsMaster/GetRegulationList`,
    );

    return response.data;
  } catch (error) {
    console.error("Get Regulation List Error:", error);

    throw error;
  }
};

export const getProgrammeLoad = async (academicYear: string) => {
  try {
    const response = await axios.post(
      `${API_BASE}SubjectsMaster/GetProgrammeLoad`,
      {
        academicYear: academicYear,
      },
    );
    return response.data;
  } catch (error) {
    console.error("Get Programme Load Error:", error);

    throw error;
  }
};

export const getBranchLoad = async (
  academicYear: string,
  courseCode: string,
) => {
  try {
    const response = await axios.post(
      `${API_BASE}SubjectsMaster/GetBranchLoad`,
      {
        academicYear: academicYear,
        programme: courseCode,
      },
    );

    return response.data;
  } catch (error) {
    console.error("Get Branch Load Error:", error);

    throw error;
  }
};

export const getYearList = async (academicYear: string, programme: string) => {
  try {
    const response = await axios.post(`${API_BASE}SubjectsMaster/GetYearList`, {
      academicYear: academicYear,
      programme: programme,
    });

    return response.data;
  } catch (error) {
    console.error("Get Year List Error:", error);

    throw error;
  }
};

export const saveSubjectMaster = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}SubjectsMaster/SaveSubjectMaster`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Save Subject API Error:", error);
    throw error;
  }
};

export const getSubjectList = async (payload: any) => {
  const response = await axios.post(
    `${API_BASE}SubjectsMaster/GetSubjectList`,
    payload,
  );

  return response.data;
};

export const deleteSubjectMaster = async (id: string) => {
  try {
    const response = await axios.post(
      `${API_BASE}SubjectsMaster/DeleteSubjectMaster`,
      {
        sid: String(id),
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Delete Subject API Error:", error);
    throw error;
  }
};

export const checkPaperOrder = async (payload: any) => {
  const response = await axios.post(
    `${API_BASE}SubjectsMaster/CheckPaperOrder`,
    payload,
  );

  return response.data;
};

// ================Faculty==================
export const getCourseList = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}FacultyMaster/GetCourseList`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Get Course List API Error:", error);
    throw error;
  }
};

export const getYearLists = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}FacultyMaster/GetYearList`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Get Course List API Error:", error);
    throw error;
  }
};

export const getDept = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}FacultyMaster/GetDept`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Get Department API Error:", error);
    throw error;
  }
};

export const getEmployeeList = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}FacultyMaster/GetEmployeeList`,
      payload,
    );

    return response.data;
  } catch (error) {
    console.error("Get Employee List API Error:", error);
    throw error;
  }
};

export const getSubjects = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}FacultyMaster/GetSubjects`,
      payload,
    );

    return response.data;
  } catch (error) {
    console.error("Get Subjects API Error:", error);
    throw error;
  }
};

export const getFaculty = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}FacultyMaster/GetFacultyList`,
      payload,
    );

    return response.data;
  } catch (error) {
    console.error("Get Subjects API Error:", error);
    throw error;
  }
};

export const saveFaculty = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}FacultyMaster/SaveFaculty`,
      payload,
    );

    return response.data;
  } catch (error) {
    console.error("Get Subjects API Error:", error);
    throw error;
  }
};

export const deleteFaculty = async (id: string) => {
  try {
    const response = await axios.delete(
      `${API_BASE}FacultyMaster/DeleteFaculty`,
      {
        params: {
          id,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Delete Faculty API Error:", error);
    throw error;
  }
};

// =======================User Access=================
export const getERPModulesList = async () => {
  try {
    const response = await axios.get(`${API_BASE}UserAccess/GetERPModulesList`);

    return response.data;
  } catch (error) {
    console.error("Get ERP Modules API Error:", error);
    throw error;
  }
};

export const getERPUserGroupList = async () => {
  try {
    const response = await axios.get(
      `${API_BASE}UserAccess/GetUserGroupsSettings`,
    );

    return response.data;
  } catch (error) {
    console.error("Get ERP Modules API Error:", error);
    throw error;
  }
};

export const getERPForms = async (payload: any) => {
  const response = await axios.post(
    `${API_BASE}UserAccess/GetERPFormsList`,
    payload,
  );

  return response.data;
};

export const getUserGroupMenuLoad = async (payload: any) => {
  const response = await axios.post(
    `${API_BASE}UserAccess/GetUserGroupMenuLoad`,
    payload,
  );

  return response.data;
};

export const saveUserAcces = async (payload: any) => {
  const response = await axios.post(
    `${API_BASE}UserAccess/SaveUserForms`,
    payload,
  );

  return response.data;
};

// ===============special access==================
export const getEmployess = async () => {
  try {
    const response = await axios.get(
      `${API_BASE}SpecialAccess/GetEmployeeList`,
    );

    return response.data;
  } catch (error) {
    console.error("Get ERP Modules API Error:", error);
    throw error;
  }
};

export const getSPAList = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}SpecialAccess/GetERP_SPA_List`,
      payload,
    );

    return response.data;
  } catch (error) {
    console.error("Get ERP Modules API Error:", error);
    throw error;
  }
};

export const saveSPAAccess = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}SpecialAccess/SaveSplAccess`,
      payload,
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Save Special Access API Error:",
      error?.response?.data || error,
    );

    throw error;
  }
};

// =====================AttendanceMaxDates==================
export const saveAttendanceMaxDates = async (payload: any) => {
  const response = await axios.post(
    `${API_BASE}AttendanceMaxDates/SaveAttendanceMaxDates`,
    payload,
  );

  return response.data;
};

export const loadAttendanceMaxDates = async (payload: {
  academicYear: string;
  course: string;
  year: string;
  sem: string;
}) => {
  try {
    const response = await axios.post(
      `${API_BASE}AttendanceMaxDates/LoadAttMaxDate`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Load Attendance Max Dates API Error:", error);
    throw error;
  }
};

// ===================== Internal Marks Allowed Date =====================
export const bindRegulation = async () => {
  try {
    const response = await axios.get(
      `${API_BASE}InternalMarksAllowedDate/BindRegu`,
    );

    return response.data;
  } catch (error) {
    console.error("Bind Regulation API Error:", error);
    throw error;
  }
};

export const saveInternalDates = async (payload: any) => {
  const response = await axios.post(
    `${API_BASE}InternalMarksAllowedDate/SaveInternalDates`,
    payload,
  );

  return response.data;
};

export const bindInternalDates = async (payload: any) => {
  const response = await axios.post(
    `${API_BASE}InternalMarksAllowedDate/BindInternalDates`,
    payload,
  );

  return response.data;
};

export const bindInternalDatesflag2 = async (payload: any) => {
  const response = await axios.post(
    `${API_BASE}InternalMarksAllowedDate/BindInternalDatesflag2`,
    payload,
  );

  return response.data;
};

// ===============Student Data Upload API======================
export const downloadStudentTemplate = () => {
  return axios.get(`${API_BASE}StudentDataUpload/DownloadFields`, {
    responseType: "blob",
  });
};

export const insertStudentData = async (file: File) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await axios.post(
    `${API_BASE}StudentDataUpload/InsertStudentData`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

export const getUploadedStudentData = async () => {
  const response = await axios.get(`${API_BASE}StudentDataUpload/UploadFile`);

  return response.data;
};

export const finalUpdateStudentData = async () => {
  const response = await axios.post(
    `${API_BASE}StudentDataUpload/FinalUpdationStudentData`,
  );

  return response.data;
};

// ===================Leave Type============
export const getLeaveTypeList = async () => {
  try {
    const response = await axios.get(`${API_BASE}LeaveType/GetLtypeList`);

    return response.data;
  } catch (error) {
    console.error("Get Leave Type List Error:", error);

    throw error;
  }
};

export const getLeavelLtypeList = async () => {
  try {
    const response = await axios.get(`${API_BASE}LeaveType/LoadAllLtypeList`);

    return response.data;
  } catch (error) {
    console.error("Get Leave Type List Error:", error);

    throw error;
  }
};

export const getLeaveStructureList = async () => {
  const response = await axios.get(`${API_BASE}LeaveType/LoadLSGrid`);

  return response.data;
};

export const saveLeaveType = async (data: any) => {
  const response = await axios.post(`${API_BASE}LeaveType/SaveLtype`, data);

  return response.data;
};

export const saveLeaveStructure = async (data: any) => {
  const response = await axios.post(`${API_BASE}LeaveType/SaveLStype`, data);

  return response.data;
};

// =====================Caste Master============================
export const getCasteMaster = async () => {
  try {
    const response = await axios.get(`${API_BASE}CasteMaster/GetCasteMaster`);

    return response.data;
  } catch (error) {
    console.error("Get Caste Master Error:", error);
    throw error;
  }
};

export const saveCaste = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}CasteMaster/SaveCaste`,
      payload,
    );

    return response.data;
  } catch (error) {
    console.error("Save Caste Error:", error);
    throw error;
  }
};

// ======================Sub caste Master======================
export const getLoadCaste = async () => {
  try {
    const response = await axios.get(`${API_BASE}CasteMaster/GetLoadCaste`);

    return response.data;
  } catch (error) {
    console.error("Get Load Caste Error:", error);
    throw error;
  }
};

export const getSubCasteMaster = async () => {
  try {
    const response = await axios.get(
      `${API_BASE}CasteMaster/GetSubCasteMaster`,
    );

    return response.data;
  } catch (error) {
    console.error("Get Sub Caste Master Error:", error);
    throw error;
  }
};

export const saveSubCaste = async (payload: any) => {
  const response = await axios.post(
    `${API_BASE}CasteMaster/SaveSubCaste`,
    payload,
  );

  return response.data;
};

// ==================Login status===================
export const getLoadEmpDept = async () => {
  const response = await axios.get(`${API_BASE}EMPDEPWISE/LoadEmpDept`);

  return response.data;
};

export const getDeptWiseDetails = async (payload: any) => {
  const response = await axios.post(
    `${API_BASE}EMPDEPWISE/Deptwisedetails`,
    payload,
  );

  return response.data;
};

export const updateLoginStatus = async (payload: any) => {
  const response = await axios.post(
    `${API_BASE}EMPDEPWISE/LoginStatus`,
    payload,
  );

  return response.data;
};

// ===========Form Registraion================
export const getLoadMenu = async () => {
  const response = await axios.get(`${API_BASE}FormRegistration/LoadMenuid`);

  return response.data;
};

export const loadSMenuId = async (payload: any) => {
  const respone = await axios.post(
    `${API_BASE}FormRegistration/LoadSmenuid`,
    payload,
  );
  return respone.data;
};

export const loadFRData = async (payload: any) => {
  const response = await axios.post(
    `${API_BASE}FormRegistration/LoadFRData`,
    payload,
  );
  return response.data;
};

export const saveFormReg = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}FormRegistration/SaveFormReg`,
      payload,
    );

    return response.data;
  } catch (error) {
    console.error("Save Form Registration API Error:", error);
    throw error;
  }
};

// ==============Holidays==================
export const getHolidays = async (payload: { academicYear: string | null }) => {
  try {
    const response = await axios.post(
      `${API_BASE}Holidays/LoadHolidaysList`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Get Holidays API Error:", error);
    return [];
  }
};

export const insertSundays = async (payload: any) => {
  const response = await axios.post(
    `${API_BASE}Holidays/InsertSundays`,
    payload,
  );

  return response.data;
};

export const deleteHoliday = async (id: string | number) => {
  const response = await axios.post(`${API_BASE}Holidays/DeleteHolidaysList`, {
    id: id,
  });

  return response.data;
};

// ================SMS Settings===================
export const getSMSSettingsList = async () => {
  const response = await axios.get(`${API_BASE}SMSSettings/GetSMSSettingsList`);

  return response.data;
};

export const saveSMSSettings = async (payload: any) => {
  const response = await axios.post(
    `${API_BASE}SMSSettings/SaveSMSSettings`,
    payload,
  );

  return response.data;
};

// ==============Feedback================
export const getEmployeeDetails = async (empId: string) => {
  const response = await axios.post(
    `${API_BASE}FeedBackEmployee/GetEmployeeDetails`,
    {
      empId: empId,
    },
  );

  return response.data;
};

export const saveFeedBackReg = async (payload: any) => {
  const response = await axios.post(
    `${API_BASE}FeedBackEmployee/SaveFeedBackReg`,
    payload,
  );

  return response.data;
};

export const getUserName = async (userId: string) => {
  const response = await axios.post(`${API_BASE}ResetPassword/GetUserName`, {
    userId: userId,
  });

  return response.data;
};

export const resetPassword = async (userId: string, resetPword: string) => {
  const response = await axios.post(`${API_BASE}ResetPassword/ResetPassword`, {
    userId: userId,
    resetPword: resetPword,
  });

  return response.data;
};

// ================Category modes==============
export const getCasteList = async () => {
  const response = await axios.get(`${API_BASE}CategoryofAdmission/CasteLoad`);

  return response.data;
};

export interface CategoryItem {
  id: string;
  caste: string;
  categoryCode: string;
  category: string;
  academicYear: string;
}

export const loadCategory = async (): Promise<CategoryItem[]> => {
  const response = await axios.post<CategoryItem[]>(
    `${API_BASE}CategoryofAdmission/LoadCategory`,
    {
      id: "",
      caste: "",
      categorycode: "",
      category: "",
      academicyear: "2025-2026",
    },
  );

  return response.data;
};

export const saveCategory = async (payload: any) => {
  const response = await axios.post(
    `${API_BASE}CategoryofAdmission/CategorySave`,
    payload,
  );

  return response.data;
};

export const deleteCategory = async (id: string) => {
  const response = await axios.post(
    `${API_BASE}CategoryofAdmission/CategoryDelete`,
    {
      id: id,
    },
  );

  return response.data;
};

// ===================== User Group =====================
export const fetchDept = async () => {
  try {
    const response = await axios.get(
      `${API_BASE}UserGroup/GetERPDepartmentsList`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
};

export const fetchUsergroup = async () => {
  try {
    const response = await axios.get(`${API_BASE}UserGroup/GetUserGroups`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user groups:", error);
    throw error;
  }
};

export const fetchUserGroupEmpList = async (Dept: string) => {
  try {
    const response = await axios.post(`${API_BASE}UserGroup/GetEmployeesList`, {
      Dept: Dept,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching Emp List", error);
    throw error;
  }
};

export const updateUserGroups = async (UserGroup: string, EmpID: string) => {
  try {
    const response = await axios.post(`${API_BASE}UserGroup/UpdateUGDataEmp`, {
      UserGroupVal: UserGroup,
      EmpID: EmpID,
    });
    return response.data;
  } catch (error) {
    console.error("Error Saving  UserGroups", error);
    throw error;
  }
};

// ===================== Regu Master =====================
export const fetchRegulation = async () => {
  try {
    const response = await axios.get(
      `${API_BASE}ReguMaster/GetRegulationMaster`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching Regulations:", error);
    throw error;
  }
};

export const saveRegu = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}ReguMaster/SaveRegulationMaster`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error Saving  Regulations", error);
    throw error;
  }
};

// ============Category master==============
export const loadCategoryMaster = async () => {
  try {
    const response = await axios.get(`${API_BASE}CategoryMaster/LoadCategory`);

    return response.data;
  } catch (error) {
    console.error("Load Category Master Error:", error);
    throw error;
  }
};

export const saveCategoryMaster = async (payload: any) => {
  const response = await axios.post(
    `${API_BASE}CategoryMaster/SaveCategory`,
    payload,
  );

  return response.data;
};

// ===========Teaching Learning Methods=================
export const getTeachingLearningMenthods = async () => {
  const response = await axios.get(
    `${API_BASE}TeachingLearningMethods/LoadGridData`,
  );
  return response.data;
};

export const checkTLMExisted = async (data: any) => {
  const response = await axios.post(
    `${API_BASE}TeachingLearningMethods/CheckTLMExisted`,
    data,
  );
  return response.data;
};

export const saveTLM = async (data: any) => {
  const response = await axios.post(
    `${API_BASE}TeachingLearningMethods/SaveTLM`,
    data,
  );
  return response.data;
};

export const deleteTLM = async (id: string) => {
  const response = await axios.post(
    `${API_BASE}TeachingLearningMethods/DeleteTLM`,
    {
      id: String(id),
    },
  );

  return response.data;
};



// ===================== Category Type =====================

export const fetchCategorytype = async () => {
  try {
    const response = await axios.get(`${API_BASE}Categorytype/LoadCategorygrid`);
    return response.data;
  }
  catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
};


export const saveCategorytype = async (payload: any)=>{
  try{
    const response = await axios.post(`${API_BASE}Categorytype/CategorytypeSave`,
      payload
    );
    return response.data
  }
  catch(error){
    console.error("Error Saving  Regulations", error);
    throw error;
  }
}


// ===================== Designation Master =====================

export const fetchDesignationList = async (workmode: string)=>{
   try{
    const response = await axios.post(`${API_BASE}DesignationMaster/Designationlist`,      
      {WorkMode:workmode}
    );
    return response.data
  }
  catch(error){
    console.error("Error Saving  Regulations", error);
    throw error;
  }
}


export const SaveDesignation = async (payload: any) => {
    try{
        const response = await axios.post(`${API_BASE}DesignationMaster/SaveDesignation`,    
        payload
    );

    return response.data;
    }
  catch(error){
    console.error("Error Saving  Regulations", error);
    throw error;
  }
};

export const DeleteDesignation = async (payload: any) => {
    const response = await axios.post(`${API_BASE}DesignationMaster/DeleteDesignation`,
        payload
    );
    return response.data;
};

export const SaveDesignationOrder = async (payload: any) => {
    const response = await axios.post(`${API_BASE}DesignationMaster/SaveDesignationOrder`,
        payload
    );
    return response.data;
};



// ===================== SMS Template Registration =====================
export const loadSmsTemplates = async () => {
    try {
        const response = await axios.get(
            `${API_BASE}SmsTemplateRegistration/LoadSmsTemplates`
        );
        return response.data;
    } catch (error) {
        console.error("Error loading SMS Templates", error);
        throw error;
    }
};


export const saveSmsTemplate = async (payload: any) => {
    try {
        const response = await axios.post(
            `${API_BASE}SmsTemplateRegistration/SaveSMSTemplate`,
            payload
        );

        return response.data;
    } catch (error) {
        console.error("Error Saving SMS Template", error);
        throw error;
    }
};


export const deleteSmsTemplate = async (id: number | string) => {
    try {
        const response = await axios.post(
            `${API_BASE}SmsTemplateRegistration/DeleteTemplateMaster`,
            {
                Ident: id
            }
        );

        return response.data;
    } catch (error) {
        console.error("Delete Error", error);
        throw error;
    }
};