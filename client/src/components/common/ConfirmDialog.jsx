import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDanger = true,
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <div className="modal-backdrop" onMouseDown={onCancel}>
      <section className="confirm-dialog" onMouseDown={(event) => event.stopPropagation()}>
        <header className="confirm-header">
          <div className={isDanger ? 'confirm-icon danger' : 'confirm-icon'}>
            <AlertTriangle size={22} />
          </div>
          <button className="icon-button" onClick={onCancel} title="Close dialog">
            <X size={18} />
          </button>
        </header>

        <div className="confirm-copy">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <div className="confirm-actions">
          <button className="btn btn-ghost" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </button>
          <button
            className={isDanger ? 'btn btn-danger' : 'btn btn-primary'}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
