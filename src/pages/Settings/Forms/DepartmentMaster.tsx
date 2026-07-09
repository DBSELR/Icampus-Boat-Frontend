import React, { useEffect, useState } from "react";
import { Save, Trash2, Edit3, AlertTriangle, HelpCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {SquarePen} from "lucide-react";
import "./DepartmentMaster.css";
import { API_BASE } from "../../../config";

const DepartmentMaster = () => {
  const sortedStudents = []; // Placeholder for sorted students data
 
  const [saveStatus, setSaveStatus] = useState(false);
  const [payLoad, setPayload] = useState({
    Id:"",
    DepartmentCode: "",
    Department: "",
    DepartmentType: "",
    Description: ""
  });

  interface DepartmentData {
    id: number;
    departmentCode: string;
    department: string;
    departmentType: string;
    description: string;
  }

 const [deptdata, setDeptdata] = useState<DepartmentData[]>([]);
  //console.log(saveStatus);

  const handlesave = async () => {
    try {
      const response = await axios.post(`${API_BASE}DepartmentMaster/SaveDepartmentMaster`, payLoad);
      setSaveStatus(response.data);
      console.log(response.data, "Save Response");
      toast.success("Department Data Saved Successfully");
    } catch (error) {
      console.log(error, "Error");
      toast.error("Failed to save Department Data");
    }
  };

  const handleedit = (dept: DepartmentData) => {
    setPayload({
      Id: dept.id.toString(),
      DepartmentCode: dept.departmentCode,
      Department: dept.department,
      DepartmentType: dept.departmentType,
      Description: dept.description
    });
  };

  const hanbdleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPayload((prevPayload) => ({
      ...prevPayload,
      [name]: value
    }));
  };

  console.log(deptdata, "Department Data");
  useEffect(()=>{
    const fetchdata = async()=>{
      try{
        const response = await axios.get(`${API_BASE}DepartmentMaster/GetDepartmentMaster`);
        setDeptdata(response.data);     
        toast.success("Department Data Fetched Successfully");   
      }
      catch(error){
       console.log(error, "Error")
       toast.error("Failed to fetch Department Data");
      }
    }
    fetchdata();
  },[]

  )

  return (
    <div className="dbs-department-container">
      {/* Header */}
      <div className="dbs-department-form-header">
        <h2>Department Master</h2>
      </div>

      {/* Form Card */}
      <div className="dbs-form-card">
        <h3>Department Information</h3>
        <div className="dbs-form-grid-3">
          <div className="dbs-input-box">
            <label>Department Code</label>
            <input
              type="text"
              placeholder="Enter Department Code"
              value={payLoad.DepartmentCode}
              name="DepartmentCode"
              onChange={hanbdleInputChange}
            />
          </div>
          <div className="dbs-input-box">
            <label>Department</label>
            <input
              type="text"
              placeholder="Enter Department Name"
              value={payLoad.Department}
              name="Department"
              onChange={hanbdleInputChange}
            />
          </div>
          <div className="dbs-input-box">
            <label>Department Type</label>
            <select
              value={payLoad.DepartmentType}
              name="DepartmentType"
              onChange={hanbdleInputChange}
            >
              <option value="0">Select Programme</option>
              <option value="T">Teaching</option>
              <option value="NT">Non-Teaching</option>
            </select>
          </div>
          <div className="dbs-input-box">
            <label>Description</label>
            <input
              type="text"
              placeholder="Enter DescriptionEnter Like Bachelor Of Technology"
              value={payLoad.Description}
              name="Description"
              onChange={hanbdleInputChange}
            />
          </div>
        </div>

        {/* Form Buttons */}
        <div className="dbs-form-actions-row">
          <button type="button" className="dbs-form-cancel-btn">
            Cancel / Reset
          </button>
          <button
            type="submit"
            className="dbs-form-save-btn"
            onClick={handlesave}
          >
            <Save size={16} />
            Save Department
          </button>
        </div>
      </div>

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
                    <button className="dbs-btn-edit" onClick={() => handleedit(dept)}>
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