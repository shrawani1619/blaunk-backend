const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'password123';
const DEFAULT_ADMIN_EMAIL = 'admin@example.com';

async function ensureAdminUser() {
  const adminUsername = (process.env.ADMIN_USERNAME || DEFAULT_ADMIN_USERNAME).trim();
  const adminEmail = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
  const passwordHash = bcrypt.hashSync(adminPassword, 10);

  await User.deleteMany({ username: adminUsername });

  await Admin.findOneAndUpdate(
    { username: adminUsername },
    {
      $set: {
        email: adminEmail,
        passwordHash,
      },
    },
    {
      upsert: true,
      setDefaultsOnInsert: true,
      returnDocument: 'after',
    },
  );
}

async function login({ username, password }) {
  const normalizedUsername = String(username).trim();
  let user = null;
  try {
    const adminDoc = await Admin.findOne({ username: normalizedUsername }).lean();
    if (adminDoc) {
      user = {
        id: String(adminDoc._id),
        username: adminDoc.username,
        role: 'admin',
        passwordHash: adminDoc.passwordHash,
      };
    }
    if (!user) {
      const userDoc = await User.findOne({ username: normalizedUsername }).lean();
      if (userDoc) {
        user = {
          id: String(userDoc._id),
          username: userDoc.username,
          role: userDoc.role || 'user',
          passwordHash: userDoc.passwordHash,
          employeeCode: userDoc.employeeCode,
          employeeType: userDoc.employeeType,
        };
      }
    }
  } catch {
    // DB error
  }
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid password');
  }

  const token = jwt.sign(
    {
      sub: user.id,
      username: user.username,
      role: user.role,
      ...(user.employeeCode != null && { employeeCode: user.employeeCode }),
      ...(user.employeeType != null && { employeeType: user.employeeType }),
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );

  return { user, token };
}

async function forgotPassword(email) {
  if (!email || !String(email).trim()) {
    throw new Error('Email is required');
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).lean();
  if (!user) {
    return { sent: true };
  }
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  await User.updateOne(
    { _id: user._id },
    {
      resetToken: hashedToken,
      resetTokenExpires: new Date(Date.now() + RESET_TOKEN_EXPIRY_MS),
    },
  );
  return { sent: true, resetToken: rawToken };
}

async function resetPasswordWithToken(token, newPassword) {
  if (!token || !newPassword || String(newPassword).length < 6) {
    throw new Error('Valid token and password (min 6 characters) are required');
  }
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetToken: hashedToken,
    resetTokenExpires: { $gt: new Date() },
  });
  if (!user) {
    throw new Error('Invalid or expired reset link. Please request a new one.');
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await User.updateOne(
    { _id: user._id },
    {
      passwordHash,
      resetToken: null,
      resetTokenExpires: null,
    },
  );
  return { success: true };
}

async function verifyToken(token) {
  const payload = jwt.verify(token, JWT_SECRET);
  return {
    id: payload.sub,
    username: payload.username,
    role: payload.role,
    employeeCode: payload.employeeCode ?? null,
    employeeType: payload.employeeType ?? null,
  };
}

module.exports = {
  login,
  verifyToken,
  forgotPassword,
  resetPasswordWithToken,
  ensureAdminUser,
};

