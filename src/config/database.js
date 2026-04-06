const mongoose = require('mongoose');

// Single MongoDB configuration + connection helper for the project.
// Database name is included directly in the MONGO_URI, so there is
// no need for a separate variable.

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blaunk';

async function connectDatabase() {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not configured');
  }

  await mongoose.connect(MONGO_URI);
  return mongoose.connection;
}

module.exports = {
  MONGO_URI,
  connectDatabase,
};

