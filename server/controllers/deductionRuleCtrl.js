const DeductionRule = require("../models/deductionRuleModel");
const Employee = require("../models/employeeModel");

// Create a deduction/earning rule
const createRuleCtrl = async (req, res) => {
  try {
    const { name, category, type, base, value, isTaxable, priority, active, createdBy } = req.body;

    if (!name || !category || !type || !base || value === undefined) {
      return res.status(400).json({ success: false, message: "name, category, type, base, value required" });
    }

    if (!["earning", "deduction"].includes(category)) {
      return res.status(400).json({ success: false, message: "category must be 'earning' or 'deduction'" });
    }

    if (!["fixed", "percentage"].includes(type)) {
      return res.status(400).json({ success: false, message: "type must be 'fixed' or 'percentage'" });
    }

    if (!["basic", "gross", "net", "taxable"].includes(base)) {
      return res.status(400).json({ success: false, message: "base must be one of basic/gross/net/taxable" });
    }

    if (createdBy) {
      const admin = await Employee.findById(createdBy);
      if (!admin || admin.role !== "admin") {
        return res.status(403).json({ success: false, message: "Only admin can create rules" });
      }
    }

    const rule = await DeductionRule.create({ name, category, type, base, value, isTaxable, priority, active, createdBy });
    return res.status(201).json({ success: true, data: rule });
  } catch (error) {
    console.error("CREATE RULE ERROR:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update rule
const updateRuleCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { requesterId } = req.body;

    if (requesterId) {
      const admin = await Employee.findById(requesterId);
      if (!admin || admin.role !== "admin") {
        return res.status(403).json({ success: false, message: "Only admin can update rules" });
      }
    }

    const updated = await DeductionRule.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Rule not found" });

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("UPDATE RULE ERROR:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// List rules (active filter, category filter)
const listRulesCtrl = async (req, res) => {
  try {
    const { active, category } = req.query;
    const query = {};
    if (active !== undefined) query.active = active === "true";
    if (category) query.category = category;

    const rules = await DeductionRule.find(query).sort({ priority: 1, createdAt: -1 });
    return res.status(200).json({ success: true, count: rules.length, rules });
  } catch (error) {
    console.error("LIST RULES ERROR:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete rule
const deleteRuleCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { requesterId } = req.body;

    if (requesterId) {
      const admin = await Employee.findById(requesterId);
      if (!admin || admin.role !== "admin") {
        return res.status(403).json({ success: false, message: "Only admin can delete rules" });
      }
    }

    const deleted = await DeductionRule.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Rule not found" });

    return res.status(200).json({ success: true, message: "Rule deleted" });
  } catch (error) {
    console.error("DELETE RULE ERROR:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  createRuleCtrl,
  updateRuleCtrl,
  listRulesCtrl,
  deleteRuleCtrl,
};