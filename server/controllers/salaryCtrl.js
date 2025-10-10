const Salary = require("../models/sallleryModel");
const Employee = require("../models/employeeModel");

const addSalaryCtrl = async (req, res) => {
  try {
    const {
      employee,
      basic,
      hra,
      allowance,
      grossSalary,
      netSalary,
      currency,
      effectiveFrom,
      bankDetails,
      taxInfo,
      remarks,
    } = req.body;

    if (!employee ) {
      return res.status(400).json({ success: false, message: "Employee, is required" });
    }

    // Check if employee exists
    const empExists = await Employee.findById(employee);
    if (!empExists) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    // Create salary
    const newSalary = await Salary.create({
      employee,
      basic,
      hra,
      allowance,
      grossSalary,
      netSalary,
      currency: currency || "INR",
      effectiveFrom,
      bankDetails,
      taxInfo,
      remarks,
    });

    // Push salary ID to employee's salary array
    empExists.salary.push(newSalary._id);
    await empExists.save();

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
      return res.status(404).json({ success: false, message: "Salary record not found" });
    }

    const oldEmployeeId = salary.employee.toString();
    const newEmployeeId = req.body.employee;

    // Update salary
    const updatedSalary = await Salary.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    // If employee changed, update salary arrays
    if (newEmployeeId && newEmployeeId !== oldEmployeeId) {
      const oldEmployee = await Employee.findById(oldEmployeeId);
      if (oldEmployee) {
        oldEmployee.salary = oldEmployee.salary.filter(s => s.toString() !== id);
        await oldEmployee.save();
      }

      const newEmployee = await Employee.findById(newEmployeeId);
      if (newEmployee) {
        newEmployee.salary.push(updatedSalary._id);
        await newEmployee.save();
      }
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
      return res.status(404).json({
        success: false,
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


module.exports = {
  addSalaryCtrl,
  editSalaryCtrl,
  getSalaryByIdCtrl,
};
