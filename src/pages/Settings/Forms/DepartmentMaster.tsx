import React, { useEffect, useState } from "react";
import { Save, AlertCircle, SquarePen, X, Edit3 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import "./DepartmentMaster.css";
import { API_BASE } from "../../../config";
import { useFormik } from "formik";
import { departmentValidationSchema } from "../../../Validations/SettingsValidations";
import Footer from "../../../common/Footer";

interface DepartmentData {
  id: number;
  departmentCode: string;
  department: string;
  departmentType: string;
  description: string;
}

const DepartmentMaster = () => {
  const [deptdata, setDeptdata] = useState<DepartmentData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);

  const formik = useFormik({
    initialValues: {
      Id: "",
      DepartmentCode: "",
      Department: "",
      DepartmentType: "",
      Description: "",
    },
    validationSchema: departmentValidationSchema,
    onSubmit: async (values) => {
      const data = {
        Id: values.Id,
        DepartmentCode: values.DepartmentCode,
        Department: values.Department,
        DepartmentType: values.DepartmentType,
        Description: values.Description,
      };

      try {
        await axios.post(
          `${API_BASE}DepartmentMaster/SaveDepartmentMaster`,
          data,
        );
        if (data.Id) {
          toast.success("Department Data Updated Successfully");
        } else {
          toast.success("Department Data Saved Successfully");
        }
        handleCancel();
        await fetchDepartmentData();
      } catch (error) {
        console.error(error, "Error");
        toast.error("Failed to save Department Data");
      }
    },
  });

  const fetchDepartmentData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}DepartmentMaster/GetDepartmentMaster`,
      );
      const data = Array.isArray(response.data) ? response.data : [];
      setDeptdata(data);
      // Reset pagination after refreshing data
      setCurrentPage(1);
    } catch (error) {
      console.error(error, "Error");
      toast.error("Failed to fetch Department Data");
      setDeptdata([]);
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    fetchDepartmentData();
  }, []);

  const handleCancel = () => {
    formik.resetForm();
  };

  const handleedit = (dept: DepartmentData) => {
    formik.setValues({
      Id: dept.id.toString(),
      DepartmentCode: dept.departmentCode,
      Department: dept.department,
      DepartmentType: dept.departmentType,
      Description: dept.description,
    });
    // Optional: move to first page after editing
    setCurrentPage(1);
  };

  const totalRecords = deptdata.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = Math.min(startIndex + recordsPerPage, totalRecords);
  const currentData = deptdata.slice(startIndex, endIndex);

  const getPagination = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="dbs-department-container">
      <div className="dbs-department-header">
        <h2>Department Master</h2>
        <p>Manage and maintain department master information.</p>
      </div>

      <form onSubmit={formik.handleSubmit}>
        <div className="dbs-department-form-card">
          <h3>Department Information</h3>
          <div className="dbs-department-form-grid">
            {/* Department Code */}
            <div className="dbs-department-input-box">
              <label>Department Code</label>
              <input
                type="text"
                placeholder="Enter Department Code"
                value={formik.values.DepartmentCode}
                name="DepartmentCode"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.DepartmentCode &&
                formik.errors.DepartmentCode && (
                  <div className="dbs-department-error-text">
                    {formik.errors.DepartmentCode}
                  </div>
                )}
            </div>

            {/* Department */}
            <div className="dbs-department-input-box">
              <label>Department</label>

              <input
                type="text"
                placeholder="Enter Department Name"
                value={formik.values.Department}
                name="Department"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />

              {formik.touched.Department && formik.errors.Department && (
                <div className="dbs-department-error-text">
                  {formik.errors.Department}
                </div>
              )}
            </div>

            {/* Department Type */}
            <div className="dbs-department-input-box">
              <label>Department Type</label>

              <select
                value={formik.values.DepartmentType}
                name="DepartmentType"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="0">Select Programme</option>
                <option value="T">Teaching</option>
                <option value="NT">Non-Teaching</option>
              </select>

              {formik.touched.DepartmentType &&
                formik.errors.DepartmentType && (
                  <div className="dbs-department-error-text">
                    {formik.errors.DepartmentType}
                  </div>
                )}
            </div>

            {/* Description */}
            <div className="dbs-department-input-box">
              <label>Description</label>

              <input
                type="text"
                placeholder="Enter Description Like Bachelor Of Technology"
                value={formik.values.Description}
                name="Description"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />

              {formik.touched.Description && formik.errors.Description && (
                <div className="dbs-department-error-text">
                  {formik.errors.Description}
                </div>
              )}
            </div>
          </div>

          {/* Form Buttons */}
          <div className="dbs-department-actions">
            <button
              type="button"
              className="dbs-department-cancel-btn"
              onClick={handleCancel}
            >
              <X size={16} />
              Cancel
            </button>

            <button type="submit" className="dbs-department-save-btn">
              <Save size={16} />

              {formik.values.Id ? "Update " : "Save "}
            </button>
          </div>
        </div>
      </form>

      <div className="dbs-department-header">
        <div>
          <h2>Department List</h2>

          <p>Manage and maintain department master records.</p>
        </div>
      </div>

      <div className="dbs-department-table-card">
        {deptdata.length === 0 ? (
          <div className="dbs-department-empty-state">
            <AlertCircle className="dbs-department-empty-icon" />

            <div className="dbs-department-empty-title">No records found</div>

            <div className="dbs-department-empty-desc">
              Try clearing your filters or add a new department above.
            </div>
          </div>
        ) : (
          <div className="dbs-department-table-scroll">
            <table className="dbs-department-data-table">
              <thead>
                <tr>
                  <th>Dept Code</th>
                  <th>Department</th>
                  <th>Department Type</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentData.map((dept) => (
                  <tr key={dept.id}>
                    <td>{dept.departmentCode}</td>
                    <td>{dept.department}</td>
                    <td>
                      {dept.departmentType === "T"
                        ? "Teaching"
                        : dept.departmentType === "NT"
                          ? "Non-Teaching"
                          : dept.departmentType}
                    </td>
                    <td>{dept.description}</td>
                    <td>
                      <button
                        type="button"
                        className="dbs-department-edit-btn"
                        onClick={() => handleedit(dept)}
                      >
                        <Edit3 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Footer
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        recordsPerPage={recordsPerPage}
        setRecordsPerPage={setRecordsPerPage}
        totalRecords={totalRecords}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        getPagination={getPagination}
      />
    </div>
  );
};

export default DepartmentMaster;
