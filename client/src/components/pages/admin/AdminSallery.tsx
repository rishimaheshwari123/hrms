import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  createSalaryAPI,
  updateSalaryAPI,
  getSalaryAPI,
} from "@/service/operations/salary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { apiConnector } from "@/service/apiConnector";
import { payroll, payslip } from "@/service/apis";

const AdminSalary = () => {
  const { id } = useParams(); // Employee ID
  const { token, user } = useSelector((state: RootState) => state.auth);

  const [salaryData, setSalaryData] = useState<any>(null);
  const [form, setForm] = useState({
    basic: "",
    hra: "",
    conveyance: "",
    specialAllowance: "",
    mealAllowance: "",
    grossSalary: "",
    netSalary: "",
    currency: "INR",
    effectiveFrom: "",
    bankName: "",
    branch: "",
    accountNumber: "",
    ifscCode: "",
    panNumber: "",
    pfNumber: "",
    esiNumber: "",
    remarks: "",
  });
  const [loading, setLoading] = useState(true);
  const [remark, setRemark] = useState("");

  const isEmployee = user?.role === "employee";

  // Auto-calc gross/net whenever components change
  useEffect(() => {
    const b = Number(form.basic || 0);
    const h = Number(form.hra || 0);
    const c = Number(form.conveyance || 0);
    const s = Number(form.specialAllowance || 0);
    const m = Number(form.mealAllowance || 0);
    const gross = b + h + c + s + m;
    setForm((prev) => ({ ...prev, grossSalary: String(gross), netSalary: String(gross) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.basic, form.hra, form.conveyance, form.specialAllowance, form.mealAllowance]);

  useEffect(() => {
    const fetchSalary = async () => {
      setLoading(true);
      const data = await getSalaryAPI(id, token);
      if (data) {
        setSalaryData(data);
        setForm({
          basic: data.basic ?? "",
          hra: data.hra ?? "",
          conveyance: data.conveyance ?? "",
          specialAllowance: data.specialAllowance ?? data.allowance ?? "",
          mealAllowance: data.mealAllowance ?? "",
          grossSalary: data.grossSalary ?? "",
          netSalary: data.netSalary ?? "",
          currency: data.currency ?? "INR",
          effectiveFrom: data.effectiveFrom?.split("T")[0] ?? "",
          bankName: data.bankDetails?.bankName ?? "",
          branch: data.bankDetails?.branch ?? "",
          accountNumber: data.bankDetails?.accountNumber ?? "",
          ifscCode: data.bankDetails?.ifscCode ?? "",
          panNumber: data.taxInfo?.panNumber ?? "",
          pfNumber: data.taxInfo?.pfNumber ?? "",
          esiNumber: data.taxInfo?.esiNumber ?? "",
          remarks: data.remarks ?? "",
        });
      }
      setLoading(false);
    };
    fetchSalary();
  }, [id, token]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    let payload;

    if (isEmployee) {
      // Employees can only update bank details
      payload = {
        employee: id,
        bankDetails: {
          bankName: form.bankName,
          branch: form.branch,
          accountNumber: form.accountNumber,
          ifscCode: form.ifscCode,
        },
      };
    } else {
      // Admin/HR full access
      payload = {
        employee: id,
        basic: form.basic,
        hra: form.hra,
        conveyance: form.conveyance,
        specialAllowance: form.specialAllowance,
        mealAllowance: form.mealAllowance,
        // also send legacy 'allowance' for backward compatibility on server
        allowance: form.specialAllowance,
        grossSalary: form.grossSalary,
        netSalary: form.netSalary,
        currency: form.currency,
        effectiveFrom: form.effectiveFrom,
        bankDetails: {
          bankName: form.bankName,
          branch: form.branch,
          accountNumber: form.accountNumber,
          ifscCode: form.ifscCode,
        },
        taxInfo: {
          panNumber: form.panNumber,
          pfNumber: form.pfNumber,
          esiNumber: form.esiNumber,
        },
        remarks: form.remarks,
        id: salaryData?._id,
      };
    }

    if (!salaryData) {
      const res = await createSalaryAPI(payload, token);
      if (res) setSalaryData(res);
    } else {
      const res = await updateSalaryAPI(payload, token);
      if (res) setSalaryData(res);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Card className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">
          {isEmployee
            ? "Update Bank Details"
            : salaryData
            ? "Edit Salary"
            : "Add Salary"}
        </h1>

        {/* Salary Section (Hidden for Employee) */}
        {!isEmployee && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Basic", name: "basic" },
                { label: "HRA", name: "hra" },
                { label: "Conveyance", name: "conveyance" },
                { label: "Special Allowance", name: "specialAllowance" },
                { label: "Meal Allowance", name: "mealAllowance" },
                { label: "Gross Salary (auto)", name: "grossSalary", readOnly: true },
                { label: "Net Salary (auto)", name: "netSalary", readOnly: true },
              ].map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label>{field.label}</Label>
                  <Input
                    name={field.name}
                    value={(form as any)[field.name]}
                    onChange={handleChange}
                    type="number"
                    readOnly={(field as any).readOnly}
                    disabled={(field as any).readOnly}
                  />
                </div>
              ))}

              <div className="space-y-2">
                <Label>Currency</Label>
                <select
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Effective From</Label>
                <Input
                  name="effectiveFrom"
                  value={form.effectiveFrom}
                  onChange={handleChange}
                  type="date"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">Note: Gross and Net are auto-calculated from components. Monthly payroll will further adjust based on attendance and rules.</p>
          </>
        )}

        {/* Bank Details Section */}
        <h2 className="text-xl font-semibold mt-6">Bank Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["bankName", "branch", "accountNumber", "ifscCode"].map((field) => (
            <div key={field} className="space-y-2">
              <Label>
                {field === "bankName"
                  ? "Bank Name"
                  : field === "branch"
                  ? "Branch"
                  : field === "accountNumber"
                  ? "Account Number"
                  : "IFSC Code"}
              </Label>
              <Input
                name={field}
                value={(form as any)[field]}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>

        {/* Tax Info (Hidden for Employee) */}
        {!isEmployee && (
          <>
            <h2 className="text-xl font-semibold mt-6">Tax Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["panNumber", "pfNumber", "esiNumber"].map((field) => (
                <div key={field} className="space-y-2">
                  <Label>
                    {field === "panNumber"
                      ? "PAN Number"
                      : field === "pfNumber"
                      ? "PF Number"
                      : "ESI Number"}
                  </Label>
                  <Input
                    name={field}
                    value={(form as any)[field]}
                    onChange={handleChange}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2 mt-6">
              <Label>Remarks</Label>
              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                rows={3}
              />
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Payslip Remark (optional)</label>
                <input
                  type="text"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                  placeholder="e.g., Bonus included, Advance adjusted"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={async () => {
                    try {
                      const employeeId = id || form.employeeId;
                      if (!employeeId) {
                        toast.error("Select an employee first");
                        return;
                      }
                      if (!token) {
                        toast.error("Missing auth token");
                        return;
                      }
                      const today = new Date();
                      const month = today.getMonth() + 1;
                      const year = today.getFullYear();

                      // Run payroll (controller prevents duplicates)
                      const runRes = await apiConnector(
                        "POST",
                        payroll.RUN,
                        { employeeId, month, year, processedBy: user?._id, rounding: "nearest" },
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      const payslipId = runRes.data?.data?.payslip?._id;
                      if (!payslipId) {
                        toast.error("Failed to run payroll");
                        return;
                      }

                      // Generate payslip PDF with optional remark (stream to download)
                      const genRes = await apiConnector(
                        "POST",
                        `${payslip.GENERATE}/${payslipId}`,
                        { remark },
                        { headers: { Authorization: `Bearer ${token}` } },
                        null,
                        { responseType: "blob" }
                      );
                      const blob = new Blob([genRes.data], { type: "application/pdf" });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `payslip_${payslipId}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      window.URL.revokeObjectURL(url);
                      toast.success("Payslip generated and opened for download");
                    } catch (e: any) {
                      toast.error(e?.response?.data?.message || e.message || "Error generating payslip");
                    }
                  }}
                >
                  Generate Payslip & Download
                </button>
              </div>
            </div>
          </>
        )}

        <Button onClick={handleSubmit} className="w-full mt-4">
          {isEmployee ? "Update Bank Details" : salaryData ? "Update Salary" : "Add Salary"}
        </Button>
      </Card>
    </div>
  );
};

export default AdminSalary;
