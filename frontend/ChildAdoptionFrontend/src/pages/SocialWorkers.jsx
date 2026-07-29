import React, { useState, useEffect, useMemo } from 'react';
import { socialWorkerService } from '../services/socialWorkerService';
import DashboardCards from '../components/DashboardCards';
import SearchBar from '../components/SearchBar';
import SocialWorkerTable from '../components/SocialWorkerTable';
import SocialWorkerForm from '../components/SocialWorkerForm';
import SocialWorkerDetails from '../components/SocialWorkerDetails';
import DeleteConfirmation from '../components/DeleteConfirmation';
import ToastNotification from '../components/ToastNotification';

export default function SocialWorkers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
  const [showFormModal, setShowFormModal] = useState(false);
  const [editWorker, setEditWorker] = useState(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  // Load workers data from service
  const loadWorkers = async () => {
    try {
      setLoading(true);
      const data = await socialWorkerService.getAll();
      setWorkers(data || []);
    } catch (err) {
      showToast('error', err.message || 'Failed to load social workers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkers();
  }, []);

  // Filtered workers logic (Live Search by Name, Email, Phone + Status filter)
  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      const query = searchQuery.trim().toLowerCase();
      const fullName = `${worker.firstName} ${worker.lastName}`.toLowerCase();
      const email = (worker.email || '').toLowerCase();
      const phone = (worker.phone || '').toLowerCase();

      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        email.includes(query) ||
        phone.includes(query);

      const matchesStatus =
        statusFilter === 'ALL' || worker.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [workers, searchQuery, statusFilter]);

  // Handlers for Add / Edit Modal
  const handleOpenAddModal = () => {
    setEditWorker(null);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (worker) => {
    setEditWorker(worker);
    setShowFormModal(true);
  };

  const handleSaveWorker = async (formData, isEdit) => {
    try {
      if (isEdit && editWorker) {
        await socialWorkerService.update(editWorker.id, formData);
        showToast('success', 'Social Worker updated successfully!');
      } else {
        await socialWorkerService.add(formData);
        showToast('success', 'Social Worker added successfully!');
      }
      setShowFormModal(false);
      loadWorkers();
    } catch (err) {
      showToast('error', err.message || 'Error saving Social Worker.');
    }
  };

  // Handlers for View Details Modal
  const handleOpenViewModal = (worker) => {
    setSelectedWorker(worker);
    setShowDetailsModal(true);
  };

  // Handler for Activate / Deactivate Toggle
  const handleToggleStatus = async (worker) => {
    try {
      if (worker.status === 'ACTIVE') {
        await socialWorkerService.deactivate(worker.id);
        showToast('warning', `Social Worker ${worker.firstName} deactivated.`);
      } else {
        await socialWorkerService.activate(worker.id);
        showToast('success', `Social Worker ${worker.firstName} activated.`);
      }
      loadWorkers();
    } catch (err) {
      showToast('error', err.message || 'Failed to update status.');
    }
  };

  // Handlers for Delete Modal
  const handleOpenDeleteModal = (worker) => {
    setWorkerToDelete(worker);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (worker) => {
    if ((worker.pendingVisits || 0) > 0) {
      showToast('warning', `Cannot delete worker with pending visits (${worker.pendingVisits}).`);
      setShowDeleteModal(false);
      return;
    }

    try {
      await socialWorkerService.delete(worker.id);
      showToast('success', `Social Worker ${worker.firstName} ${worker.lastName} deleted successfully!`);
      setShowDeleteModal(false);
      setWorkerToDelete(null);
      loadWorkers();
    } catch (err) {
      showToast('error', err.message || 'Failed to delete social worker.');
    }
  };

  return (
    <div className="container-fluid px-0">
      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <span className="eyebrow text-uppercase fw-bold text-primary small d-block mb-1">
            Admin Management
          </span>
          <h2 className="h3 fw-bold text-dark mb-0">Social Worker Management</h2>
          <p className="text-muted small mb-0 mt-1">
            Manage social worker profiles, coverage areas, and field visit assignments.
          </p>
        </div>
      </div>

      {/* 1. Dashboard Cards */}
      <DashboardCards workers={workers} />

      {/* 2. Search & Filter Bar */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onFilterChange={setStatusFilter}
        onAddClick={handleOpenAddModal}
      />

      {/* 3. Social Worker Table */}
      <SocialWorkerTable
        workers={filteredWorkers}
        loading={loading}
        onView={handleOpenViewModal}
        onEdit={handleOpenEditModal}
        onToggleStatus={handleToggleStatus}
        onDelete={handleOpenDeleteModal}
      />

      {/* Modals */}
      {/* Add / Edit Form Modal */}
      <SocialWorkerForm
        show={showFormModal}
        editWorker={editWorker}
        existingWorkers={workers}
        onClose={() => setShowFormModal(false)}
        onSave={handleSaveWorker}
      />

      {/* View Worker Details Modal */}
      <SocialWorkerDetails
        show={showDetailsModal}
        worker={selectedWorker}
        onClose={() => setShowDetailsModal(false)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        show={showDeleteModal}
        worker={workerToDelete}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* Toast Notification */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
