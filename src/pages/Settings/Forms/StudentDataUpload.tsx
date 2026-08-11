import React, { ChangeEvent, useEffect, useState } from "react";
import "./StudentDataUpload.css";
import {
  downloadStudentTemplate,
  finalUpdateStudentData,
  getUploadedStudentData,
  insertStudentData,
} from "../../../apis/SettingsApis";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { AlertCircle } from "lucide-react";

interface StudentDataImport {
  RegistrationNo: string | null;
  STUNAME: string | null;
  FATHERNAME: string | null;
  Emailid: string | null;
  MAadharNo: string | null;
  StdMobNo: string | null;
  ParentMbNo: string | null;
  AadhaarNo: string | null;
  JnanaBhumiId: string | null;
  BusFee: string | null;
  SchAmount: string | null;
  BloodGrp: string | null;
  SpotAdmFee: string | null;
  Modeodcategory: string | null;
  ApaarID: string | null;
}

const StudentDataUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    setFile(selectedFile);
  };
  const [showSaveButton, setShowSaveButton] = useState(false);
  const loadStudentData = async () => {
    try {
      const response = await getUploadedStudentData();
      setStudents(response);
      if (response && response.length > 0) {
        setShowSaveButton(true);
      }
    } catch (error) {
      console.error("Load student data error:", error);
      toast.error("Failed to load student data");
    }
  };

  const handleLoad = async () => {
    if (!file) {
      toast.error("Please select an Excel file");
      return;
    }
    try {
      const response = await insertStudentData(file);
      toast.success("Student data uploaded successfully");
      // only now display table data
      await loadStudentData();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Excel upload failed");
    }
  };

  const handleSave = async () => {
    try {
      const response = await finalUpdateStudentData();
      if (response?.message === "Success") {
        toast.success(`Student data saved successfully`);
        // clear table
        setStudents([]);
        // hide save button
        setShowSaveButton(false);
        // remove selected file
        setFile(null);
        // reset file input
        const fileInput = document.querySelector(
          'input[type="file"]',
        ) as HTMLInputElement;

        if (fileInput) {
          fileInput.value = "";
        }
      } else {
        toast.error("Student data save failed");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save data");
    }
  };

  const handleDownloadFormat = async () => {
    try {
      const response = await downloadStudentTemplate();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "STUDENT_DATA.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download template error:", error);
      alert("Failed to download template");
    }
  };

  return (
    <div className="dbs-student-container">
      {/* Header */}
      <div className="dbs-student-header">
        <div>
          <h2>Student Marks Upload</h2>
          <p className="dbs-page-subtitle">
            Upload student marks using the prescribed Excel template.
          </p>
        </div>
      </div>
      {/* Upload Card */}
      <div className="dbs-student-card">
        <div className="dbs-upload-row">
          <div className="dbs-student-field dbs-upload-file">
            <label>Select Excel File</label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
            />

            {file && (
              <small className="dbs-file-name">
                Selected: <strong>{file.name}</strong>
              </small>
            )}
          </div>
          <div className="dbs-upload-buttons">
            <button className="dbs-btn-outline" onClick={handleDownloadFormat}>
              Download Template
            </button>
            <button
              className="dbs-btn-primary"
              disabled={!file}
              onClick={handleLoad}
            >
              Load
            </button>
            {showSaveButton && (
              <button className="dbs-btn-success" onClick={handleSave}>
                Save Data
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Table Header */}
      <div className="dbs-student-upload-header dbs-table-head">
        <div>
          <h3>Preview</h3>
          <p className="dbs-page-subtitle">
            Loaded student records will appear here.
          </p>
        </div>
      </div>
      {/* ================= Preview ================= */}
      <div className="dbs-table-container">
        {students.length === 0 ? (
          <div className="dbs-empty-state">
            <AlertCircle className="dbs-empty-state-icon" />
            <div className="dbs-empty-state-title">No data loaded</div>
            <div className="dbs-empty-state-desc">
              No student records are available for preview.
            </div>
          </div>
        ) : (
          <div className="dbs-period-table-scroll">
            <table className="dbs-period-table">
              <thead>
                <tr>
                  <th>Register No</th>
                  <th>Name</th>
                  <th>Father Name</th>
                  <th>Email</th>
                  <th>Student Mobile</th>
                  <th>Blood Group</th>
                </tr>
              </thead>

              <tbody>
                {students.map((item, index) => (
                  <tr key={index}>
                    <td title={item.registrationNo}>
                      {item.registrationNo || "-"}
                    </td>
                    <td title={item.sTUNAME}>{item.sTUNAME || "-"}</td>
                    <td title={item.fATHERNAME}>{item.fATHERNAME || "-"}</td>
                    <td title={item.emailid}>{item.emailid || "-"}</td>
                    <td>{item.stdMobNo || "-"}</td>
                    <td>{item.bloodGrp || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDataUpload;
