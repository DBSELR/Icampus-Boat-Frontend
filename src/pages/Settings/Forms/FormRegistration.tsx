import React, { useEffect, useState } from "react";
import { AlertCircle, Edit3, Save, X } from "lucide-react";
import "./FormRegistration.css";
import {
  getLoadMenu,
  loadFRData,
  loadSMenuId,
  saveFormReg,
} from "../../../apis/SettingsApis";
import { toast } from "sonner";
import Footer from "../../../common/Footer";

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

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);

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
        setMenuList(response || []);
      } catch (error) {
        console.error("Error fetching Menu Id:", error);
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
        console.error(error);
      }
    };

    fetchSubMenuId();
  }, [formData.menuId, formData.formType]);

  useEffect(() => {
    setCurrentPage(1);
    if (!formData.menuId) {
      setData([]);
      return;
    }
    const getLoadFRData = async () => {
      try {
        const payload = {
          menuId: formData.menuId,
          formType: "",
        };
        const response = await loadFRData(payload);
        const validData = Array.isArray(response)
          ? response.filter((item: any) => Number(item.sMENUID) > 0)
          : [];
        setData(validData);
      } catch (error) {
        console.error("Error fetching Form Registration Data:", error);
        setData([]);
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
      console.error("Save Error:", error);
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

  const totalRecords = data.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = Math.min(startIndex + recordsPerPage, totalRecords);
  const currentData = data.slice(startIndex, endIndex);
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

  return (
    <div className="dbs-formregistration-container">
      <div className="dbs-formregistration-header">
        <h2>Form Registration Master</h2>
        <p>
          {" "}
          Manage form details, menu mapping, navigation, and registration
          status.{" "}
        </p>
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
            <X size={16} />
            Cancel
          </button>
          <button className="dbs-save-btn" onClick={handleSave}>
            <Save size={16} />
            {isEdit ? "Update" : "Save"}
          </button>
        </div>
      </div>
      <div className="dbs-formregistration-header">
        <h3>Form Registration List</h3>
        <p>Manage and configure registered forms.</p>
      </div>

      {/* Table */}
      <div className="dbs-formregistration-table-card">
        {data.length === 0 ? (
          <div className="dbs-empty-state">
            <AlertCircle className="dbs-empty-state-icon" />
            <div className="dbs-empty-state-title">No records found</div>
            <div className="dbs-empty-state-desc">
              No form registration records are available for the selected menu.
            </div>
          </div>
        ) : (
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
                {currentData.map((item: any, index: number) => (
                  <tr key={item.sMENUID || index}>
                    <td>{item.sMENUID}</td>
                    <td>{item.tEXT}</td>
                    <td>{item.dESCRIPTION}</td>
                    <td>{item.nAVIGATEURL}</td>
                    <td>{item.formType}</td>
                    <td>{item.isActive}</td>s
                    <td>
                      <button
                        className="dbs-formregistration-edit-btn"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit3 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

export default FormRegistration;
