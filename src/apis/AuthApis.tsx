import axios from "axios";
import { API_BASE } from "../config";

interface LoginRequest {
    userId: string;
    password: string;
}

interface UserInfo {
    userId: string;
    role: string;
}

interface LoginSuccessResponse {
    success: true;
    data: any;
    user?: UserInfo;
    message: string;
}

interface LoginErrorResponse {
    success: false;
    data: null;
    message: string;
    status?: number;
}

type LoginResponse = LoginSuccessResponse | LoginErrorResponse;


// ================================
// Get Logged In User
// ================================
export const getCurrentUser = async () => {
    try {
        const response = await axios.get(
            `${API_BASE}Auth/Me`,
            {
                withCredentials: true
            }
        );

        return {
            success: true,
            data: response.data
        };

    } catch (error: any) {

        return {
            success: false,
            data: null,
            message:
                error.response?.data?.message ||
                error.message ||
                "Unable to get current user"
        };
    }
};


// ================================
// Login API
// ================================
export const loginApi = async (
    data: LoginRequest
): Promise<LoginResponse> => {

    try {

        console.log("Base URL:", API_BASE);
        console.log("Login Data:", data);


        // Login request
        const response = await axios.post(
            `${API_BASE}Auth/Login`,
            data,
            {
                withCredentials: true
            }
        );


        // After login cookie is created,
        // call /Me to get user details
        const userResult = await getCurrentUser();


        if (userResult.success) {

            console.log(
                "Logged User:",
                userResult.data
            );


            return {
                success: true,
                data: response.data,
                user: userResult.data,
                message:
                    response.data?.message ||
                    "Login successful"
            };

        }


        return {
            success: true,
            data: response.data,
            message:
                response.data?.message ||
                "Login successful"
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
            status: error.response?.status
        };
    }
};