import axios from "axios";
import { API_BASE } from "../config";

// =================Account Master============
export const getAccountsList = async () => {
  try {
    const response = await axios.post(`${API_BASE}AccountMaster/AccountsList`);
    return response.data;
  } catch (error) {
    console.error("Get Accounts List Error:", error);
    throw error;
  }
};

export const getAccountData = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}AccountMaster/GetACData`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Get Account Data Error:", error);
    throw error;
  }
};

export const saveAccount = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}AccountMaster/SaveAccount`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Save Account Error:", error);
    throw error;
  }
};

export const deleteAccount = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}AccountMaster/DeleteAccount`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Delete Account Error:", error);
    throw error;
  }
};

// =================Heads Master============
export const getHeadsMasterList = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}HeadsMaster/HeadsMasterList`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Get Heads Master List Error:", error);
    throw error;
  }
};

export const getHeadsOrder = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}HeadsMaster/HeadsOrder`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Get Heads Order Error:", error);
    throw error;
  }
};

export const getFHData = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}HeadsMaster/GetFHData`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Get Fee Head Data Error:", error);
    throw error;
  }
};

export const getAccountNoAjax = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}HeadsMaster/AccountNoAjax`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Get Account No Ajax Error:", error);
    throw error;
  }
};

export const getFeeTypeAjax = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}HeadsMaster/FeeTypeAjax`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Get Fee Type Ajax Error:", error);
    throw error;
  }
};

export const saveHeadsMaster = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}HeadsMaster/SaveHeadsMaster`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Save Heads Master Error:", error);
    throw error;
  }
};

export const deleteHeadsMaster = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}HeadsMaster/DeleteHeadsMaster`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Delete Heads Master Error:", error);
    throw error;
  }
};

// =================Misc Heads Master============
export const getMiscHeadsMasterList = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}MiscHeadsMaster/HeadsMasterList`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Get Misc Heads Master List Error:", error);
    throw error;
  }
};

export const getMiscHeadsOrder = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}MiscHeadsMaster/HeadsOrder`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Get Misc Heads Order Error:", error);
    throw error;
  }
};

export const getMiscHeadData = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}MiscHeadsMaster/GetHeadData`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Get Misc Head Data Error:", error);
    throw error;
  }
};

export const getMiscAccountNoAjax = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}MiscHeadsMaster/AccountNoAjax`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Get Misc Account No Ajax Error:", error);
    throw error;
  }
};

export const saveMiscHeadsMaster = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}MiscHeadsMaster/SaveHeadsMaster`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Save Misc Heads Master Error:", error);
    throw error;
  }
};

export const deleteMiscHeadsMaster = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}MiscHeadsMaster/DeleteHeadsMaster`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Delete Misc Heads Master Error:", error);
    throw error;
  }
};

// =================Fee Master============
export const getFeeMasterList = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}FeeMaster/FeeMasterList`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Get Fee Master List Error:", error);
    throw error;
  }
};

export const loadAdmMode = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}FeeMaster/LoadAdmMode`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Load Admission Mode Error:", error);
    throw error;
  }
};

export const saveFeeMasterRecord = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}FeeMaster/SaveFeeMaster`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Save Fee Master Record Error:", error);
    throw error;
  }
};

// =================Edit Fee Challana============
export const loadFeeChallanaAdmission = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}EditFeeChallana/FeeChallanaAdmissionLoad`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Load Fee Challana Admission Error:", error);
    throw error;
  }
};

export const saveFeeChallana = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}EditFeeChallana/SaveFeeChallana`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Save Fee Challana Error:", error);
    throw error;
  }
};

// =================Admission Modes============
export const getAdmModeList = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}AdmissionModes/AdmModeList`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Admission Mode List Error:", error);
    throw error;
  }
};

export const saveAdmissionMode = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}AdmissionModes/SaveAdmissionMode`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Save Admission Mode Error:", error);
    throw error;
  }
};

export const deleteAdmissionMode = async (id: number | string) => {
  try {
    const response = await axios.post(
      `${API_BASE}AdmissionModes/DeleteAdmMode?id=${encodeURIComponent(id)}`,
    );
    return response.data;
  } catch (error) {
    console.error("Delete Admission Mode Error:", error);
    throw error;
  }
};
// =================Fee Fine Master============
export const getFeeFineList = async (payload?: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}FeeFineMaster/FeeFineList`,
      payload || {},
    );
    return response.data;
  } catch (error) {
    console.error("Get Fee Fine List Error:", error);
    throw error;
  }
};

