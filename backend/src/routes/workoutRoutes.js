const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const {
  // templates
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  // assigned workouts
  createAssignedWorkout,
  getAssignedWorkouts,
  getAssignedWorkoutById,
  updateAssignedWorkout,
  deleteAssignedWorkout,
  getMyAssignedWorkouts,
} = require('../controllers/workoutController');
const router = express.Router();

router.use(authenticate);

// Templates management (MUST come before generic /:id route)
router.post('/templates', authorize('admin', 'trainer'), createTemplate);
router.get('/templates', authorize('admin', 'trainer', 'member'), getTemplates);
router.get('/templates/:id', authorize('admin', 'trainer', 'member'), getTemplateById);
router.put('/templates/:id', authorize('admin', 'trainer'), updateTemplate);
router.delete('/templates/:id', authorize('admin', 'trainer'), deleteTemplate);

// Assigned workouts endpoints (replace legacy "workout" behavior)
router.post('/', authorize('admin', 'trainer'), createAssignedWorkout);
router.get('/', authorize('admin', 'trainer', 'member'), getAssignedWorkouts);
router.get('/mine', authorize('member'), getMyAssignedWorkouts);
router.get('/:id', authorize('admin', 'trainer', 'member'), getAssignedWorkoutById);
router.put('/:id', authorize('admin', 'trainer'), updateAssignedWorkout);
router.delete('/:id', authorize('admin', 'trainer'), deleteAssignedWorkout);

module.exports = router;
