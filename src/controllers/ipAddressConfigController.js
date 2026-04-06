const ipAddressConfigService = require('../services/ipAddressConfigService');

async function getIpAddressConfigController(req, res) {
  try {
    const list = await ipAddressConfigService.getAll();
    return res.json({ list });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('getIpAddressConfig error:', error);
    return res.status(500).json({ message: 'Failed to load IP address config.' });
  }
}

async function addIpAddressConfigController(req, res) {
  const { serviceProvider, ipAddress } = req.body || {};
  try {
    const row = await ipAddressConfigService.createOne(serviceProvider, ipAddress);
    return res.status(201).json({ row });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('addIpAddressConfig error:', error);
    return res.status(500).json({ message: 'Failed to add IP address.' });
  }
}

async function deleteIpAddressConfigController(req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'ID is required.' });
  }
  try {
    const deleted = await ipAddressConfigService.deleteById(id);
    if (!deleted) {
      return res.status(404).json({ message: 'IP address entry not found.' });
    }
    return res.json({ success: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('deleteIpAddressConfig error:', error);
    return res.status(500).json({ message: 'Failed to delete IP address.' });
  }
}

async function saveAllIpAddressConfigController(req, res) {
  const { list } = req.body || {};
  try {
    const updated = await ipAddressConfigService.saveAll(list);
    return res.json({ list: updated });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('saveAllIpAddressConfig error:', error);
    return res.status(500).json({ message: 'Failed to save IP address config.' });
  }
}

module.exports = {
  getIpAddressConfigController,
  addIpAddressConfigController,
  deleteIpAddressConfigController,
  saveAllIpAddressConfigController,
};
