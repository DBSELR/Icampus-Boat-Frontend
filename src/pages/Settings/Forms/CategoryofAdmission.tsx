import React, { useEffect, useState } from "react";
import { Save, RotateCcw, Edit2, Trash2, AlertCircle } from "lucide-react";
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

const CategoryofAdmission = () => {
  const [casteList, setCasteList] = useState<any[]>([]);
  const [tableData, setTableData] = useState<CategoryItem[]>([]);
  const [selectedCaste, setSelectedCaste] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [category, setCategory] = useState("");
  const [editId, setEditId] = useState<string | number>("");
  const [isEditMode, setIsEditMode] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCastes();
    loadCategoryData();
  }, []);

  const loadCategoryData = async () => {
    try {
      const response = await loadCategory();
      setTableData(response);
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

  const handleSave = async () => {
    if (!selectedCaste || !categoryCode || !category) {
      toast.error("Please fill all required fields");
      return;
    }

    const academicYear = localStorage.getItem("academicYear");

    const payload = {
      id: isEditMode ? String(editId) : "",
      caste: selectedCaste,
      categorycode: categoryCode,
      category: category,
      academicyear: academicYear,
    };

    try {
      const response = await saveCategory(payload);
      console.log("Save Response:", response);

      if (response?.message === "Success" && response?.rowsAffected > 0) {
        toast.success(
          isEditMode
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
    console.log("Edit row:", item);

    setEditId(String(item.id)); // convert number to string
    setSelectedCaste(item.caste);
    setCategoryCode(item.categoryCode);
    setCategory(item.category);
    setIsEditMode(true);
  };

  const handleReset = () => {
    setSelectedCaste("");
    setCategoryCode("");
    setCategory("");
    setEditId("");
    setIsEditMode(false);
  };

  const handleDelete = async () => {
    try {
      if (!deleteItem?.id) return;
      setDeleting(true);
      const response = await deleteCategory(String(deleteItem.id));
      console.log("Delete Response:", response);

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
      <div className="dbs-category-header">
        <h2>Category of Admission</h2>
        <p>Manage admission categories and caste mappings</p>
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
              value={selectedCaste}
              disabled={isEditMode}
              onChange={(e) => setSelectedCaste(e.target.value)}
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
              type="text"
              placeholder="Enter Category Code"
              value={categoryCode}
              disabled={isEditMode}
              onChange={(e) => setCategoryCode(e.target.value)}
            />
          </div>

          <div className="dbs-category-input dbs-category-full">
            <label>Category</label>
            <input
              type="text"
              placeholder="Enter Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
        </div>

        <div className="dbs-category-actions">
          <button className="dbs-category-cancel" onClick={handleReset}>
            <RotateCcw size={16} />
            Cancel
          </button>

          <button className="dbs-category-save" onClick={handleSave}>
            <Save size={16} />
            {isEditMode ? "Update" : "Save"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="dbs-category-card">
        <div className="dbs-category-title">
          <h3>Category List ({tableData.length})</h3>
        </div>

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
                {tableData.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.caste}</td>
                    <td>{item.category}</td>

                    <td style={{ textAlign: "center" }}>
                      <button
                        className="dbs-icon-btn edit"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit2 size={18} />
                      </button>
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
