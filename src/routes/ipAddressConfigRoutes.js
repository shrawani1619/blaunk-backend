const express = require('express');
const {
  getIpAddressConfigController,
  addIpAddressConfigController,
  deleteIpAddressConfigController,
  saveAllIpAddressConfigController,
} = require('../controllers/ipAddressConfigController');

const router = express.Router();

router.get('/', getIpAddressConfigController);
router.post('/', addIpAddressConfigController);
router.post('/save-all', saveAllIpAddressConfigController);
router.delete('/:id', deleteIpAddressConfigController);

module.exports = router;
