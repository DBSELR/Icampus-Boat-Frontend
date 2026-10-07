import React, { useState, useEffect, useRef } from "react";
import { BookOpen, Calendar, Award, RefreshCw, Save, Users, FileText } from "lucide-react";
import { toast } from "sonner";
import {
    getProgrammes, getYears, getBranches, getSections, getSubjects, getMidTypes, getMaxMinMarks, getStudentMarks, saveAllMarks,
    saveAttendanceMarks, ProgrammeItem, YearItem, BranchItem, SectionItem, SubjectItem, MidTypeItem, StudentMarkRow,
    StudentAttendanceItem
} from "../../../apis/MarksEntryApis";
import "./MarksEntry.css";

// Helper to extract list from array, object.data, or JSON string
const extractList = (res: any): any[] => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (res.data) {
        if (Array.isArray(res.data)) return res.data;
        if (typeof res.data === "string") {
            try {
                const parsed = JSON.parse(res.data);
                if (Array.isArray(parsed)) return parsed;
            }
            catch { }
        }
    }
    return [];
};

// Helper to safely extract logged in User ID
const getStoredUserId = (): string => {
    try {
        const rawUser = localStorage.getItem("user");
        if (rawUser) {
            const parsed = JSON.parse(rawUser);
            if (parsed) {
                if (typeof parsed === "string") return parsed;
                const uid = parsed.userId || parsed.UserId || parsed.USERID || parsed.id || parsed.ID || parsed.userCode || parsed.UserCode;
                if (uid) return uid.toString();
            }
        }
    } catch { }
    return (
        localStorage.getItem("userId") ||
        localStorage.getItem("UserId") ||
        localStorage.getItem("USERID") ||
        localStorage.getItem("empId") ||
        localStorage.getItem("EmpId") ||
        localStorage.getItem("username") ||
        ""
    );
};

