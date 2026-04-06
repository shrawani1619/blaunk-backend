const express = require('express');
const { listEmployeeCodesController } = require('../controllers/employeeController');

const router = express.Router();

router.get('/codes', listEmployeeCodesController);

module.exports = router;

