const express = require('express');
const {
  getDepartmentsController,
  saveEmployeeCredentialsController,
  getEmployeeCredentialsController,
} = require('../controllers/employeeCredentialsController');

const router = express.Router();

// List distinct departments (must be before /:pan)
router.get('/departments', getDepartmentsController);

// Save or update employee credentials for a given PAN
router.post('/', saveEmployeeCredentialsController);

// Fetch employee credentials by PAN
router.get('/:pan', getEmployeeCredentialsController);

module.exports = router;

