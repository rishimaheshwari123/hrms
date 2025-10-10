import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getEmployeeById } from "@/service/operations/auth";

const ViewEmployee = () => {
  const { id } = useParams();
  const { token } = useSelector((state: RootState) => state.auth);
  const [employee, setEmployee] = useState<any>(null);

  const fetchEmployee = async () => {
    try {
      if (!id) return;
      const data = await getEmployeeById(id, token);
      console.log(data.department)
      setEmployee(data);
    } catch (error) {
      console.error("Error fetching employee:", error);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id, token]);

  if (!employee) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Section: Photo & Name */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 bg-white p-6 rounded-lg shadow-md relative">
          <img
            src={employee?.photoUrl}
            alt={employee?.name || "Employee Photo"}
            className="w-28 h-28 rounded-full object-cover border-2 border-gray-300"
          />
          <div className="flex-1 space-y-1">
            <h1 className="text-3xl font-bold text-gray-800">{employee?.name}</h1>
            <p className="text-gray-600">{employee?.designation} | {employee?.department}</p>
            <p className="text-gray-500">{employee?.employeeType} | {employee?.employmentStatus}</p>
            <p className="text-gray-500">{employee?.manager} | {employee?.location}</p>
            <p className="text-gray-500">Employee Code: <span className="font-medium">{employee?.employeeCode}</span></p>
            <p className="text-gray-500">Date of Joining: {employee?.dateOfJoining ? new Date(employee?.dateOfJoining).toLocaleDateString() : "-"}</p>
            {employee?.dateOfLeaving && (
              <p className="text-red-500">Date of Leaving: {new Date(employee?.dateOfLeaving).toLocaleDateString()}</p>
            )}
          </div>
          <Link
            to={`/admin/edit-employee/${employee?._id}`}
            className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Edit Employee
          </Link>
        </div>

        {/* Contact & Personal Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Info */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Contact Information</h2>
            <p><span className="font-medium">Email:</span> {employee?.email || "-"}</p>
            <p><span className="font-medium">Phone:</span> {employee?.phone || "-"}</p>
            <p><span className="font-medium">Alternate Phone:</span> {employee?.alternatePhone || "-"}</p>
            <p><span className="font-medium">Work Email:</span> {employee?.workEmail || "-"}</p>
            <p><span className="font-medium">Location:</span> {employee?.location || "-"}</p>
          </div>

          {/* Personal Info */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Personal Information</h2>
            <p><span className="font-medium">First Name:</span> {employee?.firstName || "-"}</p>
            <p><span className="font-medium">Middle Name:</span> {employee?.middleName || "-"}</p>
            <p><span className="font-medium">Last Name:</span> {employee?.lastName || "-"}</p>
            <p><span className="font-medium">Gender:</span> {employee?.gender || "-"}</p>
            <p><span className="font-medium">Marital Status:</span> {employee?.maritalStatus || "-"}</p>
            <p><span className="font-medium">Nationality:</span> {employee?.nationality || "-"}</p>
            <p><span className="font-medium">Blood Group:</span> {employee?.bloodGroup || "-"}</p>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Address</h2>
          <p>{employee?.address?.line1}, {employee?.address?.line2}</p>
          <p>{employee?.address?.city}, {employee?.address?.state} - {employee?.address?.postalCode}</p>
          <p>{employee?.address?.country}</p>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Emergency Contact</h2>
          <p><span className="font-medium">Name:</span> {employee?.emergencyContact?.name || "-"}</p>
          <p><span className="font-medium">Relation:</span> {employee?.emergencyContact?.relation || "-"}</p>
          <p><span className="font-medium">Phone:</span> {employee?.emergencyContact?.phone || "-"}</p>
          <p><span className="font-medium">Address:</span> {employee?.emergencyContact?.address || "-"}</p>
        </div>

        {/* Skills */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {employee?.skills?.length ? (
              employee.skills.map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-500">No skills listed.</p>
            )}
          </div>
        </div>

        {/* Education */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Education</h2>
          <div className="space-y-3">
            {employee?.education?.length ? (
              employee.education.map((edu: any) => (
                <div key={edu._id} className="border-l-4 border-indigo-400 pl-4">
                  <p className="font-medium">{edu?.qualification} - {edu?.institution}</p>
                  <p className="text-gray-500">Year: {edu?.yearOfPassing}, Grade: {edu?.grade}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No education records.</p>
            )}
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Certifications</h2>
          <div className="space-y-3">
            {employee?.certifications?.length ? (
              employee.certifications.map((cert: any) => (
                <div key={cert._id} className="border-l-4 border-green-400 pl-4">
                  <p className="font-medium">{cert?.name} - {cert?.issuedBy}</p>
                  <p className="text-gray-500">Valid Till: {cert?.validTill ? new Date(cert?.validTill).toLocaleDateString() : "-"}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No certifications.</p>
            )}
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Performance</h2>
          <p><span className="font-medium">Last Appraisal Date:</span> {employee?.performance?.lastAppraisalDate ? new Date(employee.performance.lastAppraisalDate).toLocaleDateString() : "-"}</p>
          <p><span className="font-medium">Last Rating:</span> {employee?.performance?.lastRating || "-"}</p>
          <p><span className="font-medium">Remarks:</span> {employee?.performance?.remarks || "-"}</p>
        </div>

        

        {/* Documents */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row gap-4">
          {employee?.adharCard && (
            <a
              href={employee?.adharCard}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-100 text-green-700 px-6 py-2 rounded-lg font-medium hover:bg-green-200 transition"
            >
              View Aadhar
            </a>
          )}
          {employee?.panCard && (
            <a
              href={employee?.panCard}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-yellow-100 text-yellow-700 px-6 py-2 rounded-lg font-medium hover:bg-yellow-200 transition"
            >
              View PAN
            </a>
          )}
        </div>

        {/* Meta */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Meta Information</h2>
          <p><span className="font-medium">Created At:</span> {employee?.createdAt ? new Date(employee?.createdAt).toLocaleString() : "-"}</p>
          <p><span className="font-medium">Updated At:</span> {employee?.updatedAt ? new Date(employee?.updatedAt).toLocaleString() : "-"}</p>
          <p><span className="font-medium">Role:</span> {employee?.role || "-"}</p>
          <p><span className="font-medium">Active:</span> {employee?.isActive ? "Yes" : "No"}</p>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployee;
