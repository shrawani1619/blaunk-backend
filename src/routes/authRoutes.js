const express = require('express');
const {
  loginController,
  meController,
  forgotPasswordController,
  resetPasswordController,
} = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', loginController);
router.get('/me', authMiddleware, meController);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);

module.exports = router;

