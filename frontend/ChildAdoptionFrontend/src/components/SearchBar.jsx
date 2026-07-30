import React from 'react';
import { FaPlus, FaSearch, FaFilter } from 'react-icons/fa';

export default function SearchBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onFilterChange,
  onAddClick,
}) {
  return (
    <div className="card shadow-sm border-0 mb-4 p-3 bg-white rounded-3">
      <div className="row g-2 align-items-center">
        {/* Search input */}
        <div className="col-md-5 col-lg-6">
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <FaSearch className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-start-0 bg-light"
              placeholder="Search by Name, Email, or Phone..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Filter dropdown */}
        <div className="col-md-4 col-lg-3">
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <FaFilter className="text-muted" />
            </span>
            <select
              className="form-select border-start-0 bg-light fw-semibold text-secondary"
              value={statusFilter}
              onChange={(e) => onFilterChange(e.target.value)}
            >
              <option value="ALL">All Status (ALL)</option>
              <option value="ACTIVE">ACTIVE Only</option>
              <option value="INACTIVE">INACTIVE Only</option>
            </select>
          </div>
        </div>

        {/* Add Social Worker Button */}
        <div className="col-md-3 col-lg-3 text-md-end">
          <button
            className="btn btn-primary w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
            onClick={onAddClick}
            style={{ padding: '0.65rem 1rem' }}
          >
            <FaPlus />
            <span>Add Social Worker</span>
          </button>
        </div>
      </div>
    </div>
  );
}
