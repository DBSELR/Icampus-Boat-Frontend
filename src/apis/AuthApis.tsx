import axios from "axios";
import { API_BASE } from "../config";

interface LoginRequest {
    userId: string;
    password: string;
}

interface LoginSuccessResponse {
    success: true;
    data: any; // replace with proper user type if you have it
    message: string;
}

interface LoginErrorResponse {
    success: false;
    data: null;
    message: string;
    status?: number;
}

type LoginResponse = LoginSuccessResponse | LoginErrorResponse;

export const loginApi = async (
    data: LoginRequest
): Promise<LoginResponse> => {
    try {
        console.log("Base Url=====??", API_BASE);
        console.log("Data======??", data);
        const response = await axios.post(
            `${API_BASE}Auth/Login`,
            data
        );

        return {
            success: true,
            data: response.data,
            message: response.data?.message || "Login successful",
        };

    } catch (error: any) {
        const message =
            error.response?.data?.message ||
            error.message ||
            "Login failed";

        return {
            success: false,
            data: null,
            message,
            status: error.response?.status,
        };
    }
};