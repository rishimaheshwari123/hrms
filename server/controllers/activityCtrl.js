const Activity = require("../models/activityModel");

exports.listActivitiesAdminCtrl = async (req, res) => {
  try {
    const activities = await Activity.find({}).sort({ createdAt: -1 }).limit(200);
    return res.json({ success: true, data: activities });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.listActivitiesForEmployeeCtrl = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const activities = await Activity.find({ targetEmployee: employeeId }).sort({ createdAt: -1 }).limit(200);
    return res.json({ success: true, data: activities });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.markActivitySeenCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.body.userId;
    const act = await Activity.findByIdAndUpdate(id, { $addToSet: { seenBy: userId } }, { new: true });
    return res.json({ success: true, data: act });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};