import React, { useEffect, useState } from "react";
import { Save, Trash2, Edit3, AlertTriangle, HelpCircle, AlertCircle, SquarePen } from "lucide-react";
import { toast } from "sonner";
import "./ReguMaster.css";
import Footer from '../../../common/Footer'
import { fetchRegulation, saveRegu } from "../../../apis/SettingsApis";

const ReguMaster = () => {
  const sortedStudents = []; // Placeholder for sorted students data
  const ACYR = localStorage.getItem("academicYear")
  const userData = localStorage.getItem("user");

  let userId = "";

  if (userData) {
    const user = JSON.parse(userData);
    userId = user.userId;
  }


  interface reguLoad {
    rid: string;
    regulation: string;
    academicYear: string;
    userid: string;
  }

  interface reguSave {
    Regu: string;
  }

  const [reguInputs, setReguInputs] = useState<reguSave>({
    Regu: "",
  })

  const [reguLoad, setReguLoad] = useState<reguLoad[]>([])
  const [reguLoading, setReguLoading] = useState(false)

  const fetchRegu = async () => {
    try {
      setReguLoading(true)
      const response = await fetchRegulation()
      setReguLoad(response)
    }
    catch (error) {
      toast.error("Fetching Regu Master Failed...!")
    }
    finally {
      setReguLoading(false)
    }
  }

  const oncancel = () => {
    setReguInputs({ Regu: "" });
    fetchRegu();
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setReguInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const Handlesave = async () => {
    try {
      const payload = {
        Regu: reguInputs.Regu,
        AcademicYear: ACYR,
        Userid: userId,
      }
      //console.log(payload)
      const response = await saveRegu(payload)
      if (response?.rowsAffected > 0) {
        toast.success("Subject updated successfully!");
        oncancel();
      }
      else { toast.error("Failed to save Regulation!") }

    }
    catch (error) {
      toast.error("Failed to save Regulation");
    }
  }

  useEffect(() => {
    fetchRegu();
  }, [])

  return (
    <div className="dbs-regu-container">

      {/* Header */}
      <div className="dbs-regu-form-header">
        <h2>Regulation Master</h2>
      </div>

      {/* Form Card */}
      <div className="dbs-form-card">
        <h3>Regulation Information</h3>
        <div className="dbs-form-grid-4">
          <div className="dbs-input-box">
            <label>Regulation</label>
            <input type="text" placeholder="Enter Regulation" name="Regu" value={reguInputs.Regu} onChange={handleChange} />
          </div>

        </div>

        {/* Form Buttons */}
        <div className="dbs-form-actions-row">
          <button type="button" className="dbs-form-cancel-btn" onClick={oncancel}>
            Cancel / Reset
          </button>
          <button type="submit" className="dbs-form-save-btn" onClick={Handlesave}>
            <Save size={16} />
            Save Regulation
          </button>
        </div>
      </div>

      {/* Reactive Table Grid */}
      <div className="dbs-table-container">
        {reguLoad.length === 0 ? (
          <div className="dbs-empty-state">
            <AlertCircle className="dbs-empty-state-icon" />
            <div className="dbs-empty-state-title">No records found</div>
            <div className="dbs-empty-state-desc">Try clearing your filters or add a new student above.</div>
          </div>
        ) : (
          <div className="dbs-table-card">
            <div
              className={
                reguLoad.length > 5
                  ? "dbs-table-scroll active-scroll"
                  : "dbs-table-scroll"
              }
            >
              <table className="dbs-data-table">
                <thead>
                  <tr>
                    <th>SL.NO</th>
                    <th>Regu</th>
                    <th>Academicyear</th>
                  </tr>
                </thead>
                <tbody>

                  {reguLoad.map((reg, index) => (
                    <tr key={reg.rid}>
                      <td >{index + 1}</td>
                      <td>{reg.regulation}</td>
                      <td>{reg.academicYear}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>


    </div>
  )
}

export default ReguMaster