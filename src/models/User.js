const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'user' },
    employeeCode: { type: String, trim: true },
    employeeType: { type: String, enum: ['employee', '3pc'], default: 'employee' },
    resetToken: { type: String, default: null },
    resetTokenExpires: { type: Date, default: null },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 });
userSchema.index({ resetToken: 1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
