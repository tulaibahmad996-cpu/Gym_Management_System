import api from './api.js';

// Backwards-compatible service that operates on assigned workouts
export const getWorkouts = (params) => api.get('/workouts', { params });
export const createWorkout = (payload) => api.post('/workouts', payload);
export const updateWorkout = (id, payload) => api.put(`/workouts/${id}`, payload);
export const deleteWorkout = (id) => api.delete(`/workouts/${id}`);
export const updateWorkoutStatus = (id, payload) => api.put(`/workouts/${id}`, payload);

export default {
	getWorkouts,
	createWorkout,
	updateWorkout,
	deleteWorkout,
	updateWorkoutStatus,
};
