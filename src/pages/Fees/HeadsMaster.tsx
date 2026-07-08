import React, { useState } from "react";
import { Save, Edit3, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import "./HeadMaster.css";

interface FeeHead {
  id: number;
  programme: string;
  feeName: string;
  shortName: string;
  feeType: string;
  orderNo: number;
  amount: number;
  accountNo: string;
}

const sampleData: FeeHead[] = [
  {
    id: 1,
    programme: "B.Tech",
    feeName: "Tuition Fee",
    shortName: "TF",
    feeType: "Academic",
    orderNo: 1,
    amount: 35000,
    accountNo: "1002"
  },
  {
    id: 2,
    programme: "MBA",
    feeName: "Library Fee",
    shortName: "LF",
    feeType: "Academic",
    orderNo: 2,
    amount: 1500,
    accountNo: "1010"
  }
];

export default function FeeHeadMaster() {

 const [rows, setRows] = useState(sampleData);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [programme, setProgramme] = useState("");
  const [feeName, setFeeName] = useState("");
  const [shortName, setShortName] = useState("");
  const [feeType, setFeeType] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [amount, setAmount] = useState("");
  const [accountNo, setAccountNo] = useState("");

  const clearForm = () => {

    setEditingId(null);
    setProgramme("");
    setFeeName("");
    setShortName("");
    setFeeType("");
    setOrderNo("");
    setAmount("");
    setAccountNo("");
  };
  const save = () => {
    if (
      !programme ||
      !feeName ||
      !shortName ||
      !feeType ||
      !orderNo ||
      !amount ||
      !accountNo
    ) {
      toast.error("Fill all fields");
      return;
    }
    const obj = {
      id: editingId ?? Date.now(),
      programme,
      feeName,
      shortName,
      feeType,
      orderNo: Number(orderNo),
      amount: Number(amount),
      accountNo
    };
    if (editingId) {

      setRows(prev => prev.map(x => x.id === editingId ? obj : x));
      toast.success("Fee Head Updated");
    }
    else {

      setRows(prev => [...prev, obj]);
      toast.success("Fee Head Saved");
    }
    clearForm();
  };
  const edit = (item: FeeHead) => {

    setEditingId(item.id);
    setProgramme(item.programme);
    setFeeName(item.feeName);
    setShortName(item.shortName);
    setFeeType(item.feeType);
    setOrderNo(item.orderNo.toString());
    setAmount(item.amount.toString());
    setAccountNo(item.accountNo);

  };
  const remove = (id: number) => {
    setRows(prev => prev.filter(x => x.id !== id));
    toast.success("Deleted");

  };
  return (
    <div className="dbs-accountmaster-container">
      <div className="dbs-admissions-form-header">
        <div>
          <h2>Fee Head Master</h2>
          <p>
            Configure fee heads, fee types, amount and ledger account mapping.
          </p>
        </div>
      </div>
      <div className="dbs-accountmaster-grid-layout">
        <form  className="dbs-admissions-stepper-form-card">
        <div className="dbs-accountmaster-form-column">
          <div className="dbs-form-card">
            <h3>
              {editingId ? "Edit Fee Head" : "Create Fee Head Master"}
            </h3>
            <div className="dbs-form-grid-2">
              <div className="dbs-input-box">
                <label>Programme *</label>
                <select
                  value={programme}
                  onChange={e => setProgramme(e.target.value)}>
                  <option value="">Select</option>
                  <option>B.Tech</option>
                  <option>MBA</option>
                  <option>MCA</option>
                </select>
              </div>
              <div className="dbs-input-box">
                <label>Short Name *</label>
                <input
                  value={shortName}
                  onChange={e => setShortName(e.target.value)}
                />
              </div>
              <div className="dbs-input-box">
                <label>Fee Name *</label>
                <input
                  value={feeName}
                  onChange={e => setFeeName(e.target.value)}
                />
              </div>
              <div className="dbs-input-box">
                <label>Fee Type *</label>
                <input
                  value={feeType}
                  onChange={e => setFeeType(e.target.value)}
                />
              </div>
              <div className="dbs-input-box">
                <label>Order *</label>
                <input
                  type="number"
                  value={orderNo}
                  onChange={e => setOrderNo(e.target.value)}
                />
              </div>
              <div className="dbs-input-box">
                <label>Amount *</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>
              <div className="dbs-input-box">
                <label>Account Number *</label>
                <input
                  value={accountNo}
                  onChange={e => setAccountNo(e.target.value)}
                />
              </div>
            </div>
            <div className="dbs-form-actions-row">
              <button
                type="button"
                className="dbs-form-cancel-btn"
                onClick={clearForm}>
                Cancel
              </button>
              <button
                type="button" className="dbs-form-save-btn" onClick={save}>
                <Save size={16} />Save
              </button>
            </div>
          </div>
        </div>
          </form>

        <div className="dbs-accountmaster-list-column">
          <div className="dbs-dashboard-card dbs-datatable-card">
            <h3>Fee Head List</h3>
            <table className="dbs-data-table">
              <thead>
                <tr>
                  <th>Programme</th>
                  <th>Fee Name</th>
                  <th>Short</th>
                  <th>Fee Type</th>
                  <th>Account</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(item =>
                  <tr key={item.id}>
                    <td>{item.programme}</td>
                    <td>{item.feeName}</td>
                    <td>{item.shortName}</td>
                    <td>{item.feeType}</td>
                    <td>{item.accountNo}</td>
                    <td>
                      ₹{item.amount.toLocaleString("en-IN")}
                    </td>
                    <td>
                      <div className="dbs-table-actions-row">
                        <button
                          className="dbs-btn-edit"
                          onClick={() => edit(item)}
                       >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="dbs-btn-delete"
                          onClick={() => remove(item.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                    </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
         </div>
        </div>
    
      
      </div>
    </div>
  );

}