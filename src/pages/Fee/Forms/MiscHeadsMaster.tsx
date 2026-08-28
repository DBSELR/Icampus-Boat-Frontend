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
import "./MiscHeadsMaster.css";
import {
  getMiscHeadsMasterList,
  getMiscHeadsOrder,
  saveMiscHeadsMaster,
  deleteMiscHeadsMaster,
  getMiscHeadData,
  getMiscAccountNoAjax,
} from "../../../apis/FeeApis";
import DeleteModal from "../../../common/DeleteModal";

export interface ApiMiscHeadMasterRecord {
  id?: number;
  iD?: number;
  fEENAME?: string;
  feename?: string;
  sHORTNAME?: string;
  shortname?: string;
  fEETYPE?: string;
  feetype?: string;
  mORDER?: number;
  oRDER?: number;
  order?: number;
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

export const MiscHeadsMaster: React.FC = () => {
  // Academic year from storage or fallback
  const academicYear = localStorage.getItem("academicYear") || "2025-2026";

  // Form Fields
  const [feeName, setFeeName] = useState("");
  const [shortName, setShortName] = useState("");
  const [feeType, setFeeType] = useState("");
  const [order, setOrder] = useState("");
  const [amount, setAmount] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Table Data State
  const [tableData, setTableData] = useState<ApiMiscHeadMasterRecord[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchingFeeName, setSearchingFeeName] = useState(false);

  // Autocomplete Suggestions
  const [accountNoSuggestions, setAccountNoSuggestions] = useState<string[]>([]);
  const [showAccountNoDropdown, setShowAccountNoDropdown] = useState(false);
  const [loadingAccountNoAjax, setLoadingAccountNoAjax] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ApiMiscHeadMasterRecord | null>(null);

  // Dropdown ref
  const accountNoRef = useRef<HTMLDivElement>(null);

  // ==========================================================
  // 1. FETCH TABLE DATA (HeadsMasterList)
  // ==========================================================
  const fetchTableData = async () => {
    try {
      setLoadingTable(true);
      const payload = {
        id: "string",
        academicYear,
        programme: "string",
        feetype: "string",
        order: "string",
        feename: "string",
        shortname: "string",
        amount: "string",
        accountno: "string",
      };
      const data = await getMiscHeadsMasterList(payload);
      const list = Array.isArray(data) ? data : data?.data;
      if (Array.isArray(list)) {
        setTableData(list);
      } else {
        setTableData([]);
      }
    } catch (err) {
      console.error("Error fetching Misc Heads list:", err);
      toast.error("Failed to load fee heads list");
      setTableData([]);
    } finally {
      setLoadingTable(false);
    }
  };

  // ==========================================================
  // 2. FETCH NEXT ORDER (HeadsOrder)
  // ==========================================================
  const fetchNextOrder = async () => {
    try {
      const payload = {
        id: "string",
        academicYear,
        programme: "string",
        feetype: "string",
        order: "string",
        feename: "string",
        shortname: "string",
        amount: "string",
        accountno: "string",
      };
      const data = await getMiscHeadsOrder(payload);
      const list = Array.isArray(data) ? data : data?.data;

      if (Array.isArray(list) && list.length > 0) {
        const rawOrder = list[0]?.mORDER ?? list[0]?.oRDER ?? list[0]?.order;
        if (rawOrder !== undefined && rawOrder !== null) {
          const nextOrder = (Number(rawOrder) || 0) + 1;
          setOrder(String(nextOrder));
        }
      }
    } catch (err) {
      console.error("Error fetching Misc Heads order:", err);
    }
  };

  useEffect(() => {
    fetchTableData();
    fetchNextOrder();
  }, [academicYear]);

  // ==========================================================
  // 3. FEE NAME LOOKUP (GetHeadData)
  // ==========================================================
  const handleFeeNameLookup = async (nameToLookup?: string) => {
    const code = (nameToLookup ?? feeName).trim();
    if (!code) return;

    try {
      setSearchingFeeName(true);
      const payload = {
        id: "string",
        academicYear,
        programme: "string",
        feetype: "string",
        order: "string",
        feename: code,
        shortname: "string",
        amount: "string",
        accountno: "string",
      };
      const data = await getMiscHeadData(payload);
      const list = Array.isArray(data) ? data : data?.data;

      if (Array.isArray(list) && list.length > 0) {
        const match = list[0];
        setFeeName(match.fEENAME || match.feename || "");
        setShortName(match.sHORTNAME || match.shortname || "");
        setFeeType(match.fEETYPE || match.feetype || "");
        setOrder(
          match.oRDER !== undefined && match.oRDER !== null
            ? String(match.oRDER)
            : match.order !== undefined && match.order !== null
            ? String(match.order)
            : match.mORDER !== undefined && match.mORDER !== null
            ? String(match.mORDER)
            : ""
        );
        setAmount(
          match.aMOUNT !== undefined && match.aMOUNT !== null
            ? String(match.aMOUNT)
            : match.amount !== undefined && match.amount !== null
            ? String(match.amount)
            : ""
        );
        setAccountNo(match.aCCOUNTNO || match.aCNO || match.accountno || "");
        setEditingId(String(match.iD ?? match.id ?? ""));
        toast.success("Fee Head details loaded!");
      } else {
        toast.error("Fee Name not found");
        setShortName("");
        setFeeType("");
        setAmount("");
        setAccountNo("");
        setEditingId(null);
        fetchNextOrder();
      }
    } catch (err) {
      console.error("Error searching fee name:", err);
      toast.error("Unable to lookup Fee Name");
    } finally {
      setSearchingFeeName(false);
    }
  };

  // ==========================================================
  // 4. ACCOUNT NO AJAX AUTOCOMPLETE (AccountNoAjax)
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
        programme: "string",
        feetype: "string",
        order: "string",
        feename: "string",
        shortname: "string",
        amount: "string",
        accountno: val.trim(),
      };
      const data = await getMiscAccountNoAjax(payload);
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
      console.error("MiscAccountNoAjax error:", err);
    } finally {
      setLoadingAccountNoAjax(false);
    }
  };

  const selectAccountNoSuggestion = (item: string) => {
    setAccountNo(item);
    setShowAccountNoDropdown(false);
  };

  // Click outside listener for Account No dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
  // 5. RESET / CANCEL
  // ==========================================================
  const resetForm = () => {
    setEditingId(null);
    setFeeName("");
    setShortName("");
    setFeeType("");
    setAmount("");
    setAccountNo("");
    setShowAccountNoDropdown(false);
    fetchNextOrder();
  };

  // ==========================================================
  // 6. SAVE / UPDATE (SaveHeadsMaster)
  // ==========================================================
  const handleSave = async () => {
    if (!feeName.trim()) {
      toast.error("Please enter Fee Name");
      return;
    }
    if (!shortName.trim()) {
      toast.error("Please enter Short Name");
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
        programme: "string",
        feetype: feeType.trim(),
        order: order.trim(),
        feename: feeName.trim(),
        shortname: shortName.trim().toUpperCase(),
        amount: amount.toString().trim(),
        accountno: accountNo.trim(),
      };

      console.log("Saving Misc Fee Head Payload:", payload);
      const res = await saveMiscHeadsMaster(payload);

      toast.success(
        res?.message ||
          (editingId
            ? "Fee Head updated successfully"
            : "Fee Head saved successfully")
      );
      resetForm();
      fetchTableData();
    } catch (err: any) {
      console.error("Save Misc Fee Head error:", err);
      toast.error(err?.response?.data?.message || err?.message || "An error occurred while saving Fee Head");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // 7. EDIT
  // ==========================================================
  const handleEdit = (row: ApiMiscHeadMasterRecord) => {
    setEditingId(String(row.iD ?? row.id ?? ""));
    setFeeName(row.fEENAME || row.feename || "");
    setShortName(row.sHORTNAME || row.shortname || "");
    setFeeType(row.fEETYPE || row.feetype || "");
    setOrder(
      row.oRDER !== undefined && row.oRDER !== null
        ? String(row.oRDER)
        : row.order !== undefined && row.order !== null
        ? String(row.order)
        : row.mORDER !== undefined && row.mORDER !== null
        ? String(row.mORDER)
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

  // ==========================================================
  // 8. DELETE (DeleteHeadsMaster)
  // ==========================================================
  const openDeleteModal = (row: ApiMiscHeadMasterRecord) => {
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
        programme: itemToDelete.cOURSECODE || itemToDelete.cOURSE || itemToDelete.programme || "string",
        feetype: itemToDelete.fEETYPE || itemToDelete.feetype || "string",
        order: String(itemToDelete.oRDER ?? itemToDelete.order ?? itemToDelete.mORDER ?? "string"),
        feename: itemToDelete.fEENAME || itemToDelete.feename || "string",
        shortname: itemToDelete.sHORTNAME || itemToDelete.shortname || "string",
        amount: String(itemToDelete.aMOUNT ?? itemToDelete.amount ?? "string"),
        accountno: itemToDelete.aCCOUNTNO || itemToDelete.aCNO || itemToDelete.accountno || "string",
      };

      console.log("Deleting Misc Fee Head Payload:", payload);
      const res = await deleteMiscHeadsMaster(payload);

      toast.success(
        res?.message ||
          `Fee Head "${itemToDelete.fEENAME}" deleted successfully`
      );
      if (editingId === String(itemToDelete.iD)) {
        resetForm();
      }
      fetchTableData();
      fetchNextOrder();
    } catch (err: any) {
      console.error("Delete Misc Fee Head error:", err);
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
          <h2>Miscellaneous Fee Head Master</h2>
          <p className="dbs-headmaster-subtitle">
            Configure miscellaneous fee heads, order, and amounts ({academicYear})
          </p>
        </div>
      </div>

      {/* Configuration Form Card */}
      <div className="dbs-headmaster-form-card">
        <h3>{editingId ? "Edit Fee Head" : "Miscellaneous Fee Head Configuration"}</h3>

        <div className="dbs-headmaster-grid">
          {/* Fee Name with Lookup Search (First Field) */}
          <div className="dbs-headmaster-input">
            <label>Fee Name *</label>
            <div className="dbs-input-with-action">
              <input
                type="text"
                placeholder="Enter Fee Name"
                value={feeName}
                onChange={(e) => setFeeName(e.target.value)}
                onBlur={() => handleFeeNameLookup()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleFeeNameLookup();
                  }
                }}
              />
              <button
                type="button"
                className="dbs-input-action-btn"
                onClick={() => handleFeeNameLookup()}
                title="Lookup fee name"
                disabled={searchingFeeName || !feeName.trim()}
              >
                {searchingFeeName ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Search size={16} />
                )}
              </button>
            </div>
          </div>

          {/* Short Name */}
          <div className="dbs-headmaster-input">
            <label>Short Name *</label>
            <input
              type="text"
              placeholder="Enter Short Name (e.g. PRO FEE)"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
            />
          </div>

          {/* Fee Type */}
          <div className="dbs-headmaster-input">
            <label>Fee Type *</label>
            <input
              type="text"
              placeholder="Fee Type"
              value={feeType}
              onChange={(e) => setFeeType(e.target.value)}
            />
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
          <h2>Miscellaneous Fee Heads List</h2>
          <p className="dbs-headmaster-subtitle">
            {tableData.length} records found
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
              Add a new fee head to view records here.
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
                    <th>ORDER</th>
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
                      <td>{row.oRDER}</td>
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
        title="Delete Miscellaneous Fee Head"
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

export default MiscHeadsMaster;


