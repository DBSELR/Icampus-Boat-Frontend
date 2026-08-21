import React, { useMemo, useState } from "react";
import {
  Save,
  X,
  Search,
  AlertCircle,
  ChevronDown,
  Edit3,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import "./RegnoGeneration.css";

interface RegnoRecord {
  id: number;
  course: string;
  branch: string;
  year: string;
  section: string;
  admissionNo: string;
  registrationNo: string;
  studentName: string;
}

const RegnoGeneration: React.FC = () => {
  const [course, setCourse] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [admnType, setAdmnType] = useState("");

  // 5 RegNo Format fields
  const [regnoFormat1, setRegnoFormat1] = useState("");
  const [regnoFormat2, setRegnoFormat2] = useState("");
  const [regnoFormat3, setRegnoFormat3] = useState("");
  const [regnoFormat4, setRegnoFormat4] = useState("");
  const [regnoFormat5, setRegnoFormat5] = useState("");

  const [formatYear, setFormatYear] = useState("");
  const [sampleRegNo, setSampleRegNo] = useState("");

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [data, setData] = useState<RegnoRecord[]>([
    {
      id: 1,
      course: "B.Tech",
      branch: "Computer Science",
      year: "1st Year",
      section: "A",
      admissionNo: "ADM001",
      registrationNo: "CSE25A001",
      studentName: "Student 001",
    },
    {
      id: 2,
      course: "B.Tech",
      branch: "Computer Science",
      year: "1st Year",
      section: "A",
      admissionNo: "ADM002",
      registrationNo: "CSE25A002",
      studentName: "Student 002",
    },
    {
      id: 3,
      course: "B.Tech",
      branch: "Electronics",
      year: "2nd Year",
      section: "B",
      admissionNo: "ADM003",
      registrationNo: "ECE24B003",
      studentName: "Student 003",
    },
  ]);

  const courses = ["B.Tech", "B.Com", "B.Sc", "BBA", "MBA", "MCA"];

  const branches = [
    "Computer Science",
    "Electronics",
    "Mechanical",
    "Civil",
    "Electrical",
  ];

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

  const sections = ["A", "B", "C", "D"];

  const admissionTypes = ["Regular", "Management", "Lateral Entry", "NRI"];

  // Temporary options - can be changed later
  const regnoFormatOptions = [
    "Course",
    "Branch",
    "Year",
    "Section",
    "Admission Type",
    "Number",
  ];

  const formatYears = ["2024", "2025", "2026", "2027", "2028"];

  const formatFields = [
    {
      key: "regnoFormat1",
      value: regnoFormat1,
      setter: setRegnoFormat1,
      placeholder: "Field 1",
    },
    {
      key: "regnoFormat2",
      value: regnoFormat2,
      setter: setRegnoFormat2,
      placeholder: "Field 2",
    },
    {
      key: "regnoFormat3",
      value: regnoFormat3,
      setter: setRegnoFormat3,
      placeholder: "Field 3",
    },
    {
      key: "regnoFormat4",
      value: regnoFormat4,
      setter: setRegnoFormat4,
      placeholder: "Field 4",
    },
    {
      key: "regnoFormat5",
      value: regnoFormat5,
      setter: setRegnoFormat5,
      placeholder: "Field 5",
    },
  ];

  const filteredData = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return data;

    return data.filter(
      (item) =>
        item.course.toLowerCase().includes(query) ||
        item.branch.toLowerCase().includes(query) ||
        item.year.toLowerCase().includes(query) ||
        item.section.toLowerCase().includes(query) ||
        item.admissionNo.toLowerCase().includes(query) ||
        item.registrationNo.toLowerCase().includes(query) ||
        item.studentName.toLowerCase().includes(query),
    );
  }, [data, search]);

  const getCourseCode = (selectedCourse: string, selectedBranch: string) => {
    return selectedBranch === "Computer Science"
      ? "CSE"
      : selectedBranch === "Electronics"
        ? "ECE"
        : selectedBranch === "Mechanical"
          ? "ME"
          : selectedBranch === "Civil"
            ? "CE"
            : selectedBranch === "Electrical"
              ? "EEE"
              : selectedCourse.slice(0, 3).toUpperCase();
  };

  const getFormatValue = (
    format: string,
    selectedCourse: string,
    selectedBranch: string,
    selectedYear: string,
    selectedSection: string,
    selectedAdmnType: string,
    selectedFormatYear: string,
  ) => {
    const courseCode = getCourseCode(selectedCourse, selectedBranch);

    const yearCode = selectedFormatYear.slice(-2);

    switch (format) {
      case "Course":
        return courseCode;

      case "Branch":
        return selectedBranch
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase())
          .join("");

      case "Year":
        return yearCode;

      case "Section":
        return selectedSection;

      case "Admission Type":
        return selectedAdmnType
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase())
          .join("");

      case "Number":
        return "001";

      default:
        return "";
    }
  };

  const generateSampleRegNo = () => {
    const formatFields = [
      regnoFormat1,
      regnoFormat2,
      regnoFormat3,
      regnoFormat4,
      regnoFormat5,
    ];

    const generatedParts = formatFields
      .map((format) =>
        getFormatValue(
          format,
          course,
          branch,
          year,
          section,
          admnType,
          formatYear,
        ),
      )
      .filter(Boolean);

    return generatedParts.join("");
  };

  const resetForm = () => {
    setCourse("");
    setBranch("");
    setYear("");
    setSection("");
    setAdmnType("");

    setRegnoFormat1("");
    setRegnoFormat2("");
    setRegnoFormat3("");
    setRegnoFormat4("");
    setRegnoFormat5("");

    setFormatYear("");
    setSampleRegNo("");
    setOpenDropdown(null);
  };

  const handleGenerate = () => {
    if (!course) {
      toast.error("Please select Course");
      return;
    }

    if (!branch) {
      toast.error("Please select Branch");
      return;
    }

    if (!year) {
      toast.error("Please select Year");
      return;
    }

    if (!section) {
      toast.error("Please select Section");
      return;
    }

    if (!admnType) {
      toast.error("Please select Admission Type");
      return;
    }

    if (!regnoFormat1) {
      toast.error("Please select RegNo. Format 1");
      return;
    }

    if (!regnoFormat2) {
      toast.error("Please select RegNo. Format 2");
      return;
    }

    if (!regnoFormat3) {
      toast.error("Please select RegNo. Format 3");
      return;
    }

    if (!regnoFormat4) {
      toast.error("Please select RegNo. Format 4");
      return;
    }

    if (!regnoFormat5) {
      toast.error("Please select RegNo. Format 5");
      return;
    }

    if (!formatYear) {
      toast.error("Please select Format Year");
      return;
    }

    const generatedSample = generateSampleRegNo();

    setSampleRegNo(generatedSample);

    const newRecord: RegnoRecord = {
      id: Date.now(),
      course,
      branch,
      year,
      section,
      admissionNo: `ADM${String(data.length + 1).padStart(3, "0")}`,
      registrationNo: generatedSample,
      studentName: `Student ${String(data.length + 1).padStart(3, "0")}`,
    };

    setData((prev) => [newRecord, ...prev]);

    toast.success("Registration Number Generated Successfully");
  };

  const renderDropdown = (
    label: string,
    value: string,
    options: string[],
    field: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    compact = false,
  ) => {
    const isOpen = openDropdown === field;

    return (
      <div
        className={
          compact
            ? "rgn-input-group rgn-format-dropdown-item"
            : "rgn-input-group"
        }
      >
        {!compact && <label>{label}</label>}

        <div className="rgn-custom-dropdown">
          <button
            type="button"
            className={`rgn-dropdown-trigger ${
              compact ? "rgn-format-trigger" : ""
            }`}
            onClick={() => setOpenDropdown(isOpen ? null : field)}
          >
            <span className={value ? "" : "rgn-placeholder"}>
              {value || label}
            </span>

            <ChevronDown
              size={compact ? 14 : 18}
              className={`rgn-chevron ${isOpen ? "rgn-chevron-open" : ""}`}
            />
          </button>

          {isOpen && (
            <div className="rgn-dropdown-menu">
              {options.map((option) => (
                <div
                  key={option}
                  className="rgn-dropdown-item"
                  onClick={() => {
                    setter(option);
                    setOpenDropdown(null);
                  }}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="rgn-generation-container">
      {/* HEADER */}

      <div className="rgn-page-header">
        <div>
          <h2>Registration Number Generation</h2>
          <p>Generate and manage student registration numbers</p>
        </div>
      </div>

      {/* FORM */}

      <div className="rgn-form-card">
        <div className="rgn-card-heading">
          <div>
            <h3>Generate Registration Number</h3>
            <p>
              Select the required details to generate a registration number.
            </p>
          </div>
        </div>

        {/* BASIC DETAILS */}

        <div className="rgn-form-grid">
          {renderDropdown("Course", course, courses, "course", setCourse)}

          {renderDropdown("Branch", branch, branches, "branch", setBranch)}

          {renderDropdown("Year", year, years, "year", setYear)}

          {renderDropdown("Section", section, sections, "section", setSection)}

          {renderDropdown(
            "Admn Type",
            admnType,
            admissionTypes,
            "admnType",
            setAdmnType,
          )}
        </div>

        {/* REGNO FORMAT */}

        <div className="rgn-regno-format-wrapper">
          <label className="rgn-regno-format-label">RegNo. Format</label>

          <div className="rgn-format-fields-row">
            {formatFields.map((field, index) =>
              renderDropdown(
                `Field ${index + 1}`,
                field.value,
                regnoFormatOptions,
                field.key,
                field.setter,
                true,
              ),
            )}
          </div>
        </div>

        {/* YEAR + SAMPLE */}

        <div className="rgn-format-details-row">
          <div className="rgn-format-field rgn-year-field">
            <label>Year</label>

            <div className="rgn-custom-dropdown">
              <button
                type="button"
                className="rgn-dropdown-trigger"
                onClick={() =>
                  setOpenDropdown(
                    openDropdown === "formatYear" ? null : "formatYear",
                  )
                }
              >
                <span className={formatYear ? "" : "rgn-placeholder"}>
                  {formatYear || "Select Year"}
                </span>

                <ChevronDown
                  size={18}
                  className={`rgn-chevron ${
                    openDropdown === "formatYear" ? "rgn-chevron-open" : ""
                  }`}
                />
              </button>

              {openDropdown === "formatYear" && (
                <div className="rgn-dropdown-menu">
                  {formatYears.map((item) => (
                    <div
                      key={item}
                      className="rgn-dropdown-item"
                      onClick={() => {
                        setFormatYear(item);
                        setOpenDropdown(null);
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rgn-format-field rgn-sample-field">
            <label>Sample Reg.No.</label>

            <input
              type="text"
              value={sampleRegNo}
              placeholder="Generated sample will appear here"
              readOnly
            />
          </div>
        </div>

        {/* ACTIONS */}

        <div className="rgn-form-actions">
          <button
            type="button"
            className="rgn-secondary-btn"
            onClick={resetForm}
          >
            <X size={16} />
            Cancel
          </button>

          <button
            type="button"
            className="rgn-primary-btn"
            onClick={handleGenerate}
          >
            <Save size={16} />
            Generate
          </button>
        </div>
      </div>

      {/* TABLE HEADER */}

      <div className="rgn-table-header">
        <div>
          <h2>Registration Number Registry</h2>
          <p>View and manage generated registration numbers</p>
        </div>

        <div className="rgn-search-box">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search registration number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}

      <div className="rgn-table-container">
        {filteredData.length === 0 ? (
          <div className="rgn-empty-state">
            <AlertCircle className="rgn-empty-icon" />

            <div className="rgn-empty-title">No Registration Numbers Found</div>

            <div className="rgn-empty-description">
              Generate registration numbers using the form above to view them
              here.
            </div>
          </div>
        ) : (
          <div className="rgn-table-card">
            <div className="rgn-table-scroll">
              <table className="rgn-data-table">
                <thead>
                  <tr>
                    <th>SL.NO</th>
                    <th>COURSE</th>
                    <th>BRANCH</th>
                    <th>YEAR</th>
                    <th>SECTION</th>
                    <th>ADMISSION NO.</th>
                    <th>REGISTRATION NO.</th>
                    <th>STUDENT NAME</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.course}</td>
                      <td>{item.branch}</td>
                      <td>{item.year}</td>
                      <td>{item.section}</td>
                      <td>{item.admissionNo}</td>

                      <td>
                        <span className="rgn-regno">{item.registrationNo}</span>
                      </td>

                      <td>{item.studentName}</td>

                      <td>
                        <div className="rgn-action-buttons">
                          <button
                            type="button"
                            className="rgn-action-btn rgn-edit-btn"
                            title="Edit"
                            onClick={() =>
                              toast.info(`Edit ${item.registrationNo}`)
                            }
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            type="button"
                            className="rgn-action-btn rgn-delete-btn"
                            title="Delete"
                            onClick={() => {
                              setData((prev) =>
                                prev.filter((row) => row.id !== item.id),
                              );

                              toast.success("Registration Number Deleted");
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
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

export default RegnoGeneration;
