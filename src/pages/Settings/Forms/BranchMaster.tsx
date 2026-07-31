import React, { useEffect, useState } from "react";
import { Save, Trash2, Edit3, AlertTriangle, HelpCircle, AlertCircle, SquarePen } from "lucide-react";
import { toast } from "sonner";
import "./BranchMaster.css";
import axios from "axios";
import { API_BASE } from "../../../config";
import Footer from "../../../common/Footer";

const BranchMaster = () => {
  const sortedStudents = []; // Placeholder for sorted students data

  const ACYR = localStorage.getItem("academicYear");

  interface Branch {
    BID: string;
    COURSE: string;
    DEPARTMENT: string;
    BRANCHCODE: string;
    BRANCHSHORTNAME: string;
    BRANCHNAME: string;
    ACADEMICYEAR: string;
    FINANCIALYEAR: string;
    FED: string;
  }

  const [branchLoad, setBranchLoad] = useState<any[]>([])
  const [programmeLoad, setProgrammeLoad] = useState<any[]>([])
  const [getDept, setGetDept] = useState<any[]>([])


  const [branchInput, setBranchInput] = useState<Branch>({
    BID: "",
    COURSE: "",
    DEPARTMENT: "",
    BRANCHCODE: "",
    BRANCHSHORTNAME: "",
    BRANCHNAME: "",
    ACADEMICYEAR: "",
    FINANCIALYEAR: "Apr-2017 to Mar-2018",
    FED: ""
  })

  const saveData = {
    BID: branchInput.BID,
    COURSE: branchInput.COURSE,
    DEPARTMENT: branchInput.DEPARTMENT,
    BRANCHCODE: branchInput.BRANCHCODE,
    BRANCHSHORTNAME: branchInput.BRANCHSHORTNAME,
    BRANCHNAME: branchInput.BRANCHNAME,
    ACADEMICYEAR: ACYR,
    FINANCIALYEAR: branchInput.FINANCIALYEAR,
    FED: branchInput.FED
  }


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setBranchInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validation = () => {
    if (saveData.COURSE == "") {
      toast.warning("Select Programme")
      return
    }
    if (saveData.DEPARTMENT == "") {
      toast.warning("Select Department")
      return
    }
    if (saveData.FED == "") {
      toast.warning("Select FED")
      return
    }
    if (saveData.BRANCHCODE == "") {
      toast.warning("Enter Barnch Code")
      return
    }
    if (saveData.BRANCHSHORTNAME == "") {
      toast.warning("Enter Barnch Short Name")
      return
    }
    if (saveData.BRANCHNAME == "") {
      toast.warning("Enter Barnch Name")
      return
    }
    return true;
  }

  const onCancel = () => {
    setBranchInput({
      BID: "",
      COURSE: "",
      DEPARTMENT: "",
      BRANCHCODE: "",
      BRANCHSHORTNAME: "",
      BRANCHNAME: "",
      ACADEMICYEAR: "",
      FINANCIALYEAR: "Apr-2017 to Mar-2018",
      FED: ""
    })
  };

  const onHanbleSave = async () => {
    try {
      if (!validation()) return;

      const response = await axios.post(`${API_BASE}BranchMaster/SaveBranchMaster`, saveData)
      if (saveData.BID) {
        toast.success("Branch Data Updated Successfully");
      } else {
        toast.success("Branch Data Saved Successfully");
      }

      onCancel();

      const resData = await axios.post(
        `${API_BASE}BranchMaster/GetBranchMaster`,
        { ACADEMICYEAR: saveData.ACADEMICYEAR },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      // console.log(response,"res1111111111")
      setBranchLoad(resData.data);


    }
    catch (error) {
      toast.error("Failed to save Branch Data");
    }

    console.log(branchInput)
  }



  const onHandleEdit = (bracnhdata: any) => {
    setBranchInput(prev => ({
      ...prev,
      BID: bracnhdata.BID,
      COURSE: bracnhdata.COURSECODE.split("-")[0].trim(),
      DEPARTMENT: bracnhdata.DEPARTMENTCODE.split("-")[0].trim(),
      FED: bracnhdata.FED,
      BRANCHCODE: bracnhdata.BRANCHCODE,
      BRANCHSHORTNAME: bracnhdata.BSNAME,
      BRANCHNAME: bracnhdata.BRANCHNAME,
    }));
  };


  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);


  const totalRecords = branchLoad.length;

  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const startIndex = (currentPage - 1) * recordsPerPage;

  const endIndex = startIndex + recordsPerPage;

  const currentData = branchLoad.slice(startIndex, endIndex);

///// Footer Index Starts /////
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
  ///// Footer Index Ends /////


  useEffect(() => {
    const fetchDept = async () => {
      try {
        const response = await axios.get(`${API_BASE}BranchMaster/GetDepartmentList`)
        setGetDept(response.data)

      }
      catch (error) {
        toast.error("Department Data Not Found!")
      }
    }
    fetchDept();

    const fetchprogramme = async () => {
      const response = await axios.post(
        `${API_BASE}ProgrammeMaster/GetProgrammeMaster`,
        { ACADEMICYEAR: saveData.ACADEMICYEAR },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      // console.log(response.data,"Pro111111111")
      setProgrammeLoad(response.data)
    }
    fetchprogramme();

    const fetchBranchData = async () => {
      const response = await axios.post(
        `${API_BASE}BranchMaster/GetBranchMaster`,
        { ACADEMICYEAR: saveData.ACADEMICYEAR },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      // console.log(response,"res1111111111")
      setBranchLoad(response.data);
    }
    fetchBranchData();
  }, [])

  return (
    <div className="dbs-branch-container">

      {/* Header */}
      <div className="dbs-branch-form-header">
        <h2>Branch Master</h2>
      </div>

      {/* Form Card */}
      <div className="dbs-form-card">
        <h3>Branch Information</h3>
        <div className="dbs-form-grid-4">

          <div className="dbs-input-box">
            <label>Programme</label>
            <select value={branchInput.COURSE} name="COURSE" onChange={handleChange} >
              <option value="">Select Programme</option>

              {programmeLoad.map((course) => (
                <option
                  key={course.COURSECODE}
                  value={course.COURSECODE}>
                  {course.COURSE}
                </option>
              ))}
            </select>
          </div>

          <div className="dbs-input-box">
            <label>Department</label>
            <select value={branchInput.DEPARTMENT} name="DEPARTMENT" onChange={handleChange}>
              <option value="">Select Department</option>

              {getDept.map((dept) => (
                <option
                  key={dept.DEPARTMENTCODE}
                  value={dept.DEPARTMENTCODE}>
                  {dept.DEPARTMENT}
                </option>
              ))}
            </select>
          </div>
          <div className="dbs-input-box">
            <label>First Year Department</label>
            <select value={branchInput.FED} name="FED" onChange={handleChange}>
              <option value="">Select Department</option>

              {getDept.map((dept) => (
                <option
                  key={dept.DEPARTMENTCODE}
                  value={dept.DEPARTMENTCODE}>
                  {dept.DEPARTMENT}
                </option>
              ))}
            </select>
          </div>
          <div className="dbs-input-box">
            <label>Branch code</label>
            <input type="text" value={branchInput.BRANCHCODE} name="BRANCHCODE" onChange={handleChange} required />
          </div>
          <div className="dbs-input-box">
            <label>Branch Short Name</label>
            <input type="text" value={branchInput.BRANCHSHORTNAME} name="BRANCHSHORTNAME" onChange={handleChange} />
          </div>
          <div className="dbs-input-box">
            <label>Branch Name</label>
            <input type="text" value={branchInput.BRANCHNAME} name="BRANCHNAME" onChange={handleChange} />
          </div>
        </div>

        {/* Form Buttons */}
        <div className="dbs-form-actions-row">
          <button type="button" className="dbs-form-cancel-btn" >
            Cancel / Reset
          </button>
          <button type="submit" className="dbs-form-save-btn" onClick={onHanbleSave}>
            <Save size={16} />
            Save Branch
          </button>
        </div>

      </div>

      {/* Reactive Table Grid */}
      <div className="dbs-table-container">
        {branchLoad.length === 0 ? (
          <div className="dbs-empty-state">
            <AlertCircle className="dbs-empty-state-icon" />
            <div className="dbs-empty-state-title">No records found</div>
          </div>
        ) : (
            <div className="dbs-table-card">
            <div
              className={
                branchLoad.length > 5
                  ? "dbs-table-scroll active-scroll"
                  : "dbs-table-scroll"
              }
            >
            <table className="dbs-data-table">
              <thead>
                <tr>
                  <th >SlNo.</th>
                  <th >Programme</th>
                  <th >Department</th>
                  <th >Branch code</th>
                  <th>Short Name</th>
                  <th>Branch Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((bracnhdata, index) => (
                  <tr key={bracnhdata.BID}>
                    <td>{index + 1}</td>
                    <td>{bracnhdata.COURSECODE}</td>
                    <td>{bracnhdata.DEPARTMENTCODE}</td>
                    <td>{bracnhdata.BRANCHCODE}</td>
                    <td>{bracnhdata.BSNAME}</td>
                    <td>{bracnhdata.BRANCHNAME}</td>
                    <td>
                      <button
                        className="dbs-icon-btn edit"
                        onClick={() => onHandleEdit(bracnhdata)}
                      >
                        <SquarePen size={16} />
                      </button>
                      {/* <button className="btn-delete">Delete</button> */}
                    </td>
                  </tr>
                ))
                }
              </tbody>
            </table>
          </div>
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
  )
}

export default BranchMaster