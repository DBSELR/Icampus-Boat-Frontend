import React, { useEffect, useState } from "react";
import { Save, X, Pencil, RotateCcw } from "lucide-react";
import "./InternalMarksAllowedDate.css";
import {
  bindInternalDates,
  bindInternalDatesflag2,
  bindRegulation,
  getMidTypeMaster,
  saveInternalDates,
} from "../../../apis/SettingsApis";
import { getProgramme, getYear } from "../../../apis/Common";
import { toast } from "sonner";

const InternalMarksAllowedDate = () => {
  const [regulations, setRegulations] = useState<any[]>([]);
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [selectedRegulation, setSelectedRegulation] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [years, setYears] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [midTypes, setMidTypes] = useState<any[]>([]);
  const [selectedMidTypes, setSelectedMidTypes] = useState<string[]>([]);
  const [showMidTypeDropdown, setShowMidTypeDropdown] = useState(false);
  const [examType, setExamType] = useState("");
  const [table1Data, setTable1Data] = useState<any[]>([]);
  const [table2Data, setTable2Data] = useState<any[]>([]);
  const [lastDate, setLastDate] = useState("");
  const [displayDate, setDisplayDate] = useState("");

  const handleMidTypeChange = (value: string) => {
    setSelectedMidTypes((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  const semesters = [
    { value: "1", label: "I" },
    { value: "2", label: "II" },
  ];

  const fetchTable1Data = async () => {
    try {
      const academicYear = localStorage.getItem("academicYear");
      const payload = {
        academicYear: academicYear,
        programme: "",
        year: "",
        semester: "",
        midType: "",
        regu: "",
      };

      const response = await bindInternalDates(payload);
      setTable1Data(response || []);
    } catch (error) {
      console.error("Bind Internal Dates Error", error);
      setTable1Data([]);
    }
  };

  const fetchTable2Data = async () => {
    try {
      const academicYear = localStorage.getItem("academicYear");

      const payload = {
        academicYear: academicYear,
        programme: "",
        year: "",
        semester: "",
        midType: "",
        regu: "",
      };
      const response = await bindInternalDatesflag2(payload);
      setTable2Data(response || []);
    } catch (error) {
      console.error("Bind Internal Dates Flag2 Error", error);
      setTable2Data([]);
    }
  };

  const fetchRegulations = async () => {
    try {
      const response = await bindRegulation();
      setRegulations(response || []);
    } catch (error) {
      console.error("Bind Regulation Error", error);
      setRegulations([]);
    }
  };

  const fetchProgrammes = async () => {
    try {
      const response = await getProgramme();
      setProgrammes(response || []);
    } catch (error) {
      console.error("Programme Error", error);
      setProgrammes([]);
    }
  };

  const fetchYears = async (programme: string) => {
    try {
      if (!programme) {
        setYears([]);
        setSelectedYear("");
        return;
      }
      const response = await getYear(programme);
      setYears(response || []);
    } catch (error) {
      console.error("Year Error", error);
      setYears([]);
    }
  };

  const fetchMidTypes = async () => {
    try {
      const response = await getMidTypeMaster();
      setMidTypes(response || []);
    } catch (error) {
      console.error("Mid Type Error", error);
      setMidTypes([]);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleSave = async () => {
    // Validation
    if (!selectedRegulation) {
      toast.error("Please select Regulation");
      return;
    }

    if (!selectedCourse) {
      toast.error("Please select Course");
      return;
    }

    if (!selectedYear) {
      toast.error("Please select Year");
      return;
    }

    if (!selectedSemester) {
      toast.error("Please select Semester");
      return;
    }

    if (!lastDate) {
      toast.error("Please select Last Date");
      return;
    }

    if (!displayDate) {
      toast.error("Please select Display Date");
      return;
    }

    if (selectedMidTypes.length === 0) {
      toast.error("Please select at least one Mid Type");
      return;
    }

    if (!examType) {
      toast.error("Please select Exam Type");
      return;
    }
    try {
      const academicYear = localStorage.getItem("academicYear");

      // Save one record for each selected Mid Type
      for (const mid of selectedMidTypes) {
        const payload = {
          academicYear,
          programme: selectedCourse,
          year: selectedYear,
          semester: selectedSemester,
          midType: mid,
          date: formatDate(lastDate),
          examTypes: examType === "ObjectiveMarks-1" ? "1" : "2",
          displayDate: formatDate(displayDate),
          regu: selectedRegulation,
        };
        const response = await saveInternalDates(payload);

        if (response?.message === "Success" || response?.rowsAffected > 0) {
          toast.success("Internal Dates saved successfully");
          // Refresh table after all records are saved
          if (examType === "ObjectiveMarks-1") {
            await fetchTable1Data();
          } else if (examType === "ObjectiveMarks-2") {
            await fetchTable2Data();
          }
          // Clear form
          setSelectedRegulation("");
          setSelectedCourse("");
          setSelectedYear("");
          setSelectedSemester("");
          setSelectedMidTypes([]);
          setExamType("");
          setLastDate("");
          setDisplayDate("");
        } else {
          toast.error("Failed to save Attendance Maximum Date");
        }
      }
    } catch (error) {
      console.error("Save Internal Dates Error", error);
      toast.error("Something went wrong!");
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      fetchYears(selectedCourse);
    } else {
      setYears([]);
      setSelectedYear("");
    }
  }, [selectedCourse]);

  useEffect(() => {
    fetchRegulations();
    fetchProgrammes();
    fetchMidTypes();
    fetchTable1Data();
    fetchTable2Data();
  }, []);

  return (
    <div className="dbs-imad-container">
      <div className="dbs-attendance-header">
        <div>
          <h2>Internal Dates Master</h2>
          <p className="dbs-imad-subtitle">
            Configure internal marks submission and display date limits
          </p>
        </div>
      </div>

      <div className="dbs-form-card">
        <h3>Internal Marks Allowed Date Configuration</h3>

        <div className="dbs-imad-form-grid">
          {/* Regulation */}
          <div className="dbs-imad-field">
            <label>Regulation</label>
            <select
              value={selectedRegulation}
              onChange={(e) => setSelectedRegulation(e.target.value)}
            >
              <option value="">Select Regulation</option>
              {regulations.map((item: any, index: number) => (
                <option
                  key={index}
                  value={item.REGULATION ?? item.regulation ?? item.ID}
                >
                  {item.REGULATION ?? item.regulation}
                </option>
              ))}
            </select>
          </div>

          {/* Course */}
          <div className="dbs-imad-input-box">
            <label>Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Select Programme</option>
              {programmes.map((item: any, index: number) => (
                <option
                  key={index}
                  value={item.COURSECODE ?? item.COURSE_CODE ?? item.ID}
                >
                  {item.COURSE ?? item.PROGRAMME ?? item.NAME}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div className="dbs-imad-input-box">
            <label>Year</label>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">Select Year</option>
              {years.map((item: any, index: number) => (
                <option key={index} value={item.ID ?? item.id}>
                  {item.DATA ?? item.YEAR ?? item.year}
                </option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div className="dbs-imad-input-box">
            <label>Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <option value="">Select Semester</option>
              {semesters.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Last Date */}
          <div className="dbs-imad-input-box">
            <label>Last Date</label>
            <input
              type="date"
              value={lastDate}
              onChange={(e) => setLastDate(e.target.value)}
            />
          </div>

          {/* Display Date */}
          <div className="dbs-imad-input-box">
            <label>Display Date</label>
            <input
              type="date"
              value={displayDate}
              onChange={(e) => setDisplayDate(e.target.value)}
            />
          </div>

          {/* Mid Type */}
          <div className="dbs-imad-input-box">
            <label>Mid Type</label>
            <div className="mid-type-wrapper">
              <div
                className="mid-type-select"
                onClick={() => setShowMidTypeDropdown(!showMidTypeDropdown)}
              >
                {selectedMidTypes.length > 0
                  ? selectedMidTypes.length > 3
                    ? `${selectedMidTypes.slice(0, 3).join(", ")} ...`
                    : selectedMidTypes.join(", ")
                  : "Select Mid Type"}

                <span>▼</span>
              </div>

              {showMidTypeDropdown && (
                <div className="mid-type-options">
                  {midTypes.map((item: any, index: number) => (
                    <label key={index} className="mid-type-option">
                      <input
                        type="checkbox"
                        checked={selectedMidTypes.includes(item.midType)}
                        onChange={() => handleMidTypeChange(item.midType)}
                      />
                      <span>{item.midType}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Exam Type */}
          <div className="dbs-imad-checkbox-row">
            <label>
              <input
                type="checkbox"
                checked={examType === "ObjectiveMarks-1"}
                onChange={() =>
                  setExamType(
                    examType === "ObjectiveMarks-1" ? "" : "ObjectiveMarks-1",
                  )
                }
              />
              Exam Type 1
            </label>
            <label>
              <input
                type="checkbox"
                checked={examType === "ObjectiveMarks-2"}
                onChange={() =>
                  setExamType(
                    examType === "ObjectiveMarks-2" ? "" : "ObjectiveMarks-2",
                  )
                }
              />
              Exam Type 2
            </label>
          </div>
        </div>

        <div className="dbs-imad-actions">
          <button
            type="button"
            className="dbs-imad-secondary-btn"
            onClick={() => {
              setSelectedRegulation("");
              setSelectedCourse("");
              setSelectedYear("");
              setSelectedSemester("");
              setSelectedMidTypes([]);
              setExamType("");
              setLastDate("");
              setDisplayDate("");
            }}
          >
            <X size={18} />
            Cancel
          </button>

          <button
            type="button"
            className="dbs-imad-primary-btn"
            onClick={handleSave}
          >
            <Save size={18} />
            Save
          </button>
        </div>
      </div>

      <div className="dbs-programme-form-header dbs-table-head">
        <div>
          <h2>Internal Marks Allowed Dates</h2>
          <p className="dbs-page-subtitle">
            Configure internal marks submission and display date limits
          </p>
        </div>
      </div>

      <div className="dbs-table-card">
        <div className="dbs-imad-scroll">
          {/* Exam Type 1 Table */}
          <div className="dbs-table-section">
            <div className="table-title-row">
              <h3>Exam Type 1 Dates</h3>
              {/* <span className="table-count">Records: {table1Data.length}</span> */}
            </div>
            <div className="dbs-imad-table-scroll">
              <table className="dbs-imad-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Course</th>
                    <th>Year</th>
                    <th>Semester</th>
                    <th>Last Date</th>
                    <th>Display Date</th>
                    <th>Exam Type</th>
                  </tr>
                </thead>

                <tbody>
                  {table1Data.length > 0 ? (
                    table1Data.map((row, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{row.cOURSE}</td>
                        <td>{row.yEAR}</td>
                        <td>{row.sEMESTER}</td>
                        <td>{row.lASTDATE}</td>
                        <td>{row.dISPLAYDATE}</td>
                        <td>{row.eXAMTYPE}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="dbs-no-data">
                        No Exam Type 1 Data Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Exam Type 2 Table */}
          <div className="dbs-table-section">
            <div className="table-title-row">
              <h3>Exam Type 2 Dates</h3>
              {/* <span className="table-count">Records: {table2Data.length}</span> */}
            </div>
            <div className="dbs-imad-table-scroll">
              <table className="dbs-imad-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Course</th>
                    <th>Year</th>
                    <th>Semester</th>
                    <th>Last Date</th>
                    <th>Display Date</th>
                    <th>Exam Type</th>
                  </tr>
                </thead>

                <tbody>
                  {table2Data.length > 0 ? (
                    table2Data.map((row, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{row.cOURSE}</td>
                        <td>{row.yEAR}</td>
                        <td>{row.sEMESTER}</td>
                        <td>{row.lASTDATE}</td>
                        <td>{row.dISPLAYDATE}</td>
                        <td>{row.eXAMTYPE}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="dbs-no-data">
                        No Exam Type 2 Data Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternalMarksAllowedDate;
