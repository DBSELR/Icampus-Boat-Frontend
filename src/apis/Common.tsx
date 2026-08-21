import axios from "axios";
import { API_BASE } from "../config";

export const getProgramme = async () => {
  const academicYear = localStorage.getItem("academicYear");

  const response = await axios.post(
    `${API_BASE}Commonfields/GetProgramme`,
    null,
    {
      params: {
        ACADEMICYEAR: academicYear,
      },
    },
  );

  return response.data;
};

export const getYear = async (programme: string) => {
  const academicYear = localStorage.getItem("academicYear");
  const response = await axios.post(`${API_BASE}Commonfields/GetYear`, null, {
    params: {
      PROGRAMME: programme,
      ACADEMICYEAR: academicYear,
    },
  });

  return response.data;
};

export const getBranch = async (programme: string) => {
  const academicYear = localStorage.getItem("academicYear");
  const response = await axios.post(`${API_BASE}Commonfields/GetBranch`, null, {
    params: {
      PROGRAMME: programme,
      ACADEMICYEAR: academicYear,
    },
  });

  return response.data;
};

export const getReguList = async () => {
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

export const loadExpenditureAmount = async (
  expenditureHeads: string,
  courseCode: string,
  year: string,
) => {
  try {
    const response = await axios.get(`${API_BASE}ExpenditureMaster/amount`, {
      params: {
        expenditureHeads,
        courseCode,
      year,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Load Expenditure Amount Error:", error);
    throw error;
  }
};
