import React, { useMemo, useState } from "react";
import { Save, X, Wallet, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import "./Expenditure.css";

// =====================================================
// TYPES
// =====================================================

interface StudentInfo {
  regNo: string;
  studentName: string;
  course: string;
  branch: string;
}

interface ExpenditureRow {
  id: string;
  sno: number;
  year: string;
  headName: string;
  amount: string;
  selected: boolean;
}

// =====================================================
// MOCK DATA
// =====================================================

const MOCK_STUDENT: StudentInfo = {
  regNo: "24761A0501",
  studentName: "AKKINAPALLI CHARAN",
  course: "01-B.Tech",
  branch: "05-COMPUTER SCIENCE AND ENGINEERING",
};

const buildMockRows = (): ExpenditureRow[] =>
  Array.from({ length: 12 }).map((_, index) => ({
    id: String(index + 1),
    sno: index + 1,
    year: "1",
    headName: "Boarding And Lodging Fee",
    amount: "45000",
    selected: false,
  }));

// =====================================================
// COMPONENT
// =====================================================

const Expenditure = () => {
  // ===================================================
  // STATES
  // ===================================================

  const [student] = useState<StudentInfo>(MOCK_STUDENT);

  const [rows, setRows] = useState<ExpenditureRow[]>(buildMockRows);

  const [saving, setSaving] = useState(false);

  // ===================================================
  // DERIVED VALUES
  // ===================================================

  const allSelected = rows.length > 0 && rows.every((row) => row.selected);

  const someSelected = rows.some((row) => row.selected) && !allSelected;

  const selectedCount = rows.filter((row) => row.selected).length;

  const totalFee = useMemo(
    () =>
      rows
        .filter((row) => row.selected)
        .reduce((sum, row) => sum + (Number(row.amount) || 0), 0),
    [rows],
  );

  // ===================================================
  // SELECT ALL
  // ===================================================

  const handleSelectAll = (checked: boolean) => {
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        selected: checked,
      })),
    );
  };

  // ===================================================
  // ROW SELECT
  // ===================================================

  const handleRowSelect = (id: string, checked: boolean) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              selected: checked,
            }
          : row,
      ),
    );
  };

  // ===================================================
  // AMOUNT CHANGE
  // ===================================================

  const handleAmountChange = (id: string, value: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              amount: String(value),
            }
          : row,
      ),
    );
  };

  // ===================================================
  // CANCEL
  // ===================================================

  const handleCancel = () => {
    setRows(buildMockRows());
  };

  // ===================================================
  // SAVE
  // ===================================================

  const handleSave = async () => {
    const selectedRows = rows.filter((row) => row.selected);

    if (selectedRows.length === 0) {
      toast.error("Please select at least one fee head");
      return;
    }

    // Validate selected amounts
    const invalidAmount = selectedRows.some(
      (row) => row.amount === "" || Number(row.amount) <= 0,
    );

    if (invalidAmount) {
      toast.error("Selected expenditure amount should be greater than 0");
      return;
    }

    try {
      setSaving(true);

      /*
       * ALL values sent to API as strings.
       */

      const payload = {
        regNo: String(student.regNo),

        rows: selectedRows.map((row) => ({
          id: String(row.id),
          year: String(row.year),
          headName: String(row.headName),
          amount: String(row.amount),
        })),

        totalFee: String(totalFee),
      };

      console.log("SAVE EXPENDITURE CERTIFICATE PAYLOAD:", payload);

      // TODO:
      // await saveExpenditureCertificate(payload);

      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success("Expenditure Certificate Saved Successfully");
    } catch (error) {
      console.error("Save Expenditure Certificate Error:", error);

      toast.error("Unable to save expenditure certificate");
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="dbs-expenditure-container">
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="dbs-expenditure-page-header">
        <div>
          <h2>Expenditure Certificate</h2>

          <p className="dbs-expenditure-subtitle">
            View and select expenditure details for the student
          </p>
        </div>
      </div>

      {/* =================================================
          STUDENT DETAILS CARD
      ================================================= */}

      <div className="dbs-expenditure-student-card">
        <div className="dbs-expenditure-section-title">
          <div className="dbs-expenditure-section-icon">
            <Wallet size={18} />
          </div>

          <div>
            <h3>Student Details</h3>

            <p>Student information for the expenditure certificate</p>
          </div>
        </div>

        <div className="dbs-expenditure-info-grid">
          {/* REG NO */}

          <div className="dbs-expenditure-input">
            <label>Reg. No</label>

            <input type="text" value={student.regNo} readOnly />
          </div>

          {/* STUDENT NAME */}

          <div className="dbs-expenditure-input">
            <label>Student Name</label>

            <input type="text" value={student.studentName} readOnly />
          </div>

          {/* COURSE */}

          <div className="dbs-expenditure-input">
            <label>Course</label>

            <input type="text" value={student.course} readOnly />
          </div>

          {/* BRANCH */}

          <div className="dbs-expenditure-input">
            <label>Branch</label>

            <input type="text" value={student.branch} readOnly />
          </div>
        </div>

        {/* =================================================
            FOOTER / ACTIONS
        ================================================= */}

        <div className="dbs-expenditure-footer">
          <div className="dbs-expenditure-actions">
            <button
              type="button"
              className="dbs-expenditure-cancel-btn"
              onClick={handleCancel}
              disabled={saving}
            >
              <X size={16} />
              Cancel
            </button>

            <button
              type="button"
              className="dbs-expenditure-save-btn"
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={16} />

              {saving ? "Saving..." : "Save"}
            </button>
          </div>

          <div className="dbs-expenditure-total">
            <div className="dbs-expenditure-total-label">Total Fee</div>

            <div className="dbs-expenditure-total-value">
              ₹ {totalFee.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          EXPENDITURE HEADER
      ================================================= */}

      <div className="dbs-expenditure-table-header">
        <div>
          <h2>Expenditure Details</h2>

          <p className="dbs-expenditure-subtitle">
            Select the applicable expenditure heads and verify the amounts
          </p>
        </div>

        <div className="dbs-expenditure-selection-count">
          {selectedCount} Selected
        </div>
      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="dbs-expenditure-table-container">
        {rows.length === 0 ? (
          <div className="dbs-expenditure-empty-state">
            <AlertCircle className="dbs-expenditure-empty-icon" />

            <div className="dbs-expenditure-empty-title">
              No expenditure heads found
            </div>

            <div className="dbs-expenditure-empty-desc">
              No expenditure details are available for this student.
            </div>
          </div>
        ) : (
          <div className="dbs-expenditure-table-card">
            <div className="dbs-expenditure-table-scroll">
              <table className="dbs-expenditure-data-table">
                <thead>
                  <tr>
                    <th>SL.NO</th>

                    <th>YEAR</th>

                    <th>EXPENDITURE HEAD</th>

                    <th>AMOUNT</th>

                    <th>
                      <label className="dbs-expenditure-select-all">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={(el) => {
                            if (el) {
                              el.indeterminate = someSelected;
                            }
                          }}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />

                        <span>Select All</span>
                      </label>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className={
                        row.selected ? "dbs-expenditure-selected-row" : ""
                      }
                    >
                      {/* SL NO */}

                      <td>{row.sno}</td>

                      {/* YEAR */}

                      <td>{row.year}</td>

                      {/* HEAD */}

                      <td className="dbs-expenditure-head-cell">
                        {row.headName}
                      </td>

                      {/* AMOUNT */}

                      <td className="dbs-expenditure-amount-column">
                        <div className="dbs-expenditure-amount-wrapper">
                          <span>₹</span>

                          <input
                            type="number"
                            className="dbs-expenditure-amount-input"
                            value={row.amount}
                            min="0"
                            onChange={(e) =>
                              handleAmountChange(row.id, e.target.value)
                            }
                          />
                        </div>
                      </td>

                      {/* CHECKBOX */}

                      <td className="dbs-expenditure-check-cell">
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={(e) =>
                            handleRowSelect(row.id, e.target.checked)
                          }
                        />
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

export default Expenditure;
