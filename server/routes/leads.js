const express = require('express');
const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const auth = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();
const { STATUSES, SOURCES } = Lead;

router.use(auth); // every lead route needs a logged-in admin

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/leads?status=New&search=acme
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { status, search } = req.query;
    const filter = {};

    if (status) {
      if (!STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Invalid status filter' });
      }
      filter.status = status;
    }
    if (search) {
      const rx = new RegExp(escapeRegex(String(search)), 'i');
      filter.$or = [{ name: rx }, { email: rx }];
    }

    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    res.json(leads);
  })
);

// GET /api/leads/stats/summary -> counts per status, for a dashboard
router.get(
  '/stats/summary',
  asyncHandler(async (req, res) => {
    const rows = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const stats = Object.fromEntries(STATUSES.map((s) => [s, 0]));
    let total = 0;
    rows.forEach((r) => {
      stats[r._id] = r.count;
      total += r.count;
    });
    res.json({ ...stats, total });
  })
);

// POST /api/leads
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, email, phone, source, status } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    if (source && !SOURCES.includes(source)) {
      return res.status(400).json({ message: 'Invalid source' });
    }
    if (status && !STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const lead = await Lead.create({ name, email, phone, source, status });
    res.status(201).json(lead);
  })
);

// GET /api/leads/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  })
);

// PUT /api/leads/:id - update lead fields (e.g. status)
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }
    const { name, email, phone, source, status } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = email;
    if (phone !== undefined) update.phone = phone;
    if (source !== undefined) update.source = source;
    if (status !== undefined) update.status = status;

    const lead = await Lead.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  })
);

// POST /api/leads/:id/notes - add a follow-up note to a lead
router.post(
  '/:id/notes',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Note text is required' });
    }
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    lead.notes.push({ text: text.trim() });
    await lead.save();
    res.status(201).json(lead);
  })
);

// DELETE /api/leads/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json({ message: 'Lead deleted' });
  })
);

module.exports = router;
