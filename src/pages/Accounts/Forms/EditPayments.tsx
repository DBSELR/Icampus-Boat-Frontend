import React, { useState, useEffect, useCallback } from "react";
import {
  Save,
  X,
  Wallet,
  Calendar,
  Layers,
  Hash,
  Landmark,
  User,
  CreditCard,
  Tag,
  Receipt,
  FileText,
  CalendarCheck,
  MessageSquare,
  FileEdit,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  getEditPaymentHeads,
  getEditPaymentData,
  getEditPaymentAccountNumbers,
  savePayment,
} from "../../../apis/AccountsApis";
import "./EditPayments.css";

export interface PaymentHeadOption {
  iD?: number | string;
  pHNAME: string;
  pHSNAME: string;
  bHEAD?: string;
  aCCOUNTNO?: string | null;
  oRDER?: number;
  aCADEMICYEAR?: string;
  fINANCIALYEAR?: string;
}

const formatDateFromApi = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    if (dateStr.includes("T")) {
      const [d] = dateStr.split("T");
      const [yyyy, mm, dd] = d.split("-");
      return `${dd}-${mm}-${yyyy}`;
    }
    if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      if (parts[0].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

const formatDateForInput = (dateStr?: string | null): string => {
  if (!dateStr || String(dateStr).trim() === "") return "";
  try {
    const s = String(dateStr).trim();
    if (s.includes("T")) {
      return s.split("T")[0];
    }
    if (s.includes("-")) {
      const parts = s.split("-");
      if (parts[2]?.length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      }
      if (parts[0]?.length === 4) {
        return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
      }
    }
    if (s.includes("/")) {
      const parts = s.split("/");
      if (parts[2]?.length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      }
      if (parts[0]?.length === 4) {
        return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
      }
    }
    return s;
  } catch {
    return dateStr || "";
  }
};

const formatDateForApi = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    if (dateStr.includes("T")) {
      return dateStr.split("T")[0];
    }
    if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      if (parts[2]?.length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      }
      if (parts[0]?.length === 4) {
        return dateStr;
      }
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

const PAYMENT_TYPE_OPTIONS = [
  "Select Payment Type",
  "Payment",
  "Advance Payment",
];

const PAYMENT_MODE_OPTIONS = [
  "Select Payment Mode",
  "Cash",
  "Cheque",
];

export const EditPayments: React.FC = () => {
  // Form Fields State matching screenshot
  const [voucherNumber, setVoucherNumber] = useState<string>("");
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  });
  const [nameOfPayee, setNameOfPayee] = useState<string>("");
  const [headOfAccount, setHeadOfAccount] = useState<string>("Select Head Account");
  const [paymentHeadsList, setPaymentHeadsList] = useState<PaymentHeadOption[]>([]);
  const [loadingPaymentHeads, setLoadingPaymentHeads] = useState<boolean>(false);
  const [fromAccountNo, setFromAccountNo] = useState<string>("Select Account No.");
  const [accountNosList, setAccountNosList] = useState<string[]>([]);
  const [loadingAccountNos, setLoadingAccountNos] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>("");
  const [paymentType, setPaymentType] = useState<string>("Select Payment Type");
  const [paymentMode, setPaymentMode] = useState<string>("Select Payment Mode");
  const [chequeNo, setChequeNo] = useState<string>("");
  const [chequeClearanceDate, setChequeClearanceDate] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("");
  const [remark, setRemark] = useState<string>("");

  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [loadingVoucherLookup, setLoadingVoucherLookup] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const fetchPaymentHeads = useCallback(async () => {
    try {
      setLoadingPaymentHeads(true);
      const academicYear = localStorage.getItem("academicYear") || "2025-2026";
      const fYear =
        localStorage.getItem("financialYear") ||
        localStorage.getItem("fYear") ||
        "April 2017 - March 2018";
      const res = await getEditPaymentHeads(academicYear, fYear);
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];

      const mapped: PaymentHeadOption[] = list
        .map(
          (item: any): PaymentHeadOption => ({
            iD: item?.iD ?? item?.id,
            pHNAME: String(
              item?.pHNAME ?? item?.phname ?? item?.headName ?? "",
            ),
            pHSNAME: String(
              item?.pHSNAME ?? item?.phsname ?? item?.shortName ?? "",
            ),
            bHEAD: String(item?.bHEAD ?? item?.bhead ?? ""),
            aCCOUNTNO: item?.aCCOUNTNO ?? item?.accountNo ?? null,
            oRDER: item?.oRDER ?? item?.order,
            aCADEMICYEAR: item?.aCADEMICYEAR ?? item?.academicYear,
            fINANCIALYEAR: item?.fINANCIALYEAR ?? item?.financialYear,
          }),
        )
        .filter((item: PaymentHeadOption) => item.pHNAME.trim().length > 0);

      setPaymentHeadsList(mapped);
    } catch (err) {
      console.error("Error fetching Payment Heads:", err);
    } finally {
      setLoadingPaymentHeads(false);
    }
  }, []);

  const fetchAccountNumbers = useCallback(async () => {
    try {
      setLoadingAccountNos(true);
      const res = await getEditPaymentAccountNumbers();
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];

      const mapped: string[] = list
        .map((item: any) =>
          String(
            item?.aCNO ?? item?.acno ?? item?.accountNo ?? item ?? "",
          ).trim(),
        )
        .filter((acc: string) => acc.length > 0);

      setAccountNosList(mapped);
    } catch (err) {
      console.error("Error fetching Account Numbers:", err);
    } finally {
      setLoadingAccountNos(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentHeads();
    fetchAccountNumbers();
  }, [fetchPaymentHeads, fetchAccountNumbers]);

  const handleVoucherLookup = useCallback(
    async (vNo: string) => {
      const trimmed = vNo.trim();
      if (!trimmed) return;

      try {
        setLoadingVoucherLookup(true);
        const fYear =
          localStorage.getItem("financialYear") ||
          localStorage.getItem("fYear") ||
          "April 2017 - March 2018";
        const res = await getEditPaymentData(trimmed, fYear);
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];

        if (list.length > 0) {
          const item = list[0];
          const rawPid = item?.pID ?? item?.pid ?? item?.id;
          setEditingId(rawPid);

          if (item?.pAYEENAME) setNameOfPayee(String(item.pAYEENAME));
          if (item?.pDATE) setDate(formatDateFromApi(item.pDATE));

          const rawHead = String(
            item?.hEADOFACCOUNT ??
              item?.headofaccount ??
              item?.headOfAccount ??
              "",
          ).trim();
          if (rawHead) {
            const matchedHead = paymentHeadsList.find(
              (h: PaymentHeadOption) =>
                h.pHSNAME.toLowerCase() === rawHead.toLowerCase() ||
                h.pHNAME.toLowerCase() === rawHead.toLowerCase() ||
                (h.bHEAD && h.bHEAD.toLowerCase() === rawHead.toLowerCase()),
            );
            setHeadOfAccount(matchedHead ? matchedHead.pHSNAME : rawHead);
          }

          const rawAcNo = String(
            item?.aCNO ?? item?.acno ?? item?.accountNo ?? "",
          ).trim();
          if (rawAcNo) {
            setFromAccountNo(rawAcNo);
          }

          if (item?.aMOUNT !== undefined) setAmount(String(item.aMOUNT));
          if (item?.pAYMENTTYPE) setPaymentType(String(item.pAYMENTTYPE));
          const vMode = String(
            item?.pAYMENTMODE ??
              item?.paymentmode ??
              item?.paymentMode ??
              "Cash",
          );
          setPaymentMode(vMode);
          if (vMode === "Cheque") {
            setChequeNo(
              String(item?.cHEQUENO ?? item?.chequeno ?? item?.chequeNo ?? ""),
            );
            if (item?.cCDATE)
              setChequeClearanceDate(formatDateForInput(item.cCDATE));
            else setChequeClearanceDate("");
          } else {
            setChequeNo("");
            setChequeClearanceDate("");
          }
          if (item?.pURPOSE !== undefined)
            setPurpose(String(item.pURPOSE || ""));
          if (item?.rEMARK !== undefined) setRemark(String(item.rEMARK || ""));

          toast.success(
            `Loaded voucher #${trimmed} for ${item?.pAYEENAME || ""}`,
          );
        }
      } catch (err) {
        console.warn("No voucher record found:", err);
      } finally {
        setLoadingVoucherLookup(false);
      }
    },
    [paymentHeadsList],
  );

  const handleCancel = () => {
    setVoucherNumber("");
    setNameOfPayee("");
    setHeadOfAccount("Select Head Account");
    setFromAccountNo("Select Account No.");
    setAmount("");
    setPaymentType("Select Payment Type");
    setPaymentMode("Select Payment Mode");
    setChequeNo("");
    setChequeClearanceDate("");
    setPurpose("");
    setRemark("");
    setEditingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!headOfAccount || headOfAccount === "Select Head Account") {
      toast.error("Please select a valid Head Of Account.");
      return;
    }

    if (!fromAccountNo || fromAccountNo === "Select Account No.") {
      toast.error("Please select From Account No.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid Amount.");
      return;
    }

    try {
      setSaving(true);
      const academicYear = localStorage.getItem("academicYear") || "2025-2026";
      const fYear =
        localStorage.getItem("financialYear") ||
        localStorage.getItem("fYear") ||
        "April 2017 - March 2018";
      const cId =
        localStorage.getItem("staffId") ||
        localStorage.getItem("userId") ||
        "NT125";

      const matchedHead = paymentHeadsList.find(
        (h: PaymentHeadOption) =>
          h.pHSNAME.toLowerCase() === headOfAccount.toLowerCase() ||
          h.pHNAME.toLowerCase() === headOfAccount.toLowerCase() ||
          (h.bHEAD && h.bHEAD.toLowerCase() === headOfAccount.toLowerCase()),
      );
      const headAccountCode = matchedHead?.pHSNAME || headOfAccount;

      const payload = {
        academicYear,
        fYear,
        voucherNo: voucherNumber.trim(),
        paymentDate: formatDateForApi(date.trim()),
        payeeName: nameOfPayee.trim(),
        headAccount: headAccountCode,
        pAccount: fromAccountNo.trim(),
        paymentType:
          paymentType === "Select Payment Type" ? "Payment" : paymentType,
        paymentMode:
          paymentMode === "Select Payment Mode" ? "Cash" : paymentMode,
        chequeNo: paymentMode === "Cheque" ? chequeNo.trim() : "",
        ccDate:
          paymentMode === "Cheque" && chequeClearanceDate
            ? formatDateForApi(chequeClearanceDate.trim())
            : "",
        purpose: purpose.trim(),
        remark: remark.trim() || "NO",
        amount: String(amount).trim(),
        cId,
        pID: editingId ? String(editingId) : "",
      };

      const res = await savePayment(payload);
      toast.success(res?.message || "Payment details saved successfully!");
      handleCancel();
    } catch (err: any) {
      console.error("Save payment error:", err);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to save payment.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dbs-pro-container">
      {/* Page Header */}
      <div className="dbs-pro-header-wrap">
        <div className="dbs-pro-header-info">
          <div className="dbs-pro-breadcrumb">
            <span>Accounting</span>
            <ArrowRight size={12} />
            <span>Payments</span>
            <ArrowRight size={12} />
            <span>Edit Payments</span>
          </div>
          <h1 className="dbs-pro-title">Edit Payments</h1>
          <p className="dbs-pro-subtitle">
            Update institutional payment vouchers, transaction allocations, and clearance parameters.
          </p>
        </div>

        {/* Quick Status Pill */}
        <div className="dbs-pro-stats-pill">
          <div className="dbs-pro-stat-item">
            <span>Date:</span>
            <span className="dbs-pro-stat-val">{date}</span>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="dbs-pro-card">
        <div className="dbs-pro-card-header">
          <div className="dbs-pro-card-title-group">
            <div className="dbs-pro-icon-badge">
              <Wallet size={20} />
            </div>
            <div>
              <h3 className="dbs-pro-card-title">Payment Voucher Form</h3>
              <p className="dbs-pro-card-desc">
                Fill in the details below to record or update this payment transaction.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form className="dbs-pro-form" onSubmit={handleSave}>
          <div className="dbs-pro-grid-2col">
            {/* 1. Voucher Number */}
            <div className="dbs-pro-input-group">
              <label className="dbs-pro-label">
                <span>Voucher Number</span>
              </label>
              <div className="dbs-pro-input-wrap">
                <Hash size={16} className="dbs-pro-input-icon" />
                <input
                  type="text"
                  className="dbs-pro-input"
                  value={voucherNumber}
                  onChange={(e) => setVoucherNumber(e.target.value)}
                  onBlur={() => handleVoucherLookup(voucherNumber)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleVoucherLookup(voucherNumber);
                    }
                  }}
                  placeholder="e.g. 1"
                />
              </div>
            </div>

            {/* 2. Date */}
            <div className="dbs-pro-input-group">
              <label className="dbs-pro-label">
                <span>Date</span>
              </label>
              <div className="dbs-pro-input-wrap">
                <Calendar size={16} className="dbs-pro-input-icon" />
                <input
                  type="text"
                  className="dbs-pro-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="DD-MM-YYYY"
                />
              </div>
            </div>

            {/* 3. Name of Payee */}
            <div className="dbs-pro-input-group">
              <label className="dbs-pro-label">
                <span>Name of Payee</span>
              </label>
              <div className="dbs-pro-input-wrap">
                <User size={16} className="dbs-pro-input-icon" />
                <input
                  type="text"
                  className="dbs-pro-input"
                  value={nameOfPayee}
                  onChange={(e) => setNameOfPayee(e.target.value)}
                  placeholder="Enter payee name"
                />
              </div>
            </div>

            {/* 4. Head Of Account */}
            <div className="dbs-pro-input-group">
              <label className="dbs-pro-label">
                <span>
                  Head Of Account <span className="dbs-pro-label-req">*</span>
                </span>
              </label>
              <div className="dbs-pro-input-wrap">
                <Layers size={16} className="dbs-pro-input-icon" />
                <select
                  className="dbs-pro-select"
                  value={headOfAccount}
                  onChange={(e) => {
                    const selectedHead = e.target.value;
                    setHeadOfAccount(selectedHead);
                    const matched = paymentHeadsList.find(
                      (h: PaymentHeadOption) =>
                        h.pHNAME.toLowerCase() === selectedHead.toLowerCase() ||
                        h.pHSNAME.toLowerCase() === selectedHead.toLowerCase(),
                    );
                    if (matched && matched.aCCOUNTNO) {
                      setFromAccountNo(String(matched.aCCOUNTNO));
                    }
                  }}
                >
                  <option value="Select Head Account">
                    {loadingPaymentHeads
                      ? "Loading Heads..."
                      : "Select Head Account"}
                  </option>
                  {headOfAccount &&
                    headOfAccount !== "Select Head Account" &&
                    !paymentHeadsList.some(
                      (opt) =>
                        opt.pHSNAME.toLowerCase() ===
                          headOfAccount.toLowerCase() ||
                        opt.pHNAME.toLowerCase() ===
                          headOfAccount.toLowerCase(),
                    ) && <option value={headOfAccount}>{headOfAccount}</option>}
                  {paymentHeadsList.map(
                    (opt: PaymentHeadOption, idx: number) => (
                      <option
                        key={opt.iD || opt.pHSNAME || idx}
                        value={opt.pHSNAME}
                      >
                        {opt.pHNAME}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>

            {/* 5. From Account No. */}
            <div className="dbs-pro-input-group">
              <label className="dbs-pro-label">
                <span>
                  From Account No. <span className="dbs-pro-label-req">*</span>
                </span>
              </label>
              <div className="dbs-pro-input-wrap">
                <Landmark size={16} className="dbs-pro-input-icon" />
                <select
                  className="dbs-pro-select"
                  value={fromAccountNo}
                  onChange={(e) => setFromAccountNo(e.target.value)}
                >
                  <option value="Select Account No.">
                    {loadingAccountNos
                      ? "Loading Accounts..."
                      : "Select Account No."}
                  </option>
                  {fromAccountNo &&
                    fromAccountNo !== "Select Account No." &&
                    !accountNosList.some(
                      (acc) =>
                        acc.toLowerCase() === fromAccountNo.toLowerCase(),
                    ) && <option value={fromAccountNo}>{fromAccountNo}</option>}
                  {accountNosList.map((acc: string, idx: number) => (
                    <option key={acc || idx} value={acc}>
                      {acc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 6. Amount */}
            <div className="dbs-pro-input-group">
              <label className="dbs-pro-label">
                <span>
                  Amount <span className="dbs-pro-label-req">*</span>
                </span>
              </label>
              <div className="dbs-pro-input-wrap">
                <Receipt size={16} className="dbs-pro-input-icon" />
                <input
                  type="number"
                  className="dbs-pro-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* 7. Payment Type */}
            <div className="dbs-pro-input-group">
              <label className="dbs-pro-label">
                <span>Payment Type</span>
              </label>
              <div className="dbs-pro-input-wrap">
                <Tag size={16} className="dbs-pro-input-icon" />
                <select
                  className="dbs-pro-select"
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                >
                  {PAYMENT_TYPE_OPTIONS.map((pt) => (
                    <option key={pt} value={pt}>
                      {pt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 8. Payment Mode */}
            <div className="dbs-pro-input-group">
              <label className="dbs-pro-label">
                <span>Payment Mode</span>
              </label>
              <div className="dbs-pro-input-wrap">
                <CreditCard size={16} className="dbs-pro-input-icon" />
                <select
                  className="dbs-pro-select"
                  value={paymentMode}
                  onChange={(e) => {
                    const mode = e.target.value;
                    setPaymentMode(mode);
                    if (mode !== "Cheque") {
                      setChequeNo("");
                      setChequeClearanceDate("");
                    }
                  }}
                >
                  {PAYMENT_MODE_OPTIONS.map((pm) => (
                    <option key={pm} value={pm}>
                      {pm}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 9. Cheque No. */}
            <div className="dbs-pro-input-group">
              <label className="dbs-pro-label">
                <span>Cheque No.</span>
              </label>
              <div className="dbs-pro-input-wrap">
                <FileText size={16} className="dbs-pro-input-icon" />
                <input
                  type="text"
                  className={`dbs-pro-input ${paymentMode !== "Cheque" ? "disabled" : ""}`}
                  value={chequeNo}
                  onChange={(e) => setChequeNo(e.target.value)}
                  disabled={paymentMode !== "Cheque"}
                  placeholder={
                    paymentMode === "Cheque"
                      ? "e.g. CHQ-990212"
                      : "Disabled for Cash Mode"
                  }
                />
              </div>
            </div>

            {/* 10. Cheque Clearance Date */}
            <div className="dbs-pro-input-group">
              <label className="dbs-pro-label">
                <span>Cheque Clearance Date</span>
              </label>
              <div className="dbs-pro-input-wrap">
                <CalendarCheck size={16} className="dbs-pro-input-icon" />
                <input
                  type="date"
                  className={`dbs-pro-input ${paymentMode !== "Cheque" ? "disabled" : ""}`}
                  value={chequeClearanceDate}
                  onChange={(e) => setChequeClearanceDate(e.target.value)}
                  disabled={paymentMode !== "Cheque"}
                  placeholder="DD-MM-YYYY"
                />
              </div>
            </div>

            {/* 11. Purpose */}
            <div className="dbs-pro-input-group">
              <label className="dbs-pro-label">
                <span>Purpose</span>
              </label>
              <div className="dbs-pro-input-wrap">
                <FileEdit
                  size={16}
                  className="dbs-pro-input-icon top-align"
                />
                <textarea
                  className="dbs-pro-textarea"
                  rows={2}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="State the payment purpose..."
                />
              </div>
            </div>

            {/* 12. Remark */}
            <div className="dbs-pro-input-group">
              <label className="dbs-pro-label">
                <span>Remark</span>
              </label>
              <div className="dbs-pro-input-wrap">
                <MessageSquare
                  size={16}
                  className="dbs-pro-input-icon top-align"
                />
                <textarea
                  className="dbs-pro-textarea"
                  rows={2}
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Optional remarks or notes..."
                />
              </div>
            </div>
          </div>

          {/* Action Buttons: Cancel & Save */}
          <div className="dbs-pro-actions">
            <button
              type="button"
              className="dbs-pro-btn-cancel"
              onClick={handleCancel}
              disabled={saving}
            >
              <X size={16} />
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
              <span>{saving ? "Saving..." : "Save Payment"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPayments;
