const employeeService = require('../services/employeeService');

async function listEmployeeCodesController(req, res) {
  const { type } = req.query;

  try {
    const employees = await employeeService.listEmployeeCodes(
      type === '3pc' ? '3pc' : 'employee',
    );

    return res.json({ employees });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('listEmployeeCodes error:', error);
    return res.status(500).json({ message: 'Failed to load employee codes.' });
  }
}

module.exports = {
  listEmployeeCodesController,
};

