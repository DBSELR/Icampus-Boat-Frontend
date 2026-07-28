import React, { useEffect, useState } from "react";
import { Save, AlertCircle, Edit, Trash, Trash2 } from "lucide-react";
import "./FacultyMaster.css";

import {
  deleteFaculty,
  getCourseList,
  getDept,
  getEmployeeList,
  getFaculty,
  getSubjects,
  getYearLists,
  saveFaculty,
} from "../../../apis/SettingsApis";
import { toast } from "sonner";
import DeleteModal from "../../../common/DeleteModal";

const FacultyMaster = () => {
  const sortedStudents: any[] = [];

  const [courses, setCourses] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);

  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);

  const [selectedProgramme, setSelectedProgramme] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

  const [departments, setDepartments] = useState<any[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const [faculties, setFaculties] = useState<any[]>([]);
  const [loadingFaculties, setLoadingFaculties] = useState(false);

  const [selectedFaculty, setSelectedFaculty] = useState("");

  const [subjects, setSubjects] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const [facultyData, setFacultyData] = useState<any[]>([]);
  const [loadingFacultyData, setLoadingFacultyData] = useState(false);

  const [selectedSubject, setSelectedSubject] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const getLoginId = () => {
    const user = localStorage.getItem("user");
    if (user) {
      return JSON.parse(user).userId;
    }
    return "";
  };

  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);

      const payload = {
        programme: selectedProgramme,
        semister: selectedSemester,
        year: selectedYear,
        empId: getLoginId(),
      };

      console.log("SUBJECT PAYLOAD", payload);
      const response = await getSubjects(payload);
      console.log("SUBJECT RESPONSE", response);
      setSubjects(response || []);
    } catch (error: unknown) {
      console.error("Get Subjects Failed", error);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchCourseList = async () => {
    try {
      setLoadingCourses(true);

      const payload = {
        academicYear: localStorage.getItem("academicYear") || "2025-2026",
        department: "",
      };

      const response = await getCourseList(payload);
      console.log("COURSE LIST RESPONSE", response);
      setCourses(response || []);
    } catch (error: unknown) {
      console.error("Get Course List Failed", error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchYearsList = async () => {
    try {
      setLoadingYears(true);

      const payload = {
        academicYear: localStorage.getItem("academicYear") || "2025-2026",
        department: "",
        programme: selectedProgramme,
      };

      console.log("YEAR LIST PAYLOAD", payload);
      const response = await getYearLists(payload);
      console.log("YEAR LIST RESPONSE", response);
      setYears(response || []);
    } catch (error: unknown) {
      console.error("Get Years List Failed", error);
    } finally {
      setLoadingYears(false);
    }
  };

  const fetchDepartmentList = async () => {
    try {
      setLoadingDepartments(true);

      const payload = {
        department: "",
      };

      console.log("DEPARTMENT PAYLOAD", payload);
      const response = await getDept(payload);
      console.log("DEPARTMENT RESPONSE", response);
      setDepartments(response || []);
    } catch (error: unknown) {
      console.error("Get Department Failed", error);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const fetchEmployeeList = async () => {
    try {
      setLoadingFaculties(true);

      const payload = {
        department: selectedDepartment,
        empId: "",
        fed: "",
        workMode: "Teaching",
      };

      console.log("EMPLOYEE PAYLOAD", payload);
      const response = await getEmployeeList(payload);
      console.log("EMPLOYEE RESPONSE", response);
      setFaculties(response || []);
    } catch (error: unknown) {
      console.error("Get Employee List Failed", error);
    } finally {
      setLoadingFaculties(false);
    }
  };

  const facultyList = async () => {
    try {
      setLoadingFacultyData(true);

      const payload = {
        department: "",
        programme: selectedProgramme,
        semister: selectedSemester,
        year: selectedYear,
        faculty: selectedFaculty,
      };

      const response = await getFaculty(payload);
      console.log("Faculty response", response);
      setFacultyData(response || []);
    } catch (error) {
      console.log(error);
      setFacultyData([]);
    } finally {
      setLoadingFacultyData(false);
    }
  };

  const handleSaveFaculty = async () => {
    if (
      !selectedProgramme ||
      !selectedSemester ||
      !selectedYear ||
      !selectedDepartment ||
      !selectedFaculty ||
      !selectedSubject
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    const payload = {
      programme: selectedProgramme,
      semister: selectedSemester,
      year: selectedYear,
      department: selectedDepartment,
      subject: selectedSubject,
      faculty: selectedFaculty,
      id: "",
    };

    console.log("Save Payload", payload);

    try {
      const response = await saveFaculty(payload);
      console.log("Save Response", response);

      if (response?.rowsAffected > 0) {
        toast.success("Subject added successfully!");
        facultyList();
      } else {
        toast.error(response.message || "Failed to add the subject!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    }
  };

  const handleDeleteFaculty = async () => {
    if (!deleteItem) return;

    try {
      setDeleting(true);
      const response = await deleteFaculty(deleteItem.id);
      console.log("Delete Faculty Response:", response);

      if (response.message == "Success") {
        toast.success("Faculty deleted successfully");
        setShowDeleteModal(false);
        setDeleteItem(null);
        facultyList();
      } else {
        toast.error(response.message || "Delete failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (selectedDepartment) {
      fetchEmployeeList();
    } else {
      setFaculties([]);
    }
  }, [selectedDepartment]);

  useEffect(() => {
    fetchCourseList();

    fetchDepartmentList();
  }, []);

  useEffect(() => {
    if (
      selectedProgramme &&
      selectedYear &&
      selectedSemester &&
      selectedFaculty
    ) {
      facultyList();
    }
  }, [selectedProgramme, selectedYear, selectedSemester, selectedFaculty]);

  useEffect(() => {
    if (selectedProgramme) {
      fetchYearsList();
    } else {
      setYears([]);
    }
  }, [selectedProgramme]);

  useEffect(() => {
    if (selectedProgramme && selectedYear && selectedSemester) {
      fetchSubjects();
    } else {
      setSubjects([]);
    }
  }, [selectedProgramme, selectedYear, selectedSemester]);

  return (
    <div className="dbs-faculty-container">
      <div className="dbs-faculty-form-header">
        <h2>Faculty Master</h2>
      </div>

      <div className="dbs-form-card">
        <h3>Department Information</h3>

        <div className="dbs-form-grid-3">
          {/* LEFT FILTERS */}
          <div className="dbs-filter-card">
            {/* Programme */}
            <div className="dbs-input-box">
              <label>Programme</label>

              <select
                value={selectedProgramme}
                onChange={(e) => {
                  setSelectedProgramme(e.target.value);
                  setSelectedYear("");
                }}
              >
                <option value="">Select Programme</option>

                {courses.map((item) => (
                  <option key={item.cID} value={item.courseCode}>
                    {item.course}
                  </option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div className="dbs-input-box">
              <label>Year</label>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">Select Year</option>

                {loadingYears ? (
                  <option>Loading...</option>
                ) : (
                  years.map((item) => (
                    <option key={item.iD} value={item.iD}>
                      {item.dATA}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Semester */}
            <div className="dbs-input-box">
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

            <div className="dbs-input-box">
              <label>Department</label>

              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">Select Department</option>

                {loadingDepartments ? (
                  <option>Loading...</option>
                ) : (
                  departments.map((item) => (
                    <option
                      key={item.departmentCode}
                      value={item.departmentCode}
                    >
                      {item.description}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="dbs-input-box">
              <label>Faculty</label>

              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
              >
                <option value="">Select Faculty</option>

                {loadingFaculties ? (
                  <option>Loading...</option>
                ) : (
                  faculties.map((item) => (
                    <option key={item.eMPID} value={item.eMPID}>
                      {item.fname}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* SUBJECT LIST */}
          <div className="dbs-subject-box">
            <label>Subjects</label>

            {loadingSubjects ? (
              <div className="dbs-loading">Loading Subjects...</div>
            ) : subjects.length === 0 ? (
              <div className="dbs-empty-state">
                <AlertCircle size={30} />
                <p>No Subjects Found</p>
              </div>
            ) : (
              <div className="dbs-subject-list">
                {subjects.map((item) => (
                  <div
                    key={item.sUBJECTCODE}
                    className={`dbs-subject-item ${
                      selectedSubject === item.sUBJECTCODE ? "active" : ""
                    }`}
                    onClick={() => setSelectedSubject(item.sUBJECTCODE)}
                  >
                    <span>{item.sUBJECTCODE}</span>
                    <strong>{item.sUBJECTNAME}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ===========Table========== */}
          <div className="dbs-table-scroll">
            <table className="dbs-data-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Subject</th>
                  <th>Faculty</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loadingFacultyData ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="dbs-table-loader">
                        <div className="dbs-spinner"></div>
                        <span>Loading faculty data...</span>
                      </div>
                    </td>
                  </tr>
                ) : facultyData.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="dbs-table-empty">No Records Found</div>
                    </td>
                  </tr>
                ) : (
                  facultyData.map((item: any, index: number) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.subjectName || item.sUBJECTNAME}</td>
                      <td>{item.facultyName || item.fname}</td>
                      <td>
                        <button
                          className="dbs-delete-btn"
                          onClick={() => {
                            setDeleteItem(item);
                            setShowDeleteModal(true);
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dbs-form-actions-row">
          <button className="dbs-form-cancel-btn">Cancel / Reset</button>

          <button className="dbs-form-save-btn" onClick={handleSaveFaculty}>
            <Save size={16} />
            Save Faculty
          </button>
        </div>

        <DeleteModal
          open={showDeleteModal}
          title="Delete Faculty Assignment"
          itemName={
            deleteItem?.subjectName ||
            deleteItem?.sUBJECTNAME ||
            "Selected Faculty"
          }
          loading={deleting}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeleteItem(null);
          }}
          onConfirm={handleDeleteFaculty}
        />
      </div>
    </div>
  );
};

export default FacultyMaster;
