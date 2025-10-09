import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Swal from "sweetalert2";
import { apiConnector } from "@/service/apiConnector";
import { employees } from "@/service/apis";

const addEmployeeSchema = z.object({
  // Basic
  firstName: z.string().min(2, "First Name is required"),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  maritalStatus: z.string().optional(),
  bloodGroup: z.string().optional(),
  nationality: z.string().optional(),
  // Contact
  email: z.string().email("Valid email required"),
  workEmail: z.string().optional(),
  personalPhone: z.string().optional(),
  alternatePhone: z.string().optional(),
  // Address
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  // Job
  dateOfJoining: z.string().optional(),
  designation: z.string().optional(),
  department: z.string().optional(),
  manager: z.string().optional(),
  location: z.string().optional(),
  employeeType: z.string().optional(),
  // Account
  role: z.enum(["employee", "manager", "hr", "admin"]).default("employee"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  isActive: z.boolean().default(false),
  // Arrays and misc
  skills: z.string().optional(),
  education: z.string().optional(),
  certifications: z.string().optional(),
  emergencyName: z.string().optional(),
  emergencyRelation: z.string().optional(),
  emergencyPhone: z.string().optional(),
  performanceNotes: z.string().optional(),
  // Salary & Bank
  basicSalary: z.string().optional(),
  hra: z.string().optional(),
  allowances: z.string().optional(),
  deductions: z.string().optional(),
  currency: z.string().optional(),
  salaryRemarks: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  panNumber: z.string().optional(),
  pfNumber: z.string().optional(),
  esiNumber: z.string().optional(),
});

type AddEmployeeFormData = z.infer<typeof addEmployeeSchema> & {
  panCard?: FileList;
  aadharCard?: FileList;
  photo?: FileList;
  resume?: FileList;
  idProof?: FileList;
  offerLetter?: FileList;
  experienceLetter?: FileList;
};

const AddEmployee: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [managers, setManagers] = useState<Array<{ _id: string; firstName?: string; lastName?: string; name?: string; email?: string }>>([]);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<AddEmployeeFormData>({
    resolver: zodResolver(addEmployeeSchema),
    defaultValues: { role: "employee", isActive: false }
  });

  // Fetch managers for dropdown
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await apiConnector("GET", employees.LIST, undefined, undefined, { role: "manager", limit: 200 });
        const list = res?.data?.data || [];
        setManagers(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to fetch managers", err);
        setManagers([]);
      }
    };
    fetchManagers();
  }, []);

  // Salary computation
  const bs = parseFloat(watch("basicSalary") || "0") || 0;
  const hraVal = parseFloat(watch("hra") || "0") || 0;
  const allowVal = parseFloat(watch("allowances") || "0") || 0;
  const deductVal = parseFloat(watch("deductions") || "0") || 0;
  const grossSalary = bs + hraVal + allowVal;
  const netSalary = grossSalary - deductVal;

  const onSubmit = async (data: AddEmployeeFormData) => {
    const fd = new FormData();

    // Basic
    fd.append("firstName", data.firstName);
    if (data.middleName) fd.append("middleName", data.middleName);
    if (data.lastName) fd.append("lastName", data.lastName);
    if (data.gender) fd.append("gender", data.gender);
    if (data.dateOfBirth) fd.append("dateOfBirth", data.dateOfBirth);
    if (data.maritalStatus) fd.append("maritalStatus", data.maritalStatus);
    if (data.bloodGroup) fd.append("bloodGroup", data.bloodGroup);
    if (data.nationality) fd.append("nationality", data.nationality);

    // Contact
    fd.append("email", data.email);
    if (data.workEmail) fd.append("workEmail", data.workEmail);
    if (data.personalPhone) fd.append("personalPhone", data.personalPhone);
    if (data.alternatePhone) fd.append("alternatePhone", data.alternatePhone);

    // Address JSON (keep consistent with backend)
    const address: any = {
      street: data.street || "",
      city: data.city || "",
      state: data.state || "",
      zip: data.zip || "",
      country: data.country || "",
    };
    fd.append("address", JSON.stringify(address));

    // Job
    if (data.dateOfJoining) fd.append("dateOfJoining", data.dateOfJoining);
    if (data.designation) fd.append("designation", data.designation);
    if (data.department) fd.append("department", data.department);
    if (data.manager) fd.append("manager", data.manager);
    if (data.location) fd.append("location", data.location);
    if (data.employeeType) fd.append("employeeType", data.employeeType);

    // Account
    fd.append("role", data.role);
    fd.append("password", data.password);
    fd.append("isActive", String(data.isActive));

    // Arrays
    const parseCSV = (v?: string) => v ? v.split(",").map(s => s.trim()).filter(Boolean) : [];
    const skillsArr = parseCSV(data.skills);
    const educationArr = parseCSV(data.education);
    const certsArr = parseCSV(data.certifications);
    if (skillsArr.length) fd.append("skills", JSON.stringify(skillsArr));
    if (educationArr.length) fd.append("education", JSON.stringify(educationArr));
    if (certsArr.length) fd.append("certifications", JSON.stringify(certsArr));

    // Emergency & performance
    const emergencyContact: any = {
      name: data.emergencyName || "",
      relation: data.emergencyRelation || "",
      phone: data.emergencyPhone || "",
    };
    fd.append("emergencyContact", JSON.stringify(emergencyContact));
    if (data.performanceNotes) fd.append("performance", JSON.stringify({ notes: data.performanceNotes }));

    // Salary & Bank
    fd.append("basicSalary", (data.basicSalary || "0"));
    fd.append("hra", (data.hra || "0"));
    fd.append("allowances", (data.allowances || "0"));
    fd.append("deductions", (data.deductions || "0"));
    fd.append("netPay", String(netSalary));
    if (data.currency) fd.append("currency", data.currency);
    if (data.salaryRemarks) fd.append("salaryRemarks", data.salaryRemarks);
    if (data.bankName) fd.append("bankName", data.bankName);
    if (data.accountNumber) fd.append("accountNumber", data.accountNumber);
    if (data.ifscCode) fd.append("ifscCode", data.ifscCode);
    if (data.panNumber) fd.append("panNumber", data.panNumber);
    if (data.pfNumber) fd.append("pfNumber", data.pfNumber);
    if (data.esiNumber) fd.append("esiNumber", data.esiNumber);

    // Files
    const appendFile = (field?: FileList, key?: string) => {
      if (field && field.length > 0 && key) fd.append(key, field[0]);
    };
    appendFile(data.panCard, "panCard");
    appendFile(data.aadharCard, "aadharCard");
    appendFile(data.photo, "photo");
    appendFile(data.resume, "resume");
    appendFile(data.idProof, "idProof");
    appendFile(data.offerLetter, "offerLetter");
    appendFile(data.experienceLetter, "experienceLetter");

    Swal.fire({
      title: "Creating employee...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      setSubmitting(true);
      const resp = await apiConnector("POST", employees.CREATE, fd, {
        "Content-Type": "multipart/form-data",
      });

      if (!resp?.data?.success) {
        throw new Error(resp?.data?.message || "Failed to create employee");
      }

      Swal.fire({
        title: "Employee created",
        text: "New employee has been added successfully.",
        icon: "success",
      });
      reset();
    } catch (err: any) {
      console.error("Create employee error", err);
      Swal.fire({
        title: "Error",
        text: err?.response?.data?.message || err?.message || "Something went wrong.",
        icon: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <Card className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Add New Employee</h1>
          <p className="text-muted-foreground">HR can add a comprehensive employee profile here.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data" className="space-y-6">
          {/* Basic Information */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" type="text" placeholder="First Name" {...register("firstName")} />
                {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message as string}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input id="middleName" type="text" placeholder="Middle Name" {...register("middleName")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" type="text" placeholder="Last Name" {...register("lastName")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select id="gender" className="border border-input rounded-md h-10 px-3" {...register("gender")}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maritalStatus">Marital Status</Label>
                <select id="maritalStatus" className="border border-input rounded-md h-10 px-3" {...register("maritalStatus")}>
                  <option value="">Select</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <select id="bloodGroup" className="border border-input rounded-md h-10 px-3" {...register("bloodGroup")}>
                  <option value="">Select</option>
                  {["A+","A-","B+","B-","AB+","AB-","O+","O-"]
                    .map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input id="nationality" type="text" placeholder="Nationality" {...register("nationality")} />
              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Email" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message as string}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="workEmail">Work Email</Label>
                <Input id="workEmail" type="email" placeholder="Work Email" {...register("workEmail")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personalPhone">Personal Phone</Label>
                <Input id="personalPhone" type="tel" placeholder="Personal Phone" {...register("personalPhone")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alternatePhone">Alternate Phone</Label>
                <Input id="alternatePhone" type="tel" placeholder="Alternate Phone" {...register("alternatePhone")} />
              </div>
            </div>
          </section>

          {/* Address */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3 space-y-2">
                <Label htmlFor="street">Street</Label>
                <Input id="street" type="text" placeholder="Street" {...register("street")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" type="text" placeholder="City" {...register("city")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" type="text" placeholder="State" {...register("state")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP</Label>
                <Input id="zip" type="text" placeholder="ZIP" {...register("zip")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" type="text" placeholder="Country" {...register("country")} />
              </div>
            </div>
          </section>

          {/* Job Details */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Job Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfJoining">Date of Joining</Label>
                <Input id="dateOfJoining" type="date" {...register("dateOfJoining")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input id="designation" type="text" placeholder="Designation" {...register("designation")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" type="text" placeholder="Department" {...register("department")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager">Manager</Label>
                <select id="manager" className="border border-input rounded-md h-10 px-3" {...register("manager")}>
                  <option value="">Select Manager</option>
                  {managers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {(m.name || `${m.firstName || ""} ${m.lastName || ""}`).trim()} ({m.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" type="text" placeholder="Office Location" {...register("location")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeType">Employee Type</Label>
                <select id="employeeType" className="border border-input rounded-md h-10 px-3" {...register("employeeType")}>
                  <option value="">Select</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Intern">Intern</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
            </div>
          </section>

          {/* Account & Status */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Account & Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select id="role" className="border border-input rounded-md h-10 px-3" {...register("role")}>
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="hr">HR</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Set initial password" {...register("password")} />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message as string}</p>}
              </div>
              <div className="flex items-center space-x-3 mt-7">
                <Checkbox id="isActive" {...register("isActive")} />
                <Label htmlFor="isActive">Activate immediately</Label>
              </div>
            </div>
          </section>

          {/* Salary & Bank Details */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Salary & Bank Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basicSalary">Basic Salary</Label>
                <Input id="basicSalary" type="number" step="0.01" placeholder="0" {...register("basicSalary")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hra">HRA</Label>
                <Input id="hra" type="number" step="0.01" placeholder="0" {...register("hra")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowances">Allowances</Label>
                <Input id="allowances" type="number" step="0.01" placeholder="0" {...register("allowances")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deductions">Deductions</Label>
                <Input id="deductions" type="number" step="0.01" placeholder="0" {...register("deductions")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="netPay">Net Pay</Label>
                <Input id="netPay" type="number" value={netSalary.toFixed(2)} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" type="text" placeholder="INR" {...register("currency")} />
              </div>
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="salaryRemarks">Salary Remarks</Label>
                <Input id="salaryRemarks" type="text" placeholder="Remarks" {...register("salaryRemarks")} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input id="bankName" type="text" placeholder="Bank Name" {...register("bankName")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input id="accountNumber" type="text" placeholder="Account Number" {...register("accountNumber")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input id="ifscCode" type="text" placeholder="IFSC Code" {...register("ifscCode")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="panNumber">PAN Number</Label>
                <Input id="panNumber" type="text" placeholder="PAN Number" {...register("panNumber")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pfNumber">PF Number</Label>
                <Input id="pfNumber" type="text" placeholder="PF Number" {...register("pfNumber")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="esiNumber">ESI Number</Label>
                <Input id="esiNumber" type="text" placeholder="ESI Number" {...register("esiNumber")} />
              </div>
            </div>
          </section>

          {/* Skills & Education */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Skills & Education</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3 space-y-2">
                <Label htmlFor="skills">Skills (comma separated)</Label>
                <Input id="skills" type="text" placeholder="e.g. React, Node.js, SQL" {...register("skills")} />
              </div>
              <div className="md:col-span-3 space-y-2">
                <Label htmlFor="education">Education (comma separated)</Label>
                <Input id="education" type="text" placeholder="e.g. B.Tech, M.Sc" {...register("education")} />
              </div>
              <div className="md:col-span-3 space-y-2">
                <Label htmlFor="certifications">Certifications (comma separated)</Label>
                <Input id="certifications" type="text" placeholder="e.g. AWS SA, PMP" {...register("certifications")} />
              </div>
            </div>
          </section>

          {/* Emergency & Performance */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Emergency & Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyName">Emergency Contact Name</Label>
                <Input id="emergencyName" type="text" placeholder="Name" {...register("emergencyName")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyRelation">Relation</Label>
                <Input id="emergencyRelation" type="text" placeholder="Relation" {...register("emergencyRelation")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Phone</Label>
                <Input id="emergencyPhone" type="tel" placeholder="Phone" {...register("emergencyPhone")} />
              </div>
              <div className="md:col-span-3 space-y-2">
                <Label htmlFor="performanceNotes">Performance Notes</Label>
                <Input id="performanceNotes" type="text" placeholder="Notes" {...register("performanceNotes")} />
              </div>
            </div>
          </section>

          {/* Documents */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="panCard">PAN Card</Label>
                <Input id="panCard" type="file" accept="image/*" {...register("panCard")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aadharCard">Aadhar Card</Label>
                <Input id="aadharCard" type="file" accept="image/*" {...register("aadharCard")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photo">Photo</Label>
                <Input id="photo" type="file" accept="image/*" {...register("photo")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resume">Resume</Label>
                <Input id="resume" type="file" accept="application/pdf,image/*" {...register("resume")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idProof">ID Proof</Label>
                <Input id="idProof" type="file" accept="application/pdf,image/*" {...register("idProof")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="offerLetter">Offer Letter</Label>
                <Input id="offerLetter" type="file" accept="application/pdf,image/*" {...register("offerLetter")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experienceLetter">Experience Letter</Label>
                <Input id="experienceLetter" type="file" accept="application/pdf,image/*" {...register("experienceLetter")} />
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting} variant="hero">
              {submitting ? "Creating..." : "Create Employee"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddEmployee;
