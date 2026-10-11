const mongoose = require('mongoose');

const STATUSES = ['New', 'Contacted', 'Converted', 'Lost'];
const SOURCES = ['Website', 'Referral', 'Social Media', 'Cold Call', 'Other'];

const noteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    source: { type: String, enum: SOURCES, default: 'Website' },
    status: { type: String, enum: STATUSES, default: 'New' },
    notes: [noteSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', leadSchema);
module.exports.STATUSES = STATUSES;
module.exports.SOURCES = SOURCES;
