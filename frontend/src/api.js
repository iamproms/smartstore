import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 5000,
});

export const productsApi = {
  list: () => api.get('/products/').then(r => r.data),
  create: (data) => api.post('/products/', data).then(r => r.data),
  update: (id, data) => api.put(`/products/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const salesApi = {
  list: () => api.get('/sales/').then(r => r.data),
  create: (data) => api.post('/sales/', data).then(r => r.data),
};

export const inventoryApi = {
  logs: () => api.get('/inventory/logs/').then(r => r.data),
  adjust: (data) => api.post('/inventory/adjust/', data).then(r => r.data),
};

export const statsApi = {
  daily: () => api.get('/stats/daily').then(r => r.data),
};

export default api;
