import React, { useEffect, useState } from "react";
import { Save, RotateCcw, Edit3, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import "./CasteMaster.css";
import { getCasteMaster, saveCaste } from "../../../apis/SettingsApis";
import Footer from "../../../common/Footer";

interface CasteRecord {
  casteid: number;
  caste: string;
}

const CasteMaster = () => {
  const [casteList, setCasteList] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [caste, setCaste] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);

  const fetchCasteMaster = async () => {
    try {
      const response = await getCasteMaster();

      setCasteList(Array.isArray(response) ? response : []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Caste Master Fetch Error:", error);

      setCasteList([]);
      setCurrentPage(1);
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
      const response = await saveCaste(payload);
      if (
        response?.message === "Success" ||
        response?.rowsAffected > 0 ||
        response
      ) {
        toast.success(
          editId ? "Caste Updated Successfully" : "Caste Saved Successfully",
        );
        await fetchCasteMaster();
        handleReset();
      } else {
        toast.error("Unable to Save Caste");
      }
    } catch (error) {
      console.error("Save Caste Error:", error);

      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditId(Number(item.casteid || item.cID || item.id));
    setCaste(item.caste || "");
    setCurrentPage(1);
  };

  const totalRecords = casteList.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = Math.min(startIndex + recordsPerPage, totalRecords);
  const currentData = casteList.slice(startIndex, endIndex);

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
    <div className="dbs-caste-container">
      <div className="dbs-caste-header">
        <h2>Caste Master</h2>
        <p>Manage caste details and maintain caste master records.</p>
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
            <X size={16} />
            Cancel
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

      <div className="dbs-caste-header">
        <h3>Caste List</h3>
        <p>Maintain and manage caste details for the system.</p>
      </div>

      <div className="dbs-caste-table-card">
        {casteList.length === 0 ? (
          <div className="dbs-empty-state">
            <AlertCircle className="dbs-empty-state-icon" />
            <div className="dbs-empty-state-title">No records found</div>
            <div className="dbs-empty-state-desc">
              No caste records are available.
            </div>
          </div>
        ) : (
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
                {currentData.map((item: any, index: number) => (
                  <tr key={item.casteid || item.cID || item.id || index}>
                    <td>{startIndex + index + 1}</td>
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

export default CasteMaster;
