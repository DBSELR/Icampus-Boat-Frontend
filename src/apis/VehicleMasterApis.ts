import axios from "axios";
import { API_BASE } from "../config";

export interface Vehicle {
  ID?: number | string;
  id?: number | string;
  ROUTENAME?: string;
  routeName?: string;
  VEHICLENO?: string;
  vehicleNo?: string;
  VEHICLEREGNO?: string;
  vehicleRegNo?: string;
  VEHICLECAPACITY?: string;
  vehicleCapacity?: string;
  DRIVERNAME?: string;
  driverName?: string;
  SEARCHNAME?: string | null;
  AcademicYear?: string;
  academicYear?: string;
  FinancialYear?: string;
  financialYear?: string;
  CreatedById?: string;
  CreatedDate?: string;
  ModifiedById?: string;
  ModifiedDate?: string;
}

export interface RouteOption {
  ROUTENAME: string;
}

export interface DriverOption {
  DRIVERNAME: string;
}

export interface LoadInitialResponse {
  success: boolean;
  data?: {
    vehicles?: Vehicle[];
    routes?: RouteOption[];
    drivers?: DriverOption[];
  };
}

export interface VehicleListResponse {
  success: boolean;
  data?: Vehicle[];
}

export interface CheckVehicleNoResponse {
  success: boolean;
  exists?: boolean;
  data?: Vehicle;
}

export interface SaveVehiclePayload {
  id?: string | number;
  routeName: string;
  vehicleNo: string;
  vehicleRegNo: string;
  vehicleCapacity: string;
  driverName: string;
  userId?: string;
  academicYear?: string;
  financialYear?: string;
}

// API Calls
export const loadInitialVehicleMaster = async (): Promise<LoadInitialResponse> => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE}VehicleMaster/load-initial`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const getVehicleList = async (): Promise<VehicleListResponse> => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE}VehicleMaster/list`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const checkVehicleNo = async (
  vehicleNo: string,
  academicYear: string = "2026-2027"
): Promise<CheckVehicleNoResponse> => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE}VehicleMaster/check-vehicle-no`, {
    params: { vehicleNo, academicYear },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const saveVehicleMaster = async (
  payload: SaveVehiclePayload
): Promise<any> => {
  const token = localStorage.getItem("token");
  const response = await axios.post(`${API_BASE}VehicleMaster/save`, payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const deleteVehicleMaster = async (
  id: string | number
): Promise<any> => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.delete(`${API_BASE}VehicleMaster/delete/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (err) {
    const response = await axios.get(`${API_BASE}VehicleMaster/delete/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  }
};

export const searchVehicleMaster = async (
  query: string
): Promise<VehicleListResponse> => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE}VehicleMaster/search`, {
    params: { query },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};
