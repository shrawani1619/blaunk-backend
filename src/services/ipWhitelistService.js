const AllowedIp = require('../models/AllowedIp');

/**
 * Add a new allowed IP (upsert by ip_address).
 */
async function addAllowedIp(serviceProvider, ipAddress) {
  const normalizedIp = String(ipAddress || '').trim();
  if (!normalizedIp) {
    const err = new Error('ip_address is required');
    err.statusCode = 400;
    throw err;
  }
  const doc = await AllowedIp.findOneAndUpdate(
    { ipAddress: normalizedIp },
    { $set: { serviceProvider: String(serviceProvider || '').trim() } },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true },
  ).lean();
  return {
    id: String(doc._id),
    service_provider: doc.serviceProvider ?? '',
    ip_address: doc.ipAddress ?? '',
    created_at: doc.createdAt,
  };
}

/**
 * Get all allowed IPs ordered by created_at.
 */
async function getAllowedIps() {
  const list = await AllowedIp.find({}).sort({ createdAt: 1 }).lean();
  return list.map((doc) => ({
    id: String(doc._id),
    service_provider: doc.serviceProvider ?? '',
    ip_address: doc.ipAddress ?? '',
    created_at: doc.createdAt,
  }));
}

/**
 * Delete an allowed IP by id.
 */
async function deleteAllowedIp(id) {
  if (!id || typeof id !== 'string') {
    const err = new Error('Valid id is required');
    err.statusCode = 400;
    throw err;
  }
  const result = await AllowedIp.findByIdAndDelete(id);
  return !!result;
}

/**
 * Check if an IP is in the whitelist.
 */
async function isIpAllowed(ipAddress) {
  if (!ipAddress || !String(ipAddress).trim()) return false;
  const found = await AllowedIp.findOne({
    ipAddress: String(ipAddress).trim(),
  }).lean();
  return !!found;
}

module.exports = {
  addAllowedIp,
  getAllowedIps,
  deleteAllowedIp,
  isIpAllowed,
};