export const MarksEntry: React.FC = () => {
    // Session / Storage variables
    const academicYear = localStorage.getItem("academicYear") || localStorage.getItem("AcYR") || new Date().getFullYear().toString();
    const userId = getStoredUserId();
    const department = localStorage.getItem("department") || localStorage.getItem("Dept") || "";

    // Date State (HTML5 YYYY-MM-DD format)
    const [examDate, setExamDate] = useState<string>(() => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    });

    // Dropdown Lists State (Fully Dynamic from API)
    const [programmes, setProgrammes] = useState<ProgrammeItem[]>([]);
    const [branches, setBranches] = useState<BranchItem[]>([]);
    const [years, setYears] = useState<YearItem[]>([]);
    const [sections, setSections] = useState<SectionItem[]>([]);
    const [subjects, setSubjects] = useState<SubjectItem[]>([]);
    const [midTypes, setMidTypes] = useState<MidTypeItem[]>([]);

    // Filter Selections
    const [selectedProgramme, setSelectedProgramme] = useState<string>("-1");
    const [selectedBranch, setSelectedBranch] = useState<string>("");
    const [selectedYear, setSelectedYear] = useState<string>("");
    const [selectedSemester, setSelectedSemester] = useState<string>("1");
    const [selectedSection, setSelectedSection] = useState<string>("");
    const [selectedStream, setSelectedStream] = useState<string>("1");
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [selectedMidType, setSelectedMidType] = useState<string>("");

    // Marks Threshold State
    const [maxMarks, setMaxMarks] = useState<string>("");
    const [minMarks, setMinMarks] = useState<string>("");

    // Grid / Student Data State
    const [students, setStudents] = useState<StudentMarkRow[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);

    // Input Box Refs for keyboard navigation
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // 1. Initial Load: Fetch Programmes dynamically from Backend API
    useEffect(() => {
        const initLoad = async () => {
            try {
                const res = await getProgrammes(academicYear, department, userId);
                const list = extractList(res);
                setProgrammes(list);
            } catch (err) {
                console.error("Error loading programmes from API:", err);
                setProgrammes([]);
            }
        };
        initLoad();
    }, [academicYear, department, userId]);

    // 2. Cascade: When Programme changes -> fetch Years & Branches dynamically from API
    const handleProgrammeChange = async (progCode: string) => {
        setSelectedProgramme(progCode);
        setSelectedBranch("");
        setSelectedYear("");
        setSelectedSection("");
        setSelectedSubject("");
        setSelectedMidType("");
        setStudents([]);
        setMaxMarks("");
        setMinMarks("");

        if (!progCode || progCode === "-1") {
            setBranches([]);
            setYears([]);
            return;
        }

        const cleanCode = progCode.includes("-") ? progCode.split("-")[0].trim() : progCode.trim();

        // Fetch Branches dynamically
        try {
            let branchRes = await getBranches(cleanCode, academicYear, department, userId);
            let branchList = extractList(branchRes);
            if (branchList.length === 0 && cleanCode !== progCode) {
                branchRes = await getBranches(progCode, academicYear, department, userId);
                branchList = extractList(branchRes);
            }
            console.log("Fetched branches for programme:", progCode, branchList);
            setBranches(branchList);
        } catch (err) {
            console.error("Error fetching branches from API:", err);
            setBranches([]);
        }

        // Fetch Years dynamically
        try {
            let yearRes = await getYears(department, cleanCode, academicYear, userId);
            let yearList = extractList(yearRes);
            if (yearList.length === 0 && cleanCode !== progCode) {
                yearRes = await getYears(department, progCode, academicYear, userId);
                yearList = extractList(yearRes);
            }
            console.log("Fetched years for programme:", progCode, yearList);
            setYears(yearList);
        } catch (err) {
            console.error("Error fetching years from API:", err);
            setYears([]);
        }
    };

    // Helper to fetch sections dynamically
    const fetchSections = async (prog: string, branch: string, yr: string) => {
        if (!prog || prog === "-1" || !branch || !yr) return;

        const cleanProg = prog.includes("-") ? prog.split("-")[0].trim() : prog.trim();
        const cleanBranch = branch.includes("-") ? branch.split("-")[0].trim() : branch.trim();
        const cleanYr = yr.includes("-") ? yr.split("-")[0].trim() : yr.trim();

        try {
            let res = await getSections(cleanProg, cleanBranch, cleanYr);
            let list = extractList(res);

            if (list.length === 0 && (cleanProg !== prog || cleanBranch !== branch || cleanYr !== yr)) {
                res = await getSections(prog, branch, yr);
                list = extractList(res);
            }

            console.log("Fetched sections for:", { prog, branch, yr }, list);
            setSections(list);
        } catch (err) {
            console.error("Error fetching sections from API:", err);
            setSections([]);
        }
    };

    // Automatically trigger fetchSections whenever Programme, Branch, or Year changes
    useEffect(() => {
        if (selectedProgramme && selectedProgramme !== "-1" && selectedBranch && selectedYear) {
            fetchSections(selectedProgramme, selectedBranch, selectedYear);
        }
    }, [selectedProgramme, selectedBranch, selectedYear]);

    // 3. Cascade: When Year changes -> reset lower controls
    const handleYearChange = async (yr: string) => {
        setSelectedYear(yr);
        setSelectedSection("");
        setSelectedSubject("");
        setSelectedMidType("");
        setStudents([]);
    };

    // 4. Cascade: When Branch changes -> reset lower controls
    const handleBranchChange = async (br: string) => {
        setSelectedBranch(br);
        setSelectedSection("");
        setSelectedSubject("");
        setSelectedMidType("");
        setStudents([]);
    };

    // 5. Cascade: Fetch Subjects dynamically when (Programme, Branch, Year, Sem, Section) are selected
    const handleSectionChange = (sec: string) => {
        setSelectedSection(sec);
        setSelectedSubject("");
        setSelectedMidType("");
        setStudents([]);

        if (selectedProgramme && selectedBranch && selectedYear && selectedSemester && sec) {
            loadSubjects(sec);
        }
    };

    const handleSemesterChange = (sem: string) => {
        setSelectedSemester(sem);
        setSelectedSubject("");
        setSelectedMidType("");
        setStudents([]);

        if (selectedProgramme && selectedBranch && selectedYear && sem && selectedSection) {
            loadSubjects(selectedSection, sem);
        }
    };

    // Helpers to safely convert Year and Sem to numeric strings for SQL integer parameters
    const getNumericYear = (y: string): string => {
        const trimmed = (y || "").trim().toUpperCase();
        if (trimmed === "1" || trimmed === "I" || trimmed.startsWith("1") || trimmed.startsWith("I")) return "1";
        if (trimmed === "2" || trimmed === "II" || trimmed.startsWith("2") || trimmed.startsWith("II")) return "2";
        if (trimmed === "3" || trimmed === "III" || trimmed.startsWith("3") || trimmed.startsWith("III")) return "3";
        if (trimmed === "4" || trimmed === "IV" || trimmed.startsWith("4") || trimmed.startsWith("IV")) return "4";
        const num = trimmed.replace(/\D/g, "");
        return num || trimmed;
    };

    const getNumericSem = (sem: string): string => {
        const trimmed = (sem || "").trim().toUpperCase();
        if (trimmed === "1" || trimmed === "I" || trimmed.startsWith("1") || trimmed.startsWith("I")) return "1";
        if (trimmed === "2" || trimmed === "II" || trimmed.startsWith("2") || trimmed.startsWith("II")) return "2";
        const num = trimmed.replace(/\D/g, "");
        return num || "1";
    };

    const loadSubjects = async (sec?: string, sem?: string) => {
        const targetSec = sec !== undefined ? sec : selectedSection;
        const targetSem = sem !== undefined ? sem : selectedSemester;

        if (!selectedProgramme || selectedProgramme === "-1" || !selectedBranch || !selectedYear || !targetSec) return;

        const numYear = getNumericYear(selectedYear);
        const numSem = getNumericSem(targetSem);
        const cleanProg = selectedProgramme.includes("-") ? selectedProgramme.split("-")[0].trim() : selectedProgramme.trim();
        const cleanBranch = selectedBranch.includes("-") ? selectedBranch.split("-")[0].trim() : selectedBranch.trim();
        const cleanSec = targetSec.includes("-") ? targetSec.split("-")[0].trim() : targetSec.trim();

        const userVariants = Array.from(new Set([userId, ""]));
        const progVariants = Array.from(new Set([cleanProg, selectedProgramme].filter(Boolean)));
        const branchVariants = Array.from(new Set([cleanBranch, selectedBranch].filter(Boolean)));
        const yearVariants = Array.from(new Set([numYear, selectedYear].filter(Boolean)));
        const semVariants = Array.from(new Set([numSem, targetSem].filter(Boolean)));
        const secVariants = Array.from(new Set([cleanSec, targetSec].filter(Boolean)));

        const acadYearTrim = (academicYear || "").trim();
        const acadYearVariants = Array.from(new Set([
            acadYearTrim,
            acadYearTrim.includes("-") ? acadYearTrim.split("-")[0].trim() : acadYearTrim
        ].filter(Boolean)));

        try {
            for (const uVal of userVariants) {
                for (const progVal of progVariants) {
                    for (const brVal of branchVariants) {
                        for (const yrVal of yearVariants) {
                            for (const semVal of semVariants) {
                                for (const secVal of secVariants) {
                                    for (const ayVal of acadYearVariants) {
                                        try {
                                            const res = await getSubjects({
                                                userId: uVal,
                                                programme: progVal,
                                                branch: brVal,
                                                year: yrVal,
                                                semester: semVal,
                                                section: secVal,
                                                academicYear: ayVal,
                                                stream: selectedStream
                                            });

                                            const list = extractList(res);
                                            if (list.length > 0) {
                                                console.log("Successfully loaded subjects with parameters:", { uVal, progVal, brVal, yrVal, semVal, secVal, ayVal }, list);
                                                setSubjects(list);
                                                return;
                                            }
                                        } catch (singleErr) {
                                            console.warn("Parameter variant failed:", { uVal, progVal, brVal, yrVal, semVal, secVal, ayVal }, singleErr);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            console.warn("No subjects returned for any parameter variant combination");
            setSubjects([]);
        } catch (err) {
            console.error("Error loading subjects from API:", err);
            setSubjects([]);
        }
    };

    // Automatically trigger loadSubjects whenever Programme, Branch, Year, Sem, or Section changes
    useEffect(() => {
        if (selectedProgramme && selectedProgramme !== "-1" && selectedBranch && selectedYear && selectedSemester && selectedSection) {
            loadSubjects(selectedSection, selectedSemester);
        }
    }, [selectedProgramme, selectedBranch, selectedYear, selectedSemester, selectedSection]);

    // 6. Cascade: When Subject changes -> fetch Mid Types dynamically
    const handleSubjectChange = async (subjCode: string) => {
        setSelectedSubject(subjCode);
        setSelectedMidType("");
        setStudents([]);
        setMaxMarks("");
        setMinMarks("");
        setMidTypes([]);

        if (!subjCode) return;

        await loadMidTypes(subjCode);
    };

    const loadMidTypes = async (subjCode: string) => {
        try {
            const request = {
                academicYear: academicYear?.trim(),
                programme: selectedProgramme.includes("-")
                    ? selectedProgramme.split("-")[0].trim()
                    : selectedProgramme.trim(),
                branch: selectedBranch.includes("-")
                    ? selectedBranch.split("-")[0].trim()
                    : selectedBranch.trim(),
                year: getNumericYear(selectedYear),
                semester: getNumericSem(selectedSemester),
                section: selectedSection.includes("-")
                    ? selectedSection.split("-")[0].trim()
                    : selectedSection.trim(),
                subjectCode: subjCode.includes("-")
                    ? subjCode.split("-")[0].trim()
                    : subjCode.trim()
            };

            console.log("MIDTYPE REQUEST:", request);

            const response = await getMidTypes(request);

            console.log("MIDTYPE RESPONSE:", response);

            const list = Array.isArray(response?.data)
                ? response.data
                : [];

            console.log("MIDTYPE LIST:", list);

            setMidTypes(list);
        } catch (error) {
            console.error("Error loading MidTypes:", error);
            setMidTypes([]);
        }
    };
    // 7. Cascade: When MidType changes -> fetch Max/Min Marks & Student Marks List dynamically
    const handleMidTypeChange = async (mt: string) => {
        setSelectedMidType(mt);
        setStudents([]);

        if (!mt) {
            setMaxMarks("");
            setMinMarks("");
            return;
        }

        setLoading(true);
        const numYear = getNumericYear(selectedYear);
        const numSem = getNumericSem(selectedSemester);
        const cleanProg = selectedProgramme.includes("-") ? selectedProgramme.split("-")[0].trim() : selectedProgramme.trim();
        const cleanBranch = selectedBranch.includes("-") ? selectedBranch.split("-")[0].trim() : selectedBranch.trim();
        const cleanSec = selectedSection.includes("-") ? selectedSection.split("-")[0].trim() : selectedSection.trim();
        const cleanSubj = selectedSubject.includes("-") ? selectedSubject.split("-")[0].trim() : selectedSubject.trim();

        try {
            const [maxMinRes, studentRes] = await Promise.all([
                getMaxMinMarks({
                    academicYear,
                    programme: cleanProg,
                    branch: cleanBranch,
                    year: numYear,
                    semester: numSem,
                    section: cleanSec,
                    subjectCode: cleanSubj,
                    midType: mt
                }),
                getStudentMarks({
                    academicYear,
                    programme: cleanProg,
                    branch: cleanBranch,
                    year: numYear,
                    semester: numSem,
                    section: cleanSec,
                    subjectCode: cleanSubj,
                    midType: mt,
                    userId
                })
            ]);

            // Set Max / Min Marks dynamically from API
            const maxMinList = extractList(maxMinRes);
            if (maxMinList.length > 0) {
                const row = maxMinList[0];
                const maxVal = row.MaxMarks ?? row.SessionalMaxMarks ?? row.AssMaxMarks ?? row.OQMaxMarks ?? row.AttMaxMarks ?? row.DayMaxMarks ?? row.intTestMaxMarks ?? "";
                const minVal = row.MinMarks ?? row.SessionalMinMarks ?? row.AssMinMarks ?? row.OQMinMarks ?? row.AttMinMarks ?? row.DayMinMarks ?? row.intTestMinMarks ?? "";
                setMaxMarks(maxVal.toString());
                setMinMarks(minVal.toString());
            } else {
                setMaxMarks("");
                setMinMarks("");
            }

            // Set Student Marks Grid dynamically from API
            const rawList = extractList(studentRes);
            const formatted = rawList.map((st: any, idx: number) => ({
                ...st,
                sno: idx + 1,
                Marks: st.Marks !== undefined && st.Marks !== null ? st.Marks.toString() : ""
            }));
            setStudents(formatted);
        } catch (err) {
            console.error("Error loading marks & student data from API:", err);
            toast.error("Failed to fetch marks configuration or student list");
        } finally {
            setLoading(false);
        }
    };

    // Real-time Validation & Keyboard Navigation
    const handleMarkChange = (index: number, val: string) => {
        const updated = [...students];
        const upperVal = val.toUpperCase().trim();

        // Check Max Marks constraint dynamically
        if (upperVal !== "" && upperVal !== "AB" && !isNaN(Number(upperVal)) && maxMarks !== "") {
            if (parseFloat(upperVal) > parseFloat(maxMarks)) {
                toast.error(`Marks should not exceed ${maxMarks}`, { id: `mark-err-${index}` });
                updated[index].Marks = "";
                setStudents(updated);
                return;
            }
        }

        updated[index].Marks = upperVal;
        setStudents(updated);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Enter" || e.key === "Tab") {
            const nextIndex = e.shiftKey ? index - 1 : index + 1;
            if (nextIndex >= 0 && nextIndex < students.length) {
                e.preventDefault();
                inputRefs.current[nextIndex]?.focus();
                inputRefs.current[nextIndex]?.select();
            }
        }
    };

    // Save All Handler
    const handleSaveAll = async () => {
        if (selectedProgramme === "-1" || !selectedProgramme) {
            toast.error("Please Select Course Name");
            return;
        }
        if (!selectedBranch) {
            toast.error("Please Select Branch Name");
            return;
        }
        if (!selectedYear) {
            toast.error("Please Select Year");
            return;
        }
        if (!selectedSubject) {
            toast.error("Please Select Subject Name");
            return;
        }
        if (!selectedMidType) {
            toast.error("Please Select Mid Type");
            return;
        }

        setSaving(true);
        try {
            if (selectedMidType === "Attendance") {
                const attStudents: StudentAttendanceItem[] = students.map((s) => ({
                    id: (s.ID || s.id || "0").toString(),
                    registrationNo: s.RegistrationNo || s.REGNO || "",
                    marks: s.Marks?.toString() || "0",
                    tlmCode: s.TLMCode || "",
                    tc: (s.TH || "0").toString(),
                    pc: (s.CP || "0").toString(),
                    perc: (s.PERCENTAGE || "0").toString()
                }));

                const payload = {
                    academicYear,
                    programme: selectedProgramme,
                    branch: selectedBranch,
                    year: selectedYear,
                    semester: selectedSemester,
                    section: selectedSection,
                    stream: selectedStream,
                    subjectCode: selectedSubject,
                    date: examDate,
                    userId,
                    students: attStudents
                };

                const res = await saveAttendanceMarks(payload);
                if (res && res.success) {
                    toast.success(res.message || "Attendance marks saved successfully!");
                } else {
                    toast.error(res?.message || "Failed to save attendance marks");
                }
            } else {
                let successCount = 0;

                for (const s of students) {
                    const regNo = s.RegistrationNo || s.REGNO || "";
                    const rowId = (s.ID || s.id || "0").toString();
                    const markVal = s.Marks?.toString() || "";

                    if (!regNo) continue;

                    const payload = {
                        id: rowId,
                        registrationNo: regNo,
                        date: examDate,
                        programme: selectedProgramme,
                        branch: selectedBranch,
                        year: selectedYear,
                        semester: selectedSemester,
                        section: selectedSection,
                        stream: selectedStream,
                        subjectCode: selectedSubject,
                        maxMarks: maxMarks,
                        minMarks: minMarks,
                        marks: markVal,
                        midType: selectedMidType,
                        academicYear,
                        userId
                    };

                    try {
                        const res = await saveAllMarks(payload);
                        if (res && res.success) successCount++;
                    } catch (e) {
                        console.error(`Failed to save mark for ${regNo}:`, e);
                    }
                }

                toast.success(`Successfully saved marks for ${successCount} student(s)`);
            }
        } catch (err: any) {
            console.error("Save error:", err);
            toast.error(err?.response?.data?.message || "Error occurred while saving marks");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="marks-entry-container">
            {/* Header Banner */}
            <div className="marks-entry-header">
                <div className="marks-entry-title">
                    <Award size={28} />
                    <span>Examinations Marks Entry</span>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <span className="status-badge status-badge-blue">
                        Academic Year: {academicYear}
                    </span>
                </div>
            </div>

            {/* Main Grid Layout */}
            <div className="marks-entry-grid">
                {/* Left Column: Selection Form Controls */}
                <div className="marks-card">
                    <div className="marks-card-header">
                        <div className="marks-card-title">
                            <BookOpen size={18} />
                            <span>Selection Criteria</span>
                        </div>
                    </div>

                    <div className="marks-card-body">
                        {/* Exam Date */}
                        <div className="form-group">
                            <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <Calendar size={15} />
                                <span>Exam MY / Date</span>
                            </label>
                            <input
                                type="date"
                                className="form-control-custom"
                                value={examDate}
                                onChange={(e) => setExamDate(e.target.value)}
                            />
                        </div>

                        {/* Programme Dropdown (Dynamic from Backend API) */}
                        <div className="form-group">
                            <label>Programme</label>
                            <select
                                className="form-control-custom"
                                value={selectedProgramme}
                                onChange={(e) => handleProgrammeChange(e.target.value)}
                            >
                                <option value="-1">Select Programme</option>
                                {programmes.map((p: any, i: number) => {
                                    const vals = typeof p === "object" && p !== null ? Object.values(p) : [p];
                                    const code = typeof p === "string" ? p : (p.CourseCode || p.COURSECODE || p.coursecode || p.COURSE || p.Course || p.code || p.PROGRAMME || p.Programme || p.ID || p.id || (vals[0] as string) || "");
                                    const name = typeof p === "string" ? p : (p.COURSENAME || p.coursename || p.CourseName || p.Course || p.course || p.NAME || p.name || p.PROGRAMMENAME || p.ProgrammeName || (vals[1] as string) || (vals[0] as string) || code);
                                    return (
                                        <option key={i} value={code}>
                                            {code && name !== code ? `${code}-${name}` : name}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Branch Dropdown (Dynamic from Backend API) */}
                        <div className="form-group">
                            <label>Branch</label>
                            <select
                                className="form-control-custom"
                                value={selectedBranch}
                                onChange={(e) => handleBranchChange(e.target.value)}
                            >
                                <option value="">Select Branch</option>
                                {branches.map((b: any, i: number) => {
                                    const vals = typeof b === "object" && b !== null ? Object.values(b) : [b];
                                    const code = typeof b === "string" ? b : (b.BranchCode || b.BRANCHCODE || b.branchcode || b.BRANCH || b.Branch || b.code || b.BRANCH_CODE || b.Branch_Code || b.ID || b.id || (vals[0] as string) || "");
                                    const name = typeof b === "string" ? b : (b.BranchName || b.BRANCHNAME || b.branchname || b.NAME || b.name || b.BRANCH_NAME || b.Branch_Name || b.DATA || b.data || (vals[1] as string) || (vals[0] as string) || code);
                                    return (
                                        <option key={i} value={code}>
                                            {code && name !== code ? `${code}-${name}` : name}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Year & Sem Row (Dynamic from Backend API) */}
                        <div className="form-row-2col">
                            <div className="form-group">
                                <label>Year & Sem</label>
                                <select
                                    className="form-control-custom"
                                    value={selectedYear}
                                    onChange={(e) => handleYearChange(e.target.value)}
                                >
                                    <option value="">Select Year</option>
                                    {years.map((y: any, i: number) => {
                                        const vals = typeof y === "object" && y !== null ? Object.values(y) : [y];
                                        const code = typeof y === "string" || typeof y === "number" ? y : (y.ID || y.id || y.Year || y.YEAR || y.year || y.STDYEAR || y.StdYear || y.stdyear || y.STUDYINGYEAR || y.StudyingYear || (vals[0] as string) || "");
                                        const text = typeof y === "string" || typeof y === "number" ? y : (y.DATA || y.data || y.Year || y.YEAR || y.year || (vals[1] as string) || (vals[0] as string) || code);
                                        return (
                                            <option key={i} value={code.toString()}>
                                                {text}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>&nbsp;</label>
                                <select
                                    className="form-control-custom"
                                    value={selectedSemester}
                                    onChange={(e) => handleSemesterChange(e.target.value)}
                                >
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                </select>
                            </div>
                        </div>

                        {/* Section & Stream Row (Dynamic from Backend API) */}
                        <div className="form-row-2col">
                            <div className="form-group">
                                <label>Section & Stream</label>
                                <select
                                    className="form-control-custom"
                                    value={selectedSection}
                                    onChange={(e) => handleSectionChange(e.target.value)}
                                >
                                    <option value="">Select Section</option>
                                    {sections.map((sec: any, i: number) => {
                                        const vals = typeof sec === "object" && sec !== null ? Object.values(sec) : [sec];
                                        const secVal = typeof sec === "string" ? sec : (sec.SECTIONNAME || sec.sectionname || sec.SectionName || sec.SECTION || sec.Section || sec.section || sec.SEC || sec.Sec || sec.sec || (vals[0] as string) || "");
                                        return (
                                            <option key={i} value={secVal}>
                                                {secVal}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>&nbsp;</label>
                                <select
                                    className="form-control-custom"
                                    value={selectedStream}
                                    onChange={(e) => setSelectedStream(e.target.value)}
                                    disabled
                                >
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                </select>
                            </div>
                        </div>

                        {/* Subject Name (Dynamic from Backend API) */}
                        <div className="form-group">
                            <label>Subject Name</label>
                            <select
                                className="form-control-custom"
                                value={selectedSubject}
                                onChange={(e) => handleSubjectChange(e.target.value)}
                            >
                                <option value="">Select Subject</option>
                                {subjects.map((sub: any, i: number) => {
                                    const vals = typeof sub === "object" && sub !== null ? Object.values(sub) : [sub];
                                    const code = typeof sub === "string" ? sub : (sub.SUB_CODE || sub.sub_code || sub.SubjectCode || sub.SUBJECTCODE || sub.subjectcode || sub.SUBCODE || sub.SubCode || sub.subcode || sub.SUBJECT || sub.Subject || sub.code || (vals[0] as string) || "");
                                    const name = typeof sub === "string" ? sub : (sub.Subject || sub.subject || sub.SubjectName || sub.SUBJECTNAME || sub.subjectname || sub.SUBNAME || sub.SubName || sub.subname || sub.NAME || sub.name || (vals[1] as string) || (vals[0] as string) || code);
                                    return (
                                        <option key={i} value={code}>
                                            {code && name !== code ? `${code}--${name}` : name}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Mid Types (Dynamic from Backend API) */}
                        <div className="form-group">
                            <label>Mid Types</label>
                            <select
                                className="form-control-custom"
                                value={selectedMidType}
                                onChange={(e) => handleMidTypeChange(e.target.value)}
                            >
                                <option value="">Select Midtype</option>
                                {midTypes.map((mt: any, i: number) => {
                                    if (!mt) return null;
                                    if (typeof mt === "string") {
                                        return (
                                            <option key={i} value={mt}>
                                                {mt}
                                            </option>
                                        );
                                    }

                                    const explicit = mt.MidType_Id || mt.MIDTYPE_ID || mt.MidType || mt.MIDTYPE || mt.midType || mt.midtype || mt.ExamType || mt.EXAMTYPE || mt.examtype || mt.Exams || mt.EXAMS || mt.MID_TYPE || mt.Mid_Type;
                                    let displayName = explicit ? explicit.toString() : "";

                                    if (!displayName && typeof mt === "object") {
                                        const vals = Object.values(mt).map(v => (v ?? "").toString());
                                        const cleanSubj = (selectedSubject || "").split("-")[0].trim();
                                        const nonSubj = vals.find(v => v !== "" && v !== selectedSubject && v !== cleanSubj);
                                        displayName = nonSubj || vals[1] || vals[0] || "";
                                    }

                                    return (
                                        <option key={i} value={displayName}>
                                            {displayName}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* MaxMarks & MinMarks Row (Dynamic from Backend API) */}
                        <div className="form-group">
                            <label>MaxMarks & MinMarks</label>
                            <div className="form-row-2col">
                                <input
                                    type="text"
                                    className="form-control-custom"
                                    value={maxMarks}
                                    readOnly
                                />
                                <input
                                    type="text"
                                    className="form-control-custom"
                                    value={minMarks}
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* Save All Button */}
                        <button
                            className="btn-save-primary"
                            onClick={handleSaveAll}
                            disabled={saving || loading || students.length === 0}
                            style={{ marginTop: "12px" }}
                        >
                            {saving ? (
                                <>
                                    <RefreshCw className="loading-spinner" size={18} />
                                    <span>Saving Marks...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>Save All</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Right Column: Student Marks Grid Roster */}
                <div className="marks-card">
                    <div className="marks-card-header">
                        <div className="marks-card-title">
                            <Users size={18} />
                            <span>Student Marks Roster</span>
                        </div>
                        <span className="status-badge status-badge-green">
                            Total Students: {students.length}
                        </span>
                    </div>

                    <div className="marks-card-body">
                        {loading ? (
                            <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
                                <RefreshCw className="loading-spinner" size={32} style={{ marginBottom: "12px" }} />
                                <div>Fetching student marks record...</div>
                            </div>
                        ) : students.length === 0 ? (
                            <div className="dbs-empty-state" style={{ textAlign: "center", padding: "60px 20px" }}>
                                <FileText size={48} style={{ color: "#cbd5e1", marginBottom: "12px" }} />
                                <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#475569" }}>No Student Marks Loaded</div>
                                <div style={{ fontSize: "0.875rem", color: "#94a3b8", marginTop: "4px" }}>
                                    Select Programme, Branch, Year, Sem, Section, Subject Name and Mid Type to display the student list.
                                </div>
                            </div>
                        ) : (
                            <div className="table-responsive-custom">
                                <table className="marks-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: "60px" }}>SNo.</th>
                                            <th>RegistrationNo</th>
                                            <th style={{ width: "160px", textAlign: "center" }}>Marks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((st, idx) => {
                                            const isAB = st.Marks === "AB";
                                            return (
                                                <tr key={idx}>
                                                    <td>{idx + 1}</td>
                                                    <td>
                                                        <strong style={{ color: "#2563eb" }}>{st.RegistrationNo || st.REGNO}</strong>
                                                    </td>
                                                    <td style={{ textAlign: "center" }}>
                                                        <input
                                                            ref={(el) => { inputRefs.current[idx] = el; }}
                                                            type="text"
                                                            className={`marks-input ${isAB ? "abnormal-ab" : ""}`}
                                                            value={st.Marks ?? ""}
                                                            onChange={(e) => handleMarkChange(idx, e.target.value)}
                                                            onKeyDown={(e) => handleKeyDown(e, idx)}
                                                            maxLength={5}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarksEntry;
