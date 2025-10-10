const bcrypt = require("bcryptjs");
const authModel = require("../models/employeeModel");
const jwt = require("jsonwebtoken");
const { uploadImageToCloudinary } = require("../config/imageUploader");
const { getNextCounter } = require("../utils/counter");

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
      const panCardUpload = await uploadImageToCloudinary(
        files.panCard[0].path,
        process.env.FOLDER_NAME
      );
      updateData.documents.push({
        docType: "PAN Card",
        docUrl: panCardUpload.secure_url,
      });
    }

    if (files?.aadharCard) {
      const aadharUpload = await uploadImageToCloudinary(
        files.aadharCard[0].path,
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

    const updatedEmployee = await authModel.findById(id);
    if (!updatedEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // If activating and employeeCode doesn't exist, generate it
    if (isActive && !updatedEmployee.employeeCode) {
      const employeeCode = await getNextCounter("employee");
      updatedEmployee.employeeCode = employeeCode;
      updatedEmployee.employmentStatus = "Active";
    }

    updatedEmployee.isActive = isActive;
    await updatedEmployee.save();

    res.status(200).json({
      success: true,
      message: `Employee profile ${isActive ? "activated" : "deactivated"} successfully`,
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating employee profile",
      error,
    });
  }
};

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
      return res.status(401).json({
        success: false,
        message: "User is not registered with us. Please sign up to continue",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is not verified till now",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email, id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    user.token = token;
    user.password = undefined; // hide password

    // Cookie options (optional)
    const options = {
      expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      httpOnly: true,
    };

    res.cookie("token", token, options).status(200).json({
      success: true,
      token,
      user,
      message: "User login success",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Login failure. Please try again",
    });
  }
};


module.exports = {
  registerEmployeeCtrl,
  loginEmployeeCtrl,
  editEmployeeCtrl,
  verifyEmployeeCtrl

};
