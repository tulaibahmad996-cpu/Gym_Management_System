import api from './api.js';

export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (payload) => api.post('/auth/register', payload);
export const getProfile = () => api.get('/users/profile');
export const updateProfile = (data) => api.put('/users/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } });
