import api from './api.js';

export const getAdminStats = () => api.get('/admin/dashboard/stats');
export const getAdminTrainers = () => api.get('/admin/trainers');
