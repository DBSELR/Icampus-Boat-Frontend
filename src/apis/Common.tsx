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

export const getPeriodTimeList = async (programme: string) => {
  const response = await axios.post(
    `${API_BASE}PeriodSettings/GetPeriodTimeList`,
    {
      programme: programme,
    },
  );

  return response.data;
};

export const savePeriodTime = async (payload: any) => {
  const response = await axios.post(
    `${API_BASE}PeriodSettings/SavePeriodTime`,
    payload,
  );

  return response.data;
};

export const getMidTypeMaster = async () => {
  const response = await axios.get(
    `${API_BASE}InternalMarksAllowedDate/GetMidTypeMaster`,
  );

  return response.data;
};
