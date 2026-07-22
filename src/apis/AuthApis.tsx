// import axios from "axios";
// import { API_BASE } from "../config";

// interface LoginRequest {
//     userId: string;
//     password: string;
// }

// interface LoginSuccessResponse {
//     success: true;
//     data: any; // replace with proper user type if you have it
//     message: string;
// }

// interface LoginErrorResponse {
//     success: false;
//     data: null;
//     message: string;
//     status?: number;
// }

// type LoginResponse = LoginSuccessResponse | LoginErrorResponse;




// export const loadMenus = (userId: string, password: string) => {
//   return axios.get(`${API_BASE}Auth/Load_Menu`, {
//     params: {
//       UserId: userId,
//       Password: password,
//     },
//   });
// };

// export const loadSubMenus = (userId: string, password: string) => {
//   return axios.get(`${API_BASE}Auth/Load_Sub_Menu`, {
//     params: {
//       UserId: userId,
//       Password: password,
//     },
//   });
// };
// export const loginApi = async (
//     data: LoginRequest
// ): 
// Promise<LoginResponse> => {
//     try {
//         console.log("Base Url=====??", API_BASE);
//         console.log("Data======??", data);
//         // const response = await axios.post(
//         //     `${API_BASE}Auth/Login`,
//         //     data
//         // );
//         const response = await axios.get(
//     `${API_BASE}Auth/Login`,
//     {
//         params: {
//             UserId: data.userId,
//             Password: data.password,
//         },
//     }
// );
//         console.log(response)
//         return {
//             success: true,
//             data: response.data,
//             message: response.data?.message || "Login successful",
//         };

//     } catch (error: any) {
//         const message =
//             error.response?.data?.message ||
//             error.message ||
//             "Login failed";

//         return {
//             success: false,
//             data: null,
//             message,
//             status: error.response?.status,
//         };
//     };
// }
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
): 
Promise<LoginResponse> => {
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
        console.log(response)
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
    };
}