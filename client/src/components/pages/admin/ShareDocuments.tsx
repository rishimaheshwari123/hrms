import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { sendAdminDocsToEmployee, getEmployeeById } from "@/service/operations/auth";

export default function ShareDocuments() {
  const { id } = useParams<{ id: string }>();
  const { token } = useSelector((state: RootState) => state.auth);

  const [employeeDocs, setEmployeeDocs] = useState<any>({
    employeeDocument: {},
    adminDocument: {},
  });

  const [ndaFile, setNdaFile] = useState<File | null>(null);
  const [appointmentFile, setAppointmentFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch existing documents
  const fetchDocuments = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getEmployeeById(id, token);
      setEmployeeDocs({
        employeeDocument: data.employeeDocument || {},
        adminDocument: data.adminDocument || {},
      });
    } catch (err: any) {
      console.error("Error fetching employee documents:", err?.message);
      toast.error("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return toast.error("Employee ID not found!");
    if (!ndaFile && !appointmentFile)
      return toast.error("Please select at least one file.");

    try {
      const formData = new FormData();
      if (ndaFile) formData.append("nda", ndaFile);
      if (appointmentFile) formData.append("appointmentLetter", appointmentFile);

      await sendAdminDocsToEmployee(id, formData, token);
      toast.success("Documents sent successfully!");
      setNdaFile(null);
      setAppointmentFile(null);
      fetchDocuments(); // Refresh document display
    } catch (err: any) {
      console.error("Error uploading admin docs:", err?.message);
      toast.error("Failed to send documents. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6 text-pretty">
        Employee Documents
      </h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-6">
          {/* Display Employee Documents */}
          <div>
            <h2 className="font-semibold mb-2">Employee Documents</h2>
            <ul className="list-disc list-inside">
              {employeeDocs.employeeDocument?.nda && (
                <li>
                  NDA:{" "}
                  <a
                    href={employeeDocs.employeeDocument.nda}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View
                  </a>
                </li>
              )}
              {employeeDocs.employeeDocument?.appointmentLetter && (
                <li>
                  Appointment Letter:{" "}
                  <a
                    href={employeeDocs.employeeDocument.appointmentLetter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View
                  </a>
                </li>
              )}
              {!employeeDocs.employeeDocument?.nda &&
                !employeeDocs.employeeDocument?.appointmentLetter && (
                  <li>No documents uploaded yet.</li>
                )}
            </ul>
          </div>

          {/* Display Admin Documents */}
          <div>
            <h2 className="font-semibold mb-2">Admin Documents</h2>
            <ul className="list-disc list-inside">
              {employeeDocs.adminDocument?.nda && (
                <li>
                  NDA:{" "}
                  <a
                    href={employeeDocs.adminDocument.nda}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View
                  </a>
                </li>
              )}
              {employeeDocs.adminDocument?.appointmentLetter && (
                <li>
                  Appointment Letter:{" "}
                  <a
                    href={employeeDocs.adminDocument.appointmentLetter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View
                  </a>
                </li>
              )}
              {!employeeDocs.adminDocument?.nda &&
                !employeeDocs.adminDocument?.appointmentLetter && (
                  <li>No documents uploaded yet.</li>
                )}
            </ul>
          </div>

          {/* Upload new files */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm mb-1">Upload NDA</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setNdaFile(e.target.files?.[0] || null)}
                  className="border border-input rounded px-3 py-2"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm mb-1">Upload Appointment Letter</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setAppointmentFile(e.target.files?.[0] || null)}
                  className="border border-input rounded px-3 py-2"
                />
              </div>
            </div>
            <Button type="submit">Send Documents</Button>
          </form>
        </div>
      )}
    </div>
  );
}
