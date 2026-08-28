import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Save,
  X,
  ChevronDown,
  Loader2,
  AlertCircle,
  Check,
  Search,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import "./FeeMaster.css";
import { getProgramme, getBranch, getYear } from "../../../apis/Common";
import {
  getFeeMasterList,
  loadAdmMode,
  saveFeeMasterRecord,
} from "../../../apis/FeeApis";

export interface FeeMasterListPayload {
  fMid?: string;
  status?: string;
  academicYear?: string;
  fYear?: string;
  programme?: string;
  year?: string;
  termNo?: string;
  group?: string;
  caste?: string;
  admMode?: string;
  order?: string;
  feeID?: string;
  feeName?: string;
  feeType?: string;
  amount?: number;
  fDate?: string;
  tDate?: string;
  fine?: string;
  id?: string;
  paidYear?: string;
}

export interface SaveFeeMasterPayload {
  fMid?: string;
  status?: string;
  academicYear?: string;
  fYear?: string;
  programme?: string;
  year?: string;
  termNo?: string;
  group?: string;
  caste?: string;
  admMode?: string;
  order?: string;
  feeID?: string;
  feeName?: string;
  feeType?: string;
  amount?: number;
  fDate?: string;
  tDate?: string;
  fine?: string;
  id?: string;
  paidYear?: string;
}

export interface ApiFeeMasterListRecord {
  iD: number;
  fMID?: number;
  fEENAME: string;
  fEETYPE: string;
  oRDER?: number;
  aMOUNT?: number;
  iSACTIVE?: boolean | null;
}

export interface ApiAdmissionModeRecord {
  aDMISSIONMODE?: string;
  admissionMode?: string;
  ADMISSIONMODE?: string;
  name?: string;
}

// Interface for each fee item row in the Fee Master table
export interface FeeMasterItem {
  id: number;
  feeName: string;
  feeType: string;
  amount: string | number;
  selected: boolean;
  order?: number;
  fMid?: number;
}

export interface DropdownOption {
  code: string;
  name: string;
}

// Initial Fee Heads matching reference screenshot & institutional standards
const INITIAL_FEE_ITEMS: FeeMasterItem[] = [
  {
    id: 1,
    feeName: "Students related Special Services",
    feeType: "SRSS",
    amount: "1000.00",
    selected: false,
    order: 1,
  },
  {
    id: 2,
    feeName: "Common Service rendered by the University",
    feeType: "University Common Service Fee (Collected As per AP GO.)",
    amount: "1850.00",
    selected: false,
    order: 2,
  },
  {
    id: 3,
    feeName: "National Board of Accreditation Fee",
    feeType: "NBA",
    amount: "0.00",
    selected: false,
    order: 3,
  },
  {
    id: 4,
    feeName: "College Miss.Fee",
    feeType: "Library, Sports, Others",
    amount: "0.00",
    selected: false,
    order: 4,
  },
  {
    id: 5,
    feeName: "Bus Fee",
    feeType: "Transport",
    amount: "0.00",
    selected: false,
    order: 5,
  },
  {
    id: 6,
    feeName: "Spot Admission Processing Fee",
    feeType: "SAPF",
    amount: "0.00",
    selected: false,
    order: 6,
  },
  {
    id: 7,
    feeName: "Tuition Fee",
    feeType: "Tuition Fee",
    amount: "78600.00",
    selected: true,
    order: 7,
  },
  {
    id: 8,
    feeName: "Hostel Fee",
    feeType: "Hostel Fee",
    amount: "0.00",
    selected: false,
    order: 8,
  },
  {
    id: 9,
    feeName: "Examination Fee",
    feeType: "Exam Fee",
    amount: "0.00",
    selected: false,
    order: 9,
  },
  {
    id: 10,
    feeName: "Building & Development Fund",
    feeType: "Capital Fund",
    amount: "0.00",
    selected: false,
    order: 10,
  },
  {
    id: 11,
    feeName: "Identity Card & Misc Fee",
    feeType: "ID & Misc",
    amount: "0.00",
    selected: false,
    order: 11,
  },
  {
    id: 12,
    feeName: "Training & Placement Fee",
    feeType: "Training / Placement",
    amount: "0.00",
    selected: false,
    order: 12,
  },
];

// Default Branches fallback
const DEFAULT_BRANCHES: DropdownOption[] = [
  { code: "ASE", name: "ASE (Aerospace Engineering)" },
  { code: "AI&DS", name: "AI&DS (Artificial Intelligence & Data Science)" },
  { code: "CIVIL", name: "CIVIL (Civil Engineering)" },
  { code: "CSIT", name: "CSIT (Computer Science & IT)" },
  { code: "CSE", name: "CSE (Computer Science & Engineering)" },
  { code: "CSE(AI & ML)", name: "CSE (AI & ML)" },
  { code: "EEE", name: "EEE (Electrical & Electronics Engineering)" },
  { code: "ECE", name: "ECE (Electronics & Communication Engineering)" },
  { code: "EIE", name: "EIE (Electronics & Instrumentation Engineering)" },
  { code: "IT", name: "IT (Information Technology)" },
  { code: "MECH", name: "MECH (Mechanical Engineering)" },
];

