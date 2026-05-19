const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize, isAdmin } = require('../middlewares/roleMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');
const { createUser, getUsers, getProfile, getUserById, updateProfile, deleteUser } = require('../controllers/userController');
const router = express.Router();

router.get('/public/trainers', (req, res, next) => {
  req.query.role = 'trainer';
  getUsers(req, res, next);
});
router.get('/', authenticate, isAdmin, getUsers);
router.post('/', authenticate, isAdmin, createUser);
router.get('/profile', authenticate, getProfile);
router.get('/:id', authenticate, isAdmin, getUserById);
router.put('/profile', authenticate, upload.single('profileImage'), updateProfile);
router.delete('/:id', authenticate, isAdmin, deleteUser);

module.exports = router;
