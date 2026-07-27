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

// Load Financial Academic Year
export const loadAcademicYearsApi =
  async (): Promise<LoadAcademicYearResponse> => {
    try {
      const response = await axios.get(
        `${API_BASE}FinancialAcadamicYear/LoadData`,
      );

      console.log("Load Academic Year Response:", response.data);

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
  console.log(id, "id????????");

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
