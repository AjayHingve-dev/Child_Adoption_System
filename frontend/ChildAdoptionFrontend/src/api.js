import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5080/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  r => {
    if (r.data && typeof r.data === 'object' && r.data.success === true && r.data.data !== undefined) {
      if (r.data.data && typeof r.data.data === 'object' && Array.isArray(r.data.data.items)) {
        return { ...r, data: r.data.data.items };
      }
      return { ...r, data: r.data.data };
    }
    return r;
  },
  e => {
    if (e.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(e);
  }
);

export const errorMessage = (e) => {
  const data = e.response?.data;
  if (data?.message) return data.message;
  if (data?.errors) {
    const messages = Object.values(data.errors).flat().filter(Boolean);
    if (messages.length) return messages.join(' ');
  }
  return typeof data === 'string' ? data : (e.message || 'Something went wrong');
};
