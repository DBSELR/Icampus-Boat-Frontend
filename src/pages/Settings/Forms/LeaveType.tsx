import React, { useEffect, useState } from "react";
import { Save, X, Edit3, Trash2, FileText, Layers } from "lucide-react";

import "./LeaveType.css";
import {
  getLeavelLtypeList,
  getLeaveStructureList,
  getLeaveTypeList,
  saveLeaveStructure,
  saveLeaveType,
} from "../../../apis/SettingsApis";
import { toast } from "sonner";

const LeaveType = () => {
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [leaveAAllTypes, setLeaveAllTypes] = useState<any[]>([]);
  const [loadingLeaveTypes, setLoadingLeaveTypes] = useState(false);
  const [loadingLeaveLTypes, setLoadingLeaveLTypes] = useState(false);
  const [leaveStructures, setLeaveStructures] = useState<any[]>([]);
  const [loadingStructures, setLoadingStructures] = useState(false);
  const [isStructureEdit, setIsStructureEdit] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    lid: "",
    lsname: "",
    ldesc: "",
  });
  const [leaveStructureForm, setLeaveStructureForm] = useState({
    lsid: "",
    lid: "",
    leaveType: "",
    workMode: "",
    lvforYr: "",
    lvformnth: "",
    lyer: "",
    remark: "",
    duration: "",
    lvFrDuration: "",
  });

  const handleStructureChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setLeaveStructureForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [savingStructure, setSavingStructure] = useState(false);
  const [saving, setSaving] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLeaveForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveLeaveStructure = async () => {
    // Validation
    if (!leaveStructureForm.lyer.trim()) {
      toast.error("Enter Year");
      return;
    }

    if (!leaveStructureForm.lid) {
      toast.error("Select Leave Type");
      return;
    }

    if (!leaveStructureForm.workMode) {
      toast.error("Select Work Mode");
      return;
    }

    if (!leaveStructureForm.duration) {
      toast.error("Select Duration");
      return;
    }

    if (!leaveStructureForm.lvFrDuration.trim()) {
      toast.error("Enter Leaves Per Duration");
      return;
    }

    if (!leaveStructureForm.lvforYr.trim()) {
      toast.error("Enter Leaves Per Year");
      return;
    }

    try {
      setSavingStructure(true);

      const payload: any = {
        lsid: leaveStructureForm.lsid || "",
        lid: leaveStructureForm.lid,
        leaveType: leaveStructureForm.leaveType,
        workMode: leaveStructureForm.workMode,
        lvforYr: leaveStructureForm.lvforYr || "0",
        lvformnth: leaveStructureForm.lvformnth,
        lyer: leaveStructureForm.lyer,
        remark: leaveStructureForm.remark,
        duration: leaveStructureForm.duration,
        lvFrDuration: leaveStructureForm.lvFrDuration,
      };

      if (leaveStructureForm.lsid) {
        payload.lsid = leaveStructureForm.lsid;
      }
      await saveLeaveStructure(payload);
      toast.success(
        leaveStructureForm.lsid
          ? "Leave Structure Updated"
          : "Leave Structure Saved",
      );

      fetchLeaveStructureList();
      clearLeaveStructure();
    } catch (error) {
      console.error(error);
      toast.error("Unable to save leave structure");
    } finally {
      setSavingStructure(false);
    }
  };

  const handleSaveLeaveType = async () => {
    if (!leaveForm.lsname.trim()) {
      toast.error("Enter Leave Short Name");
      return;
    }
    if (!leaveForm.ldesc.trim()) {
      toast.error("Enter Leave Description");
      return;
    }
    try {
      setSaving(true);

      const payload: any = {
        lsname: leaveForm.lsname,
        ldesc: leaveForm.ldesc,
      };
      // Pass lid only while editing
      if (leaveForm.lid) {
        payload.lid = leaveForm.lid;
      }
      await saveLeaveType(payload);
      toast.success(
        leaveForm.lid
          ? "Leave Type Updated Successfully"
          : "Leave Type Saved Successfully",
      );
      fetchLeaveLtypeList();
      handleCancel();
    } catch (error) {
      console.error(error);
      toast.error("Unable to Save");
    } finally {
      setSaving(false);
    }
  };
  const handleCancel = () => {
    setLeaveForm({
      lid: "",
      lsname: "",
      ldesc: "",
    });
  };

  const handleEdit = (item: any) => {
    const leaveText = item.leave || "";
    const parts = leaveText.split("-");
    setLeaveForm({
      lid: String(item.lID || item.iD || ""),
      lsname: parts[0] || "",
      ldesc: parts.slice(1).join("-") || "",
    });
  };

  const clearLeaveStructure = () => {
    setLeaveStructureForm({
      lsid: "",
      lid: "",
      leaveType: "",
      workMode: "",
      lvforYr: "",
      lvformnth: "",
      lyer: "",
      remark: "",
      duration: "",
      lvFrDuration: "",
    });

    setIsStructureEdit(false);
  };

  const fetchLeaveStructureList = async () => {
    try {
      setLoadingStructures(true);
      const response = await getLeaveStructureList();
      setLeaveStructures(response || []);
    } catch (error) {
      console.error("Leave Structure Fetch Error:", error);
      setLeaveStructures([]);
    } finally {
      setLoadingStructures(false);
    }
  };

  const fetchLeaveTypeList = async () => {
    try {
      setLoadingLeaveTypes(true);
      const response = await getLeaveTypeList();
      setLeaveTypes(response || []);
    } catch (error) {
      console.error("Leave Type Fetch Error:", error);
      setLeaveTypes([]);
    } finally {
      setLoadingLeaveTypes(false);
    }
  };

  const fetchLeaveLtypeList = async () => {
    try {
      setLoadingLeaveLTypes(true);
      const response = await getLeavelLtypeList();
      setLeaveAllTypes(response || []);
    } catch (error) {
      console.error("Leave Type Fetch Error:", error);
      setLeaveAllTypes([]);
    } finally {
      setLoadingLeaveLTypes(false);
    }
  };

  const handleEditLeaveStructure = (item: any) => {
    const selectedLeave = leaveTypes.find((x) => x.leave === item.leave);
    setLeaveStructureForm({
      lsid: String(item.lSID || ""),
      lid: String(selectedLeave?.lID || ""),
      leaveType: item.leave || "",
      workMode: item.wORKMODE || "",
      // aLY -> Leaves Per Year
      lvforYr: String(item.aLY ?? ""),
      // API doesn't return this field
      lvformnth: "",
      lyer: String(item.lYEAR || ""),
      remark: item.rEMARKS || "",
      // aLM -> Duration
      duration: String(item.aLM ?? ""),
      // aLD -> Leaves Per Duration
      lvFrDuration: String(item.aLD ?? ""),
    });

    setIsStructureEdit(true);
  };

  useEffect(() => {
    fetchLeaveTypeList();
    fetchLeaveLtypeList();
    fetchLeaveStructureList();
  }, []);

  return (
    <div className="dbs-leave-page">
      {/* HEADER */}

      <div className="dbs-leave-title">
        <div>
          <h2>Leave Type Master</h2>
          <p>Configure employee leave policies and structures</p>
        </div>
      </div>

      <div className="dbs-leave-grid">
        {/* LEFT PANEL */}
        <div className="leave-type-panel">
          <div className="leave-type-heading">
            <FileText size={20} />
            <span>Leave Type</span>
          </div>

          <div className="leave-type-body">
            <div className="leave-type-field">
              <label>Leave Short Name</label>
              <input
                name="lsname"
                placeholder="Enter short name"
                value={leaveForm.lsname}
                onChange={handleChange}
              />
            </div>

            <div className="leave-type-field">
              <label>Leave Description</label>
              <input
                name="ldesc"
                placeholder="Enter description"
                value={leaveForm.ldesc}
                onChange={handleChange}
              />
            </div>

            <div className="leave-type-actions">
              <button
                className="leave-type-btn leave-type-secondary"
                onClick={handleCancel}
              >
                <X size={16} />
                Cancel
              </button>

              <button
                className="leave-type-btn leave-type-primary"
                onClick={handleSaveLeaveType}
                disabled={saving}
              >
                <Save size={16} />
                {saving ? "Saving..." : leaveForm.lid ? "Update" : "Save"}
              </button>
            </div>

            {/* TABLE */}

            <div className="leave-type-list-title">
              <div>
                <h3>Leave Type List</h3>
                <p>
                  Manage available leave categories and update existing leave
                  type details.
                </p>
              </div>
            </div>

            <div className="leave-type-table-wrapper">
              <table className="leave-type-table">
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loadingLeaveLTypes ? (
                    <tr>
                      <td colSpan={2} className="leave-type-empty-row">
                        Loading leave types...
                      </td>
                    </tr>
                  ) : leaveAAllTypes.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="leave-type-empty-row">
                        No Leave Types Found
                      </td>
                    </tr>
                  ) : (
                    leaveAAllTypes.map((item, index) => (
                      <tr key={item.iD || index}>
                        <td>{item.leave}</td>

                        <td>
                          <button
                            className="leave-type-edit-btn"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit3 size={16} />
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

        {/* RIGHT PANEL */}
        <div className="leave-structure-panel">
          <div className="leave-structure-heading">
            <Layers size={20} />
            <span>Leave Structure</span>
          </div>

          <div className="leave-structure-body">
            <div className="leave-structure-two-column">
              <div className="leave-structure-field">
                <label>Year</label>
                <input
                  name="lyer"
                  value={leaveStructureForm.lyer || ""}
                  onChange={handleStructureChange}
                />
              </div>

              <div className="leave-structure-field">
                <label>Leave Type</label>
                <select
                  name="lid"
                  disabled={isStructureEdit}
                  value={leaveStructureForm.lid || ""}
                  onChange={(e) => {
                    const selectedId = e.target.value;

                    const selectedLeave = leaveTypes.find(
                      (item) => String(item.lID) === selectedId,
                    );

                    setLeaveStructureForm((prev) => ({
                      ...prev,
                      lid: selectedId,
                      leaveType: selectedLeave?.leave || "",
                    }));
                  }}
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map((item) => (
                    <option key={item.iD} value={item.lID}>
                      {item.leave}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="leave-structure-two-column">
              <div className="leave-structure-field">
                <label>Work Mode</label>
                <select
                  name="workMode"
                  value={leaveStructureForm.workMode}
                  onChange={handleStructureChange}
                >
                  <option value="">Select Work Mode</option>
                  <option value="TEACHING">TEACHING</option>
                  <option value="NON-TEACHING">NON-TEACHING</option>
                  <option value="NMR">NON MUSTER ROLL</option>
                </select>
              </div>

              <div className="leave-structure-field">
                <label>Duration</label>
                <select
                  name="duration"
                  value={leaveStructureForm.duration}
                  onChange={handleStructureChange}
                >
                  <option value="">Select Duration</option>
                  <option value="1">Monthly</option>
                  <option value="3">Quarterly</option>
                  <option value="6">Half Yearly</option>
                  <option value="12">Yearly</option>
                </select>
              </div>
            </div>

            <div className="leave-structure-two-column">
              <div className="leave-structure-field">
                <label>Leaves Per Duration</label>
                <input
                  name="lvFrDuration"
                  value={leaveStructureForm.lvFrDuration}
                  onChange={handleStructureChange}
                />
              </div>

              <div className="leave-structure-field">
                <label>Leaves Per Year</label>
                <input
                  name="lvforYr"
                  value={leaveStructureForm.lvforYr}
                  onChange={handleStructureChange}
                />
              </div>
            </div>

            <div className="leave-structure-field">
              <label>Remarks</label>
              <textarea
                name="remark"
                value={leaveStructureForm.remark}
                onChange={handleStructureChange}
              />
            </div>

            <div className="leave-structure-actions leave-structure-right">
              <button
                className="leave-structure-btn leave-structure-secondary"
                onClick={clearLeaveStructure}
              >
                <X size={16} />
                Cancel
              </button>

              <button
                className="leave-structure-btn leave-structure-primary"
                onClick={handleSaveLeaveStructure}
                disabled={savingStructure}
              >
                <Save size={16} />

                {savingStructure
                  ? "Saving..."
                  : leaveStructureForm.lsid
                    ? "Update"
                    : "Save"}
              </button>
            </div>

            <div className="leave-structure-list-title">
              <div>
                <h3>Leave Structure List</h3>
                <p>
                  View and maintain yearly leave allocation rules based on work
                  mode and duration.
                </p>
              </div>
            </div>

            <div className="leave-structure-table-wrapper">
              <table className="leave-structure-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Leave</th>
                    <th>Work Mode</th>
                    <th>Leaves/Year</th>
                    <th>Duration</th>
                    <th>Leaves/Duration</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loadingStructures ? (
                    <tr>
                      <td colSpan={6} className="leave-structure-empty-row">
                        Loading Leave Structure...
                      </td>
                    </tr>
                  ) : leaveStructures.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="leave-structure-empty-row">
                        No Leave Structure Found
                      </td>
                    </tr>
                  ) : (
                    leaveStructures.map((item) => (
                      <tr key={item.lSID}>
                        <td>{item.lYEAR}</td>
                        <td>{item.leave}</td>
                        <td>{item.wORKMODE}</td>
                        <td>{item.aLY}</td>
                        <td>{item.aLM} Months</td>
                        <td>{item.aLD}</td>

                        <td>
                          <button
                            className="leave-structure-edit-btn"
                            onClick={() => handleEditLeaveStructure(item)}
                          >
                            <Edit3 size={16} />
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
      </div>
    </div>
  );
};

export default LeaveType;
