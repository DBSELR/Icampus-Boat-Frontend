import React, { useEffect, useState } from "react";
import { Edit3 } from "lucide-react";
import "./FormRegistration.css";
import {
  getLoadMenu,
  loadFRData,
  loadSMenuId,
  saveFormReg,
} from "../../../apis/SettingsApis";
import { toast } from "sonner";

const FormRegistration = () => {
  const [menuList, setMenuList] = useState<any[]>([]);
  const [sMenuId, setSMenuId] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    menuId: "",
    subMenuId: "",
    text: "",
    description: "",
    formType: "",
    navigateUrl: "",
    isActive: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const fetchMenuId = async () => {
      try {
        const response = await getLoadMenu();
        console.log("Menu Id Response:", response);
        setMenuList(response || []);
      } catch (error) {
        console.log("Error fetching Menu Id:", error);
      }
    };

    fetchMenuId();
  }, []);

  useEffect(() => {
    if (!formData.menuId || isEdit) return;

    const fetchSubMenuId = async () => {
      try {
        const payload = {
          menuId: formData.menuId,
          formType: formData.formType,
        };

        const response = await loadSMenuId(payload);
        setSMenuId(response);
      } catch (error) {
        console.log(error);
      }
    };

    fetchSubMenuId();
  }, [formData.menuId, formData.formType]);

  useEffect(() => {
    const getLoadFRData = async () => {
      try {
        const payload = {
          menuId: formData.menuId,
          formType: "",
        };
        const response = await loadFRData(payload);
        console.log("Form Registration Data:", response);
        setData(response);
      } catch (error) {
        console.log("Error fetching Form Registration Data:", error);
      }
    };

    getLoadFRData();
  }, [formData.menuId]);

  const handleSave = async () => {
    // Validation
    if (!formData.menuId) {
      toast.error("Please select Menu");
      return;
    }

    if (!formData.formType) {
      toast.error("Please select Form Type");
      return;
    }

    const subMenuId = formData.subMenuId || String(sMenuId[0]?.sMENUID || "");

    if (!subMenuId) {
      toast.error("Sub Menu Id is required");
      return;
    }

    if (!formData.text.trim()) {
      toast.error("Please enter Text");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Please enter Description");
      return;
    }

    if (!formData.navigateUrl.trim()) {
      toast.error("Please enter Navigate URL");
      return;
    }

    if (!formData.isActive) {
      toast.error("Please select Status");
      return;
    }

    try {
      const payload = {
        menuId: formData.menuId,
        smenuid: subMenuId,
        text: formData.text,
        description: formData.description,
        nAvUrl: formData.navigateUrl,
        formType: formData.formType,
        isActive: formData.isActive,
        ident: "",
      };

      const response = await saveFormReg(payload);

      console.log("Save Form Registration Response:", response);

      if (response?.message === "Success") {
        toast.success(
          isEdit
            ? "Form Registration updated successfully"
            : "Form Registration saved successfully",
        );

        const tableResponse = await loadFRData({
          menuId: formData.menuId,
          formType: "",
        });

        setData(tableResponse || []);

        setFormData({
          menuId: formData.menuId,
          subMenuId: "",
          text: "",
          description: "",
          formType: "",
          navigateUrl: "",
          isActive: "",
        });

        setSMenuId([]);
        setIsEdit(false);
      } else {
        toast.error("Save failed");
      }
    } catch (error) {
      console.log("Save Error:", error);
      toast.error("Something went wrong");
    }
  };

  const handleCancel = () => {
    setFormData({
      menuId: "",
      subMenuId: "",
      text: "",
      description: "",
      formType: "",
      navigateUrl: "",
      isActive: "",
    });

    setSMenuId([]);
    setIsEdit(false);
  };

  const handleEdit = (item: any) => {
    console.log("Edit Item:", item);
    setIsEdit(true);

    setFormData({
      menuId: String(item.mENUID || ""),
      subMenuId: String(item.sMENUID || ""),
      text: item.tEXT || "",
      description: item.dESCRIPTION || "",
      formType: item.formType || "",
      navigateUrl: item.nAVIGATEURL || "",
      isActive: item.isActive || "",
    });

    // set submenu display value
    setSMenuId([
      {
        sMENUID: item.sMENUID,
      },
    ]);
  };

  return (
    <div className="dbs-formregistration-container">
      <div className="dbs-formregistration-header">
        <h2>Form Registration Master</h2>
      </div>

      <div className="dbs-formregistration-filter-card">
        <h3>Form Configuration</h3>

        <div className="dbs-formregistration-form-grid">
          <div className="dbs-formregistration-input-box">
            <label>Menu</label>
            <select
              name="menuId"
              value={formData.menuId}
              onChange={handleChange}
            >
              <option value="">Select Menu</option>
              {menuList.map((menu) => (
                <option key={menu.mENUID} value={menu.mENUID}>
                  {menu.nAME}
                </option>
              ))}
            </select>
          </div>

          <div className="dbs-formregistration-input-box">
            <label>Form Type</label>
            <select
              name="formType"
              value={formData.formType}
              onChange={handleChange}
            >
              <option value="">Select Form Type</option>

              <option value="Form">Form</option>
              <option value="Report">Report</option>
            </select>
          </div>

          <div className="dbs-formregistration-input-box">
            <label>Sub Menu Id</label>
            <input
              type="text"
              value={
                sMenuId.length > 0 && sMenuId[0].sMENUID
                  ? sMenuId[0].sMENUID
                  : ""
              }
              readOnly
            />
          </div>

          <div className="dbs-formregistration-input-box">
            <label>Navigate URL</label>
            <input
              type="text"
              name="navigateUrl"
              onChange={handleChange}
              value={formData.navigateUrl}
            />
          </div>

          <div className="dbs-formregistration-input-box">
            <label>Text</label>
            <input
              type="text"
              name="text"
              onChange={handleChange}
              value={formData.text}
            />
          </div>

          <div className="dbs-formregistration-input-box">
            <label>Status</label>
            <select
              name="isActive"
              onChange={handleChange}
              value={formData.isActive}
            >
              <option value="">Select Status</option>
              <option value="Y">Active</option>
              <option value="N">Inactive</option>
            </select>
          </div>

          <div className="dbs-formregistration-input-box">
            <label>Description</label>
            <input
              type="text"
              name="description"
              onChange={handleChange}
              value={formData.description}
            />
          </div>
        </div>

        <div className="dbs-formregistration-button-group">
          <button className="dbs-cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button className="dbs-save-btn" onClick={handleSave}>
            {isEdit ? "Update" : "Save"}
          </button>
        </div>
      </div>

      <div className="dbs-formregistration-table-card">
        <div className="dbs-formregistration-table-header">
          <h3>Form Registration List</h3>
          <span>Total Records : {data.length}</span>
        </div>

        <div className="dbs-formregistration-table-scroll">
          <table className="dbs-formregistration-data-table">
            <thead>
              <tr>
                <th>Sub Menu Id</th>
                <th>Text</th>
                <th>Description</th>
                <th>Navigate URL</th>
                <th>Form Type</th>
                <th>Status</th>
                <th>Edit</th>
              </tr>
            </thead>

            <tbody>
              {data.length > 0 ? (
                data.map((item: any) => (
                  <tr key={item.sMENUID}>
                    <td>{item.sMENUID}</td>
                    <td>{item.tEXT}</td>
                    <td>{item.dESCRIPTION}</td>
                    <td>{item.nAVIGATEURL}</td>
                    <td>{item.formType}</td>
                    <td>{item.isActive}</td>
                    <td>
                      <button
                        className="dbs-formregistration-edit-btn"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit3 />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} align="center">
                    No Records Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FormRegistration;
