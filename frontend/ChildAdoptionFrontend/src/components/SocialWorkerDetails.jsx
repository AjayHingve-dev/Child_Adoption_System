import React from 'react';
import StatusBadge from './StatusBadge';
import { FaUserCircle, FaMapMarkerAlt, FaEnvelope, FaPhone, FaClipboardList, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';

export default function SocialWorkerDetails({ show, worker, onClose }) {
  if (!show || !worker) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-3">
          {/* Modal Header */}
          <div className="modal-header bg-info text-dark py-3">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <FaUserCircle className="fs-4" />
              <span>Social Worker Details ({worker.socialWorkerCode})</span>
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4">
            {/* Header info */}
            <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3 mb-4">
              <div>
                <h4 className="fw-bold mb-1 text-dark">
                  {worker.firstName} {worker.lastName}
                </h4>
                <span className="text-muted small">
                  Registered on: <strong>{worker.createdDate}</strong>
                </span>
              </div>
              <div>
                <StatusBadge status={worker.status} />
              </div>
            </div>

            {/* General Info Grid */}
            <h6 className="fw-bold text-uppercase text-secondary mb-3" style={{ fontSize: '0.8rem' }}>
              Personal & Contact Information
            </h6>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <div className="p-3 border rounded bg-white">
                  <span className="text-muted small d-block mb-1">
                    <FaEnvelope className="me-2 text-primary" /> Email Address
                  </span>
                  <strong className="text-dark">{worker.email}</strong>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 border rounded bg-white">
                  <span className="text-muted small d-block mb-1">
                    <FaPhone className="me-2 text-primary" /> Phone Number
                  </span>
                  <strong className="text-dark">{worker.phone}</strong>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 border rounded bg-white">
                  <span className="text-muted small d-block mb-1">
                    <FaMapMarkerAlt className="me-2 text-primary" /> District
                  </span>
                  <strong className="text-dark">{worker.district}</strong>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 border rounded bg-white">
                  <span className="text-muted small d-block mb-1">
                    <FaMapMarkerAlt className="me-2 text-primary" /> Area Coverage
                  </span>
                  <strong className="text-dark">{worker.area}</strong>
                </div>
              </div>
            </div>

            {/* Visit Statistics Grid */}
            <h6 className="fw-bold text-uppercase text-secondary mb-3" style={{ fontSize: '0.8rem' }}>
              Visit Statistics
            </h6>
            <div className="row g-3">
              <div className="col-md-4">
                <div className="p-3 border-start border-4 border-primary bg-primary-subtle rounded-3 text-center">
                  <FaClipboardList className="fs-3 text-primary mb-2" />
                  <span className="text-muted d-block small fw-bold">Assigned Visits</span>
                  <h3 className="fw-bold text-primary mb-0">{worker.assignedVisits || 0}</h3>
                </div>
              </div>

              <div className="col-md-4">
                <div className="p-3 border-start border-4 border-success bg-success-subtle rounded-3 text-center">
                  <FaCheckCircle className="fs-3 text-success mb-2" />
                  <span className="text-muted d-block small fw-bold">Completed Visits</span>
                  <h3 className="fw-bold text-success mb-0">{worker.completedVisits || 0}</h3>
                </div>
              </div>

              <div className="col-md-4">
                <div className="p-3 border-start border-4 border-warning bg-warning-subtle rounded-3 text-center">
                  <FaHourglassHalf className="fs-3 text-warning mb-2" />
                  <span className="text-muted d-block small fw-bold">Pending Visits</span>
                  <h3 className="fw-bold text-warning mb-0">{worker.pendingVisits || 0}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer bg-light py-3">
            <button type="button" className="btn btn-secondary px-4 fw-semibold" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
