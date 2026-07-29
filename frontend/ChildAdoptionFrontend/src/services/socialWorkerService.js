import { api, errorMessage } from '../api';
import { initialMockSocialWorkers } from '../data/mockSocialWorkers';

const STORAGE_KEY = 'aashray_social_workers_data';

// Helper to initialize and retrieve mock data store if API is offline
const getStore = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Fallback
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockSocialWorkers));
  return [...initialMockSocialWorkers];
};

const saveStore = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// USE_API flag connected to ASP.NET Core backend
const USE_API = true;
const API_BASE_URL = '/social-workers';

// Helper to normalize worker object properties between ASP.NET Core DTOs and frontend components
const normalizeWorker = (w) => {
  if (!w) return null;
  return {
    ...w,
    id: w.socialWorkerId || w.id,
    socialWorkerId: w.socialWorkerId || w.id,
    socialWorkerCode: w.socialWorkerCode || `SW-${1000 + (w.socialWorkerId || w.id || 1)}`,
    firstName: w.firstName || '',
    lastName: w.lastName || '',
    email: w.email || '',
    phone: w.phone || '',
    district: w.district || '',
    area: w.area || '',
    status: w.status || 'ACTIVE',
    createdDate: w.createdAt ? new Date(w.createdAt).toISOString().split('T')[0] : (w.createdDate || ''),
    assignedVisits: w.assignedVisits ?? 0,
    completedVisits: w.completedVisits ?? 0,
    pendingVisits: w.pendingVisits ?? 0,
  };
};

export const socialWorkerService = {
  /**
   * Get all social workers from ASP.NET Core backend
   */
  getAll: async () => {
    if (USE_API) {
      try {
        const response = await api.get(API_BASE_URL);
        const data = response.data?.data?.items || response.data?.data || response.data;
        if (Array.isArray(data)) {
          return data.map(normalizeWorker);
        }
        return [];
      } catch (err) {
        console.warn('API fetch failed, falling back to local store:', errorMessage(err));
        return getStore();
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
    return getStore();
  },

  /**
   * Get single social worker by ID
   */
  getById: async (id) => {
    if (USE_API) {
      const response = await api.get(`${API_BASE_URL}/${id}`);
      const data = response.data?.data?.worker || response.data?.data || response.data;
      return normalizeWorker(data);
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
      try {
        const payload = {
          firstName: workerData.firstName.trim(),
          lastName: workerData.lastName ? workerData.lastName.trim() : null,
          email: workerData.email.trim(),
          phone: workerData.phone.trim(),
          district: workerData.district ? workerData.district.trim() : null,
          area: workerData.area ? workerData.area.trim() : null,
          password: workerData.password || 'SocialWorker@123',
          status: workerData.status || 'ACTIVE',
        };
        const response = await api.post(API_BASE_URL, payload);
        const data = response.data?.data || response.data;
        return normalizeWorker(data);
      } catch (err) {
        throw new Error(errorMessage(err));
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
    const store = getStore();

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
      try {
        const payload = {
          firstName: workerData.firstName.trim(),
          lastName: workerData.lastName ? workerData.lastName.trim() : null,
          phone: workerData.phone.trim(),
          district: workerData.district ? workerData.district.trim() : null,
          area: workerData.area ? workerData.area.trim() : null,
          status: workerData.status || 'ACTIVE',
        };
        const response = await api.put(`${API_BASE_URL}/${id}`, payload);
        const data = response.data?.data || response.data;
        return normalizeWorker(data);
      } catch (err) {
        throw new Error(errorMessage(err));
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
    const store = getStore();
    const index = store.findIndex((w) => String(w.id) === String(id));
    if (index === -1) throw new Error('Social Worker not found');

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
   * Delete social worker
   */
  delete: async (id) => {
    if (USE_API) {
      try {
        const response = await api.delete(`${API_BASE_URL}/${id}`);
        return response.data;
      } catch (err) {
        throw new Error(errorMessage(err));
      }
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
      try {
        const response = await api.patch(`${API_BASE_URL}/${id}/activate`);
        const data = response.data?.data || response.data;
        return normalizeWorker(data);
      } catch (err) {
        throw new Error(errorMessage(err));
      }
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
      try {
        const response = await api.patch(`${API_BASE_URL}/${id}/deactivate`);
        const data = response.data?.data || response.data;
        return normalizeWorker(data);
      } catch (err) {
        throw new Error(errorMessage(err));
      }
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
