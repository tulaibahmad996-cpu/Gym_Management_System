const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const {
  createAttendance,
  getAttendance,
  updateAttendance,
  deleteAttendance,
} = require('../controllers/attendanceController');
const router = express.Router();

router.use(authenticate);
router.post('/', authorize('admin', 'trainer'), createAttendance);
router.get('/', authorize('admin', 'trainer', 'member'), getAttendance);
router.put('/:id', authorize('admin', 'trainer'), updateAttendance);
router.delete('/:id', authorize('admin', 'trainer'), deleteAttendance);

module.exports = router;
