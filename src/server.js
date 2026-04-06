require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const path = require('path');
const { checkIPWhitelist } = require('./middleware/checkIPWhitelist');
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const shareholdingRoutes = require('./routes/shareholdingRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const employeeCredentialsRoutes = require('./routes/employeeCredentialsRoutes');
const rightsRoutes = require('./routes/rightsRoutes');
const payslipReportRoutes = require('./routes/payslipReportRoutes');
const captchaConfigRoutes = require('./routes/captchaConfigRoutes');
const ipAddressConfigRoutes = require('./routes/ipAddressConfigRoutes');
const macAddressConfigRoutes = require('./routes/macAddressConfigRoutes');
const adminIpWhitelistRoutes = require('./routes/adminIpWhitelistRoutes');
const { connectDatabase } = require('./config/database');
const authService = require('./services/authService');

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const allowedOrigins = [
  CLIENT_ORIGIN,
  'http://localhost:5175',
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use(morgan('dev'));

// IP whitelist: allow only requests from allowed_ips (bypass: /health, /admin/*)
app.use(checkIPWhitelist);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'blaunk-admin-auth' });
});

app.use('/admin', adminIpWhitelistRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/shareholding', shareholdingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/employee-credentials', employeeCredentialsRoutes);
app.use('/api/rights', rightsRoutes);
app.use('/api/payslip-report', payslipReportRoutes);
app.use('/api/captcha', captchaConfigRoutes);
app.use('/api/ip-address', ipAddressConfigRoutes);
app.use('/api/mac-address', macAddressConfigRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

async function start() {
  try {
    await connectDatabase();
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB');
    await authService.ensureAdminUser();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  app.listen(PORT, () => console.log(`Auth server listening on port ${PORT}`));
}

start();

