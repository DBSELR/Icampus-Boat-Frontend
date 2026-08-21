import React, { useState, useEffect } from "react";
import {
  Save,
  Trash2,
  Edit3,
  AlertTriangle,
  BookOpen,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAccountsList,
  getAccountData,
  saveAccount,
  deleteAccount,
  mapApiAccount,
  Account,
  AccountPayload,
} from "../../../apis/FeeApis";
import "./AccountMaster.css";
import { loginApi } from "../../../apis/AuthApis";

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

  // Loading / busy flags
  const [listLoading, setListLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Deletion confirm modal
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    accountNumber: string;
  } | null>(null);

  // Authentication popup (shown before a save is committed)
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authUserName, setAuthUserName] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  /* ---------- Load table data ---------- */

  const fetchAccounts = async () => {
    setListLoading(true);
    const result = await getAccountsList();
    if (result.success) {
      setAccounts((result.data || []).map(mapApiAccount));
    } else {
      toast.error(result.message || "Failed to load account list");
    }
    setListLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  /* ---------- Account number lookup (autofill on existing account) ---------- */

  const handleAccountNumberBlur = async () => {
    const acNo = accountNumber.trim();
    if (!acNo || editingId !== null) return; // skip lookup once already in edit mode

    setLookupLoading(true);
    const result = await getAccountData(acNo);

    if (result.success) {
      if (Array.isArray(result.data) && result.data.length > 0) {
        const match = mapApiAccount(result.data[0]);
        setEditingId(match.id);
        setShortName(match.shortName);
        setAccountName(match.accountName);
        setOpeningBalance(String(match.openingBalance));
        toast.info(
          `Account ${acNo} already exists — details loaded for update.`,
        );
      }
    } else {
      toast.error(result.message || "Could not check account number");
    }
    setLookupLoading(false);
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
    const payload: AccountPayload = {
      id: editingId ?? "",
      accountno: accountNumber.trim(),
      shortname: shortName.trim().toUpperCase(),
      accountname: accountName.trim(),
      openBalance: openingBalance.trim(),
    };

    setSaving(true);
    const result = await saveAccount(payload);

    if (result.success) {
      toast.success(
        result.message ||
          (editingId
            ? "Account Master ledger updated successfully!"
            : "New Account Master ledger registered!"),
      );
      resetForm();
      fetchAccounts();
    } else {
      toast.error(result.message || "Failed to save account");
    }
    setSaving(false);
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
    setDeleteTarget({ id: acc.id, accountNumber: acc.accountNumber });
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    const result = await deleteAccount(deleteTarget.id);

    if (result.success) {
      toast.success(
        result.message ||
          `Account Master ${deleteTarget.accountNumber} deleted.`,
      );
      setDeleteTarget(null);
      if (editingId === deleteTarget.id) resetForm();
      fetchAccounts();
    } else {
      toast.error(result.message || "Failed to delete account");
    }
    setDeleting(false);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="dbs-accountmaster-container">
      {/* Page Header */}
      <div className="dbs-admissions-form-header">
        <div>
          <h2>Account Master</h2>
          <p>
            Define ledger accounts, opening balances, and capital funds chart.
          </p>
        </div>
      </div>

      <div className="dbs-accountmaster-grid-layout">
        {/* Left Column: Input Form Card */}
        <div className="dbs-accountmaster-form-column">
          <form
            onSubmit={handleFormSubmit}
            className="dbs-admissions-stepper-form-card"
          >
            <div className="dbs-form-card">
              <h3>
                {editingId
                  ? `Modify Account Master: ${accountNumber}`
                  : "Create Account Master"}
              </h3>

              <div className="dbs-form-grid-2">
                <div className="dbs-input-box">
                  <label>Account Number *</label>
                  <input
                    type="text"
                    placeholder="Enter ledger index code"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    onBlur={handleAccountNumberBlur}
                    disabled={editingId !== null} // Disallow editing primary key
                  />
                  {lookupLoading && (
                    <span className="dbs-field-hint">
                      <Loader2 size={12} className="dbs-spin" /> Checking
                      account number…
                    </span>
                  )}
                </div>

                <div className="dbs-input-box">
                  <label>Short Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. TUF, GCF"
                    value={shortName}
                    onChange={(e) => handleShortNameChange(e.target.value)}
                  />
                </div>

                <div className="dbs-input-box dbs-grid-col-span-2">
                  <label>Account Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Tuition Fee Capital A/C"
                    value={accountName}
                    onChange={(e) => handleAccountNameChange(e.target.value)}
                  />
                </div>

                <div className="dbs-input-box dbs-grid-col-span-2">
                  <label>Opening Balance (INR) *</label>
                  <input
                    type="number"
                    placeholder="Ledger opening amount"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                  />
                </div>
              </div>

              {/* Form Action Controls */}
              <div className="dbs-form-actions-row">
                <button
                  type="button"
                  className="dbs-form-cancel-btn"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel / Clear
                </button>
                <button
                  type="submit"
                  className="dbs-form-save-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 size={16} className="dbs-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  <span>
                    {editingId ? "Update Account" : "Register Account"}
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Ledger List Table */}
        <div className="dbs-accountmaster-list-column">
          <div className="dbs-dashboard-card dbs-datatable-card">
            <div className="dbs-datatable-header-area">
              <div>
                <h3>Active Ledger Chart</h3>
                <p>Configured accounts for collections routing</p>
              </div>
            </div>

            <div className="dbs-table-container">
              {listLoading ? (
                <div className="dbs-empty-state">
                  <Loader2 className="dbs-empty-state-icon dbs-spin" />
                  <div className="dbs-empty-state-title">Loading accounts…</div>
                </div>
              ) : accounts.length === 0 ? (
                <div className="dbs-empty-state">
                  <BookOpen className="dbs-empty-state-icon" />
                  <div className="dbs-empty-state-title">
                    No ledgers defined
                  </div>
                  <div className="dbs-empty-state-desc">
                    Use the account registration form to initialize charts of
                    account.
                  </div>
                </div>
              ) : (
                <table className="dbs-data-table">
                  <thead>
                    <tr>
                      <th>S.No.</th>
                      <th>A/C No.</th>
                      <th>Short Name</th>
                      <th>A/C Name</th>
                      <th>Opening Balance</th>
                      <th>Edit</th>
                      <th>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((acc, idx) => (
                      <tr key={acc.id}>
                        <td className="dbs-sno-td">{idx + 1}</td>
                        <td>
                          <strong>{acc.accountNumber}</strong>
                        </td>
                        <td>
                          <span className="dbs-pill-category">
                            {acc.shortName}
                          </span>
                        </td>
                        <td className="dbs-account-name-td">
                          {acc.accountName}
                        </td>
                        <td className="dbs-opening-bal-td">
                          {formatCurrency(acc.openingBalance)}
                        </td>
                        <td className="dbs-action-td">
                          <button
                            type="button"
                            className="dbs-table-action-icon-btn dbs-btn-edit"
                            onClick={() => handleEdit(acc)}
                            title="Edit ledger details"
                          >
                            <Edit3 size={14} />
                          </button>
                        </td>
                        <td className="dbs-action-td">
                          <button
                            type="button"
                            className="dbs-table-action-icon-btn dbs-btn-delete"
                            onClick={() => handleDeleteClick(acc)}
                            title="Delete account ledger"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget !== null && (
        <div className="dbs-search-overlay-modal">
          <div className="dbs-search-modal-box dbs-confirm-modal-box">
            <div className="dbs-confirm-modal-body">
              <AlertTriangle size={36} className="dbs-warning-danger-icon" />
              <h3>Delete Ledger Account?</h3>
              <p>
                Are you sure you want to delete account ledger{" "}
                <strong>{deleteTarget.accountNumber}</strong>? Deleting it will
                block fee routing and transaction collections to this account.
              </p>
            </div>
            <div className="dbs-confirm-modal-actions">
              <button
                type="button"
                className="dbs-confirm-btn-cancel"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="dbs-confirm-btn-delete"
                onClick={executeDelete}
                disabled={deleting}
              >
                {deleting ? <Loader2 size={14} className="dbs-spin" /> : null}
                <span>Delete Ledger</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Popup — required before a save is committed */}
      {showAuthModal && (
        <div className="dbs-search-overlay-modal">
          <form className="dbs-auth-modal-box" onSubmit={handleAuthSubmit}>
            <div className="dbs-auth-modal-header">Check Authentication</div>
            <div className="dbs-auth-modal-body">
              <div className="dbs-auth-field-row">
                <label htmlFor="dbs-auth-username">User Name</label>
                <input
                  id="dbs-auth-username"
                  type="text"
                  value={authUserName}
                  onChange={(e) => setAuthUserName(e.target.value)}
                  autoFocus
                  disabled={authLoading}
                />
              </div>
              <div className="dbs-auth-field-row">
                <label htmlFor="dbs-auth-password">PassWord</label>
                <input
                  id="dbs-auth-password"
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  disabled={authLoading}
                />
              </div>
              <div className="dbs-auth-modal-actions">
                <button
                  type="submit"
                  className="dbs-auth-btn"
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <Loader2 size={14} className="dbs-spin" />
                  ) : (
                    "Submit"
                  )}
                </button>
                <button
                  type="button"
                  className="dbs-auth-btn"
                  onClick={closeAuthModal}
                  disabled={authLoading}
                >
                  Cancel
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
