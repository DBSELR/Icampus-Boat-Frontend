import React, { useState } from "react";

import {
  Save,
  Edit3,
  Trash2,
  HelpCircle,
  AlertTriangle,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import "./NoObjectionCertificate.css";

interface NocRecord {
  id: number;
  nocNo: string;
  regNo: string;
  studentName: string;
  programme: string;
  branch: string;
  year: string;
  date: string;
}

const NoObjectionCertificate: React.FC = () => {
  const [records, setRecords] = useState<NocRecord[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [form, setForm] = useState({
    nocNo: "",
    date: "",
    regNo: "",
    admissionDate: "",
    studentName: "",
    fatherName: "",
    programme: "",
    branch: "",
    year: "",
    yearAdmission1st: "",
    classStudied: "",
    discontinuationDetails: "",
    fromCollege: "",
    toCollege: "",
    affiliatingUniversity: "",
    nocIssuedByUniversity: "",
    totalIntake: "",
    unfilledSeats: "",
    transferClass: "",
    lastExamDate: "",
    quotaType: "",
    tuitionPaid: "",
    tuitionNewInstitution: "",
    reasonForTransfer: "",
    principalName: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      nocNo: "",
      date: "",
      regNo: "",
      admissionDate: "",
      studentName: "",
      fatherName: "",
      programme: "",
      branch: "",
      year: "",
      yearAdmission1st: "",
      classStudied: "",
      discontinuationDetails: "",
      fromCollege: "",
      toCollege: "",
      affiliatingUniversity: "",
      nocIssuedByUniversity: "",
      totalIntake: "",
      unfilledSeats: "",
      transferClass: "",
      lastExamDate: "",
      quotaType: "",
      tuitionPaid: "",
      tuitionNewInstitution: "",
      reasonForTransfer: "",
      principalName: "",
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const newRecord: NocRecord = {
      id: Date.now(),
      nocNo: form.nocNo,
      regNo: form.regNo,
      studentName: form.studentName,
      programme: form.programme,
      branch: form.branch,
      year: form.year,
      date: form.date,
    };

    setRecords((prev) => [newRecord, ...prev]);
    toast.success("NOC saved successfully");
    resetForm();
  };

  const handleDelete = () => {
    if (deleteId) {
      setRecords(records.filter((r) => r.id !== deleteId));
      toast.success("Deleted successfully");
      setDeleteId(null);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="dbs-groupchange-container">

      {/* HEADER */}
      <div className="dbs-admissions-form-header">
        <div>
          <h2>No Objection Certificate</h2>
          <p>Complete student transfer approval details</p>
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSave} className="dbs-admissions-stepper-form-card">
        <div className="dbs-noc-form">
          <div className="dbs-datatable-header-area">
              <h3 >Student Group Change Details</h3>
          </div>

          {/* Row 1 */}
          <div className="dbs-noc-row">

            <div className="dbs-field">
              <label>NOC No.</label>
              <input
                name="nocNo"
                value={form.nocNo}
                onChange={handleChange}
              />
            </div>

            <div className="dbs-field">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="dbs-noc-row">

            <div className="dbs-field">
              <label>SSNO / Reg No.</label>
              <input
                name="regNo"
                value={form.regNo}
                onChange={handleChange}
              />
            </div>

            <div className="dbs-field">
              <label>Admission Date</label>
              <input
                type="date"
                name="admissionDate"
                value={form.admissionDate}
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="dbs-noc-row">

            <div className="dbs-field">
              <label>Student Name</label>
              <input
                name="studentName"
                value={form.studentName}
                onChange={handleChange}
              />
            </div>

            <div className="dbs-field">
              <label>Father Name</label>
              <input
                name="fatherName"
                value={form.fatherName}
                onChange={handleChange}
              />
            </div>

          </div>

          {/* Row 2 */}
          <div className="dbs-noc-row">
            <label>SSNO / Reg No</label>
            <input
              name="regNo"
              value={form.regNo}
              onChange={handleChange}
            />

            <label>Admission Date</label>
            <input
              type="date"
              name="admissionDate"
              value={form.admissionDate}
              onChange={handleChange}
            />
          </div>

          {/* Row 3 */}
          <div className="dbs-noc-row">
            <label>Student Name</label>
            <input
              name="studentName"
              value={form.studentName}
              onChange={handleChange}
            />

            <label>Father Name</label>
            <input
              name="fatherName"
              value={form.fatherName}
              onChange={handleChange}
            />
          </div>

          {/* Row 4 */}
          <div className="dbs-noc-row">
            <label>Programme</label>
            <input
              name="programme"
              value={form.programme}
              onChange={handleChange}
            />

            <label>Branch</label>
            <input
              name="branch"
              value={form.branch}
              onChange={handleChange}
            />
          </div>

          {/* Row 5 */}
          <div className="dbs-noc-row">
            <label>Year</label>
            <input
              name="year"
              value={form.year}
              onChange={handleChange}
            />

            <label>Year of admission in 1st Year</label>
            <input
              name="yearAdmission1st"
              value={form.yearAdmission1st}
              onChange={handleChange}
            />
          </div>

          {/* Row 6 */}
          <div className="dbs-noc-row dbs-noc-row-large">
            <label>
              Class, Year & Semester; the Candidate Studied during the academic year
            </label>

            <div className="dbs-two-inputs">
              <input
                name="classStudied"
                value={form.classStudied}
                onChange={handleChange}
              />

              <input
                placeholder="Academic Year"
              />
            </div>
          </div>

          {/* Row 7 */}
          <div className="dbs-noc-row dbs-noc-row-large">
            <label>Details Of Discontinuation, if any</label>

            <input
              name="discontinuationDetails"
              value={form.discontinuationDetails}
              onChange={handleChange}
            />
          </div>

          {/* Row 8 */}
          <div className="dbs-noc-row dbs-noc-row-large">
            <label>
              The College From Which the Student Is seeking Transfer Now
            </label>

            <input
              name="fromCollege"
              value={form.fromCollege}
              onChange={handleChange}
            />
          </div>

          {/* Row 9 */}
          <div className="dbs-noc-row dbs-noc-row-large">
            <label>
              The College To Which the Student Is seeking Transfer
            </label>

            <input
              name="toCollege"
              value={form.toCollege}
              onChange={handleChange}
            />
          </div>

          {/* Row 10 */}
          <div className="dbs-noc-row">
            <label>Affiliating University</label>

            <input
              name="affiliatingUniversity"
              value={form.affiliatingUniversity}
              onChange={handleChange}
            />
          </div>

          {/* Row 11 */}
          <div className="dbs-noc-row">
            <label>Whether the University issued the NOC</label>

            <select
              name="nocIssuedByUniversity"
              value={form.nocIssuedByUniversity}
              onChange={handleChange}
            >
              <option value="">Select Yes/No</option>
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>

          {/* Row 12 */}
          <div className="dbs-noc-row dbs-noc-row-large">
            <label>Total intake in I Year For Current Academic Year</label>

            <div className="dbs-two-inputs">
              <input
                placeholder="Seats"
                name="totalIntake"
                value={form.totalIntake}
                onChange={handleChange}
              />

              <input placeholder="A.Y" />
            </div>
          </div>

          {/* Row 13 */}
          <div className="dbs-noc-row dbs-noc-row-large">
            <label>
              No. of unfilled seats under Convener Quota and Management Quota
            </label>

            <div className="dbs-two-inputs">
              <input
                placeholder="Seats"
                name="unfilledSeats"
                value={form.unfilledSeats}
                onChange={handleChange}
              />

              <input placeholder="A.Y" />
            </div>
          </div>

          {/* Row 14 */}
          <div className="dbs-noc-row dbs-noc-row-large">
            <label>
              Class, Year & Semester seeking transfer during the academic year
            </label>

            <div className="dbs-two-inputs">
              <input
                name="transferClass"
                value={form.transferClass}
                onChange={handleChange}
              />

              <input />
            </div>
          </div>

          {/* Row 15 */}
          <div className="dbs-noc-row dbs-noc-row-large">
            <label>
              Date & Month of last Examination conducted by University
            </label>

            <input
              type="date"
              name="lastExamDate"
              value={form.lastExamDate}
              onChange={handleChange}
            />
          </div>

          {/* Row 16 */}
          <div className="dbs-noc-row">
            <label>Admission Quota</label>

            <select
              name="quotaType"
              value={form.quotaType}
              onChange={handleChange}
            >
              <option value="">Select Quota</option>
              <option>Convener</option>
              <option>Spot</option>
              <option>Management</option>
            </select>
          </div>

          {/* Row 17 */}
          <div className="dbs-noc-row dbs-noc-row-large">
            <label>
              Annual tuition fee paid by the candidate
            </label>

            <input
              name="tuitionPaid"
              value={form.tuitionPaid}
              onChange={handleChange}
            />
          </div>

          {/* Row 18 */}
          <div className="dbs-noc-row dbs-noc-row-large">
            <label>
              Annual tuition fee Chargeable at the new Institution
            </label>

            <input
              name="tuitionNewInstitution"
              value={form.tuitionNewInstitution}
              onChange={handleChange}
            />
          </div>

          {/* Row 19 */}
          <div className="dbs-noc-row">
            <label>Reason For Transfer</label>

            <select
              name="reasonForTransfer"
              value={form.reasonForTransfer}
              onChange={handleChange}
            >
              <option value="">Select Reason</option>
              <option>Personal</option>
              <option>Health</option>
              <option>Financial</option>
              <option>Relocation</option>
            </select>
          </div>

          {/* Row 20 */}
          <div className="dbs-noc-row">
            <label>Name of the Principal</label>

            <input
              name="principalName"
              value={form.principalName}
              onChange={handleChange}
            />
          </div>
          <div className="dbs-form-actions-row">
            <button
              type="button"
              className="dbs-form-cancel-btn"
              onClick={resetForm}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="dbs-form-save-btn"
            >
              <Save size={16} />
              Save
            </button>

            <button
              type="button"
              className="dbs-form-reprint-btn"
              onClick={handlePrint}
            >
              <Printer size={16} />
              Reprint
            </button>

          </div>
        </div>
      </form>

      {/* TABLE */}
      <div className="dbs-dashboard-card dbs-datatable-card">

        <div className="dbs-datatable-header-area">
          <div>
            <h3>NOC Registry</h3>
            <p>NOC Registry records</p>
          </div>
        </div>

        <div className="dbs-table-container">

          {records.length === 0 ? (
            <div className="dbs-empty-state">
              <HelpCircle className="dbs-empty-state-icon" />
              <div className="dbs-empty-state-title">No Records Found</div>
              <div className="dbs-empty-state-desc">
                Add NOC Registry details using the form above.
              </div>
            </div>
          ) : (
            <table className="dbs-data-table">
              <thead>
                <tr>
                  <th>NOC No</th>
                  <th>Reg No</th>
                  <th>Student</th>
                  <th>Programme</th>
                  <th>Branch</th>
                  <th>Year</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {records.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.nocNo}</strong></td>
                    <td>{item.regNo}</td>
                    <td>{item.studentName}</td>
                    <td>{item.programme}</td>
                    <td>{item.branch}</td>
                    <td>{item.year}</td>
                    <td>{item.date}</td>

                    <td>
                      <div className="dbs-table-actions-row">
                        <button className="dbs-table-action-icon-btn dbs-btn-edit">
                          <Edit3 size={14} />
                        </button>

                        <button
                          className="dbs-table-action-icon-btn dbs-btn-delete"
                          onClick={() => setDeleteId(item.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          )}

        </div>
      </div>

    </div>
  );
};

export default NoObjectionCertificate;