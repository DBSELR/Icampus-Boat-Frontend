
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Save, SquarePen, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import "./Categorytype.css"
import { fetchCategorytype, saveCategorytype } from "../../../apis/SettingsApis";

const Categorytype = () => {

  interface CategoryLoad {
    iD: string;
    cATEGORYTYPE: string;
    cREATEID: string;
  }
  const [categoryTypeLoad, setCategoryTypeLoad] = useState<CategoryLoad[]>([]);

  const [id, setId] = useState<string | "">("");
  const [category, setCategory] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const LoadGrid = async () => {
    try {
      const res = await fetchCategorytype();

      setCategoryTypeLoad(res);
    } catch (err) {
      toast.error("Failed to load data");
    }
  };

  const HandleEdit = (item: CategoryLoad) => {
    setId(item.iD);
    setCategory(item.cATEGORYTYPE);
  };

  const HandleCancel = () => {
    setId("");
    setCategory("");
  };

  const HandleSave = async () => {
    if (category.trim() === "") {
      toast.error("Enter Category Type");
      return;
    }

    try {
      const payload = {
        id: id.toString(),
        Category: category,
        Categorycode: user.userId
      };
      const res = await saveCategorytype(payload);

      if (res.message === "Success" && res.rowsAffected>0) {
        toast.success(id ? "Updated Successfully" : "Saved Successfully");

        HandleCancel();
        LoadGrid();
      }
    } catch (err) {
      toast.error("Save Failed");
    }
  };

  useEffect(() => {
    LoadGrid();
  }, []);


  return (
    <div className="dbs-categotytype-container">

      {/* Header */}
      <div className="dbs-categotytype-form-header">
        <h2>categotytype Master</h2>
      </div>

      {/* Form Card */}
      <div className="dbs-form-card">
        <h3>categotytype Information</h3>
        <div className="dbs-form-grid-4">
          <div className="dbs-input-box">
            <label>categoty type</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Enter Category Type"
            />
          </div>

        </div>

        {/* Form Buttons */}
        <div className="dbs-form-actions-row">
          <button
            type="button"
            className="dbs-form-cancel-btn"
            onClick={HandleCancel}
          >
            Cancel / Reset
          </button>

          <button
            type="button"
            className="dbs-form-save-btn"
            onClick={HandleSave}
          >
            <Save size={16} />
            {id ? "Update" : "Save"}
          </button>
        </div>
      </div>

      {/* Reactive Table Grid */}
      <div className="dbs-table-container">
        {categoryTypeLoad.length === 0 ? (
          <div className="dbs-empty-state">
            <AlertCircle className="dbs-empty-state-icon" />
            <div className="dbs-empty-state-title">No records found</div>
            <div className="dbs-empty-state-desc">Try clearing your filters or add a new student above.</div>
          </div>
        ) : (
          <div className="dbs-table-card">
            <div
              className={
                categoryTypeLoad.length > 5
                  ? "dbs-table-scroll active-scroll"
                  : "dbs-table-scroll"
              }
            >
              <table className="dbs-data-table">
                <thead>
                  <tr>
                    <th>SL.NO</th>
                    <th>Regu</th>
                    <th>Academicyear</th>
                    <th>Action(s)</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryTypeLoad.map((item, index) => (
                    <tr key={item.iD}>
                      <td>{index + 1}</td>
                      <td>{item.cATEGORYTYPE}</td>
                      <td>{item.cREATEID}</td>

                      <td>
                        <button
                          className="edit-btn"
                          onClick={() => HandleEdit(item)}
                        >
                          <SquarePen size={18} />
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
  )
}

export default Categorytype
