import React, { useEffect, useState } from "react";
import { Save, X, Pencil, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import "./ExpenditureMaster.css";

import {
  loadExpenditureMaster,
  loadExpenditureYears,
  saveExpenditureMaster,
  deleteExpenditureMaster,
} from "../../../apis/AdmissionsApis";

import { getProgramme, loadExpenditureAmount } from "../../../apis/Common";

import DeleteModal from "../../../common/DeleteModal";

// =====================================================
// TYPES
// =====================================================

interface ExpenditureRecord {
  id: string;
  Course: string;
  Year: string;
  ExpenditureHeads: string;
  Amount: string;
}

interface YearOption {
  ID: string;
  DATA: string;
}

interface CourseOption {
  CID: number;
  COURSECODE: string;
  COURSE: string;
  DEGREE: string;
  YEAR: number;
}

// =====================================================
// COMPONENT
// =====================================================

const ExpenditureMaster = () => {
  // ===================================================
  // STATES
  // ===================================================

  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [years, setYears] = useState<YearOption[]>([]);

  const [yearsLoading, setYearsLoading] = useState(false);
  const [amountLoading, setAmountLoading] = useState(false);

  const [rows, setRows] = useState<ExpenditureRecord[]>([]);

  const [formData, setFormData] = useState<ExpenditureRecord>({
    id: "",
    Course: "",
    Year: "",
    ExpenditureHeads: "",
    Amount: "",
  });

  const [editId, setEditId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // DELETE MODAL STATES
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState<ExpenditureRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ===================================================
  // FETCH COURSES
  // ===================================================

  const fetchCourses = async () => {
    try {
      const response = await getProgramme();

      console.log("Programme Response:", response);

      setCourses(response || []);
    } catch (error) {
      console.error("Get Programme Error:", error);

      setCourses([]);

      toast.error("Unable to load courses");
    }
  };

  // ===================================================
  // FETCH EXPENDITURE MASTER
  // ===================================================

  const fetchExpenditureMaster = async () => {
    try {
      setLoading(true);

      const response = await loadExpenditureMaster();

      console.log("Expenditure Master Response:", response);

      /*
       * IMPORTANT:
       * Convert backend numeric values to strings.
       *
       * Example:
       *
       * id     : 64     -> "64"
       * Year   : 2      -> "2"
       * Amount : 5000   -> "5000"
       */

      const normalizedRows: ExpenditureRecord[] = (response || []).map(
        (item: any) => ({
          id: String(item.id ?? ""),
          Course: String(item.Course ?? ""),
          Year: String(item.Year ?? ""),
          ExpenditureHeads: String(item.ExpenditureHeads ?? ""),
          Amount: String(item.Amount ?? ""),
        }),
      );

      console.log("Normalized Expenditure Rows:", normalizedRows);

      setRows(normalizedRows);
    } catch (error) {
      console.error("Expenditure Master Error:", error);

      setRows([]);

      toast.error("Unable to load expenditure records");
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // FETCH YEARS
  // ===================================================

  const fetchExpenditureYears = async (courseCode: string) => {
    try {
      setYearsLoading(true);

      const response = await loadExpenditureYears(String(courseCode));

      console.log("Expenditure Years Response:", response);

      /*
       * Always keep year ID/DATA as strings.
       */

      const normalizedYears: YearOption[] = (response || []).map(
        (item: any) => ({
          ID: String(item.ID ?? ""),
          DATA: String(item.DATA ?? ""),
        }),
      );

      setYears(normalizedYears);
    } catch (error) {
      console.error("Expenditure Years Error:", error);

      setYears([]);

      toast.error("Unable to load years");
    } finally {
      setYearsLoading(false);
    }
  };

  // ===================================================
  // FETCH AMOUNT
  // ===================================================

  const fetchExpenditureAmount = async () => {
    if (!formData.Course) {
      toast.error("Please select Course");
      return;
    }

    if (!formData.Year) {
      toast.error("Please select Year");
      return;
    }

    if (!formData.ExpenditureHeads.trim()) {
      toast.error("Please enter Expenditure Head");
      return;
    }

    const selectedCourse = courses.find(
      (item) => item.COURSE === formData.Course,
    );

    if (!selectedCourse?.COURSECODE) {
      toast.error("Course code not found");
      return;
    }

    try {
      setAmountLoading(true);

      const response = await loadExpenditureAmount(
        String(formData.ExpenditureHeads).trim(),

        String(selectedCourse.COURSECODE),

        String(formData.Year),
      );

      console.log("Expenditure Amount Response:", response);

      if (response?.success) {
        const amount = response?.amount;

        if (amount !== undefined && amount !== null && amount !== "") {
          setFormData((prev) => ({
            ...prev,

            // ALWAYS STRING
            Amount: String(amount),
          }));

          toast.success("Amount loaded successfully");
        } else {
          setFormData((prev) => ({
            ...prev,
            Amount: "",
          }));

          toast.error("Expenditure Head not found. Please enter a new amount.");
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          Amount: "",
        }));

        toast.error("Expenditure Head not found. Please enter a new amount.");
      }
    } catch (error) {
      console.error("Expenditure Amount Error:", error);

      setFormData((prev) => ({
        ...prev,
        Amount: "",
      }));

      toast.error("Expenditure Head not found. Please enter a new amount.");
    } finally {
      setAmountLoading(false);
    }
  };

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    fetchCourses();
    fetchExpenditureMaster();
  }, []);

  // ===================================================
  // HANDLE CHANGE
  // ===================================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    /*
     * e.target.value is always a string.
     */

    if (name === "Course") {
      const selectedCourse = courses.find((item) => item.COURSE === value);

      setFormData((prev) => ({
        ...prev,

        Course: String(value),

        Year: "",

        Amount: "",
      }));

      setYears([]);

      if (selectedCourse?.COURSECODE) {
        fetchExpenditureYears(String(selectedCourse.COURSECODE));
      }

      return;
    }

    if (name === "Year") {
      setFormData((prev) => ({
        ...prev,

        Year: String(value),

        Amount: "",
      }));

      return;
    }

    if (name === "ExpenditureHeads") {
      setFormData((prev) => ({
        ...prev,

        ExpenditureHeads: String(value),
      }));

      return;
    }

    if (name === "Amount") {
      setFormData((prev) => ({
        ...prev,

        Amount: String(value),
      }));

      return;
    }
  };

  // ===================================================
  // RESET
  // ===================================================

  const handleReset = () => {
    setFormData({
      id: "",
      Course: "",
      Year: "",
      ExpenditureHeads: "",
      Amount: "",
    });

    setYears([]);

    setEditId(null);
  };

  // ===================================================
  // SAVE / UPDATE
  // ===================================================

  const handleSave = async () => {
    if (!formData.Course) {
      toast.error("Please select Course");
      return;
    }

    if (!formData.Year) {
      toast.error("Please select Year");
      return;
    }

    if (!formData.ExpenditureHeads.trim()) {
      toast.error("Please enter Expenditure Head");
      return;
    }

    if (!formData.Amount) {
      toast.error("Please enter Amount");
      return;
    }

    if (Number(formData.Amount) <= 0) {
      toast.error("Amount should be greater than 0");
      return;
    }

    const selectedCourse = courses.find(
      (item) => item.COURSE === formData.Course,
    );

    if (!selectedCourse?.COURSECODE) {
      toast.error("Course code not found");
      return;
    }

    try {
      setSaving(true);

      /*
       * ALL values sent to API as strings.
       */

      const payload = {
        id: String(formData.id || ""),

        course: String(selectedCourse.COURSECODE),

        year: String(formData.Year),

        expenditureHeads: String(formData.ExpenditureHeads).trim(),

        amount: String(formData.Amount),
      };

      console.log("SAVE / UPDATE PAYLOAD:", payload);

      const response = await saveExpenditureMaster(payload);

      console.log("SAVE / UPDATE RESPONSE:", response);

      if (response?.success) {
        toast.success(
          response.message ||
            (formData.id
              ? "Data Updated Successfully"
              : "Data Saved Successfully"),
        );

        await fetchExpenditureMaster();

        handleReset();
      } else {
        toast.error(response?.message || "Unable to save expenditure");
      }
    } catch (error) {
      console.error("Save Expenditure Error:", error);

      toast.error("Unable to save expenditure");
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // EDIT
  // ===================================================

  const handleEdit = (row: ExpenditureRecord) => {
    console.log("Original row:", row);

    /*
     * Convert everything to string again
     * before putting data into form.
     */

    const normalizedRow: ExpenditureRecord = {
      id: String(row.id ?? ""),

      Course: String(row.Course ?? ""),

      Year: String(row.Year ?? ""),

      ExpenditureHeads: String(row.ExpenditureHeads ?? ""),

      Amount: String(row.Amount ?? ""),
    };

    console.log("Normalized edit row:", normalizedRow);

    setFormData({
      id: normalizedRow.id,
      Course: normalizedRow.Course,
      Year: normalizedRow.Year,
      ExpenditureHeads: normalizedRow.ExpenditureHeads,
      Amount: normalizedRow.Amount,
    });

    setEditId(normalizedRow.id);

    const selectedCourse = courses.find(
      (item) => item.COURSE === normalizedRow.Course,
    );

    if (selectedCourse?.COURSECODE) {
      fetchExpenditureYears(String(selectedCourse.COURSECODE));
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ===================================================
  // OPEN DELETE MODAL
  // ===================================================

  const openDeleteModal = (item: ExpenditureRecord) => {
    /*
     * Normalize the item before storing it.
     */

    const normalizedItem: ExpenditureRecord = {
      id: String(item.id ?? ""),

      Course: String(item.Course ?? ""),

      Year: String(item.Year ?? ""),

      ExpenditureHeads: String(item.ExpenditureHeads ?? ""),

      Amount: String(item.Amount ?? ""),
    };

    console.log("Delete Item:", normalizedItem);

    setDeleteItem(normalizedItem);

    setShowDeleteModal(true);
  };

  // ===================================================
  // DELETE CONFIRM
  // ===================================================
  const handleDelete = async () => {
    if (!deleteItem) return;

    const deleteId = String(deleteItem.id);

    if (!deleteId) {
      toast.error("Invalid expenditure ID");
      return;
    }

    try {
      setDeleting(true);

      const response = await deleteExpenditureMaster(deleteId);

      console.log("Delete Expenditure Response:", response);

      if (response?.success) {
        toast.success(response.message || "Record Deleted Successfully");

        setShowDeleteModal(false);
        setDeleteItem(null);

        await fetchExpenditureMaster();

        if (String(editId) === deleteId) {
          handleReset();
        }
      } else {
        toast.error(response?.message || "Unable to delete expenditure");
      }
    } catch (error) {
      console.error("Delete Expenditure Error:", error);
      toast.error("Unable to delete expenditure");
    } finally {
      setDeleting(false);
    }
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="dbs-expenditure-master-container">
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="dbs-expenditure-master-header">
        <div>
          <h2>Expenditure Master</h2>

          <p className="dbs-expenditure-master-subtitle">
            Manage course-wise expenditure details
          </p>
        </div>
      </div>

      {/* =================================================
          FORM
      ================================================= */}

      <div className="dbs-expenditure-master-form-card">
        <h3>
          {editId !== null ? "Edit Expenditure Details" : "Expenditure Details"}
        </h3>

        <div className="dbs-expenditure-master-grid">
          {/* COURSE */}

          <div className="dbs-expenditure-master-input">
            <label>
              Course <span className="dbs-expenditure-required">*</span>
            </label>

            <select
              name="Course"
              value={formData.Course}
              onChange={handleChange}
            >
              <option value="">Select Course</option>

              {courses.map((item) => (
                <option key={item.CID} value={String(item.COURSE)}>
                  {item.COURSE}
                </option>
              ))}
            </select>
          </div>

          {/* YEAR */}

          <div className="dbs-expenditure-master-input">
            <label>
              Year <span className="dbs-expenditure-required">*</span>
            </label>

            <select
              name="Year"
              value={formData.Year}
              onChange={handleChange}
              disabled={!formData.Course || yearsLoading}
            >
              <option value="">
                {yearsLoading ? "Loading Years..." : "Select Year"}
              </option>

              {years.map((year) => (
                <option key={String(year.ID)} value={String(year.ID)}>
                  {String(year.DATA)}
                </option>
              ))}
            </select>
          </div>

          {/* EXPENDITURE HEAD */}

          <div className="dbs-expenditure-master-input">
            <label>
              Expenditure Head{" "}
              <span className="dbs-expenditure-required">*</span>
            </label>

            <input
              type="text"
              name="ExpenditureHeads"
              value={formData.ExpenditureHeads}
              onChange={handleChange}
              onBlur={fetchExpenditureAmount}
              placeholder="Enter expenditure head"
            />
          </div>

          {/* AMOUNT */}

          <div className="dbs-expenditure-master-input">
            <label>
              Amount <span className="dbs-expenditure-required">*</span>
            </label>

            <input
              type="number"
              name="Amount"
              value={formData.Amount}
              onChange={handleChange}
              placeholder={amountLoading ? "Loading amount..." : "Enter amount"}
              min="0"
              disabled={amountLoading}
            />
          </div>
        </div>

        {/* FORM ACTIONS */}

        <div className="dbs-expenditure-master-actions">
          <button
            type="button"
            className="dbs-expenditure-master-cancel-btn"
            onClick={handleReset}
            disabled={saving}
          >
            <X size={16} />
            Cancel
          </button>

          <button
            type="button"
            className="dbs-expenditure-master-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={16} />

            {saving ? "Saving..." : editId !== null ? "Update" : "Save"}
          </button>
        </div>
      </div>

      {/* =================================================
          TABLE HEADER
      ================================================= */}

      <div className="dbs-expenditure-master-table-header">
        <div>
          <h2>Expenditure List</h2>

          <p className="dbs-expenditure-master-subtitle">
            View and manage expenditure records
          </p>
        </div>
      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="dbs-expenditure-master-table-container">
        {loading ? (
          <div className="dbs-expenditure-empty-state">
            <div className="dbs-expenditure-empty-title">
              Loading expenditure records...
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="dbs-expenditure-empty-state">
            <AlertCircle className="dbs-expenditure-empty-icon" />

            <div className="dbs-expenditure-empty-title">No records found</div>

            <div className="dbs-expenditure-empty-desc">
              Add an expenditure record to view records here.
            </div>
          </div>
        ) : (
          <div className="dbs-expenditure-table-card">
            <div className="dbs-expenditure-table-scroll">
              <table className="dbs-expenditure-data-table">
                <thead>
                  <tr>
                    <th>SL.NO</th>

                    <th>COURSE</th>

                    <th>YEAR</th>

                    <th>EXPENDITURE HEAD</th>

                    <th>AMOUNT</th>

                    <th>EDIT</th>

                    <th>DELETE</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((item, index) => (
                    <tr key={String(item.id)}>
                      <td>{index + 1}</td>

                      <td>{String(item.Course)}</td>

                      <td>{String(item.Year)}</td>

                      <td>{String(item.ExpenditureHeads)}</td>

                      <td className="dbs-expenditure-amount-cell">
                        ₹ {Number(item.Amount).toLocaleString("en-IN")}
                      </td>

                      {/* EDIT */}

                      <td>
                        <button
                          type="button"
                          className="dbs-expenditure-edit-btn"
                          onClick={() => handleEdit(item)}
                          title="Edit"
                          disabled={deleting}
                        >
                          <Pencil size={16} />
                        </button>
                      </td>

                      {/* DELETE */}

                      <td>
                        <button
                          type="button"
                          className="dbs-expenditure-delete-btn"
                          onClick={() => openDeleteModal(item)}
                          title="Delete"
                          disabled={deleting}
                        >
                          <Trash2 size={16} />
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

      {/* =================================================
          DELETE MODAL
      ================================================= */}

      <DeleteModal
        open={showDeleteModal}
        title="Delete Expenditure"
        itemName={
          deleteItem
            ? `${deleteItem.ExpenditureHeads} - ${deleteItem.Course}`
            : ""
        }
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

export default ExpenditureMaster;
