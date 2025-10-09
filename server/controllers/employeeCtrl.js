const bcrypt = require("bcryptjs");
const authModel = require("../models/employeeModel");
const jwt = require("jsonwebtoken");
const { uploadImageToCloudinary } = require("../config/imageUploader");
const { getNextCounter } = require("../utils/counter");
const RefreshToken = require("../models/refreshTokenModel");
const crypto = require("crypto");
const Salary = require("../models/sallleryModel");

// Helper to safely parse numeric inputs
const num = (val) => {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const n = parseFloat(val);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
};

const registerEmployeeCtrl = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const existingUser = await authModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 Create user with name field (firstName + lastName)
    const user = await authModel.create({
      firstName,
      lastName,
      name: `${firstName} ${lastName}`, // ✅ Save combined name
      email,
      phone,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { email: user.email, id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    // Optionally store the token if required in DB
    user.token = token;
    await user.save();

    // Set token as HTTP-only cookie
    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      httpOnly: true,
    };
    res.cookie("token", token, options);

    return res.status(200).json({
      success: true,
      token,
      user,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    });
  }
};


const editEmployeeCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;

    const {
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth,
      maritalStatus,
      bloodGroup,
      nationality,
      email,
      workEmail,
      personalPhone,
      alternatePhone,
      address,
      dateOfJoining,
      dateOfLeaving,
      employmentStatus,
      designation,
      department,
      manager,
      location,
      employeeType,
      skills,
      education,
      certifications,
      emergencyContact,
      performance,
    } = req.body;

    const updateData = {
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth,
      maritalStatus,
      bloodGroup,
      nationality,
      email,
      workEmail,
      personalPhone,
      alternatePhone,
      address,
      dateOfJoining,
      dateOfLeaving,
      employmentStatus,
      designation,
      department,
      manager,
      location,
      employeeType,
      skills,
      education,
      certifications,
      emergencyContact,
      performance,
    };

    updateData.documents = updateData.documents || [];

    if (files?.panCard) {
      const pickFile = (f) => (Array.isArray(f) ? f[0] : f);
      const panFile = pickFile(files.panCard);
      const panCardUpload = await uploadImageToCloudinary(
        panFile,
        process.env.FOLDER_NAME
      );
      updateData.documents.push({
        docType: "PAN Card",
        docUrl: panCardUpload.secure_url,
      });
    }

    if (files?.aadharCard) {
      const pickFile = (f) => (Array.isArray(f) ? f[0] : f);
      const aadharFile = pickFile(files.aadharCard);
      const aadharUpload = await uploadImageToCloudinary(
        aadharFile,
        process.env.FOLDER_NAME
      );
      updateData.documents.push({
        docType: "Aadhar Card",
        docUrl: aadharUpload.secure_url,
      });
    }

    const updatedEmployee = await authModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedEmployee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error updating employee", error });
  }
};

const verifyEmployeeCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean value",
      });
    }

    const mongoose = require("mongoose");
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const employee = await authModel.findById(id).session(session);
      if (!employee) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, message: "Employee not found" });
      }

      if (isActive && !employee.employeeCode) {
        const employeeCode = await getNextCounter("employee");
        employee.employeeCode = employeeCode;
        employee.employmentStatus = "Active";
      }

      employee.isActive = isActive;
      await employee.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        success: true,
        message: `Employee profile ${isActive ? "activated" : "deactivated"} successfully`,
        employee,
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error(err);
      return res.status(500).json({ success: false, message: "Error updating employee profile", error: err });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error updating employee profile", error });
  }
};

// Update login to issue access + refresh tokens
const loginEmployeeCtrl = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill up all the required fields",
      });
    }

    const user = await authModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "User is not registered with us. Please sign up to continue" });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Your account is not verified till now" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Password is incorrect" });
    }

    const accessToken = jwt.sign({ email: user.email, id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const rawRefreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Persist refresh token hash
    const tokenHash = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");
    await RefreshToken.create({
      user: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    user.password = undefined;

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    };

    res
      .cookie("refreshToken", rawRefreshToken, cookieOptions)
      .status(200)
      .json({ success: true, token: accessToken, accessToken, user, refreshTokenCookieSet: true, message: "User login success" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Login failure. Please try again" });
  }
};


// Refresh access token using refresh cookie
const refreshCtrl = async (req, res) => {
  try {
    const { refreshToken } = req.cookies || {};
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "No refresh token" });
    }
    // Validate JWT first
    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }
    // Check DB token
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const tokenDoc = await RefreshToken.findOne({ user: payload.id, tokenHash });
    if (!tokenDoc || tokenDoc.revoked || tokenDoc.expiresAt < new Date()) {
      return res.status(401).json({ success: false, message: "Refresh token expired or revoked" });
    }

    const user = await authModel.findById(payload.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "User not active" });
    }

    const newAccessToken = jwt.sign({ email: user.email, id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "15m" });
    return res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to refresh token" });
  }
};

