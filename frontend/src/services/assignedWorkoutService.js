import api from './api.js';

export const getAssignedWorkouts = (params) => api.get('/workouts', { params });
export const getMyAssignedWorkouts = () => api.get('/workouts/mine');
export const getAssignedWorkout = (id) => api.get(`/workouts/${id}`);
export const createAssignedWorkout = (payload) => api.post('/workouts', payload);
export const updateAssignedWorkout = (id, payload) => api.put(`/workouts/${id}`, payload);
export const deleteAssignedWorkout = (id) => api.delete(`/workouts/${id}`);

export default {
  getAssignedWorkouts,
  getMyAssignedWorkouts,
  getAssignedWorkout,
  createAssignedWorkout,
  updateAssignedWorkout,
  deleteAssignedWorkout,
};
