import React, { useEffect, useState } from "react";
import { Save, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import "./SectionChange.css";
import { getBranch, getProgramme, getYear } from "../../../apis/Common";
import {
  getSections,
  loadata,
  updateSection,
} from "../../../apis/AdmissionsApis";

interface Student {
  id: number;
  COURSE: string;
  GRP: string;
  SECTION: string;
  SNAME: string;
  REGNO: string;
}

interface CourseOption {
  CID: number;
  COURSECODE: string;
  COURSE: string;
  DEGREE: string;
  YEAR: number;
}

interface BranchOption {
  BID?: number;
  BRANCHID?: number;
  BRANCHCODE?: string;
  BRANCH?: string;
  BRANCHNAME?: string;
  NAME?: string;
}

interface YearsOptions {
  DATA: string;
  ID: string;
}

interface SectionsOptions {
  Section: string;
}

const SectionChange: React.FC = () => {
  const [form, setForm] = useState({
    course: "",
    branch: "",
    year: "",
    sem: "",
    section: "",
    newSection: "",
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [years, setYears] = useState<YearsOptions[]>([]);
  const [yearsLoading, setYearsLoading] = useState(false);
  const [sections, setSections] = useState<SectionsOptions[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [newsections, setNewsections] = useState<SectionsOptions[]>([]);
  const [newsectionsLoading, setNewsectionsLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const hasSelection = selectedStudents.length > 0;

  const getUserId = (): string => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        return "";
      }
      const user = JSON.parse(storedUser);
      return user?.userId || "";
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return "";
    }
  };

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await getProgramme();
      console.log("Programme Response:", response);
      setCourses(response || []);
    } catch (error) {
      console.error("Get Programme Error:", error);
      setCourses([]);
      toast.error("Unable to load courses");
    } finally {
      setCoursesLoading(false);
    }
  };

  useEffect(() => {
    const fetchBranches = async () => {
      if (!form.course) {
        setBranches([]);
        return;
      }
      try {
        setBranchesLoading(true);
        const response = await getBranch(form.course);
        console.log("Response from the branch api========", response);
        setBranches(response || []);
      } catch (error) {
        console.error("Get Branch Error:", error);
        setBranches([]);
        toast.error("Unable to load branches");
      } finally {
        setBranchesLoading(false);
      }
    };
    fetchBranches();
  }, [form.course]);

  useEffect(() => {
    const fetchYear = async () => {
      if (!form.course) {
        setYears([]);
        return;
      }
      try {
        setYearsLoading(true);
        const response = await getYear(form.course);
        console.log("Year response========", response);
        setYears(response || []);
      } catch (error) {
        console.error("Get Year Error:", error);
        toast.error("Unable to load years!");
        setYears([]);
      } finally {
        setYearsLoading(false);
      }
    };
    fetchYear();
  }, [form.course]);

  useEffect(() => {
    const fetchSections = async () => {
      if (!form.course || !form.branch || !form.year) {
        setSections([]);
        setNewsections([]);
        return;
      }
      try {
        setSectionsLoading(true);
        const response = await getSections({
          programme: form.course,
          branch: form.branch,
          syear: form.year,
        });
        console.log("Sections Response:", response);
        setSections(response?.data || []);
      } catch (error) {
        console.error("Error fetching the sections:", error);
        toast.error("Error while fetching the sections!");
      } finally {
        setSectionsLoading(false);
      }
    };
    fetchSections();
  }, [form.course, form.branch, form.year]);

  useEffect(() => {
    const fetchNewSections = async () => {
      if (!form.course || !form.branch || !form.year) {
        setSections([]);
        setNewsections([]);
        return;
      }
      try {
        setNewsectionsLoading(true);
        const response = await getSections({
          programme: form.course,
          branch: form.branch,
          syear: form.year,
        });
        console.log("Sections Response:", response);
        setNewsections(response?.data || []);
      } catch (error) {
        console.error("Error fetching the sections:", error);
        toast.error("Error while fetching the sections!");
      } finally {
        setNewsectionsLoading(false);
      }
    };
    fetchNewSections();
  }, [form.course, form.branch, form.year]);

  const fetchData = async () => {
    try {
      const academicYear = localStorage.getItem("academicYear");
      const payload = {
        programme: form.course,
        branch: form.branch,
        syear: form.year,
        semester: form.sem,
        section: form.section,
        academicYear,
      };
      console.log("Students API Payload:", payload);
      const response = await loadata(payload);
      console.log("Response loading data:", response.data);
      setStudents(response.data || []);
    } catch (error) {
      console.error("Error loading table data:", error);
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [form.course, form.branch, form.year, form.sem, form.section]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!hasSelection && form.newSection) {
      setForm((prev) => ({ ...prev, newSection: "" }));
    }
  }, [hasSelection]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "section" && hasSelection) {
      // Locked while students are selected — ignore.
      return;
    }
    if (name === "newSection" && !hasSelection) {
      // Locked until students are selected — ignore.
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "course" || name === "branch") {
      setStudents([]);
      setSelectedStudents([]);
    }
  };
  const handleReset = () => {
    setForm({
      course: "",
      branch: "",
      year: "",
      sem: "",
      section: "",
      newSection: "",
    });
    setStudents([]);
    setSelectedStudents([]);
    setBranches([]);
    setSections([]);
    setNewsections([]);
  };

  const handleStudentSelect = (regNo: string) => {
    setSelectedStudents((prev) => {
      if (prev.includes(regNo)) {
        return prev.filter((r) => r !== regNo);
      }
      return [...prev, regNo];
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((student) => student.REGNO));
    }
  };

  const handleUpdateSection = async () => {
    if (students.length === 0) {
      toast.error("Please display students first");
      return;
    }
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }
    if (!form.newSection) {
      toast.error("Please select New Section");
      return;
    }
    if (form.section === form.newSection) {
      toast.error("New Section should be different from current Section");
      return;
    }
    // Get selected course
    const selectedCourse = courses.find(
      (course) => course.COURSECODE === form.course,
    );
    if (!selectedCourse) {
      toast.error("Invalid Course selected");
      return;
    }
    // Get selected branch
    const selectedBranch = branches.find(
      (branch) => branch.BRANCHCODE === form.branch,
    );
    if (!selectedBranch) {
      toast.error("Invalid Branch selected");
      return;
    }
    // Get userId from localStorage
    let userId = "";
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        userId = user?.userId || "";
      }
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
    }
    if (!userId) {
      toast.error("User information not found. Please login again.");
      return;
    }
    // Get registration numbers directly — selectedStudents already holds REGNOs
    const regNos = selectedStudents;
    if (regNos.length === 0) {
      toast.error("Please select at least one student");
      return;
    }
    // Get academic year
    const academicYear = localStorage.getItem("academicYear") || "";
    if (!academicYear) {
      toast.error("Academic year not found");
      return;
    }
    // Create API payload
    const payload = {
      programme: String(selectedCourse.CID).padStart(2, "0"),
      branch: String(
        selectedBranch.BRANCHCODE ||
          selectedBranch.BRANCH ||
          selectedBranch.BRANCHNAME ||
          selectedBranch.NAME ||
          form.branch,
      ).padStart(2, "0"),
      sYear: form.year,
      semester: form.sem,
      academicYear,
      newSection: form.newSection,
      regNos,
      userId,
    };
    console.log("=================================");
    console.log("Selected Students (REGNOs):", regNos);
    console.log("Update Section Payload:", payload);
    console.log("=================================");
    try {
      setUpdating(true);
      const response = await updateSection(payload);
      console.log("Update Section API Response:", response);
      if (response?.success === true) {
        toast.success(
          `${regNos.length} student(s) section updated successfully`,
        );
        // Clear selected checkboxes
        setSelectedStudents([]);
        // Reload table
        await fetchData();
      } else {
        toast.error(response?.message || "Failed to update student section");
      }
    } catch (error: any) {
      console.error("Update Section Error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.Message ||
        error?.message ||
        "Failed to update student section";
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const isAllSelected =
    students.length > 0 && selectedStudents.length === students.length;
  const isPartiallySelected =
    selectedStudents.length > 0 && selectedStudents.length < students.length;

  return (
    <div className="dbs-section-change-container">
      <div className="dbs-section-change-header">
        <div>
          <h2>Section Change</h2>
          <p className="dbs-section-change-subtitle">
            Update student section for selected filters
          </p>
        </div>
      </div>
      <form className="dbs-section-change-form-card">
        <h3>Section Details</h3>
        <div className="dbs-section-change-grid">
          {/* Course */}
          <div className="dbs-section-change-input">
            <label>
              Course <span className="dbs-section-required">*</span>
            </label>
            <select
              name="course"
              value={form.course}
              onChange={handleChange}
              disabled={coursesLoading}
            >
              <option value="">
                {coursesLoading ? "Loading Courses..." : "Select Course"}
              </option>
              {courses.map((item) => (
                <option key={item.CID} value={item.COURSECODE}>
                  {item.COURSE}
                </option>
              ))}
            </select>
          </div>
          {/* Branch */}
          <div className="dbs-section-change-input">
            <label>
              Branch <span className="dbs-section-required">*</span>
            </label>
            <select
              name="branch"
              value={form.branch}
              onChange={handleChange}
              disabled={!form.course || branchesLoading}
            >
              <option value="">
                {branchesLoading ? "Loading Branches..." : "Select Branch"}
              </option>
              {branches.map((item, index) => (
                <option key={index} value={item.BRANCHCODE}>
                  {item.BRANCHNAME}
                </option>
              ))}
            </select>
          </div>
          {/* Year */}
          <div className="dbs-section-change-input">
            <label>
              Year <span className="dbs-section-required">*</span>
            </label>
            <select name="year" value={form.year} onChange={handleChange}>
              <option value="">
                {yearsLoading ? "Loading years..." : "Select Year"}
              </option>
              {years.map((item, index) => (
                <option key={index} value={item.ID}>
                  {item.DATA}
                </option>
              ))}
            </select>
          </div>
          {/* Semester */}
          <div className="dbs-section-change-input">
            <label>
              Sem <span className="dbs-section-required">*</span>
            </label>
            <select name="sem" value={form.sem} onChange={handleChange}>
              <option value="">Select Sem</option>
              <option value="1">I</option>
              <option value="2">II</option>
            </select>
          </div>
          {/* Current Section */}
          <div className="dbs-section-change-input">
            <label>
              Section <span className="dbs-section-required">*</span>
            </label>
            <select
              name="section"
              value={form.section}
              onChange={handleChange}
              disabled={hasSelection}
              title={
                hasSelection
                  ? "Clear the selected students to change this filter"
                  : undefined
              }
            >
              <option value="">
                {sectionsLoading ? "Loading Sections..." : "Select section"}
              </option>
              {sections.map((item, index) => (
                <option key={index} value={item.Section}>
                  {item.Section}
                </option>
              ))}
            </select>
          </div>
          {/* New Section */}
          <div className="dbs-section-change-input">
            <label>
              New Section <span className="dbs-section-required">*</span>
            </label>
            <select
              name="newSection"
              value={form.newSection}
              onChange={handleChange}
              disabled={!hasSelection}
              title={
                !hasSelection
                  ? "Select at least one student below to enable this"
                  : undefined
              }
            >
              <option value="">
                {newsectionsLoading
                  ? "Loading New Sections..."
                  : "Select New Section"}
              </option>
              {newsections.map((item, index) => (
                <option key={index} value={item.Section}>
                  {item.Section}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Form Actions */}
        <div className="dbs-section-change-actions">
          <button
            type="button"
            className="dbs-section-change-cancel-btn"
            onClick={handleReset}
          >
            <X size={16} />
            Cancel
          </button>

          <button
            type="button"
            className="dbs-section-change-update-btn"
            onClick={handleUpdateSection}
            disabled={updating}
          >
            <Save size={16} />
            {updating ? "Updating..." : "Update Section"}
            {!updating && selectedStudents.length > 0 && (
              <span className="dbs-section-update-count">
                {selectedStudents.length}
              </span>
            )}
          </button>
        </div>
      </form>
      {students.length > 0 && (
        <>
          <div className="dbs-section-change-table-header">
            <div>
              <h2>Student List</h2>
              <p className="dbs-section-change-subtitle">
                Select students to change their section
              </p>
            </div>
            <div className="dbs-section-total-students">
              Total Students : <strong>{students.length}</strong>
            </div>
          </div>
          {/* Selected Count */}
          <div className="dbs-section-selected-summary">
            <span>Selected Students Count :</span>
            <strong>{selectedStudents.length}</strong>
          </div>
          {/* Table */}
          <div className="dbs-section-change-table-container">
            <div className="dbs-section-change-table-card">
              <div className="dbs-section-change-table-scroll">
                <table className="dbs-section-change-data-table">
                  <thead>
                    <tr>
                      <th>SL.NO</th>
                      <th>COURSE</th>
                      <th>BRANCH</th>
                      <th>SECTION</th>
                      <th>SNAME</th>
                      <th>REGNO</th>
                      <th className="dbs-section-select-header">
                        <label className="dbs-section-checkbox-wrapper">
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            ref={(element) => {
                              if (element) {
                                element.indeterminate = isPartiallySelected;
                              }
                            }}
                            onChange={handleSelectAll}
                          />
                          <span className="dbs-section-custom-checkbox" />
                          <span>Select All</span>
                        </label>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => {
                      const isSelected = selectedStudents.includes(
                        student.REGNO,
                      );
                      return (
                        <tr
                          key={student.REGNO || index}
                          className={
                            isSelected ? "dbs-section-row-selected" : ""
                          }
                        >
                          <td>{index + 1}</td>
                          <td className="dbs-section-course-cell">
                            {student.COURSE}
                          </td>
                          <td>{student.GRP}</td>
                          <td className="dbs-section-current-section">
                            {student.SECTION}
                          </td>
                          <td>{student.SNAME}</td>
                          <td className="dbs-section-regno">{student.REGNO}</td>
                          <td className="dbs-section-checkbox-cell">
                            <label className="dbs-section-checkbox-wrapper">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() =>
                                  handleStudentSelect(student.REGNO)
                                }
                              />
                              <span className="dbs-section-custom-checkbox" />
                            </label>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
      {students.length === 0 && (
        <div className="dbs-section-change-empty-container">
          <AlertCircle className="dbs-section-change-empty-icon" />
          <div className="dbs-section-change-empty-title">
            No students displayed
          </div>
          <div className="dbs-section-change-empty-desc">
            Select the course, branch, year, semester and section, then click
            Display Students.
          </div>
        </div>
      )}
    </div>
  );
};
export default SectionChange;
