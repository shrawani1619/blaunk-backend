const captchaConfigService = require('../services/captchaConfigService');

async function getCaptchaConfigController(req, res) {
  try {
    const configs = await captchaConfigService.getAll();
    return res.json({ configs });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('getCaptchaConfig error:', error);
    return res.status(500).json({ message: 'Failed to load captcha config.' });
  }
}

async function saveCaptchaConfigController(req, res) {
  const { configs } = req.body || {};
  try {
    const updated = await captchaConfigService.saveAll(configs);
    return res.json({ configs: updated });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('saveCaptchaConfig error:', error);
    return res.status(500).json({ message: 'Failed to save captcha config.' });
  }
}

module.exports = {
  getCaptchaConfigController,
  saveCaptchaConfigController,
};
