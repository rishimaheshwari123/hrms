require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const Employee = require("../models/employeeModel");
const { getNextCounter } = require("../utils/counter");

async function upsertEmployee({ firstName, lastName, email, password, role, department, designation, managerId }) {
  const existing = await Employee.findOne({ email });
  const hashed = await bcrypt.hash(password, 10);

  if (existing) {
    existing.firstName = firstName;
    existing.lastName = lastName;
    existing.name = `${firstName} ${lastName}`;
    existing.password = hashed;
    existing.role = role;
    existing.department = department;
    existing.designation = designation;
    if (managerId) existing.manager = managerId;
    existing.isActive = true;
    existing.employmentStatus = "Active";
    if (!existing.employeeCode) {
      existing.employeeCode = await getNextCounter("employee");
    }
    await existing.save();
    return existing;
  }

  const doc = await Employee.create({
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    email,
    password: hashed,
    role,
    department,
    designation,
    isActive: true,
    employmentStatus: "Active",
    ...(managerId ? { manager: managerId } : {}),
  });

  if (!doc.employeeCode) {
    doc.employeeCode = await getNextCounter("employee");
    await doc.save();
  }

  return doc;
}

async function run() {
  try {
    await connectDB();

    console.log("Seeding test users...");

    const admin = await upsertEmployee({
      firstName: "Admin",
      lastName: "Kumar",
      email: "admin@example.com",
      password: "Admin@12345",
      role: "admin",
      department: "Operations",
      designation: "System Administrator",
    });

    const hr = await upsertEmployee({
      firstName: "HR",
      lastName: "Sharma",
      email: "hr@example.com",
      password: "Hr@12345",
      role: "hr",
      department: "Human Resources",
      designation: "HR Executive",
    });

    const manager = await upsertEmployee({
      firstName: "Manager",
      lastName: "Singh",
      email: "manager@example.com",
      password: "Manager@12345",
      role: "manager",
      department: "Engineering",
      designation: "Engineering Manager",
    });

    const employee = await upsertEmployee({
      firstName: "Employee",
      lastName: "Gupta",
      email: "employee@example.com",
      password: "Employee@12345",
      role: "employee",
      department: "Engineering",
      designation: "Software Engineer",
      managerId: manager._id,
    });

    console.log("Seed complete:");
    console.log({
      admin: { email: admin.email, password: "Admin@12345", role: admin.role, id: admin._id },
      hr: { email: hr.email, password: "Hr@12345", role: hr.role, id: hr._id },
      manager: { email: manager.email, password: "Manager@12345", role: manager.role, id: manager._id },
      employee: { email: employee.email, password: "Employee@12345", role: employee.role, id: employee._id, manager: employee.manager },
    });
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

run();