// Logout: clear refresh cookie
const logoutCtrl = async (req, res) => {
  try {
    const { refreshToken } = req.cookies || {};
    if (refreshToken) {
      const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
      await RefreshToken.findOneAndUpdate({ tokenHash }, { $set: { revoked: true } });
    }
    res.clearCookie("refreshToken", { path: "/" });
    return res.status(200).json({ success: true, message: "Logged out" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Logout failed" });
  }
};

// Forgot Password: issue reset token and send email
const forgotPasswordCtrl = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    const user = await authModel.findOne({ email });
    if (!user) {
      // Do not reveal whether email exists
      return res.status(200).json({ success: true, message: "If this email exists, a reset link has been sent" });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    // Optionally store hashed token
    const resetToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const origin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
    const resetLink = `${origin}/reset-password?token=${rawToken}`;

    const mailSender = require("../utils/mailSenderr");
    await mailSender(email, "Password Reset", `<p>Click the link below to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p><p>This link will expire in 1 hour.</p>`);

    return res.status(200).json({ success: true, message: "Reset link sent" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to initiate password reset" });
  }
};

// Reset Password: verify token and set new password
const resetPasswordCtrl = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Token and new password are required" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await authModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to reset password" });
  }
};

// Employees list with search and pagination
const listEmployeesCtrl = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", department, role } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

    const filter = {};
    if (department) {
      filter.department = department;
    }
    if (role) {
      filter.role = role;
    }
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { name: regex },
        { email: regex },
        { designation: regex },
        { department: regex },
      ];
    }

    const total = await authModel.countDocuments(filter);
    const employees = await authModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .select("firstName lastName name email department designation employmentStatus isActive role employeeCode")
      .lean();

    return res.status(200).json({
      success: true,
      data: employees,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to fetch employees" });
  }
};

// Get single employee
const getEmployeeCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await authModel.findById(id).lean();
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    return res.status(200).json({ success: true, data: employee });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to fetch employee" });
  }
};

// Delete employee
const deleteEmployeeCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await authModel.findByIdAndDelete(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    return res.status(200).json({ success: true, message: "Employee deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to delete employee" });
  }
};

