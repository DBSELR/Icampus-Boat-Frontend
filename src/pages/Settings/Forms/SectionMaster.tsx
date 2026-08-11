import React, { useEffect, useState } from "react";
import {
  Save,
  Trash2,
  Edit3,
  AlertTriangle,
  HelpCircle,
  AlertCircle,
  Section,
  SquarePen,
  X,
} from "lucide-react";
import { toast } from "sonner";
import "./SectionMaster.css";
import axios from "axios";
import { API_BASE } from "../../../config";
import Footer from "../../../common/Footer";

const SectionMaster = () => {
  const ACYR = localStorage.getItem("academicYear")?.toString();

  interface section {
    id: string;
    AcademicYear: string;
    FinancialYear: string;
    Programme: string;
    BranchCode: string;
    StdYear: string;
    Section: string;
    Semester: string;
    Mangqutseats: string;
    CouncilingSeats: string;
    WithLE: string;
    TotStrgth: string;
    fillseats: string;
  }

  const [sectionInput, setSectionInput] = useState<section>({
    id: "",
    AcademicYear: "",
    FinancialYear: "Apr-2017 to Mar-2018",
    Programme: "0",
    BranchCode: "0",
    StdYear: "0",
    Section: "0",
    Semester: "0",
    Mangqutseats: "",
    CouncilingSeats: "",
    WithLE: "",
    TotStrgth: "",
    fillseats: "",
  });

  const [sectionMasterLoad, setSectionMasterLoad] = useState<any[]>([]);
  const [programmeLoad, setProgrammeLoad] = useState<any[]>([]);
  const [selectedProgramme, setSelectedProgramme] = useState("0");
  const [loadingProgrammes, setLoadingProgrammes] = useState(false);
  const [branchLoad, setBranchLoad] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("0");
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [yearLoad, setYearLoad] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState("0");
  const [loadingYears, setLoadingYears] = useState(false);

  const sectionSave = {
    id: sectionInput.id,
    AcademicYear: ACYR,
    FinancialYear: sectionInput.FinancialYear,
    Programme: selectedProgramme || 0,
    BranchCode: selectedBranch || 0,
    StdYear: selectedYear || 0,
    Section: sectionInput.Section,
    Semester: sectionInput.Semester || 0,
    Mangqutseats: sectionInput.Mangqutseats,
    CouncilingSeats: sectionInput.CouncilingSeats,
    WithLE: sectionInput.WithLE,
    TotStrgth: sectionInput.TotStrgth,
    fillseats: sectionInput.fillseats,
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const totalRecords = sectionMasterLoad.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentData = sectionMasterLoad.slice(startIndex, endIndex);

  const getPagination = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push("...");
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      pages.push(totalPages);
    }
    return pages;
  };

  const fetchSectionList = async () => {
    try {
      const response = await axios.post(
        `${API_BASE}SectionMaster/GetSectionMaster`,
        {
          AcademicYear: ACYR,
          COURSECODE: selectedProgramme || "0",
          BRANCHCODE: selectedBranch || "0",
          STDYEAR: selectedYear || "0",
          SEMESTER: sectionInput.Semester || "0",
          SECTION: sectionInput.Section === "" ? "0" : sectionInput.Section,
        },
      );
      setSectionMasterLoad(response.data);
      setCurrentPage(1);
    } catch (error) {
      toast.error("Sections Data Not Found!");
    }
  };

  const fetchprogramme = async () => {
    try {
      setLoadingProgrammes(true);
      const response = await axios.post(
        `${API_BASE}Commonfields/GetProgramme`,
        null,
        {
          params: { ACADEMICYEAR: sectionSave.AcademicYear },
        },
      );
      setProgrammeLoad(response.data);
      setLoadingProgrammes(false);
    } catch (error) {
      toast.error("Programme Data Not found!");
    }
  };

  const fetchBranch = async (programme: string) => {
    try {
      setLoadingBranches(true);
      const response = await axios.post(
        `${API_BASE}Commonfields/GetBranch`,
        null,
        {
          params: {
            PROGRAMME: programme,
            ACADEMICYEAR: ACYR,
          },
        },
      );
      setBranchLoad(response.data);
      setLoadingBranches(false);
    } catch {
      toast.error("Branch Data Not found!");
    }
  };

  const fetchYear = async (programme: string) => {
    try {
      setLoadingYears(true);
      const response = await axios.post(
        `${API_BASE}Commonfields/GetYear`,
        null,
        {
          params: {
            PROGRAMME: programme,
            ACADEMICYEAR: ACYR,
          },
        },
      );
      setYearLoad(response.data);
      setLoadingYears(false);
    } catch {
      toast.error("Year Data Not found!");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setSectionInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addSeats = () => {
    const totseats =
      Number(sectionInput.Mangqutseats || 0) +
      Number(sectionInput.CouncilingSeats || 0) +
      Number(sectionInput.WithLE || 0);

    setSectionInput((prev) => ({
      ...prev,
      TotStrgth: totseats.toString(),
    }));
  };

  const onCancel = () => {
    setSectionInput({
      id: "",
      AcademicYear: "",
      FinancialYear: "Apr-2017 to Mar-2018",
      Programme: "0",
      BranchCode: "0",
      StdYear: "0",
      Section: "",
      Semester: "0",
      Mangqutseats: "",
      CouncilingSeats: "",
      WithLE: "",
      TotStrgth: "",
      fillseats: "",
    });
    setSelectedProgramme("0");
    setSelectedBranch("0");
    setSelectedYear("0");
    setBranchLoad([]);
    setYearLoad([]);
  };

  const validate = () => {
    if (sectionSave.Programme == "" || sectionSave.Programme == "0") {
      toast.warning("Please select Programme");
      return;
    }
    if (sectionSave.BranchCode == "" || sectionSave.BranchCode == "0") {
      toast.warning("Please select Branch");
      return;
    }
    if (sectionSave.StdYear == "" || sectionSave.StdYear == "0") {
      toast.warning("Please select Year");
      return;
    }
    if (sectionSave.Semester == "" || sectionSave.Semester == "0") {
      toast.warning("Please select Semester");
      return;
    }
    if (sectionSave.Section == "" || sectionSave.Semester == "0") {
      toast.warning("Please select Section");
      return;
    }
    return true;
  };

  const onHandleSave = async () => {
    try {
      if (!validate()) return;

      const response = await axios.post(
        `${API_BASE}SectionMaster/SaveSectionMaster`,
        sectionSave,
      );

      toast.success(
        sectionSave.id
          ? "Data Updated Successfully"
          : "Data Saved Successfully",
      );

      onCancel();
      await fetchSectionList();
      setCurrentPage(1);
    } catch (error) {
      toast.error("Data Not Saved...!");
    }
  };

  const handleEdit = async (sec: any) => {
    setSelectedProgramme(String(sec.COURSE).split("-")[0]);
    setSelectedBranch(String(sec.BRANCHNAME).split("-")[0]);
    setSelectedYear(String(sec.STDYEAR));

    const data = {
      id: String(sec.ID),
      AcademicYear: String(sec.ACADEMICYEAR) ?? "",
      FinancialYear: "Apr-2017 to Mar-2018",
      Programme: String(sec.COURSE).split("-")[0],
      BranchCode: String(sec.BRANCHNAME).split("-")[0],
      StdYear: String(sec.STDYEAR),
      Section: String(sec.SECTION),
      Semester: String(sec.SEMESTER),
      Mangqutseats: String(sec.MANGQUTSEATS),
      CouncilingSeats: String(sec.COUNCILINGSEATS),
      WithLE: String(sec.WITHLE),
      TotStrgth: String(sec.TOTSEATS),
      fillseats: String(sec.FILLSEATS),
    };
    setSectionInput(data);
  };

  useEffect(() => {
    fetchprogramme();
  }, []);

  useEffect(() => {
    fetchSectionList();
  }, [
    selectedProgramme,
    selectedBranch,
    selectedYear.toString(),
    sectionInput.Semester,
    sectionInput.Section,
  ]);

  useEffect(() => {
    fetchBranch(selectedProgramme);
  }, [selectedProgramme]);

  useEffect(() => {
    fetchYear(selectedProgramme);
  }, [selectedProgramme]);

  return (
    <div className="section-master-container">
      <div className="section-master-header">
        <div>
          <h2>Section Master</h2>
          <p>
            Manage academic sections, seat allocation, semester details, and
            student strength for each programme and branch.
          </p>
        </div>
      </div>

      <div className="section-form-card">
        <h3>Section Information</h3>

        <div className="section-form-grid">
          <div className="section-input-box">
            <label>Programme</label>
            <select
              value={selectedProgramme}
              name="Programme"
              onChange={(e) => setSelectedProgramme(e.target.value)}
            >
              <option value="">
                {loadingProgrammes ? "Loading..." : "Select Programme"}
              </option>
              {programmeLoad.map((prog) => (
                <option key={prog.COURSECODE} value={prog.COURSECODE}>
                  {prog.COURSE}
                </option>
              ))}
            </select>
          </div>

          <div className="section-input-box">
            <label>Branch</label>
            <select
              value={selectedBranch}
              name="BranchCode"
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="">
                {loadingBranches ? "Loading..." : "Select Branch"}
              </option>
              {branchLoad.map((brnh) => (
                <option key={brnh.BRANCHCODE} value={brnh.BRANCHCODE}>
                  {brnh.BRANCHNAME}
                </option>
              ))}
            </select>
          </div>

          <div className="section-input-box">
            <label>Year</label>
            <select
              value={selectedYear}
              name="StdYear"
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">
                {loadingYears ? "Loading..." : "Select Year"}
              </option>
              {yearLoad.map((YR) => (
                <option key={YR.ID} value={YR.ID}>
                  {YR.DATA}
                </option>
              ))}
            </select>
          </div>

          <div className="section-input-box">
            <label>Semester</label>
            <select
              value={sectionInput.Semester}
              name="Semester"
              onChange={handleChange}
            >
              <option value="">Select Semester</option>
              <option value="1">I</option>
              <option value="2">II</option>
            </select>
          </div>

          <div className="section-input-box">
            <label>Section</label>
            <input
              type="text"
              value={sectionInput.Section}
              name="Section"
              onChange={handleChange}
            />
          </div>

          <div className="section-input-box">
            <label>Maximum Management Seats</label>
            <input
              type="text"
              value={sectionInput.Mangqutseats}
              name="Mangqutseats"
              onChange={handleChange}
              onKeyUp={addSeats}
            />
          </div>

          <div className="section-input-box">
            <label>Counselling Seats</label>
            <input
              type="text"
              value={sectionInput.CouncilingSeats}
              name="CouncilingSeats"
              onChange={handleChange}
              onKeyUp={addSeats}
            />
          </div>

          <div className="section-input-box">
            <label>Lateral Entry</label>
            <input
              type="text"
              value={sectionInput.WithLE}
              name="WithLE"
              onChange={handleChange}
              onKeyUp={addSeats}
            />
          </div>

          <div className="section-input-box">
            <label>Fill Seats</label>
            <input
              type="text"
              value={sectionInput.fillseats}
              name="fillseats"
              onChange={handleChange}
            />
          </div>

          <div className="section-input-box">
            <label>Total Strength</label>
            <input
              type="text"
              value={sectionInput.TotStrgth}
              name="TotStrgth"
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="section-form-actions">
          <button
            type="button"
            className="section-cancel-btn"
            onClick={onCancel}
          >
            <X size={16} />
            Cancel
          </button>

          <button
            type="submit"
            className="section-save-btn"
            onClick={onHandleSave}
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </div>

      <div className="section-master-header">
        <div>
          <h3>Section List</h3>
          <p>
            View and manage all configured sections, seat allocations, and
            student strength details.
          </p>
        </div>
      </div>

      <div className="section-table-container">
        <div className="section-table-content">
          {sectionMasterLoad.length === 0 ? (
            <div className="section-empty-state">
              <AlertCircle className="section-empty-icon" />

              <div className="section-empty-title">No records found</div>

              <div className="section-empty-description">
                Try clearing your filters or add a new section above.
              </div>
            </div>
          ) : (
            <div className="section-table-wrapper">
              <div className="section-table-scroll">
                <table className="section-data-table">
                  <thead>
                    <tr>
                      <th>SL.NO</th>
                      <th>Course</th>
                      <th>Branch</th>
                      <th>Studying Year</th>
                      <th>Semester</th>
                      <th>Section</th>
                      <th>Coun. Seats</th>
                      <th>Mang. Seats</th>
                      <th>With LE</th>
                      <th>Fill Seats</th>
                      <th>Total Seats</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentData.map((sec, index) => (
                      <tr key={sec.ID}>
                        <td>{startIndex + index + 1}</td>
                        <td>{sec.COURSE}</td>
                        <td>{sec.BRANCHNAME}</td>
                        <td>{sec.STDYEAR}</td>
                        <td>{sec.SEMESTER}</td>
                        <td>{sec.SECTION}</td>
                        <td>{sec.COUNCILINGSEATS}</td>
                        <td>{sec.MANGQUTSEATS}</td>
                        <td>{sec.WITHLE}</td>
                        <td>{sec.FILLSEATS}</td>
                        <td>{sec.TOTSEATS}</td>
                        <td>
                          <button
                            type="button"
                            className="section-edit-btn"
                            onClick={() => handleEdit(sec)}
                          >
                            <Edit3 size={16} />
                          </button>
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

      <Footer
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        recordsPerPage={recordsPerPage}
        setRecordsPerPage={setRecordsPerPage}
        totalRecords={totalRecords}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        getPagination={getPagination}
      />
    </div>
  );
};

export default SectionMaster;
