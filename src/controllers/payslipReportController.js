const employeeCredentialsService = require('../services/employeeCredentialsService');

function num(val) {
  if (val == null || val === '') return 0;
  const n = Number(String(val).replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : 0;
}

/** Simple number to words (Indian style), e.g. 41450 -> "Forty One Thousand Four Hundred Fifty Only" */
function numberToWords(n) {
  const x = Math.floor(Number(n));
  if (!Number.isFinite(x) || x < 0) return 'Zero Only';
  if (x === 0) return 'Zero Only';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  function to99(v) {
    if (v === 0) return '';
    if (v < 10) return ones[v];
    if (v < 20) return teens[v - 10];
    const t = Math.floor(v / 10);
    const o = v % 10;
    return (tens[t] + (o ? ' ' + ones[o] : '')).trim();
  }
  function to999(v) {
    if (v === 0) return '';
    const h = Math.floor(v / 100);
    const r = v % 100;
    const part = (h ? ones[h] + ' Hundred' : '') + (r ? ' ' + to99(r) : '');
    return part.trim();
  }
  if (x < 1000) return (to999(x) + ' Only').trim();
  const lakh = Math.floor(x / 100000);
  const rest = x % 100000;
  const thousand = Math.floor(rest / 1000);
  const hundred = rest % 1000;
  const parts = [];
  if (lakh > 0) parts.push(to99(lakh) + ' Lakh');
  if (thousand > 0) parts.push(to99(thousand) + ' Thousand');
  if (hundred > 0) parts.push(to999(hundred));
  return (parts.join(' ') + ' Only').trim();
}

/** Same payslip layout as monthly; yearly types use 12 × stored monthly components. */
function payslipAnnualMultiplier(reportType) {
  if (reportType === 'yearly-payslip' || reportType === 'employee-ctc') return 12;
  return 1;
}

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

/**
 * Build one detailed payslip (earnings + deductions + gross + nett + amount in words).
 */
function buildDetailedPayslip(emp, filters) {
  const m = payslipAnnualMultiplier(filters.reportType);
  const basic = round2(num(emp.basicSalary) * m);
  const hra = round2(num(emp.hra) * m);
  const conveyance = round2(num(emp.lta) * m);
  const medical = round2(num(emp.medicalAllowance) * m);
  const education = round2(num(emp.cea) * m);
  const food = round2(num(emp.foodAllowance) * m);
  const supplementary = round2(num(emp.supplementaryAllowance) * m);
  const miscellaneous = round2(num(emp.mea) * m);

  const basicDeduction = round2(num(emp.roundOff) * m);
  const earnings = [
    { label: 'BASIC SALARY', actual: basic, deduction: basicDeduction, earned: round2(basic - basicDeduction) },
    { label: 'HRA', actual: hra, deduction: 0, earned: hra },
    { label: 'CONVEYANCE ALLOWANCE', actual: conveyance, deduction: 0, earned: conveyance },
    { label: 'MEDICAL ALLOWANCE', actual: medical, deduction: 0, earned: medical },
    { label: 'EDUCATION ALLOWANCE', actual: education, deduction: 0, earned: education },
    { label: 'FOOD ALLOWANCE', actual: food, deduction: 0, earned: food },
    { label: 'SUPPLEMENTRY ALLOWANCE', actual: supplementary, deduction: 0, earned: supplementary },
    { label: 'MISCELLANEOUS ALLOWANCE', actual: miscellaneous, deduction: 0, earned: miscellaneous },
  ];

  const profTax = round2(num(emp.pTax) * m);
  const healthIns = round2(num(emp.healthInsurance) * m);
  const esi = round2(num(emp.esiSalary) * m);
  const pf = round2(num(emp.pfContribution) * m);
  const npsEmployer = round2(num(emp.npsEmployer) * m);
  const npsEmployee = round2(num(emp.npsEmployee) * m);
  const penalty = 0;
  const tds = 0;
  const deductions = [
    { label: 'PROFESSION TAX', deduction: 0, actual: profTax },
    { label: 'INSURANCE - HEALTH', deduction: 0, actual: healthIns },
    { label: 'ESI', deduction: 0, actual: esi },
    { label: 'PF CONTRIBUTION', deduction: 0, actual: pf },
    { label: 'NPS - EMPLOYER', deduction: 0, actual: npsEmployer },
    { label: 'NPS - EMPLOYEE', deduction: npsEmployee, actual: 0 },
    { label: 'PENALTY / OTHER', deduction: 0, actual: penalty },
    { label: 'TDS', deduction: tds, actual: 0 },
  ];

  const grossEarnings = Math.round(earnings.reduce((s, e) => s + e.earned, 0) * 100) / 100;
  const totalDeductionColumn = deductions.reduce((s, d) => s + d.deduction, 0);
  const totalActualColumn = deductions.reduce((s, d) => s + d.actual, 0);
  const totalDeductions = totalDeductionColumn + totalActualColumn;
  const nettSalaryRelease = Math.round((grossEarnings - totalDeductions) * 100) / 100;

  return {
    employeeCode: emp.empCode || '-',
    employeeName: emp.employeeName || '-',
    department: emp.department || '-',
    financialYear: filters.financialYear || '-',
    reportType: filters.reportType || '-',
    period: filters.period || '-',
    month: filters.month || '-',
    earnings,
    deductions,
    grossEarnings,
    totalDeductionColumn: Math.round(totalDeductionColumn * 100) / 100,
    totalActualColumn: Math.round(totalActualColumn * 100) / 100,
    nettSalaryRelease,
    amountInWords: numberToWords(nettSalaryRelease),
  };
}

/**
 * Build report data: detailed payslips for on-screen display (Print / Save as PDF is client-side).
 */
async function getReportData(filters) {
  const { financialYear, department, reportType, period, month } = filters;
  const employees = await employeeCredentialsService.listForReport({
    department: department || undefined,
    financialYear,
    reportType,
    period,
    month,
  });
  const detailedPayslips = employees.map((emp) => buildDetailedPayslip(emp, filters));
  return { detailedPayslips, employees };
}

/**
 * POST /api/payslip-report
 * Body: { financialYear, department, reportType, period, month, outputFormat? } — only Display is supported.
 */
async function generatePayslipReportController(req, res) {
  const { financialYear, department, reportType, period, month, outputFormat } =
    req.body || {};

  const fmt = outputFormat == null || outputFormat === '' ? 'Display' : outputFormat;
  if (fmt !== 'Display') {
    return res.status(400).json({
      message:
        'Server PDF export is disabled. Use on-screen report and your browser Print → Save as PDF.',
    });
  }

  const filters = {
    financialYear,
    department,
    reportType,
    period,
    month,
  };
  let result;
  try {
    result = await getReportData(filters);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('payslip report getReportData error:', err);
    return res.status(500).json({ message: 'Failed to generate report data.' });
  }

  return res.json({
    data: { detailed: true, payslips: result.detailedPayslips },
    filters,
  });
}

module.exports = {
  generatePayslipReportController,
};
