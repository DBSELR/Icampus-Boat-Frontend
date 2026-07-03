import React, { useState } from "react";
import { Save, Trash2, Edit3, AlertTriangle, BookOpen, Calculator } from "lucide-react";
import { toast } from "sonner";
import "./AccountMaster.css";

interface Account {
  accountNumber: string;
  shortName: string;
  accountName: string;
  openingBalance: number;
}

const INITIAL_ACCOUNTS: Account[] = [
  { accountNumber: "1001", shortName: "GCF", accountName: "General Capital Fund A/C", openingBalance: 1500000 },
  { accountNumber: "1002", shortName: "TUF", accountName: "Tuition Fee Capital A/C", openingBalance: 3500000 },
  { accountNumber: "1003", shortName: "HOF", accountName: "Hostel Development Fund A/C", openingBalance: 850000 }
];

export const AccountMaster: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [accountNumber, setAccountNumber] = useState("");
  const [shortName, setShortName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");

  // Deletion confirm modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountNumber.trim() || !shortName.trim() || !accountName.trim() || !openingBalance.trim()) {
      toast.error("Please fill in all account ledger fields");
      return;
    }

    const payload: Account = {
      accountNumber: accountNumber.trim(),
      shortName: shortName.trim().toUpperCase(),
      accountName: accountName.trim(),
      openingBalance: parseFloat(openingBalance)
    };

    if (editingId !== null) {
      setAccounts(prev => prev.map(acc => acc.accountNumber === editingId ? payload : acc));
      toast.success("Account Master ledger updated successfully!");
      setEditingId(null);
    } else {
      // Check if duplicate account number
      if (accounts.some(acc => acc.accountNumber === payload.accountNumber)) {
        toast.error("Account Number already exists!");
        return;
      }
      setAccounts(prev => [...prev, payload]);
      toast.success("New Account Master ledger registered!");
    }

    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setAccountNumber("");
    setShortName("");
    setAccountName("");
    setOpeningBalance("");
  };

  const handleEdit = (acc: Account) => {
    setEditingId(acc.accountNumber);
    setAccountNumber(acc.accountNumber);
    setShortName(acc.shortName);
    setAccountName(acc.accountName);
    setOpeningBalance(acc.openingBalance.toString());
    toast.info(`Editing Account Number ${acc.accountNumber}`);
  };

  const handleDeleteClick = (accountNo: string) => {
    setDeleteTargetId(accountNo);
  };

  const executeDelete = () => {
    if (deleteTargetId !== null) {
      setAccounts(prev => prev.filter(acc => acc.accountNumber !== deleteTargetId));
      toast.success(`Account Master ${deleteTargetId} deleted.`);
      setDeleteTargetId(null);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="dbs-accountmaster-container">
      
      {/* Page Header */}
      <div className="dbs-admissions-form-header">
        <div>
          <h2>Account Master</h2>
          <p>Define ledger accounts, opening balances, and capital funds chart.</p>
        </div>
      </div>

      <div className="dbs-accountmaster-grid-layout">
        
        {/* Left Column: Input Form Card */}
        <div className="dbs-accountmaster-form-column">
          <form onSubmit={handleSave} className="dbs-admissions-stepper-form-card">
            <div className="dbs-form-card">
              <h3>{editingId ? `Modify Account Master: ${editingId}` : "Create Account Master"}</h3>
              
              <div className="dbs-form-grid-2">
                <div className="dbs-input-box">
                  <label>Account Number *</label>
                  <input 
                    type="text" 
                    placeholder="Enter ledger index code" 
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    disabled={editingId !== null} // Disallow editing primary key
                  />
                </div>

                <div className="dbs-input-box">
                  <label>Short Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. TUF, GCF" 
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                  />
                </div>

                <div className="dbs-input-box dbs-grid-col-span-2">
                  <label>Account Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Tuition Fee Capital A/C" 
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
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
                <button type="button" className="dbs-form-cancel-btn" onClick={resetForm}>
                  Cancel / Clear
                </button>
                <button type="submit" className="dbs-form-save-btn">
                  <Save size={16} />
                  <span>{editingId ? "Update Account" : "Register Account"}</span>
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
              {accounts.length === 0 ? (
                <div className="dbs-empty-state">
                  <BookOpen className="dbs-empty-state-icon" />
                  <div className="dbs-empty-state-title">No ledgers defined</div>
                  <div className="dbs-empty-state-desc">Use the account registration form to initialize charts of account.</div>
                </div>
              ) : (
                <table className="dbs-data-table">
                  <thead>
                    <tr>
                      <th>Account Code</th>
                      <th>Account Ledger Name</th>
                      <th>Short Name</th>
                      <th>Opening Balance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((acc, idx) => (
                      <tr key={idx}>
                        <td><strong>{acc.accountNumber}</strong></td>
                        <td className="dbs-account-name-td">{acc.accountName}</td>
                        <td><span className="dbs-pill-category">{acc.shortName}</span></td>
                        <td className="dbs-opening-bal-td">{formatCurrency(acc.openingBalance)}</td>
                        <td>
                          <div className="dbs-table-actions-row">
                            <button 
                              type="button" 
                              className="dbs-table-action-icon-btn dbs-btn-edit"
                              onClick={() => handleEdit(acc)}
                              title="Edit ledger details"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button 
                              type="button" 
                              className="dbs-table-action-icon-btn dbs-btn-delete"
                              onClick={() => handleDeleteClick(acc.accountNumber)}
                              title="Delete account ledger"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
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

      {/* Confirmation Modal */}
      {deleteTargetId !== null && (
        <div className="dbs-search-overlay-modal">
          <div className="dbs-search-modal-box dbs-confirm-modal-box">
            <div className="dbs-confirm-modal-body">
              <AlertTriangle size={36} className="dbs-warning-danger-icon" />
              <h3>Delete Ledger Account?</h3>
              <p>Are you sure you want to delete account ledger <strong>{deleteTargetId}</strong>? Deleting it will block fee routing and transaction collections to this account.</p>
            </div>
            <div className="dbs-confirm-modal-actions">
              <button type="button" className="dbs-confirm-btn-cancel" onClick={() => setDeleteTargetId(null)}>
                Cancel
              </button>
              <button type="button" className="dbs-confirm-btn-delete" onClick={executeDelete}>
                Delete Ledger
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AccountMaster;
