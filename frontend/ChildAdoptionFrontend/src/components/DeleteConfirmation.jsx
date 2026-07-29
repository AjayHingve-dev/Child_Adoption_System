import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function DeleteConfirmation({ show, worker, onClose, onConfirm }) {
  if (!show || !worker) return null;

  const hasPendingVisits = (worker.pendingVisits || 0) > 0;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-3">
          {/* Header */}
          <div className="modal-header bg-danger text-white py-3">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <FaExclamationTriangle />
              <span>Confirm Deletion</span>
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4 text-center">
            <div className="p-3 bg-danger-subtle text-danger rounded-circle d-inline-flex mb-3">
              <FaExclamationTriangle className="fs-1" />
            </div>

            <h5 className="fw-bold text-dark mb-2">Delete Social Worker?</h5>
            <p className="text-secondary mb-3">
              Are you sure you want to delete{' '}
              <strong className="text-dark">
                {worker.firstName} {worker.lastName} ({worker.socialWorkerCode})
              </strong>
              ?
            </p>

            {hasPendingVisits && (
              <div className="alert alert-warning border-start border-4 border-warning text-start small mb-0">
                <strong>⚠️ Deletion Blocked:</strong> This worker currently has{' '}
                <strong className="text-danger">{worker.pendingVisits} pending visit(s)</strong>.
                Please reassign or complete pending visits before deleting this social worker.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer bg-light py-3 justify-content-end gap-2">
            <button type="button" className="btn btn-secondary px-4 fw-semibold" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger px-4 fw-bold"
              disabled={hasPendingVisits}
              onClick={() => onConfirm(worker)}
            >
              Delete Worker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
