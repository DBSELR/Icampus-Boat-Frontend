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

      // only add lsid during edit
      if (leaveStructureForm.lsid) {
        payload.lsid = leaveStructureForm.lsid;
      }

      console.log("Saving Structure Payload:", payload);

      const response = await saveLeaveStructure(payload);
      console.log("Save Leave Structure Response:", response);

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
    console.log("Editing Leave Type:", item);

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

      console.log("Leave Structure:", response);

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

      console.log("Leave Type Response:", response);

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

      console.log("Leave LType Response:", response);

      setLeaveAllTypes(response || []);
    } catch (error) {
      console.error("Leave Type Fetch Error:", error);

      setLeaveAllTypes([]);
    } finally {
      setLoadingLeaveLTypes(false);
    }
  };

  const handleEditLeaveStructure = (item: any) => {
    console.log("Editing Leave Structure:", item);
    console.log("aLY value:", item.aLY);
    console.log("aLM value:", item.aLM);
    console.log("aLD value:", item.aLD);
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

        <div className="dbs-leave-panel">
          <div className="dbs-panel-heading">
            <FileText size={20} />

            <span>Leave Type</span>
          </div>

          <div className="dbs-leave-body">
            <div className="dbs-field">
              <label>Leave Short Name</label>

              <input
                name="lsname"
                placeholder="Enter short name"
                value={leaveForm.lsname}
                onChange={handleChange}
              />
            </div>

            <div className="dbs-field">
              <label>Leave Description</label>

              <input
                name="ldesc"
                placeholder="Enter description"
                value={leaveForm.ldesc}
                onChange={handleChange}
              />
            </div>

            <div className="dbs-actions">
              <button className="dbs-btn secondary" onClick={handleCancel}>
                <X size={16} />
                Cancel
              </button>

              <button
                className="dbs-btn primary"
                onClick={handleSaveLeaveType}
                disabled={saving}
              >
                <Save size={16} />
                {saving ? "Saving..." : leaveForm.lid ? "Update" : "Save"}
              </button>
            </div>

            {/* TABLE */}

            <div className="dbs-table-wrapper dbs-leave-table-scroll">
              <table className="dbs-modern-table">
                <thead>
                  <tr>
                    <th>Leave Type</th>

                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingLeaveLTypes ? (
                    <tr>
                      <td colSpan={2} className="dbs-empty-row">
                        Loading leave types...
                      </td>
                    </tr>
                  ) : leaveAAllTypes.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="dbs-empty-row">
                        No Leave Types Found
                      </td>
                    </tr>
                  ) : (
                    leaveAAllTypes.map((item, index) => (
                      <tr key={item.iD || index}>
                        <td>{item.leave}</td>

                        <td>
                          <button
                            className="dbs-icon-btn"
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

        <div className="dbs-leave-panel">
          <div className="dbs-panel-heading">
            <Layers size={20} />

            <span>Leave Structure</span>
          </div>

          <div className="dbs-leave-body">
            <div className="dbs-two-column">
              <div className="dbs-field">
                <label>Year</label>

                <input
                  name="lyer"
                  value={leaveStructureForm.lyer || ""}
                  onChange={handleStructureChange}
                />
              </div>

              <div className="dbs-field">
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

            <div className="dbs-two-column">
              <div className="dbs-field">
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

              <div className="dbs-field">
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

            <div className="dbs-two-column">
              <div className="dbs-field">
                <label>Leaves Per Duration</label>

                <input
                  name="lvFrDuration"
                  value={leaveStructureForm.lvFrDuration}
                  onChange={handleStructureChange}
                />
              </div>

              <div className="dbs-field">
                <label>Leaves Per Year</label>

                <input
                  name="lvforYr"
                  value={leaveStructureForm.lvforYr}
                  onChange={handleStructureChange}
                />
              </div>
            </div>

            <div className="dbs-field">
              <label>Remarks</label>

              <textarea
                name="remark"
                value={leaveStructureForm.remark}
                onChange={handleStructureChange}
              />
            </div>

            <div className="dbs-actions right">
              <button
                className="dbs-btn secondary"
                onClick={clearLeaveStructure}
              >
                <X size={16} />
                Cancel
              </button>
              <button
                className="dbs-btn primary"
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

            <div className="dbs-table-header">
              <span>
                Total Records: <strong>{leaveStructures.length}</strong>
              </span>
            </div>
            <div className="dbs-table-wrapper">
              <div className="dbs-table-wrapper dbs-leave-structure-scroll">
                <table className="dbs-modern-table">
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
                        <td colSpan={6} className="dbs-empty-row">
                          Loading Leave Structure...
                        </td>
                      </tr>
                    ) : leaveStructures.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="dbs-empty-row">
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
                            <button className="dbs-icon-btn">
                              <Edit3
                                size={16}
                                onClick={() => handleEditLeaveStructure(item)}
                              />
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
    </div>
  );
};

export default LeaveType;
