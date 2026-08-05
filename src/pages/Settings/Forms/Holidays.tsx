import { useEffect, useState } from "react";
import { Edit3, Trash2 } from "lucide-react";
import "./Holidays.css";
import { toast } from "sonner";
import {
  deleteHoliday,
  getHolidays,
  insertSundays,
} from "../../../apis/SettingsApis";
import DeleteModal from "../../../common/DeleteModal";

const Holidays = () => {
  const [holidays, setHolidays] = useState<any[]>([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [remarks, setRemarks] = useState("");

  const [editId, setEditId] = useState<string | number>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const formatDate = (date: string) => {
    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const fetchHolidays = async () => {
    try {
      const academicYear = localStorage.getItem("academicYear");
      const response = await getHolidays({ academicYear });

      console.log("Fetched holidays:", response);
      setHolidays(response || []);
    } catch (error) {
      console.log("Error fetching holidays:", error);
      toast.error("Failed to fetch holidays. Please try again later.");
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleSaveSundays = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select From Date and To Date");
      return;
    }

    try {
      let current = new Date(fromDate);
      const end = new Date(toDate);
      let savedCount = 0;

      while (current <= end) {
        if (current.getDay() === 0) {
          const payload = {
            holidayDate: current.toISOString().split("T")[0],
            remarks: remarks || "Sunday",
            id: "",
          };
          const response = await insertSundays(payload);
          //   console.log("Save Sunday ======", response);
          if (response?.message === "Success") {
            savedCount++;
          }
        }
        current.setDate(current.getDate() + 1);
      }

      if (savedCount > 0) {
        toast.success(`${savedCount} Sundays saved successfully`);
        // Reload table
        fetchHolidays();

        // Reset form
        setFromDate("");
        setToDate("");
        setRemarks("");
      } else {
        toast.warning("No Sundays found in selected date range");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save Sundays");
    }
  };

  const handleSave = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select From Date and To Date");
      return;
    }

    try {
      let current = new Date(fromDate);
      const end = new Date(toDate);
      let savedCount = 0;

      while (current <= end) {
        const payload = {
          holidayDate: current.toISOString().split("T")[0],
          remarks: remarks,
          id: String(editId) || "",
        };

        const response = await insertSundays(payload);
        console.log("Holiday saved:", response);

        if (response?.rowsAffected > 0) {
          savedCount++;
        }

        // Move to next day
        current.setDate(current.getDate() + 1);
      }

      if (savedCount > 0) {
        toast.success(`${savedCount} holidays saved successfully`);
        // Reload table
        fetchHolidays();

        // Reset form
        setFromDate("");
        setToDate("");
        setRemarks("");
        setEditId("");
      } else {
        toast.error("No holidays were saved");
      }
    } catch (error) {
      console.error("Save holiday error:", error);
      toast.error("Failed to save holidays");
    }
  };

  const handleCancel = () => {
    setFromDate("");
    setToDate("");
    setRemarks("");
    setEditId("");
  };

  const handleEdit = (item: any) => {
    setEditId(item.id);

    const date = item.holidayDate.split("T")[0];

    setFromDate(date);
    setToDate(date);
    setRemarks(item.remark);
  };

  const handleDelete = async () => {
    try {
      if (!deleteItem?.id) return;  
      setDeleting(true);
      const response = await deleteHoliday(String(deleteItem.id));
      console.log("Delete Holiday Response:", response);

      if (response?.message === "Success") {
        toast.success("Holiday deleted successfully");
        setShowDeleteModal(false);
        setDeleteItem(null);
        fetchHolidays();
      } else {
        toast.error(response?.message || "Failed to delete holiday");
      }
    } catch (error) {
      console.error("Delete holiday error:", error);
      toast.error("Something went wrong");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="dbs-holidays-container">
      <div className="dbs-holidays-header">
        <h2>Holiday Master</h2>
      </div>

      {/* Form Card */}
      <div className="dbs-holidays-form-card">
        <h3>Holiday Information</h3>

        <div className="dbs-holidays-grid">
          <div className="dbs-holidays-input">
            <label>From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="dbs-holidays-input">
            <label>To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div className="dbs-holidays-input dbs-holidays-full">
            <label>Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter remarks..."
            />
          </div>
        </div>

        <div className="dbs-holidays-actions">
          <button className="dbs-holiday-cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button className="dbs-holiday-save" onClick={handleSave}>
            {editId ? "Update" : "Save"}
          </button>
          <button className="dbs-holiday-secondary" onClick={handleSaveSundays}>
            Save Sundays
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="dbs-holidays-table-card">
        <div className="dbs-holidays-table-header">
          <h3>Holiday List</h3>
          <span>Total : {holidays.length}</span>
        </div>

        <div className="dbs-holidays-table-scroll">
          <table className="dbs-holidays-table">
            <thead>
              <tr>
                <th>Holiday Date</th>
                <th>Remarks</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {holidays.length > 0 ? (
                holidays.map((item: any) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.holidayDate)}</td>
                    <td>{item.remark}</td>

                    <td>
                      <button className="dbs-holidays-edit">
                        <Edit3 size={16} onClick={() => handleEdit(item)} />
                      </button>
                    </td>

                    <td>
                      <button
                        className="dbs-holidays-delete"
                        onClick={() => {
                          setDeleteItem(item);
                          setShowDeleteModal(true);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} align="center">
                    No Holidays Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <DeleteModal
        open={showDeleteModal}
        title="Delete Holiday"
        itemName={deleteItem?.remark}
        loading={deleting}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteItem(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Holidays;
