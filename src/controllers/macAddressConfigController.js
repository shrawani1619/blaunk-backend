const macAddressConfigService = require('../services/macAddressConfigService');

async function getMacAddressConfigController(req, res) {
  try {
    const list = await macAddressConfigService.getAll();
    return res.json({ list });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('getMacAddressConfig error:', error);
    return res.status(500).json({ message: 'Failed to load MAC address config.' });
  }
}

async function addMacAddressConfigController(req, res) {
  const { serviceProvider, macAddress } = req.body || {};
  try {
    const row = await macAddressConfigService.createOne(serviceProvider, macAddress);
    return res.status(201).json({ row });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('addMacAddressConfig error:', error);
    return res.status(500).json({ message: 'Failed to add MAC address.' });
  }
}

async function deleteMacAddressConfigController(req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'ID is required.' });
  }
  try {
    const deleted = await macAddressConfigService.deleteById(id);
    if (!deleted) {
      return res.status(404).json({ message: 'MAC address entry not found.' });
    }
    return res.json({ success: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('deleteMacAddressConfig error:', error);
    return res.status(500).json({ message: 'Failed to delete MAC address.' });
  }
}

async function saveAllMacAddressConfigController(req, res) {
  const { list } = req.body || {};
  try {
    const updated = await macAddressConfigService.saveAll(list);
    return res.json({ list: updated });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('saveAllMacAddressConfig error:', error);
    return res.status(500).json({ message: 'Failed to save MAC address config.' });
  }
}

module.exports = {
  getMacAddressConfigController,
  addMacAddressConfigController,
  deleteMacAddressConfigController,
  saveAllMacAddressConfigController,
};
