const express = require('express');
const {
  getCaptchaConfigController,
  saveCaptchaConfigController,
} = require('../controllers/captchaConfigController');

const router = express.Router();

router.get('/', getCaptchaConfigController);
router.post('/', saveCaptchaConfigController);

module.exports = router;
