import React from "react";
import { Trash2 } from "lucide-react";
import "./DeleteModal.css";

interface DeleteModalProps {
  open: boolean;
  title: string;
  itemName?: string;
  loading?: boolean;

  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteModal = ({
  open,
  title,
  itemName,
  loading = false,
  onCancel,
  onConfirm,
}: DeleteModalProps) => {
  if (!open) return null;

  return (
    <div className="dbs-delete-modal-overlay">
      <div className="dbs-delete-modal">
        <div className="dbs-delete-header">
          <Trash2 size={40} className="dbs-delete-icon" />

          <h3>{title}</h3>
        </div>

        <p>
          Are you sure you want to delete <br />
          <strong> {itemName} </strong>?
        </p>

        <div className="dbs-delete-actions">
          <button
            className="dbs-delete-cancel-btn"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="dbs-delete-confirm-btn"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
