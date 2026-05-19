const express = require('express');

const { authenticate } = require('../middlewares/authMiddleware');
const { isTrainer } = require('../middlewares/roleMiddleware');

const {
  createWorkout,
  updateWorkoutStatus,
  getMyWorkouts,
} = require('../controllers/trainerController');

const {
  getAssignedMembers,
} = require('../controllers/trainerController');

const router = express.Router();

router.get('/members', authenticate, isTrainer, getAssignedMembers);

router.post('/workouts', authenticate, isTrainer, createWorkout);

router.put('/workouts/:id/status', authenticate, isTrainer, updateWorkoutStatus);

router.get('/workouts', authenticate, isTrainer, getMyWorkouts);

module.exports = router;