// Default Admission Modes fallback
const DEFAULT_ADMISSION_MODES: DropdownOption[] = [
  { code: "BC-SCHOLAR", name: "BC-SCHOLAR" },
  { code: "BC-SCHOLAR.", name: "BC-SCHOLAR." },
  { code: "BC-SCHOLAR-TS", name: "BC-SCHOLAR-TS" },
  { code: "Cat-B (NON-NRI)", name: "Cat-B (NON-NRI)" },
  { code: "CAT-B NRI", name: "CAT-B NRI" },
  { code: "Cat-B(MANAGEMENT)", name: "Cat-B(MANAGEMENT)" },
  { code: "Cat-B(MANAGEMENT).", name: "Cat-B(MANAGEMENT)." },
  { code: "COMMON_2014-2015", name: "COMMON_2014-2015" },
  { code: "CONVENOR", name: "CONVENOR" },
  { code: "MANAGEMENT", name: "MANAGEMENT" },
  { code: "SPOT", name: "SPOT ADMISSION" },
  { code: "EWS-SCHOLAR", name: "EWS-SCHOLAR" },
  { code: "GOVT-SCHOLAR", name: "GOVT-SCHOLAR" },
  { code: "NRI", name: "NRI QUOTA" },
  { code: "MINORITY", name: "MINORITY SCHOLAR" },
  { code: "SPORTS", name: "SPORTS / SPECIAL QUOTA" },
];

// Default Courses fallback
const DEFAULT_COURSES: DropdownOption[] = [
  { code: "01", name: "B.Tech" },
  { code: "02", name: "M.Tech" },
  { code: "03", name: "MBA" },
  { code: "04", name: "MCA" },
  { code: "05", name: "B.Pharmacy" },
  { code: "06", name: "Diploma" },
];

// Default Years fallback
const DEFAULT_YEARS: DropdownOption[] = [
  { code: "1", name: "I Year" },
  { code: "2", name: "II Year" },
  { code: "3", name: "III Year" },
  { code: "4", name: "IV Year" },
];

// Dedicated Crisp Custom Checkbox Component
const CustomCheckbox: React.FC<{
  checked: boolean;
  onChange?: () => void;
  isHeader?: boolean;
}> = ({ checked, onChange, isHeader }) => (
  <span
    className={`dbs-custom-cb-box ${isHeader ? "dbs-custom-cb-box-header" : ""} ${
      checked ? "checked" : ""
    }`}
    onClick={(e) => {
      e.stopPropagation();
      onChange?.();
    }}
    role="checkbox"
    aria-checked={checked}
  >
    {checked && <Check className="dbs-custom-cb-icon" />}
  </span>
);

