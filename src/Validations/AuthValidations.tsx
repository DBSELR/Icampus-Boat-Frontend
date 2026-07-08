import * as Yup from "yup";

export const loginValidationSchema = Yup.object({
    userId: Yup.string()
        .required("userId is required"),

    password: Yup.string()
        .min(3, "Password too short")
        .required("Password is required"),
});



