import React, { useEffect, useState } from "react";
import {
  Save,
  Trash2,
  Edit3,
  AlertTriangle,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { SquarePen } from "lucide-react";
import "./DepartmentMaster.css";
import { API_BASE } from "../../../config";
import { Form, useFormik } from "formik";
import { departmentValidationSchema } from "../../../Validations/SettingsValidations";

const DepartmentMaster = () => {

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
        console.log(values, "Values");
        const response = await axios.post(`${API_BASE}DepartmentMaster/SaveDepartmentMaster`,data);
        // Refresh the department list
        if(data.Id){
          toast.success("Department Data Updated Successfully");
        }else{ 
          toast.success("Department Data Saved Successfully");} 
        handleCancel();
        await axios.get(`${API_BASE}DepartmentMaster/GetDepartmentMaster`)
          .then((response) => {
            setDeptdata(response.data);
          });        
      } catch (error) {
        console.log(error, "Error");
        toast.error("Failed to save Department Data");
      }
    },
  });


  interface DepartmentData {
    id: number;
    departmentCode: string;
    department: string;
    departmentType: string;
    description: string;
  }

  const [deptdata, setDeptdata] = useState<DepartmentData[]>([]);


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
  };


  console.log(deptdata, "Department Data");

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const response = await axios.get(
          `${API_BASE}DepartmentMaster/GetDepartmentMaster`,
        );
        setDeptdata(response.data);
        toast.success("Department Data Fetched Successfully");
      } catch (error) {
        console.log(error, "Error");
        toast.error("Failed to fetch Department Data");
      }
    };
    fetchdata();
  }, []);

  return (
    <div className="dbs-department-container">
      {/* Header */}
      <div className="dbs-department-form-header">
        <h2>Department Master</h2>
      </div>

      {/* Form Card */}
      <form onSubmit={formik.handleSubmit}>
        <div className="dbs-form-card">
          <h3>Department Information</h3>
          <div className="dbs-form-grid-3">
            <div className="dbs-input-box">
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
                  <div className="dbs-error-text">
                    {formik.errors.DepartmentCode}
                  </div>
                )}
            </div>
            <div className="dbs-input-box">
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
                <div className="dbs-error-text">{formik.errors.Department}</div>
              )}
            </div>
            <div className="dbs-input-box">
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
                  <div className="dbs-error-text">
                    {formik.errors.DepartmentType}
                  </div>
                )}
            </div>
            <div className="dbs-input-box">
              <label>Description</label>
              <input
                type="text"
                placeholder="Enter DescriptionEnter Like Bachelor Of Technology"
                value={formik.values.Description}
                name="Description"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.Description && formik.errors.Description && (
                <div className="dbs-error-text">
                  {formik.errors.Description}
                </div>
              )}
            </div>
          </div>

          {/* Form Buttons */}
          <div className="dbs-form-actions-row">
            <button
              type="button"
              className="dbs-form-cancel-btn"
              onClick={() => handleCancel()}
            >
              Cancel / Reset
            </button>
            <button
              type="submit"
              className="dbs-form-save-btn"
              // onClick={handlesave}
            >
              <Save size={16} />
              Save Department
            </button>
          </div>
        </div>
      </form>

      {/* Reactive Table Grid */}
      <div className="dbs-table-container">
        {deptdata.length === 0 ? (
          <div className="dbs-empty-state">
            <AlertCircle className="dbs-empty-state-icon" />
            <div className="dbs-empty-state-title">No records found</div>
            <div className="dbs-empty-state-desc">
              Try clearing your filters or add a new department above.
            </div>
          </div>
        ) : (
          <div className="dbs-empty-state">
            <table className="dbs-data-table">
              <thead>
                <tr>
                  <th style={{ cursor: "pointer" }}>Dept code</th>
                  <th style={{ cursor: "pointer" }}>Department</th>
                  <th style={{ cursor: "pointer" }}>Department Type</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deptdata.map((dept) => (
                  // console.log(deptdata, "Department Data"),
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
                        className="dbs-btn-edit"
                        onClick={() => handleedit(dept)}
                      >
                        <SquarePen size={16} />
                      </button>
                      {/* <button className="btn-delete">Delete</button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentMaster;
