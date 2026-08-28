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


// ===================== Fee Challana (FeeChallana.aspx) APIs =====================


export const getFeeChallanaCurrentAcyr = async () => {
  try {
    const response = await axios.get(`${API_BASE}FeeChallana/GetCurrentAcyr`);
    return response.data;
  } catch (error) {
    console.error("Error fetching current academic year", error);
    throw error;
  }
};

export const getFeeChallanaList = async () => {
  try {
    const response = await axios.get(`${API_BASE}FeeChallana/FeeChallanaList`);
    return response.data;
  } catch (error) {
    console.error("Error fetching fee challana list", error);
    throw error;
  }
};

export const getMaxFeeRcptNo = async () => {
  try {
    const response = await axios.get(`${API_BASE}FeeChallana/GetMaxFeeRcptNo`);
    return response.data;
  } catch (error) {
    console.error("Error fetching max fee receipt number", error);
    throw error;
  }
};

export const getStudentSSNo = async (ssNo: string) => {
  try {
    const response = await axios.post(`${API_BASE}FeeChallana/GetSSNo`, { SSNo: ssNo });
    return response.data;
  } catch (error) {
    console.error("Error fetching student SSNo mapping", error);
    throw error;
  }
};

export const getStudentFeeData = async (ssNo: string) => {
  try {
    const response = await axios.post(`${API_BASE}FeeChallana/GetStudentData`, { SSNo: ssNo });
    return response.data;
  } catch (error) {
    console.error("Error fetching student fee data", error);
    throw error;
  }
};

export const getStudentFeeDataSearchName = async (name: string) => {
  try {
    const response = await axios.post(`${API_BASE}FeeChallana/GetStudentDataSearchName`, { SSNo: name });
    return response.data;
  } catch (error) {
    console.error("Error searching student by name", error);
    throw error;
  }
};

export const getStudentFeeTerms = async (ssNo: string) => {
  try {
    const response = await axios.post(`${API_BASE}FeeChallana/GetTerms`, { SSNo: ssNo });
    return response.data;
  } catch (error) {
    console.error("Error fetching student fee terms", error);
    throw error;
  }
};

export const getStudentFeeDetails = async (ssNo: string, year: string, term: string) => {
  try {
    console.log(term)
    const response = await axios.post(`${API_BASE}FeeChallana/FeeChallanaAdmissionLoad`, {
      SSNo: ssNo,
      Year: year,
      Term: term
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching student fee breakdown details", error);
    throw error;
  }
};

export const getStudentFeeDues = async (ssNo: string) => {
  try {
    const response = await axios.post(`${API_BASE}FeeChallana/GetFeeDues`, { SSNo: ssNo });
    return response.data;
  } catch (error) {
    console.error("Error fetching student fee dues", error);
    throw error;
  }
};

export const getPaidAmount = async (ssNo: string, year: string) => {
  try {
    const response = await axios.post(`${API_BASE}FeeChallana/GetPaidAmount`, {
      SSNo: ssNo,
      Year: year
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching paid amount history", error);
    throw error;
  }
};

export const saveFeeChallanaDetails = async (payload: any) => {
  try {
    const response = await axios.post(`${API_BASE}FeeChallana/SaveFeeChallana`, payload);
    return response.data;
  } catch (error) {
    console.error("Error saving fee challan", error);
    throw error;
  }
};

export const deleteFeeChallana = async (fid: string) => {
  try {
    const response = await axios.post(`${API_BASE}FeeChallana/DeleteFeeChallana`, { Fid: fid });
    return response.data;
  } catch (error) {
    console.error("Error deleting fee challan", error);
    throw error;
  }
};

export const addAmountFeeChallana = async (payload: any) => {
  try {
    const response = await axios.post(`${API_BASE}FeeChallana/AddAmount`, payload);
    return response.data;
  } catch (error) {
    console.error("Error saving add amount fee head", error);
    throw error;
  }
};


// ===================== Fee Refund Amount (FeeRefundAmount.aspx) APIs =====================

export const getFeeRefundCurrentAcyr = async () => {
  try {
    const response = await axios.get(`${API_BASE}FeeConcession/GetCurrentAcyr`);
    return response.data;
  } catch (error) {
    console.error("Error fetching current academic year for refund", error);
    throw error;
  }
};

export const getRefundReceiptNo = async () => {
  try {
    const response = await axios.get(`${API_BASE}FeeConcession/GetRefundReceiptNo`);
    return response.data;
  } catch (error) {
    console.error("Error fetching refund receipt number", error);
    throw error;
  }
};

export const getFeeRefundStudentSSNo = async (ssNo: string) => {
  try {
    const response = await axios.post(`${API_BASE}FeeConcession/GetSSNo?ssNo=${encodeURIComponent(ssNo)}`);
    return response.data;
  } catch (error) {
    console.error("Error mapping student SSNo for refund", error);
    throw error;
  }
};

export const getFeeRefundStudentData = async (ssNo: string) => {
  try {
    const response = await axios.post(`${API_BASE}FeeConcession/GetStudentData?ssNo=${encodeURIComponent(ssNo)}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching student data for refund", error);
    throw error;
  }
};

export const getFeeRefundTerms = async (ssNo: string) => {
  try {
    const response = await axios.post(`${API_BASE}FeeConcession/GetTerms?ssNo=${encodeURIComponent(ssNo)}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching student terms for refund", error);
    throw error;
  }
};

export const getFeeRefundDetails = async (ssNo: string, year: string, term: string) => {
  try {
    const response = await axios.post(`${API_BASE}FeeConcession/FeeChallanaAdmissionLoad`, {
      SSNo: ssNo,
      Year: year,
      Term: term
    });
    console.log(response.data,"getFeeRefundDetails")
    return response.data;
  } catch (error) {
    console.error("Error fetching fee refund details breakdown", error);
    throw error;
  }
};

export const getFeeRefundDues = async (ssNo: string) => {
  try {
    const response = await axios.post(`${API_BASE}FeeConcession/GetFeeDues?ssNo=${encodeURIComponent(ssNo)}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching fee dues for refund", error);
    throw error;
  }
};

export const saveFeeRefundAmount = async (payload: any) => {
  try {
    const response = await axios.post(`${API_BASE}FeeConcession/SaveFeeRefundAmount`, payload);
    return response.data;
  } catch (error) {
    console.error("Error saving fee refund amount", error);
    throw error;
  }
};

export const getFeeRefundPaidAmount = async (ssNo: string, year: string) => {
  try {
    const response = await axios.post(`${API_BASE}FeeConcession/GetPaidAmount?ssNo=${encodeURIComponent(ssNo)}&year=${encodeURIComponent(year)}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching paid amount history for refund", error);
    throw error;
  }
};

export const getFeeRefundPrintReceiptNo = async (ssNo: string) => {
  try {
    const response = await axios.post(`${API_BASE}FeeConcession/GetPrintReceiptNo?ssNo=${encodeURIComponent(ssNo)}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching print receipt number for refund", error);
    throw error;
  }
};

export const getFeeReceiptDataRefund = async (receiptNo: string) => {
  try {
    const response = await axios.post(`${API_BASE}FeeConcession/GetFeeReceiptDataRefund?receiptNo=${encodeURIComponent(receiptNo)}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching fee receipt refund printable data", error);
    throw error;
  }
};