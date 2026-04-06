const mongoose = require('mongoose');

const rightsSchema = new mongoose.Schema(
  {
    employeeCode: { type: String, required: true, index: true },
    type: { type: String, required: true, enum: ['employee', '3pc'] },
    sections: [{ type: String }],
  },
  { timestamps: true },
);

// One document per employee code + type
rightsSchema.index({ employeeCode: 1, type: 1 }, { unique: true });

const Rights =
  mongoose.models.Rights || mongoose.model('Rights', rightsSchema);

module.exports = Rights;
