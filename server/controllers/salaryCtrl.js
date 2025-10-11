const Salary = require("../models/sallleryModel");
const Employee = require("../models/employeeModel");
const SalaryHistory = require("../models/salaryHistoryModel");

const addSalaryCtrl = async (req, res) => {
  try {
    const {
      employee,
      basic,
      hra,
      allowance,
      conveyance,
      specialAllowance,
      mealAllowance,
      grossSalary,
      netSalary,
      currency,
      effectiveFrom,
      bankDetails,
      taxInfo,
      remarks,
    } = req.body;

    if (!employee) {
      return res
        .status(400)
        .json({ success: false, message: "Employee is required" });
    }

    // Check if employee exists
    const empExists = await Employee.findById(employee);
    if (!empExists) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    // If salary already exists, prevent duplicate entry
    if (empExists.salary) {
      return res
        .status(400)
        .json({ success: false, message: "Salary already assigned to this employee" });
    }

    // Auto-calc gross from components if provided
    const compBasic = Number(basic || 0);
    const compHra = Number(hra || 0);
    const compConv = Number(conveyance || 0);
    const compSpecial = Number((specialAllowance ?? allowance) || 0);
    const compMeal = Number(mealAllowance || 0);
    const computedGross = compBasic + compHra + compConv + compSpecial + compMeal;

    // Create salary
    const newSalary = await Salary.create({
      employee,
      basic: compBasic,
      hra: compHra,
      allowance: compSpecial, // keep legacy field as special allowance
      conveyance: compConv,
      specialAllowance: compSpecial,
      mealAllowance: compMeal,
      grossSalary: computedGross || Number(grossSalary || 0),
      netSalary: netSalary ?? computedGross, // base net = gross; monthly net computed in payroll
      currency: currency || "INR",
      effectiveFrom,
      bankDetails,
      taxInfo,
      remarks,
    });

    // Assign salary ID to employee
    empExists.salary = newSalary._id;
    await empExists.save();

    // Log initial salary history (assignment)
    try {
      await SalaryHistory.create({
        employee,
        effectiveFrom: effectiveFrom || new Date(),
        reason: req.body?.reason || "Initial Assignment",
        appraisedBy: req.body?.appraisedBy || null,
        basic: compBasic,
        hra: compHra,
        allowance: compSpecial,
        conveyance: compConv,
        specialAllowance: compSpecial,
        mealAllowance: compMeal,
        grossSalary: newSalary?.grossSalary,
        netSalary: newSalary?.netSalary,
        currency: currency || "INR",
        remarks,
      });
    } catch (e) {
      console.error("SALARY HISTORY CREATE ERROR:", e?.message || e);
    }

    res.status(201).json({ success: true, data: newSalary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const editSalaryCtrl = async (req, res) => {
  try {
    const { id } = req.params;

    const salary = await Salary.findById(id);
    if (!salary) {
      return res
        .status(404)
        .json({ success: false, message: "Salary record not found" });
    }

    const oldEmployeeId = salary.employee.toString();
    const newEmployeeId = req.body.employee;

    // Normalize components from request
    const compBasic = Number(req.body.basic ?? salary.basic ?? 0);
    const compHra = Number(req.body.hra ?? salary.hra ?? 0);
    const compConv = Number(req.body.conveyance ?? salary.conveyance ?? 0);
    const compSpecial = Number((req.body.specialAllowance ?? req.body.allowance ?? salary.specialAllowance ?? salary.allowance) ?? 0);
    const compMeal = Number(req.body.mealAllowance ?? salary.mealAllowance ?? 0);
    const computedGross = compBasic + compHra + compConv + compSpecial + compMeal;

    const updateFields = {
      ...req.body,
      basic: compBasic,
      hra: compHra,
      allowance: compSpecial,
      conveyance: compConv,
      specialAllowance: compSpecial,
      mealAllowance: compMeal,
      grossSalary: computedGross || Number(req.body.grossSalary || salary.grossSalary || 0),
      netSalary: req.body.netSalary ?? computedGross,
    };

    // Update salary details
    const updatedSalary = await Salary.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    // Log salary history (update/appraisal)
    try {
      await SalaryHistory.create({
        employee: (newEmployeeId || oldEmployeeId),
        effectiveFrom: req.body?.effectiveFrom || new Date(),
        reason: req.body?.reason || "Update/Appraisal",
        appraisedBy: req.body?.appraisedBy || null,
        basic: updatedSalary?.basic,
        hra: updatedSalary?.hra,
        allowance: updatedSalary?.allowance,
        conveyance: updatedSalary?.conveyance,
        specialAllowance: updatedSalary?.specialAllowance,
        mealAllowance: updatedSalary?.mealAllowance,
        grossSalary: updatedSalary?.grossSalary,
        netSalary: updatedSalary?.netSalary,
        currency: updatedSalary?.currency || "INR",
        remarks: updatedSalary?.remarks,
      });
    } catch (e) {
      console.error("SALARY HISTORY UPDATE ERROR:", e?.message || e);
    }

    res.status(200).json({ success: true, data: updatedSalary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};




// 🔹 Get Single Salary by ID
const getSalaryByIdCtrl = async (req, res) => {
  try {
    const { id } = req.params; // employee id

    // find salary by employee reference
    const salary = await Salary.findOne({ employee: id })
      .populate("employee", "firstName lastName employeeCode email");

    if (!salary) {
      // Return 200 with null data to allow frontend to render "Add Salary" state cleanly
      return res.status(200).json({
        success: true,
        data: null,
        message: "No salary record found for this employee",
      });
    }

    res.status(200).json({
      success: true,
      data: salary,
    });
  } catch (error) {
    console.error("GET SALARY BY EMPLOYEE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// 🔹 Get Salary History for Employee
const getSalaryHistoryCtrl = async (req, res) => {
  try {
    const { id } = req.params; // employee id
    const history = await require("../models/salaryHistoryModel").find({ employee: id }).sort({ effectiveFrom: -1, createdAt: -1 });
    return res.status(200).json({ success: true, count: history.length, data: history });
  } catch (error) {
    console.error("GET SALARY HISTORY ERROR:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  addSalaryCtrl,
  editSalaryCtrl,
  getSalaryByIdCtrl,
  getSalaryHistoryCtrl,
};
