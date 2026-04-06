const mongoose = require('mongoose');

const ipAddressConfigSchema = new mongoose.Schema(
  {
    serviceProvider: { type: String, required: true, trim: true },
    ipAddress: { type: String, default: '', trim: true },
  },
  { timestamps: true },
);

const IpAddressConfig =
  mongoose.models.IpAddressConfig ||
  mongoose.model('IpAddressConfig', ipAddressConfigSchema);

module.exports = IpAddressConfig;
