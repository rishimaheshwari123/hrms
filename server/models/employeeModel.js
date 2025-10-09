

const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    // 🔹 Basic Information
    employeeCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    firstName: { type: String, required: true },
    name: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    dateOfBirth: { type: Date },
    maritalStatus: { type: String, enum: ["Single", "Married", "Divorced", "Widowed"] },
    bloodGroup: { type: String },
    nationality: { type: String },
    photoUrl: { type: String },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["employee", "admin", "manager", "hr"],
      default: "employee",
      index: true,
    },

    token: {
      type: String,
    },

    // 🔹 Contact Information
    email: { type: String, unique: true, index: true },
    workEmail: { type: String, unique: true },
    personalPhone: { type: String },
    alternatePhone: { type: String },
    address: {
      line1: { type: String },
      line2: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },

    // 🔹 Job / Employment Details
    dateOfJoining: { type: Date },
    dateOfLeaving: { type: Date },
    employmentStatus: {
      type: String,
      enum: ["Pending","Active", "On Leave", "Resigned", "Terminated", "Retired"],
      default: "Pending",
    },
    designation: { type: String },
    department: { type: String, index: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    location: { type: String },
    employeeType: { type: String, enum: ["Permanent", "Contract", "Intern", "Part-Time","Full-time"] },

    // 🔹 Reference Links
    salary: [{ type: mongoose.Schema.Types.ObjectId, ref: "Salary" }], // multiple salary revisions
    leaves: [{ type: mongoose.Schema.Types.ObjectId, ref: "Leave" }], // employee leave records

    // 🔹 Education / Skills / Certifications
    education: [
      {
        qualification: { type: String },
        institution: { type: String },
        yearOfPassing: { type: Number },
        grade: { type: String },
      },
    ],
    skills: [{ type: String }],
    certifications: [
      {
        name: { type: String },
        issuedBy: { type: String },
        validTill: { type: Date },
      },
    ],

    // 🔹 Emergency Contact
    emergencyContact: {
      name: { type: String },
      relation: { type: String },
      phone: { type: String },
      address: { type: String },
    },

    // 🔹 Documents
    documents: [
      {
        docType: { type: String },
        docUrl: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // 🔹 Performance / Appraisal
    performance: {
      lastAppraisalDate: { type: Date },
      lastRating: { type: String },
      remarks: { type: String },
    },

    // 🔹 System Meta
    isActive: { type: Boolean, default: false },

    // 🔹 Password reset
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

// 🔹 Text indexes for search
employeeSchema.index({ name: "text", designation: "text" });

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
