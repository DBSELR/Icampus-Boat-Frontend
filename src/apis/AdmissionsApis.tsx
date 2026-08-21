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
