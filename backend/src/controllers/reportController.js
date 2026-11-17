const Report = require('../models/Report');

// GET /api/reports
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.id })
      .sort({ submittedAt: -1 })
      .limit(100);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reports.' });
  }
};

// GET /api/reports/:id
exports.getReport = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user.id });
    if (!report) return res.status(404).json({ message: 'Report not found.' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch report.' });
  }
};

// DELETE /api/reports/:id
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!report) return res.status(404).json({ message: 'Report not found.' });
    res.json({ message: 'Report deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete report.' });
  }
};

// DELETE /api/reports
exports.deleteAllReports = async (req, res) => {
  try {
    await Report.deleteMany({ userId: req.user.id });
    res.json({ message: 'All reports deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete reports.' });
  }
};

