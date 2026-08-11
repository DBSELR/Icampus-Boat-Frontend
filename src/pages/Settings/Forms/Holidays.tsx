import { useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Edit3,
  Save,
  Trash2,
  X,
} from "lucide-react";
import "./Holidays.css";
import { toast } from "sonner";
import {
  deleteHoliday,
  getHolidays,
  insertSundays,
} from "../../../apis/SettingsApis";
import DeleteModal from "../../../common/DeleteModal";
import Footer from "../../../common/Footer";

const Holidays = () => {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
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

  const totalRecords = holidays.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentData = holidays.slice(startIndex, endIndex);

  const fetchHolidays = async () => {
    try {
      const academicYear = localStorage.getItem("academicYear");
      const response = await getHolidays({ academicYear });
      setHolidays(response || []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching holidays:", error);
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
        if (response?.rowsAffected > 0) {
          savedCount++;
        }
        // Move to next day
        current.setDate(current.getDate() + 1);
      }

      if (savedCount > 0) {
        toast.success(`${savedCount} holidays saved successfully`);
        fetchHolidays();
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
    <div className="dbs-holidays-container">
      <div className="dbs-holidays-header">
        <div>
          <h2>Holiday Master</h2>
          <p className="dbs-holidays-subtitle">Manage Holidays and Sundays</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="dbs-holidays-form-card">
        <h3>{editId ? "Update Holiday" : "Add Holiday"}</h3>
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
            <X size={16} />
            Cancel
          </button>

          <button className="dbs-holiday-save" onClick={handleSave}>
            <Save size={16} />
            {editId ? "Update" : "Save"}
          </button>

          <button className="dbs-holiday-secondary" onClick={handleSaveSundays}>
            <CalendarDays size={16} />
            Save Sundays
          </button>
        </div>
      </div>

      {/* ================= Table Header ================= */}
      <div className="dbs-holidays-header dbs-table-head">
        <div>
          <h2>Holiday Registry</h2>
          <p className="dbs-holidays-subtitle">
            View and manage holiday records
          </p>
        </div>

        {/* <span className="dbs-total-badge">Total : {holidays.length}</span> */}
      </div>

      {/* ================= Table ================= */}
      <div className="dbs-table-container">
        {holidays.length === 0 ? (
          <div className="dbs-empty-state">
            <AlertCircle className="dbs-empty-state-icon" />
            <div className="dbs-empty-state-title">No records found</div>
            <div className="dbs-empty-state-desc">
              Add a new holiday to view records here.
            </div>
          </div>
        ) : (
          <div className="dbs-table-card">
            <div className="dbs-table-scroll active-scroll">
              <table className="dbs-data-table">
                <thead>
                  <tr>
                    <th>SL.NO</th>
                    <th>HOLIDAY DATE</th>
                    <th>REMARKS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {currentData.map((item: any, index) => (
                    <tr key={item.id}>
                      <td>{startIndex + index + 1}</td>
                      <td>{formatDate(item.holidayDate)}</td>
                      <td>{item.remark}</td>
                      <td>
                        <div className="dbs-holidays-actions-buttons">
                          <button
                            type="button"
                            className="dbs-holidays-edit"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            type="button"
                            className="dbs-holidays-delete"
                            onClick={() => {
                              setDeleteItem(item);
                              setShowDeleteModal(true);
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
