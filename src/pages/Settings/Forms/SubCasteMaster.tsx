import React, { useEffect, useState } from "react";
import { Save, RotateCcw, Edit3, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import "./SubCasteMaster.css";
import {
  getCasteMaster,
  getLoadCaste,
  getSubCasteMaster,
  saveCaste,
  saveSubCaste,
} from "../../../apis/SettingsApis";
import Footer from "../../../common/Footer";

const SubCasteMaster = () => {
  const [casteList, setCasteList] = useState<any[]>([]);
  const [subCasteList, setSubCasteList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);

  const [form, setForm] = useState({
    casteid: "",
    subCasteCode: "",
    subCaste: "",
  });

  const fetchSubCaste = async () => {
    try {
      setLoading(true);
      const response = await getSubCasteMaster();
      setSubCasteList(response || []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Sub Caste Load Error:", error);
      setSubCasteList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCaste = async () => {
    try {
      const response = await getLoadCaste();
      setCasteList(response || []);
    } catch (error) {
      console.error("Load Caste Error:", error);
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
      const response = await saveSubCaste(payload);
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
      console.error("Save Sub Caste Error:", error);
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

  const totalRecords = subCasteList.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentData = subCasteList.slice(startIndex, endIndex);

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
    <div className="dbs-subcaste-container">
      {/* Header */}
      <div className="dbs-subcaste-form-header">
        <div>
          <h2>Sub Caste Master</h2>

          <p className="dbs-subcaste-page-subtitle">
            Manage Caste / Sub Caste Configuration
          </p>
        </div>
      </div>
      {/* Form */}
      <div className="dbs-subcaste-form-card">
        <h3>{editId ? "Update Sub Caste" : "Add Sub Caste"}</h3>

        <div className="dbs-subcaste-form-grid">
          <div className="dbs-subcaste-input-box">
            <label>Caste</label>

            <select
              name="casteid"
              value={form.casteid}
              onChange={handleChange}
              className="dbs-subcaste-input"
            >
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
              className="dbs-subcaste-input"
            />
          </div>

          <div className="dbs-subcaste-input-box">
            <label>Sub Caste</label>

            <input
              name="subCaste"
              value={form.subCaste}
              placeholder="Enter Sub Caste"
              onChange={handleChange}
              className="dbs-subcaste-input"
            />
          </div>
        </div>

        <div className="dbs-subcaste-footer-actions">
          <button className="dbs-subcaste-btn-secondary" onClick={handleReset}>
            <X size={16} />
            Cancel
          </button>

          <button
            className="dbs-subcaste-btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={16} />

            {saving ? "Saving..." : editId ? "Update" : "Save"}
          </button>
        </div>
      </div>
      {/* Table Header */}
      <div className="dbs-subcaste-form-header">
        <div>
          <h2>Sub Caste Registry</h2>

          <p className="dbs-subcaste-page-subtitle">
            Manage available caste and sub caste records
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="dbs-subcaste-table-container">
        {subCasteList.length === 0 ? (
          <div className="dbs-empty-state">
            <AlertCircle className="dbs-empty-state-icon" />

            <div className="dbs-empty-state-title">No records found</div>

            <div className="dbs-empty-state-desc">
              No caste and sub caste records are available.
            </div>
          </div>
        ) : (
          <div className="dbs-subcaste-table-scroll">
            <table className="dbs-subcaste-registry-table">
              <thead>
                <tr>
                  <th>SERIAL NO.</th>
                  <th>CASTE</th>
                  <th>SUB CASTE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {currentData.map((item: any, index: number) => (
                  <tr key={index}>
                    <td>{startIndex + index + 1}</td>

                    <td className="dbs-subcaste-name">{item.caste}</td>

                    <td>{item.subCaste}</td>

                    <td>
                      <div className="dbs-subcaste-actionss">
                        <button
                          className="dbs-subcaste-action-btn dbs-subcaste-edit-btn"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit3 size={16} />
                        </button>
                      </div>
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

export default SubCasteMaster;
