import React, { useState, useEffect, useMemo } from "react";
import {
  Save,
  X,
  Edit,
  Search,
  BookOpen,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getBudgetHeadsNextOrder,
  getBudgetHeadsMasterList,
  saveBudgetHeadsMaster,
} from "../../../apis/AccountsApis";
import "./BudgetHeads.css";

export interface BudgetHeadItem {
  id: number | string;
  sNo: number;
  headName: string;
  shortName: string;
  order: number | string;
  academicYear?: string;
  financialYear?: string;
  isActive?: any;
}

export const BudgetHeads: React.FC = () => {
  // Form State
  const [shortName, setShortName] = useState<string>("");
  const [headName, setHeadName] = useState<string>("");
  const [headOrder, setHeadOrder] = useState<string>("");
  const [editingId, setEditingId] = useState<number | string | null>(null);

  // Search & Loading State
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [loadingTable, setLoadingTable] = useState<boolean>(false);

  // Table Data State
  const [tableData, setTableData] = useState<BudgetHeadItem[]>([]);

  // ==========================================================
  // 1. FETCH TABLE DATA FROM API
  // ==========================================================
  const fetchTableData = async () => {
    try {
      setLoadingTable(true);
      const res = await getBudgetHeadsMasterList();
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];

      const mapped: BudgetHeadItem[] = list.map((item: any, idx: number) => ({
        id: item.iD ?? item.id ?? item.ID ?? idx + 1,
        sNo: idx + 1,
        headName:
          item.bHNAME ?? item.bhname ?? item.headName ?? item.HEADNAME ?? "",
        shortName:
          item.bHSNAME ?? item.bhsname ?? item.shortName ?? item.SHORTNAME ?? "",
        order: item.oRDER ?? item.order ?? item.ORDER ?? idx + 1,
        academicYear: item.aCADEMICYEAR ?? item.academicYear,
        financialYear: item.fINANCIALYEAR ?? item.financialYear,
        isActive: item.isActive,
      }));

      setTableData(mapped);
    } catch (err) {
      console.warn("Error fetching budget heads master list:", err);
      toast.error("Failed to load budget heads list.");
    } finally {
      setLoadingTable(false);
    }
  };

  // ==========================================================
  // 2. FETCH NEXT ORDER FROM API
  // ==========================================================
  const fetchNextOrder = async () => {
    try {
      const year = localStorage.getItem("academicYear") || "2025-2026";
      const res = await getBudgetHeadsNextOrder(year);
      const data = res?.data ?? res;
      let orderVal: any = undefined;

      if (Array.isArray(data) && data.length > 0) {
        orderVal =
          data[0]?.nextOrder ??
          data[0]?.nEXTORDER ??
          data[0]?.order ??
          data[0]?.ORDER;
      } else if (typeof data === "object" && data !== null) {
        orderVal =
          data?.nextOrder ??
          data?.nEXTORDER ??
          data?.order ??
          data?.ORDER;
      } else if (typeof data === "number" || typeof data === "string") {
        orderVal = data;
      }

      if (orderVal !== undefined && orderVal !== null) {
        setHeadOrder(String(orderVal));
      } else {
        const maxOrder = tableData.reduce(
          (max, item) => Math.max(max, Number(item.order) || 0),
          0,
        );
        setHeadOrder(String(maxOrder + 1));
      }
    } catch (err) {
      console.warn("Could not fetch next order from API, using fallback:", err);
      const maxOrder = tableData.reduce(
        (max, item) => Math.max(max, Number(item.order) || 0),
        0,
      );
      setHeadOrder(String(maxOrder + 1));
    }
  };

  // Initial load
  useEffect(() => {
    fetchTableData();
    fetchNextOrder();
  }, []);

  // Filtered Table Data
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return tableData;
    const term = searchTerm.toLowerCase();
    return tableData.filter(
      (item) =>
        item.headName.toLowerCase().includes(term) ||
        item.shortName.toLowerCase().includes(term) ||
        String(item.order).includes(term),
    );
  }, [tableData, searchTerm]);

  // Form Reset / Cancel
  const handleCancel = () => {
    setShortName("");
    setHeadName("");
    setEditingId(null);
    fetchNextOrder();
    toast.info("Form reset.");
  };

  // Populate for Edit
  const handleEdit = (item: BudgetHeadItem) => {
    setEditingId(item.id);
    setShortName(item.shortName);
    setHeadName(item.headName);
    setHeadOrder(String(item.order));
    toast.info(`Editing budget head: "${item.headName}"`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const editingItem = useMemo(
    () => tableData.find((item) => String(item.id) === String(editingId)),
    [tableData, editingId],
  );

  // Save / Update Form
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shortName.trim()) {
      toast.error("Please enter Short Name");
      return;
    }

    if (!headName.trim()) {
      toast.error("Please enter Budget Head Name");
      return;
    }

    if (!headOrder.trim()) {
      toast.error("Please enter Head Order");
      return;
    }

    try {
      setSaving(true);
      const academicYear =
        editingItem?.academicYear ||
        localStorage.getItem("academicYear") ||
        "2025-2026";
      const fyear =
        editingItem?.financialYear ||
        localStorage.getItem("financialYear") ||
        localStorage.getItem("fyear") ||
        "Apr-2017 to Mar-2018";

      const isEditing =
        editingId !== null &&
        editingId !== undefined &&
        String(editingId).trim() !== "";

      const payload = {
        id: isEditing ? String(editingId) : "",
        academicYear,
        fyear,
        order: String(headOrder).trim(),
        phname: headName.trim(),
        phsname: shortName.trim().toUpperCase(),
        accountno: "string",
      };

      console.log("Saving/Updating Budget Head Payload:", payload);
      const res = await saveBudgetHeadsMaster(payload);
      console.log("Save/Update Budget Head Response:", res);

      const msg =
        res?.message ||
        (isEditing
          ? `Budget Head "${headName}" updated successfully!`
          : `Budget Head "${headName}" saved successfully!`);
      toast.success(msg);

      handleCancel();
      fetchTableData();
    } catch (err: any) {
      console.error("Save/Update Error:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save Budget Head",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dbs-headmaster-container dbs-accountmaster-container">
      {/* Page Header */}
      <div className="dbs-headmaster-header">
        <div>
          <h2>Budget Head Master</h2>
          <p className="dbs-headmaster-subtitle">
            Configure institutional budget allocations, accounting codes, and display ordering.
          </p>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="dbs-accountmaster-split-layout">
        {/* Left Column: Input Form Card */}
        <div className="dbs-accountmaster-form-card">
          <div className="dbs-accountmaster-form-title">
            <BookOpen size={18} color="var(--dbs-primary, #0e7490)" />
            <span>
              {editingId
                ? `Edit Budget Head: ${headName}`
                : "Budget Head Registration"}
            </span>
          </div>

          <form onSubmit={handleSave}>
            <div className="dbs-accountmaster-form-grid">
              {/* Short Name */}
              <div className="dbs-headmaster-input">
                <label>Short Name *</label>
                <input
                  type="text"
                  placeholder="e.g. TF, BFEE"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  disabled={editingId !== null}
                />
              </div>

              {/* Budget Head Name */}
              <div className="dbs-headmaster-input">
                <label>Budget Head Name *</label>
                <input
                  type="text"
                  placeholder="e.g. TUF, BUS FEE"
                  value={headName}
                  onChange={(e) => setHeadName(e.target.value)}
                />
              </div>

              {/* Head Order */}
              <div className="dbs-headmaster-input">
                <label>Head Order *</label>
                <input
                  type="text"
                  placeholder="e.g. 1"
                  value={headOrder}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) {
                      setHeadOrder(val);
                    }
                  }}
                />
              </div>
            </div>

            {/* Form Action Controls */}
            <div
              className="dbs-headmaster-actions"
              style={{ marginTop: "20px" }}
            >
              <button
                type="button"
                className="dbs-headmaster-reset-btn"
                onClick={handleCancel}
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
                <span>{editingId ? "Update" : "Save"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Ledger List Table Card */}
        <div className="dbs-accountmaster-table-card">
          <div className="dbs-accountmaster-table-header-area">
            <span className="dbs-accountmaster-table-title">
              Budget Heads List ({filteredData.length})
            </span>

            <div className="dbs-accountmaster-search-wrap">
              <input
                type="text"
                placeholder="Search budget heads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="dbs-accountmaster-search-input"
              />
              <Search size={14} className="dbs-accountmaster-search-icon" />
            </div>
          </div>

          <div className="dbs-accountmaster-table-scroll">
            <table className="dbs-data-table dbs-accountmaster-table">
              <thead>
                <tr>
                  <th style={{ width: "10%", textAlign: "center" }}>S.No.</th>
                  <th style={{ width: "40%" }}>Head Name</th>
                  <th style={{ width: "30%" }}>Short Name</th>
                  <th style={{ width: "10%", textAlign: "center" }}>Order</th>
                  <th style={{ width: "10%", textAlign: "center" }}>Edit</th>
                </tr>
              </thead>
              <tbody>
                {loadingTable ? (
                  <tr>
                    <td
                      colSpan={5}
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
                      <div>Loading Budget Heads...</div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        padding: "30px",
                        color: "var(--dbs-text-muted)",
                      }}
                    >
                      No budget head records found
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, idx) => (
                    <tr
                      key={item.id || idx}
                      style={{
                        backgroundColor:
                          String(editingId) === String(item.id)
                            ? "rgba(124, 58, 237, 0.06)"
                            : undefined,
                      }}
                    >
                      <td style={{ textAlign: "center", fontWeight: 600 }}>
                        {item.sNo}
                      </td>
                      <td style={{ fontWeight: 600, color: "var(--dbs-text)" }}>
                        {item.headName}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {item.shortName}
                      </td>
                      <td style={{ textAlign: "center", fontWeight: 600 }}>
                        {item.order}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="dbs-btn-edit-purple"
                          onClick={() => handleEdit(item)}
                          title="Edit Budget Head"
                        >
                          <Edit size={13} />
                          <span>Edit</span>
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
    </div>
  );
};

export default BudgetHeads;