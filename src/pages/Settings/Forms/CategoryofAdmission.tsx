import React, { useEffect, useState } from "react";
import { Save, RotateCcw, Edit2, Trash2, AlertCircle, X } from "lucide-react";
import "./CategoryofAdmission.css";
import {
  CategoryItem,
  deleteCategory,
  getCasteList,
  loadCategory,
  saveCategory,
} from "../../../apis/SettingsApis";
import { toast } from "sonner";
import DeleteModal from "../../../common/DeleteModal";
import Footer from "../../../common/Footer";

const CategoryofAdmission = () => {
  const [formData, setFormData] = useState({
    caste: "",
    categoryCode: "",
    category: "",
    id: "",
  });

  const [casteList, setCasteList] = useState<any[]>([]);
  const [tableData, setTableData] = useState<CategoryItem[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);

  useEffect(() => {
    loadCastes();
    loadCategoryData();
  }, []);

  const loadCategoryData = async () => {
    try {
      const response = await loadCategory();
      setTableData(response);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error loading categories:", error);
      setTableData([]);
    }
  };

  const loadCastes = async () => {
    try {
      const response = await getCasteList();
      setCasteList(response || []);
    } catch (error) {
      console.error("Error loading caste list:", error);
    }
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

  const handleSave = async () => {
    if (!formData.caste || !formData.categoryCode || !formData.category) {
      toast.error("Please fill all required fields");
      return;
    }

    const academicYear = localStorage.getItem("academicYear");

    const payload = {
      id: String(formData.id || ""),
      caste: formData.caste,
      categorycode: formData.categoryCode,
      category: formData.category,
      academicyear: academicYear,
    };

    try {
      const response = await saveCategory(payload);

      if (response?.message === "Success" && response?.rowsAffected > 0) {
        toast.success(
          formData.id
            ? "Category updated successfully"
            : "Category saved successfully",
        );
        loadCategoryData();
        handleReset();
      } else {
        toast.error("Operation failed");
      }
    } catch (error) {
      console.error("Category Save Error:", error);
      toast.error("Unable to save category");
    }
  };

  const handleEdit = (item: CategoryItem) => {
    setFormData({
      caste: item.caste || "",
      categoryCode: item.categoryCode || "",
      category: item.category || "",
      id: String(item.id || ""),
    });
  };

  const handleReset = () => {
    setFormData({
      caste: "",
      categoryCode: "",
      category: "",
      id: "",
    });
  };

  const handleDelete = async () => {
    try {
      if (!deleteItem?.id) return;
      setDeleting(true);
      const response = await deleteCategory(String(deleteItem.id));

      if (response?.message === "Success") {
        toast.success("Category deleted successfully");
        setShowDeleteModal(false);
        setDeleteItem(null);
        loadCategoryData();
      } else {
        toast.error(response?.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Something went wrong");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="dbs-category-container">
      {/* Header */}
      {/* Header */}
      <div className="dbs-category-header">
        <div>
          <h2>Category of Admission</h2>
          <p>Manage admission categories and caste mappings</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="dbs-category-card">
        <div className="dbs-category-title">
          <h3>Category Information</h3>
        </div>

        <div className="dbs-category-grid">
          <div className="dbs-category-input">
            <label>Caste</label>

            <select
              value={formData.caste}
              disabled={!!formData.id}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  caste: e.target.value,
                }))
              }
            >
              <option value="">Select Caste</option>

              {casteList.map((item, index) => (
                <option key={index} value={item.caste}>
                  {item.caste}
                </option>
              ))}
            </select>
          </div>

          <div className="dbs-category-input">
            <label>Category Code</label>
            <input
              value={formData.categoryCode}
              disabled={!!formData.id}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  categoryCode: e.target.value,
                }))
              }
            />
          </div>

          <div className="dbs-category-input dbs-category-full">
            <label>Category</label>
            <input
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

        <div className="dbs-category-actions">
          <button className="dbs-category-cancel" onClick={handleReset}>
            <X size={16} />
            Cancel
          </button>

          <button className="dbs-category-save" onClick={handleSave}>
            <Save size={16} />
            {formData.id ? "Update" : "Save"}
          </button>
        </div>
      </div>

      <div className="dbs-category-table-header">
        <div>
          <h2>Category List</h2>
          <p>Manage admission categories and caste mappings</p>
        </div>
      </div>

      {/* Table */}
      <div className="dbs-category-card">
        {tableData.length === 0 ? (
          <div className="dbs-empty-state">
            <AlertCircle size={48} />
            <h4>No Records Found</h4>
            <p>Add a new category using the form above.</p>
          </div>
        ) : (
          <div className="dbs-table-wrapper">
            <table className="dbs-category-table">
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>S.No.</th>
                  <th>Caste</th>
                  <th>Category</th>
                  <th style={{ width: "90px", textAlign: "center" }}>Edit</th>
                  <th style={{ width: "90px", textAlign: "center" }}>Delete</th>
                </tr>
              </thead>

              <tbody>
                {currentData.map((item, index) => (
                  <tr key={item.id}>
                    <td>{startIndex + index + 1}</td>
                    <td>{item.caste}</td>
                    <td>{item.category}</td>

                    <td>
                      <div className="dbs-action-buttons">
                        <button
                          className="dbs-icon-btn edit"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <button
                        className="dbs-icon-btn delete"
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
        title="Delete Category"
        itemName={deleteItem?.category}
        loading={deleting}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteItem(null);
        }}
        onConfirm={handleDelete}
      />

      <DeleteModal
        open={showDeleteModal}
        title="Delete Category"
        itemName={deleteItem?.category}
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

export default CategoryofAdmission;
