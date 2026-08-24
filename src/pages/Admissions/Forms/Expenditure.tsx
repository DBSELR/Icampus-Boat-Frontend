import React, { useMemo, useState } from "react";
import { Save, X, Wallet, AlertCircle, Search, Printer, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import "./Expenditure.css";
import {
  getExpenditureStudentDetails,
  saveExpenditure,
  getExpenditurePrintData,
} from "../../../apis/AdmissionsApis";

// =====================================================
// TYPES
// =====================================================

interface StudentInfo {
  regNo: string;
  studentName: string;
  course: string;
  branch: string;
  academicYear: string;
}

interface ExpenditureRow {
  id: string | number;
  sno: number;
  year: string | number;
  headName: string;
  amount: string;
  selected: boolean;
  isActive: boolean;
}

const INITIAL_STUDENT: StudentInfo = {
  regNo: "",
  studentName: "",
  course: "",
  branch: "",
  academicYear: "",
};

// =====================================================
// NUMBER TO WORDS & HELPER FUNCTIONS
// =====================================================

function numberToWords(num: number): string {
  if (num === 0) return "ZERO";

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

  function convertChunk(n: number): string {
    let str = "";
    if (n >= 100) {
      str += a[Math.floor(n / 100)] + " HUNDRED ";
      n %= 100;
      if (n > 0) str += "AND ";
    }
    if (n >= 20) {
      str +=
        b[Math.floor(n / 20)] + (n % 20 !== 0 ? "-" + a[n % 20] : "") + " ";
    } else if (n > 0) {
      str += a[n] + " ";
    }
    return str.trim();
  }

  let result = "";

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  if (crore > 0) {
    result += convertChunk(crore) + " CRORE ";
  }

  const lakh = Math.floor(num / 100000);
  num %= 100000;
  if (lakh > 0) {
    result += convertChunk(lakh) + " LAKH ";
  }

  const thousand = Math.floor(num / 1000);
  num %= 1000;
  if (thousand > 0) {
    result += convertChunk(thousand) + " THOUSAND ";
  }

  const hundred = num;
  if (hundred > 0) {
    result += convertChunk(hundred);
  }

  return result.trim().replace(/\s+/g, " ");
}

function getRomanYear(year: number | string | undefined | null): string {
  if (!year && year !== 0) return "I";
  const str = String(year).trim().toLowerCase();
  if (str === "1" || str === "1st" || str === "first" || str === "i") return "I";
  if (str === "2" || str === "2nd" || str === "second" || str === "ii") return "II";
  if (str === "3" || str === "3rd" || str === "third" || str === "iii") return "III";
  if (str === "4" || str === "4th" || str === "fourth" || str === "iv") return "IV";
  const num = parseInt(str, 10);
  if (num === 1) return "I";
  if (num === 2) return "II";
  if (num === 3) return "III";
  if (num === 4) return "IV";
  return "I";
}

function getTotalCourseYears(course: string): string {
  const c = course.toUpperCase();
  if (
    c.includes("B.TECH") ||
    c.includes("BTECH") ||
    c.includes("B.PHARM") ||
    c.includes("01")
  ) {
    return "IV";
  }
  if (
    c.includes("M.TECH") ||
    c.includes("MTECH") ||
    c.includes("MBA") ||
    c.includes("MCA") ||
    c.includes("02") ||
    c.includes("03")
  ) {
    return "II";
  }
  if (c.includes("DIPLOMA") || c.includes("POLYTECHNIC")) {
    return "III";
  }
  return "IV";
}

// Generates the Printable Certificate HTML matching the PDF specification
function generateCertificateHtml(printData: any[]): string {
  if (!printData || printData.length === 0) return "";

  const first = printData[0];
  const candidateName = (
    first.SName1 ||
    first.SNAME ||
    first.StudentName ||
    first.studentName ||
    ""
  ).toUpperCase();
  const parentName = (
    first.FNAME ||
    first.FatherName ||
    first.parentName ||
    first.fname ||
    ""
  ).toUpperCase();
  const branchName = (
    first.BranchName ||
    first.BRANCHNAME ||
    first.branchName ||
    first.Course ||
    ""
  ).toUpperCase();
  const degree = (first.Course || "B.Tech").toUpperCase();
  const totalCourseYears = getTotalCourseYears(degree || first.CourseCode1 || "");
  const yearOfStudy = `I/${totalCourseYears} ${degree}`;

  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;

  // Collect unique expenditure heads in order of appearance
  const uniqueHeads: string[] = [];
  const headAmounts: Record<string, number> = {};
  let totalAmount = 0;

  printData.forEach((item) => {
    const head = (item.ExpenditureHeads || item.expenditureHeads || "").trim();
    const amt = Number(item.Amount || item.amount || 0);
    totalAmount += amt;

    if (head) {
      if (!uniqueHeads.includes(head)) {
        uniqueHeads.push(head);
      }
      headAmounts[head] = (headAmounts[head] || 0) + amt;
    }
  });

  const amountInWords = numberToWords(totalAmount);
  const formattedTotal = totalAmount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const origin = window.location.origin;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Expenditure Certificate - ${candidateName || "Student"}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 20mm;
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
      margin: 0;
      padding: 30px 40px;
      color: #000000;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      font-size: 13.5px;
      line-height: 1.6;
    }
    .cert-container {
      max-width: 820px;
      margin: 0 auto;
      min-height: 980px;
      position: relative;
    }
    .cert-header {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      margin-bottom: 25px;
      padding-bottom: 10px;
    }
    .cert-logo {
      position: absolute;
      left: 0;
      top: 0;
      width: 62px;
      height: 62px;
      object-fit: contain;
    }
    .cert-header-text {
      text-align: center;
      padding: 0 70px;
    }
    .college-name {
      font-size: 15.5px;
      font-weight: 700;
      letter-spacing: 0.3px;
      margin: 0;
      text-transform: uppercase;
      color: #000000;
    }
    .college-address {
      font-size: 11.5px;
      font-weight: 600;
      margin-top: 4px;
      letter-spacing: 0.2px;
      color: #000000;
    }
    .cert-date-row {
      text-align: right;
      font-size: 13px;
      margin-bottom: 25px;
      margin-top: 15px;
      color: #000000;
    }
    .student-info-table {
      width: 100%;
      margin-bottom: 25px;
      border-collapse: collapse;
    }
    .student-info-table td {
      padding: 5px 0;
      font-size: 13px;
      vertical-align: top;
      color: #000000;
    }
    .student-info-table td.label-col {
      width: 320px;
      font-weight: normal;
      letter-spacing: 0.3px;
      text-transform: uppercase;
    }
    .student-info-table td.colon-col {
      width: 25px;
      text-align: center;
      font-weight: normal;
    }
    .student-info-table td.value-col {
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .expenditure-heading {
      font-size: 13px;
      font-weight: bold;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      color: #000000;
    }
    .expenditure-table {
      border-collapse: collapse;
      margin-bottom: 35px;
      min-width: 55%;
    }
    .expenditure-table th, .expenditure-table td {
      border: 1px solid #000000;
      padding: 8px 12px;
      font-size: 12px;
      text-align: center;
      color: #000000;
    }
    .expenditure-table th {
      font-weight: 600;
      vertical-align: middle;
      line-height: 1.3;
    }
    .expenditure-table td.particulars-cell {
      font-weight: 500;
      white-space: nowrap;
    }
    .disclaimer-text {
      font-size: 13px;
      line-height: 1.8;
      text-align: justify;
      margin-bottom: 60px;
      color: #000000;
    }
    .disclaimer-amount-bold {
      font-weight: 600;
    }
    .principal-signature {
      text-align: right;
      font-weight: 700;
      font-size: 13.5px;
      letter-spacing: 1px;
      margin-top: 90px;
      padding-right: 20px;
      color: #000000;
    }
    .no-print-bar {
      position: fixed;
      top: 15px;
      right: 25px;
      display: flex;
      gap: 10px;
      z-index: 1000;
    }
    .no-print-btn {
      background: #0d9488;
      color: #ffffff;
      padding: 9px 18px;
      border-radius: 6px;
      cursor: pointer;
      font-family: sans-serif;
      font-size: 13px;
      font-weight: bold;
      border: none;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background-color 0.2s ease;
    }
    .no-print-btn:hover {
      background: #0f766e;
    }
    @media print {
      .no-print-bar {
        display: none !important;
      }
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <button class="no-print-btn" onclick="window.print()">
      🖨️ Print Certificate
    </button>
  </div>

  <div class="cert-container">
    <!-- Header -->
    <div class="cert-header">
      <img src="${origin}/images/dbs-logo-short.png" alt="Logo" class="cert-logo" onerror="this.src='${origin}/favicon.png'" />
      <div class="cert-header-text">
        <div class="college-name">LAKIREDDY BALI REDDY COLLEGE OF ENGINEERING (AUTONOMOUS)</div>
        <div class="college-address">L.B.REDDY NAGAR, MYLAVARAM, NTR DIST. -521 230 TEL.NO.08659-222933/34</div>
      </div>
    </div>

    <!-- Date -->
    <div class="cert-date-row">
      <span style="font-weight: normal;">DATE :</span> <span style="font-weight: bold;">${formattedDate}</span>
    </div>

    <!-- Student Information -->
    <table class="student-info-table">
      <tr>
        <td class="label-col">NAME OF THE CANDIDATE</td>
        <td class="colon-col">:</td>
        <td class="value-col">${candidateName}</td>
      </tr>
      <tr>
        <td class="label-col">NAME OF THE PARENT / GUARDIAN</td>
        <td class="colon-col">:</td>
        <td class="value-col">${parentName}</td>
      </tr>
      <tr>
        <td class="label-col">COURSE OF STUDY</td>
        <td class="colon-col">:</td>
        <td class="value-col">${branchName}</td>
      </tr>
      <tr>
        <td class="label-col">YEAR OF STUDY</td>
        <td class="colon-col">:</td>
        <td class="value-col">${yearOfStudy}</td>
      </tr>
    </table>

    <!-- Table Header -->
    <div class="expenditure-heading">
      APPROXIMATE EXPENDITURE DETAILS :
    </div>

    <!-- Expenditure Table -->
    <table class="expenditure-table">
      <thead>
        <tr>
          <th>Particulars</th>
          ${uniqueHeads
            .map((head) => `<th>${head.replace(/ /g, "<br/>")}</th>`)
            .join("")}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="particulars-cell">I / ${totalCourseYears}</td>
          ${uniqueHeads
            .map((head) => {
              const amt = headAmounts[head] || 0;
              return `<td>${amt > 0 ? amt.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"}</td>`;
            })
            .join("")}
        </tr>
      </tbody>
    </table>

    <!-- Disclaimer / Description -->
    <div class="disclaimer-text">
      <span class="disclaimer-amount-bold">Rs.${formattedTotal} /- (RUPEES ${amountInWords} ONLY).</span> This certificate is issued at his / her request to enable him / her to apply for financial assistance from Bank as loan. This institution will not take any responsibility either for disbursements of the money or of the repayment of BANK LOAN by the student.
    </div>

    <!-- Principal Signature -->
    <div class="principal-signature">
      PRINCIPAL
    </div>
  </div>
</body>
</html>`;
}

// =====================================================
// COMPONENT
// =====================================================

const Expenditure = () => {
  // ===================================================
  // STATES
  // ===================================================

  const [searchRegNo, setSearchRegNo] = useState<string>("");
  const [student, setStudent] = useState<StudentInfo>(INITIAL_STUDENT);
  const [rows, setRows] = useState<ExpenditureRow[]>([]);
  const [searching, setSearching] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [printing, setPrinting] = useState<boolean>(false);
  const [lastPrintData, setLastPrintData] = useState<any[] | null>(null);

  // ===================================================
  // DERIVED VALUES
  // ===================================================

  const allSelected = rows.length > 0 && rows.every((row) => row.selected);
  const someSelected = rows.some((row) => row.selected) && !allSelected;
  const selectedCount = rows.filter((row) => row.selected).length;

  const totalFee = useMemo(
    () =>
      rows
        .filter((row) => row.selected)
        .reduce((sum, row) => sum + (Number(row.amount) || 0), 0),
    [rows],
  );

  // ===================================================
  // SEARCH STUDENT DETAILS
  // ===================================================

  const handleSearchStudent = async () => {
    const query = searchRegNo.trim();
    if (!query) {
      toast.warning("Please enter a Registration Number");
      return;
    }

    setSearching(true);
    try {
      const res = await getExpenditureStudentDetails(query);
      console.log("GET /api/Expenditure/student-details Response:", res);

      if (res && (res.success || res.student || res.expHeadsList)) {
        const studentData = res.student || res.data || res;

        const studentObj: StudentInfo = {
          regNo: query,
          studentName: String(
            studentData.studentName ||
              studentData.sName ||
              studentData.name ||
              studentData.SNAME ||
              "",
          ).trim(),
          course: String(
            studentData.course ||
              studentData.courseName ||
              studentData.programme ||
              studentData.COURSE ||
              "",
          ).trim(),
          branch: String(
            studentData.branch ||
              studentData.branchName ||
              studentData.BRANCH ||
              studentData.BRANCHNAME ||
              "",
          ).trim(),
          academicYear: String(
            studentData.academicYear ||
              studentData.acadamicYear ||
              studentData.ACADAMICYEAR ||
              localStorage.getItem("academicYear") ||
              "2026-2027",
          ).trim(),
        };

        setStudent(studentObj);

        // Populate table from expHeadsList
        const headsList =
          res.expHeadsList ||
          studentData.expHeadsList ||
          res.heads ||
          studentData.heads ||
          [];

        if (Array.isArray(headsList) && headsList.length > 0) {
          const mappedRows: ExpenditureRow[] = headsList.map(
            (item: any, index: number) => ({
              id: item.ID || item.id || String(index + 1),
              sno: index + 1,
              year: item.YEAR || item.year || 1,
              headName: String(
                item.EXPENDITUREHEADS ||
                  item.expenditureHeads ||
                  item.headName ||
                  item.head ||
                  "",
              ),
              amount: String(item.AMOUNT ?? item.amount ?? "0"),
              selected: Boolean(item.ISACTIVE ?? item.isActive ?? false),
              isActive: Boolean(item.ISACTIVE ?? item.isActive ?? false),
            }),
          );
          setRows(mappedRows);
        } else {
          setRows([]);
        }

        toast.success(
          res.message ||
            `Student details and expenditure heads loaded for ${studentObj.studentName || query}`,
        );
      } else {
        toast.error(res?.message || "Student details not found.");
      }
    } catch (error: any) {
      console.error("Error loading student expenditure details:", error);
      toast.error(
        error?.response?.data?.message ||
          "Student details not found. Please check the Registration Number.",
      );
    } finally {
      setSearching(false);
    }
  };

  // ===================================================
  // SELECT ALL
  // ===================================================

  const handleSelectAll = (checked: boolean) => {
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        selected: checked,
      })),
    );
  };

  // ===================================================
  // ROW SELECT (One or multiple checkboxes)
  // ===================================================

  const handleRowSelect = (id: string | number, checked: boolean) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              selected: checked,
            }
          : row,
      ),
    );
  };

  // ===================================================
  // AMOUNT CHANGE
  // ===================================================

  const handleAmountChange = (id: string | number, value: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              amount: String(value),
            }
          : row,
      ),
    );
  };

  // ===================================================
  // OPEN PRINT CERTIFICATE IN NEW TAB
  // ===================================================

  const handlePrintCertificate = async (
    customRegNo?: string,
    customAcadYear?: string,
  ) => {
    const regNo = customRegNo || student.regNo || searchRegNo.trim();
    const academicYear =
      customAcadYear ||
      student.academicYear ||
      localStorage.getItem("academicYear") ||
      "2026-2027";

    if (!regNo) {
      toast.warning("Please enter Registration Number to generate certificate.");
      return;
    }

    setPrinting(true);
    try {
      const printRes = await getExpenditurePrintData(regNo, academicYear);
      console.log("GET /api/Expenditure/print-data Response:", printRes);

      const printArray = printRes?.data || (Array.isArray(printRes) ? printRes : []);

      if (printArray && printArray.length > 0) {
        setLastPrintData(printArray);
        const html = generateCertificateHtml(printArray);

        // Open in a new tab
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.open();
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
        } else {
          toast.warning(
            "Popup was blocked by the browser. Please allow popups to view the certificate.",
          );
        }
      } else {
        toast.error("No print records found for this student and academic year.");
      }
    } catch (error: any) {
      console.error("Print Data Error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load print certificate data.",
      );
    } finally {
      setPrinting(false);
    }
  };

  // ===================================================
  // CANCEL
  // ===================================================

  const handleCancel = () => {
    setSearchRegNo("");
    setStudent(INITIAL_STUDENT);
    setRows([]);
    setLastPrintData(null);
    toast.info("Expenditure details reset.");
  };

  // ===================================================
  // SAVE
  // ===================================================

  const handleSave = async () => {
    if (!student.regNo) {
      toast.error("Please search and select a student first.");
      return;
    }

    const selectedRows = rows.filter((row) => row.selected);

    if (selectedRows.length === 0) {
      toast.error("Please select at least one expenditure head");
      return;
    }

    // Validate selected amounts
    const invalidAmount = selectedRows.some(
      (row) => row.amount === "" || Number(row.amount) < 0,
    );

    if (invalidAmount) {
      toast.error("Selected expenditure amount must be 0 or greater");
      return;
    }

    try {
      setSaving(true);

      const courseCode = student.course.includes("-")
        ? student.course.split("-")[0].trim()
        : student.course.trim();

      const academicYear =
        student.academicYear ||
        localStorage.getItem("academicYear") ||
        "2026-2027";

      const payload = {
        regNo: String(student.regNo).trim(),
        studentName: String(student.studentName).trim(),
        course: String(courseCode || "01").trim(),
        academicYear: String(academicYear).trim(),
        heads: selectedRows.map((row) => ({
          year: String(row.year || "1").trim(),
          expenditureHeads: String(row.headName || "").trim(),
          amount: String(row.amount || "0").trim(),
          isActive: true,
        })),
      };

      console.log("POST /api/Expenditure/save Payload:", payload);

      const res = await saveExpenditure(payload);

      toast.success(
        res?.message ||
          `Data saved successfully (${res?.savedCount || selectedRows.length} heads)`,
      );

      // Automatically fetch print-data and open certificate in a new tab
      await handlePrintCertificate(student.regNo, academicYear);
    } catch (error: any) {
      console.error("Save Expenditure Error:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to save expenditure certificate details.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="dbs-expenditure-container">
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="dbs-expenditure-page-header">
        <div>
          <h2>Expenditure Certificate</h2>

          <p className="dbs-expenditure-subtitle">
            Search student, select expenditure heads, save, and print certificate
          </p>
        </div>

        {student.regNo && (
          <button
            type="button"
            className="dbs-expenditure-print-btn"
            onClick={() => handlePrintCertificate()}
            disabled={printing || saving}
            title="Open Certificate in New Tab"
          >
            <Printer size={16} />
            <span>{printing ? "Generating..." : "Print Certificate"}</span>
          </button>
        )}
      </div>

      {/* =================================================
          STUDENT DETAILS CARD
      ================================================= */}

      <div className="dbs-expenditure-student-card">
        <div className="dbs-expenditure-section-title">
          <div className="dbs-expenditure-section-icon">
            <Wallet size={18} />
          </div>

          <div>
            <h3>Student Details</h3>

            <p>Student information for the expenditure certificate</p>
          </div>
        </div>

        <div className="dbs-expenditure-info-grid">
          {/* REG NO SEARCH */}

          <div className="dbs-expenditure-input">
            <label>Reg. No *</label>

            <div className="dbs-expenditure-search-wrapper">
              <input
                type="text"
                placeholder="Enter Registration No (e.g. 24761A0501)"
                value={searchRegNo}
                onChange={(e) => setSearchRegNo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearchStudent();
                }}
              />
              <button
                type="button"
                className="dbs-expenditure-search-btn"
                onClick={handleSearchStudent}
                disabled={searching}
              >
                <Search
                  size={16}
                  className={searching ? "dbs-spin" : ""}
                />
                <span>{searching ? "Searching..." : "Search"}</span>
              </button>
            </div>
          </div>

          {/* STUDENT NAME */}

          <div className="dbs-expenditure-input">
            <label>Student Name</label>

            <input
              type="text"
              value={student.studentName}
              placeholder="Student Name"
              readOnly
            />
          </div>

          {/* COURSE */}

          <div className="dbs-expenditure-input">
            <label>Course</label>

            <input
              type="text"
              value={student.course}
              placeholder="Course"
              readOnly
            />
          </div>

          {/* BRANCH */}

          <div className="dbs-expenditure-input">
            <label>Branch</label>

            <input
              type="text"
              value={student.branch}
              placeholder="Branch"
              readOnly
            />
          </div>
        </div>

        {/* =================================================
            FOOTER / ACTIONS
        ================================================= */}

        <div className="dbs-expenditure-footer">
          <div className="dbs-expenditure-actions">
            <button
              type="button"
              className="dbs-expenditure-cancel-btn"
              onClick={handleCancel}
              disabled={saving || searching}
            >
              <X size={16} />
              Cancel
            </button>

            <button
              type="button"
              className="dbs-expenditure-save-btn"
              onClick={handleSave}
              disabled={saving || searching || rows.length === 0}
            >
              <Save size={16} />

              {saving ? "Saving..." : "Save"}
            </button>
          </div>

          <div className="dbs-expenditure-total">
            <div className="dbs-expenditure-total-label">Total Fee</div>

            <div className="dbs-expenditure-total-value">
              ₹ {totalFee.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          EXPENDITURE HEADER
      ================================================= */}

      <div className="dbs-expenditure-table-header">
        <div>
          <h2>Expenditure Details</h2>

          <p className="dbs-expenditure-subtitle">
            Select the applicable expenditure heads and verify the amounts
          </p>
        </div>

        <div className="dbs-expenditure-selection-count">
          {selectedCount} Selected
        </div>
      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="dbs-expenditure-table-container">
        {rows.length === 0 ? (
          <div className="dbs-expenditure-empty-state">
            <AlertCircle className="dbs-expenditure-empty-icon" />

            <div className="dbs-expenditure-empty-title">
              No expenditure heads found
            </div>

            <div className="dbs-expenditure-empty-desc">
              {student.regNo
                ? "No expenditure heads are available for this student."
                : "Search for a student using their Registration Number above to load expenditure heads."}
            </div>
          </div>
        ) : (
          <div className="dbs-expenditure-table-card">
            <div className="dbs-expenditure-table-scroll">
              <table className="dbs-expenditure-data-table">
                <thead>
                  <tr>
                    <th>SL.NO</th>

                    <th>YEAR</th>

                    <th>EXPENDITURE HEAD</th>

                    <th>AMOUNT</th>

                    <th>
                      <label className="dbs-expenditure-select-all">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={(el) => {
                            if (el) {
                              el.indeterminate = someSelected;
                            }
                          }}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />

                        <span>Select All</span>
                      </label>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className={
                        row.selected ? "dbs-expenditure-selected-row" : ""
                      }
                    >
                      {/* SL NO */}

                      <td>{row.sno}</td>

                      {/* YEAR */}

                      <td>{row.year}</td>

                      {/* HEAD */}

                      <td className="dbs-expenditure-head-cell">
                        {row.headName}
                      </td>

                      {/* AMOUNT */}

                      <td className="dbs-expenditure-amount-column">
                        <div className="dbs-expenditure-amount-wrapper">
                          <span>₹</span>

                          <input
                            type="number"
                            className="dbs-expenditure-amount-input"
                            value={row.amount}
                            min="0"
                            onChange={(e) =>
                              handleAmountChange(row.id, e.target.value)
                            }
                          />
                        </div>
                      </td>

                      {/* CHECKBOX (Select one or more than one at a time) */}

                      <td className="dbs-expenditure-check-cell">
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={(e) =>
                            handleRowSelect(row.id, e.target.checked)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenditure;
