import React, { useState, useEffect, useRef } from "react";
import {
  Save,
  X,
  Edit3,
  Trash2,
  AlertCircle,
  Search,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import "./HeadMaster.css";
import { getProgramme } from "../../../apis/Common";
import {
  getHeadsMasterList,
  getHeadsOrder,
  getFHData,
  getAccountNoAjax,
  getFeeTypeAjax,
  saveHeadsMaster,
  deleteHeadsMaster,
} from "../../../apis/FeeApis";
import DeleteModal from "../../../common/DeleteModal";

export interface ApiHeadMasterRecord {
  id?: number;
  iD?: number;
  fEENAME?: string;
  feename?: string;
  sHORTNAME?: string;
  shortname?: string;
  fEETYPE?: string;
  feetype?: string;
  oRDER?: number;
  order?: number;
  mORDER?: number;
  aMOUNT?: number;
  amount?: number;
  aCNO?: string;
  aCCOUNTNO?: string;
  accountno?: string;
  cOURSE?: string;
  cOURSECODE?: string;
  programme?: string;
  aCADEMICYEAR?: string;
  academicYear?: string;
}

export const HeadsMaster: React.FC = () => {
  // Course / Programme state
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [loadingProgrammes, setLoadingProgrammes] = useState(false);
  const [course, setCourse] = useState<string>("");

  // Academic year from storage or fallback
  const academicYear = localStorage.getItem("academicYear") || "2025-2026";

  // Form Fields
  const [shortName, setShortName] = useState("");
  const [feeName, setFeeName] = useState("");
  const [feeType, setFeeType] = useState("");
  const [order, setOrder] = useState("");
  const [amount, setAmount] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Table Data State
  const [tableData, setTableData] = useState<ApiHeadMasterRecord[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [searchingShortName, setSearchingShortName] = useState(false);

  // Autocomplete Suggestions
  const [feeTypeSuggestions, setFeeTypeSuggestions] = useState<string[]>([]);
  const [showFeeTypeDropdown, setShowFeeTypeDropdown] = useState(false);
  const [loadingFeeTypeAjax, setLoadingFeeTypeAjax] = useState(false);

  const [accountNoSuggestions, setAccountNoSuggestions] = useState<string[]>(
    [],
  );
  const [showAccountNoDropdown, setShowAccountNoDropdown] = useState(false);
  const [loadingAccountNoAjax, setLoadingAccountNoAjax] = useState(false);

  // Delete Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ApiHeadMasterRecord | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Dropdown click-outside refs
  const feeTypeRef = useRef<HTMLDivElement>(null);
  const accountNoRef = useRef<HTMLDivElement>(null);

  // ==========================================================
  // 1. LOAD PROGRAMMES (Common API)
  // ==========================================================
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoadingProgrammes(true);
        const data = await getProgramme();
        console.log("Programmes API Response:", data);

        if (Array.isArray(data)) {
          setProgrammes(data);
          if (data.length > 0) {
            const firstCode = String(
              data[0].COURSECODE ?? data[0].COURSE_CODE ?? data[0].ID ?? "",
            );
            if (firstCode) {
              setCourse(firstCode);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load courses:", err);
        toast.error("Failed to load course list");
      } finally {
        setLoadingProgrammes(false);
      }
    };

    loadCourses();
  }, []);

  // ==========================================================
  // 2. LOAD HEADS MASTER LIST & HEADS ORDER FOR SELECTED COURSE
  // ==========================================================
  const fetchTableData = async (courseCode: string) => {
    if (!courseCode) {
      setTableData([]);
      return;
    }
    try {
      setLoadingTable(true);
      const payload = {
        id: "string",
        academicYear,
        programme: courseCode,
        feetype: "string",
        order: "string",
        feename: "string",
        shortname: "string",
        amount: "string",
        accountno: "string",
      };
      const data = await getHeadsMasterList(payload);
      const list = Array.isArray(data) ? data : data?.data;
      if (Array.isArray(list)) {
        setTableData(list);
      } else {
        setTableData([]);
      }
    } catch (err) {
      console.error("Error fetching heads list:", err);
      toast.error("Failed to load fee heads list");
      setTableData([]);
    } finally {
      setLoadingTable(false);
    }
  };

  const fetchHeadsOrder = async (courseCode: string) => {
    if (!courseCode) return;
    try {
      const payload = {
        id: "string",
        academicYear,
        programme: courseCode,
        feetype: "string",
        order: "string",
        feename: "string",
        shortname: "string",
        amount: "string",
        accountno: "string",
      };
      const data = await getHeadsOrder(payload);
      const list = Array.isArray(data) ? data : data?.data;
      if (Array.isArray(list) && list.length > 0) {
        const rawOrder = list[0]?.mORDER ?? list[0]?.oRDER ?? list[0]?.order;
        if (rawOrder !== undefined && rawOrder !== null) {
          const nextOrder = (Number(rawOrder) || 0) + 1;
          setOrder(String(nextOrder));
        }
      }
    } catch (err) {
      console.error("Error fetching heads order:", err);
    }
  };

  useEffect(() => {
    if (course) {
      fetchTableData(course);
      if (!editingId) {
        fetchHeadsOrder(course);
      }
    }
  }, [course, academicYear]);

  // ==========================================================
  // 3. SHORT NAME LOOKUP (GetFHData API)
  // ==========================================================
  const handleShortNameLookup = async (nameToLookup?: string) => {
    const code = (nameToLookup ?? shortName).trim();
    if (!code) return;

    if (!course) {
      toast.error("Please select a Course first");
      return;
    }

    try {
      setSearchingShortName(true);
      const payload = {
        id: "string",
        academicYear,
        programme: course,
        feetype: "string",
        order: "string",
        feename: "string",
        shortname: code,
        amount: "string",
        accountno: "string",
      };
      const data = await getFHData(payload);
      const list = Array.isArray(data) ? data : data?.data;

      if (Array.isArray(list) && list.length > 0) {
        const match = list[0];
        setFeeName(match.fEENAME || match.feename || "");
        setFeeType(match.fEETYPE || match.feetype || "");
        setOrder(
          match.oRDER !== undefined && match.oRDER !== null
            ? String(match.oRDER)
            : match.order !== undefined && match.order !== null
            ? String(match.order)
            : "",
        );
        setAmount(
          match.aMOUNT !== undefined && match.aMOUNT !== null
            ? String(match.aMOUNT)
            : match.amount !== undefined && match.amount !== null
            ? String(match.amount)
            : "",
        );
        setAccountNo(match.aCCOUNTNO || match.aCNO || match.accountno || "");
        setEditingId(String(match.iD ?? match.id ?? ""));
        toast.success("Fee Head details loaded!");
      } else {
        toast.error("Short Name not found");
        setFeeName("");
        setFeeType("");
        setAmount("");
        setAccountNo("");
        setEditingId(null);
        if (course) {
          fetchHeadsOrder(course);
        }
      }
    } catch (err) {
      console.error("Error searching short name:", err);
      toast.error("Unable to lookup Short Name");
    } finally {
      setSearchingShortName(false);
    }
  };

  // ==========================================================
  // 4. FEE TYPE AJAX AUTOCOMPLETE (FeeTypeAjax API)
  // ==========================================================
  const handleFeeTypeInput = async (val: string) => {
    setFeeType(val);
    if (!val.trim()) {
      setFeeTypeSuggestions([]);
      setShowFeeTypeDropdown(false);
      return;
    }

    try {
      setLoadingFeeTypeAjax(true);
      const payload = {
        id: "string",
        academicYear,
        programme: course,
        feetype: val.trim(),
        order: "string",
        feename: "string",
        shortname: "string",
        amount: "string",
        accountno: "string",
      };
      const data = await getFeeTypeAjax(payload);
      const list = Array.isArray(data) ? data : data?.data;

      if (Array.isArray(list)) {
        const resultList = list
          .map((item: any) => item.fEETYPE || item.feetype)
          .filter((item: any): item is string => Boolean(item));
        setFeeTypeSuggestions(resultList);
        setShowFeeTypeDropdown(resultList.length > 0);
      } else {
        setFeeTypeSuggestions([]);
        setShowFeeTypeDropdown(false);
      }
    } catch (err) {
      console.error("FeeTypeAjax error:", err);
    } finally {
      setLoadingFeeTypeAjax(false);
    }
  };

  const selectFeeTypeSuggestion = (item: string) => {
    setFeeType(item);
    setShowFeeTypeDropdown(false);
  };

  // ==========================================================
  // 5. ACCOUNT NO. AJAX AUTOCOMPLETE (AccountNoAjax API)
  // ==========================================================
  const handleAccountNoInput = async (val: string) => {
    setAccountNo(val);
    if (!val.trim()) {
      setAccountNoSuggestions([]);
      setShowAccountNoDropdown(false);
      return;
    }

    try {
      setLoadingAccountNoAjax(true);
      const payload = {
        id: "string",
        academicYear,
        programme: course,
        feetype: "string",
        order: "string",
        feename: "string",
        shortname: "string",
        amount: "string",
        accountno: val.trim(),
      };
      const data = await getAccountNoAjax(payload);
      const list = Array.isArray(data) ? data : data?.data;

      if (Array.isArray(list)) {
        const resultList = list
          .map((item: any) => item.aCNO || item.accountno || item.aCCOUNTNO)
          .filter((item: any): item is string => Boolean(item));
        setAccountNoSuggestions(resultList);
        setShowAccountNoDropdown(resultList.length > 0);
      } else {
        setAccountNoSuggestions([]);
        setShowAccountNoDropdown(false);
      }
    } catch (err) {
      console.error("AccountNoAjax error:", err);
    } finally {
      setLoadingAccountNoAjax(false);
    }
  };

  const selectAccountNoSuggestion = (item: string) => {
    setAccountNo(item);
    setShowAccountNoDropdown(false);
  };

  // ==========================================================
  // CLICK OUTSIDE AUTOCOMPLETE PANELS
  // ==========================================================
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        feeTypeRef.current &&
        !feeTypeRef.current.contains(event.target as Node)
      ) {
        setShowFeeTypeDropdown(false);
      }
      if (
        accountNoRef.current &&
        !accountNoRef.current.contains(event.target as Node)
      ) {
        setShowAccountNoDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ==========================================================
  // FORM RESET & ACTIONS
  // ==========================================================
  const resetForm = () => {
    setEditingId(null);
    setShortName("");
    setFeeName("");
    setFeeType("");
    setAmount("");
    setAccountNo("");
    setShowFeeTypeDropdown(false);
    setShowAccountNoDropdown(false);
    if (course) {
      fetchHeadsOrder(course);
    }
  };

  const handleSave = async () => {
    if (!course) {
      toast.error("Please select a Course");
      return;
    }
    if (!shortName.trim()) {
      toast.error("Please enter Short Name");
      return;
    }
    if (!feeName.trim()) {
      toast.error("Please enter Fee Name");
      return;
    }
    if (!feeType.trim()) {
      toast.error("Please enter Fee Type");
      return;
    }
    if (!order.trim()) {
      toast.error("Please enter Order");
      return;
    }
    if (!amount.toString().trim()) {
      toast.error("Please enter Amount");
      return;
    }
    if (!accountNo.trim()) {
      toast.error("Please enter Account Number");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        id: editingId ? String(editingId) : "",
        academicYear,
        programme: course,
        feetype: feeType.trim(),
        order: order.trim(),
        feename: feeName.trim(),
        shortname: shortName.trim().toUpperCase(),
        amount: amount.toString().trim(),
        accountno: accountNo.trim(),
      };

      console.log("Saving Fee Head Payload:", payload);
      const res = await saveHeadsMaster(payload);

      toast.success(
        res?.message ||
          (editingId
            ? "Fee Head updated successfully"
            : "Fee Head saved successfully"),
      );
      resetForm();
      if (course) {
        fetchTableData(course);
        fetchHeadsOrder(course);
      }
    } catch (err: any) {
      console.error("Save fee head error:", err);
      toast.error(err?.response?.data?.message || err?.message || "An error occurred while saving Fee Head");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (row: ApiHeadMasterRecord) => {
    setEditingId(String(row.iD ?? row.id ?? ""));
    setCourse(row.cOURSECODE || row.cOURSE || row.programme || "");
    setShortName(row.sHORTNAME || row.shortname || "");
    setFeeName(row.fEENAME || row.feename || "");
    setFeeType(row.fEETYPE || row.feetype || "");
    setOrder(
      row.oRDER !== undefined && row.oRDER !== null
        ? String(row.oRDER)
        : row.order !== undefined && row.order !== null
        ? String(row.order)
        : "",
    );
    setAmount(
      row.aMOUNT !== undefined && row.aMOUNT !== null
        ? String(row.aMOUNT)
        : row.amount !== undefined && row.amount !== null
        ? String(row.amount)
        : "",
    );
    setAccountNo(row.aCCOUNTNO || row.aCNO || row.accountno || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openDeleteModal = (row: ApiHeadMasterRecord) => {
    setItemToDelete(row);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setDeleting(true);
      const payload = {
        id: String(itemToDelete.iD ?? itemToDelete.id ?? ""),
        academicYear: itemToDelete.aCADEMICYEAR || itemToDelete.academicYear || academicYear,
        programme: itemToDelete.cOURSECODE || itemToDelete.cOURSE || itemToDelete.programme || course,
        feetype: itemToDelete.fEETYPE || itemToDelete.feetype || "string",
        order: String(itemToDelete.oRDER ?? itemToDelete.order ?? "string"),
        feename: itemToDelete.fEENAME || itemToDelete.feename || "string",
        shortname: itemToDelete.sHORTNAME || itemToDelete.shortname || "string",
        amount: String(itemToDelete.aMOUNT ?? itemToDelete.amount ?? "string"),
        accountno: itemToDelete.aCCOUNTNO || itemToDelete.aCNO || itemToDelete.accountno || "string",
      };

      console.log("Deleting Fee Head Payload:", payload);
      const res = await deleteHeadsMaster(payload);

      toast.success(
        res?.message ||
          `Fee Head "${itemToDelete.fEENAME}" deleted successfully`,
      );
      if (editingId === String(itemToDelete.iD)) {
        resetForm();
      }
      if (course) {
        fetchTableData(course);
        fetchHeadsOrder(course);
      }
    } catch (err: any) {
      console.error("Delete fee head error:", err);
      toast.error(err?.response?.data?.message || err?.message || "An error occurred while deleting Fee Head");
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const formatAmount = (val: number) =>
    val.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="dbs-headmaster-container">
      {/* Page Header */}
      <div className="dbs-headmaster-header">
        <div>
          <h2>Head Master</h2>
          <p className="dbs-headmaster-subtitle">
            Configure course-wise fee heads, order, and amounts ({academicYear})
          </p>
        </div>
      </div>

      {/* Configuration Form Card */}
      <div className="dbs-headmaster-form-card">
        <h3>{editingId ? "Edit Fee Head" : "Fee Head Configuration"}</h3>

        <div className="dbs-headmaster-grid">
          {/* Course (Programme) Dropdown */}
          <div className="dbs-headmaster-input">
            <label>Course *</label>
            <select
              value={course}
              onChange={(e) => {
                const selected = e.target.value;
                setCourse(selected);
                resetForm();
              }}
              disabled={loadingProgrammes}
            >
              <option value="">-- Select Course --</option>
              {programmes.map((p, idx) => {
                const code = String(
                  p.COURSECODE ?? p.COURSE_CODE ?? p.ID ?? idx,
                );
                const name =
                  p.COURSE ?? p.PROGRAMME ?? p.NAME ?? p.COURSENAME ?? code;
                return (
                  <option key={code || idx} value={code}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Short Name with Lookup Search */}
          <div className="dbs-headmaster-input">
            <label>Short Name *</label>
            <div className="dbs-input-with-action">
              <input
                type="text"
                placeholder="Enter Short Name (e.g. TF)"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                onBlur={() => handleShortNameLookup()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleShortNameLookup();
                  }
                }}
              />
              <button
                type="button"
                className="dbs-input-action-btn"
                onClick={() => handleShortNameLookup()}
                title="Lookup short name"
                disabled={searchingShortName || !shortName.trim()}
              >
                {searchingShortName ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Search size={16} />
                )}
              </button>
            </div>
          </div>

          {/* Fee Name */}
          <div className="dbs-headmaster-input">
            <label>Fee Name *</label>
            <input
              type="text"
              placeholder="Fee Name"
              value={feeName}
              onChange={(e) => setFeeName(e.target.value)}
            />
          </div>

          {/* Fee Type with Autocomplete */}
          <div
            className="dbs-headmaster-input dbs-headmaster-input-relative"
            ref={feeTypeRef}
          >
            <label>Fee Type *</label>
            <input
              type="text"
              placeholder="Search or enter Fee Type..."
              value={feeType}
              onChange={(e) => handleFeeTypeInput(e.target.value)}
              onFocus={() => {
                if (feeTypeSuggestions.length > 0) setShowFeeTypeDropdown(true);
              }}
            />
            {showFeeTypeDropdown && (
              <ul className="dbs-autocomplete-dropdown">
                {loadingFeeTypeAjax ? (
                  <li className="dbs-autocomplete-empty">Searching...</li>
                ) : feeTypeSuggestions.length > 0 ? (
                  feeTypeSuggestions.map((item, idx) => (
                    <li
                      key={idx}
                      className="dbs-autocomplete-item"
                      onClick={() => selectFeeTypeSuggestion(item)}
                    >
                      {item}
                    </li>
                  ))
                ) : (
                  <li className="dbs-autocomplete-empty">No results found</li>
                )}
              </ul>
            )}
          </div>

          {/* Order (Fetched from HeadsOrder) */}
          <div className="dbs-headmaster-input">
            <label>Order *</label>
            <input
              type="text"
              placeholder="Order"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            />
          </div>

          {/* Amount */}
          <div className="dbs-headmaster-input">
            <label>Amount *</label>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Account No. with Autocomplete */}
          <div
            className="dbs-headmaster-input dbs-headmaster-input-relative"
            ref={accountNoRef}
          >
            <label>Account No. *</label>
            <input
              type="text"
              placeholder="Search or enter Account Number..."
              value={accountNo}
              onChange={(e) => handleAccountNoInput(e.target.value)}
              onFocus={() => {
                if (accountNoSuggestions.length > 0)
                  setShowAccountNoDropdown(true);
              }}
            />
            {showAccountNoDropdown && (
              <ul className="dbs-autocomplete-dropdown">
                {loadingAccountNoAjax ? (
                  <li className="dbs-autocomplete-empty">Searching...</li>
                ) : accountNoSuggestions.length > 0 ? (
                  accountNoSuggestions.map((item, idx) => (
                    <li
                      key={idx}
                      className="dbs-autocomplete-item"
                      onClick={() => selectAccountNoSuggestion(item)}
                    >
                      {item}
                    </li>
                  ))
                ) : (
                  <li className="dbs-autocomplete-empty">No results found</li>
                )}
              </ul>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="dbs-headmaster-actions">
          <button
            type="button"
            className="dbs-headmaster-reset-btn"
            onClick={resetForm}
            disabled={saving}
          >
            <X size={16} />
            Cancel
          </button>

          <button
            type="button"
            className="dbs-headmaster-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving
              ? editingId
                ? "Updating..."
                : "Saving..."
              : editingId
                ? "Update"
                : "Save"}
          </button>
        </div>
      </div>

      {/* Table Section Header */}
      <div className="dbs-headmaster-table-header">
        <div>
          <h2>Fee Heads List</h2>
          <p className="dbs-headmaster-subtitle">
            {tableData.length} records found for selected course
          </p>
        </div>
      </div>

      {/* Table Container */}
      <div className="dbs-headmaster-table-container">
        {loadingTable ? (
          <div className="dbs-empty-state">
            <Loader2 className="dbs-empty-state-icon animate-spin" />
            <div className="dbs-empty-state-title">Loading Fee Heads...</div>
            <div className="dbs-empty-state-desc">
              Please wait while we retrieve the records.
            </div>
          </div>
        ) : tableData.length === 0 ? (
          <div className="dbs-empty-state">
            <AlertCircle className="dbs-empty-state-icon" />
            <div className="dbs-empty-state-title">No records found</div>
            <div className="dbs-empty-state-desc">
              Select a Course or add a new fee head to view records here.
            </div>
          </div>
        ) : (
          <div className="dbs-table-card">
            <div className="dbs-table-scroll active-scroll">
              <table className="dbs-data-table">
                <thead>
                  <tr>
                    <th>S.NO</th>
                    <th>FEE NAME</th>
                    <th>SHORT NAME</th>
                    <th>FEE TYPE</th>
                    <th>ACCOUNT NO.</th>
                    <th>AMOUNT</th>
                    <th>EDIT</th>
                    <th>DELETE</th>
                  </tr>
                </thead>

                <tbody>
                  {tableData.map((row, idx) => (
                    <tr key={row.iD ?? idx}>
                      <td>{idx + 1}</td>
                      <td>{row.fEENAME}</td>
                      <td>{row.sHORTNAME}</td>
                      <td>{row.fEETYPE}</td>
                      <td>{row.aCCOUNTNO}</td>
                      <td className="dbs-headmaster-amount-td">
                        {formatAmount(Number(row.aMOUNT) || 0)}
                      </td>
                      <td className="dbs-headmaster-action-td">
                        <button
                          type="button"
                          className="dbs-headmaster-action-btn dbs-headmaster-edit-btn"
                          onClick={() => handleEdit(row)}
                          title="Edit fee head"
                        >
                          <Edit3 size={14} />
                        </button>
                      </td>
                      <td className="dbs-headmaster-action-td">
                        <button
                          type="button"
                          className="dbs-headmaster-action-btn dbs-headmaster-delete-btn"
                          onClick={() => openDeleteModal(row)}
                          title="Delete fee head"
                        >
                          <Trash2 size={14} />
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

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        title="Delete Fee Head"
        itemName={itemToDelete?.fEENAME || ""}
        loading={deleting}
        onCancel={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default HeadsMaster;
