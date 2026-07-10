import * as Yup from "yup";

export const departmentValidationSchema = Yup.object({
  DepartmentCode: Yup.string().required("Department Code is required"),

  Department: Yup.string().required("Department is required"),

  DepartmentType: Yup.string().required("Department Type is required"),

  Description: Yup.string().required("Description is required"),
});
