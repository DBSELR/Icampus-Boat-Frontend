import React, { useEffect, useState } from "react";
import { Save, AlertCircle } from "lucide-react";
import "./FacultyMaster.css";
import { getCourseList } from "../../../apis/SettingsApis";

const FacultyMaster = () => {
  const sortedStudents = [];

  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // ===============================
  // Get Course List API
  // ===============================
  const fetchCourseList = async () => {
    try {
      setLoadingCourses(true);

      const payload = {
        academicYear: localStorage.getItem("academicYear"),
        department: "",
      };

      console.log("GET COURSE LIST PAYLOAD", payload);

      const response = await getCourseList();

      console.log("GET COURSE LIST RESPONSE", response);

      setCourses(response.data || response || []);
    } catch (error) {
      console.error("Get Course List Failed", error);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    getCourseList();
  }, []);

  return (
    <div className="dbs-faculty-container">
      {/* Header */}
      <div className="dbs-faculty-form-header">
        <h2>Faculty Master</h2>
      </div>

      <div className="dbs-form-card">
        <h3>Department Information</h3>

        <div className="dbs-form-grid-3">
          {/* LEFT FILTERS */}
          <div className="dbs-filter-card">
            <div className="dbs-input-box">
              <label>Programme</label>

              <select>
                <option>Select Programme</option>

                {courses.map((item, index) => (
                  <option key={index} value={item.programme}>
                    {item.programmeName || item.programme}
                  </option>
                ))}
              </select>
            </div>

            <div className="dbs-input-box">
              <label>Year</label>

              <select>
                <option>Select Year</option>
              </select>
            </div>

            <div className="dbs-input-box">
              <label>Semester</label>

              <select>
                <option>Select Semester</option>
              </select>
            </div>

            <div className="dbs-input-box">
              <label>Department</label>

              <select>
                <option>Select Department</option>
              </select>
            </div>

            <div className="dbs-input-box">
              <label>Faculty</label>

              <select>
                <option>Select Faculty</option>
              </select>
            </div>
          </div>

          {/* SUBJECT LIST */}
          <div className="dbs-subject-box">
            <label>Subject Search</label>

            <input type="text" placeholder="Search Subject Name" />

            <select multiple className="dbs-subject-list">
              {loadingCourses ? (
                <option>Loading Subjects...</option>
              ) : courses.length === 0 ? (
                <option>No Subjects Found</option>
              ) : (
                courses.map((item, index) => (
                  <option key={index} value={item.subjectCode}>
                    {item.subjectName}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* TABLE */}
          <div className="dbs-table-container">
            {sortedStudents.length === 0 ? (
              <div className="dbs-empty-state">
                <AlertCircle className="dbs-empty-state-icon" />

                <div className="dbs-empty-state-title">No records found</div>

                <div className="dbs-empty-state-desc">
                  Select subjects and faculty to assign.
                </div>
              </div>
            ) : (
              <div className="dbs-table-card">
                <table className="dbs-data-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Faculty</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody></tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="dbs-form-actions-row">
          <button className="dbs-form-cancel-btn">Cancel / Reset</button>

          <button className="dbs-form-save-btn">
            <Save size={16} />
            Save Faculty
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacultyMaster;
