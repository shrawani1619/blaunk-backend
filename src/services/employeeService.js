const EmployeeCredentials = require('../models/EmployeeCredentials');

// 3PC codes: no separate DB collection yet, keep mock or extend when 3P credentials are stored
const THREE_PC_EMPLOYEE_CODES = [
  { id: '3PC001', code: '3PC001', name: 'Ravi Kumar' },
  { id: '3PC002', code: '3PC002', name: 'Priya Singh' },
];

/**
 * List employee codes from database (EmployeeCredentials).
 * Returns distinct empCode + employeeName; one entry per empCode.
 */
async function listEmployeeCodesFromDb() {
  const docs = await EmployeeCredentials.find(
    { empCode: { $exists: true, $ne: null, $ne: '' } },
    { empCode: 1, employeeName: 1 },
  )
    .sort({ updatedAt: -1 })
    .lean();

  const byCode = new Map();
  for (const d of docs) {
    const code = (d.empCode && String(d.empCode).trim()) || '';
    if (!code || byCode.has(code)) continue;
    byCode.set(code, {
      id: code,
      code,
      name: (d.employeeName && String(d.employeeName).trim()) || code,
    });
  }
  return Array.from(byCode.values()).sort((a, b) => a.code.localeCompare(b.code));
}

async function listEmployeeCodes(type) {
  if (type === '3pc') {
    return THREE_PC_EMPLOYEE_CODES;
  }
  return listEmployeeCodesFromDb();
}

module.exports = {
  listEmployeeCodes,
};

