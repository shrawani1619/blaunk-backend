const express = require('express');
const {
  saveRightsController,
  getRightsController,
  getMyRightsController,
} = require('../controllers/rightsController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', saveRightsController);
router.get('/me', authMiddleware, getMyRightsController);
router.get('/:type/:code', getRightsController);

module.exports = router;
