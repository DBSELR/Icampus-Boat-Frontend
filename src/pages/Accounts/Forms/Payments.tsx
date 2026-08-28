import React, { useState, useMemo } from "react";
import {
  Save,
  X,
  Printer,
  Edit3,
  Search,
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
  Loader2,
  CheckCircle2,
  FolderOpen,
  ArrowRight,
  IndianRupee,
} from "lucide-react";
import { toast } from "sonner";
import {
  getPaymentHeadsForPayments,
  getPaymentVoucherNo,
  getPaymentAccountNumbers,
  getPaymentsData,
  getPaymentVoucherData,
  savePayment,
} from "../../../apis/AccountsApis";
import "./Payments.css";

export interface PaymentVoucherItem {
  id: number | string;
  sNo: number;
  voucherNo: string;
  paymentDate: string;
  payeeName: string;
  headOfAccount: string;
  accountNo: string;
  purpose: string;
  amount: string;
  paymentType?: string;
  paymentMode?: string;
  chequeNo?: string;
  chequeClearanceDate?: string;
  remark?: string;
}

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

const PAYMENT_TYPE_OPTIONS = [
  "Select Payment Type",
  "Payment",
  "Advance Payment",
];

const PAYMENT_MODE_OPTIONS = ["Select Payment Mode", "Cash", "Cheque"];

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

const formatDateForDisplay = formatDateFromApi;

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

const numberToWords = (num: number | string): string => {
  const n = typeof num === "string" ? parseFloat(num.replace(/,/g, "")) : num;
  if (isNaN(n) || n === 0) return "RUPEES ZERO ONLY";

  const a = [
    "",
    "ONE",
    "TWO",
    "THREE",
    "FOUR",
    "FIVE",
    "SIX",
    "SEVEN",
    "EIGHT",
    "NINE",
    "TEN",
    "ELEVEN",
    "TWELVE",
    "THIRTEEN",
    "FOURTEEN",
    "FIFTEEN",
    "SIXTEEN",
    "SEVENTEEN",
    "EIGHTEEN",
    "NINETEEN",
  ];
  const b = [
    "",
    "",
    "TWENTY",
    "THIRTY",
    "FORTY",
    "FIFTY",
    "SIXTY",
    "SEVENTY",
    "EIGHTY",
    "NINETY",
  ];

  const numToWordsChunk = (val: number): string => {
    let str = "";
    if (val >= 100) {
      str += a[Math.floor(val / 100)] + " HUNDRED ";
      val %= 100;
      if (val > 0) str += "AND ";
    }
    if (val >= 20) {
      str += b[Math.floor(val / 20)] + (val % 20 !== 0 ? " " + a[val % 20] : "") + " ";
    } else if (val > 0) {
      str += a[val] + " ";
    }
    return str.trim();
  };

  let intPart = Math.floor(n);
  let result = "";

  if (intPart >= 10000000) {
    result += numToWordsChunk(Math.floor(intPart / 10000000)) + " CRORE ";
    intPart %= 10000000;
  }
  if (intPart >= 100000) {
    result += numToWordsChunk(Math.floor(intPart / 100000)) + " LAKH ";
    intPart %= 100000;
  }
  if (intPart >= 1000) {
    result += numToWordsChunk(Math.floor(intPart / 1000)) + " THOUSAND ";
    intPart %= 1000;
  }
  if (intPart > 0) {
    result += numToWordsChunk(intPart);
  }

  const trimmed = result.trim();
  return trimmed ? `RUPEES ${trimmed} ONLY` : "RUPEES ZERO ONLY";
};

