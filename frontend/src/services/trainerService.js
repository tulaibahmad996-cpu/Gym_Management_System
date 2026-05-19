import api from './api.js';

export const getAssignedMembers = () => api.get('/trainer/members');
export const getTrainerWorkouts = (params) => api.get('/trainer/workouts', { params });
export const createWorkout = (payload) => api.post('/trainer/workouts', payload);
export const updateWorkoutStatus = (id, payload) => api.put(`/trainer/workouts/${id}/status`, payload);
export const updateWorkout = (id, payload) => api.put(`/workouts/${id}`, payload);
export const deleteWorkout = (id) => api.delete(`/workouts/${id}`);
export const assignMembersToTrainer = (payload) => api.post('/admin/trainers/assign-members', payload);
