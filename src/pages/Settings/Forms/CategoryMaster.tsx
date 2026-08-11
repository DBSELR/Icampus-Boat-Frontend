import React, { useEffect, useState } from "react";
import { Save, RotateCcw, Edit2, AlertCircle, X } from "lucide-react";
import "./CategoryMaster.css";
import {
  loadCategoryMaster,
  saveCategoryMaster,
} from "../../../apis/SettingsApis";
import { toast } from "sonner";
import Footer from "../../../common/Footer";

const CategoryMaster = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [formData, setFormData] = useState({
    code: "",
    category: "",
    id: "",
  });

  const [tableData, setTableData] = useState<any[]>([]);

  useEffect(() => {
    fetchCategoryMaster();
  }, []);

  const fetchCategoryMaster = async () => {
    try {
      const response = await loadCategoryMaster();
      setTableData(response || []);
    } catch (error) {
      console.error("Error loading category master:", error);
      toast.error("Failed to load category data");
      setTableData([]);
    }
  };

  const handleSave = async () => {
    if (!formData.code.trim() || !formData.category.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    const academicYear = localStorage.getItem("academicYear");
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    const payload = {
      productCode: formData.code,
      category: formData.category,
      academicyear: academicYear,
      userId: String(user?.userId || ""),
      id: String(formData.id || ""),
    };

    try {
      const response = await saveCategoryMaster(payload);
      if (response?.message === "Success" && response?.rowsAffected > 0) {
        toast.success(
          formData.id
            ? "Category updated successfully"
            : "Category saved successfully",
        );
        fetchCategoryMaster();
        handleReset();
      } else {
        toast.error(response?.message || "Operation failed");
      }
    } catch (error) {
      console.error("Save Category Error:", error);
      toast.error("Unable to save category");
    }
  };

  const handleReset = () => {
    setFormData({
      code: "",
      category: "",
      id: "",
    });
  };

  const handleEdit = (item: any) => {
    setFormData({
      code: item.code || "",
      category: item.category || "",
      id: String(item.cid || ""),
    });
  };

  const totalRecords = tableData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentData = tableData.slice(startIndex, endIndex);

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
    <div className="dbs-category-master-container">
      {/* Header */}
      <div className="dbs-category-master-header">
        <div>
          <h2>Category Master</h2>
          <p className="dbs-page-subtitle">
            Manage category codes and category information
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="dbs-category-master-card">
        <div className="dbs-category-master-title">
          <h3>Category Information</h3>
        </div>

        <div className="dbs-category-master-grid">
          <div className="dbs-category-master-input">
            <label>
              Code <span>*</span>
            </label>

            <input
              type="text"
              placeholder="Enter Code"
              value={formData.code}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  code: e.target.value,
                }))
              }
            />
          </div>

          <div className="dbs-category-master-input">
            <label>
              Category <span>*</span>
            </label>

            <input
              type="text"
              placeholder="Enter Category"
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="dbs-category-master-actions">
          <button className="dbs-category-master-cancel" onClick={handleReset}>
            <X size={16} />
            Cancel
          </button>

          <button className="dbs-category-master-save" onClick={handleSave}>
            <Save size={16} />
            {formData.id ? "Update" : "Save"}
          </button>
        </div>
      </div>

      {/* ================= Table Header ================= */}

      <div className="dbs-category-master-header dbs-table-head">
        <div>
          <h2>Category Master Registry</h2>
          <p className="dbs-page-subtitle">
            Manage category master information and records
          </p>
        </div>
      </div>

      {/* Table Card */}
      <div className="dbs-category-master-card">
        {tableData.length === 0 ? (
          <div className="dbs-empty-state">
            <AlertCircle className="dbs-empty-state-icon" />
            <div className="dbs-empty-state-title">No records found</div>
            <div className="dbs-empty-state-desc">
              Add a new category using the form above to view records here.
            </div>
          </div>
        ) : (
          <div className="dbs-table-card">
            <div className="dbs-table-scroll active-scroll">
              <table className="dbs-data-table">
                <thead>
                  <tr>
                    <th>SL.NO</th>
                    <th>CODE</th>
                    <th>CATEGORY</th>
                    <th style={{ textAlign: "center" }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((item, index) => (
                    <tr key={item.cid}>
                      <td>{startIndex + index + 1}</td>
                      <td>{item.code}</td>
                      <td>{item.category}</td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="dbs-category-master-icon-btn edit"
                          onClick={() => handleEdit(item)}
                          title="Edit"
                        >
                          <Edit2 size={16} />
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
    </div>
  );
};

export default CategoryMaster;
