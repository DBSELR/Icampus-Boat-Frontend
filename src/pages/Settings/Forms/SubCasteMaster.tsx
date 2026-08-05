import React, { useEffect, useState } from "react";
import { Save, RotateCcw, Edit3 } from "lucide-react";
import { toast } from "sonner";

import "./SubCasteMaster.css";
import {
  getCasteMaster,
  getLoadCaste,
  getSubCasteMaster,
  saveCaste,
  saveSubCaste,
} from "../../../apis/SettingsApis";

const SubCasteMaster = () => {
  const [casteList, setCasteList] = useState<any[]>([]);
  const [subCasteList, setSubCasteList] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editId, setEditId] = useState<number | null>(null);

  const [form, setForm] = useState({
    casteid: "",
    subCasteCode: "",
    subCaste: "",
  });

  const fetchSubCaste = async () => {
    try {
      setLoading(true);
      const response = await getSubCasteMaster();
      console.log("Sub Caste Response:", response);
      setSubCasteList(response || []);
    } catch (error) {
      console.log("Sub Caste Load Error:", error);
      setSubCasteList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCaste = async () => {
    try {
      const response = await getLoadCaste();
      console.log("Load Caste:", response);
      setCasteList(response || []);
    } catch (error) {
      console.log("Load Caste Error:", error);
      setCasteList([]);
    }
  };

  useEffect(() => {
    fetchCaste();
    fetchSubCaste();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleReset = () => {
    setForm({
      casteid: "",
      subCasteCode: "",
      subCaste: "",
    });

    setEditId(null);
  };

  const handleSave = async () => {
    if (!form.casteid) {
      toast.error("Select Caste");
      return;
    }

    if (!form.subCaste.trim()) {
      toast.error("Enter Sub Caste");
      return;
    }

    try {
      setSaving(true);

      const selectedCaste = casteList.find(
        (item: any) => item.caste === form.casteid,
      );

      const payload = {
        casteid: selectedCaste?.casteid ? String(selectedCaste.casteid) : "",
        casteCode: "",
        caste: form.casteid,
        academicYear: localStorage.getItem("academicYear") || "2025-2026",
        financialYear: "Apr-2017 to Mar-2018",
        subCasteid: editId ? String(editId) : "",
        subCasteCode: form.subCaste,
        subCaste: form.subCaste,
      };

      console.log("Save Sub Caste Payload:", payload);
      const response = await saveSubCaste(payload);
      console.log("Save Sub Caste Response:", response);

      if (
        response?.message === "Success" ||
        response?.rowsAffected > 0 ||
        response
      ) {
        toast.success(
          editId
            ? "Sub Caste Updated Successfully"
            : "Sub Caste Saved Successfully",
        );

        fetchSubCaste();

        handleReset();
      } else {
        toast.error("Unable to Save Sub Caste");
      }
    } catch (error) {
      console.log("Save Sub Caste Error:", error);

      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditId(Number(item.subCasteid || item.id));

    setForm({
      casteid: item.caste,
      subCasteCode: item.subCasteCode,
      subCaste: item.subCaste,
    });
  };

  return (
    <div className="dbs-subcaste-container">
      <div className="dbs-subcaste-header">
        <h2>Sub Caste Master</h2>
      </div>

      <div className="dbs-subcaste-form-card">
        <h3>Sub Caste Configuration</h3>

        <div className="dbs-subcaste-form-grid">
          <div className="dbs-subcaste-input-box">
            <label>Caste</label>

            <select name="casteid" value={form.casteid} onChange={handleChange}>
              <option value="">Select Caste</option>

              {casteList.map((item: any, index: number) => (
                <option key={index} value={item.caste}>
                  {item.caste}
                </option>
              ))}
            </select>
          </div>

          <div className="dbs-subcaste-input-box">
            <label>Sub Caste Code</label>

            <input
              name="subCasteCode"
              value={form.subCasteCode}
              placeholder="Enter Sub Caste Code"
              onChange={handleChange}
            />
          </div>

          <div className="dbs-subcaste-input-box">
            <label>Sub Caste</label>

            <input
              name="subCaste"
              value={form.subCaste}
              placeholder="Enter Sub Caste"
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="dbs-subcaste-actions">
          <button className="dbs-subcaste-reset-btn" onClick={handleReset}>
            <RotateCcw size={16} />
            Reset
          </button>

          <button
            className="dbs-subcaste-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={16} />

            {saving ? "Saving..." : editId ? "Update" : "Save"}
          </button>
        </div>
      </div>

      <div className="dbs-subcaste-table-card">
        <div className="dbs-subcaste-table-header">
          <h3>Sub Caste List</h3>

          <span>Total Records : {subCasteList.length}</span>
        </div>

        <div className="dbs-subcaste-table-scroll">
          <table className="dbs-subcaste-data-table">
            <thead>
              <tr>
                <th>S.No.</th>

                <th>Caste</th>

                {/* <th>Sub Caste Code</th> */}

                <th>Sub Caste</th>

                <th>Edit</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} align="center">
                    Loading...
                  </td>
                </tr>
              ) : subCasteList.length === 0 ? (
                <tr>
                  <td colSpan={5} align="center">
                    No Records Found
                  </td>
                </tr>
              ) : (
                subCasteList.map((item: any, index: number) => (
                  <tr key={index}>
                    <td>{index + 1}</td>

                    <td>{item.caste}</td>

                    {/* <td>{item.subCasteCode}</td> */}

                    <td>{item.subCaste}</td>

                    <td>
                      <button
                        className="dbs-subcaste-edit-btn"
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

export default SubCasteMaster;
