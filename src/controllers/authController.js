const authService = require('../services/authService');
const EmployeeCredentials = require('../models/EmployeeCredentials');
const User = require('../models/User');
const Admin = require('../models/Admin');

async function forgotPasswordController(req, res) {
  const { email } = req.body || {};
  if (!email || !String(email).trim()) {
    return res.status(400).json({ message: 'Email is required.' });
  }
  try {
    const result = await authService.forgotPassword(email);
    const baseUrl = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
    const resetLink = result.resetToken
      ? `${baseUrl}/reset-password?token=${encodeURIComponent(result.resetToken)}`
      : null;
    return res.json({
      message: 'If an account exists with this email, you will receive a password reset link.',
      ...(resetLink && { resetLink }),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}

async function resetPasswordController(req, res) {
  const { token, newPassword } = req.body || {};
  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required.' });
  }
  try {
    await authService.resetPasswordWithToken(token, newPassword);
    return res.json({ message: 'Password has been reset. You can now log in.' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Reset password error:', error);
    const status = error.message?.includes('Invalid or expired') ? 400 : 500;
    return res.status(status).json({ message: error.message || 'Failed to reset password.' });
  }
}

async function loginController(req, res) {
  const { username, password, captcha } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  const adminUsername = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
  const isAdmin = String(username).trim().toLowerCase() === adminUsername;
  if (!isAdmin && (!captcha || !String(captcha).trim())) {
    return res.status(400).json({ message: 'Captcha is required for non-admin login.' });
  }

  try {
    const { user, token } = await authService.login({ username, password });
    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Login error:', error);
    return res.status(401).json({ message: 'Invalid credentials.' });
  }
}

async function meController(req, res) {
  const user = { ...req.user };
  if (user.username) {
    try {
      const isAdmin = user.role === 'admin' || String(user.username).toLowerCase() === 'admin';
      if (isAdmin) {
        const adminDoc = await Admin.findOne(
          { username: user.username },
          { email: 1 },
        ).lean();
        if (adminDoc && adminDoc.email) user.email = adminDoc.email;
      } else {
        const dbUser = await User.findOne(
          { username: user.username },
          { email: 1 },
        ).lean();
        if (dbUser && dbUser.email) user.email = dbUser.email;
      }
    } catch {
      // leave email unset on lookup error
    }
  }
  if (user.employeeCode) {
    try {
      const emp = await EmployeeCredentials.findOne(
        { empCode: String(user.employeeCode).trim() },
        { department: 1 },
      ).lean();
      if (emp && emp.department) user.department = emp.department;
    } catch {
      // leave department unset on lookup error
    }
  }
  return res.json({ user });
}

module.exports = {
  loginController,
  meController,
  forgotPasswordController,
  resetPasswordController,
};
