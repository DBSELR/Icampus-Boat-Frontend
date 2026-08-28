import React, { useState, useEffect, useMemo } from "react";
import {
  Save,
  X,
  Trash2,
  Edit3,
  BookOpen,
  Loader2,
  Search,
  Lock,
  User,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAccountsList,
  getAccountData,
  saveAccount,
  deleteAccount,
} from "../../../apis/FeeApis";
import { loginApi } from "../../../apis/AuthApis";
import DeleteModal from "../../../common/DeleteModal";
import "./AccountMaster.css";

export interface ApiAccountRecord {
  iD: number;
  aCNO: string;
  aCSNAME: string;
  aCNAME: string;
  openBalance: number;
}

export interface AccountPayload {
  id: string;
  accountno: string;
  shortname: string;
  accountname: string;
  openBalance: string;
}

export interface Account {
  id: string;
  accountNumber: string;
  shortName: string;
  accountName: string;
  openingBalance: number;
}

export const mapApiAccount = (rec: ApiAccountRecord): Account => ({
  id: String(rec.iD),
  accountNumber: rec.aCNO,
  shortName: rec.aCSNAME,
  accountName: rec.aCNAME,
  openingBalance: Number(rec.openBalance) || 0,
});

// Letters, spaces, and common ledger-name punctuation only — no digits.
const containsDigits = (val: string) => /\d/.test(val);

