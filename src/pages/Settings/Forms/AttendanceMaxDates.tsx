import React, { useEffect, useState } from "react";
import { Save, RotateCcw, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import "./AttendanceMaxDates.css";
import { getProgramme, getYear } from "../../../apis/Common";
import {
  loadAttendanceMaxDates,
  saveAttendanceMaxDates,
} from "../../../apis/SettingsApis";

interface AttendanceRecord {
  cOURSE: string;
  yEAR: string;
  sEM: string;
  fROMDATE: string;
  tODATE: string;
  aCADEMICYEAR: string;
}

const AttendanceMaxDates = () => {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedFromDate, setSelectedFromDate] = useState("");
  const [selectedToDate, setSelectedToDate] = useState("");
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);

  const handleReset = () => {
    setSelectedCourse("");
    setSelectedYear("");
    setSelectedSemester("");
    setSelectedFromDate("");
    setSelectedToDate("");
    setYears([]);
  };

  const handleSave = async () => {
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

    if (!selectedFromDate) {
      toast.error("Please select From Date");
      return;
    }

    if (!selectedToDate) {
      toast.error("Please select To Date");
      return;
    }

    if (new Date(selectedFromDate) > new Date(selectedToDate)) {
      toast.error("From Date should not be greater than To Date");
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData?.userId || "";
      if (!userId) {
        toast.error("User ID not found");
        return;
      }

      const payload = {
        academicYear: localStorage.getItem("academicYear") || "2026-2027",
        course: selectedCourse,
        year: selectedYear,
        sem: selectedSemester,
        fromDate: selectedFromDate,
        toDate: selectedToDate,
        userid: userId,
      };

      const response = await saveAttendanceMaxDates(payload);

      if (response?.message === "Success" || response?.rowsAffected > 0) {
        const selectedCourseName =
          programmes.find((item) => item.COURSECODE === selectedCourse)
            ?.COURSE || selectedCourse;

        const selectedYearName =
          years.find((item) => String(item.ID) === selectedYear)?.DATA ||
          selectedYear;

        const newRecord: AttendanceRecord = {
          cOURSE: selectedCourseName,
          yEAR: selectedYearName,
          sEM: selectedSemester,
          fROMDATE: new Date(selectedFromDate).toLocaleDateString("en-GB"),
          tODATE: new Date(selectedToDate).toLocaleDateString("en-GB"),
          aCADEMICYEAR: localStorage.getItem("academicYear") || "",
        };

        setAttendanceList((prev) => [...prev, newRecord]);
        toast.success("Attendance Maximum Date saved successfully");
        handleReset();
      } else {
        toast.error("Failed to save Attendance Maximum Date");
      }
    } catch (error) {
      console.error("Save Attendance Error", error);
      toast.error("Something went wrong!");
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
        return;
      }
      const response = await getYear(programme);
      setYears(response || []);
    } catch (error) {
      console.error("Year Error", error);
      setYears([]);
    }
  };

  const fetchAttendanceMaxDates = async (course = "", year = "", sem = "") => {
    try {
      const payload = {
        academicYear: localStorage.getItem("academicYear") || "",
        course,
        year,
        sem,
      };
      const response = await loadAttendanceMaxDates(payload);
      setAttendanceList(response || []);
    } catch (error) {
      console.error("Load Attendance Error", error);
      setAttendanceList([]);
    }
  };

  useEffect(() => {
    fetchProgrammes();
    fetchAttendanceMaxDates();
  }, []);

  useEffect(() => {
    fetchAttendanceMaxDates(selectedCourse, selectedYear, selectedSemester);
  }, [selectedCourse, selectedYear, selectedSemester]);

  useEffect(() => {
    if (selectedCourse) {
      fetchYears(selectedCourse);
    } else {
      setYears([]);
      setSelectedYear("");
    }
  }, [selectedCourse]);

  return (
    <div className="dbs-attendance-max-container">
      <div className="dbs-attendance-max-header">
        <div>
          <h2>Attendance Maximum Dates</h2>
          <p className="dbs-attendance-max-subtitle">
            Configure maximum attendance date limits
          </p>
        </div>
      </div>

      <div className="dbs-attendance-max-form-card">
        <h3>Attendance Date Configuration</h3>
        <div className="dbs-attendance-max-grid">
          <div className="dbs-attendance-max-input">
            <label>Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setSelectedYear("");
              }}
            >
              <option value="">Select Course</option>
              {programmes.map((item) => (
                <option key={item.CID} value={item.COURSECODE}>
                  {item.COURSE}
                </option>
              ))}
            </select>
          </div>

          <div className="dbs-attendance-max-input">
            <label>Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">Select Year</option>
              {years.map((item, index) => (
                <option key={index} value={item.ID}>
                  {item.DATA}
                </option>
              ))}
            </select>
          </div>

          <div className="dbs-attendance-max-input">
            <label>Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <option value="">Select Semester</option>
              <option value="1">I</option>
              <option value="2">II</option>
            </select>
          </div>

          <div className="dbs-attendance-max-input">
            <label>From Date</label>
            <input
              type="date"
              value={selectedFromDate}
              onChange={(e) => setSelectedFromDate(e.target.value)}
            />
          </div>

          <div className="dbs-attendance-max-input">
            <label>To Date</label>
            <input
              type="date"
              value={selectedToDate}
              onChange={(e) => setSelectedToDate(e.target.value)}
            />
          </div>
        </div>

        <div className="dbs-attendance-max-actions">
          <button
            className="dbs-attendance-max-reset-btn"
            onClick={handleReset}
          >
            <X size={16} />
            Cancel
          </button>

          <button className="dbs-attendance-max-save-btn" onClick={handleSave}>
            <Save size={16} />
            Save
          </button>
        </div>
      </div>

      <div className="dbs-attendance-max-table-header">
        <div>
          <h2>Attendance Maximum Dates</h2>
          <p className="dbs-attendance-max-subtitle">
            Configure maximum attendance date limits
          </p>
        </div>
      </div>

      <div className="dbs-attendance-max-table-container">
        {attendanceList.length === 0 ? (
          <div className="dbs-empty-state">
            <AlertCircle className="dbs-empty-state-icon" />
            <div className="dbs-empty-state-title">No records found</div>
            <div className="dbs-empty-state-desc">
              Add an attendance maximum date to view records here.
            </div>
          </div>
        ) : (
          <div className="dbs-table-card">
            <div className="dbs-table-scroll active-scroll">
              <table className="dbs-data-table">
                <thead>
                  <tr>
                    <th>SL.NO</th>
                    <th>COURSE</th>
                    <th>YEAR</th>
                    <th>SEMESTER</th>
                    <th>FROM DATE</th>
                    <th>TO DATE</th>
                    <th>ACADEMIC YEAR</th>
                  </tr>
                </thead>

                <tbody>
                  {attendanceList.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.cOURSE}</td>
                      <td>{item.yEAR}</td>
                      <td>{item.sEM === "1" ? "I" : "II"}</td>
                      <td>{item.fROMDATE}</td>
                      <td>{item.tODATE}</td>
                      <td>{item.aCADEMICYEAR}</td>
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

export default AttendanceMaxDates;
