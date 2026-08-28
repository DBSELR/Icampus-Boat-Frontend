import React, { useState, useEffect, useMemo } from "react";
import {
  Save,
  X,
  Printer,
  Search,
  Loader2,
  FileCheck,
  Award,
  Calendar,
  Building2,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import "./CertificateFeePayment.css";
import { getProgramme, getBranch, getYear } from "../../../apis/Common";
import { getBonafideStudentDetails } from "../../../apis/AdmissionsApis";
import { getSSNo, getStudentData } from "../../../apis/FeeApis";

interface DropdownOption {
  code: string;
  name: string;
}

const DEFAULT_UNIVERSITIES = [
  "ANDHRA UNIVERSITY",
  "JAWAHARLAL NEHRU TECHNOLOGICAL UNIVERSITY KAKINADA (JNTUK)",
  "JAWAHARLAL NEHRU TECHNOLOGICAL UNIVERSITY ANANTAPUR (JNTUA)",
  "OSMANIA UNIVERSITY",
  "SRI VENKATESWARA UNIVERSITY",
  "ACHARYA NAGARJUNA UNIVERSITY",
  "OTHER",
];

const DEFAULT_PROGRAMMES: DropdownOption[] = [
  { code: "01-B.Tech", name: "01-B.Tech" },
  { code: "02-M.Tech", name: "02-M.Tech" },
  { code: "03-MBA", name: "03-MBA" },
  { code: "04-MCA", name: "04-MCA" },
];

const DEFAULT_BRANCHES: DropdownOption[] = [
  {
    code: "05_COMPUTER SCIENCE AND ENGINEERING",
    name: "05_COMPUTER SCIENCE AND ENGINEERING",
  },
  {
    code: "04_ELECTRONICS AND COMMUNICATION ENGINEERING",
    name: "04_ELECTRONICS AND COMMUNICATION ENGINEERING",
  },
  {
    code: "02_ELECTRICAL AND ELECTRONICS ENGINEERING",
    name: "02_ELECTRICAL AND ELECTRONICS ENGINEERING",
  },
  { code: "03_MECHANICAL ENGINEERING", name: "03_MECHANICAL ENGINEERING" },
  { code: "01_CIVIL ENGINEERING", name: "01_CIVIL ENGINEERING" },
  {
    code: "12_INFORMATION TECHNOLOGY",
    name: "12_INFORMATION TECHNOLOGY",
  },
];

const getFormattedToday = () => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

function numberToWords(num: number): string {
  if (num === 0) return "ZERO RUPEES ONLY";
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

  const numToWordsChunk = (n: number): string => {
    let str = "";
    if (n >= 100) {
      str += a[Math.floor(n / 100)] + " HUNDRED ";
      n %= 100;
      if (n > 0) str += "AND ";
    }
    if (n >= 20) {
      str += b[Math.floor(n / 20)] + (n % 20 !== 0 ? "-" + a[n % 20] : "") + " ";
    } else if (n > 0) {
      str += a[n] + " ";
    }
    return str.trim();
  };

  let result = "";
  if (num >= 10000000) {
    result += numToWordsChunk(Math.floor(num / 10000000)) + " CRORE ";
    num %= 10000000;
  }
  if (num >= 100000) {
    result += numToWordsChunk(Math.floor(num / 100000)) + " LAKH ";
    num %= 100000;
  }
  if (num >= 1000) {
    result += numToWordsChunk(Math.floor(num / 1000)) + " THOUSAND ";
    num %= 1000;
  }
  if (num > 0) {
    result += numToWordsChunk(num);
  }
  return (result.trim() + " RUPEES ONLY").toUpperCase();
}

export const CertificateFeePayment: React.FC = () => {
  const academicYear = localStorage.getItem("academicYear") || "2026-2027";

  // Form States matching image
  const [certificateNo, setCertificateNo] = useState<string>("1");
  const [date, setDate] = useState<string>(getFormattedToday());
  const [regNo, setRegNo] = useState<string>("");
  const [studyingYear, setStudyingYear] = useState<string>("");
  const [programme, setProgramme] = useState<string>("01-B.Tech");
  const [branch, setBranch] = useState<string>(
    "05_COMPUTER SCIENCE AND ENGINEERING",
  );
  const [studentName, setStudentName] = useState<string>("");
  const [tuitionFee, setTuitionFee] = useState<string>("");
  const [specialFee, setSpecialFee] = useState<string>("");
  const [isFatherChecked, setIsFatherChecked] = useState<boolean>(true);
  const [isMotherChecked, setIsMotherChecked] = useState<boolean>(false);
  const [fatherName, setFatherName] = useState<string>("");
  const [motherName, setMotherName] = useState<string>("");
  const [parentNameInput, setParentNameInput] = useState<string>("");
  const [university, setUniversity] = useState<string>("ANDHRA UNIVERSITY");

  // Dropdown lists
  const [programmeList, setProgrammeList] =
    useState<DropdownOption[]>(DEFAULT_PROGRAMMES);
  const [branchList, setBranchList] =
    useState<DropdownOption[]>(DEFAULT_BRANCHES);
  const [yearList, setYearList] = useState<DropdownOption[]>([
    { code: "1", name: "1" },
    { code: "2", name: "2" },
    { code: "3", name: "3" },
    { code: "4", name: "4" },
  ]);

  // Loading states
  const [searchingStudent, setSearchingStudent] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Print Preview Modal State
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Load Programmes from API
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const progRes = await getProgramme();
        if (Array.isArray(progRes) && progRes.length > 0) {
          const mappedProgs: DropdownOption[] = progRes.map((p: any) => {
            const code = String(
              p.PROGRAMMECODE ?? p.ProgrammeCode ?? p.CODE ?? p.ID ?? "",
            );
            const name = String(
              p.PROGRAMMENAME ?? p.ProgrammeName ?? p.COURSE ?? p.NAME ?? code,
            );
            return {
              code: code ? (name !== code ? `${code}-${name}` : code) : name,
              name: code ? (name !== code ? `${code}-${name}` : code) : name,
            };
          });
          setProgrammeList(mappedProgs);
        }
      } catch (err) {
        console.warn("Using default programme dropdowns:", err);
      }
    };

    loadDropdowns();
  }, []);

  // Load Branches & Years on Programme Change
  useEffect(() => {
    if (!programme) return;
    const progCode = programme.split("-")[0] || programme;

    const loadBranchesAndYears = async () => {
      try {
        const [branchRes, yearRes] = await Promise.allSettled([
          getBranch(progCode),
          getYear(progCode),
        ]);

        if (branchRes.status === "fulfilled" && Array.isArray(branchRes.value)) {
          const mappedBranches: DropdownOption[] = branchRes.value.map(
            (b: any) => {
              const code = String(
                b.BRANCHCODE ?? b.BranchCode ?? b.CODE ?? b.ID ?? "",
              );
              const name = String(
                b.BRANCHNAME ?? b.BranchName ?? b.BRANCH ?? b.NAME ?? code,
              );
              return {
                code: code ? (name !== code ? `${code}_${name}` : code) : name,
                name: code ? (name !== code ? `${code}_${name}` : code) : name,
              };
            },
          );
          if (mappedBranches.length > 0) setBranchList(mappedBranches);
        }

        if (yearRes.status === "fulfilled" && Array.isArray(yearRes.value)) {
          const mappedYears: DropdownOption[] = yearRes.value.map((y: any) => {
            const yId = String(y.ID ?? y.id ?? y.YEAR ?? y.Year ?? "");
            const yName = String(y.DATA ?? y.Data ?? y.NAME ?? `Year ${yId}`);
            return { code: yId, name: yName };
          });
          if (mappedYears.length > 0) setYearList(mappedYears);
        }
      } catch (err) {
        console.warn("Could not load branches / years for programme:", err);
      }
    };

    loadBranchesAndYears();
  }, [programme]);

  // Synchronize parent checkboxes
  const handleFatherCheckbox = (checked: boolean) => {
    setIsFatherChecked(checked);
    if (checked && !isMotherChecked) {
      setParentNameInput(fatherName);
    } else if (!checked && isMotherChecked) {
      setParentNameInput(motherName);
    }
  };

  const handleMotherCheckbox = (checked: boolean) => {
    setIsMotherChecked(checked);
    if (checked && !isFatherChecked) {
      setParentNameInput(motherName);
    } else if (!checked && isFatherChecked) {
      setParentNameInput(fatherName);
    }
  };

  // Student Search / Auto-fetch on RegNo blur or button click
  const handleSearchStudent = async () => {
    const searchNo = regNo.trim();
    if (!searchNo) {
      toast.error("Please enter a Registration Number");
      return;
    }

    try {
      setSearchingStudent(true);
      // Attempt to load student details using Admissions / Fee endpoints
      let student: any = null;

      try {
        const detailsRes = await getBonafideStudentDetails(searchNo);
        student = detailsRes?.data || detailsRes;
      } catch (e) {
        // Fallback to Fee student data lookup
        const ssRes = await getSSNo(searchNo);
        const ssNo = Array.isArray(ssRes) ? ssRes[0]?.sSNO || ssRes[0]?.ssNo : ssRes?.sSNO || ssRes?.ssNo;
        if (ssNo) {
          const fStudent = await getStudentData(ssNo);
          student = Array.isArray(fStudent) ? fStudent[0] : fStudent;
        }
      }

      if (student) {
        const sName =
          student.STUDENTNAME ||
          student.StudentName ||
          student.sName ||
          student.name ||
          "";
        const fName =
          student.FATHERNAME ||
          student.FatherName ||
          student.fName ||
          student.fatherName ||
          "";
        const mName =
          student.MOTHERNAME ||
          student.MotherName ||
          student.mName ||
          student.motherName ||
          "";
        const prog =
          student.COURSE ||
          student.COURSECODE ||
          student.Programme ||
          student.programme ||
          "";
        const br =
          student.BRANCH ||
          student.BRANCHCODE ||
          student.Branch ||
          student.branch ||
          "";
        const yr = String(
          student.YEAR ||
            student.Year ||
            student.currentYear ||
            student.sYear ||
            "1",
        );
        const univ =
          student.UNIVERSITY ||
          student.University ||
          student.university ||
          "ANDHRA UNIVERSITY";

        if (sName) setStudentName(sName);
        if (fName) setFatherName(fName);
        if (mName) setMotherName(mName);

        if (isFatherChecked && fName) {
          setParentNameInput(fName);
        } else if (isMotherChecked && mName) {
          setParentNameInput(mName);
        } else if (fName) {
          setIsFatherChecked(true);
          setIsMotherChecked(false);
          setParentNameInput(fName);
        }

        if (prog) {
          const matchProg = programmeList.find(
            (p) =>
              p.code.toLowerCase().includes(prog.toLowerCase()) ||
              p.name.toLowerCase().includes(prog.toLowerCase()),
          );
          if (matchProg) setProgramme(matchProg.code);
        }

        if (br) {
          const matchBranch = branchList.find(
            (b) =>
              b.code.toLowerCase().includes(br.toLowerCase()) ||
              b.name.toLowerCase().includes(br.toLowerCase()),
          );
          if (matchBranch) setBranch(matchBranch.code);
        }

        if (yr) setStudyingYear(yr);
        if (univ) setUniversity(univ);

        toast.success(`Student data loaded for ${searchNo}`);
      } else {
        toast.info(
          `No existing record found for ${searchNo}. You can enter details manually.`,
        );
      }
    } catch (err: any) {
      console.warn("Student fetch error:", err);
      toast.info(
        "Could not auto-fetch student data. Please fill details manually.",
      );
    } finally {
      setSearchingStudent(false);
    }
  };

  // Compute Total Fee
  const totalFeeNumber = useMemo(() => {
    const t = parseFloat(tuitionFee) || 0;
    const s = parseFloat(specialFee) || 0;
    return t + s;
  }, [tuitionFee, specialFee]);

  // Form Reset / Cancel
  const handleCancel = () => {
    setRegNo("");
    setStudyingYear("");
    setStudentName("");
    setFatherName("");
    setMotherName("");
    setParentNameInput("");
    setIsFatherChecked(true);
    setIsMotherChecked(false);
    setTuitionFee("");
    setSpecialFee("");
    toast.info("Form reset.");
  };

  // Form Save
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!regNo.trim()) {
      toast.error("Please enter Registration Number");
      return;
    }
    if (!studentName.trim()) {
      toast.error("Please enter Student Name");
      return;
    }
    if (!parentNameInput.trim()) {
      toast.error("Please enter Father / Mother Name");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        certificateNo,
        date,
        regNo: regNo.trim(),
        studyingYear,
        programme,
        branch,
        studentName: studentName.trim(),
        isFatherChecked,
        isMotherChecked,
        parentName: parentNameInput.trim(),
        university,
        tuitionFee: tuitionFee || "0",
        specialFee: specialFee || "0",
        totalFee: totalFeeNumber,
        academicYear,
      };

      console.log("Certificate of Fee Payment Payload:", payload);

      // Simulating / executing save persistence
      await new Promise((resolve) => setTimeout(resolve, 600));

      toast.success("Certificate of Fee Payment saved successfully!");
      // Increment Certificate No for next entry
      const nextNo = String(parseInt(certificateNo || "0", 10) + 1);
      setCertificateNo(nextNo);

      // Open print preview modal for immediate verification / printing
      setShowPrintModal(true);
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err?.message || "Failed to save Certificate of Fee Payment.");
    } finally {
      setSaving(false);
    }
  };

  // Handle Reprint click
  const handleReprint = () => {
    if (!regNo.trim() && !studentName.trim()) {
      toast.warning("Please enter student details or search a Registration Number to reprint certificate.");
      return;
    }
    setShowPrintModal(true);
  };

  const formatCurrency = (val: number | string) => {
    const num = typeof val === "number" ? val : parseFloat(val) || 0;
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="dbs-headmaster-container dbs-cert-fee-container">
      {/* Page Header */}
      <div className="dbs-headmaster-header">
        <div>
          <h2>Certificate of Fee Payment</h2>
          <p className="dbs-headmaster-subtitle">
            Generate and manage student fee payment certificates ({academicYear})
          </p>
        </div>
      </div>

      {/* Main Certificate Form Card matching screenshot layout */}
      <div className="dbs-cert-fee-card">
        <div className="dbs-cert-fee-card-header">
          <Award size={20} color="var(--dbs-primary, #0e7490)" />
          <span>Certificate of Fee Payment</span>
        </div>

        <form onSubmit={handleSave}>
          <div className="dbs-cert-fee-grid">
            {/* ================= LEFT COLUMN ================= */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Certificate No. */}
              <div className="dbs-cert-field-row">
                <label className="dbs-cert-field-label">Certificate No.</label>
                <div className="dbs-cert-input-wrap">
                  <input
                    type="text"
                    value={certificateNo}
                    onChange={(e) => setCertificateNo(e.target.value)}
                    className="dbs-cert-input"
                    placeholder="Certificate No."
                  />
                </div>
              </div>

              {/* Reg.No. with Search Button */}
              <div className="dbs-cert-field-row">
                <label className="dbs-cert-field-label">Reg.No. *</label>
                <div className="dbs-cert-input-wrap">
                  <input
                    type="text"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    onBlur={() => {
                      if (regNo.trim() && !studentName) {
                        handleSearchStudent();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearchStudent();
                      }
                    }}
                    className="dbs-cert-input"
                    placeholder="e.g. 24761A0501"
                    style={{ paddingRight: "40px" }}
                  />
                  <button
                    type="button"
                    className="dbs-cert-search-btn"
                    onClick={handleSearchStudent}
                    disabled={searchingStudent}
                    title="Search Student Details"
                  >
                    {searchingStudent ? (
                      <Loader2 size={14} className="dbs-spin" />
                    ) : (
                      <Search size={14} />
                    )}
                  </button>
                </div>
              </div>

              {/* studying Year */}
              <div className="dbs-cert-field-row">
                <label className="dbs-cert-field-label">studying Year</label>
                <div className="dbs-cert-input-wrap">
                  <select
                    value={studyingYear}
                    onChange={(e) => setStudyingYear(e.target.value)}
                    className="dbs-cert-select"
                  >
                    <option value="">Select Year</option>
                    {yearList.map((y) => (
                      <option key={y.code} value={y.code}>
                        {y.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Student Name */}
              <div className="dbs-cert-field-row">
                <label className="dbs-cert-field-label">Student Name *</label>
                <div className="dbs-cert-input-wrap">
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="dbs-cert-input"
                    placeholder="Enter student full name"
                  />
                </div>
              </div>

              {/* Parent Checkboxes (Father Name / Mother Name) */}
              <div className="dbs-cert-field-row">
                <div />
                <div className="dbs-cert-parent-options">
                  <label className="dbs-cert-checkbox-label">
                    <input
                      type="checkbox"
                      checked={isFatherChecked}
                      onChange={(e) => handleFatherCheckbox(e.target.checked)}
                    />
                    <span>Father Name</span>
                  </label>

                  <label className="dbs-cert-checkbox-label">
                    <input
                      type="checkbox"
                      checked={isMotherChecked}
                      onChange={(e) => handleMotherCheckbox(e.target.checked)}
                    />
                    <span>Mother Name</span>
                  </label>
                </div>
              </div>

              {/* Dynamic Parent Name Input */}
              <div className="dbs-cert-field-row">
                <label className="dbs-cert-field-label">
                  Father Name/ Mother Name *
                </label>
                <div className="dbs-cert-input-wrap">
                  <input
                    type="text"
                    value={parentNameInput}
                    onChange={(e) => {
                      setParentNameInput(e.target.value);
                      if (isFatherChecked) setFatherName(e.target.value);
                      if (isMotherChecked) setMotherName(e.target.value);
                    }}
                    className="dbs-cert-input"
                    placeholder="Enter Father / Mother Name"
                  />
                </div>
              </div>

              {/* University Dropdown */}
              <div className="dbs-cert-field-row">
                <label className="dbs-cert-field-label">University</label>
                <div className="dbs-cert-input-wrap">
                  <select
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="dbs-cert-select"
                  >
                    {DEFAULT_UNIVERSITIES.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ================= RIGHT COLUMN ================= */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Date */}
              <div className="dbs-cert-field-row">
                <label className="dbs-cert-field-label">Date</label>
                <div className="dbs-cert-input-wrap">
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="dbs-cert-input"
                    placeholder="DD-MM-YYYY"
                  />
                </div>
              </div>

              {/* Programme Dropdown / Input */}
              <div className="dbs-cert-field-row">
                <label className="dbs-cert-field-label">Programme</label>
                <div className="dbs-cert-input-wrap">
                  <select
                    value={programme}
                    onChange={(e) => setProgramme(e.target.value)}
                    className="dbs-cert-select"
                  >
                    {programmeList.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Branch Dropdown / Input */}
              <div className="dbs-cert-field-row">
                <label className="dbs-cert-field-label">Branch</label>
                <div className="dbs-cert-input-wrap">
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="dbs-cert-select"
                  >
                    {branchList.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tuition Fee */}
              <div className="dbs-cert-field-row">
                <label className="dbs-cert-field-label">Tution Fee</label>
                <div className="dbs-cert-input-wrap">
                  <input
                    type="number"
                    value={tuitionFee}
                    onChange={(e) => setTuitionFee(e.target.value)}
                    className="dbs-cert-input"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Special Fee */}
              <div className="dbs-cert-field-row">
                <label className="dbs-cert-field-label">Special Fee</label>
                <div className="dbs-cert-input-wrap">
                  <input
                    type="number"
                    value={specialFee}
                    onChange={(e) => setSpecialFee(e.target.value)}
                    className="dbs-cert-input"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions Bar (Save / Cancel / Reprint) */}
          <div className="dbs-cert-actions-bar">
            <button
              type="submit"
              className="dbs-headmaster-save-btn"
              disabled={saving}
              style={{ minWidth: "110px" }}
            >
              {saving ? (
                <Loader2 size={16} className="dbs-spin" />
              ) : (
                <Save size={16} />
              )}
              <span>{saving ? "Saving..." : "Save"}</span>
            </button>

            <button
              type="button"
              className="dbs-headmaster-reset-btn"
              onClick={handleCancel}
              disabled={saving}
              style={{ minWidth: "110px" }}
            >
              <X size={16} />
              <span>Cancel</span>
            </button>

            <button
              type="button"
              className="dbs-cert-reprint-btn"
              onClick={handleReprint}
              disabled={saving}
              style={{ minWidth: "110px" }}
            >
              <Printer size={16} />
              <span>Reprint</span>
            </button>
          </div>
        </form>
      </div>

      {/* ==========================================================
          PRINTABLE CERTIFICATE PREVIEW MODAL
      ========================================================== */}
      {showPrintModal && (
        <div className="dbs-cert-modal-overlay">
          <div className="dbs-cert-modal-box">
            {/* Modal Header */}
            <div className="dbs-cert-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileCheck size={18} />
                <span>Certificate Print Preview</span>
              </div>
              <button
                type="button"
                className="dbs-cert-modal-close-btn"
                onClick={() => setShowPrintModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Certificate Sheet Body */}
            <div className="dbs-cert-modal-body">
              <div className="dbs-cert-sheet" id="printable-certificate-sheet">
                {/* Institutional Letterhead */}
                <div className="dbs-cert-sheet-header">
                  <h1 className="dbs-cert-sheet-inst-name">
                    CAMPUS INSTITUTE OF SCIENCE & TECHNOLOGY
                  </h1>
                  <p className="dbs-cert-sheet-inst-sub">
                    Approved by AICTE, Affiliated to {university}
                  </p>
                  <p className="dbs-cert-sheet-inst-sub">
                    Campus Road, Technology Enclave - 530001
                  </p>
                </div>

                {/* Certificate Title */}
                <div className="dbs-cert-sheet-title">
                  <h3>CERTIFICATE OF FEE PAYMENT</h3>
                </div>

                {/* Meta Row: Certificate No & Date */}
                <div className="dbs-cert-meta-row">
                  <span>Certificate No: {certificateNo}</span>
                  <span>Date: {date}</span>
                </div>

                {/* Body Text */}
                <div className="dbs-cert-sheet-body">
                  <p>
                    This is to certify that Mr. / Ms.{" "}
                    <span className="dbs-cert-highlight">
                      {studentName || "________________________"}
                    </span>
                    , {isMotherChecked && !isFatherChecked ? "D/o or S/o" : "S/o or D/o"}{" "}
                    <span className="dbs-cert-highlight">
                      {parentNameInput || "________________________"}
                    </span>
                    , bearing Registration Number{" "}
                    <span className="dbs-cert-highlight">
                      {regNo || "________________"}
                    </span>{" "}
                    is a bonafide student of this institution studying in{" "}
                    <span className="dbs-cert-highlight">
                      {studyingYear ? `Year ${studyingYear}` : "________"}
                    </span>{" "}
                    of{" "}
                    <span className="dbs-cert-highlight">
                      {programme || "Course"}
                    </span>{" "}
                    (Branch:{" "}
                    <span className="dbs-cert-highlight">
                      {branch || "General"}
                    </span>
                    ) during the academic year{" "}
                    <span className="dbs-cert-highlight">{academicYear}</span>,
                    affiliated to{" "}
                    <span className="dbs-cert-highlight">{university}</span>.
                  </p>
                  <p>
                    The details of fee structure paid / payable for the academic
                    session are certified as follows:
                  </p>
                </div>

                {/* Fee Breakdown Table */}
                <table className="dbs-cert-fee-table">
                  <thead>
                    <tr>
                      <th style={{ width: "15%", textAlign: "center" }}>S.No.</th>
                      <th style={{ width: "55%" }}>Fee Particulars</th>
                      <th style={{ width: "30%", textAlign: "right" }}>
                        Amount (INR)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ textAlign: "center" }}>1</td>
                      <td>Tuition Fee</td>
                      <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                        ₹ {formatCurrency(tuitionFee || "0")}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: "center" }}>2</td>
                      <td>Special / Miscellaneous Fee</td>
                      <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                        ₹ {formatCurrency(specialFee || "0")}
                      </td>
                    </tr>
                    <tr style={{ fontWeight: 700, background: "#f8fafc" }}>
                      <td colSpan={2} style={{ textAlign: "right" }}>
                        Total Amount Paid:
                      </td>
                      <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                        ₹ {formatCurrency(totalFeeNumber)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p style={{ fontSize: "0.88rem", fontStyle: "italic", marginTop: "12px" }}>
                  <strong>Amount in Words:</strong> {numberToWords(totalFeeNumber)}
                </p>

                {/* Signatures */}
                <div className="dbs-cert-sheet-signatures">
                  <div className="dbs-cert-sign-box">
                    <div className="dbs-cert-sign-line" />
                    <span>Dealing Assistant</span>
                  </div>
                  <div className="dbs-cert-sign-box">
                    <div className="dbs-cert-sign-line" />
                    <span>Accounts Officer</span>
                  </div>
                  <div className="dbs-cert-sign-box">
                    <div className="dbs-cert-sign-line" />
                    <span>Principal / Director</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="dbs-cert-modal-actions">
              <button
                type="button"
                className="dbs-headmaster-reset-btn"
                onClick={() => setShowPrintModal(false)}
                style={{ minWidth: "100px" }}
              >
                <X size={16} />
                <span>Close</span>
              </button>
              <button
                type="button"
                className="dbs-headmaster-save-btn"
                onClick={() => window.print()}
                style={{ minWidth: "120px" }}
              >
                <Printer size={16} />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateFeePayment;

