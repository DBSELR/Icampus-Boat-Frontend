import React, { useState, useEffect, useMemo } from "react";
import {
  Save,
  X,
  Landmark,
  Calendar,
  SlidersHorizontal,
  Search,
  Loader2,
  FolderOpen,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  getBudgetFYears,
  getBudgetList,
  saveBudget,
} from "../../../apis/AccountsApis";
import "./Budget.css";

export interface BudgetRowItem {
  id: number | string | null; // Genuine backend ID or null
  rowKey: string; // Unique React list key
  sNo: number;
  headName: string;
  shortName: string;
  amount: string;
  originalAmount: string; // Tracks original amount from API
}

export interface FinancialYearOption {
  id: number | string;
  financialYear: string;
  isActive?: string;
}

const DEFAULT_FINANCIAL_YEARS: FinancialYearOption[] = [
  { id: 9, financialYear: "April 2017 - March 2018", isActive: "N" },
  { id: 2, financialYear: "April 2016 - March 2017", isActive: "N" },
  { id: 19, financialYear: "April 2013 - March 2014", isActive: "N" },
  { id: 5, financialYear: "April 2014 - March 2015", isActive: "N" },
  { id: 28, financialYear: "April 2012 - March 2013", isActive: "N" },
];

export const Budget: React.FC = () => {
  // Top Filter States (Initially empty / unselected)
  const [fYearList, setFYearList] = useState<FinancialYearOption[]>(DEFAULT_FINANCIAL_YEARS);
  const [loadingFYears, setLoadingFYears] = useState<boolean>(false);
  const [financialYear, setFinancialYear] = useState<string>("");
  const [sanctionMode, setSanctionMode] = useState<string>("");

  // Search Filter
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Table Data State
  const [rows, setRows] = useState<BudgetRowItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // ==========================================================
  // 1. FETCH FINANCIAL YEARS FROM API
  // ==========================================================
  const fetchFYears = async () => {
    try {
      setLoadingFYears(true);
      const res = await getBudgetFYears();
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];

      if (list.length > 0) {
        const mapped: FinancialYearOption[] = list.map((item: any) => ({
          id: item.iD ?? item.id ?? item.ID,
          financialYear:
            item.fINANCIALYEAR ??
            item.financialYear ??
            item.FINANCIALYEAR ??
            "",
          isActive: item.iSACTIVE ?? item.isActive,
        }));
        setFYearList(mapped);
      }
    } catch (err) {
      console.warn("Could not load financial years from API:", err);
    } finally {
      setLoadingFYears(false);
    }
  };

  // ==========================================================
  // 2. FETCH BUDGET LIST FOR SELECTED F-YEAR (AND OPTIONAL S-MODE)
  // ==========================================================
  const fetchBudgetList = async (fYear: string, sMode: string) => {
    try {
      setLoading(true);
      const res = await getBudgetList(fYear, sMode);
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];

      const mapped: BudgetRowItem[] = list.map((item: any, idx: number) => {
        const backendId = item.iD ?? item.id ?? item.ID ?? null;
        const initialAmt =
          item.aMOUNT !== null &&
          item.aMOUNT !== undefined &&
          item.aMOUNT !== ""
            ? String(item.aMOUNT)
            : "";

        return {
          id: backendId,
          rowKey: backendId ? `row-${backendId}` : `row-idx-${idx}`,
          sNo: idx + 1,
          headName:
            item.bHNAME ?? item.bhname ?? item.headName ?? item.HEADNAME ?? "",
          shortName:
            item.bHSNAME ??
            item.bhsname ??
            item.shortName ??
            item.SHORTNAME ??
            "",
          amount: initialAmt,
          originalAmount: initialAmt,
        };
      });
      setRows(mapped);
    } catch (err) {
      console.warn("Could not load budget list from API:", err);
      toast.error("Failed to load budget list for selected financial year.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch financial years on mount
  useEffect(() => {
    fetchFYears();
  }, []);

  // Fetch table data whenever Financial Year or Sanction Mode changes
  useEffect(() => {
    if (financialYear) {
      fetchBudgetList(financialYear, sanctionMode);
    } else {
      setRows([]);
    }
  }, [financialYear, sanctionMode]);

  // Update Amount for a specific row
  const handleAmountChange = (rowKey: string, val: string) => {
    if (/^\d*\.?\d*$/.test(val)) {
      setRows((prev) =>
        prev.map((row) =>
          row.rowKey === rowKey ? { ...row, amount: val } : row,
        ),
      );
    }
  };

  // Filtered rows for search
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter(
      (r) =>
        r.headName.toLowerCase().includes(term) ||
        r.shortName.toLowerCase().includes(term),
    );
  }, [rows, searchTerm]);

  // Calculate live total amount
  const totalAmount = useMemo(() => {
    return rows.reduce((sum, row) => {
      const num = parseFloat(row.amount);
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  }, [rows]);

  // Form Reset / Cancel
  const handleCancel = () => {
    setFinancialYear("");
    setSanctionMode("");
    setRows([]);
    setSearchTerm("");
    toast.info("Form reset.");
  };

  // Save Action (Updates existing records by passing genuine ID without duplicates)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!financialYear) {
      toast.error("Please select a Financial Year");
      return;
    }

    // Identify rows that were actually modified by the user
    const modifiedRows = rows.filter((r) => {
      const currAmt = String(r.amount || "").trim();
      const origAmt = String(r.originalAmount || "").trim();
      return currAmt !== origAmt;
    });

    // If no row was modified, check if there are non-empty rows for initial creation
    const rowsToSave =
      modifiedRows.length > 0
        ? modifiedRows
        : rows.filter((r) => String(r.amount || "").trim() !== "");

    if (rowsToSave.length === 0) {
      toast.info("No changes detected to save.");
      return;
    }

    try {
      setSaving(true);
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

      const mode =
        sanctionMode && sanctionMode !== "Select Mode" ? sanctionMode : "";

      // Save/Update each modified record with its exact ID
      for (const r of rowsToSave) {
        const payload = {
          id:
            r.id !== null &&
            r.id !== undefined &&
            String(r.id).trim() !== "" &&
            String(r.id).toLowerCase() !== "null"
              ? String(r.id)
              : "",
          fyear: financialYear,
          smode: mode,
          order: String(r.sNo || ""),
          bhname: r.headName,
          bhsname: r.shortName,
          amount: String(r.amount).trim(),
          userid: String(userId),
        };

        console.log("Saving/Updating Revenue Budget Record:", payload);
        await saveBudget(payload);
      }

      toast.success(
        rowsToSave.length === 1
          ? "Revenue Budget updated successfully!"
          : `${rowsToSave.length} budget records saved successfully!`,
      );

      // Reload fresh data from backend
      fetchBudgetList(financialYear, sanctionMode);
    } catch (err: any) {
      console.error("Save Budget Error:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save Revenue Budget",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dbs-pro-budget-container">
      {/* Page Header with Stats */}
      <div className="dbs-pro-budget-header-wrap">
        <div className="dbs-pro-budget-header-info">
          <div className="dbs-pro-budget-breadcrumb">
            <span>Accounting</span>
            <ArrowRight size={12} />
            <span>Budget Management</span>
          </div>
          <h1 className="dbs-pro-budget-title">Revenue Budget Allocation</h1>
          <p className="dbs-pro-budget-subtitle">
            Allocate and sanction annual financial budgets across institutional heads.
          </p>
        </div>

        {/* Header KPI Cards */}
        <div className="dbs-pro-budget-kpis">
          <div className="dbs-pro-kpi-card">
            <span className="dbs-pro-kpi-label">Total Heads</span>
            <span className="dbs-pro-kpi-val">{rows.length}</span>
          </div>
          <div className="dbs-pro-kpi-card">
            <span className="dbs-pro-kpi-label">Allocated Total</span>
            <span className="dbs-pro-kpi-val total-green">
              ₹ {totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Budget Card */}
      <div className="dbs-pro-card-wrap">
        {/* Card Top Toolbar */}
        <div className="dbs-pro-card-top-bar">
          <div className="dbs-pro-card-header-left">
            <div className="dbs-pro-icon-box">
              <Landmark size={20} />
            </div>
            <div>
              <h3 className="dbs-pro-card-heading">Revenue Budget Matrix</h3>
              <p className="dbs-pro-card-subheading">
                {financialYear
                  ? `Allocating budget for ${financialYear}${sanctionMode ? ` (${sanctionMode})` : ""}`
                  : "Select a Financial Year to load budget heads"}
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="dbs-pro-search-box" style={{ width: "240px" }}>
            <Search size={15} className="dbs-pro-search-icon" />
            <input
              type="text"
              className="dbs-pro-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search heads..."
              disabled={rows.length === 0}
            />
            {searchTerm && (
              <button
                type="button"
                className="dbs-pro-search-clear"
                onClick={() => setSearchTerm("")}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Filters Row */}
        <div className="dbs-pro-filters-toolbar">
          {/* Financial Year */}
          <div className="dbs-pro-filter-item">
            <label className="dbs-pro-filter-label">
              <Calendar size={14} />
              <span>Financial Year *</span>
            </label>
            <div className="dbs-pro-select-wrap">
              <Calendar size={16} className="dbs-pro-select-icon" />
              <select
                className="dbs-pro-filter-select"
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                disabled={loadingFYears}
              >
                <option value="">Select Financial Year</option>
                {fYearList.map((fy) => (
                  <option key={fy.id || fy.financialYear} value={fy.financialYear}>
                    {fy.financialYear}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sanction Mode (Optional) */}
          <div className="dbs-pro-filter-item">
            <label className="dbs-pro-filter-label">
              <SlidersHorizontal size={14} />
              <span>Sanction Mode</span>
            </label>
            <div className="dbs-pro-select-wrap">
              <SlidersHorizontal size={16} className="dbs-pro-select-icon" />
              <select
                className="dbs-pro-filter-select"
                value={sanctionMode}
                onChange={(e) => setSanctionMode(e.target.value)}
              >
                <option value="">Select Mode</option>
                <option value="General">General</option>
                <option value="Special">Special</option>
              </select>
            </div>
          </div>
        </div>

        {/* Budget Heads Table */}
        <div className="dbs-pro-table-wrapper">
          {loading ? (
            <div className="dbs-pro-empty-box" style={{ padding: "50px 20px" }}>
              <Loader2
                size={30}
                className="animate-spin"
                style={{ color: "var(--dbs-primary)" }}
              />
              <div className="dbs-pro-empty-title">Loading Budget Heads...</div>
            </div>
          ) : !financialYear ? (
            <div className="dbs-pro-empty-box" style={{ padding: "50px 20px" }}>
              <div className="dbs-pro-empty-icon-wrap">
                <FolderOpen size={28} />
              </div>
              <div className="dbs-pro-empty-title">Select a Financial Year</div>
              <div className="dbs-pro-empty-desc">
                Please select a Financial Year above to load and allocate the budget matrix.
              </div>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="dbs-pro-empty-box" style={{ padding: "50px 20px" }}>
              <div className="dbs-pro-empty-icon-wrap">
                <FolderOpen size={28} />
              </div>
              <div className="dbs-pro-empty-title">
                {searchTerm ? "No matching budget heads" : "No budget heads found"}
              </div>
              <div className="dbs-pro-empty-desc">
                {searchTerm
                  ? `No records found matching "${searchTerm}". Try another keyword.`
                  : `No budget records found for ${financialYear}.`}
              </div>
            </div>
          ) : (
            <table className="dbs-pro-budget-table">
              <thead>
                <tr>
                  <th style={{ width: "10%", textAlign: "center" }}>S.No.</th>
                  <th style={{ width: "45%" }}>Head Name</th>
                  <th style={{ width: "25%" }}>Short Code</th>
                  <th style={{ width: "20%", textAlign: "right" }}>Sanctioned Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.rowKey}>
                    <td style={{ textAlign: "center", fontWeight: 700, color: "#64748b" }}>
                      {row.sNo}
                    </td>
                    <td style={{ fontWeight: 700, color: "var(--dbs-text, #0f172a)" }}>
                      {row.headName}
                    </td>
                    <td>
                      <span className="dbs-pro-code-chip">{row.shortName}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="dbs-pro-amount-wrap">
                        <span className="dbs-pro-curr-sym">₹</span>
                        <input
                          type="text"
                          className="dbs-pro-amount-input"
                          placeholder="0.00"
                          value={row.amount}
                          onChange={(e) =>
                            handleAmountChange(row.rowKey, e.target.value)
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Actions & Live Total */}
        <div className="dbs-pro-budget-footer-bar">
          <div className="dbs-pro-footer-actions">
            <button
              type="button"
              className="dbs-pro-btn-primary"
              onClick={handleSave}
              disabled={saving || rows.length === 0}
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              <span>{saving ? "Saving..." : "Save Budget Allocation"}</span>
            </button>

            <button
              type="button"
              className="dbs-pro-btn-secondary"
              onClick={handleCancel}
              disabled={saving}
            >
              <X size={15} />
              <span>Cancel</span>
            </button>
          </div>

          {/* Live Total Display */}
          <div className="dbs-pro-total-display">
            <span className="dbs-pro-total-label">Total Allocated:</span>
            <span className="dbs-pro-total-amount">
              ₹ {totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Budget;
