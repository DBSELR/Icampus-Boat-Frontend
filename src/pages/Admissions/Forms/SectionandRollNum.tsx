import React, { useState } from "react";
import { Save, Trash2, Edit3, AlertTriangle, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import "./SectionandRollNum.css";

interface Allocation {
  cid: number;
  StudyingYear: number;
  Course: string;
  Branch: string;
  SectionCapacity: number;
  RollNoStartFrom: number;
  To: number;
  Section: string;
  Alloted: number;
}

const INITIAL_ALLOCATIONS: Allocation[] = [
  {
    cid: 5,
    StudyingYear: 3,
    Course: "01-B.Tech",
    Branch: "05-COMPUTER SCIENCE AND ENGINEERING",
    SectionCapacity: 68,
    RollNoStartFrom: 1,
    To: 40,
    Section: "D",
    Alloted: 40
  }
];

export const SectionRollNumber: React.FC = () => {
  const [allocations, setAllocations] = useState<Allocation[]>(INITIAL_ALLOCATIONS);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [course, setCourse] = useState("01-B.Tech");
  const [branch, setBranch] = useState("05-COMPUTER SCIENCE AND ENGINEERING");
  const [studyingYear, setStudyingYear] = useState("3");
  const [section, setSection] = useState("D");
  const [rollStart, setRollStart] = useState("1");
  const [rollTo, setRollTo] = useState("40");
  const [capacity, setCapacity] = useState("68");
  const [alloted, setAlloted] = useState("40");

  // Confirm delete state
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!rollStart || !rollTo || !capacity || !alloted) {
      toast.error("Please fill in all numerical fields");
      return;
    }

    const payload: Allocation = {
      cid: editingId || Math.floor(Math.random() * 100) + 10,
      Course: course,
      Branch: branch,
      StudyingYear: parseInt(studyingYear),
      Section: section,
      RollNoStartFrom: parseInt(rollStart),
      To: parseInt(rollTo),
      SectionCapacity: parseInt(capacity),
      Alloted: parseInt(alloted)
    };

    if (editingId !== null) {
      setAllocations(prev => prev.map(item => item.cid === editingId ? payload : item));
      toast.success("Section allocation mapping updated!");
      setEditingId(null);
    } else {
      setAllocations(prev => [payload, ...prev]);
      toast.success("New section roll allocation registered!");
    }

    // Reset Form
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setCourse("01-B.Tech");
    setBranch("05-COMPUTER SCIENCE AND ENGINEERING");
    setStudyingYear("3");
    setSection("D");
    setRollStart("1");
    setRollTo("40");
    setCapacity("68");
    setAlloted("40");
  };

  const handleEdit = (item: Allocation) => {
    setEditingId(item.cid);
    setCourse(item.Course);
    setBranch(item.Branch);
    setStudyingYear(item.StudyingYear.toString());
    setSection(item.Section);
    setRollStart(item.RollNoStartFrom.toString());
    setRollTo(item.To.toString());
    setCapacity(item.SectionCapacity.toString());
    setAlloted(item.Alloted.toString());
    toast.info(`Editing allocation ID ${item.cid}`);
  };

  const handleDeleteClick = (cid: number) => {
    setDeleteTargetId(cid);
  };

  const executeDelete = () => {
    if (deleteTargetId !== null) {
      setAllocations(prev => prev.filter(item => item.cid !== deleteTargetId));
      toast.success("Allocation configuration deleted.");
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="dbs-sectionroll-container">
      
      {/* Header */}
      <div className="dbs-admissions-form-header">
        <div>
          <h2>Section And Roll Number</h2>
          <p>Allocate capacity structures, roll ranges, and class streams.</p>
        </div>
      </div>

      {/* Allocation Input Form Card */}
      <form onSubmit={handleSave} className="dbs-admissions-stepper-form-card">
        <div className="dbs-form-card">
          <h3>{editingId ? "Modify Allocation Structure" : "Register Section Capacity Mapping"}</h3>
          
          <div className="dbs-form-grid-3">
            <div className="dbs-input-box">
              <label>Course *</label>
              <select value={course} onChange={(e) => setCourse(e.target.value)}>
                <option value="01-B.Tech">01-B.Tech</option>
                <option value="02-M.Tech">02-M.Tech</option>
                <option value="03-MBA">03-MBA</option>
              </select>
            </div>

            <div className="dbs-input-box">
              <label>Branch *</label>
              <select value={branch} onChange={(e) => setBranch(e.target.value)}>
                <option value="05-COMPUTER SCIENCE AND ENGINEERING">05-COMPUTER SCIENCE AND ENGINEERING</option>
                <option value="88-Data Science(CSE)">88-Data Science(CSE)</option>
                <option value="125-MASTER OF BUSINESS ADMINISTRATION">125-MASTER OF BUSINESS ADMINISTRATION</option>
              </select>
            </div>

            <div className="dbs-input-box">
              <label>Studying Year *</label>
              <select value={studyingYear} onChange={(e) => setStudyingYear(e.target.value)}>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </div>

            <div className="dbs-input-box">
              <label>Section & Stream *</label>
              <select value={section} onChange={(e) => setSection(e.target.value)}>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>
            </div>

            <div className="dbs-input-box">
              <label>Roll No Range *</label>
              <div className="dbs-form-grid-2" style={{ gap: '8px' }}>
                <input 
                  type="number" 
                  placeholder="Start From" 
                  value={rollStart}
                  onChange={(e) => setRollStart(e.target.value)}
                />
                <input 
                  type="number" 
                  placeholder="To" 
                  value={rollTo}
                  onChange={(e) => setRollTo(e.target.value)}
                />
              </div>
            </div>

            <div className="dbs-input-box">
              <label>Capacity & Allotted *</label>
              <div className="dbs-form-grid-2" style={{ gap: '8px' }}>
                <input 
                  type="number" 
                  placeholder="Capacity limit" 
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                />
                <input 
                  type="number" 
                  placeholder="Allotted" 
                  value={alloted}
                  onChange={(e) => setAlloted(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Form Buttons */}
          <div className="dbs-form-actions-row">
            <button type="button" className="dbs-form-cancel-btn" onClick={resetForm}>
              Cancel / Reset
            </button>
            <button type="submit" className="dbs-form-save-btn">
              <Save size={16} />
              <span>{editingId ? "Update Allocation" : "Save Allocation"}</span>
            </button>
          </div>

        </div>
      </form>

      {/* Grid Allocations Table */}
      <div className="dbs-dashboard-card dbs-datatable-card">
        <div className="dbs-datatable-header-area">
          <div>
            <h3>Active Section Layout Registry</h3>
            <p>List of capacities and allocated stream roll numbers</p>
          </div>
        </div>

        <div className="dbs-table-container">
          {allocations.length === 0 ? (
            <div className="dbs-empty-state">
              <HelpCircle className="dbs-empty-state-icon" />
              <div className="dbs-empty-state-title">No allocations defined</div>
              <div className="dbs-empty-state-desc">Use the registration card above to allocate section capacities.</div>
            </div>
          ) : (
            <table className="dbs-data-table">
              <thead>
                <tr>
                  <th>CID</th>
                  <th>Studying Year</th>
                  <th>Course</th>
                  <th>Branch</th>
                  <th>Capacity</th>
                  <th>Roll Start</th>
                  <th>Roll End</th>
                  <th>Section</th>
                  <th>Allotted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((item, idx) => (
                  <tr key={idx}>
                    <td><strong>{item.cid}</strong></td>
                    <td>Year {item.StudyingYear}</td>
                    <td><span className="dbs-pill-category">{item.Course}</span></td>
                    <td className="dbs-branch-td">{item.Branch}</td>
                    <td>{item.SectionCapacity} Students</td>
                    <td>{item.RollNoStartFrom}</td>
                    <td>{item.To}</td>
                    <td><strong>{item.Section}</strong></td>
                    <td>
                      <span className="dbs-pill-success">{item.Alloted} Allocated</span>
                    </td>
                    <td>
                      <div className="dbs-table-actions-row">
                        <button 
                          type="button" 
                          className="dbs-table-action-icon-btn dbs-btn-edit"
                          onClick={() => handleEdit(item)}
                          title="Edit section details"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          type="button" 
                          className="dbs-table-action-icon-btn dbs-btn-delete"
                          onClick={() => handleDeleteClick(item.cid)}
                          title="Delete section mapping"
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

      {/* Delete Confirmation Modal */}
      {deleteTargetId !== null && (
        <div className="dbs-search-overlay-modal">
          <div className="dbs-search-modal-box dbs-confirm-modal-box">
            <div className="dbs-confirm-modal-body">
              <AlertTriangle size={36} className="dbs-warning-danger-icon" />
              <h3>Delete Section Allocation?</h3>
              <p>Are you sure you want to delete allocation ID <strong>{deleteTargetId}</strong>? All registered student links within this range will require re-allocation.</p>
            </div>
            <div className="dbs-confirm-modal-actions">
              <button type="button" className="dbs-confirm-btn-cancel" onClick={() => setDeleteTargetId(null)}>
                Cancel
              </button>
              <button type="button" className="dbs-confirm-btn-delete" onClick={executeDelete}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SectionRollNumber;
