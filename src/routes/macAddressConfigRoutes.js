const express = require('express');
const {
  getMacAddressConfigController,
  addMacAddressConfigController,
  deleteMacAddressConfigController,
  saveAllMacAddressConfigController,
} = require('../controllers/macAddressConfigController');

const router = express.Router();

router.get('/', getMacAddressConfigController);
router.post('/', addMacAddressConfigController);
router.post('/save-all', saveAllMacAddressConfigController);
router.delete('/:id', deleteMacAddressConfigController);

module.exports = router;
