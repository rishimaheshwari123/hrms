
import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { getEmployeeById, updateEmployeeAPI } from "@/service/operations/auth"
import { useParams } from "react-router-dom"
import { RootState } from "@/redux/store"
import { useSelector } from "react-redux"
type Address = {
  line1?: string
  line2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

type EducationItem = {
  qualification?: string
  institution?: string
  yearOfPassing?: number | string
  grade?: string
}

type CertificationItem = {
  name?: string
  issuedBy?: string
  validTill?: string // ISO date yyyy-mm-dd
}

type EmergencyContact = {
  name?: string
  relation?: string
  phone?: string
  address?: string
}

type Performance = {
  lastAppraisalDate?: string // ISO date
  lastRating?: string
  remarks?: string
}

type EmployeeForm = {
  // Basic Information (exclude password/role per controller)
  firstName: string
  middleName: string
  lastName: string
  gender: "" | "Male" | "Female" | "Other"
  dateOfBirth: string
  maritalStatus: "" | "Single" | "Married" | "Divorced" | "Widowed"
  bloodGroup: string
  nationality: string

  // Contact
  email: string
  workEmail: string
  phone: string
  alternatePhone: string
  address: Address

  // Job / Employment
  dateOfJoining: string
  dateOfLeaving: string
  employmentStatus: "" | "Pending" | "Active" | "On Leave" | "Resigned" | "Terminated" | "Retired" | "Reject"
  designation: string
  department: string
  manager: string
  location: string
  employeeType: "" | "Permanent" | "Contract" | "Intern" | "Part-Time"

  // Skills / Education / Certifications
  skills: string[]
  education: EducationItem[]
  certifications: CertificationItem[]

  // Emergency & Performance
  emergencyContact: EmergencyContact
  performance: Performance
}



/**
 * Helper to safely get YYYY-MM-DD from possibly undefined date string
 */
function asDateInput(value?: string | null): string {
  if (!value) return ""
  try {
    // Already in YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
    const d = new Date(value)
    if (isNaN(d.getTime())) return ""
    return d.toISOString().slice(0, 10)
  } catch {
    return ""
  }
}

export default function EditEmployee() {
  const { id } = useParams();
  const { token } = useSelector((state: RootState) => state.auth)

  const [loading, setLoading] = useState(false)
  const [initialFetchDone, setInitialFetchDone] = useState(false)
  const [aadharFile, setAadharFile] = useState<File | null>(null)
  const [photoUrl, setPhotoUrl] = useState<File | null>(null)
  const [panFile, setPanFile] = useState<File | null>(null)

  const [form, setForm] = useState<EmployeeForm>({
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    maritalStatus: "",
    bloodGroup: "",
    nationality: "",

    email: "",
    workEmail: "",
    phone: "",
    alternatePhone: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },

    dateOfJoining: "",
    dateOfLeaving: "",
    employmentStatus: "",
    designation: "",
    department: "",
    manager: "",
    location: "",
    employeeType: "",

    skills: [],
    education: [{ qualification: "", institution: "", yearOfPassing: "", grade: "" }],
    certifications: [{ name: "", issuedBy: "", validTill: "" }],

    emergencyContact: { name: "", relation: "", phone: "", address: "" },
    performance: { lastAppraisalDate: "", lastRating: "", remarks: "" },
  })

  const authHeaders = useMemo(() => {
    const h: Record<string, string> = {}
    if (token) h["Authorization"] = `Bearer ${token}`
    return h
  }, [token])

  // Fetch employee by ID to prefill
  useEffect(() => {
    let cancelled = false
    const fetchEmployee = async () => {
      try {
        setLoading(true)
        const data = await getEmployeeById(id, token);


        setForm({
          firstName: data?.firstName || "",
          middleName: data?.middleName || "",
          lastName: data?.lastName || "",
          gender: (data?.gender as EmployeeForm["gender"]) || "",
          dateOfBirth: asDateInput(data?.dateOfBirth),
          maritalStatus: (data?.maritalStatus as EmployeeForm["maritalStatus"]) || "",
          bloodGroup: data?.bloodGroup || "",
          nationality: data?.nationality || "",

          email: data?.email || "",
          workEmail: data?.workEmail || "",
          phone: data?.phone || "",
          alternatePhone: data?.alternatePhone || "",
          address: {
            line1: data?.address?.line1 || "",
            line2: data?.address?.line2 || "",
            city: data?.address?.city || "",
            state: data?.address?.state || "",
            postalCode: data?.address?.postalCode || "",
            country: data?.address?.country || "",
          },

          dateOfJoining: asDateInput(data?.dateOfJoining),
          dateOfLeaving: asDateInput(data?.dateOfLeaving),
          employmentStatus: (data?.employmentStatus as EmployeeForm["employmentStatus"]) || "",
          designation: data?.designation || "",
          department: data?.department || "",
          manager: data?.manager || "",
          location: data?.location || "",
          employeeType: (data?.employeeType as EmployeeForm["employeeType"]) || "",

          skills: Array.isArray(data?.skills) ? data.skills : [],
          education:
            Array.isArray(data?.education) && data.education.length
              ? data.education.map((e: any) => ({
                qualification: e?.qualification || "",
                institution: e?.institution || "",
                yearOfPassing: e?.yearOfPassing ?? "",
                grade: e?.grade || "",
              }))
              : [{ qualification: "", institution: "", yearOfPassing: "", grade: "" }],
          certifications:
            Array.isArray(data?.certifications) && data.certifications.length
              ? data.certifications.map((c: any) => ({
                name: c?.name || "",
                issuedBy: c?.issuedBy || "",
                validTill: asDateInput(c?.validTill),
              }))
              : [{ name: "", issuedBy: "", validTill: "" }],

          emergencyContact: {
            name: data?.emergencyContact?.name || "",
            relation: data?.emergencyContact?.relation || "",
            phone: data?.emergencyContact?.phone || "",
            address: data?.emergencyContact?.address || "",
          },
          performance: {
            lastAppraisalDate: asDateInput(data?.performance?.lastAppraisalDate),
            lastRating: data?.performance?.lastRating || "",
            remarks: data?.performance?.remarks || "",
          },
        })
      } catch (err: any) {
        console.error("[v0] fetchEmployee error:", err?.message)
      } finally {
        setLoading(false)
        setInitialFetchDone(true)
      }
    }
    if (id) fetchEmployee()
    return () => {
      cancelled = true
    }
  }, [id])

  // Simple helpers
  const setField = (name: keyof EmployeeForm, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const setAddressField = (name: keyof Address, value: string) => {
    setForm((prev) => ({ ...prev, address: { ...prev.address, [name]: value } }))
  }

  const setEmergencyField = (name: keyof EmergencyContact, value: string) => {
    setForm((prev) => ({ ...prev, emergencyContact: { ...prev.emergencyContact, [name]: value } }))
  }

  const setPerformanceField = (name: keyof Performance, value: string) => {
    setForm((prev) => ({ ...prev, performance: { ...prev.performance, [name]: value } }))
  }

  // Skills
  const addSkill = () => setForm((p) => ({ ...p, skills: [...p.skills, ""] }))
  const removeSkill = (idx: number) => setForm((p) => ({ ...p, skills: p.skills.filter((_, i) => i !== idx) }))
  const updateSkill = (idx: number, value: string) =>
    setForm((p) => ({ ...p, skills: p.skills.map((s, i) => (i === idx ? value : s)) }))

  // Education
  const addEducation = () =>
    setForm((p) => ({
      ...p,
      education: [...p.education, { qualification: "", institution: "", yearOfPassing: "", grade: "" }],
    }))
  const removeEducation = (idx: number) =>
    setForm((p) => ({ ...p, education: p.education.filter((_, i) => i !== idx) }))
  const updateEducation = (idx: number, field: keyof EducationItem, value: string | number) =>
    setForm((p) => ({
      ...p,
      education: p.education.map((e, i) => (i === idx ? { ...e, [field]: value } : e)),
    }))

  // Certifications
  const addCertification = () =>
    setForm((p) => ({
      ...p,
      certifications: [...p.certifications, { name: "", issuedBy: "", validTill: "" }],
    }))
  const removeCertification = (idx: number) =>
    setForm((p) => ({ ...p, certifications: p.certifications.filter((_, i) => i !== idx) }))
  const updateCertification = (idx: number, field: keyof CertificationItem, value: string) =>
    setForm((p) => ({
      ...p,
      certifications: p.certifications.map((c, i) => (i === idx ? { ...c, [field]: value } : c)),
    }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Build FormData per controller (exclude password/role/salary/leaves)
      const fd = new FormData();
      // Scalars
      fd.append("firstName", form.firstName);
      fd.append("middleName", form.middleName);
      fd.append("lastName", form.lastName);
      fd.append("gender", form.gender);
      fd.append("dateOfBirth", form.dateOfBirth);
      fd.append("maritalStatus", form.maritalStatus);
      fd.append("bloodGroup", form.bloodGroup);
      fd.append("nationality", form.nationality);

      fd.append("email", form.email);
      fd.append("workEmail", form.workEmail);
      fd.append("phone", form.phone);
      fd.append("alternatePhone", form.alternatePhone);

      fd.append("dateOfJoining", form.dateOfJoining);
      fd.append("dateOfLeaving", form.dateOfLeaving);
      fd.append("employmentStatus", form.employmentStatus);
      fd.append("designation", form.designation);
      fd.append("department", form.department);
      fd.append("manager", form.manager);
      fd.append("location", form.location);
      fd.append("employeeType", form.employeeType);

      // Nested/arrays as JSON
      fd.append("address", JSON.stringify(form.address || {}));
      fd.append("skills", JSON.stringify(form.skills || []));
      fd.append("education", JSON.stringify(form.education || []));
      fd.append("certifications", JSON.stringify(form.certifications || []));
      fd.append("emergencyContact", JSON.stringify(form.emergencyContact || {}));
      fd.append("performance", JSON.stringify(form.performance || {}));

      // Files
      if (panFile) fd.append("panCard", panFile);
      if (aadharFile) fd.append("adharCard", aadharFile);
      if (photoUrl) fd.append("photoUrl", photoUrl);

      // ✅ Use your API helper function
      const updated = await updateEmployeeAPI(id, fd, token);


    } catch (err: any) {
      console.error("[v0] update error:", err?.message);

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4 text-pretty">Edit Employee</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-card text-card-foreground border border-border rounded p-6">
        {/* Basic Information */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Basic Information</h2>
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-sm mb-1">First Name</label>
              <input
                className="border border-input rounded px-3 py-2 bg-background"
                value={form.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm mb-1">Middle Name</label>
              <input
                className="border border-input rounded px-3 py-2 bg-background"
                value={form.middleName}
                onChange={(e) => setField("middleName", e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm mb-1">Last Name</label>
              <input
                className="border border-input rounded px-3 py-2 bg-background"
                value={form.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Gender / DOB / Marital / Blood */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <label className="text-sm mb-1">Gender</label>
              <select
                className="border border-input rounded px-3 py-2 bg-background"
                value={form.gender}
                onChange={(e) =>
                  setField("gender", e.target.value as EmployeeForm["gender"])
                }
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm mb-1">Date of Birth</label>
              <input
                type="date"
                className="border border-input rounded px-3 py-2 bg-background"
                value={form.dateOfBirth}
                onChange={(e) => setField("dateOfBirth", e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm mb-1">Marital Status</label>
              <select
                className="border border-input rounded px-3 py-2 bg-background"
                value={form.maritalStatus}
                onChange={(e) =>
                  setField(
                    "maritalStatus",
                    e.target.value as EmployeeForm["maritalStatus"]
                  )
                }
              >
                <option value="">Select Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm mb-1">Blood Group</label>
              <input
                className="border border-input rounded px-3 py-2 bg-background"
                value={form.bloodGroup}
                onChange={(e) => setField("bloodGroup", e.target.value)}
              />
            </div>
          </div>

          {/* Nationality / Emails */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-sm mb-1">Nationality</label>
              <input
                className="border border-input rounded px-3 py-2 bg-background"
                value={form.nationality}
                onChange={(e) => setField("nationality", e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm mb-1">Personal Email</label>
              <input
                type="email"
                className="border border-input rounded px-3 py-2 bg-background"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm mb-1">Work Email</label>
              <input
                type="email"
                className="border border-input rounded px-3 py-2 bg-background"
                value={form.workEmail}
                onChange={(e) => setField("workEmail", e.target.value)}
              />
            </div>
          </div>

          {/* Phone Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm mb-1">Phone</label>
              <input
                className="border border-input rounded px-3 py-2 bg-background"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm mb-1">Alternate Phone</label>
              <input
                className="border border-input rounded px-3 py-2 bg-background"
                value={form.alternatePhone}
                onChange={(e) => setField("alternatePhone", e.target.value)}
              />
            </div>
          </div>


          <div className="grid md:grid-cols-3 gap-4">
            {/* Photo Upload */}
            <div className="flex flex-col">
              <label className="text-sm mb-1">Photo</label>
              <input
                className="border border-input rounded px-3 py-2 bg-background"
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoUrl(e.target.files?.[0] || null)}
              />
            </div>

            {/* Aadhar Upload */}
            <div className="flex flex-col">
              <label className="text-sm mb-1">Aadhar</label>
              <input
                className="border border-input rounded px-3 py-2 bg-background"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setAadharFile(e.target.files?.[0] || null)}
              />
            </div>

            {/* PAN Upload */}
            <div className="flex flex-col">
              <label className="text-sm mb-1">PAN</label>
              <input
                className="border border-input rounded px-3 py-2 bg-background"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setPanFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

        </section>

        {/* Address */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Address</h2>
          <input
            className="border border-input rounded px-3 py-2 bg-background w-full"
            placeholder="Line 1"
            value={form.address.line1 || ""}
            onChange={(e) => setAddressField("line1", e.target.value)}
          />
          <input
            className="border border-input rounded px-3 py-2 bg-background w-full"
            placeholder="Line 2"
            value={form.address.line2 || ""}
            onChange={(e) => setAddressField("line2", e.target.value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              className="border border-input rounded px-3 py-2 bg-background"
              placeholder="City"
              value={form.address.city || ""}
              onChange={(e) => setAddressField("city", e.target.value)}
            />
            <input
              className="border border-input rounded px-3 py-2 bg-background"
              placeholder="State"
              value={form.address.state || ""}
              onChange={(e) => setAddressField("state", e.target.value)}
            />
            <input
              className="border border-input rounded px-3 py-2 bg-background"
              placeholder="Postal Code"
              value={form.address.postalCode || ""}
              onChange={(e) => setAddressField("postalCode", e.target.value)}
            />
            <input
              className="border border-input rounded px-3 py-2 bg-background"
              placeholder="Country"
              value={form.address.country || ""}
              onChange={(e) => setAddressField("country", e.target.value)}
            />
          </div>
        </section>

        {/* Employment */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Employment</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="date"
              className="border border-input rounded px-3 py-2 bg-background"
              value={form.dateOfJoining}
              onChange={(e) => setField("dateOfJoining", e.target.value)}
            />
            <input
              type="date"
              className="border border-input rounded px-3 py-2 bg-background"
              value={form.dateOfLeaving}
              onChange={(e) => setField("dateOfLeaving", e.target.value)}
            />
            <select
              className="border border-input rounded px-3 py-2 bg-background"
              value={form.employmentStatus}
              onChange={(e) => setField("employmentStatus", e.target.value as EmployeeForm["employmentStatus"])}
            >
              <option value="">Employment Status</option>
              <option value="Pending">Pending</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Resigned">Resigned</option>
              <option value="Terminated">Terminated</option>
              <option value="Retired">Retired</option>
              <option value="Reject">Reject</option>
            </select>
            <select
              className="border border-input rounded px-3 py-2 bg-background"
              value={form.employeeType}
              onChange={(e) => setField("employeeType", e.target.value as EmployeeForm["employeeType"])}
            >
              <option value="">Employee Type</option>
              <option value="Permanent">Permanent</option>
              <option value="Contract">Contract</option>
              <option value="Intern">Intern</option>
              <option value="Part-Time">Part-Time</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              className="border border-input rounded px-3 py-2 bg-background"
              placeholder="Designation"
              value={form.designation}
              onChange={(e) => setField("designation", e.target.value)}
            />
            <input
              className="border border-input rounded px-3 py-2 bg-background"
              placeholder="Department"
              value={form.department}
              onChange={(e) => setField("department", e.target.value)}
            />
            <input
              className="border border-input rounded px-3 py-2 bg-background"
              placeholder="Manager"
              value={form.manager}
              onChange={(e) => setField("manager", e.target.value)}
            />
            <input
              className="border border-input rounded px-3 py-2 bg-background"
              placeholder="Location"
              value={form.location}
              onChange={(e) => setField("location", e.target.value)}
            />
          </div>
        </section>

        {/* Skills */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Skills</h2>
          <div className="space-y-2">
            {form.skills.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className="border border-input rounded px-3 py-2 bg-background flex-1"
                  placeholder={`Skill #${i + 1}`}
                  value={s}
                  onChange={(e) => updateSkill(i, e.target.value)}
                />
                <Button type="button" variant="secondary" onClick={() => removeSkill(i)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" onClick={addSkill}>
            Add Skill
          </Button>
        </section>

        {/* Education */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Education</h2>
          <div className="space-y-3">
            {form.education.map((e, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-2">
                <input
                  className="border border-input rounded px-3 py-2 bg-background"
                  placeholder="Qualification"
                  value={e.qualification || ""}
                  onChange={(ev) => updateEducation(i, "qualification", ev.target.value)}
                />
                <input
                  className="border border-input rounded px-3 py-2 bg-background"
                  placeholder="Institution"
                  value={e.institution || ""}
                  onChange={(ev) => updateEducation(i, "institution", ev.target.value)}
                />
                <input
                  className="border border-input rounded px-3 py-2 bg-background"
                  placeholder="Year of Passing"
                  type="number"
                  value={e.yearOfPassing ?? ""}
                  onChange={(ev) => updateEducation(i, "yearOfPassing", Number(ev.target.value))}
                />
                <input
                  className="border border-input rounded px-3 py-2 bg-background"
                  placeholder="Grade"
                  value={e.grade || ""}
                  onChange={(ev) => updateEducation(i, "grade", ev.target.value)}
                />
                <Button type="button" variant="secondary" onClick={() => removeEducation(i)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" onClick={addEducation}>
            Add Education
          </Button>
        </section>

        {/* Certifications */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Certifications</h2>
          <div className="space-y-3">
            {form.certifications.map((c, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <input
                  className="border border-input rounded px-3 py-2 bg-background"
                  placeholder="Name"
                  value={c.name || ""}
                  onChange={(ev) => updateCertification(i, "name", ev.target.value)}
                />
                <input
                  className="border border-input rounded px-3 py-2 bg-background"
                  placeholder="Issued By"
                  value={c.issuedBy || ""}
                  onChange={(ev) => updateCertification(i, "issuedBy", ev.target.value)}
                />
                <input
                  className="border border-input rounded px-3 py-2 bg-background"
                  type="date"
                  value={c.validTill || ""}
                  onChange={(ev) => updateCertification(i, "validTill", ev.target.value)}
                />
                <Button type="button" variant="secondary" onClick={() => removeCertification(i)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" onClick={addCertification}>
            Add Certification
          </Button>
        </section>

        {/* Emergency Contact */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Emergency Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              className="border border-input rounded px-3 py-2 bg-background"
              placeholder="Name"
              value={form.emergencyContact.name || ""}
              onChange={(e) => setEmergencyField("name", e.target.value)}
            />
            <input
              className="border border-input rounded px-3 py-2 bg-background"
              placeholder="Relation"
              value={form.emergencyContact.relation || ""}
              onChange={(e) => setEmergencyField("relation", e.target.value)}
            />
            <input
              className="border border-input rounded px-3 py-2 bg-background"
              placeholder="Phone"
              value={form.emergencyContact.phone || ""}
              onChange={(e) => setEmergencyField("phone", e.target.value)}
            />
            <input
              className="border border-input rounded px-3 py-2 bg-background"
              placeholder="Address"
              value={form.emergencyContact.address || ""}
              onChange={(e) => setEmergencyField("address", e.target.value)}
            />
          </div>
        </section>

        {/* Performance */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              className="border border-input rounded px-3 py-2 bg-background"
              type="date"
              value={form.performance.lastAppraisalDate || ""}
              onChange={(e) => setPerformanceField("lastAppraisalDate", e.target.value)}
            />
            <input
              className="border border-input rounded px-3 py-2 bg-background"
              placeholder="Last Rating"
              value={form.performance.lastRating || ""}
              onChange={(e) => setPerformanceField("lastRating", e.target.value)}
            />
            <input
              className="border border-input rounded px-3 py-2 bg-background"
              placeholder="Remarks"
              value={form.performance.remarks || ""}
              onChange={(e) => setPerformanceField("remarks", e.target.value)}
            />
          </div>
        </section>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={loading || !initialFetchDone}>
            {loading ? "Updating..." : "Update Employee"}
          </Button>
        </div>
      </form>
    </div>
  )
}