export const FeeMaster: React.FC = () => {
  const academicYear = localStorage.getItem("academicYear") || "2025-2026";

  // Form State
  const [course, setCourse] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [termNo, setTermNo] = useState<string>("1");

  // Multi-Select Dropdown States
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] =
    useState<boolean>(false);
  const [branchSearch, setBranchSearch] = useState<string>("");

  const [selectedAdmissionModes, setSelectedAdmissionModes] = useState<
    string[]
  >(["BC-SCHOLAR"]);
  const [isAdmissionModeDropdownOpen, setIsAdmissionModeDropdownOpen] =
    useState<boolean>(false);
  const [admissionModeSearch, setAdmissionModeSearch] = useState<string>("");

  // Lists & Options loaded via APIs
  const [courseList, setCourseList] =
    useState<DropdownOption[]>(DEFAULT_COURSES);
  const [branchList, setBranchList] =
    useState<DropdownOption[]>(DEFAULT_BRANCHES);
  const [yearList, setYearList] = useState<DropdownOption[]>(DEFAULT_YEARS);
  const [admissionModeList, setAdmissionModeList] = useState<DropdownOption[]>(
    DEFAULT_ADMISSION_MODES,
  );

  // Table Data State
  const [feeItems, setFeeItems] = useState<FeeMasterItem[]>(INITIAL_FEE_ITEMS);

  // Loading flags
  const [loadingCourses, setLoadingCourses] = useState<boolean>(false);
  const [loadingBranches, setLoadingBranches] = useState<boolean>(false);
  const [loadingYears, setLoadingYears] = useState<boolean>(false);
  const [loadingAdmissionModes, setLoadingAdmissionModes] =
    useState<boolean>(false);
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Refs for closing popups on click outside
  const branchDropdownRef = useRef<HTMLDivElement>(null);
  const admissionModeDropdownRef = useRef<HTMLDivElement>(null);

  // ==========================================================
  // 1. FETCH COURSES (getProgramme API)
  // ==========================================================
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const response = await getProgramme();
        console.log("Common getProgramme Response:", response);

        if (Array.isArray(response) && response.length > 0) {
          const mappedCourses: DropdownOption[] = response.map((p: any) => {
            const code = String(
              p.COURSECODE ??
                p.COURSE_CODE ??
                p.ID ??
                p.ProgrammeCode ??
                p.programmeCode ??
                p.COURSE ??
                p.name ??
                "",
            );
            const name = String(
              p.COURSE ??
                p.PROGRAMME ??
                p.ProgrammeName ??
                p.COURSENAME ??
                p.NAME ??
                code,
            );
            return { code, name };
          });

          setCourseList(mappedCourses);
          setCourse(mappedCourses[0].code);
        } else {
          setCourseList(DEFAULT_COURSES);
          setCourse(DEFAULT_COURSES[0].code);
        }
      } catch (err) {
        console.warn(
          "Unable to load courses from API, using default fallback:",
          err,
        );
        setCourseList(DEFAULT_COURSES);
        setCourse(DEFAULT_COURSES[0].code);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  // ==========================================================
  // 2. FETCH BRANCHES & YEARS FOR SELECTED COURSE (getBranch, getYear APIs)
  // ==========================================================
  useEffect(() => {
    if (!course) {
      setBranchList([]);
      setYearList([]);
      return;
    }

    const fetchBranchesAndYears = async () => {
      // Fetch Branches
      try {
        setLoadingBranches(true);
        const branchRes = await getBranch(course);
        console.log(`Common getBranch(${course}) Response:`, branchRes);

        if (Array.isArray(branchRes) && branchRes.length > 0) {
          const mappedBranches: DropdownOption[] = branchRes.map((b: any) => {
            const bCode = String(
              b.BRANCHCODE ??
                b.BranchCode ??
                b.branchCode ??
                b.BRANCH_CODE ??
                b.ID ??
                b.BRANCH ??
                b.name ??
                "",
            );
            const bName = String(
              b.BRANCHNAME ??
                b.BranchName ??
                b.branchName ??
                b.NAME ??
                b.BRANCH ??
                bCode,
            );
            return {
              code: bCode,
              name: bName !== bCode && bCode ? `${bName} (${bCode})` : bName,
            };
          });

          setBranchList(mappedBranches);
          setSelectedBranches(mappedBranches.slice(0, 2).map((b) => b.code));
        } else {
          setBranchList(DEFAULT_BRANCHES);
          setSelectedBranches(DEFAULT_BRANCHES.slice(0, 2).map((b) => b.code));
        }
      } catch (err) {
        console.warn(`Unable to load branches for ${course}:`, err);
        setBranchList(DEFAULT_BRANCHES);
        setSelectedBranches(DEFAULT_BRANCHES.slice(0, 2).map((b) => b.code));
      } finally {
        setLoadingBranches(false);
      }

      // Fetch Years
      try {
        setLoadingYears(true);
        const yearRes = await getYear(course);
        console.log(`Common getYear(${course}) Response:`, yearRes);

        if (Array.isArray(yearRes) && yearRes.length > 0) {
          const mappedYears: DropdownOption[] = yearRes.map((y: any) => {
            const yId = String(
              y.ID ?? y.id ?? y.Year ?? y.year ?? y.YEAR ?? y.YEAR_CODE ?? "",
            );
            const yName = String(
              y.DATA ??
                y.Data ??
                y.data ??
                y.YEAR ??
                y.Year ??
                y.NAME ??
                `Year ${yId}`,
            );
            return { code: yId, name: yName };
          });

          setYearList(mappedYears);
          setYear(mappedYears[0]?.code || "1");
        } else {
          setYearList(DEFAULT_YEARS);
          setYear(DEFAULT_YEARS[0]?.code || "1");
        }
      } catch (err) {
        console.warn(`Unable to load years for ${course}:`, err);
        setYearList(DEFAULT_YEARS);
        setYear(DEFAULT_YEARS[0]?.code || "1");
      } finally {
        setLoadingYears(false);
      }
    };

    fetchBranchesAndYears();
  }, [course]);

  // ==========================================================
  // 3. FETCH ADMISSION MODES (LoadAdmMode API)
  // ==========================================================
  useEffect(() => {
    const fetchAdmissionModes = async () => {
      try {
        setLoadingAdmissionModes(true);
        const payload = {
          fMid: "string",
          status: "string",
          academicYear,
          fYear: "string",
          programme: course || "01",
          year: year || "1",
          termNo: termNo || "string",
          group: "string",
          caste: "string",
          admMode: "string",
          order: "string",
          feeID: "string",
          feeName: "string",
          feeType: "string",
          amount: 0,
          fDate: "string",
          tDate: "string",
          fine: "string",
          id: "string",
          paidYear: "string",
        };

        console.log("Calling loadAdmMode API with payload:", payload);
        const data = await loadAdmMode(payload);
        const list = Array.isArray(data) ? data : data?.data;

        if (Array.isArray(list) && list.length > 0) {
          const mappedModes: DropdownOption[] = list
            .map((m: ApiAdmissionModeRecord) => {
              const rawMode = String(
                m.aDMISSIONMODE ??
                  m.admissionMode ??
                  m.ADMISSIONMODE ??
                  m.name ??
                  "",
              ).trim();
              return {
                code: rawMode,
                name: rawMode,
              };
            })
            .filter((m) => m.code !== "");

          if (mappedModes.length > 0) {
            setAdmissionModeList(mappedModes);
            // Default to first admission mode if not set
            if (
              selectedAdmissionModes.length === 0 ||
              !mappedModes.some((m) => selectedAdmissionModes.includes(m.code))
            ) {
              setSelectedAdmissionModes([mappedModes[0].code]);
            }
          }
        } else {
          setAdmissionModeList(DEFAULT_ADMISSION_MODES);
        }
      } catch (err) {
        console.warn(
          "Unable to load admission modes from API, using defaults:",
          err,
        );
        setAdmissionModeList(DEFAULT_ADMISSION_MODES);
      } finally {
        setLoadingAdmissionModes(false);
      }
    };

    fetchAdmissionModes();
  }, [course, year]);

  // ==========================================================
  // 4. FETCH TABLE DATA (FeeMasterList API)
  // ==========================================================
  const fetchTableData = async () => {
    if (!course) return;

    try {
      setLoadingTable(true);
      const payload = {
        fMid: "string",
        status: "string",
        academicYear,
        fYear: "string",
        programme: course || "01",
        year: year || "1",
        termNo: termNo || "1",
        group: selectedBranches.join(",") || "string",
        caste: "string",
        admMode: selectedAdmissionModes.join(",") || "string",
        order: "string",
        feeID: "string",
        feeName: "string",
        feeType: "string",
        amount: 0,
        fDate: "string",
        tDate: "string",
        fine: "string",
        id: "string",
        paidYear: "string",
      };

      console.log("Calling getFeeMasterList API with payload:", payload);
      const data = await getFeeMasterList(payload);
      const list = Array.isArray(data) ? data : data?.data;

      if (Array.isArray(list) && list.length > 0) {
        const mapped: FeeMasterItem[] = list.map((item: any, idx: number) => ({
          id: item.iD ?? idx + 1,
          feeName: item.fEENAME || item.feeName || "",
          feeType: item.fEETYPE || item.feeType || "",
          amount:
            item.aMOUNT !== undefined && item.aMOUNT !== null
              ? Number(item.aMOUNT).toFixed(2)
              : item.amount !== undefined && item.amount !== null
                ? Number(item.amount).toFixed(2)
                : "0.00",
          selected: item.iSACTIVE !== undefined ? Boolean(item.iSACTIVE) : true,
          order: item.oRDER ?? item.order ?? idx + 1,
          fMid: item.fMID ?? item.fMid,
        }));

        setFeeItems(mapped);
      } else {
        // Fallback to sample fee items
        setFeeItems(INITIAL_FEE_ITEMS);
      }
    } catch (err) {
      console.warn(
        "Unable to load fee master table from API, using default items:",
        err,
      );
      setFeeItems(INITIAL_FEE_ITEMS);
    } finally {
      setLoadingTable(false);
    }
  };

  // Trigger table fetch when course, year, termNo or admission modes change
  useEffect(() => {
    if (course && year) {
      fetchTableData();
    }
  }, [course, year, termNo, selectedAdmissionModes]);

  // ==========================================================
  // 5. CLICK-OUTSIDE HANDLERS FOR DROPDOWNS
  // ==========================================================
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        branchDropdownRef.current &&
        !branchDropdownRef.current.contains(event.target as Node)
      ) {
        setIsBranchDropdownOpen(false);
      }
      if (
        admissionModeDropdownRef.current &&
        !admissionModeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAdmissionModeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filtered branches for search
  const filteredBranches = useMemo(() => {
    if (!branchSearch.trim()) return branchList;
    const q = branchSearch.toLowerCase();
    return branchList.filter(
      (b) =>
        b.code.toLowerCase().includes(q) || b.name.toLowerCase().includes(q),
    );
  }, [branchList, branchSearch]);

  // Filtered admission modes for search
  const filteredAdmissionModes = useMemo(() => {
    if (!admissionModeSearch.trim()) return admissionModeList;
    const q = admissionModeSearch.toLowerCase();
    return admissionModeList.filter(
      (m) =>
        m.code.toLowerCase().includes(q) || m.name.toLowerCase().includes(q),
    );
  }, [admissionModeList, admissionModeSearch]);

  // ==========================================================
  // 6. BRANCH MULTI-SELECT HANDLERS
  // ==========================================================
  const handleToggleBranchSelectAll = () => {
    if (selectedBranches.length === branchList.length) {
      setSelectedBranches([]);
    } else {
      setSelectedBranches(branchList.map((b) => b.code));
    }
  };

  const handleToggleBranch = (branchCode: string) => {
    if (selectedBranches.includes(branchCode)) {
      setSelectedBranches(selectedBranches.filter((b) => b !== branchCode));
    } else {
      setSelectedBranches([...selectedBranches, branchCode]);
    }
  };

  const getBranchButtonText = () => {
    if (loadingBranches) return "Loading Branches...";
    if (selectedBranches.length === 0) return "-- Select Branch --";
    if (
      selectedBranches.length === branchList.length &&
      branchList.length > 0
    ) {
      return `All Branches (${branchList.length})`;
    }
    return selectedBranches.join(", ");
  };

  // ==========================================================
  // 7. ADMISSION MODE MULTI-SELECT HANDLERS
  // ==========================================================
  const handleToggleAdmissionModeSelectAll = () => {
    if (selectedAdmissionModes.length === admissionModeList.length) {
      setSelectedAdmissionModes([]);
    } else {
      setSelectedAdmissionModes(admissionModeList.map((m) => m.code));
    }
  };

  const handleToggleAdmissionMode = (modeCode: string) => {
    if (selectedAdmissionModes.includes(modeCode)) {
      setSelectedAdmissionModes(
        selectedAdmissionModes.filter((m) => m !== modeCode),
      );
    } else {
      setSelectedAdmissionModes([...selectedAdmissionModes, modeCode]);
    }
  };

  const getAdmissionModeButtonText = () => {
    if (loadingAdmissionModes) return "Loading Modes...";
    if (selectedAdmissionModes.length === 0)
      return "-- Select Admission Mode --";
    if (
      selectedAdmissionModes.length === admissionModeList.length &&
      admissionModeList.length > 0
    ) {
      return `All Modes (${admissionModeList.length})`;
    }
    return selectedAdmissionModes.join(", ");
  };

  // ==========================================================
  // 8. TABLE ACTIONS & TOTAL CALCULATION
  // ==========================================================
  const handleToggleRowSelect = (id: number | string) => {
    setFeeItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item,
      ),
    );
  };

  const handleToggleSelectAllRows = () => {
    const areAllSelected = feeItems.every((item) => item.selected);
    setFeeItems((prev) =>
      prev.map((item) => ({ ...item, selected: !areAllSelected })),
    );
  };

  const handleAmountChange = (id: number | string, val: string) => {
    if (/^\d*\.?\d*$/.test(val) || val === "") {
      setFeeItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, amount: val } : item)),
      );
    }
  };

  // Compute grand total of selected fee rows
  const totalAmount = useMemo(() => {
    return feeItems
      .filter((item) => item.selected)
      .reduce((sum, item) => sum + (parseFloat(String(item.amount)) || 0), 0);
  }, [feeItems]);

  const areAllRowsSelected =
    feeItems.length > 0 && feeItems.every((item) => item.selected);

  const formatAmount = (val: number | string) => {
    const num = typeof val === "number" ? val : parseFloat(val) || 0;
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ==========================================================
  // 9. SAVE & CANCEL HANDLERS
  // ==========================================================
  const handleSave = async () => {
    if (!course) {
      toast.error("Please select a Course.");
      return;
    }
    if (!year) {
      toast.error("Please select a Year.");
      return;
    }
    if (selectedBranches.length === 0) {
      toast.error("Please select at least one Branch.");
      return;
    }
    if (selectedAdmissionModes.length === 0) {
      toast.error("Please select at least one Admission Mode.");
      return;
    }
    if (!termNo) {
      toast.error("Please select a Term No.");
      return;
    }

    const selectedHeads = feeItems.filter(
      (item) => item.selected && parseFloat(String(item.amount)) >= 0,
    );

    if (selectedHeads.length === 0) {
      toast.error("Please select at least one Fee Head.");
      return;
    }

    const totalCombinations =
      selectedBranches.length *
      selectedAdmissionModes.length *
      selectedHeads.length;

    console.log(
      `Saving Fee Master: ${totalCombinations} total record(s) (${selectedBranches.length} Branch(es) × ${selectedAdmissionModes.length} Admission Mode(s) × ${selectedHeads.length} Fee Head(s))`,
    );

    setSaving(true);
    try {
      let successCount = 0;
      let failedCount = 0;

      // Nested loop: Branch -> Admission Mode -> Fee Head
      for (const branchCode of selectedBranches) {
        for (const admMode of selectedAdmissionModes) {
          for (let i = 0; i < selectedHeads.length; i++) {
            const head = selectedHeads[i];
            const payload: SaveFeeMasterPayload = {
              fMid: String(head.fMid ?? ""),
              status: "string",
              academicYear: academicYear,
              fYear: "Apr-2017 to Mar-2018",
              programme: course,
              year: year,
              termNo: termNo,
              group: branchCode,
              caste: "",
              admMode: admMode,
              order: String(head.order ?? i + 1),
              feeID: String(head.id ?? ""),
              feeName: head.feeName,
              feeType: head.feeType,
              amount: parseFloat(String(head.amount)) || 0,
              fDate: "",
              tDate: "",
              fine: "",
              id: "",
              paidYear: "",
            };

            try {
              await saveFeeMasterRecord(payload);
              successCount++;
            } catch (err: any) {
              failedCount++;
              console.error("Save error for item:", payload, err);
            }
          }
        }
      }

      if (failedCount === 0) {
        toast.success(
          `Fee Master saved successfully! (${successCount} record(s) created for ${selectedBranches.length} Branch(es), ${selectedAdmissionModes.length} Admission Mode(s), and ${selectedHeads.length} Fee Head(s))`,
        );
      } else if (successCount > 0) {
        toast.warning(
          `Partially saved: ${successCount} record(s) saved, ${failedCount} record(s) failed.`,
        );
      } else {
        toast.error("Failed to save Fee Master records.");
      }

      // Refresh table data after saving
      fetchTableData();
    } catch (err: any) {
      console.error("Save Fee Master error:", err);
      toast.error(err?.message || "Failed to save Fee Master structure.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (courseList.length > 0) {
      setCourse(courseList[0].code);
    }
    if (yearList.length > 0) {
      setYear(yearList[0].code);
    }
    setTermNo("1");
    setSelectedBranches(branchList.slice(0, 2).map((b) => b.code));
    if (admissionModeList.length > 0) {
      setSelectedAdmissionModes([admissionModeList[0].code]);
    }
    setBranchSearch("");
    setAdmissionModeSearch("");
    fetchTableData();
    toast.info("Fee Master form reset to defaults.");
  };

  return (
    <div className="dbs-headmaster-container">
      {/* Page Header (HeadsMaster Theme) */}
      <div className="dbs-headmaster-header">
        <div>
          <h2>Fee Master</h2>
          <p className="dbs-headmaster-subtitle">
            Configure course-wise fee structures, admission modes, and branches
            ({academicYear})
          </p>
        </div>
      </div>

      {/* Configuration Form Card */}
      <div className="dbs-headmaster-form-card">
        <h3>Fee Structure Configuration</h3>

        <div className="dbs-headmaster-grid">
          {/* Course Dropdown (Loaded via getProgramme) */}
          <div className="dbs-headmaster-input">
            <label>Course *</label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              disabled={loadingCourses}
            >
              <option value="">
                {loadingCourses ? "Loading Courses..." : "-- Select Course --"}
              </option>
              {courseList.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Multi-Select Dropdown (Loaded via getBranch(course)) */}
          <div className="dbs-headmaster-input" ref={branchDropdownRef}>
            <label>
              Branch *{" "}
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--dbs-primary)",
                  fontWeight: "normal",
                }}
              >
                ({selectedBranches.length} of {branchList.length} selected)
              </span>
            </label>
            <div className="dbs-feemaster-multiselect-wrap">
              <button
                type="button"
                className={`dbs-feemaster-multiselect-btn ${
                  isBranchDropdownOpen ? "active" : ""
                }`}
                onClick={() => {
                  if (!loadingBranches) {
                    setIsBranchDropdownOpen((prev) => !prev);
                  }
                }}
                disabled={loadingBranches}
                title={getBranchButtonText()}
              >
                <span
                  className={`dbs-feemaster-multiselect-label ${
                    selectedBranches.length === 0 ? "placeholder" : ""
                  }`}
                >
                  {getBranchButtonText()}
                </span>
                {selectedBranches.length > 0 && !loadingBranches && (
                  <span className="dbs-feemaster-multiselect-count-badge">
                    {selectedBranches.length}
                  </span>
                )}
                <ChevronDown
                  size={16}
                  className={`dbs-feemaster-multiselect-arrow ${
                    isBranchDropdownOpen ? "open" : ""
                  }`}
                />
              </button>

              {/* Branch Popup */}
              {isBranchDropdownOpen && (
                <div className="dbs-feemaster-multiselect-menu">
                  {/* Search bar */}
                  <div className="dbs-feemaster-multiselect-search-box">
                    <Search
                      size={14}
                      style={{ color: "var(--dbs-text-muted)" }}
                    />
                    <input
                      type="text"
                      className="dbs-feemaster-multiselect-search-input"
                      placeholder="Search branch..."
                      value={branchSearch}
                      onChange={(e) => setBranchSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Select All */}
                  <div
                    className="dbs-feemaster-multiselect-all-header"
                    onClick={handleToggleBranchSelectAll}
                  >
                    <CustomCheckbox
                      checked={
                        branchList.length > 0 &&
                        selectedBranches.length === branchList.length
                      }
                      onChange={handleToggleBranchSelectAll}
                    />
                    <span className="dbs-feemaster-multiselect-all-header-text">
                      Select all ({branchList.length})
                    </span>
                  </div>

                  {/* Branch Items List */}
                  <div className="dbs-feemaster-multiselect-items">
                    {filteredBranches.length === 0 ? (
                      <div className="dbs-feemaster-multiselect-empty">
                        No branches match "{branchSearch}"
                      </div>
                    ) : (
                      filteredBranches.map((b) => {
                        const isChecked = selectedBranches.includes(b.code);
                        return (
                          <div
                            key={b.code}
                            className={`dbs-feemaster-multiselect-row ${
                              isChecked ? "checked" : ""
                            }`}
                            onClick={() => handleToggleBranch(b.code)}
                          >
                            <CustomCheckbox
                              checked={isChecked}
                              onChange={() => handleToggleBranch(b.code)}
                            />
                            <span className="dbs-feemaster-multiselect-row-text">
                              {b.name}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Year Dropdown (Loaded via getYear(course)) */}
          <div className="dbs-headmaster-input">
            <label>Year *</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              disabled={loadingYears}
            >
              <option value="">
                {loadingYears ? "Loading Years..." : "-- Select Year --"}
              </option>
              {yearList.map((y) => (
                <option key={y.code} value={y.code}>
                  {y.name}
                </option>
              ))}
            </select>
          </div>

          {/* Term No Dropdown */}
          <div className="dbs-headmaster-input">
            <label>Term No *</label>
            <select value={termNo} onChange={(e) => setTermNo(e.target.value)}>
              <option value="">Select Term</option>
              <option value="1">Term-1</option>
              <option value="2">Term-2</option>
              <option value="3">Term-3</option>
              <option value="4">Term-4</option>
            </select>
          </div>

          {/* Admission Mode Multi-Select Dropdown (Loaded via loadAdmMode) */}
          <div className="dbs-headmaster-input" ref={admissionModeDropdownRef}>
            <label>
              Admission Mode *{" "}
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--dbs-primary)",
                  fontWeight: "normal",
                }}
              >
                ({selectedAdmissionModes.length} of {admissionModeList.length}{" "}
                selected)
              </span>
            </label>
            <div className="dbs-feemaster-multiselect-wrap">
              <button
                type="button"
                className={`dbs-feemaster-multiselect-btn ${
                  isAdmissionModeDropdownOpen ? "active" : ""
                }`}
                onClick={() => {
                  if (!loadingAdmissionModes) {
                    setIsAdmissionModeDropdownOpen((prev) => !prev);
                  }
                }}
                disabled={loadingAdmissionModes}
                title={getAdmissionModeButtonText()}
              >
                <span
                  className={`dbs-feemaster-multiselect-label ${
                    selectedAdmissionModes.length === 0 ? "placeholder" : ""
                  }`}
                >
                  {getAdmissionModeButtonText()}
                </span>
                {selectedAdmissionModes.length > 0 &&
                  !loadingAdmissionModes && (
                    <span className="dbs-feemaster-multiselect-count-badge">
                      {selectedAdmissionModes.length}
                    </span>
                  )}
                <ChevronDown
                  size={16}
                  className={`dbs-feemaster-multiselect-arrow ${
                    isAdmissionModeDropdownOpen ? "open" : ""
                  }`}
                />
              </button>

              {/* Admission Mode Popup */}
              {isAdmissionModeDropdownOpen && (
                <div className="dbs-feemaster-multiselect-menu">
                  {/* Search bar */}
                  <div className="dbs-feemaster-multiselect-search-box">
                    <Search
                      size={14}
                      style={{ color: "var(--dbs-text-muted)" }}
                    />
                    <input
                      type="text"
                      className="dbs-feemaster-multiselect-search-input"
                      placeholder="Search admission mode..."
                      value={admissionModeSearch}
                      onChange={(e) => setAdmissionModeSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Select All */}
                  <div
                    className="dbs-feemaster-multiselect-all-header"
                    onClick={handleToggleAdmissionModeSelectAll}
                  >
                    <CustomCheckbox
                      checked={
                        admissionModeList.length > 0 &&
                        selectedAdmissionModes.length ===
                          admissionModeList.length
                      }
                      onChange={handleToggleAdmissionModeSelectAll}
                    />
                    <span className="dbs-feemaster-multiselect-all-header-text">
                      Select all ({admissionModeList.length})
                    </span>
                  </div>

                  {/* Admission Mode Items List */}
                  <div className="dbs-feemaster-multiselect-items">
                    {filteredAdmissionModes.length === 0 ? (
                      <div className="dbs-feemaster-multiselect-empty">
                        No admission modes match "{admissionModeSearch}"
                      </div>
                    ) : (
                      filteredAdmissionModes.map((m) => {
                        const isChecked = selectedAdmissionModes.includes(
                          m.code,
                        );
                        return (
                          <div
                            key={m.code}
                            className={`dbs-feemaster-multiselect-row ${
                              isChecked ? "checked" : ""
                            }`}
                            onClick={() => handleToggleAdmissionMode(m.code)}
                          >
                            <CustomCheckbox
                              checked={isChecked}
                              onChange={() => handleToggleAdmissionMode(m.code)}
                            />
                            <span className="dbs-feemaster-multiselect-row-text">
                              {m.name}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Total Amount Display */}
          <div className="dbs-headmaster-input">
            <label>Total Amount</label>
            <input
              type="text"
              className="dbs-feemaster-input-readonly"
              value={`₹ ${formatAmount(totalAmount)}`}
              readOnly
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="dbs-headmaster-actions">
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
            type="button"
            className="dbs-headmaster-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 size={16} className="dbs-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Table Section Header */}
      <div className="dbs-headmaster-table-header">
        <div>
          <h2>Fee Heads List</h2>
          <p className="dbs-headmaster-subtitle">
            {feeItems.filter((i) => i.selected).length} fee heads selected •
            Total: ₹ {formatAmount(totalAmount)}
          </p>
        </div>
        <button
          type="button"
          className="dbs-headmaster-reset-btn"
          onClick={fetchTableData}
          disabled={loadingTable}
          title="Reload fee head records"
          style={{
            minWidth: "auto",
            height: "36px",
            padding: "0 14px",
            fontSize: "0.82rem",
          }}
        >
          <RefreshCw size={14} className={loadingTable ? "dbs-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="dbs-headmaster-table-container">
        {loadingTable ? (
          <div className="dbs-empty-state">
            <Loader2 className="dbs-empty-state-icon dbs-spin" />
            <div className="dbs-empty-state-title">Loading Fee Heads...</div>
            <div className="dbs-empty-state-desc">
              Retrieving configured fee head records for the selected
              parameters.
            </div>
          </div>
        ) : feeItems.length === 0 ? (
          <div className="dbs-empty-state">
            <AlertCircle className="dbs-empty-state-icon" />
            <div className="dbs-empty-state-title">No fee heads found</div>
            <div className="dbs-empty-state-desc">
              No fee head records found for the selected course and parameters.
            </div>
          </div>
        ) : (
          <div className="dbs-table-card">
            <div className="dbs-table-scroll active-scroll">
              <table className="dbs-data-table">
                <thead>
                  <tr>
                    <th style={{ width: "7%", textAlign: "center" }}>S.NO</th>
                    <th style={{ width: "38%" }}>FEE NAME</th>
                    <th style={{ width: "35%" }}>FEE TYPE</th>
                    <th style={{ width: "20%", textAlign: "right" }}>
                      <div className="dbs-feemaster-th-header-wrapper">
                        <span>AMOUNT</span>
                        <label
                          className="dbs-feemaster-th-select-all-label"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <CustomCheckbox
                            checked={areAllRowsSelected}
                            onChange={handleToggleSelectAllRows}
                            isHeader={true}
                          />
                          <span>Select All</span>
                        </label>
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {feeItems.map((item, idx) => (
                    <tr key={item.id}>
                      <td style={{ textAlign: "center" }}>{idx + 1}</td>
                      <td style={{ fontWeight: 700 }}>{item.feeName}</td>
                      <td style={{ color: "var(--dbs-text-muted)" }}>
                        {item.feeType}
                      </td>
                      <td className="dbs-headmaster-amount-td">
                        <div className="dbs-feemaster-table-amount-box">
                          <input
                            type="text"
                            className="dbs-feemaster-table-input"
                            value={item.amount}
                            onChange={(e) =>
                              handleAmountChange(item.id, e.target.value)
                            }
                            placeholder="0.00"
                          />
                          <CustomCheckbox
                            checked={item.selected}
                            onChange={() => handleToggleRowSelect(item.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot>
                  <tr className="dbs-feemaster-total-row">
                    <td colSpan={3} className="dbs-feemaster-total-label">
                      Total Included Amount (
                      {feeItems.filter((i) => i.selected).length} Heads):
                    </td>
                    <td className="dbs-feemaster-total-amount">
                      ₹ {formatAmount(totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeMaster;
