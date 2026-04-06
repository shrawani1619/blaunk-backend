const mongoose = require('mongoose');

const captchaConfigSchema = new mongoose.Schema(
  {
    securityCode: { type: String, required: true, unique: true, trim: true },
    captcha: { type: String, default: '' },
  },
  { timestamps: true },
);

const CaptchaConfig =
  mongoose.models.CaptchaConfig ||
  mongoose.model('CaptchaConfig', captchaConfigSchema);

module.exports = CaptchaConfig;
