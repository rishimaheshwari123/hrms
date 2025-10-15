import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { submiteEmpDocAPI } from "@/service/operations/auth"; // make sure path is correct

export default function EmployeeUploadDouc() {
  const { id } = useParams<{ id: string }>();
  const { token } = useSelector((state: RootState) => state.auth);

  const [ndaFile, setNdaFile] = useState<File | null>(null);
  const [appointmentFile, setAppointmentFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return toast.error("Employee ID not found!");
    if (!ndaFile && !appointmentFile)
      return toast.error("Please select at least one file.");

    try {
      const formData = new FormData();
      if (ndaFile) formData.append("nda", ndaFile);
      if (appointmentFile) formData.append("appointmentLetter", appointmentFile);

      const updatedEmployee = await submiteEmpDocAPI(id, formData, token);
        setNdaFile(null);
        setAppointmentFile(null);
      if (updatedEmployee) {
        setNdaFile(null);
        setAppointmentFile(null);
      }
    } catch (err: any) {
      console.error("Error uploading admin docs:", err?.message);
      toast.error("Failed to send documents. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4 text-pretty">
        Upload documents !
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-card text-card-foreground border border-border rounded p-6"
      >
        <div className="grid md:grid-cols-2 gap-4">
          {/* NDA Upload */}
          <div className="flex flex-col">
            <label className="text-sm mb-1">NDA</label>
            <input
              className="border border-input rounded px-3 py-2 bg-background"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setNdaFile(e.target.files?.[0] || null)}
            />
          </div>

          {/* Appointment Letter Upload */}
          <div className="flex flex-col">
            <label className="text-sm mb-1">Appointment Letter</label>
            <input
              className="border border-input rounded px-3 py-2 bg-background"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setAppointmentFile(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit">Send Documents</Button>
        </div>
      </form>
    </div>
  );
}
