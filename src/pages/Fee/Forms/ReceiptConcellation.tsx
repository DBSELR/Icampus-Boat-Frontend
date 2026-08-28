import React, { useState } from "react";
import {
  Trash2,
  X,
  Search,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import "./ReceiptConcellation.css";
import DeleteModal from "../../../common/DeleteModal";
import { getReceipt, deleteReceipt } from "../../../apis/FeeApis";

export interface ReceiptRecord {
  regNo: string;
  studentName: string;
  year: string | number;
  feeName: string;
  fee: string | number;
  amount: string | number;
  date: string;
  receiptNo?: string;
}

export const ReceiptConcellation: React.FC = () => {
  const academicYear = localStorage.getItem("academicYear") || "2026-2027";

  // Form & Table States
  const [receiptNo, setReceiptNo] = useState<string>("");
  const [receiptList, setReceiptList] = useState<ReceiptRecord[]>([]);
  const [searching, setSearching] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);

  // Currency Formatter
  const formatCurrency = (val: number | string) => {
    const num = typeof val === "number" ? val : parseFloat(val) || 0;
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Date Formatter (e.g. "2026-06-30T00:00:00" -> "30-06-2026")
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const clean = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
      const parts = clean.split("-");
      if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return clean;
    } catch {
      return dateStr;
    }
  };

  // ==========================================================
  // 1. SEARCH RECEIPT DETAILS
  // ==========================================================
  const handleSearchReceipt = async (noToSearch?: string) => {
    const targetNo = (noToSearch !== undefined ? noToSearch : receiptNo).trim();
    if (!targetNo) {
      setReceiptList([]);
      return;
    }

    setSearching(true);
    try {
      console.log(`Calling GetReceipt for Receipt No: ${targetNo}, Academic Year: ${academicYear}`);
      const res = await getReceipt(targetNo, academicYear);
      console.log("GetReceipt API response:", res);
      const list = Array.isArray(res) ? res : res?.data;

      if (Array.isArray(list) && list.length > 0) {
        const mapped: ReceiptRecord[] = list.map((item: any) => ({
          regNo:
            item.registrationno ??
            item.regNo ??
            item.rEGNO ??
            item.registrationNo ??
            item.ssNo ??
            "",
          studentName:
            item.sName ??
            item.studentName ??
            item.sNAME ??
            item.studentname ??
            item.name ??
            "",
          year: String(item.year ?? item.sYEAR ?? item.syear ?? ""),
          feeName:
            item.fEETYPE ??
            item.feeName ??
            item.feetype ??
            item.feeType ??
            "Tuition Fee",
          fee: item.fEE ?? item.fee ?? item.amount ?? 0,
          amount: item.aMOUNT ?? item.amount ?? item.fEE ?? 0,
          date: formatDate(item.dATE ?? item.date ?? item.receiptDate),
          receiptNo: targetNo,
        }));
        setReceiptList(mapped);
        toast.success(`Found ${mapped.length} record(s) for Receipt #${targetNo}`);
      } else {
        setReceiptList([]);
        toast.error(`No receipt details found for Receipt #${targetNo}`);
      }
    } catch (err: any) {
      console.error("GetReceipt API error:", err);
      setReceiptList([]);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          `No receipt found for #${targetNo}`,
      );
    } finally {
      setSearching(false);
    }
  };

  // ==========================================================
  // 2. OPEN DELETE CONFIRMATION MODAL
  // ==========================================================
  const handleOpenDelete = () => {
    if (!receiptNo.trim()) {
      toast.error("Please enter a Receipt No");
      return;
    }
    if (receiptList.length === 0) {
      toast.error("Please search and load receipt details before deleting");
      return;
    }
    setDeleteModalOpen(true);
  };

  // ==========================================================
  // 3. CONFIRM & EXECUTE RECEIPT DELETION
  // ==========================================================
  const confirmDeleteReceipt = async () => {
    setDeleting(true);
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

      const payload = {
        receiptNO: receiptNo.trim(),
        academicYear,
        userId: String(userId),
      };

      console.log("Calling DeleteReceipt with payload:", payload);
      const res = await deleteReceipt(payload);
      console.log("DeleteReceipt response:", res);

      toast.success(
        res?.message || `Receipt #${receiptNo} deleted successfully`,
      );

      handleReset();
    } catch (err: any) {
      console.error("DeleteReceipt API error:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          `Failed to delete Receipt #${receiptNo}`,
      );
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  // ==========================================================
  // 4. RESET / CANCEL ACTION
  // ==========================================================
  const handleReset = () => {
    setReceiptNo("");
    setReceiptList([]);
    toast.info("Receipt cancellation form reset.");
  };

  return (
    <div className="dbs-headmaster-container dbs-receiptcancel-container">
      {/* Page Header */}
      <div className="dbs-headmaster-header">
        <div>
          <h2>Receipt Concellation</h2>
          <p className="dbs-headmaster-subtitle">
            Search and cancel fee receipts ({academicYear})
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="dbs-headmaster-form-card">
        <h3>Receipt Concellation</h3>

        <div className="dbs-headmaster-grid" style={{ gridTemplateColumns: "1fr" }}>
          {/* Receipt No Input */}
          <div className="dbs-headmaster-input" style={{ maxWidth: "550px" }}>
            <label>Receipt No *</label>
            <div className="dbs-receiptcancel-input-wrap">
              <input
                type="text"
                placeholder="Enter Receipt No (e.g. 113742)"
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                onBlur={() => {
                  if (receiptNo.trim()) {
                    handleSearchReceipt(receiptNo);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearchReceipt(receiptNo);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => handleSearchReceipt(receiptNo)}
                title="Search Receipt"
                style={{
                  position: "absolute",
                  right: "6px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "6px",
                  color: "var(--dbs-primary, #0e7490)",
                }}
              >
                {searching ? (
                  <Loader2 size={18} className="dbs-spin" />
                ) : (
                  <Search size={18} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className="dbs-headmaster-actions"
          style={{ justifyContent: "center", borderTop: "none", marginTop: "4px" }}
        >
          <button
            type="button"
            className="dbs-headmaster-delete-btn"
            onClick={handleOpenDelete}
            disabled={deleting || receiptList.length === 0}
          >
            {deleting ? (
              <Loader2 size={16} className="dbs-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            {deleting ? "Deleting..." : "Delete"}
          </button>

          <button
            type="button"
            className="dbs-headmaster-reset-btn"
            onClick={handleReset}
            disabled={deleting}
          >
            <X size={16} />
            Cancel
          </button>
        </div>

        {/* Receipt Details Table */}
        {receiptList.length > 0 && (
          <div className="dbs-receiptcancel-table-scroll">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "16%" }}>RegNo</th>
                  <th style={{ width: "28%" }}>Student Name</th>
                  <th style={{ width: "8%", textAlign: "center" }}>Year</th>
                  <th style={{ width: "18%" }}>Fee Name</th>
                  <th style={{ width: "10%", textAlign: "right" }}>Fee</th>
                  <th style={{ width: "10%", textAlign: "right" }}>Amount</th>
                  <th style={{ width: "10%", textAlign: "center" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {receiptList.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{row.regNo}</td>
                    <td style={{ fontWeight: 600, color: "var(--dbs-text, #1e293b)" }}>
                      {row.studentName}
                    </td>
                    <td style={{ textAlign: "center" }}>{row.year}</td>
                    <td>{row.feeName}</td>
                    <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 600 }}>
                      {typeof row.fee === "number" ? formatCurrency(row.fee) : row.fee}
                    </td>
                    <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 700 }}>
                      {typeof row.amount === "number"
                        ? formatCurrency(row.amount)
                        : row.amount}
                    </td>
                    <td style={{ textAlign: "center" }}>{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        title="Delete Receipt"
        itemName={
          receiptList[0]
            ? `Receipt #${receiptNo} - ${receiptList[0].studentName} (${receiptList[0].regNo}) - ₹${formatCurrency(
                receiptList[0].amount,
              )}`
            : `Receipt #${receiptNo}`
        }
        loading={deleting}
        onCancel={() => {
          if (!deleting) {
            setDeleteModalOpen(false);
          }
        }}
        onConfirm={confirmDeleteReceipt}
      />
    </div>
  );
};

export default ReceiptConcellation;


