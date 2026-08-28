import axios from "axios";
import { API_BASE } from "../config";

// ================= Budget Heads =================
export const getBudgetHeadsNextOrder = async (academicYear: string) => {
  try {
    const response = await axios.get(
      `${API_BASE}BudgetHeads/GetNextOrder?academicYear=${encodeURIComponent(academicYear)}`
    );
    return response.data;
  } catch (error) {
    console.error("Get Budget Heads Next Order Error:", error);
    throw error;
  }
};

export const getBudgetHeadsMasterList = async () => {
  try {
    const response = await axios.get(`${API_BASE}BudgetHeads/HeadsMasterList`);
    return response.data;
  } catch (error) {
    console.error("Get Budget Heads Master List Error:", error);
    throw error;
  }
};

export const saveBudgetHeadsMaster = async (payload: {
  id?: string | number;
  academicYear: string;
  fyear: string;
  order: string | number;
  phname: string;
  phsname: string;
  accountno?: string;
}) => {
  try {
    const response = await axios.post(
      `${API_BASE}BudgetHeads/SaveHeadsMaster`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Save Budget Heads Master Error:", error);
    throw error;
  }
};

// ================= Revenue Budget =================
export const getBudgetFYears = async () => {
  try {
    const response = await axios.get(`${API_BASE}Budget/LoadFYears`);
    return response.data;
  } catch (error) {
    console.error("Get Budget LoadFYears Error:", error);
    throw error;
  }
};

export const getBudgetList = async (fYear: string, sMode?: string) => {
  try {
    const mode =
      sMode && sMode !== "Select Mode" ? sMode.toLowerCase() : "";
    const response = await axios.get(`${API_BASE}Budget/BudgetList`, {
      params: {
        fYear,
        sMode: mode,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Get Budget List Error:", error);
    throw error;
  }
};

export const saveBudget = async (payload: {
  id?: string | number;
  fyear: string;
  smode: string;
  order: string;
  bhname: string;
  bhsname: string;
  amount: string | number;
  userid: string;
}) => {
  try {
    const response = await axios.post(`${API_BASE}Budget/SaveBudget`, payload);
    return response.data;
  } catch (error) {
    console.error("Save Budget Error:", error);
    throw error;
  }
};

// ================= Payment Heads =================
export const getPaymentHeadsMasterList = async (academicYear: string) => {
  try {
    const response = await axios.get(
      `${API_BASE}PaymentHeads/HeadsMasterList?academicYear=${encodeURIComponent(academicYear)}`
    );
    return response.data;
  } catch (error) {
    console.error("Get Payment Heads Master List Error:", error);
    throw error;
  }
};

export const getPaymentBankHeadsList = async () => {
  try {
    const response = await axios.get(`${API_BASE}PaymentHeads/BankHeadsList`);
    return response.data;
  } catch (error) {
    console.error("Get Payment Bank Heads List Error:", error);
    throw error;
  }
};

export const getPaymentHeadsNextOrder = async () => {
  try {
    const response = await axios.get(`${API_BASE}PaymentHeads/GetNextOrder`);
    return response.data;
  } catch (error) {
    console.error("Get Payment Heads Next Order Error:", error);
    throw error;
  }
};

export const getPaymentHeadByShortName = async (phsName: string) => {
  try {
    const response = await axios.get(
      `${API_BASE}PaymentHeads/GetPHData?phsName=${encodeURIComponent(phsName)}`
    );
    return response.data;
  } catch (error) {
    console.error("Get Payment Head By Short Name Error:", error);
    throw error;
  }
};

export const savePaymentHeadsMaster = async (payload: {
  id?: string | number;
  academicYear: string;
  fyear?: string;
  order: string | number;
  phname: string;
  phsname: string;
  accountno?: string;
  bhsname: string;
}) => {
  try {
    const response = await axios.post(
      `${API_BASE}PaymentHeads/SaveHeadsMaster`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Save Payment Heads Master Error:", error);
    throw error;
  }
};

// ================= Payments / EditPayments =================
export const getPaymentHeadsForPayments = async (
  academicYear: string,
  fYear: string
) => {
  try {
    const response = await axios.get(
      `${API_BASE}EditPayments/GetPaymentHeads?academicYear=${encodeURIComponent(
        academicYear
      )}&fYear=${encodeURIComponent(fYear)}`
    );
    return response.data;
  } catch (error) {
    console.error("Get Payment Heads For Payments Error:", error);
    throw error;
  }
};

export const getEditPaymentHeads = getPaymentHeadsForPayments;

export const getPaymentVoucherNo = async (
  fYear: string | number = "April 2017 - March 2018"
) => {
  try {
    const response = await axios.get(
      `${API_BASE}Payments/GetVoucherNo?fYear=${encodeURIComponent(String(fYear))}`
    );
    return response.data;
  } catch (error) {
    console.error("Get Payment Voucher No Error:", error);
    throw error;
  }
};


export const getPaymentAccountNumbers = async () => {
  try {
    const response = await axios.get(`${API_BASE}EditPayments/GetAccNos`);
    return response.data;
  } catch (error) {
    console.error("Get Payment Account Numbers Error:", error);
    throw error;
  }
};

export const getEditPaymentAccountNumbers = getPaymentAccountNumbers;

export const getPaymentsData = async (academicYear: string, fYear: string) => {
  try {
    const response = await axios.get(
      `${API_BASE}Payments/GetPaymentData?academicYear=${encodeURIComponent(
        academicYear
      )}&fYear=${encodeURIComponent(fYear)}`
    );
    return response.data;
  } catch (error) {
    console.error("Get Payments Data Error:", error);
    throw error;
  }
};

export const getPaymentVoucherData = async (voucherNo: string, fYear: string) => {
  try {
    const response = await axios.get(
      `${API_BASE}EditPayments/GetPaymentData?voucherNo=${encodeURIComponent(
        voucherNo
      )}&fYear=${encodeURIComponent(fYear)}`
    );
    return response.data;
  } catch (error) {
    console.error("Get Payment Voucher Data Error:", error);
    throw error;
  }
};

export const getEditPaymentData = getPaymentVoucherData;

export const savePayment = async (payload: any) => {
  try {
    const response = await axios.post(`${API_BASE}EditPayments/SavePayment`, payload);
    return response.data;
  } catch (error) {
    console.error("Save Payment Error:", error);
    throw error;
  }
};

export const saveEditPayment = savePayment;










