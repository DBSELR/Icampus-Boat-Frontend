import axios from "axios";
import { API_BASE } from "../config";

/* ==========================================================================
   COMMONFIELDS APIS
   Standard shared dropdown and lookup endpoints:
   1. GET  /api/Commonfields/GetACademicyear
   2. GET  /api/Commonfields/GetRegulation
   3. POST /api/Commonfields/GetProgramme
   4. POST /api/Commonfields/GetBranch
   5. POST /api/Commonfields/GetYear
   6. POST /api/Commonfields/GetSections
   ========================================================================== */

/**
 * GET /api/Commonfields/GetACademicyear
 * Fetches the list of academic years
 */
export const getACademicyear = async () => {
  try {
    const response = await axios.get(`${API_BASE}Commonfields/GetACademicyear`);
    return response.data;
  } catch (error) {
    console.error("Commonfields/GetACademicyear error:", error);
    return [];
  }
};
export const getAcademicYear = getACademicyear;

/**
 * GET /api/Commonfields/GetRegulation
 * Fetches the list of regulations
 */
export const getRegulation = async () => {
  try {
    const response = await axios.get(`${API_BASE}Commonfields/GetRegulation`);
    return response.data;
  } catch (error) {
    console.error("Commonfields/GetRegulation error:", error);
    return [];
  }
};
export const getReguList = getRegulation;

/**
 * POST /api/Commonfields/GetProgramme
 * Fetches programmes for current academic year
 */
export const getProgramme = async (academicYearParam?: string) => {
  try {
    const academicYear =
      academicYearParam || localStorage.getItem("academicYear") || "";
    const response = await axios.post(
      `${API_BASE}Commonfields/GetProgramme`,
      null,
      {
        params: {
          ACADEMICYEAR: academicYear,
        },
      },
    );
    let data = response.data;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch {}
    }
    return Array.isArray(data) ? data : data?.data || [];
  } catch (error) {
    console.error("Commonfields/GetProgramme error:", error);
    return [];
  }
};

/**
 * POST /api/Commonfields/GetBranch
 * Fetches branches for selected programme and academic year
 */
export const getBranch = async (
  programme: string,
  academicYearParam?: string,
) => {
  try {
    const academicYear =
      academicYearParam || localStorage.getItem("academicYear") || "";
    const response = await axios.post(
      `${API_BASE}Commonfields/GetBranch`,
      null,
      {
        params: {
          PROGRAMME: programme,
          ACADEMICYEAR: academicYear,
        },
      },
    );
    let data = response.data;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch {}
    }
    return Array.isArray(data) ? data : data?.data || [];
  } catch (error) {
    console.error("Commonfields/GetBranch error:", error);
    return [];
  }
};

/**
 * POST /api/Commonfields/GetYear
 * Fetches years for selected programme and academic year
 */
export const getYear = async (
  programme: string,
  academicYearParam?: string,
) => {
  try {
    const academicYear =
      academicYearParam || localStorage.getItem("academicYear") || "";
    const response = await axios.post(`${API_BASE}Commonfields/GetYear`, null, {
      params: {
        PROGRAMME: programme,
        ACADEMICYEAR: academicYear,
      },
    });
    let data = response.data;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch {}
    }
    return Array.isArray(data) ? data : data?.data || [];
  } catch (error) {
    console.error("Commonfields/GetYear error:", error);
    return [];
  }
};

/**
 * POST /api/Commonfields/GetSections
 * Fetches sections for selected programme, branch, and year
 */
export const getSections = async (
  programme: string,
  branch: string,
  year: string,
  academicYearParam?: string,
) => {
  try {
    const academicYear =
      academicYearParam || localStorage.getItem("academicYear") || "";
    const response = await axios.post(
      `${API_BASE}Commonfields/GetSections`,
      null,
      {
        params: {
          PROGRAMME: programme,
          BRANCH: branch,
          YEAR: year,
          ACADEMICYEAR: academicYear,
        },
      },
    );
    let data = response.data;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch {}
    }
    return Array.isArray(data) ? data : data?.data || [];
  } catch (error) {
    console.error("Commonfields/GetSections error:", error);
    return [];
  }
};
