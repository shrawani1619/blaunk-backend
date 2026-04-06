const express = require('express');
const {
  generatePayslipReportController,
} = require('../controllers/payslipReportController');

const router = express.Router();

router.post('/', generatePayslipReportController);

module.exports = router;
