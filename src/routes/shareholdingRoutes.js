const express = require('express');
const {
  saveShareholdingController,
  getShareholdingController,
  exportShareholdingMISController,
} = require('../controllers/shareholdingController');

const router = express.Router();

// Save or update shareholding info (including nominees) for a given PAN
router.post('/', saveShareholdingController);

// MIS export: shareholding + HR credential columns (Excel)
router.post('/mis-export', exportShareholdingMISController);

// Fetch shareholding + employee credential (same PAN) for aligned master data
router.get('/:pan', getShareholdingController);

module.exports = router;

