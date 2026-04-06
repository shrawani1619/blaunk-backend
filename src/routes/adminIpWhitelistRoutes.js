const express = require('express');
const {
  addIpController,
  getIpListController,
  deleteIpController,
} = require('../controllers/adminIpWhitelistController');

const router = express.Router();

router.post('/add-ip', addIpController);
router.get('/ip-list', getIpListController);
router.delete('/delete-ip/:id', deleteIpController);

module.exports = router;
