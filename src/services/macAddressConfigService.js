const MacAddressConfig = require('../models/MacAddressConfig');

function rowFromDoc(doc) {
  return {
    id: doc._id.toString(),
    serviceProvider: doc.serviceProvider || '',
    macAddress: doc.macAddress || doc.uniqueCode || '',
  };
}

function isSecurityPoolRow(doc) {
  return doc.forRights !== true;
}

async function getAll() {
  const list = await MacAddressConfig.find({}).sort({ createdAt: 1 }).lean();
  return (list || []).filter(isSecurityPoolRow).map(rowFromDoc);
}

async function getMacForRightsSubject(type, employeeCode) {
  const t = type === '3pc' ? '3pc' : 'employee';
  const code = String(employeeCode || '').trim();
  if (!code) return '';
  const doc = await MacAddressConfig.findOne({
    forRights: true,
    rightsType: t,
    rightsEmployeeCode: code,
  }).lean();
  return doc?.macAddress || doc?.uniqueCode || '';
}

async function upsertMacForRightsSubject(type, employeeCode, macAddress) {
  const t = type === '3pc' ? '3pc' : 'employee';
  const code = String(employeeCode || '').trim();
  if (!code) return;
  const mac = macAddress != null ? String(macAddress).trim() : '';
  if (!mac) {
    await MacAddressConfig.deleteOne({
      forRights: true,
      rightsType: t,
      rightsEmployeeCode: code,
    });
    return;
  }
  await MacAddressConfig.findOneAndUpdate(
    { forRights: true, rightsType: t, rightsEmployeeCode: code },
    {
      $set: {
        forRights: true,
        rightsType: t,
        rightsEmployeeCode: code,
        macAddress: mac,
        serviceProvider: `Rights:${t}:${code}`,
      },
      $unset: { uniqueCode: '' },
    },
    { upsert: true, runValidators: true },
  );
}

async function createOne(serviceProvider, macAddress) {
  const doc = await MacAddressConfig.create({
    serviceProvider: serviceProvider != null ? String(serviceProvider).trim() : '',
    macAddress: macAddress != null ? String(macAddress).trim() : '',
  });
  return rowFromDoc(doc.toObject());
}

async function deleteById(id) {
  const result = await MacAddressConfig.findByIdAndDelete(id);
  return !!result;
}

async function saveAll(rows) {
  if (!Array.isArray(rows)) return getAll();
  const ids = rows.filter((r) => r.id).map((r) => r.id);
  const existing = await MacAddressConfig.find({ _id: { $in: ids } }).lean();
  const existingIds = new Set(existing.map((e) => e._id.toString()));
  for (const row of rows) {
    if (row.id && existingIds.has(row.id)) {
      await MacAddressConfig.findByIdAndUpdate(row.id, {
        $set: {
          serviceProvider: row.serviceProvider != null ? String(row.serviceProvider).trim() : '',
          macAddress: row.macAddress != null ? String(row.macAddress).trim() : '',
        },
        $unset: { uniqueCode: '' },
      });
    } else if (!row.id) {
      await createOne(row.serviceProvider, row.macAddress);
    }
  }
  return getAll();
}

module.exports = {
  getAll,
  createOne,
  deleteById,
  saveAll,
  getMacForRightsSubject,
  upsertMacForRightsSubject,
};
