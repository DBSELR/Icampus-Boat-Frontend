import React, { useEffect, useState } from "react";
import { Save } from "lucide-react";
import "./UserAccess.css";
import {
  getERPForms,
  getERPModulesList,
  getERPUserGroupList,
  getUserGroupMenuLoad,
  saveUserAcces,
} from "../../../apis/SettingsApis";
import { toast } from "sonner";

const UserAccess = () => {
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  const [modules, setModules] = useState<any[]>([]);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [userGroupMenuLoad, setUserGroupMenuLoad] = useState<any[]>([]);
  console.log(userGroupMenuLoad, "userGroupMenuLoad");
  const [loadingForms, setLoadingForms] = useState(false);
  const [loadingAssignedForms, setLoadingAssignedForms] = useState(false);

  const [selectedForms, setSelectedForms] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchModules = async () => {
    try {
      const data = await getERPModulesList();
      setModules(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUserGroups = async () => {
    try {
      const response = await getERPUserGroupList();
      setUserGroups(response);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchForms = async (moduleId = "") => {
    try {
      setLoadingForms(true);

      const payload = {
        userGroup: "",
        chUG: "",
        menuID: moduleId,
      };

      console.log("Forms Payload:", payload);

      const response = await getERPForms(payload);

      setForms(response || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingForms(false);
    }
  };

  const fetchUserGroupMenuLoad = async () => {
    try {
      setLoadingAssignedForms(true);

      const payload = {
        userGroup: selectedUser,
      };

      const response = await getUserGroupMenuLoad(payload);
      setUserGroupMenuLoad(response || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingAssignedForms(false);
    }
  };

  const handleSaveAccess = async () => {
    if (!selectedUser) {
      toast.error("Please select user group");
      return;
    }

    if (selectedForms.length === 0) {
      toast.error("Please select forms");
      return;
    }

    try {
      setSaving(true);

      for (const form of selectedForms) {
        const payload = {
          userGroup: selectedUser,
          menuID: String(form.mENUID),
          sMenuID: String(form.sMENUID),
        };

        console.log("Save Payload:", payload);

        const response = await saveUserAcces(payload);

        if (response?.message === "Success" && response?.rowsAffected > 0) {
          toast.success("Access saved successfully");
          await fetchUserGroupMenuLoad();
          await fetchForms(selectedModule);
          setSelectedForms([]);
        } else {
          throw new Error("Save failed");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save one or more records");
    } finally {
      setSaving(false);
    }
  };

  const handleCheckboxChange = (form: any) => {
    setSelectedForms((prev) => {
      const exists = prev.some((item) => item.iD === form.iD);

      if (exists) {
        return prev.filter((item) => item.iD !== form.iD);
      }

      return [...prev, form];
    });
  };

  const handleReset = () => {
    setSelectedModule("");
    setSelectedUser("");
    setUserGroupMenuLoad([]);
    setSelectedForms([]);
  };

  useEffect(() => {
    fetchModules();
    fetchUserGroups();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchUserGroupMenuLoad();
    } else {
      setUserGroupMenuLoad([]);
    }
  }, [selectedUser]);

  useEffect(() => {
    fetchForms(selectedModule);
  }, [selectedModule]);

  const isAssigned = (form: any) => {
    return userGroupMenuLoad.some(
      (item) =>
        String(item.sMenuID) === String(form.sMENUID) ||
        (item.module === form.mODULE &&
          item.mENUTEXT === form.mENUTEXT &&
          item.formType === form.fORMTYPE),
    );
  };

  return (
    <div className="dbs-user-access-page">
      <div className="dbs-user-access-topbar">
        <div>
          <h2>User Access</h2>
          <p>Manage ERP Form Permissions</p>
        </div>
      </div>

      <div className="dbs-user-access-card">
        <div className="dbs-user-access-card-header">
          <h3>User Access Configuration</h3>

          <div className="dbs-user-access-top-actions">
            <button className="dbs-user-access-refresh" onClick={handleReset}>
              Reset
            </button>

            <button
              className="dbs-user-access-save"
              onClick={handleSaveAccess}
              disabled={saving}
            >
              <Save size={16} />
              Save Access
            </button>
          </div>
        </div>

        <div className="dbs-user-access-tables">
          {/* AVAILABLE FORMS */}

          <div className="dbs-user-access-panel-wrapper">
            <div className="dbs-user-access-field">
              <label>Module</label>

              <select
                value={selectedModule}
                onChange={(e) => {
                  setSelectedModule(e.target.value);
                }}
              >
                <option value="">Select Module</option>

                {modules.map((item, index) => (
                  <option key={`${item.mENUID}-${index}`} value={item.mENUID}>
                    {item.text}
                  </option>
                ))}
              </select>
            </div>

            <div className="dbs-user-access-panel">
              <div className="dbs-user-access-panel-header">
                Available Forms
                <span>{forms.length}</span>
              </div>

              <div className="dbs-user-access-table-scroll">
                <table className="dbs-user-access-table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Type</th>
                      <th>Module</th>
                      <th>Form(s)</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingForms ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center" }}>
                          Loading...
                        </td>
                      </tr>
                    ) : forms.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center" }}>
                          No data found.
                        </td>
                      </tr>
                    ) : (
                      forms.map((item, index) => {
                        const assigned = isAssigned(item);

                        return (
                          <tr
                            key={item.iD}
                            className={
                              assigned ? "dbs-user-access-assigned-row" : ""
                            }
                          >
                            <td>{index + 1}</td>

                            <td>{item.fORMTYPE}</td>

                            <td>{item.mODULE}</td>

                            <td>{item.mENUTEXT}</td>

                            <td>
                              <input
                                type="checkbox"
                                checked={
                                  assigned ||
                                  selectedForms.some(
                                    (form) => form.iD === item.iD,
                                  )
                                }
                                disabled={assigned}
                                onChange={() => handleCheckboxChange(item)}
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ASSIGNED FORMS */}

          <div className="dbs-user-access-panel-wrapper">
            <div className="dbs-user-access-field">
              <label>User Group</label>

              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Select User Group</option>

                {userGroups.map((item, index) => (
                  <option key={index} value={item.userID}>
                    {item.userID}
                  </option>
                ))}
              </select>
            </div>

            <div className="dbs-user-access-panel">
              <div className="dbs-user-access-panel-header">
                Assigned Forms
                <span>{userGroupMenuLoad.length}</span>
              </div>

              <div className="dbs-user-access-table-scroll">
                <table className="dbs-user-access-table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Type</th>
                      <th>Module</th>
                      <th>Form(s)</th>
                    </tr>
                  </thead>

                  <tbody>
                    {!selectedUser ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center" }}>
                          Select a User Group to view assigned forms.
                        </td>
                      </tr>
                    ) : loadingAssignedForms ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center" }}>
                          Loading...
                        </td>
                      </tr>
                    ) : userGroupMenuLoad.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center" }}>
                          No data found.
                        </td>
                      </tr>
                    ) : (
                      userGroupMenuLoad.map((item, index) => (
                        <tr key={item.iD}>
                          <td>{index + 1}</td>

                          <td>{item.formType}</td>

                          <td>{item.module}</td>

                          <td>{item.mENUTEXT}</td>
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

export default UserAccess;
