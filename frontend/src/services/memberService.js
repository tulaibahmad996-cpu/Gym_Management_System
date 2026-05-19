import api from './api.js';

export const getMyWorkouts = (params) => api.get('/member/workouts', { params });
export const completeWorkout = (id) => api.put(`/member/workouts/${id}/complete`);
export const getMyMembership = () => api.get('/member/membership');