// Create employee by Admin/HR/Manager
const createEmployeeCtrl = async (req, res) => {
  try {
    const files = req.files;
    const {
      // Basic
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth,
      maritalStatus,
      bloodGroup,
      nationality,
      photoUrl,
      // Contact
      email,
      workEmail,
      personalPhone,
      alternatePhone,
      address, // JSON string or object
      // Job
      dateOfJoining,
      dateOfLeaving,
      employmentStatus, // default Pending
      designation,
      department,
      manager, // managerId
      location,
      employeeType,
      // Account
      role = "employee",
      password,
      // Arrays
      skills,
      education,
      certifications,
      // Emergency & performance
      emergencyContact,
      performance,
      // activation
      isActive,
    } = req.body;

    if (!email || !password || !firstName) {
      return res.status(400).json({ success: false, message: "firstName, email and password are required" });
    }

    const exists = await authModel.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: "Employee with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Normalize address if provided as JSON string
    let addressObj = address;
    try {
      if (typeof address === "string") addressObj = JSON.parse(address);
    } catch (e) {
      addressObj = undefined;
    }

    // Normalize arrays if provided as JSON strings
    const parseMaybeJSON = (val) => {
      if (Array.isArray(val) || typeof val === "object") return val;
      if (typeof val === "string") {
        try { return JSON.parse(val); } catch { return undefined; }
      }
      return undefined;
    };

    const doc = new authModel({
      firstName,
      middleName,
      lastName,
      name: [firstName, middleName, lastName].filter(Boolean).join(" "),
      gender,
      dateOfBirth,
      maritalStatus,
      bloodGroup,
      nationality,
      photoUrl,
      email,
      workEmail,
      personalPhone,
      alternatePhone,
      address: addressObj,
      dateOfJoining,
      dateOfLeaving,
      employmentStatus: employmentStatus || (isActive ? "Active" : "Pending"),
      designation,
      department,
      manager: manager || undefined,
      location,
      employeeType,
      role,
      password: hashedPassword,
      skills: parseMaybeJSON(skills),
      education: parseMaybeJSON(education),
      certifications: parseMaybeJSON(certifications),
      emergencyContact: parseMaybeJSON(emergencyContact),
      performance: parseMaybeJSON(performance),
      isActive: Boolean(isActive),
    });

    // Documents upload (optional)
    doc.documents = doc.documents || [];
    if (files?.panCard) {
      const panFile = pickFile(files.panCard);
      const pan = await uploadImageToCloudinary(panFile, process.env.FOLDER_NAME);
      doc.documents.push({ docType: "PAN Card", docUrl: pan.secure_url });
    }
    if (files?.aadharCard) {
      const aadFile = pickFile(files.aadharCard);
      const aad = await uploadImageToCloudinary(aadFile, process.env.FOLDER_NAME);
      doc.documents.push({ docType: "Aadhar Card", docUrl: aad.secure_url });
    }
    // New uploads: Photo, Resume (PDF), ID Proof, Offer/Experience Letters
    if (files?.photo) {
      const photoFile = pickFile(files.photo);
      const up = await uploadImageToCloudinary(photoFile, process.env.FOLDER_NAME);
      doc.photoUrl = up.secure_url;
    }
    if (files?.resume) {
      const resumeFile = pickFile(files.resume);
      const up = await uploadImageToCloudinary(resumeFile, process.env.FOLDER_NAME);
      doc.documents.push({ docType: "Resume", docUrl: up.secure_url });
    }
    if (files?.idProof) {
      const idFile = pickFile(files.idProof);
      const up = await uploadImageToCloudinary(idFile, process.env.FOLDER_NAME);
      doc.documents.push({ docType: "ID Proof", docUrl: up.secure_url });
    }
    if (files?.offerLetter) {
      const offerFile = pickFile(files.offerLetter);
      const up = await uploadImageToCloudinary(offerFile, process.env.FOLDER_NAME);
      doc.documents.push({ docType: "Offer Letter", docUrl: up.secure_url });
    }
    if (files?.experienceLetter) {
      const expFile = pickFile(files.experienceLetter);
      const up = await uploadImageToCloudinary(expFile, process.env.FOLDER_NAME);
      doc.documents.push({ docType: "Experience Letter", docUrl: up.secure_url });
    }

    // Generate employeeCode if active
    if (doc.isActive && !doc.employeeCode) {
      doc.employeeCode = await getNextCounter("employee");
    }

    await doc.save();

    // Salary creation (optional)
    const {
      basicSalary,
      hra,
      allowances,
      deductions,
      effectiveFrom,
      bankName,
      branch,
      accountNumber,
      ifscCode,
      panNumber,
      pfNumber,
      esiNumber,
      currency,
      salaryRemarks,
    } = req.body;

    if (basicSalary || hra || allowances || deductions || bankName || accountNumber || ifscCode || panNumber || pfNumber || esiNumber) {
      const basic = num(basicSalary) || 0;
      const hraNum = num(hra) || 0;
      const allowNum = num(allowances) || 0;
      const deductNum = num(deductions) || 0;
      const grossSalary = basic + hraNum + allowNum;
      const netSalary = grossSalary - deductNum;
      const salaryDoc = await Salary.create({
        employee: doc._id,
        basic,
        hra: hraNum,
        allowance: allowNum,
        grossSalary,
        netSalary,
        currency: currency || "INR",
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
        bankDetails: {
          bankName,
          branch,
          accountNumber,
          ifscCode,
        },
        taxInfo: {
          panNumber,
          pfNumber,
          esiNumber,
        },
        remarks: salaryRemarks,
      });
      doc.salary = doc.salary || [];
      doc.salary.push(salaryDoc._id);
      await doc.save();
    }

    const safe = doc.toObject();
    delete safe.password;

    return res.status(201).json({ success: true, message: "Employee created", data: safe });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to create employee", error: error?.message });
  }
};

module.exports = {
  registerEmployeeCtrl,
  loginEmployeeCtrl,
  editEmployeeCtrl,
  verifyEmployeeCtrl,
  refreshCtrl,
  logoutCtrl,
  forgotPasswordCtrl,
  resetPasswordCtrl,
  listEmployeesCtrl,
  getEmployeeCtrl,
  deleteEmployeeCtrl,
  createEmployeeCtrl,
};
