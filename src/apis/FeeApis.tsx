import axios from "axios";
import { API_BASE } from "../config";

/* Shape returned by AccountsList / GetACData */
export interface ApiAccountRecord {
  iD: number;
  aCNO: string;
  aCSNAME: string;
  aCNAME: string;
  openBalance: number;
}

/* Shape sent to GetACData / SaveAccount / DeleteAccount */
export interface AccountPayload {
  id: string;
  accountno: string;
  shortname: string;
  accountname: string;
  openBalance: string;
}

/* UI-facing shape used throughout the component */
export interface Account {
  id: string;
  accountNumber: string;
  shortName: string;
  accountName: string;
  openingBalance: number;
}

export const mapApiAccount = (rec: ApiAccountRecord): Account => ({
  id: String(rec.iD),
  accountNumber: rec.aCNO,
  shortName: rec.aCSNAME,
  accountName: rec.aCNAME,
  openingBalance: Number(rec.openBalance) || 0,
});

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message: string;
}

interface ApiErrorResponse {
  success: false;
  data: null;
  message: string;
  status?: number;
}

type ApiResult<T> = ApiSuccessResponse<T> | ApiErrorResponse;

const extractErrorMessage = (error: any): string =>
  error.response?.data?.message ||
  error.response?.data?.detail ||
  error.message ||
  "Request failed. Please try again later.";

// Load Accounts List
export const getAccountsList = async (): Promise<
  ApiResult<ApiAccountRecord[]>
> => {
  try {
    console.log("Base Url=====??", API_BASE);

    const response = await axios.get(`${API_BASE}AccountMaster/AccountsList`);

    console.log("AccountsList Response:", response.data);

    return {
      success: true,
      data: response.data,
      message: "Accounts loaded successfully",
    };
  } catch (error: any) {
    console.error("AccountsList error:", error);
    return {
      success: false,
      data: null,
      message: extractErrorMessage(error),
      status: error.response?.status,
    };
  }
};

// Get Account Data (lookup by account number — used to detect an existing account)
export const getAccountData = async (
  accountno: string,
): Promise<ApiResult<ApiAccountRecord[]>> => {
  try {
    const payload: AccountPayload = {
      id: "",
      accountno,
      shortname: "",
      accountname: "",
      openBalance: "",
    };
    console.log("GetACData Payload:", payload);

    const response = await axios.post(
      `${API_BASE}AccountMaster/GetACData`,
      payload,
    );

    console.log("GetACData Response:", response.data);

    return {
      success: true,
      data: response.data,
      message: "Account data fetched successfully",
    };
  } catch (error: any) {
    console.error("GetACData error:", error);
    return {
      success: false,
      data: null,
      message: extractErrorMessage(error),
      status: error.response?.status,
    };
  }
};

// Save Account (empty id = create, populated id = update)
export const saveAccount = async (
  payload: AccountPayload,
): Promise<ApiResult<{ message: string; rowsAffected: number }>> => {
  try {
    console.log("SaveAccount Payload:", payload);

    const response = await axios.post(
      `${API_BASE}AccountMaster/SaveAccount`,
      payload,
    );

    console.log("SaveAccount Response:", response.data);

    return {
      success: true,
      data: response.data,
      message: response.data?.message || "Account saved successfully",
    };
  } catch (error: any) {
    console.error("SaveAccount error:", error);
    return {
      success: false,
      data: null,
      message: extractErrorMessage(error),
      status: error.response?.status,
    };
  }
};

// Delete Account
export const deleteAccount = async (
  id: string,
): Promise<ApiResult<{ message: string; rowsAffected: number }>> => {
  try {
    const payload: AccountPayload = {
      id,
      accountno: "",
      shortname: "",
      accountname: "",
      openBalance: "",
    };
    console.log("DeleteAccount Payload:", payload);

    const response = await axios.post(
      `${API_BASE}AccountMaster/DeleteAccount`,
      payload,
    );

    console.log("DeleteAccount Response:", response.data);

    return {
      success: true,
      data: response.data,
      message: response.data?.message || "Account deleted successfully",
    };
  } catch (error: any) {
    console.error("DeleteAccount error:", error);
    return {
      success: false,
      data: null,
      message: extractErrorMessage(error),
      status: error.response?.status,
    };
  }
};
