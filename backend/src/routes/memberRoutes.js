const express = require('express');

const { authenticate } = require('../middlewares/authMiddleware');
const { isMember } = require('../middlewares/roleMiddleware');

const {
  getMyWorkouts,
  completeWorkout,
} = require('../controllers/workoutController');

const {
  getMyMembership,
} = require('../controllers/memberController');

const router = express.Router();

router.get('/workouts', authenticate, isMember, getMyWorkouts);

router.put('/workouts/:id/complete', authenticate, isMember, completeWorkout);

router.get('/membership', authenticate, isMember, getMyMembership);

module.exports = router;