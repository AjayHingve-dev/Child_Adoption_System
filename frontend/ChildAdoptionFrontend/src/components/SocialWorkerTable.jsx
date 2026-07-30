import React, { useState } from 'react';
import { FaEye, FaEdit, FaTrashAlt, FaCheckCircle, FaBan } from 'react-icons/fa';
import StatusBadge from './StatusBadge';

export default function SocialWorkerTable({
  workers = [],
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  loading = false,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalItems = workers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  // Reset page if out of bounds
  const validPage = Math.min(currentPage, totalPages) || 1;
  const startIndex = (validPage - 1) * itemsPerPage;
  const pageWorkers = workers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="card shadow-sm border-0 bg-white rounded-3 overflow-hidden">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light border-bottom">
            <tr className="text-secondary text-uppercase fs-7" style={{ fontSize: '0.78rem', letterSpacing: '0.05em' }}>
              <th className="py-3 ps-3">Code</th>
              <th className="py-3">First Name</th>
              <th className="py-3">Last Name</th>
              <th className="py-3">Email</th>
              <th className="py-3">Phone</th>
              <th className="py-3">District</th>
              <th className="py-3">Area</th>
              <th className="py-3 text-center">Status</th>
              <th className="py-3">Created Date</th>
              <th className="py-3 text-end pe-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="text-center py-5 text-muted">
                  <div className="spinner-border text-primary me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <span>Fetching social workers...</span>
                </td>
              </tr>
            ) : pageWorkers.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-5 text-muted">
                  <div className="fs-4 mb-2">🔍</div>
                  <h6 className="fw-bold text-secondary">No Social Workers Found</h6>
                  <p className="small mb-0 text-muted">Try adjusting your search query or filter options.</p>
                </td>
              </tr>
            ) : (
              pageWorkers.map((worker) => (
                <tr key={worker.id}>
                  <td className="ps-3 fw-bold text-primary">{worker.socialWorkerCode}</td>
                  <td className="fw-semibold text-dark">{worker.firstName}</td>
                  <td className="fw-semibold text-dark">{worker.lastName}</td>
                  <td className="text-muted small">{worker.email}</td>
                  <td className="text-dark small">{worker.phone}</td>
                  <td>{worker.district}</td>
                  <td className="text-muted">{worker.area}</td>
                  <td className="text-center">
                    <StatusBadge status={worker.status} />
                  </td>
                  <td className="text-muted small">{worker.createdDate}</td>
                  <td className="text-end pe-3">
                    <div className="btn-group btn-group-sm" role="group" aria-label="Worker actions">
                      {/* View Button */}
                      <button
                        className="btn btn-outline-info"
                        title="View Details"
                        onClick={() => onView(worker)}
                      >
                        <FaEye />
                      </button>

                      {/* Edit Button */}
                      <button
                        className="btn btn-outline-primary"
                        title="Edit Worker"
                        onClick={() => onEdit(worker)}
                      >
                        <FaEdit />
                      </button>

                      {/* Activate / Deactivate Toggle Button */}
                      {worker.status === 'ACTIVE' ? (
                        <button
                          className="btn btn-outline-warning"
                          title="Deactivate Worker"
                          onClick={() => onToggleStatus(worker)}
                        >
                          <FaBan />
                        </button>
                      ) : (
                        <button
                          className="btn btn-outline-success"
                          title="Activate Worker"
                          onClick={() => onToggleStatus(worker)}
                        >
                          <FaCheckCircle />
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        className="btn btn-outline-danger"
                        title="Delete Worker"
                        onClick={() => onDelete(worker)}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && workers.length > 0 && (
        <div className="card-footer bg-white border-top py-3 d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
          <span className="small text-muted">
            Showing <strong className="text-dark">{startIndex + 1}</strong> to{' '}
            <strong className="text-dark">{Math.min(startIndex + itemsPerPage, totalItems)}</strong> of{' '}
            <strong className="text-dark">{totalItems}</strong> workers
          </span>

          <nav aria-label="Social workers table pagination">
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${validPage === 1 ? 'disabled' : ''}`}>
                <button className="page-item page-link" onClick={() => handlePageChange(validPage - 1)}>
                  Previous
                </button>
              </li>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <li
                  key={pageNum}
                  className={`page-item ${validPage === pageNum ? 'active' : ''}`}
                >
                  <button className="page-link" onClick={() => handlePageChange(pageNum)}>
                    {pageNum}
                  </button>
                </li>
              ))}

              <li className={`page-item ${validPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-item page-link" onClick={() => handlePageChange(validPage + 1)}>
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
