import React, { useEffect, useRef, useState } from "react";
import {
  Save,
  Edit3,
  Trash2,
  Search,
  AlertCircle,
  ChevronDown,
  X,
} from "lucide-react";
import { toast } from "sonner";
import "./FinancialAcadamicYear.css";
import {
  loadAcademicYearsApi,
  saveFinancialAcademicYearApi,
  deleteFinancialAcademicYearApi,
  updateFinancialAcademicYearStatusApi,
} from "../../../apis/SettingsApis";
import Footer from "../../../common/Footer";
import DeleteModal from "../../../common/DeleteModal";

interface AcademicYear {
  iD: number;
  aCADEMICYEAR: string;
  iSACTIVE: string;
  aY: string;
}

const FinancialAcadamicYear: React.FC = () => {
  const [academicYear, setAcademicYear] = useState("");
  const [data, setData] = useState<AcademicYear[]>([]);
  // const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [editId, setEditId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState<AcademicYear | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredData = data.filter((item) =>
    item.aCADEMICYEAR.toLowerCase().includes(search.toLowerCase()),
  );

  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const academicYears = Array.from({ length: 15 }, (_, i) => {
    const start = 2015 + i;
    return `${start}-${start + 1}`;
  });

  const resetForm = () => {
    setAcademicYear("");
    setEditId("");
  };

  const handleSave = async () => {
    if (academicYear === "") {
      toast.error("Please select Academic Year");
      return;
    }

    const payload = {
      aid: editId,
      academicYear: academicYear,
      isActive: "N",
      ay: academicYear
        .split("-")
        .map((y) => y.slice(-2))
        .join("-"),
      financialYear: academicYear,
    };
    setSaving(true);

    try {
      const response = await saveFinancialAcademicYearApi(payload);
      if (response.rowsAffected > 0) {
        toast.success(
          editId
            ? "Academic Year Updated Successfully"
            : "Academic Year Added Successfully",
        );
        resetForm();
        loadAcademicYears();
      } else {
        toast.error(response.message || "Failed to save.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: AcademicYear) => {
    setEditId(item.iD.toString());
    setAcademicYear(item.aCADEMICYEAR);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    const payload = {
      aid: deleteItem.iD.toString(),
      academicYear: deleteItem.aCADEMICYEAR,
      isActive: deleteItem.iSACTIVE,
      ay: deleteItem.aY,
      financialYear: deleteItem.aCADEMICYEAR,
    };

    setDeleting(true);
    try {
      const response = await deleteFinancialAcademicYearApi(payload);

      if (response.rowsAffected > 0) {
        toast.success("Academic Year Deleted Successfully");
        setShowDeleteModal(false);
        setDeleteItem(null);
        loadAcademicYears();
      } else {
        toast.error(response.message || "Delete failed.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (item: AcademicYear) => {
    const payload = {
      aid: item.iD.toString(),
      academicYear: item.aCADEMICYEAR,
      isActive: "Y",
      ay: item.aY,
      financialYear: item.aCADEMICYEAR,
    };

    // Optimistic UI
    setData((prev) =>
      prev.map((row) => ({
        ...row,
        iSACTIVE: row.iD === item.iD ? "Y" : "N",
      })),
    );

    try {
      const response = await updateFinancialAcademicYearStatusApi(payload);

      if (response.rowsAffected > 0) {
        toast.success("Active Academic Year Updated");
        // Reload from backend because backend updates all records
        loadAcademicYears();
      } else {
        toast.error(response.message || "Failed to update.");
        // Rollback
        loadAcademicYears();
      }
    } catch {
      toast.error("Something went wrong.");
      // Rollback
      loadAcademicYears();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowYearDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    loadAcademicYears();
  }, []);

  const loadAcademicYears = async () => {
    try {
      const response = await loadAcademicYearsApi();
      if (response.success) {
        setData(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    }
  };

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
    <div className="dbs-programme-container">
      {/* ================= Header ================= */}
      <div className="dbs-programme-form-header">
        <div>
          <h2>Financial Academic Year</h2>
          <p className="dbs-page-subtitle">Manage Financial / Academic Years</p>
        </div>
      </div>

      {/* ================= Form ================= */}
      <div className="dbs-form-card">
        <h3>{editId ? "Update Academic Year" : "Add Academic Year"}</h3>

        <div className="dbs-form-grid-2">
          <div className="dbs-input-box">
            <label>Academic Year</label>
            <div className="dbs-custom-dropdown" ref={dropdownRef}>
              <div
                className="dbs-dropdown-selected"
                onClick={() => setShowYearDropdown(!showYearDropdown)}
              >
                <span>{academicYear || "Select Academic Year"}</span>

                <ChevronDown
                  size={18}
                  className={`dbs-dropdown-icon ${
                    showYearDropdown ? "rotate" : ""
                  }`}
                />
              </div>

              {showYearDropdown && (
                <div className="dbs-dropdown-options">
                  {academicYears.map((year) => (
                    <div
                      key={year}
                      className="dbs-dropdown-option"
                      onClick={() => {
                        setAcademicYear(year);
                        setShowYearDropdown(false);
                      }}
                    >
                      {year}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="dbs-footer-actions">
          <button
            type="button"
            className="dbs-btn-secondary"
            onClick={resetForm}
          >
            <X size={16} />
            Cancel
          </button>

          <button
            type="button"
            className="dbs-btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={16} />

            {saving ? "Saving..." : editId ? "Update" : "Save"}
          </button>
        </div>
      </div>

      {/* ================= Table Header ================= */}
      <div className="dbs-programme-form-header dbs-table-head">
        <div>
          <h2>Academic Year Registry</h2>
          <p className="dbs-page-subtitle">
            Manage Financial / Academic Year Records
          </p>
        </div>

        <div className="dbs-table-search">
          <input
            type="text"
            placeholder="Search academic year..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* ================= Table ================= */}
      <div className="dbs-table-container">
        {data.length === 0 ? (
          <div className="dbs-empty-state">
            <AlertCircle className="dbs-empty-state-icon" />

            <div className="dbs-empty-state-title">No records found</div>

            <div className="dbs-empty-state-desc">
              Add a new academic year to view records here.
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="dbs-empty-state">
            <AlertCircle className="dbs-empty-state-icon" />
            <div className="dbs-empty-state-title">No Academic Year Found</div>
            <div className="dbs-empty-state-desc">
              No academic year records match your search.
            </div>
          </div>
        ) : (
          <div className="dbs-table-card">
            <div className="dbs-table-scroll active-scroll">
              <table className="dbs-data-table">
                <thead>
                  <tr>
                    <th>SL.NO</th>
                    <th>ACADEMIC YEAR</th>
                    <th className="center">ACTIVE</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {currentData.map((item, index) => (
                    <tr key={item.iD}>
                      <td>{startIndex + index + 1}</td>

                      <td>{item.aCADEMICYEAR}</td>

                      <td>
                        <input
                          type="radio"
                          name="activeAcademicYear"
                          checked={item.iSACTIVE === "Y"}
                          onChange={() => handleStatusChange(item)}
                        />
                      </td>

                      <td>
                        <div className="dbs-actionss">
                          <button
                            type="button"
                            className="dbs-leave-action-btn dbs-leave-edit-btn"
                            onClick={() => handleEdit(item)}
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            type="button"
                            className="dbs-leave-action-btn dbs-leave-delete-btn"
                            onClick={() => {
                              setDeleteItem(item);
                              setShowDeleteModal(true);
                            }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ================= Footer ================= */}
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
        title="Delete Academic Year"
        itemName={deleteItem?.aCADEMICYEAR}
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

export default FinancialAcadamicYear;
