import React, { useEffect, useState } from "react";
import { Save, RotateCcw, Edit3 } from "lucide-react";
import { toast } from "sonner";

import "./CasteMaster.css";
import { getCasteMaster, saveCaste } from "../../../apis/SettingsApis";

interface CasteRecord {
  casteid: number;
  caste: string;
}

const CasteMaster = () => {
  const [casteList, setCasteList] = useState<any[]>([]);
  const [loadingCaste, setLoadingCaste] = useState(false);
  const [saving, setSaving] = useState(false);
  const [caste, setCaste] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  const fetchCasteMaster = async () => {
    try {
      setLoadingCaste(true);

      const response = await getCasteMaster();

      console.log("Caste Master Response:", response);

      setCasteList(response || []);
    } catch (error) {
      console.log("Caste Master Fetch Error:", error);

      setCasteList([]);
    } finally {
      setLoadingCaste(false);
    }
  };

  useEffect(() => {
    fetchCasteMaster();
  }, []);

  const handleReset = () => {
    setCaste("");

    setEditId(null);
  };

  const handleSave = async () => {
    if (!caste.trim()) {
      toast.error("Enter Caste");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        casteid: editId ? String(editId) : "",
        casteCode: "",
        caste: caste,
        academicYear: localStorage.getItem("academicYear"),
        financialYear: "Apr-2017 to Mar-2018",
        subCasteid: "",
        subCasteCode: "",
        subCaste: "",
      };

      console.log("Save Caste Payload:", payload);

      const response = await saveCaste(payload);

      console.log("Save Caste Response:", response);

      if (
        response?.message === "Success" ||
        response?.rowsAffected > 0 ||
        response
      ) {
        toast.success(
          editId ? "Caste Updated Successfully" : "Caste Saved Successfully",
        );

        fetchCasteMaster();

        handleReset();
      } else {
        toast.error("Unable to Save Caste");
      }
    } catch (error) {
      console.log("Save Caste Error:", error);

      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditId(Number(item.casteid || item.cID || item.id));

    setCaste(item.caste || "");
  };

  return (
    <div className="dbs-caste-container">
      <div className="dbs-caste-header">
        <h2>Caste Master</h2>
      </div>

      <div className="dbs-caste-form-card">
        <h3>Caste Configuration</h3>

        <div className="dbs-caste-form-grid">
          <div className="dbs-caste-input-box">
            <label>Caste</label>

            <input
              value={caste}
              placeholder="Enter Caste"
              onChange={(e) => setCaste(e.target.value)}
            />
          </div>
        </div>

        <div className="dbs-caste-actions">
          <button className="dbs-caste-reset-btn" onClick={handleReset}>
            <RotateCcw size={16} />
            Reset
          </button>

          <button
            className="dbs-caste-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={16} />

            {saving ? "Saving..." : editId ? "Update" : "Save"}
          </button>
        </div>
      </div>

      <div className="dbs-caste-table-card">
        <div className="dbs-caste-table-header">
          <h3>Caste List</h3>

          <span>Total Records : {casteList.length}</span>
        </div>

        <div className="dbs-caste-table-scroll">
          <table className="dbs-caste-data-table">
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Caste</th>
                <th>Edit</th>
              </tr>
            </thead>

            <tbody>
              {loadingCaste ? (
                <tr>
                  <td colSpan={3} align="center">
                    Loading Caste Details...
                  </td>
                </tr>
              ) : casteList.length === 0 ? (
                <tr>
                  <td colSpan={3} align="center">
                    No Records Found
                  </td>
                </tr>
              ) : (
                casteList.map((item: any, index: number) => (
                  <tr key={index}>
                    <td>{index + 1}</td>

                    <td>{item.caste}</td>

                    <td>
                      <button
                        className="dbs-caste-edit-btn"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit3 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CasteMaster;
