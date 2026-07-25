import React, { useEffect, useState } from "react";
import { Save, Trash2, Edit3, AlertTriangle, HelpCircle, AlertCircle, SquarePen } from "lucide-react";
import { toast } from "sonner";
import "./ProgrammeMaster.css";
import axios from "axios";
import { API_BASE } from "../../../config";

const ProgrammeMaster = () => {
  const sortedStudents = []; // Placeholder for sorted students data

  const ACYR= localStorage.getItem("academicYear");

  interface Payload {
  CID: string;
  COURSECODE: string;
  COURSE: string;
  DEGREE: string;
  YEAR: string;
  ACADEMICYEAR: string;
  FINANCIALYEAR: string;
}

const [progData,setProgData]=useState<Payload[]>([])
 console.log(progData)

const [payLoad, setPayLoad] = useState<Payload>({
  CID: "",
  COURSECODE: "",
  COURSE: "",
  DEGREE: "",
  YEAR: "",
  ACADEMICYEAR: "",
  FINANCIALYEAR: "",
});

const data = {
  CID: payLoad.CID,
  COURSECODE: payLoad.COURSECODE,
  COURSE: payLoad.COURSE,
  DEGREE: payLoad.DEGREE,
  YEAR: payLoad.YEAR,
  ACADEMICYEAR: ACYR,
  FINANCIALYEAR: payLoad.FINANCIALYEAR,
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;

  setPayLoad((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const onCancel = ()=>{
  setPayLoad({
  CID: "",
  COURSECODE: "",
  COURSE: "",
  DEGREE: "",
  YEAR: "",
  ACADEMICYEAR: "",
  FINANCIALYEAR: "",
})};

const validation=()=>{
 if(data.COURSECODE=="")
      {toast.warning("Enter Course code")
        return
      }
      if(data.COURSE=="")
      {toast.warning("Enter Course")
        return
      }
      if(data.DEGREE=="")
      {toast.warning("Enter Degree")
        return
      }
      if(data.YEAR=="")
      {toast.warning("Enter Year")
        return
      }
      return true;
}

  const onHandleSave = async () => {
    try {
     if(!validation()) return;      
      const responce = await axios.post(`${API_BASE}ProgrammeMaster/SaveProgrammeMaster`, data)
      console.log(data,"Save")
      if (payLoad.CID) {
        toast.success("Programme Data Updated Successfully");
      } else {
        toast.success("Programme Data Saved Successfully");
      }
      onCancel();
       const resData = await axios.post(`${API_BASE}ProgrammeMaster/GetProgrammeMaster`, data)
        console.log(resData,"resData");
        setProgData(resData.data);
      
    }
    catch (error) {
      toast.error("Failed to save Programme Data");
    }
  }

  const onHandleEdit = (pro: Payload) => {
  setPayLoad({
    CID: pro.CID.toString(),
    COURSECODE: pro.COURSECODE,
    COURSE: pro.COURSE,
    DEGREE: pro.DEGREE,
    YEAR: pro.YEAR.toString(),
    ACADEMICYEAR: pro.ACADEMICYEAR,
    FINANCIALYEAR: pro.FINANCIALYEAR,
  });
};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resData = await axios.post(`${API_BASE}ProgrammeMaster/GetProgrammeMaster`, data)
        console.log(resData,"resData");
        setProgData(resData.data);
      }
      catch (error) {
        toast.error("Failed to fetch Department Data");
      }
    }
    fetchData();
  },[]);


  return (
    <div className="dbs-programme-container">

       {/* Header */}
      <div className="dbs-programme-form-header">
        <h2>Programme Master</h2>
      </div>

       {/* Form Card */}
      <div className="dbs-form-card">
        <h3>Programme Information</h3>
        <div className="dbs-form-grid-4">
          <div className="dbs-input-box">
            <label>Programme Code</label>
            <input type="text" placeholder="Enter Programme Code" value={payLoad.COURSECODE} name="COURSECODE" onChange={handleChange}   />
          </div>
          <div className="dbs-input-box">
            <label>Programme</label>
            <input type="text" placeholder="Enter Programme Name"value={payLoad.COURSE} name="COURSE" onChange={handleChange}/>
          </div>
          <div className="dbs-input-box">
            <label>Degree</label>
            <input type="text" placeholder="Enter Degree" value={payLoad.DEGREE} name="DEGREE" onChange={handleChange}/>
          </div>
          <div className="dbs-input-box">
            <label>Maximum Year(S)</label>
            <input type="text" placeholder="Enter Maximum Year(S)" value={payLoad.YEAR} name="YEAR" onChange={handleChange}/>
          </div>
        </div>

        {/* Form Buttons */}
          <div className="dbs-form-actions-row">
            <button type="button" className="dbs-form-cancel-btn" >
              Cancel / Reset
            </button>
            <button type="submit" className="dbs-form-save-btn" onClick={onHandleSave}>
              <Save size={16} />
              Save Programme
            </button>
          </div>

      </div>


        {/* Reactive Table Grid */}
              <div className="dbs-table-container">
                {progData.length === 0 ? (
                  <div className="dbs-empty-state">
                    <AlertCircle className="dbs-empty-state-icon" />
                    <div className="dbs-empty-state-title">No records found</div>
                  </div>
                ) : (
                  <table className="dbs-data-table">
                    <thead>
                      <tr>
                        <th style={{ cursor: 'pointer' }}>SlNo.</th>
                        <th  style={{ cursor: 'pointer' }}>Programme code</th>
                        <th  style={{ cursor: 'pointer' }}>Programme</th>
                        <th  style={{ cursor: 'pointer' }}>Degree</th>
                        <th  style={{ cursor: 'pointer' }}>Maximum Year(S)</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
              <tbody>
                {progData.map((pro,index) => (
                 
                  <tr key={pro.CID}>
                    <td>{index+1}</td>
                    <td>{pro.COURSECODE}</td>
                    <td>{pro.COURSE}</td>
                    <td>{pro.DEGREE}</td>
                    <td>{pro.YEAR}</td>
                    <td>
                      <button
                        className="dbs-btn-edit"
                        onClick={()=>onHandleEdit(pro)}
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
                )}
              </div>


      
      </div>
  )
}

export default ProgrammeMaster