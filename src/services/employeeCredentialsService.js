const EmployeeCredentials = require('../models/EmployeeCredentials');

/** Schema top-level keys that can be saved (matches EmployeeCredentials model). */
const ALLOWED_KEYS = new Set([
  'pan', 'employeeName', 'mobile', 'email', 'aadhaar', 'empCode', 'address', 'city', 'zip',
  'country', 'state', 'gender', 'yearlyCtc', 'department', 'designation', 'bankName', 'ifscCode',
  'bankAccountNumber', 'medicalInsuranceNo', 'doj', 'doc', 'centreName', 'confirmationStatus',
  'monthlyLeaves', 'nps', 'esi', 'jobGrade', 'uan', 'pf', 'remarks', 'status', 'exitDate',
  'basicSalary', 'hra', 'lta', 'medicalAllowance', 'cea', 'foodAllowance', 'supplementaryAllowance',
  'mea', 'pTax', 'healthInsurance', 'esiSalary', 'pfContribution', 'npsEmployer', 'npsEmployee',
  'roundOff', 'ctcMonthly', 'ctcPerDay', 'gratuity', 'references', 'employeeDocumentUrl',
]);

/**
 * Build a clean update object: only allowed keys, no undefined (MongoDB doesn't store undefined).
 * @param {Record<string, unknown>} payload
 * @returns {Record<string, unknown>}
 */
function cleanPayload(payload) {
  const cleaned = {};
  for (const key of Object.keys(payload)) {
    if (!ALLOWED_KEYS.has(key)) continue;
    if (payload[key] === undefined) continue;
    cleaned[key] = payload[key];
  }
  return cleaned;
}

async function upsertEmployeeCredentialsMongo(payload) {
  if (!payload || !payload.pan) {
    throw new Error('PAN is required for upsert');
  }
  const toSet = cleanPayload(payload);
  const record = await EmployeeCredentials.findOneAndUpdate(
    { pan: payload.pan },
    { $set: toSet },
    {
      returnDocument: 'after',
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    },
  ).lean();

  return record;
}

async function getEmployeeCredentialsByPanMongo(pan) {
  const record = await EmployeeCredentials.findOne({ pan }).lean();
  return record;
}

async function getDistinctDepartments() {
  const departments = await EmployeeCredentials.distinct('department');
  return (departments || []).filter((d) => d != null && String(d).trim() !== '');
}

/**
 * List employees for payslip report filtered by department, etc.
 * Returns full salary/allowance/deduction fields for detailed payslip.
 * @param {{ department?: string, financialYear?: string, reportType?: string, period?: string, month?: string }} filters
 */
async function listForReport(filters) {
  const query = {};
  if (filters.department) {
    query.department = filters.department;
  }
  const list = await EmployeeCredentials.find(query)
    .select(
      'empCode employeeName department designation bankName bankAccountNumber uan aadhaar doj jobGrade city pan ' +
      'basicSalary hra lta medicalAllowance cea foodAllowance supplementaryAllowance mea ' +
      'ctcMonthly yearlyCtc pTax healthInsurance esiSalary pfContribution npsEmployer npsEmployee roundOff pf esi',
    )
    .lean();
  return list || [];
}

async function upsertEmployeeCredentials(payload) {
  return upsertEmployeeCredentialsMongo(payload);
}

async function getEmployeeCredentialsByPan(pan) {
  return getEmployeeCredentialsByPanMongo(pan);
}

module.exports = {
  upsertEmployeeCredentials,
  getEmployeeCredentialsByPan,
  getDistinctDepartments,
  listForReport,
};

