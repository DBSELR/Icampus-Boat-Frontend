import * as Yup from "yup";

export const vehicleMasterValidationSchema = Yup.object({
  routeName: Yup.string().required("Route Name is required"),
  vehicleNo: Yup.string().required("Vehicle Service No. is required"),
  vehicleRegNo: Yup.string().required("Vehicle Reg. No. is required"),
  vehicleCapacity: Yup.number()
    .typeError("Vehicle Capacity must be a number")
    .positive("Vehicle Capacity must be greater than 0")
    .required("Vehicle Capacity is required"),
  driverName: Yup.string().required("Driver Name is required"),
});
