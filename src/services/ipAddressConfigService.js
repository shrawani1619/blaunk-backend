const IpAddressConfig = require('../models/IpAddressConfig');

async function getAll() {
  const list = await IpAddressConfig.find({}).sort({ createdAt: 1 }).lean();
  return (list || []).map((doc) => ({
    id: doc._id.toString(),
    serviceProvider: doc.serviceProvider || '',
    ipAddress: doc.ipAddress || '',
  }));
}

async function createOne(serviceProvider, ipAddress) {
  const doc = await IpAddressConfig.create({
    serviceProvider: serviceProvider != null ? String(serviceProvider).trim() : '',
    ipAddress: ipAddress != null ? String(ipAddress).trim() : '',
  });
  return {
    id: doc._id.toString(),
    serviceProvider: doc.serviceProvider || '',
    ipAddress: doc.ipAddress || '',
  };
}

async function deleteById(id) {
  const result = await IpAddressConfig.findByIdAndDelete(id);
  return !!result;
}

async function saveAll(rows) {
  if (!Array.isArray(rows)) return getAll();
  const ids = rows.filter((r) => r.id).map((r) => r.id);
  const existing = await IpAddressConfig.find({ _id: { $in: ids } }).lean();
  const existingIds = new Set(existing.map((e) => e._id.toString()));
  for (const row of rows) {
    if (row.id && existingIds.has(row.id)) {
      await IpAddressConfig.findByIdAndUpdate(row.id, {
        $set: {
          serviceProvider: row.serviceProvider != null ? String(row.serviceProvider).trim() : '',
          ipAddress: row.ipAddress != null ? String(row.ipAddress).trim() : '',
        },
      });
    } else if (!row.id) {
      await createOne(row.serviceProvider, row.ipAddress);
    }
  }
  return getAll();
}

module.exports = {
  getAll,
  createOne,
  deleteById,
  saveAll,
};
