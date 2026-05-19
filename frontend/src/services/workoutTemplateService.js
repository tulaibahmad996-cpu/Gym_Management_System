import api from './api.js';

export const getTemplates = (params) => api.get('/workouts/templates', { params });
export const getTemplate = (id) => api.get(`/workouts/templates/${id}`);
export const createTemplate = (payload) => api.post('/workouts/templates', payload);
export const updateTemplate = (id, payload) => api.put(`/workouts/templates/${id}`, payload);
export const deleteTemplate = (id) => api.delete(`/workouts/templates/${id}`);

export default {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
};
