import axios from 'axios';
import { initialMockSocialWorkers } from '../data/mockSocialWorkers';

const STORAGE_KEY = 'aashray_social_workers_data';

// Helper to initialize and retrieve mock data store
const getStore = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Fallback if parsing error occurs
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockSocialWorkers));
  return [...initialMockSocialWorkers];
};

const saveStore = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Toggle USE_API flag when connecting to real backend API endpoints
const USE_API = false;
const API_BASE_URL = '/api/social-workers';

export const socialWorkerService = {
  /**
   * Get all social workers
   */
  getAll: async () => {
    if (USE_API) {
      const response = await axios.get(API_BASE_URL);
      return response.data;
    }
    // Simulate network delay for realistic UI loading experience
    await new Promise((resolve) => setTimeout(resolve, 300));
    return getStore();
  },

  /**
   * Get single social worker by ID
   */
  getById: async (id) => {
    if (USE_API) {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
    const store = getStore();
    const worker = store.find((w) => String(w.id) === String(id));
    if (!worker) throw new Error('Social Worker not found');
    return worker;
  },

  /**
   * Add new social worker
   */
  add: async (workerData) => {
    if (USE_API) {
      const response = await axios.post(API_BASE_URL, workerData);
      return response.data;
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
    const store = getStore();

    // Check duplicate email / phone
    if (store.some((w) => w.email.toLowerCase() === workerData.email.toLowerCase())) {
      throw new Error('Social Worker with this email already exists.');
    }
    if (store.some((w) => w.phone === workerData.phone)) {
      throw new Error('Social Worker with this phone number already exists.');
    }

    const nextId = store.length > 0 ? Math.max(...store.map((w) => w.id)) + 1 : 1;
    const nextCodeNum = 1000 + nextId;

    const newWorker = {
      id: nextId,
      socialWorkerCode: `SW-${nextCodeNum}`,
      firstName: workerData.firstName.trim(),
      lastName: workerData.lastName.trim(),
      email: workerData.email.trim(),
      phone: workerData.phone.trim(),
      district: workerData.district.trim(),
      area: workerData.area.trim(),
      status: workerData.status || 'ACTIVE',
      createdDate: new Date().toISOString().split('T')[0],
      assignedVisits: 0,
      completedVisits: 0,
      pendingVisits: 0,
    };

    const updated = [newWorker, ...store];
    saveStore(updated);
    return newWorker;
  },

  /**
   * Update social worker details
   */
  update: async (id, workerData) => {
    if (USE_API) {
      const response = await axios.put(`${API_BASE_URL}/${id}`, workerData);
      return response.data;
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
    const store = getStore();
    const index = store.findIndex((w) => String(w.id) === String(id));
    if (index === -1) throw new Error('Social Worker not found');

    // Duplicate check excluding current worker
    if (
      workerData.email &&
      store.some(
        (w) => String(w.id) !== String(id) && w.email.toLowerCase() === workerData.email.toLowerCase()
      )
    ) {
      throw new Error('Social Worker with this email already exists.');
    }
    if (
      workerData.phone &&
      store.some((w) => String(w.id) !== String(id) && w.phone === workerData.phone)
    ) {
      throw new Error('Social Worker with this phone number already exists.');
    }

    const existing = store[index];
    const updatedWorker = {
      ...existing,
      firstName: workerData.firstName.trim(),
      lastName: workerData.lastName.trim(),
      phone: workerData.phone.trim(),
      district: workerData.district.trim(),
      area: workerData.area.trim(),
      status: workerData.status || existing.status,
    };

    store[index] = updatedWorker;
    saveStore(store);
    return updatedWorker;
  },

  /**
   * Delete social worker (prevent deletion if pendingVisits > 0)
   */
  delete: async (id) => {
    if (USE_API) {
      const response = await axios.delete(`${API_BASE_URL}/${id}`);
      return response.data;
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
    const store = getStore();
    const worker = store.find((w) => String(w.id) === String(id));
    if (!worker) throw new Error('Social Worker not found');

    if (worker.pendingVisits > 0) {
      throw new Error(
        `Cannot delete Social Worker ${worker.firstName} ${worker.lastName} because they have ${worker.pendingVisits} pending visit(s).`
      );
    }

    const filtered = store.filter((w) => String(w.id) !== String(id));
    saveStore(filtered);
    return { success: true, message: 'Social Worker deleted successfully' };
  },

  /**
   * Activate social worker
   */
  activate: async (id) => {
    if (USE_API) {
      const response = await axios.patch(`${API_BASE_URL}/${id}/activate`);
      return response.data;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
    const store = getStore();
    const index = store.findIndex((w) => String(w.id) === String(id));
    if (index === -1) throw new Error('Social Worker not found');

    store[index].status = 'ACTIVE';
    saveStore(store);
    return store[index];
  },

  /**
   * Deactivate social worker
   */
  deactivate: async (id) => {
    if (USE_API) {
      const response = await axios.patch(`${API_BASE_URL}/${id}/deactivate`);
      return response.data;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
    const store = getStore();
    const index = store.findIndex((w) => String(w.id) === String(id));
    if (index === -1) throw new Error('Social Worker not found');

    store[index].status = 'INACTIVE';
    saveStore(store);
    return store[index];
  },
};
