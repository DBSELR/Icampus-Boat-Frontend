import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Save,
  X,
  Edit3,
  Search,
  Wallet,
  Tag,
  Layers,
  Hash,
  Building,
  Loader2,
  CheckCircle2,
  FolderOpen,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  getPaymentHeadsMasterList,
  getPaymentBankHeadsList,
  getPaymentHeadsNextOrder,
  getPaymentHeadByShortName,
  savePaymentHeadsMaster,
} from "../../../apis/AccountsApis";

import "./PaymentHeads.css";

export interface PaymentHeadItem {
  id: number | string;
  sNo: number;
  headName: string;
  shortName: string;
  budgetHead: string;
  budgetHeadName?: string;
  order: number | string;
  academicYear?: string;
  financialYear?: string;
  accountNo?: string | null;
  isActive?: any;
}

export interface BankHeadOption {
  bHNAME: string;
  bHSNAME: string;
}

export const PaymentHeads: React.FC = () => {
  const [academicYear, setAcademicYear] = useState<string>(() => {
    return localStorage.getItem("academicYear") || "2025-2026";
  });
  const [financialYear, setFinancialYear] = useState<string>(() => {
    return localStorage.getItem("financialYear") || "April 2017 - March 2018";
  });

  const [shortName, setShortName] = useState<string>("");
  const [headName, setHeadName] = useState<string>("");
  const [headOrder, setHeadOrder] = useState<string>("1");
  const [budgetHead, setBudgetHead] = useState<string>("Select Bank Head");
  const [accountNo, setAccountNo] = useState<string>("");
  const [bankHeadsList, setBankHeadsList] = useState<BankHeadOption[]>([]);
  const [loadingBankHeads, setLoadingBankHeads] = useState<boolean>(false);
  const [loadingShortName, setLoadingShortName] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const [tableData, setTableData] = useState<PaymentHeadItem[]>([]);

  // 1. Fetch Payment Heads Table Data
  const fetchTableData = useCallback(async () => {
    try {
      setLoadingTable(true);
      const year = localStorage.getItem("academicYear") || "2025-2026";
      setAcademicYear(year);

      const res = await getPaymentHeadsMasterList(year);
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];

      const mapped: PaymentHeadItem[] = list.map((item: any, idx: number) => {
        const hName =
          item?.pHNAME ??
          item?.phname ??
          item?.headName ??
          item?.HEADNAME ??
          item?.name ??
          "";
        const sName =
          item?.pHSNAME ??
          item?.phsname ??
          item?.shortName ??
          item?.SHORTNAME ??
          item?.code ??
          "";
        const bHead =
          item?.bHEAD ??
          item?.bhead ??
          item?.bHSNAME ??
          item?.bHNAME ??
          item?.bhname ??
          item?.budgetHead ??
          "";
        const bHName =
          item?.bHNAME ??
          item?.bhname ??
          item?.budgetHeadName ??
          bHead;
        const ord = item?.oRDER ?? item?.order ?? item?.ORDER ?? idx + 1;

        return {
          id: item?.iD ?? item?.id ?? item?.ID ?? idx + 1,
          sNo: idx + 1,
          headName: String(hName),
          shortName: String(sName),
          budgetHead: String(bHead || "Select Bank Head"),
          budgetHeadName: String(bHName || ""),
          order: ord,
          academicYear: item?.aCADEMICYEAR ?? item?.academicYear ?? year,
          financialYear: item?.fINANCIALYEAR ?? item?.financialYear,
          accountNo: item?.aCCOUNTNO ?? item?.accountno ?? null,
          isActive: item?.isActive ?? null,
        };
      });

      setTableData(mapped);
    } catch (err: any) {
      console.error("Error fetching Payment Heads Master List:", err);
      toast.error("Failed to load payment heads list.");
    } finally {
      setLoadingTable(false);
    }
  }, []);

  // 2. Fetch Bank Heads List for Dropdown
  const fetchBankHeadsList = useCallback(async () => {
    try {
      setLoadingBankHeads(true);
      const res = await getPaymentBankHeadsList();
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];

      const mapped: BankHeadOption[] = list
        .map((item: any): BankHeadOption => ({
          bHNAME: String(item?.bHNAME ?? item?.bhname ?? ""),
          bHSNAME: String(item?.bHSNAME ?? item?.bhsname ?? ""),
        }))
        .filter((item: BankHeadOption) => item.bHNAME.trim().length > 0);

      setBankHeadsList(mapped);
    } catch (err) {
      console.error("Error fetching Bank Heads List:", err);
    } finally {
      setLoadingBankHeads(false);
    }
  }, []);

  // 3. Fetch Next Display Order from API
  const fetchNextOrder = useCallback(async () => {
    try {
      const res = await getPaymentHeadsNextOrder();
      const next =
        res?.nextOrder ??
        res?.data?.nextOrder ??
        res?.data ??
        res;
      if (next !== undefined && next !== null && !isNaN(Number(next))) {
        setHeadOrder(String(next));
      }
    } catch (err) {
      console.warn("Could not fetch next order from API, using fallback:", err);
    }
  }, []);

  // 4. Auto-fill Form by Short Name lookup
  const handleShortNameLookup = useCallback(
    async (code: string) => {
      const trimmed = code.trim();
      if (!trimmed) return;

      try {
        setLoadingShortName(true);
        const res = await getPaymentHeadByShortName(trimmed);
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];

        if (list.length > 0) {
          const record = list[0];
          const hName = record?.pHNAME ?? record?.phname ?? "";
          const ord = record?.oRDER ?? record?.order ?? "";
          const bHead =
            record?.bHEAD ??
            record?.bhead ??
            record?.bHSNAME ??
            record?.bHNAME ??
            "";

          if (hName) setHeadName(String(hName));
          if (ord) setHeadOrder(String(ord));
          if (record?.aCCOUNTNO) setAccountNo(String(record.aCCOUNTNO));
          if (record?.fINANCIALYEAR) setFinancialYear(String(record.fINANCIALYEAR));

          if (bHead) {
            const matched = bankHeadsList.find(
              (b: BankHeadOption) =>
                b.bHSNAME.toLowerCase() === bHead.toLowerCase() ||
                b.bHNAME.toLowerCase() === bHead.toLowerCase(),
            );
            setBudgetHead(matched ? matched.bHSNAME : bHead);
          }

          if (record?.iD || record?.id) {
            setEditingId(record.iD ?? record.id);
          }

          toast.success(`Loaded details for "${hName || trimmed}"`);
        }
      } catch (err: any) {
        console.warn("Error fetching details by short name:", err);
      } finally {
        setLoadingShortName(false);
      }
    },
    [bankHeadsList],
  );

  useEffect(() => {
    fetchTableData();
    fetchBankHeadsList();
    fetchNextOrder();
  }, [fetchTableData, fetchBankHeadsList, fetchNextOrder]);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return tableData;
    const term = searchTerm.toLowerCase().trim();
    return tableData.filter((item: PaymentHeadItem) => {
      const hName = (item.headName || "").toLowerCase();
      const sName = (item.shortName || "").toLowerCase();
      const bHead = (item.budgetHead || "").toLowerCase();
      const ord = String(item.order || "");
      return (
        hName.includes(term) ||
        sName.includes(term) ||
        bHead.includes(term) ||
        ord.includes(term)
      );
    });
  }, [tableData, searchTerm]);

  const handleCancel = () => {
    setShortName("");
    setHeadName("");
    setBudgetHead("Select Bank Head");
    setAccountNo("");
    setEditingId(null);
    fetchNextOrder();
    toast.info("Form reset.");
  };

  const handleEdit = (item: PaymentHeadItem) => {
    setEditingId(item.id);
    setShortName(item.shortName || "");
    setHeadName(item.headName || "");
    setHeadOrder(String(item.order ?? "1"));
    setAccountNo(item.accountNo || "");
    if (item.financialYear) setFinancialYear(item.financialYear);

    const matched = bankHeadsList.find(
      (b: BankHeadOption) =>
        b.bHSNAME.toLowerCase() === (item.budgetHead || "").toLowerCase() ||
        b.bHNAME.toLowerCase() === (item.budgetHead || "").toLowerCase() ||
        b.bHNAME.toLowerCase() === (item.budgetHeadName || "").toLowerCase(),
    );

    setBudgetHead(matched ? matched.bHSNAME : item.budgetHead || "Select Bank Head");
    toast.info(`Editing payment head: ${item.headName}`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shortName.trim()) {
      toast.error("Please enter Short Name");
      return;
    }
    if (!headName.trim()) {
      toast.error("Please enter Payment Head Name");
      return;
    }
    if (!headOrder.trim()) {
      toast.error("Please enter Head Order");
      return;
    }
    if (!budgetHead || budgetHead === "Select Bank Head") {
      toast.error("Please select a valid Budget Head");
      return;
    }

    try {
      setSaving(true);
      const matchedOption = bankHeadsList.find(
        (b: BankHeadOption) => b.bHSNAME === budgetHead || b.bHNAME === budgetHead,
      );
      const chosenValue = matchedOption ? matchedOption.bHSNAME : budgetHead;

      const payload = {
        id: editingId ? String(editingId) : "",
        academicYear: academicYear || localStorage.getItem("academicYear") || "2025-2026",
        fyear: financialYear || localStorage.getItem("financialYear") || "April 2017 - March 2018",
        order: String(headOrder),
        phname: headName.trim(),
        phsname: shortName.trim().toUpperCase(),
        accountno: accountNo || "",
        bhsname: chosenValue,
      };

      const res = await savePaymentHeadsMaster(payload);

      toast.success(
        res?.message ||
          (editingId
            ? `Payment Head "${headName}" updated successfully!`
            : `Payment Head "${headName}" saved successfully!`),
      );

      await fetchTableData();
      handleCancel();
    } catch (err: any) {
      console.error("Save Error:", err);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to save Payment Head",
      );
    } finally {
      setSaving(false);
    }
  };

  const editingItem = useMemo(
    () => tableData.find((item: PaymentHeadItem) => item.id === editingId),
    [tableData, editingId],
  );


  return (
    <div className="dbs-pro-container">
      <div className="dbs-pro-header-wrap">
        <div className="dbs-pro-header-info">
          <div className="dbs-pro-breadcrumb">
            <span>Accounting</span>
            <ArrowRight size={12} />
            <span>Master Setup</span>
            <ArrowRight size={12} />
            <span>Payment Heads</span>
          </div>
          <h1 className="dbs-pro-title">Payment Head Master</h1>
          <p className="dbs-pro-subtitle">
            Manage payment heads, short codes, and institutional budget associations.
          </p>
        </div>

        <div className="dbs-pro-stats-pill">
          <div className="dbs-pro-stat-item">
            <span>Academic Year:</span>
            <span className="dbs-pro-stat-val">{academicYear}</span>
          </div>
          <div className="dbs-pro-stat-item">
            <span>Total Records:</span>
            <span className="dbs-pro-stat-val">{tableData.length}</span>
          </div>
          <button
            type="button"
            className="dbs-pro-btn-cancel"
            style={{ height: "32px", padding: "0 12px", fontSize: "0.8rem" }}
            onClick={() => fetchTableData()}
            disabled={loadingTable}
            title="Refresh payment heads list"
          >
            <RefreshCw
              size={13}
              className={loadingTable ? "animate-spin" : ""}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="dbs-pro-split-grid">
        <div className="dbs-pro-card">
          <div className="dbs-pro-card-header">
            <div className="dbs-pro-card-title-group">
              <div className="dbs-pro-icon-badge">
                <Wallet size={20} />
              </div>
              <div>
                <h3 className="dbs-pro-card-title">
                  {editingId ? "Update Payment Head" : "Add Payment Head"}
                </h3>
                <p className="dbs-pro-card-desc">
                  {editingId
                    ? "Modify existing payment parameters"
                    : "Register a new institutional payment head"}
                </p>
              </div>
            </div>
          </div>

          {editingId && editingItem && (
            <div className="dbs-pro-edit-banner">
              <div className="dbs-pro-edit-badge">
                <CheckCircle2 size={15} />
                <span>
                  Editing: <strong>{editingItem.headName}</strong>
                </span>
              </div>
              <button
                type="button"
                className="dbs-pro-cancel-edit-btn"
                onClick={handleCancel}
              >
                Cancel Edit
              </button>
            </div>
          )}

          <form className="dbs-pro-form" onSubmit={handleSave}>
            <div className="dbs-pro-input-group">
              <label className="dbs-pro-label">
                <span>
                  Short Name / Code <span className="dbs-pro-label-req">*</span>
                </span>
              </label>
              <div className="dbs-pro-input-wrap">
                <Tag size={16} className="dbs-pro-input-icon" />
                <input
                  type="text"
                  className="dbs-pro-input"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  onBlur={(e) => handleShortNameLookup(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleShortNameLookup(shortName);
                    }
                  }}
                  placeholder="e.g. BFee"
                  maxLength={10}
                />
                {loadingShortName && (
                  <Loader2
                    size={15}
                    className="animate-spin"
                    style={{
                      position: "absolute",
                      right: "12px",
                      color: "var(--dbs-primary, #0284c7)",
                    }}
                  />
                )}
              </div>
            </div>


            <div className="dbs-pro-input-group">
              <label className="dbs-pro-label">
                <span>
                  Payment Head Name <span className="dbs-pro-label-req">*</span>
                </span>
              </label>
              <div className="dbs-pro-input-wrap">
                <Layers size={16} className="dbs-pro-input-icon" />
                <input
                  type="text"
                  className="dbs-pro-input"
                  value={headName}
                  onChange={(e) => setHeadName(e.target.value)}
                  placeholder="e.g. Bus Fee"
                />
              </div>
            </div>

            <div className="dbs-pro-input-group">
              <label className="dbs-pro-label">
                <span>
                  Display Order <span className="dbs-pro-label-req">*</span>
                </span>
              </label>
              <div className="dbs-pro-input-wrap">
                <Hash size={16} className="dbs-pro-input-icon" />
                <input
                  type="number"
                  className="dbs-pro-input"
                  value={headOrder}
                  onChange={(e) => setHeadOrder(e.target.value)}
                  placeholder="e.g. 1, 2, 3"
                  min="1"
                />
              </div>
            </div>

            {/* Budget Head Dropdown */}
            <div className="dbs-pro-input-group">
              <label className="dbs-pro-label">
                <span>
                  Budget Head Association <span className="dbs-pro-label-req">*</span>
                </span>
              </label>
              <div className="dbs-pro-input-wrap">
                <Building size={16} className="dbs-pro-input-icon" />
                <select
                  className="dbs-pro-select"
                  value={budgetHead}
                  onChange={(e) => setBudgetHead(e.target.value)}
                  disabled={loadingBankHeads}
                >
                  <option value="Select Bank Head">
                    {loadingBankHeads ? "Loading Bank Heads..." : "Select Bank Head"}
                  </option>
                  {bankHeadsList.map((b: BankHeadOption, idx: number) => (
                    <option key={b.bHSNAME || idx} value={b.bHSNAME}>
                      {b.bHNAME}
                    </option>
                  ))}
                </select>
              </div>
            </div>


            <div className="dbs-pro-actions">
              <button
                type="button"
                className="dbs-pro-btn-cancel"
                onClick={handleCancel}
                disabled={saving}
              >
                <X size={15} />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                className="dbs-pro-btn-save"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                <span>{saving ? "Saving..." : editingId ? "Update Head" : "Save Head"}</span>
              </button>
            </div>
          </form>
        </div>

        <div className="dbs-pro-card">
          <div className="dbs-pro-table-toolbar">
            <div className="dbs-pro-table-heading">
              <span>Configured Payment Heads</span>
              <span className="dbs-pro-count-badge">
                {filteredData.length} {filteredData.length === 1 ? "record" : "records"}
              </span>
            </div>
            <div className="dbs-pro-search-box">
              <Search size={15} className="dbs-pro-search-icon" />
              <input
                type="text"
                className="dbs-pro-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search payment heads..."
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

          <div className="dbs-pro-table-scroll">
            {loadingTable ? (
              <div
                style={{
                  padding: "48px 24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  color: "var(--dbs-text-muted, #64748b)",
                }}
              >
                <Loader2
                  size={28}
                  className="animate-spin"
                  style={{ color: "var(--dbs-primary, #0284c7)" }}
                />
                <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                  Loading payment heads for {academicYear}...
                </span>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="dbs-pro-empty-box">
                <div className="dbs-pro-empty-icon-wrap">
                  <FolderOpen size={28} />
                </div>
                <div className="dbs-pro-empty-title">
                  {searchTerm ? "No matching payment heads" : "No payment heads found"}
                </div>
                <div className="dbs-pro-empty-desc">
                  {searchTerm
                    ? `No records found matching "${searchTerm}". Try another keyword or clear the search.`
                    : `No payment head records found for academic year ${academicYear}. Add a new payment head using the form.`}
                </div>
              </div>
            ) : (
              <table className="dbs-pro-table">
                <thead>
                  <tr>
                    <th style={{ width: "8%", textAlign: "center" }}>S.No.</th>
                    <th style={{ width: "30%" }}>Payment Head Name</th>
                    <th style={{ width: "20%" }}>Short Code</th>
                    <th style={{ width: "22%" }}>Budget Head</th>
                    <th style={{ width: "10%", textAlign: "center" }}>Order</th>
                    <th style={{ width: "10%", textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, idx) => {
                    const displayBudgetHead =
                      item.budgetHeadName ||
                      bankHeadsList.find((b: BankHeadOption) => b.bHSNAME === item.budgetHead)?.bHNAME ||
                      item.budgetHead;

                    return (
                      <tr
                        key={item.id || idx}
                        className={editingId === item.id ? "row-editing" : ""}
                      >
                        <td style={{ textAlign: "center", fontWeight: 700, color: "#64748b" }}>
                          {item.sNo}
                        </td>
                        <td style={{ fontWeight: 700, color: "var(--dbs-text, #0f172a)" }}>
                          {item.headName}
                        </td>
                        <td>
                          <span className="dbs-pro-code-chip">{item.shortName}</span>
                        </td>
                        <td>
                          <span
                            style={{
                              background: "var(--dbs-primary-light, rgba(2, 132, 199, 0.08))",
                              color: "var(--dbs-primary, #0284c7)",
                              padding: "3px 10px",
                              borderRadius: "6px",
                              fontSize: "0.82rem",
                              fontWeight: 700,
                              border: "1px solid var(--dbs-border, #e2e8f0)",
                              display: "inline-block",
                            }}
                          >
                            {displayBudgetHead}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className="dbs-pro-order-chip">{item.order}</span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <div className="dbs-pro-action-group">
                            <button
                              type="button"
                              className="dbs-pro-btn-action edit"
                              onClick={() => handleEdit(item)}
                              title="Edit Payment Head"
                            >
                              <Edit3 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentHeads;
