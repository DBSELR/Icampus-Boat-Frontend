import React, { useState, useEffect, useMemo } from "react";
import {
  Save,
  X,
  Edit3,
  Trash2,
  Loader2,
  GraduationCap,
  PlusCircle,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import "./AdmissionModes.css";
import DeleteModal from "../../../common/DeleteModal";
import {
  getAdmModeList,
  saveAdmissionMode,
  deleteAdmissionMode,
} from "../../../apis/FeeApis";
import { getProgramme, getYear } from "../../../apis/Common";

export interface AdmissionModeRecord {
  id: number | string;
  programme: string;
  year: string;
  admissionMode: string;
  scholarshipAmount: number | string;
}

interface DropdownOption {
  code: string;
  name: string;
}

const DEFAULT_COURSES: DropdownOption[] = [
  { code: "01-B.Tech", name: "01-B.Tech" },
  { code: "02-M.Tech", name: "02-M.Tech" },
  { code: "03-MBA", name: "03-MBA" },
  { code: "04-MCA", name: "04-MCA" },
];

const DEFAULT_YEARS: DropdownOption[] = [
  { code: "1", name: "1" },
  { code: "2", name: "2" },
  { code: "3", name: "3" },
  { code: "4", name: "4" },
];

export const AdmissionModes: React.FC = () => {
  const academicYear = localStorage.getItem("academicYear") || "2025-2026";

  // Form State (Initially Empty)
  const [programme, setProgramme] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [admissionMode, setAdmissionMode] = useState<string>("");
  const [scholarshipAmount, setScholarshipAmount] = useState<string>("");
  const [editingId, setEditingId] = useState<number | string | null>(null);

  // Dropdown Lists
  const [courseList, setCourseList] =
    useState<DropdownOption[]>(DEFAULT_COURSES);
  const [yearList, setYearList] = useState<DropdownOption[]>(DEFAULT_YEARS);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(false);
  const [loadingYears, setLoadingYears] = useState<boolean>(false);
  const [loadingTable, setLoadingTable] = useState<boolean>(false);

  // Table Data State (Initially Empty)
  const [tableData, setTableData] = useState<AdmissionModeRecord[]>([]);
  const [saving, setSaving] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<AdmissionModeRecord | null>(
    null,
  );
  const [deleting, setDeleting] = useState<boolean>(false);

  // ==========================================================
  // 1. FETCH PROGRAMMES / COURSES
  // ==========================================================
  useEffect(() => {
    const fetchProgrammes = async () => {
      try {
        setLoadingCourses(true);
        const res = await getProgramme();
        if (Array.isArray(res) && res.length > 0) {
          const mapped: DropdownOption[] = res.map((p: any) => {
            const code = String(
              p.PROGRAMMECODE ??
                p.ProgrammeCode ??
                p.programmeCode ??
                p.CODE ??
                p.ID ??
                "",
            );
            const name = String(
              p.PROGRAMMENAME ??
                p.ProgrammeName ??
                p.programmeName ??
                p.NAME ??
                p.COURSE ??
                code,
            );
            return {
              code: code ? (name !== code ? `${code}-${name}` : code) : name,
              name: code ? (name !== code ? `${code}-${name}` : code) : name,
            };
          });
          setCourseList(mapped);
        }
      } catch (err) {
        console.warn("Using default programmes fallback:", err);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchProgrammes();
  }, []);

  // ==========================================================
  // 2. FETCH YEARS FOR SELECTED PROGRAMME
  // ==========================================================
  useEffect(() => {
    if (!programme) {
      setYearList(DEFAULT_YEARS);
      return;
    }

    const fetchYears = async () => {
      try {
        setLoadingYears(true);
        const rawCode = programme.split("-")[0] || programme;
        const res = await getYear(rawCode);
        if (Array.isArray(res) && res.length > 0) {
          const mapped: DropdownOption[] = res.map((y: any) => {
            const yId = String(y.ID ?? y.id ?? y.YEAR ?? y.Year ?? "");
            const yName = String(y.DATA ?? y.Data ?? y.NAME ?? `Year ${yId}`);
            return { code: yId, name: yName };
          });
          setYearList(mapped);
        } else {
          setYearList(DEFAULT_YEARS);
        }
      } catch (err) {
        console.warn("Using default years fallback:", err);
        setYearList(DEFAULT_YEARS);
      } finally {
        setLoadingYears(false);
      }
    };

    fetchYears();
  }, [programme]);

  // ==========================================================
  // 3. FETCH TABLE DATA VIA AdmModeList API (SUPPORTS YEAR & PROGRAMME FILTERING)
  // ==========================================================
  const fetchTableData = async (selectedProg?: string, selectedYear?: string) => {
    const progVal = selectedProg !== undefined ? selectedProg : programme;
    const yearVal = selectedYear !== undefined ? selectedYear : year;

    try {
      setLoadingTable(true);
      let userId = "string";
      try {
        const rawUser = localStorage.getItem("user");
        if (rawUser) {
          const parsed = JSON.parse(rawUser);
          userId = String(parsed?.userId || parsed?.id || parsed?.userName || rawUser);
        }
      } catch {
        userId = localStorage.getItem("user") || "string";
      }

      const progCode = progVal ? progVal.split("-")[0].trim() || progVal : "0";
      const yearCode = yearVal ? String(yearVal).trim() : "0";

      const payload = {
        id: "",
        admissionMode: "string",
        schamount: "string",
        year: yearCode,
        programme: progCode,
        acadamicYear: academicYear,
        userId: String(userId),
      };

      console.log("Calling AdmModeList with payload:", payload);
      const data = await getAdmModeList(payload);
      console.log("AdmModeList Response:", data);
      const list = Array.isArray(data) ? data : data?.data;

      if (Array.isArray(list) && list.length > 0) {
        const mapped: AdmissionModeRecord[] = list.map(
          (item: any, idx: number) => ({
            id: item.id ?? idx + 1,
            programme:
              item.course ??
              item.cOURSE ??
              item.programme ??
              (progVal || "Programme"),
            year: String(item.sYEAR ?? item.syear ?? item.year ?? (yearVal || "0")),
            admissionMode: item.aDMISSIONMODE ?? item.admissionMode ?? "",
            scholarshipAmount:
              item.schlorAmount ??
              item.schamount ??
              item.scholarshipAmount ??
              0,
          }),
        );
        setTableData(mapped);
      } else {
        setTableData([]);
      }
    } catch (err) {
      console.warn("Unable to load admission modes from API:", err);
      setTableData([]);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchTableData(programme, year);
  }, [programme, year, academicYear]);

  // ==========================================================
  // 3. FILTERED TABLE DATA
  // ==========================================================
  const filteredTableData = useMemo(() => {
    if (!searchTerm.trim()) return tableData;
    const q = searchTerm.toLowerCase();
    return tableData.filter(
      (item) =>
        item.programme.toLowerCase().includes(q) ||
        item.admissionMode.toLowerCase().includes(q) ||
        String(item.year).toLowerCase().includes(q) ||
        String(item.scholarshipAmount).includes(q),
    );
  }, [tableData, searchTerm]);

  // ==========================================================
  // 4. SAVE / UPDATE ADMISSION MODE
  // ==========================================================
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!programme) {
      toast.error("Please select a Programme");
      return;
    }
    if (!year) {
      toast.error("Please select a Year");
      return;
    }
    if (!admissionMode.trim()) {
      toast.error("Please enter an Admission Mode");
      return;
    }

    setSaving(true);
    try {
      let userId = "NT125";
      try {
        const rawUser = localStorage.getItem("user");
        if (rawUser) {
          const parsed = JSON.parse(rawUser);
          userId = String(
            parsed?.userId || parsed?.id || parsed?.userName || rawUser,
          );
        }
      } catch {
        userId = localStorage.getItem("user") || "NT125";
      }

      const progCode = programme.split("-")[0].trim() || programme;

      const payload = {
        id: editingId ? String(editingId) : "",
        admissionMode: admissionMode.trim(),
        schamount: scholarshipAmount.trim() || "0",
        year: String(year),
        programme: progCode,
        acadamicYear: academicYear,
        userId: String(userId),
      };

      console.log("Saving Admission Mode payload:", payload);
      const res = await saveAdmissionMode(payload);
      console.log("Save Admission Mode response:", res);

      if (editingId) {
        toast.success(
          res?.message || `Admission Mode "${admissionMode}" updated successfully!`,
        );
      } else {
        toast.success(
          res?.message || `Admission Mode "${admissionMode}" saved successfully!`,
        );
      }

      handleReset();
      // Refresh table with current programme & year
      fetchTableData(programme, year);
    } catch (err: any) {
      console.error("Save Admission Mode error:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save Admission Mode.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // 5. EDIT RECORD
  // ==========================================================
  const handleEdit = (row: AdmissionModeRecord) => {
    setEditingId(row.id);
    setProgramme(row.programme);
    setYear(String(row.year));
    setAdmissionMode(row.admissionMode);
    setScholarshipAmount(String(row.scholarshipAmount));
    toast.info(`Editing Admission Mode "${row.admissionMode}"`);
  };

  // ==========================================================
  // 6. DELETE RECORD
  // ==========================================================
  const openDeleteModal = (row: AdmissionModeRecord) => {
    setItemToDelete(row);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      console.log("Deleting Admission Mode ID:", itemToDelete.id);
      const res = await deleteAdmissionMode(itemToDelete.id);
      console.log("Delete Admission Mode response:", res);

      toast.success(
        res?.message ||
          `Admission Mode "${itemToDelete.admissionMode}" deleted successfully.`,
      );

      if (editingId === itemToDelete.id) {
        handleReset();
      }

      // Refresh table with current filters
      fetchTableData(programme, year);
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete Admission Mode.",
      );
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  // ==========================================================
  // 7. RESET FORM
  // ==========================================================
  const handleReset = () => {
    setEditingId(null);
    setProgramme("");
    setYear("");
    setAdmissionMode("");
    setScholarshipAmount("");
  };

  return (
    <div className="dbs-headmaster-container">
      {/* Page Header */}
      <div className="dbs-headmaster-header">
        <div>
          <h2>Admission Modes Master</h2>
          <p className="dbs-headmaster-subtitle">
            Configure admission categories, modes, and associated scholarship
            amounts ({academicYear})
          </p>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="dbs-admissionmodes-split-layout">
        {/* Left Side: Form Card */}
        <div className="dbs-admissionmodes-form-card">
          <div className="dbs-admissionmodes-form-title">
            {editingId ? (
              <>
                <Edit3 size={18} style={{ color: "#7c3aed" }} />
                <span>Edit Admission Mode</span>
              </>
            ) : (
              <>
                <PlusCircle size={18} style={{ color: "var(--dbs-primary)" }} />
                <span>Add Admission Mode</span>
              </>
            )}
          </div>

          <form
            onSubmit={handleSave}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {/* Programme */}
            <div className="dbs-headmaster-input">
              <label>Programme *</label>
              <select
                value={programme}
                onChange={(e) => setProgramme(e.target.value)}
                disabled={loadingCourses}
              >
                <option value="">Select Programme</option>
                {courseList.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div className="dbs-headmaster-input">
              <label>Year *</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                disabled={loadingYears}
              >
                <option value="">Select Year</option>
                {yearList.map((y) => (
                  <option key={y.code} value={y.code}>
                    {y.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Admission Mode */}
            <div className="dbs-headmaster-input">
              <label>Admission Mode *</label>
              <input
                type="text"
                placeholder="e.g. ST-TS, Cat-B (NON-NRI)"
                value={admissionMode}
                onChange={(e) => setAdmissionMode(e.target.value)}
              />
            </div>

            {/* Scholarship Amount */}
            <div className="dbs-headmaster-input">
              <label>Scholarship Amount</label>
              <input
                type="text"
                placeholder="0"
                value={scholarshipAmount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*\.?\d*$/.test(val) || val === "") {
                    setScholarshipAmount(val);
                  }
                }}
              />
            </div>

            {/* Action Buttons */}
            <div
              className="dbs-headmaster-actions"
              style={{ marginTop: "12px", borderTop: "none" }}
            >
              <button
                type="button"
                className="dbs-headmaster-reset-btn"
                onClick={handleReset}
                disabled={saving}
              >
                <X size={16} />
                Cancel
              </button>

              <button
                type="submit"
                className="dbs-headmaster-save-btn"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 size={16} className="dbs-spin" />
                ) : (
                  <Save size={16} />
                )}
                {saving ? "Saving..." : editingId ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Table Card */}
        <div className="dbs-admissionmodes-table-card">
          {/* Table Search & Filter Bar */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--dbs-border, #e2e8f0)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              background: "#fafafa",
            }}
          >
            <span
              style={{
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "var(--dbs-text)",
              }}
            >
              Admission Modes List ({filteredTableData.length})
            </span>

            <div style={{ position: "relative", width: "240px" }}>
              <input
                type="text"
                placeholder="Search modes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  height: "36px",
                  padding: "0 12px 0 32px",
                  fontSize: "0.85rem",
                  border: "1px solid var(--dbs-border, #d9e6e4)",
                  borderRadius: "6px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "11px",
                  color: "var(--dbs-text-muted, #64748b)",
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>

          <div className="dbs-admissionmodes-table-scroll">
            <table className="dbs-data-table dbs-admissionmodes-table">
              <thead>
                <tr>
                  <th style={{ width: "8%", textAlign: "center" }}>S.No.</th>
                  <th style={{ width: "22%" }}>Programme</th>
                  <th style={{ width: "12%", textAlign: "center" }}>Year</th>
                  <th style={{ width: "30%" }}>AdmissionMode</th>
                  <th style={{ width: "18%", textAlign: "right" }}>
                    Scholarship Amount
                  </th>
                  <th style={{ width: "5%", textAlign: "center" }}>Edit</th>
                  <th style={{ width: "5%", textAlign: "center" }}>Delete</th>
                </tr>
              </thead>

              <tbody>
                {loadingTable ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "var(--dbs-text-muted)",
                      }}
                    >
                      <Loader2
                        className="dbs-spin"
                        size={24}
                        style={{
                          display: "block",
                          margin: "0 auto 8px auto",
                          color: "var(--dbs-primary)",
                        }}
                      />
                      <div>Loading Admission Modes...</div>
                    </td>
                  </tr>
                ) : filteredTableData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        textAlign: "center",
                        padding: "30px",
                        color: "var(--dbs-text-muted)",
                      }}
                    >
                      No admission modes found.
                    </td>
                  </tr>
                ) : (
                  filteredTableData.map((row, idx) => (
                    <tr
                      key={row.id}
                      style={{
                        backgroundColor:
                          editingId === row.id
                            ? "rgba(124, 58, 237, 0.06)"
                            : undefined,
                      }}
                    >
                      <td style={{ textAlign: "center", fontWeight: 600 }}>
                        {idx + 1}
                      </td>
                      <td>{row.programme}</td>
                      <td style={{ textAlign: "center" }}>{row.year}</td>
                      <td style={{ fontWeight: 600, color: "var(--dbs-text)" }}>
                        {row.admissionMode}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          fontFamily: "monospace",
                          fontWeight: 600,
                        }}
                      >
                        {typeof row.scholarshipAmount === "number"
                          ? row.scholarshipAmount.toLocaleString("en-IN")
                          : row.scholarshipAmount}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="dbs-table-edit-icon-btn"
                          onClick={() => handleEdit(row)}
                          title="Edit Admission Mode"
                        >
                          <Edit3 size={14} />
                        </button>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="dbs-table-delete-icon-btn"
                          onClick={() => openDeleteModal(row)}
                          title="Delete Admission Mode"
                        >
                          <Trash2 size={14} />
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

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        title="Delete Admission Mode"
        itemName={
          itemToDelete
            ? `${itemToDelete.admissionMode} (${itemToDelete.programme})`
            : ""
        }
        loading={deleting}
        onCancel={() => {
          if (!deleting) {
            setDeleteModalOpen(false);
            setItemToDelete(null);
          }
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default AdmissionModes;
