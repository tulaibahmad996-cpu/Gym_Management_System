import api from './api.js';

export const getMemberships = (params) => api.get('/memberships', { params });
export const getMembershipPlans = (params) => api.get('/admin/memberships', { params });
export const createMembership = (payload) => api.post('/admin/memberships', payload);
export const updateMembership = (id, payload) => api.put(`/admin/memberships/${id}`, payload);
export const deleteMembership = (id) => api.delete(`/admin/memberships/${id}`);
export const assignMembersToMembership = (id, payload) => api.post(`/admin/memberships/${id}/assign-members`, payload);
export const subscribeMembership = (id) => api.post(`/memberships/${id}/subscribe`);
