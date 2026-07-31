import React, { useEffect, useState } from "react";
import "./PeriodSettings.css";
import {
  getPeriodTimeList,
  getProgramme,
  getYear,
  savePeriodTime,
} from "../../../apis/Common";
import { toast } from "sonner";

const periods = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

const PeriodSettings = () => {
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [selectedProgramme, setSelectedProgramme] = useState("");

  const [years, setYears] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState("");

  const [periodList, setPeriodList] = useState<any[]>([]);

  const [morningSession, setMorningSession] = useState(0);
  const [afternoonSession, setAfternoonSession] = useState(0);

  const [selectedShift, setSelectedShift] = useState("");

  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState("");

  const [periodTimings, setPeriodTimings] = useState<{ [key: string]: string }>(
    {
      t1: "",
      t2: "",
      t3: "",
      t4: "",
      t5: "",
      t6: "",
      t7: "",
      t8: "",
      t9: "",
    },
  );

  const totalSessions = morningSession + afternoonSession;

  const fetchProgrammes = async () => {
    try {
      const response = await getProgramme();
      setProgrammes(response || []);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchYears = async (programme: string) => {
    try {
      if (!programme) return;
      const response = await getYear(programme);
      setYears(response || []);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchPeriodTimeList = async (programme: string) => {
    try {
      if (!programme) return;

      const response = await getPeriodTimeList(programme);

      setPeriodList(response || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSave = async () => {
    try {
      // Required field validations
      if (!selectedShift) {
        toast.error("Please select Shift");
        return;
      }

      if (!selectedProgramme) {
        toast.error("Please select Programme");
        return;
      }

      if (!selectedYear) {
        toast.error("Please select Year");
        return;
      }

      if (morningSession === 0 && afternoonSession === 0) {
        toast.error("Please enter Morning or Afternoon Session");
        return;
      }

      // Validate timings based on selected sessions
      const missingPeriods = [];

      for (let i = 1; i <= totalSessions; i++) {
        if (!periodTimings[`t${i}`]?.trim()) {
          missingPeriods.push(periods[i - 1]);
        }
      }

      if (missingPeriods.length > 0) {
        toast.error(
          `Please enter timing for period(s): ${missingPeriods.join(", ")}`,
        );
        return;
      }

      const academicYear = localStorage.getItem("academicYear");

      const payload = {
        id: isEditMode ? String(editId) : "",
        shiftNo: selectedShift,
        programme: selectedProgramme,
        morningSession: String(morningSession),
        afternoonSession: String(afternoonSession),

        t1: periodTimings.t1,
        t2: periodTimings.t2,
        t3: periodTimings.t3,
        t4: periodTimings.t4,
        t5: periodTimings.t5,
        t6: periodTimings.t6,
        t7: periodTimings.t7,
        t8: periodTimings.t8,
        t9: periodTimings.t9,

        academicYear,
        year: selectedYear,
      };

      console.log("Save Payload:", payload);

      const response = await savePeriodTime(payload);

      console.log("Save Response:", response);

      if (response?.message === "Success" && response?.rowsAffected > 0) {
        toast.success(
          isEditMode
            ? "Period updated successfully"
            : "Period saved successfully",
        );

        if (selectedProgramme) {
          await fetchPeriodTimeList(selectedProgramme);
        }

        // Reset form
        setIsEditMode(false);
        setEditId("");

        setSelectedShift("");
        setSelectedProgramme("");
        setSelectedYear("");

        setMorningSession(0);
        setAfternoonSession(0);

        setYears([]);

        setPeriodTimings({
          t1: "",
          t2: "",
          t3: "",
          t4: "",
          t5: "",
          t6: "",
          t7: "",
          t8: "",
          t9: "",
        });
      } else {
        toast.error(
          isEditMode
            ? "Failed to update the period!"
            : "Failed to save the period!",
        );
      }
    } catch (error) {
      console.log(error);

      toast.error("Something went wrong!");
    }
  };

  const handleCancel = () => {
    setSelectedShift("");
    setSelectedProgramme("");
    setSelectedYear("");

    setYears([]);
    setMorningSession(0);
    setAfternoonSession(0);

    setPeriodList([]);

    setIsEditMode(false);
    setEditId("");
  };

  const handleMorningSessionChange = (value: number) => {
    const total = value + afternoonSession;

    if (total > periods.length) {
      toast.error("You can't add more than 9 periods");
      return;
    }

    setMorningSession(value);
  };

  const handleAfternoonSessionChange = (value: number) => {
    const total = morningSession + value;

    if (total > periods.length) {
      toast.error("You can't add more than 9 periods");
      return;
    }

    setAfternoonSession(value);
  };

  const handleEdit = async (item: any) => {
    setIsEditMode(true);

    setEditId(String(item.id));

    setSelectedShift(String(item.shiftNo));

    const programmeCode = item.programme.split("-")[0];

    setSelectedProgramme(programmeCode);

    setMorningSession(Number(item.morningSession));
    setAfternoonSession(Number(item.afternoonSession));

    const yearResponse = await getYear(programmeCode);
    setYears(yearResponse || []);

    setSelectedYear(String(item.psYear));

    // Convert periods_all into t1-t9
    const timingArray = item.periods_all ? item.periods_all.split("*") : [];

    setPeriodTimings({
      t1: timingArray[0] || "",
      t2: timingArray[1] || "",
      t3: timingArray[2] || "",
      t4: timingArray[3] || "",
      t5: timingArray[4] || "",
      t6: timingArray[5] || "",
      t7: timingArray[6] || "",
      t8: timingArray[7] || "",
      t9: timingArray[8] || "",
    });

    toast.success("Record loaded for editing");
  };

  const handleTimingChange = (key: string, value: string) => {
    setPeriodTimings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    if (selectedProgramme) {
      fetchYears(selectedProgramme);
      fetchPeriodTimeList(selectedProgramme);
    } else {
      setYears([]);
      setPeriodList([]);
    }
  }, [selectedProgramme]);

  useEffect(() => {
    fetchProgrammes();
  }, []);

  return (
    <div className="dbs-period-container">
      {/* Page Header */}
      <div className="dbs-period-header">
        <h2>Period Settings</h2>
      </div>
      <div className="dbs-period-container">
        <div className="dbs-period-card">
          {/* Header */}
          <div className="dbs-period-head">
            <h3>Period Settings</h3>
            <div className="dbs-period-body">
              <div className="dbs-period-content">
                {/* Left Section */}
                <div className="dbs-period-form">
                  <div className="dbs-period-field">
                    <label>Shift</label>
                    <select
                      className="dbs-period-select"
                      value={selectedShift}
                      disabled={isEditMode}
                      onChange={(e) => setSelectedShift(e.target.value)}
                    >
                      <option value="">Select Shift</option>
                      <option value="1">Shift-1</option>
                      <option value="2">Shift-2</option>
                    </select>
                  </div>

                  <div className="dbs-period-field">
                    <label>Programme</label>

                    <select
                      value={selectedProgramme}
                      disabled={isEditMode}
                      onChange={(e) => setSelectedProgramme(e.target.value)}
                    >
                      <option value="">Select Programme</option>

                      {programmes.map((item, index) => (
                        <option key={index} value={item.COURSECODE}>
                          {item.COURSE}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="dbs-period-field">
                    <label>Year</label>

                    <select
                      value={selectedYear}
                      disabled={isEditMode}
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
                  <div className="dbs-period-field">
                    <label>Morning Session</label>
                    <input
                      type="number"
                      min="0"
                      value={morningSession}
                      onChange={(e) =>
                        handleMorningSessionChange(
                          Math.max(0, Number(e.target.value)),
                        )
                      }
                      className="dbs-period-input"
                    />
                  </div>

                  <div className="dbs-period-field">
                    <label>Afternoon Session</label>
                    <input
                      type="number"
                      min="0"
                      value={afternoonSession}
                      onChange={(e) =>
                        handleAfternoonSessionChange(
                          Math.max(0, Number(e.target.value)),
                        )
                      }
                      className="dbs-period-input"
                    />
                  </div>
                </div>

                {/* Right Section */}
                <div className="dbs-period-timings">
                  <h3>Period Timings (9:00 - 10:00)</h3>

                  <div className="dbs-period-grid">
                    {Array.from({ length: totalSessions }).map((_, index) => {
                      const timingKey = `t${index + 1}`;

                      return (
                        <div className="dbs-period-slot" key={timingKey}>
                          <div className="dbs-period-number">
                            {periods[index]}
                          </div>

                          <div className="dbs-period-input-wrapper">
                            <input
                              id={timingKey}
                              type="text"
                              className="dbs-period-time-input"
                              placeholder="09:00 - 10:00"
                              value={periodTimings[timingKey]}
                              onChange={(e) =>
                                handleTimingChange(timingKey, e.target.value)
                              }
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="dbs-period-actions">
                <button
                  className="dbs-period-cancel-btn"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button className="dbs-period-save-btn" onClick={handleSave}>
                  {isEditMode ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="dbs-programme-form-header dbs-table-head">
          <div>
            <h2>Period Settings Registry</h2>
            <p className="dbs-page-subtitle">
              Manage programme period configurations
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="dbs-period-table-scroll">
          <table className="dbs-period-table">
            <thead>
              <tr>
                <th>Shift No</th>
                <th>Programme</th>
                <th>Year</th>
                <th>Morning Session</th>
                <th>Afternoon Session</th>
                <th>Total Periods</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {periodList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center" }}>
                    No data found.
                  </td>
                </tr>
              ) : (
                periodList.map((item, index) => (
                  <tr key={index}>
                    <td>{item.shiftNo}</td>
                    <td>{item.programme}</td>
                    <td>{item.psYear}</td>
                    <td>{item.morningSession}</td>
                    <td>{item.afternoonSession}</td>
                    <td>{item.totalPeriods}</td>
                    <td>
                      <button
                        className="dbs-period-edit-btn"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PeriodSettings;
