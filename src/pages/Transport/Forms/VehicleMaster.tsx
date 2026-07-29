import React, { useEffect, useState, useCallback } from "react";
import { useFormik } from "formik";
import { toast } from "sonner";
import {
  Bus,
  Save,
  RotateCcw,
  Search,
  Trash2,
  SquarePen,
  RefreshCw,
  AlertCircle,
  User,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import "./VehicleMaster.css";
import {
  loadInitialVehicleMaster,
  getVehicleList,
  checkVehicleNo,
  saveVehicleMaster,
  deleteVehicleMaster,
  searchVehicleMaster,
  Vehicle,
  RouteOption,
  DriverOption,
} from "../../../apis/VehicleMasterApis";
import { vehicleMasterValidationSchema } from "../../../Validations/TransportValidations";

const VehicleMaster: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [vehicleExistsWarning, setVehicleExistsWarning] = useState<string | null>(null);

  // Initialize data from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const initialRes = await loadInitialVehicleMaster();
      if (initialRes && initialRes.success && initialRes.data) {
        if (initialRes.data.routes) setRoutes(initialRes.data.routes);
        if (initialRes.data.drivers) setDrivers(initialRes.data.drivers);
        if (initialRes.data.vehicles && initialRes.data.vehicles.length > 0) {
          setVehicles(initialRes.data.vehicles);
        } else {
          const listRes = await getVehicleList();
          if (listRes && listRes.data) {
            setVehicles(listRes.data);
          }
        }
      } else {
        const listRes = await getVehicleList();
        if (listRes && listRes.data) {
          setVehicles(listRes.data);
        }
      }
    } catch (error: any) {
      console.error("Error fetching vehicle initial data:", error);
      toast.error("Failed to load initial Vehicle Master data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Formik Hook setup
  const formik = useFormik({
    initialValues: {
      id: "",
      routeName: "",
      vehicleNo: "",
      vehicleRegNo: "",
      vehicleCapacity: "",
      driverName: "",
      userId: "T589",
      academicYear: "2026-2027",
      financialYear: "Apr-2017 t",
    },
    validationSchema: vehicleMasterValidationSchema,
    onSubmit: async (values) => {
      setSaving(true);
      try {
        const payload = {
          id: values.id || "0",
          routeName: values.routeName,
          vehicleNo: values.vehicleNo,
          vehicleRegNo: values.vehicleRegNo,
          vehicleCapacity: values.vehicleCapacity,
          driverName: values.driverName,
          userId: values.userId || "T589",
          academicYear: values.academicYear || "2026-2027",
          financialYear: values.financialYear || "Apr-2017 t",
        };

        const res = await saveVehicleMaster(payload);

        if (res && res.success !== false) {
          toast.success(
            editingId
              ? "Vehicle record updated successfully!"
              : "Vehicle record saved successfully!"
          );
          handleReset();
          // Refresh list
          const listRes = await getVehicleList();
          if (listRes && listRes.data) {
            setVehicles(listRes.data);
          }
        } else {
          toast.error(res?.message || "Failed to save vehicle details");
        }
      } catch (error: any) {
        console.error("Save vehicle error:", error);
        toast.error("An error occurred while saving vehicle data.");
      } finally {
        setSaving(false);
      }
    },
  });

  // Reset form handler
  const handleReset = () => {
    formik.resetForm();
    setEditingId(null);
    setVehicleExistsWarning(null);
  };

  // Check vehicle number existence on blur
  const handleVehicleNoBlur = async () => {
    formik.handleBlur("vehicleNo");
    const vNo = formik.values.vehicleNo.trim();
    if (!vNo) return;

    try {
      const res = await checkVehicleNo(vNo, formik.values.academicYear);
      if (res && res.exists && res.data) {
        const existingId = res.data.ID || res.data.id;
        if (existingId && existingId.toString() !== editingId?.toString()) {
          setVehicleExistsWarning(
            `Vehicle No '${vNo}' already exists in record (ID: ${existingId}).`
          );
          toast.warning(`Vehicle No '${vNo}' already exists in system.`);
        } else {
          setVehicleExistsWarning(null);
        }
      } else {
        setVehicleExistsWarning(null);
      }
    } catch (err) {
      console.warn("Check vehicle number API check skipped or failed:", err);
    }
  };

  // Edit vehicle row
  const handleEdit = (vehicle: Vehicle) => {
    const vId = vehicle.ID || vehicle.id || "";
    setEditingId(vId);
    setVehicleExistsWarning(null);
    formik.setValues({
      id: vId.toString(),
      routeName: vehicle.ROUTENAME || vehicle.routeName || "",
      vehicleNo: vehicle.VEHICLENO || vehicle.vehicleNo || "",
      vehicleRegNo: vehicle.VEHICLEREGNO || vehicle.vehicleRegNo || "",
      vehicleCapacity: (vehicle.VEHICLECAPACITY || vehicle.vehicleCapacity || "").toString(),
      driverName: vehicle.DRIVERNAME || vehicle.driverName || "",
      userId: vehicle.CreatedById || "T589",
      academicYear: vehicle.AcademicYear || "2026-2027",
      financialYear: vehicle.FinancialYear || "Apr-2017 t",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete vehicle row
  const handleDelete = async (vehicle: Vehicle) => {
    const vId = vehicle.ID || vehicle.id;
    const vNo = vehicle.VEHICLENO || vehicle.vehicleNo || "this vehicle";
    if (!vId) return;

    if (window.confirm(`Are you sure you want to delete Vehicle '${vNo}'?`)) {
      try {
        await deleteVehicleMaster(vId);
        toast.success(`Vehicle '${vNo}' deleted successfully!`);
        // Remove locally or refresh
        setVehicles((prev) => prev.filter((item) => (item.ID || item.id) !== vId));
      } catch (err) {
        console.error("Delete error:", err);
        toast.error("Failed to delete vehicle record.");
      }
    }
  };

  // Handle Search API or Client-side Filter
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      fetchData();
      return;
    }

    try {
      const searchRes = await searchVehicleMaster(searchQuery);
      if (searchRes && searchRes.data) {
        setVehicles(searchRes.data);
        toast.success(`Found ${searchRes.data.length} vehicle(s)`);
      } else {
        // Fallback filter locally
        filterLocally();
      }
    } catch (err) {
      filterLocally();
    }
  };

  const filterLocally = () => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      fetchData();
      return;
    }
    const filtered = vehicles.filter((v) => {
      const vNo = (v.VEHICLENO || v.vehicleNo || "").toLowerCase();
      const rName = (v.ROUTENAME || v.routeName || "").toLowerCase();
      const dName = (v.DRIVERNAME || v.driverName || "").toLowerCase();
      const vReg = (v.VEHICLEREGNO || v.vehicleRegNo || "").toLowerCase();
      return (
        vNo.includes(q) || rName.includes(q) || dName.includes(q) || vReg.includes(q)
      );
    });
    setVehicles(filtered);
  };

  const displayedVehicles = vehicles.filter((v) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const vNo = (v.VEHICLENO || v.vehicleNo || "").toLowerCase();
    const rName = (v.ROUTENAME || v.routeName || "").toLowerCase();
    const dName = (v.DRIVERNAME || v.driverName || "").toLowerCase();
    const vReg = (v.VEHICLEREGNO || v.vehicleRegNo || "").toLowerCase();
    return vNo.includes(q) || rName.includes(q) || dName.includes(q) || vReg.includes(q);
  });

  return (
    <div className="dbs-vehicle-container">
      {/* Top Header Card - Matching Reference ERP layout */}
      <div className="dbs-erp-header-card">
        <div className="dbs-erp-header-title">
          <span className="dbs-erp-system-name">LBRCE ERP</span>
          <h1 className="dbs-erp-college-name">
            LAKIREDDY BALI REDDY COLLEGE OF ENGG
          </h1>
        </div>
        <div className="dbs-erp-meta">
          <div className="dbs-erp-badge">
            <ShieldCheck size={16} />
            <span>2026-2027</span>
          </div>
          <div className="dbs-erp-user">
            <div className="dbs-erp-avatar">S</div>
            <span>SREEDHAR. R</span>
          </div>
        </div>
      </div>

    
      {/* Page Title */}
      <div className="dbs-page-header">
        <h2>
          <Bus className="text-blue-600" size={24} /> Vehicle Master
        </h2>
      </div>

      {/* Form Card */}
      <form onSubmit={formik.handleSubmit}>
        <div className="dbs-vehicle-form-card">
          <div className="dbs-form-card-title">
            <h3>{editingId ? "Edit Vehicle Details" : "Add New Vehicle Details"}</h3>
            {editingId && (
              <span className="dbs-editing-badge">
                <SquarePen size={14} /> Editing Record (ID: {editingId})
              </span>
            )}
          </div>

          <div className="dbs-form-grid-5">
            {/* Route Name Field */}
            <div className="dbs-input-box">
              <label htmlFor="routeName">Route Name *</label>
              <select
                id="routeName"
                name="routeName"
                value={formik.values.routeName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="">Select Route Name</option>
                {routes.map((r, idx) => (
                  <option key={idx} value={r.ROUTENAME}>
                    {r.ROUTENAME}
                  </option>
                ))}
              </select>
              {formik.touched.routeName && formik.errors.routeName && (
                <div className="dbs-error-text">{formik.errors.routeName}</div>
              )}
            </div>

            {/* Vehicle Service No Field */}
            <div className="dbs-input-box">
              <label htmlFor="vehicleNo">Vehicle Service No. *</label>
              <input
                type="text"
                id="vehicleNo"
                name="vehicleNo"
                placeholder="e.g. J01, S01"
                value={formik.values.vehicleNo}
                onChange={formik.handleChange}
                onBlur={handleVehicleNoBlur}
              />
              {formik.touched.vehicleNo && formik.errors.vehicleNo && (
                <div className="dbs-error-text">{formik.errors.vehicleNo}</div>
              )}
              {vehicleExistsWarning && (
                <div className="dbs-exists-warning">{vehicleExistsWarning}</div>
              )}
            </div>

            {/* Vehicle Reg. No Field */}
            <div className="dbs-input-box">
              <label htmlFor="vehicleRegNo">Vehicle Reg.No. *</label>
              <input
                type="text"
                id="vehicleRegNo"
                name="vehicleRegNo"
                placeholder="e.g. AP16TJ0296"
                value={formik.values.vehicleRegNo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.vehicleRegNo && formik.errors.vehicleRegNo && (
                <div className="dbs-error-text">{formik.errors.vehicleRegNo}</div>
              )}
            </div>

            {/* Vehicle Capacity Field */}
            <div className="dbs-input-box">
              <label htmlFor="vehicleCapacity">Vehicle Capacity *</label>
              <input
                type="number"
                id="vehicleCapacity"
                name="vehicleCapacity"
                placeholder="e.g. 58"
                value={formik.values.vehicleCapacity}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.vehicleCapacity && formik.errors.vehicleCapacity && (
                <div className="dbs-error-text">{formik.errors.vehicleCapacity}</div>
              )}
            </div>

            {/* Driver Name Field */}
            <div className="dbs-input-box">
              <label htmlFor="driverName">Driver Name *</label>
              {drivers.length > 0 ? (
                <select
                  id="driverName"
                  name="driverName"
                  value={formik.values.driverName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="">Select Driver</option>
                  {drivers.map((d, idx) => (
                    <option key={idx} value={d.DRIVERNAME}>
                      {d.DRIVERNAME}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  id="driverName"
                  name="driverName"
                  placeholder="Enter Driver Name"
                  value={formik.values.driverName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              )}
              {formik.touched.driverName && formik.errors.driverName && (
                <div className="dbs-error-text">{formik.errors.driverName}</div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="dbs-form-actions-row">
            <button
              type="button"
              className="dbs-form-cancel-btn"
              onClick={handleReset}
            >
              <RotateCcw size={15} /> Cancel / Clear
            </button>
            <button
              type="submit"
              className="dbs-form-save-btn"
              disabled={saving}
            >
              {saving ? (
                <>
                  <RefreshCw className="animate-spin" size={16} /> Saving...
                </>
              ) : (
                <>
                  <Save size={16} /> {editingId ? "Update Vehicle" : "Save Vehicle"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Search & Records Section */}
      <div className="dbs-search-card">
        <form className="dbs-search-box-wrapper" onSubmit={handleSearchSubmit}>
          <div className="dbs-search-input-group">
            <Search className="dbs-search-icon" size={18} />
            <input
              type="text"
              className="dbs-search-input"
              placeholder="By VehicleNo. or DriverName"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="dbs-search-btn">
            Search
          </button>
        </form>

        <button className="dbs-refresh-btn" onClick={fetchData}>
          <RefreshCw size={15} /> Refresh List
        </button>
      </div>

      {/* Reactive Table Grid */}
      <div className="dbs-table-container">
        {loading ? (
          <div className="dbs-empty-state">
            <RefreshCw className="animate-spin dbs-empty-state-icon" />
            <div className="dbs-empty-state-title">Loading vehicle data...</div>
          </div>
        ) : displayedVehicles.length === 0 ? (
          <div className="dbs-empty-state">
            <AlertCircle className="dbs-empty-state-icon" />
            <div className="dbs-empty-state-title">No vehicle records found</div>
            <div className="dbs-empty-state-desc">
              {searchQuery
                ? `No matches found for "${searchQuery}". Try clearing search.`
                : "Add a new vehicle record above."}
            </div>
          </div>
        ) : (
          <div className="dbs-data-table-wrapper">
            <table className="dbs-data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Route Name</th>
                  <th>Vehicle Service No.</th>
                  <th>Vehicle Reg.No.</th>
                  <th>Vehicle Capacity</th>
                  <th>Driver Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedVehicles.map((veh, index) => {
                  const vId = veh.ID || veh.id || index;
                  const routeName = veh.ROUTENAME || veh.routeName || "-";
                  const vehicleNo = veh.VEHICLENO || veh.vehicleNo || "-";
                  const vehicleRegNo = veh.VEHICLEREGNO || veh.vehicleRegNo || "-";
                  const capacity = veh.VEHICLECAPACITY || veh.vehicleCapacity || "-";
                  const driverName = veh.DRIVERNAME || veh.driverName || "Not Assigned";

                  return (
                    <tr key={vId}>
                      <td>{index + 1}</td>
                      <td>
                        <span className="dbs-route-pill">{routeName}</span>
                      </td>
                      <td>
                        <strong>{vehicleNo}</strong>
                      </td>
                      <td>{vehicleRegNo}</td>
                      <td>
                        <span className="dbs-capacity-badge">{capacity} Seats</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <User size={14} className="text-slate-400" />
                          <span>{driverName}</span>
                        </div>
                      </td>
                      <td>
                        <div className="dbs-btn-actions">
                          <button
                            className="dbs-btn-edit"
                            title="Edit Vehicle"
                            onClick={() => handleEdit(veh)}
                          >
                            <SquarePen size={15} /> Edit
                          </button>
                          <button
                            className="dbs-btn-delete"
                            title="Delete Vehicle"
                            onClick={() => handleDelete(veh)}
                          >
                            <Trash2 size={15} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <footer className="dbs-erp-footer">
        <p>2017 © ERP by D Base Solutions.</p>
      </footer>
    </div>
  );
};

export default VehicleMaster;
