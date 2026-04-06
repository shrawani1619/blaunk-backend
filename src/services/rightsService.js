const Rights = require('../models/Rights');
const macAddressConfigService = require('./macAddressConfigService');

const ALL_SECTIONS = [
  'Management',
  'Finance',
  'M & A',
  'Sales',
  'Company Secretary',
  'HR',
  'Payslip',
  'IT Dept',
  'Admin & Personnel',
  'Customer Care',
  'Retail Shop',
  'DSA',
  'Verifier',
  'C & D MANAGEMENT',
];

async function saveRights(employeeCode, type, sections, macAddress) {
  const record = await Rights.findOneAndUpdate(
    { employeeCode, type },
    { $set: { sections: sections || [] } },
    { returnDocument: 'after', upsert: true },
  ).lean();
  await macAddressConfigService.upsertMacForRightsSubject(type, employeeCode, macAddress);
  return record;
}

async function getRights(employeeCode, type) {
  const record = await Rights.findOne({ employeeCode, type }).lean();
  const sections = record ? record.sections : [];
  const macAddress = await macAddressConfigService.getMacForRightsSubject(type, employeeCode);
  return { sections, macAddress: macAddress || '' };
}

async function getRightsForUser(user) {
  if (!user || !user.employeeCode) {
    return ALL_SECTIONS;
  }
  const { sections } = await getRights(user.employeeCode, user.employeeType || 'employee');
  return sections.length ? sections : [];
}

module.exports = {
  saveRights,
  getRights,
  getRightsForUser,
  ALL_SECTIONS,
};