export const AccountMaster: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [accountNumber, setAccountNumber] = useState("");
  const [shortName, setShortName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");

  // Search State
  const [searchTerm, setSearchTerm] = useState("");

  // Loading / busy flags
  const [listLoading, setListLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Deletion confirm modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Account | null>(null);

  // Authentication popup (shown before a save is committed)
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authUserName, setAuthUserName] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  /* ---------- Load table data ---------- */

  const fetchAccounts = async () => {
    try {
      setListLoading(true);
      const data = await getAccountsList();
      if (Array.isArray(data)) {
        setAccounts(data.map(mapApiAccount));
      } else if (data && Array.isArray(data.data)) {
        setAccounts(data.data.map(mapApiAccount));
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load account list",
      );
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  /* ---------- Filtered Accounts ---------- */
  const filteredAccounts = useMemo(() => {
    if (!searchTerm.trim()) return accounts;
    const term = searchTerm.toLowerCase();
    return accounts.filter(
      (acc) =>
        acc.accountNumber.toLowerCase().includes(term) ||
        acc.shortName.toLowerCase().includes(term) ||
        acc.accountName.toLowerCase().includes(term),
    );
  }, [accounts, searchTerm]);

  /* ---------- Account number lookup (autofill on existing account) ---------- */

  const handleAccountNumberBlur = async () => {
    const acNo = accountNumber.trim();
    if (!acNo || editingId !== null) return; // skip lookup once already in edit mode

    try {
      setLookupLoading(true);
      const payload = {
        id: "string",
        accountno: acNo,
        shortname: "string",
        accountname: "string",
        openBalance: "string",
      };
      const data = await getAccountData(payload);

      const list = Array.isArray(data) ? data : data?.data;
      if (Array.isArray(list) && list.length > 0) {
        const match = mapApiAccount(list[0]);
        setEditingId(match.id);
        setShortName(match.shortName);
        setAccountName(match.accountName);
        setOpeningBalance(String(match.openingBalance));
        toast.info(`Account ${acNo} already exists — details loaded for update.`);
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Could not check account number",
      );
    } finally {
      setLookupLoading(false);
    }
  };

  /* ---------- Text-only fields (Short Name / Account Name) ---------- */

  const handleShortNameChange = (value: string) => {
    if (containsDigits(value)) {
      toast.error("Short Name cannot contain numbers");
      setShortName(value.replace(/[0-9]/g, ""));
    } else {
      setShortName(value);
    }
  };

  const handleAccountNameChange = (value: string) => {
    if (containsDigits(value)) {
      toast.error("Account Name cannot contain numbers");
      setAccountName(value.replace(/[0-9]/g, ""));
    } else {
      setAccountName(value);
    }
  };

  /* ---------- Form submit: validate, then require authentication ---------- */

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !accountNumber.trim() ||
      !shortName.trim() ||
      !accountName.trim() ||
      !openingBalance.trim()
    ) {
      toast.error("Please fill in all account ledger fields");
      return;
    }

    if (containsDigits(shortName) || containsDigits(accountName)) {
      toast.error("Short Name and Account Name cannot contain numbers");
      return;
    }

    setShowAuthModal(true);
  };

  /* ---------- Authentication popup ---------- */

  const closeAuthModal = () => {
    if (authLoading) return;
    setShowAuthModal(false);
    setAuthUserName("");
    setAuthPassword("");
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authUserName.trim() || !authPassword.trim()) {
      toast.error("Please enter both User Name and Password");
      return;
    }

    setAuthLoading(true);
    try {
      const result = await loginApi({
        userId: authUserName.trim(),
        password: authPassword,
      });
      if (result.success) {
        toast.success(result.message || "Authenticated successfully");
        setShowAuthModal(false);
        setAuthUserName("");
        setAuthPassword("");
        await performSave();
      } else {
        toast.error(result.message || "Authentication failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  /* ---------- Save (create or update), run only after successful auth ---------- */

  const performSave = async () => {
    const payload = {
      id: editingId ? String(editingId) : "",
      accountno: accountNumber.trim(),
      shortname: shortName.trim().toUpperCase(),
      accountname: accountName.trim(),
      openBalance: openingBalance.trim(),
    };

    try {
      setSaving(true);
      const res = await saveAccount(payload);
      toast.success(
        res?.message ||
          (editingId
            ? "Account Master ledger updated successfully!"
            : "New Account Master ledger registered!"),
      );
      resetForm();
      fetchAccounts();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to save account",
      );
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setAccountNumber("");
    setShortName("");
    setAccountName("");
    setOpeningBalance("");
  };

  const handleEdit = (acc: Account) => {
    setEditingId(acc.id);
    setAccountNumber(acc.accountNumber);
    setShortName(acc.shortName);
    setAccountName(acc.accountName);
    setOpeningBalance(acc.openingBalance.toString());
    toast.info(`Editing Account Number ${acc.accountNumber}`);
  };

  /* ---------- Delete ---------- */

  const handleDeleteClick = (acc: Account) => {
    setItemToDelete(acc);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;

    try {
      setDeleting(true);
      const payload = {
        id: String(itemToDelete.id),
        accountno: itemToDelete.accountNumber,
        shortname: "string",
        accountname: "string",
        openBalance: "string",
      };
      const res = await deleteAccount(payload);
      toast.success(
        res?.message || `Account Master ${itemToDelete.accountNumber} deleted.`,
      );
      if (editingId === itemToDelete.id) resetForm();
      setDeleteModalOpen(false);
      setItemToDelete(null);
      fetchAccounts();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete account",
      );
    } finally {
      setDeleting(false);
    }
  };

  const formatCurrency = (val: number | string) => {
    const num = typeof val === "number" ? val : parseFloat(val) || 0;
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="dbs-headmaster-container dbs-accountmaster-container">
      {/* Page Header */}
      <div className="dbs-headmaster-header">
        <div>
          <h2>Account Master</h2>
          <p className="dbs-headmaster-subtitle">
            Define ledger accounts, opening balances, and capital funds chart.
          </p>
        </div>
      </div>

      <div className="dbs-accountmaster-split-layout">
        {/* Left Column: Input Form Card */}
        <div className="dbs-accountmaster-form-card">
          <div className="dbs-accountmaster-form-title">
            <BookOpen size={18} color="var(--dbs-primary, #0e7490)" />
            <span>
              {editingId
                ? `Edit Account: ${accountNumber}`
                : "Account Registration"}
            </span>
          </div>

          <form onSubmit={handleFormSubmit}>
            <div className="dbs-accountmaster-form-grid">
              <div className="dbs-headmaster-input">
                <label>Account Number *</label>
                <input
                  type="text"
                  placeholder="Enter ledger code..."
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  onBlur={handleAccountNumberBlur}
                  disabled={editingId !== null}
                />
                {lookupLoading && (
                  <span className="dbs-field-hint">
                    <Loader2 size={12} className="dbs-spin" /> Checking account
                    number...
                  </span>
                )}
              </div>

              <div className="dbs-headmaster-input">
                <label>Short Name *</label>
                <input
                  type="text"
                  placeholder="e.g. TUF, GCF"
                  value={shortName}
                  onChange={(e) => handleShortNameChange(e.target.value)}
                />
              </div>

              <div className="dbs-headmaster-input">
                <label>Account Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Tuition Fee Capital A/C"
                  value={accountName}
                  onChange={(e) => handleAccountNameChange(e.target.value)}
                />
              </div>

              <div className="dbs-headmaster-input">
                <label>Opening Balance (₹) *</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                />
              </div>
            </div>

            {/* Form Action Controls */}
            <div
              className="dbs-headmaster-actions"
              style={{ marginTop: "20px" }}
            >
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
                type="submit"
                className="dbs-headmaster-save-btn"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 size={16} className="dbs-spin" />
                ) : (
                  <Save size={16} />
                )}
                <span>{editingId ? "Update" : "Save"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Ledger List Table Card */}
        <div className="dbs-accountmaster-table-card">
          <div className="dbs-accountmaster-table-header-area">
            <span className="dbs-accountmaster-table-title">
              Active Ledger Chart ({filteredAccounts.length})
            </span>

            <div className="dbs-accountmaster-search-wrap">
              <input
                type="text"
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="dbs-accountmaster-search-input"
              />
              <Search size={14} className="dbs-accountmaster-search-icon" />
            </div>
          </div>

          <div className="dbs-accountmaster-table-scroll">
            <table className="dbs-data-table dbs-accountmaster-table">
              <thead>
                <tr>
                  <th style={{ width: "8%", textAlign: "center" }}>S.No.</th>
                  <th style={{ width: "20%" }}>A/C No.</th>
                  <th style={{ width: "16%" }}>Short Name</th>
                  <th style={{ width: "30%" }}>Account Name</th>
                  <th style={{ width: "16%", textAlign: "right" }}>
                    Opening Balance
                  </th>
                  <th style={{ width: "5%", textAlign: "center" }}>Edit</th>
                  <th style={{ width: "5%", textAlign: "center" }}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {listLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "var(--dbs-text-muted)",
                      }}
                    >
                      <Loader2
                        className="dbs-spin"
                        size={24}
                        style={{
                          display: "block",
                          margin: "0 auto 8px auto",
                          color: "var(--dbs-primary)",
                        }}
                      />
                      <div>Loading accounts...</div>
                    </td>
                  </tr>
                ) : filteredAccounts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        textAlign: "center",
                        padding: "36px",
                        color: "var(--dbs-text-muted)",
                      }}
                    >
                      <BookOpen
                        size={26}
                        style={{
                          margin: "0 auto 8px auto",
                          opacity: 0.4,
                          display: "block",
                        }}
                      />
                      <div>No account records found</div>
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((acc, idx) => (
                    <tr
                      key={acc.id}
                      style={{
                        backgroundColor:
                          editingId === acc.id
                            ? "rgba(124, 58, 237, 0.06)"
                            : undefined,
                      }}
                    >
                      <td style={{ textAlign: "center", fontWeight: 600 }}>
                        {idx + 1}
                      </td>
                      <td style={{ fontWeight: 600 }}>{acc.accountNumber}</td>
                      <td>
                        <span className="dbs-pill-category">
                          {acc.shortName}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{acc.accountName}</td>
                      <td
                        style={{
                          textAlign: "right",
                          fontFamily: "monospace",
                          fontWeight: 600,
                        }}
                      >
                        ₹ {formatCurrency(acc.openingBalance)}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="dbs-table-edit-icon-btn"
                          onClick={() => handleEdit(acc)}
                          title="Edit Account"
                        >
                          <Edit3 size={14} />
                        </button>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="dbs-table-delete-icon-btn"
                          onClick={() => handleDeleteClick(acc)}
                          title="Delete Account"
                        >
                          <Trash2 size={14} />
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

      {/* Delete Confirmation Modal using shared DeleteModal */}
      <DeleteModal
        open={deleteModalOpen}
        title="Delete Account Master"
        itemName={
          itemToDelete
            ? `${itemToDelete.accountName} (${itemToDelete.accountNumber})`
            : ""
        }
        loading={deleting}
        onCancel={() => {
          if (!deleting) {
            setDeleteModalOpen(false);
            setItemToDelete(null);
          }
        }}
        onConfirm={executeDelete}
      />

      {/* Authentication Popup Modal */}
      {showAuthModal && (
        <div className="dbs-auth-overlay-modal">
          <form className="dbs-auth-modal-box" onSubmit={handleAuthSubmit}>
            <div className="dbs-auth-modal-header">
              <ShieldCheck size={18} />
              <span>Check Authentication</span>
            </div>
            <div className="dbs-auth-modal-body">
              <div className="dbs-auth-field-group">
                <label htmlFor="dbs-auth-username">User Name</label>
                <div className="dbs-auth-input-wrap">
                  <User size={14} className="dbs-auth-input-icon" />
                  <input
                    id="dbs-auth-username"
                    type="text"
                    placeholder="Enter username"
                    value={authUserName}
                    onChange={(e) => setAuthUserName(e.target.value)}
                    autoFocus
                    disabled={authLoading}
                    className="dbs-auth-input"
                  />
                </div>
              </div>
              <div className="dbs-auth-field-group">
                <label htmlFor="dbs-auth-password">Password</label>
                <div className="dbs-auth-input-wrap">
                  <Lock size={14} className="dbs-auth-input-icon" />
                  <input
                    id="dbs-auth-password"
                    type="password"
                    placeholder="Enter password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    disabled={authLoading}
                    className="dbs-auth-input"
                  />
                </div>
              </div>
              <div className="dbs-auth-modal-actions">
                <button
                  type="button"
                  className="dbs-headmaster-reset-btn"
                  onClick={closeAuthModal}
                  disabled={authLoading}
                  style={{ minWidth: "90px", height: "38px" }}
                >
                  <X size={14} />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="dbs-headmaster-save-btn"
                  disabled={authLoading}
                  style={{ minWidth: "90px", height: "38px" }}
                >
                  {authLoading ? (
                    <Loader2 size={14} className="dbs-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>Submit</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AccountMaster;

