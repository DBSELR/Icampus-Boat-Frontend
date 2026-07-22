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

// Load Submenus
export const loadSubMenus = async () => {
    const token = localStorage.getItem("token");

    console.log("Token:", token);

    const response = await axios.get(`${API_BASE}Auth/Load_Sub_Menu`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    console.log("Load_Sub_Menu Response:", response.data);

    return response;
};

// Login API
export const loginApi = async (
    data: LoginRequest
): Promise<LoginResponse> => {
    try {
        console.log("Base Url=====??", API_BASE);
        console.log("Data======??", data);

        const response = await axios.get(
            `${API_BASE}Auth/Login`,
            {
                params: {
                    UserId: data.userId,
                    Password: data.password,
                },
            }
        );
        console.log(response);
        // ✅ Save JWT Token
        localStorage.setItem("token", response.data.token);

        // (Optional) Save user information
        localStorage.setItem("user", JSON.stringify(response.data.user));
        return {
            success: true,
            data: response.data,
            message: response.data?.message || "Login successful",
        };
    } catch (error: any) {
        console.error("Login error:", error);
        const message =
            error.response?.data?.message ||
            error.response?.data?.detail ||
            error.message ||
            "Login failed. Please check your credentials or try again later.";

        return {
            success: false,
            data: null,
            message,
            status: error.response?.status,
        };
    }
};