export const saveFeeFineMaster = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}FeeFineMaster/SaveFeeFineMaster`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Save Fee Fine Master Error:", error);
    throw error;
  }
};

export const deleteFeeFineMaster = async (id: number | string) => {
  try {
    const response = await axios.post(
      `${API_BASE}FeeFineMaster/DeleteFeeFineMaster?id=${encodeURIComponent(id)}`,
    );
    return response.data;
  } catch (error) {
    console.error("Delete Fee Fine Master Error:", error);
    throw error;
  }
};

export const updatePaidYear = async (paidYear: string) => {
  try {
    const response = await axios.post(
      `${API_BASE}FeeFineMaster/UpdatePaidYear?paidYear=${encodeURIComponent(paidYear)}`,
    );
    return response.data;
  } catch (error) {
    console.error("Update Paid Year Error:", error);
    throw error;
  }
};

export const getFeePaidYear = async () => {
  try {
    const response = await axios.get(`${API_BASE}FeeFineMaster/FeePaidYear`);
    return response.data;
  } catch (error) {
    console.error("Get Fee Paid Year Error:", error);
    throw error;
  }
};

// =================Receipt Cancellation============
export const getReceipt = async (receiptNo: string, academicYear?: string) => {
  try {
    const acYear =
      academicYear || localStorage.getItem("academicYear") || "2026-2027";
    const response = await axios.post(
      `${API_BASE}ReceiptConcellation/GetReceipt?receiptNo=${encodeURIComponent(receiptNo)}&academicYear=${encodeURIComponent(acYear)}`,
      "",
    );
    return response.data;
  } catch (error) {
    console.error("Get Receipt Error:", error);
    throw error;
  }
};

export const deleteReceipt = async (payload: {
  receiptNO: string;
  academicYear: string;
  userId: string;
}) => {
  try {
    const response = await axios.delete(
      `${API_BASE}ReceiptConcellation/DeleteReceipt`,
      { data: payload },
    );
    return response.data;
  } catch (error) {
    console.error("Delete Receipt Error:", error);
    throw error;
  }
};

// =================Fee Concession============
export const getFeeConcessionStudentData = async (
  regNo: string,
  academicYear?: string,
  year?: string | number,
  term?: string | number,
) => {
  try {
    const acYear =
      academicYear || localStorage.getItem("academicYear") || "2026-2027";
    const response = await axios.post(
      `${API_BASE}FeeConcession/GetStudentConcessionData?regNo=${encodeURIComponent(regNo)}&academicYear=${encodeURIComponent(acYear)}&year=${encodeURIComponent(String(year || 3))}&term=${encodeURIComponent(String(term || 1))}`,
      "",
    );
    return response.data;
  } catch (error) {
    console.error("Get Fee Concession Student Data Error:", error);
    throw error;
  }
};

export const saveFeeConcession = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}FeeConcession/SaveFeeConcession`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Save Fee Concession Error:", error);
    throw error;
  }
};

export const getSSNo = async (ssNo: string) => {
  try {
    const response = await axios.post(
      `${API_BASE}FeeConcession/GetSSNo?ssNo=${encodeURIComponent(ssNo)}`,
      "",
    );
    return response.data;
  } catch (error) {
    console.error("Get SSNo Error:", error);
    throw error;
  }
};

export const getStudentData = async (ssNo: string) => {
  try {
    const response = await axios.post(
      `${API_BASE}FeeConcession/GetStudentData?ssNo=${encodeURIComponent(ssNo)}`,
      "",
    );
    return response.data;
  } catch (error) {
    console.error("Get Student Data Error:", error);
    throw error;
  }
};

export const getFeeDues = async (ssNo: string) => {
  try {
    const response = await axios.post(
      `${API_BASE}FeeConcession/GetFeeDues?ssNo=${encodeURIComponent(ssNo)}`,
      "",
    );
    return response.data;
  } catch (error) {
    console.error("Get Fee Dues Error:", error);
    throw error;
  }
};

export const feeChallanaAdmissionLoad = async (
  ssNo: string,
  term: string | number,
  year: string | number,
) => {
  try {
    // Support query string & request body
    const url = `${API_BASE}FeeConcession/FeeChallanaAdmissionLoad?ssNo=${encodeURIComponent(ssNo)}&term=${encodeURIComponent(String(term))}&year=${encodeURIComponent(String(year))}`;
    const payload = {
      ssNo,
      term: String(term),
      year: String(year),
    };
    const response = await axios.post(url, payload);
    return response.data;
  } catch (error) {
    console.error("Fee Challana Admission Load Error:", error);
    throw error;
  }
};

export const getFeeConcessionReceiptNo = async (academicYear?: string) => {
  try {
    const acYear =
      academicYear || localStorage.getItem("academicYear") || "2026-2027";
    const response = await axios.post(
      `${API_BASE}FeeConcession/GetReceiptNo?academicYear=${encodeURIComponent(acYear)}`,
      "",
    );
    return response.data;
  } catch (error) {
    console.error("Get Fee Concession Receipt No Error:", error);
    throw error;
  }
};

export const getNextConcessionId = async (academicYear?: string) => {
  return getFeeConcessionReceiptNo(academicYear);
};

// =================Misc Fee Challana============
export const getMiscFeeChallanaFeeList = async (payload: { academicYear: string }) => {
  try {
    const response = await axios.post(
      `${API_BASE}MiscFeeChallana/FeeList`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Get Misc Fee Challana Fee List Error:", error);
    throw error;
  }
};

export const getMiscFeeChallanaReceiptNo = async (payload: { academicYear: string }) => {
  try {
    const response = await axios.post(
      `${API_BASE}MiscFeeChallana/GetReceiptNo`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Get Misc Fee Challana Receipt No Error:", error);
    throw error;
  }
};

export const getMiscFeeChallanaSSNo = async (payload: { ssNo: string }) => {
  try {
    const response = await axios.post(
      `${API_BASE}MiscFeeChallana/GetSSNo`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Get Misc Fee Challana SSNo Error:", error);
    throw error;
  }
};

export const getMiscFeeChallanaAdmissionLoad = async (payload: { ssNo: string }) => {
  try {
    const response = await axios.post(
      `${API_BASE}MiscFeeChallana/FeeChallanaAdmissionLoad`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Get Misc Fee Challana Admission Load Error:", error);
    throw error;
  }
};

export const saveMiscFeeChallana = async (payload: any) => {
  try {
    const response = await axios.post(
      `${API_BASE}MiscFeeChallana/SaveFeeChallana`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Save Misc Fee Challana Error:", error);
    throw error;
  }
};