export const Payments: React.FC = () => {
  // Table Data State
  const [tableData, setTableData] = useState<PaymentVoucherItem[]>([]);

  // Form State matching screenshot
  const [voucherNumber, setVoucherNumber] = useState<string>("1");
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  });
  const [nameOfPayee, setNameOfPayee] = useState<string>("");
  const [headOfAccount, setHeadOfAccount] = useState<string>(
    "Select Head Account",
  );
  const [paymentHeadsList, setPaymentHeadsList] = useState<PaymentHeadOption[]>(
    [],
  );
  const [loadingPaymentHeads, setLoadingPaymentHeads] =
    useState<boolean>(false);
  const [fromAccountNo, setFromAccountNo] =
    useState<string>("Select Account No.");
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
  const [isExistingVoucher, setIsExistingVoucher] = useState<boolean>(false);
  const [loadingVoucherLookup, setLoadingVoucherLookup] =
    useState<boolean>(false);

  // Search & Loading State
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // 1. Fetch Next Voucher Number from API
  const fetchNextVoucherNo = React.useCallback(async () => {
    try {
      const fYear =
        localStorage.getItem("financialYear") ||
        localStorage.getItem("fYear") ||
        "April 2017 - March 2018";
      const res = await getPaymentVoucherNo(fYear);
      const vNo = res?.voucherNo ?? res?.data?.voucherNo ?? res?.data ?? res;
      if (vNo !== undefined && vNo !== null && String(vNo).trim() !== "") {
        setVoucherNumber(String(vNo));
      }
    } catch (err) {
      console.warn(
        "Could not fetch next voucher no from API, using fallback:",
        err,
      );
    }
  }, []);

  // 2. Fetch Payment Heads for Dropdown
  const fetchPaymentHeads = React.useCallback(async () => {
    try {
      setLoadingPaymentHeads(true);
      const academicYear = localStorage.getItem("academicYear") || "2025-2026";
      const fYear =
        localStorage.getItem("financialYear") ||
        localStorage.getItem("fYear") ||
        "April 2017 - March 2018";
      const res = await getPaymentHeadsForPayments(academicYear, fYear);
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

  // 3. Fetch Account Numbers for Dropdown
  const fetchAccountNumbers = React.useCallback(async () => {
    try {
      setLoadingAccountNos(true);
      const res = await getPaymentAccountNumbers();
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

  // 4. Fetch Payments Ledger Table Data
  const fetchTableData = React.useCallback(async () => {
    try {
      setLoadingTable(true);
      const academicYear = localStorage.getItem("academicYear") || "2025-2026";
      const fYear =
        localStorage.getItem("financialYear") ||
        localStorage.getItem("fYear") ||
        "April 2017 - March 2018";
      const res = await getPaymentsData(academicYear, fYear);
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];

      const mapped: PaymentVoucherItem[] = list.map(
        (item: any, idx: number) => {
          const rawDate = item?.pDATE ?? item?.pdate ?? item?.paymentDate ?? "";
          const rawCCDate = item?.cCDATE ?? item?.ccdate ?? item?.chequeClearanceDate ?? "";
          const formattedDate = formatDateForDisplay(rawDate);
          const formattedCCDate = rawCCDate ? formatDateForDisplay(rawCCDate) : "";
          const amt = String(item?.aMOUNT ?? item?.amount ?? "0");
          const pID = item?.pID ?? item?.pid ?? item?.id ?? idx + 1;

          return {
            id: pID,
            sNo: idx + 1,
            voucherNo: String(
              item?.vOUCHERNO ?? item?.voucherno ?? item?.voucherNo ?? idx + 1,
            ),
            paymentDate: formattedDate,
            payeeName: String(
              item?.pAYEENAME ?? item?.payeename ?? item?.payeeName ?? "",
            ),
            headOfAccount: String(
              item?.hEADOFACCOUNT ??
                item?.headofaccount ??
                item?.headOfAccount ??
                "",
            ),
            accountNo: String(
              item?.aCNO ?? item?.acno ?? item?.accountNo ?? "",
            ),
            purpose: String(item?.pURPOSE ?? item?.purpose ?? ""),
            amount: Number(amt).toFixed(2),
            paymentType: String(
              item?.pAYMENTTYPE ??
                item?.paymenttype ??
                item?.paymentType ??
                "Payment",
            ),
            paymentMode: String(
              item?.pAYMENTMODE ??
                item?.paymentmode ??
                item?.paymentMode ??
                "Cash",
            ),
            chequeNo: String(
              item?.cHEQUENO ?? item?.chequeno ?? item?.chequeNo ?? "",
            ),
            chequeClearanceDate: formattedCCDate,
            remark: String(item?.rEMARK ?? item?.remark ?? ""),
          };
        },
      );

      setTableData(mapped);
    } catch (err) {
      console.error("Error loading Payments table data:", err);
    } finally {
      setLoadingTable(false);
    }
  }, []);

  // 5. Lookup Voucher Data on Voucher Number Entry
  const handleVoucherLookup = React.useCallback(
    async (vNo: string) => {
      const trimmed = vNo.trim();
      if (!trimmed) return;

      try {
        setLoadingVoucherLookup(true);
        const fYear =
          localStorage.getItem("financialYear") ||
          localStorage.getItem("fYear") ||
          "April 2017 - March 2018";
        const res = await getPaymentVoucherData(trimmed, fYear);
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];

        if (list.length > 0) {
          const item = list[0];
          const rawPid = item?.pID ?? item?.pid ?? item?.id;
          setIsExistingVoucher(true);
          setEditingId(rawPid);

          if (item?.pAYEENAME) setNameOfPayee(String(item.pAYEENAME));
          if (item?.pDATE) setDate(formatDateFromApi(item.pDATE));

          // Resolve Head Of Account by matching either Code (pHSNAME) or Name (pHNAME)
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

          // Set From Account No.
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
            `Loaded existing voucher #${trimmed} for ${item?.pAYEENAME || ""}`,
          );
        } else {
          setIsExistingVoucher(false);
        }
      } catch (err) {
        console.warn("No voucher record found or lookup error:", err);
        setIsExistingVoucher(false);
      } finally {
        setLoadingVoucherLookup(false);
      }
    },
    [paymentHeadsList],
  );

  React.useEffect(() => {
    fetchPaymentHeads();
    fetchNextVoucherNo();
    fetchAccountNumbers();
    fetchTableData();
  }, [
    fetchPaymentHeads,
    fetchNextVoucherNo,
    fetchAccountNumbers,
    fetchTableData,
  ]);

  // Modal States
  const [receiptModalOpen, setReceiptModalOpen] = useState<boolean>(false);
  const [selectedVoucherForReceipt, setSelectedVoucherForReceipt] =
    useState<PaymentVoucherItem | null>(null);

  // Form Reset / Cancel
  const handleCancel = () => {
    setIsExistingVoucher(false);
    fetchNextVoucherNo();
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    setDate(`${dd}-${mm}-${yyyy}`);
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

  // Populate for Edit
  const handleEdit = (item: PaymentVoucherItem) => {
    setEditingId(item.id);
    setIsExistingVoucher(true);
    setVoucherNumber(item.voucherNo);
    setDate(item.paymentDate);
    setNameOfPayee(item.payeeName);

    const rawHead = String(item.headOfAccount || "").trim();
    const matchedHead = paymentHeadsList.find(
      (h: PaymentHeadOption) =>
        h.pHSNAME.toLowerCase() === rawHead.toLowerCase() ||
        h.pHNAME.toLowerCase() === rawHead.toLowerCase() ||
        (h.bHEAD && h.bHEAD.toLowerCase() === rawHead.toLowerCase()),
    );
    setHeadOfAccount(
      matchedHead ? matchedHead.pHSNAME : rawHead || "Select Head Account",
    );
    setFromAccountNo(item.accountNo || "Select Account No.");

    setAmount(item.amount);
    setPaymentType(item.paymentType || "Select Payment Type");
    const eMode = item.paymentMode || "Select Payment Mode";
    setPaymentMode(eMode);
    if (eMode === "Cheque") {
      setChequeNo(item.chequeNo || "");
      setChequeClearanceDate(
        formatDateForInput(item.chequeClearanceDate || (item as any).cCDATE),
      );
    } else {
      setChequeNo("");
      setChequeClearanceDate("");
    }
    setPurpose(item.purpose || "");
    setRemark(item.remark || "");
    toast.info(`Editing voucher #${item.voucherNo} for ${item.payeeName}`);
  };



  // Save / Update Form
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!voucherNumber.trim()) {
      toast.error("Please enter Voucher Number");
      return;
    }

    if (!date.trim()) {
      toast.error("Please select or enter Payment Date");
      return;
    }

    if (!nameOfPayee.trim()) {
      toast.error("Please enter Name of Payee");
      return;
    }

    if (!headOfAccount || headOfAccount === "Select Head Account") {
      toast.error("Please select Head Of Account");
      return;
    }

    if (!fromAccountNo || fromAccountNo === "Select Account No.") {
      toast.error("Please select From Account No.");
      return;
    }

    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid payment Amount");
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

      // Match headAccount code (e.g. BFEE)
      const matchedHead = paymentHeadsList.find(
        (h: PaymentHeadOption) =>
          h.pHNAME.toLowerCase() === headOfAccount.toLowerCase() ||
          h.pHSNAME.toLowerCase() === headOfAccount.toLowerCase() ||
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

      console.log("Saving Payment Voucher Payload:", payload);
      const res = await savePayment(payload);

      toast.success(
        res?.message ||
          (editingId
            ? `Payment voucher #${voucherNumber} updated successfully!`
            : `Payment voucher #${voucherNumber} saved successfully!`),
      );

      await fetchTableData();
      handleCancel();
    } catch (err: any) {
      console.error("Save Error:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save payment voucher",
      );
    } finally {
      setSaving(false);
    }
  };

  // Reprint Action
  const handleReprintCurrent = () => {
    const currentVoucher: PaymentVoucherItem = {
      id: editingId || Date.now(),
      sNo: 1,
      voucherNo: voucherNumber || "1",
      paymentDate: date,
      payeeName: nameOfPayee || "N/A",
      headOfAccount: headOfAccount || "N/A",
      accountNo: fromAccountNo || "N/A",
      amount: amount ? Number(amount).toFixed(2) : "0.00",
      paymentType,
      paymentMode,
      chequeNo,
      chequeClearanceDate,
      purpose,
      remark,
    };
    setSelectedVoucherForReceipt(currentVoucher);
    setReceiptModalOpen(true);
  };

  // Filtered Table Data
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return tableData;
    const term = searchTerm.toLowerCase().trim();
    return tableData.filter((item: PaymentVoucherItem) => {
      const vNo = (item.voucherNo || "").toLowerCase();
      const pDate = (item.paymentDate || "").toLowerCase();
      const pName = (item.payeeName || "").toLowerCase();
      const hAccount = (item.headOfAccount || "").toLowerCase();
      const accNo = (item.accountNo || "").toLowerCase();
      const pur = (item.purpose || "").toLowerCase();
      const amt = String(item.amount || "");
      return (
        vNo.includes(term) ||
        pDate.includes(term) ||
        pName.includes(term) ||
        hAccount.includes(term) ||
        accNo.includes(term) ||
        pur.includes(term) ||
        amt.includes(term)
      );
    });
  }, [tableData, searchTerm]);

  // Summary Totals
  const totalAmountDisbursed = useMemo(() => {
    return tableData.reduce(
      (sum: number, item: PaymentVoucherItem) =>
        sum + (Number(item.amount) || 0),
      0,
    );
  }, [tableData]);

  const editingItem = useMemo(
    () => tableData.find((item: PaymentVoucherItem) => item.id === editingId),
    [tableData, editingId],
  );

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
            <span>Voucher Entry</span>
          </div>
          <h1 className="dbs-pro-title">Payments</h1>
          <p className="dbs-pro-subtitle">
            Record, disburse, and manage institutional payment vouchers and
            payee ledgers.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="dbs-pro-stats-pill">
          <div className="dbs-pro-stat-item">
            <span>Total Vouchers:</span>
            <span className="dbs-pro-stat-val">{tableData.length}</span>
          </div>
          <div className="dbs-pro-stat-item">
            <span>Total Disbursed:</span>
            <span className="dbs-pro-stat-val">
              ₹{" "}
              {totalAmountDisbursed.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Payment Form Card */}
      <div className="dbs-pro-card">
        <div className="dbs-pro-card-header">
          <div className="dbs-pro-card-title-group">
            <div className="dbs-pro-icon-badge">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="dbs-pro-card-title">
                {editingId ? "Update Payment Voucher" : "Payments"}
              </h3>
              <p className="dbs-pro-card-desc">
                {editingId
                  ? "Modify existing voucher transaction details"
                  : "Enter details below to create a new disbursement voucher"}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Alert Banner */}
        {editingId && editingItem && (
          <div className="dbs-pro-edit-banner">
            <div className="dbs-pro-edit-badge">
              <CheckCircle2 size={15} />
              <span>
                Editing Voucher <strong>#{editingItem.voucherNo}</strong> for{" "}
                <strong>{editingItem.payeeName}</strong>
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

        {/* 12-Field 2-Column Form */}
        <form className="dbs-pro-form" onSubmit={handleSave}>
          <div className="dbs-pro-grid-2col">
            {/* 1. Voucher Number */}
            <div className="dbs-pro-input-group">
              <label className="dbs-pro-label">
                <span>
                  Voucher Number <span className="dbs-pro-label-req">*</span>
                </span>
              </label>
              <div className="dbs-pro-input-wrap">
                <Hash size={16} className="dbs-pro-input-icon" />
                <input
                  type="text"
                  className="dbs-pro-input"
                  value={voucherNumber}
                  onChange={(e) => setVoucherNumber(e.target.value)}
                  onBlur={(e) => handleVoucherLookup(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleVoucherLookup(voucherNumber);
                    }
                  }}
                  disabled={Boolean(editingId)}
                  placeholder="e.g. 1"
                />
                {loadingVoucherLookup && (
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

            {/* 2. Date */}
            <div className="dbs-pro-input-group">
              <label className="dbs-pro-label">
                <span>
                  Date <span className="dbs-pro-label-req">*</span>
                </span>
              </label>
              <div className="dbs-pro-input-wrap">
                <Calendar size={16} className="dbs-pro-input-icon" />
                <input
                  type="text"
                  className="dbs-pro-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={Boolean(editingId) || isExistingVoucher}
                  title={
                    Boolean(editingId) || isExistingVoucher
                      ? "Date is locked for existing voucher"
                      : ""
                  }
                  placeholder="DD-MM-YYYY"
                />
              </div>
            </div>

            {/* 3. Name of Payee */}
            <div className="dbs-pro-input-group">
              <label className="dbs-pro-label">
                <span>
                  Name of Payee <span className="dbs-pro-label-req">*</span>
                </span>
              </label>
              <div className="dbs-pro-input-wrap">
                <User size={16} className="dbs-pro-input-icon" />
                <input
                  type="text"
                  className="dbs-pro-input"
                  value={nameOfPayee}
                  onChange={(e) => setNameOfPayee(e.target.value)}
                  disabled={Boolean(editingId)}
                  placeholder="e.g. vinesh"
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
                        h.pHSNAME.toLowerCase() === selectedHead.toLowerCase() ||
                        h.pHNAME.toLowerCase() === selectedHead.toLowerCase(),
                    );
                    if (matched && matched.aCCOUNTNO) {
                      setFromAccountNo(String(matched.aCCOUNTNO));
                    }
                  }}
                  disabled={Boolean(editingId) || loadingPaymentHeads}
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
                  disabled={Boolean(editingId) || loadingAccountNos}
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
                <IndianRupee size={16} className="dbs-pro-input-icon" />
                <input
                  type="number"
                  step="0.01"
                  className="dbs-pro-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={Boolean(editingId)}
                  placeholder="e.g. 20000.00"
                />
              </div>
            </div>

            {/* 7. Payment Type */}
            <div className="dbs-pro-input-group">
              <label className="dbs-pro-label">
                <span>Payment Type</span>
              </label>
              <div className="dbs-pro-input-wrap">
                <CreditCard size={16} className="dbs-pro-input-icon" />
                <select
                  className="dbs-pro-select"
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                >
                  {PAYMENT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
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
                <Tag size={16} className="dbs-pro-input-icon" />
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
                  {PAYMENT_MODE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
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
                <Receipt size={16} className="dbs-pro-input-icon" />
                <input
                  type="text"
                  className={`dbs-pro-input ${paymentMode !== "Cheque" ? "disabled" : ""}`}
                  value={chequeNo}
                  onChange={(e) => setChequeNo(e.target.value)}
                  disabled={paymentMode !== "Cheque"}
                  placeholder={
                    paymentMode !== "Cheque"
                      ? "N/A (Disabled for Cash Mode)"
                      : "e.g. CHQ-98124"
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
                <FileText size={16} className="dbs-pro-input-icon top-align" />
                <textarea
                  className="dbs-pro-textarea"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  disabled={Boolean(editingId)}
                  placeholder="e.g. testing"
                  rows={2}
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
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  disabled={Boolean(editingId)}
                  placeholder="Enter remarks..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Form Action Buttons Centered */}
          <div className="dbs-pro-actions-center">
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
              <span>
                {saving ? "Saving..." : editingId ? "Update Voucher" : "Save"}
              </span>
            </button>

            <button
              type="button"
              className="dbs-pro-btn-reprint"
              onClick={handleReprintCurrent}
              title="Reprint active voucher"
            >
              <Printer size={16} />
              <span>Reprint</span>
            </button>

            <button
              type="button"
              className="dbs-pro-btn-cancel"
              onClick={handleCancel}
              disabled={saving}
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
          </div>
        </form>
      </div>

      {/* Payment Ledger Table Card */}
      <div className="dbs-pro-card">
        {/* Table Toolbar */}
        <div className="dbs-pro-table-toolbar">
          <div className="dbs-pro-table-heading">
            <span>Payment Vouchers Ledger</span>
            <span className="dbs-pro-count-badge">
              {filteredData.length}{" "}
              {filteredData.length === 1 ? "voucher" : "vouchers"}
            </span>
          </div>

          {/* Search Box */}
          <div className="dbs-pro-search-box">
            <Search size={15} className="dbs-pro-search-icon" />
            <input
              type="text"
              className="dbs-pro-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search voucher, payee, account..."
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

        {/* Table Scroll Area */}
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
                Loading payment vouchers...
              </span>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="dbs-pro-empty-box">
              <div className="dbs-pro-empty-icon-wrap">
                <FolderOpen size={28} />
              </div>
              <div className="dbs-pro-empty-title">
                {searchTerm
                  ? "No matching payment vouchers"
                  : "No payments recorded yet"}
              </div>
              <div className="dbs-pro-empty-desc">
                {searchTerm
                  ? `No vouchers found matching "${searchTerm}". Try another keyword or clear the search.`
                  : "Fill in the payment form above and click Save to issue your first payment voucher."}
              </div>
            </div>
          ) : (
            <table className="dbs-pro-table">
              <thead>
                <tr>
                  <th style={{ width: "6%", textAlign: "center" }}>S.No.</th>
                  <th style={{ width: "10%", textAlign: "center" }}>
                    Voucher No.
                  </th>
                  <th style={{ width: "12%" }}>Payment Date</th>
                  <th style={{ width: "18%" }}>Payee Name</th>
                  <th style={{ width: "14%" }}>Head of Account</th>
                  <th style={{ width: "12%" }}>Account No.</th>
                  <th style={{ width: "14%" }}>Purpose</th>
                  <th style={{ width: "14%", textAlign: "right" }}>Amount</th>
                  <th style={{ width: "10%", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item: PaymentVoucherItem, idx: number) => (
                  <tr
                    key={item.id || idx}
                    className={editingId === item.id ? "row-editing" : ""}
                  >
                    <td
                      style={{
                        textAlign: "center",
                        fontWeight: 700,
                        color: "#64748b",
                      }}
                    >
                      {item.sNo}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className="dbs-pro-order-chip">
                        {item.voucherNo}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: "#475569" }}>
                      {item.paymentDate}
                    </td>
                    <td
                      style={{
                        fontWeight: 700,
                        color: "var(--dbs-text, #0f172a)",
                      }}
                    >
                      {item.payeeName}
                    </td>
                    <td>
                      <span
                        style={{
                          background:
                            "var(--dbs-primary-light, rgba(2, 132, 199, 0.08))",
                          color: "var(--dbs-primary, #0284c7)",
                          padding: "3px 10px",
                          borderRadius: "6px",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          border: "1px solid var(--dbs-border, #e2e8f0)",
                          display: "inline-block",
                        }}
                      >
                        {item.headOfAccount}
                      </span>
                    </td>
                    <td>
                      <span className="dbs-pro-code-chip">
                        {item.accountNo}
                      </span>
                    </td>
                    <td
                      style={{
                        color: "#64748b",
                        maxWidth: "160px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.purpose || "-"}
                    </td>
                    <td
                      style={{ textAlign: "right" }}
                      className="dbs-pro-amount-cell"
                    >
                      {Number(item.amount).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div className="dbs-pro-action-group">
                        <button
                          type="button"
                          className="dbs-pro-btn-action edit"
                          onClick={() => handleEdit(item)}
                          title="Edit Payment Voucher"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          className="dbs-pro-btn-action print"
                          onClick={() => {
                            setSelectedVoucherForReceipt(item);
                            setReceiptModalOpen(true);
                          }}
                          title="Print Voucher Receipt"
                        >
                          <Printer size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Printable Receipt / Voucher Modal */}
      {receiptModalOpen && selectedVoucherForReceipt && (
        <div className="dbs-delete-modal-overlay dbs-voucher-modal-overlay" style={{ zIndex: 1050 }}>
          <div
            className="dbs-delete-modal dbs-voucher-modal-container"
            style={{
              maxWidth: "840px",
              width: "95%",
              padding: "20px",
              textAlign: "left",
              borderRadius: "10px",
              background: "#ffffff",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* Modal Actions Bar (hidden in print) */}
            <div className="dbs-voucher-modal-bar">
              <div style={{ fontWeight: 700, fontSize: "1rem", color: "#1e293b" }}>
                Payment Voucher Print Preview
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="dbs-pro-btn-cancel"
                  style={{ height: "36px", padding: "0 16px" }}
                  onClick={() => setReceiptModalOpen(false)}
                >
                  <X size={15} />
                  <span>Close</span>
                </button>
                <button
                  type="button"
                  className="dbs-pro-btn-save"
                  style={{ height: "36px", padding: "0 20px" }}
                  onClick={() => {
                    window.print();
                    toast.success("Printing voucher...");
                  }}
                >
                  <Printer size={15} />
                  <span>Print Form</span>
                </button>
              </div>
            </div>

            {/* The Exact Voucher Sheet as in screenshot */}
            <div id="dbs-payment-voucher-sheet" className="dbs-payment-voucher-sheet">
              {/* College Name Header */}
              <h2 className="dbs-voucher-college-name">
                LAKIREDDY BALI REDDY COLLEGE OF ENGINEERING (AUTONOMOUS)
              </h2>

              {/* Top Two-Column Grid */}
              <div className="dbs-voucher-top-grid">
                {/* Left Column */}
                <div className="dbs-voucher-left-col">
                  <div className="dbs-voucher-meta-row">
                    <div>
                      <span className="voucher-label-italic">Voucher No. :</span>
                      <span className="voucher-val-bold">{selectedVoucherForReceipt.voucherNo}</span>
                    </div>
                    <div>
                      <span className="voucher-label-italic">Date : </span>
                      <span className="voucher-val-bold">{selectedVoucherForReceipt.paymentDate}</span>
                    </div>
                    <div className="dbs-voucher-logo-wrap">
                      <img
                        src="/images/dbs-logo-short.png"
                        alt="College Logo"
                        className="dbs-voucher-logo"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                  </div>

                  <div className="dbs-voucher-field-row">
                    <span className="dbs-voucher-field-label">Head of Account</span>
                    <span className="dbs-voucher-colon">:</span>
                    <span className="dbs-voucher-field-val">{selectedVoucherForReceipt.headOfAccount}</span>
                  </div>

                  <div className="dbs-voucher-field-row">
                    <span className="dbs-voucher-field-label">1. Name of Payee</span>
                    <span className="dbs-voucher-colon">:</span>
                    <span className="dbs-voucher-field-val">{selectedVoucherForReceipt.payeeName}</span>
                  </div>

                  <div className="dbs-voucher-field-row">
                    <span className="dbs-voucher-field-label">2. Purpose of Payment</span>
                    <span className="dbs-voucher-colon">:</span>
                    <span className="dbs-voucher-field-val">{selectedVoucherForReceipt.purpose || "-"}</span>
                  </div>
                </div>

                {/* Right Column (Divided by double vertical line) */}
                <div className="dbs-voucher-right-col">
                  <div className="dbs-voucher-passed-row">
                    <span className="voucher-passed-text">Passed for Rs. </span>
                    <span className="voucher-passed-amount">
                      {Number(selectedVoucherForReceipt.amount).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <div className="dbs-voucher-words-row">
                    {numberToWords(selectedVoucherForReceipt.amount)}
                  </div>

                  <div className="dbs-voucher-dotted-blank" />
                  <div className="dbs-voucher-dotted-blank" />
                  <div className="dbs-voucher-dotted-blank" />
                </div>
              </div>

              {/* Top Signatures */}
              <div className="dbs-voucher-top-signatures">
                <div className="dbs-voucher-sign-item">Correspondent</div>
                <div className="dbs-voucher-sign-item">Principal</div>
              </div>

              {/* Double Horizontal Border Divider */}
              <div className="dbs-voucher-divider-double" />

              {/* Bottom Receipt / Acknowledgement */}
              <div className="dbs-voucher-bottom-section">
                <div className="dbs-voucher-received-row">
                  <div className="dbs-voucher-received-amt">
                    Received Rs.{" "}
                    <span>
                      {Number(selectedVoucherForReceipt.amount).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="dbs-voucher-received-words">
                    {numberToWords(selectedVoucherForReceipt.amount)}
                  </div>
                </div>

                <div className="dbs-voucher-particulars-row">
                  <span className="dbs-voucher-particulars-label">Particulars :</span>
                  <span className="dbs-voucher-particulars-val">
                    {selectedVoucherForReceipt.purpose || selectedVoucherForReceipt.remark || ""}
                  </span>
                </div>

                <div className="dbs-voucher-bottom-meta-row">
                  <div className="dbs-voucher-cheque-box">
                    <span>Cheque No. : </span>
                    <strong>{selectedVoucherForReceipt.chequeNo || ""}</strong>
                  </div>
                  <div className="dbs-voucher-date-box">
                    <span>Date : </span>
                    <strong>
                      {selectedVoucherForReceipt.chequeClearanceDate ||
                        selectedVoucherForReceipt.paymentDate ||
                        ""}
                    </strong>
                  </div>
                  <div className="dbs-voucher-payee-sign">
                    Signature of Payee
                  </div>
                </div>
              </div>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
