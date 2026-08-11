import React, { useEffect, useState } from "react";
import { Save, RotateCcw, Edit2, Trash2, AlertCircle, X } from "lucide-react";
import "./TeachingLearningMethods.css";
import {
  checkTLMExisted,
  deleteTLM,
  getTeachingLearningMenthods,
  saveTLM,
} from "../../../apis/SettingsApis";
import { toast } from "sonner";
import DeleteModal from "../../../common/DeleteModal";
import Footer from "../../../common/Footer";

const TeachingLearningMethods = () => {
  const [formData, setFormData] = useState({
    methodCode: "",
    methodName: "",
    id: "",
  });

  const [tableData, setTableData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const totalRecords = tableData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentData = tableData.slice(startIndex, endIndex);

  const handleSave = async () => {
    if (!formData.methodCode.trim() || !formData.methodName.trim()) {
      toast.error("Please fill all required fields.");
      return;
    }
    const userData = JSON.parse(localStorage.getItem("user") || "{}");

    const payload = {
      tlmCode: formData.methodCode,
      tlmName: formData.methodName,
      userId: String(userData?.userId || ""),
      academicYear: "",
      sid: "",
      id: String(formData.id || ""),
    };

    try {
      if (!formData.id) {
        const checkResponse = await checkTLMExisted({
          tlmCode: formData.methodCode,
          tlmName: "",
          userId: "",
          academicYear: "",
          sid: "",
          id: "",
        });

        if (checkResponse?.[0]?.cNT > 0) {
          toast.error("Teaching Learning Method already exists.");
          return;
        }
      }

      const saveResponse = await saveTLM(payload);
      if (saveResponse?.rowsAffected > 0) {
        toast.success(
          formData.id
            ? "Teaching Learning Method updated successfully"
            : "Teaching Learning Method saved successfully",
        );

        handleReset();
        fetchTeachingLearningMethods();
      } else {
        toast.error("Failed to save.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    }
  };

  const handleReset = () => {
    setFormData({
      methodCode: "",
      methodName: "",
      id: "",
    });
  };

  const handleEdit = (item: any) => {
    setFormData({
      methodCode: item.tLMCode || "",
      methodName: item.tLMName || "",
      id: String(item.tLMID || ""),
    });
  };

  const handleDelete = async () => {
    try {
      if (!deleteItem?.tLMID) return;
      setDeleting(true);
      const response = await deleteTLM(String(deleteItem.tLMID));

      if (response?.message === "Success") {
        toast.success("Teaching Learning Method deleted successfully.");
        setShowDeleteModal(false);
        setDeleteItem(null);
        fetchTeachingLearningMethods();
      } else {
        toast.error(response?.message || "Failed to delete.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setDeleting(false);
    }
  };

  const fetchTeachingLearningMethods = async () => {
    try {
      const response = await getTeachingLearningMenthods();
      setTableData(response);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to load the data!");
    }
  };

  useEffect(() => {
    fetchTeachingLearningMethods();
  }, []);

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
    <div className="dbs-teaching-method-container">
      {/* Header */}
      <div className="dbs-teaching-method-header">
        <h2>Teaching Learning Methods</h2>
        <p>Manage teaching and learning method information</p>
      </div>

      {/* Form Card */}
      <div className="dbs-teaching-method-card">
        <div className="dbs-teaching-method-title">
          <h3>Method Information</h3>
        </div>

        <div className="dbs-teaching-method-grid">
          <div className="dbs-teaching-method-input">
            <label>
              Method Code <span>*</span>
            </label>

            <input
              type="text"
              placeholder="Enter Method Code"
              value={formData.methodCode}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  methodCode: e.target.value,
                }))
              }
            />
          </div>

          <div className="dbs-teaching-method-input">
            <label>
              Method Name <span>*</span>
            </label>

            <input
              type="text"
              placeholder="Enter Method Name"
              value={formData.methodName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  methodName: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="dbs-teaching-method-actions">
          <button className="dbs-teaching-method-cancel" onClick={handleReset}>
            <X size={16} />
            Cancel
          </button>

          <button className="dbs-teaching-method-save" onClick={handleSave}>
            <Save size={16} />

            {formData.id ? "Update" : "Save"}
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="dbs-teaching-method-header dbs-table-head">
        <div>
          <h2>Teaching Learning Methods Registry</h2>
          <p>Manage teaching and learning method records</p>
        </div>
      </div>

      {/* ================= Table ================= */}
      <div className="dbs-table-container">
        {tableData.length === 0 ? (
          <div className="dbs-empty-state">
            <AlertCircle className="dbs-empty-state-icon" />

            <div className="dbs-empty-state-title">No records found</div>

            <div className="dbs-empty-state-desc">
              Add a new teaching learning method to view records here.
            </div>
          </div>
        ) : (
          <div className="dbs-table-card">
            <div className="dbs-table-scroll active-scroll">
              <table className="dbs-data-table">
                <thead>
                  <tr>
                    <th>SL.NO</th>
                    <th>Method Code</th>
                    <th>Method Name</th>
                    <th style={{ textAlign: "center", width: "90px" }}>Edit</th>
                    <th style={{ textAlign: "center", width: "90px" }}>
                      Delete
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {currentData.map((item, index) => (
                    <tr key={item.tLMID || item.id}>
                      <td>{startIndex + index + 1}</td>
                      <td>{item.tLMCode}</td>
                      <td>{item.tLMName}</td>
                      <td>
                        <button
                          type="button"
                          className="dbs-teaching-method-icon-btn edit"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit2 size={18} />
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="dbs-teaching-method-icon-btn delete"
                          onClick={() => {
                            setDeleteItem(item);
                            setShowDeleteModal(true);
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
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

      <DeleteModal
        open={showDeleteModal}
        title="Delete Teaching Learning Method"
        itemName={deleteItem?.tLMName}
        loading={deleting}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteItem(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default TeachingLearningMethods;
