const employeeCredentialsService = require('../services/employeeCredentialsService');

async function getDepartmentsController(req, res) {
  try {
    const departments = await employeeCredentialsService.getDistinctDepartments();
    return res.json({ departments });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('getDepartments error:', error);
    return res.status(500).json({ message: 'Failed to load departments.' });
  }
}

async function saveEmployeeCredentialsController(req, res) {
  const {
    pan,
    employeeName,
    mobile,
    email,
    aadhaar,
    empCode,
    address,
    city,
    zip,
    country,
    state,
    gender,
    yearlyCtc,
    department,
    designation,
    bankName,
    ifscCode,
    bankAccountNumber,
    medicalInsuranceNo,
    doj,
    doc,
    centreName,
    confirmationStatus,
    monthlyLeaves,
    nps,
    esi,
    jobGrade,
    uan,
    pf,
    remarks,
    status,
    exitDate,
    basicSalary,
    hra,
    lta,
    medicalAllowance,
    cea,
    foodAllowance,
    supplementaryAllowance,
    mea,
    pTax,
    healthInsurance,
    esiSalary,
    pfContribution,
    npsEmployer,
    npsEmployee,
    roundOff,
    ctcMonthly,
    ctcPerDay,
    gratuity,
    references = [],
    employeeDocumentUrl,
  } = req.body || {};

  if (!pan) {
    return res.status(400).json({ message: 'PAN is required.' });
  }

  try {
    const record = await employeeCredentialsService.upsertEmployeeCredentials({
      pan,
      employeeName,
      mobile,
      email,
      aadhaar,
      empCode,
      address,
      city,
      zip,
      country,
      state,
      gender,
      yearlyCtc,
      department,
      designation,
      bankName,
      ifscCode,
      bankAccountNumber,
      medicalInsuranceNo,
      doj,
      doc,
      centreName,
      confirmationStatus,
      monthlyLeaves,
      nps,
      esi,
      jobGrade,
      uan,
      pf,
      remarks,
      status,
      exitDate,
      basicSalary,
      hra,
      lta,
      medicalAllowance,
      cea,
      foodAllowance,
      supplementaryAllowance,
      mea,
      pTax,
      healthInsurance,
      esiSalary,
      pfContribution,
      npsEmployer,
      npsEmployee,
      roundOff,
      ctcMonthly,
      ctcPerDay,
      gratuity,
      references,
      employeeDocumentUrl,
    });

    return res.status(200).json({ record });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('saveEmployeeCredentials error:', error);
    const message =
      error && typeof error.message === 'string'
        ? error.message
        : 'Failed to save employee credentials.';
    return res.status(500).json({ message });
  }
}

async function getEmployeeCredentialsController(req, res) {
  const { pan } = req.params;

  if (!pan) {
    return res.status(400).json({ message: 'PAN is required.' });
  }

  try {
    const record = await employeeCredentialsService.getEmployeeCredentialsByPan(pan);
    if (!record) {
      return res.status(404).json({ message: 'Employee credentials not found.' });
    }
    return res.json({ record });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('getEmployeeCredentials error:', error);
    return res.status(500).json({ message: 'Failed to load employee credentials.' });
  }
}

module.exports = {
  getDepartmentsController,
  saveEmployeeCredentialsController,
  getEmployeeCredentialsController,
};

