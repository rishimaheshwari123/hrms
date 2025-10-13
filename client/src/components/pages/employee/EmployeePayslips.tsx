import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { listPayslipsAPI } from "@/service/operations/payslip";
import { apiConnector } from "@/service/apiConnector";
import { payslip } from "@/service/apis";
import { toast } from "react-toastify";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileDown, FilePlus } from "lucide-react";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const EmployeePayslips: React.FC = () => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [slips, setSlips] = useState<any[]>([]);

  const fetchSlips = async () => {
    if (!user?._id || !token) return;
    setLoading(true);
    try {
      const result = await listPayslipsAPI(user._id, token);
      setSlips(result?.slips || []);
    } catch (e) {
      // error handled in service via toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, token]);

  const handleGenerate = async (payslipId: string) => {
    if (!token) return;
    try {
      // Request streaming PDF and trigger browser download
      const resp = await apiConnector(
        "POST",
        `${payslip.GENERATE}/${payslipId}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } },
        null,
        { responseType: "blob" }
      );
      const blob = new Blob([resp.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payslip_${payslipId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
+      toast.success("Payslip PDF generated");
     } catch (e: any) {
-      // error handled in service via toast or here
+      console.error("EMP GENERATE PAYSLIP ERROR:", e);
+      toast.error(e?.response?.data?.message || "Failed to generate payslip PDF.");
     }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">My Payslips</h1>
        <Button onClick={fetchSlips} variant="secondary">Refresh</Button>
      </div>

      <Card className="p-4">
        {loading ? (
          <p>Loading payslips...</p>
        ) : slips.length === 0 ? (
          <p>No payslips found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Month</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Gross</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Pay</TableHead>
                <TableHead>PDF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slips.map((s) => (
                <TableRow key={s._id}>
                  <TableCell>{monthNames[(s.month ?? 1) - 1] || s.month}</TableCell>
                  <TableCell>{s.year}</TableCell>
                  <TableCell>₹{s.gross}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">₹{s.deductions}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">₹{s.netPay}</TableCell>
                  <TableCell>
                    {s.pdfUrl ? (
                      <a
                        href={s.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      >
                        <FileDown className="h-4 w-4" /> Download
                      </a>
                    ) : (
                      <Button
                        onClick={() => handleGenerate(s._id)}
                        className="inline-flex items-center gap-2"
                      >
                        <FilePlus className="h-4 w-4" /> Generate PDF
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default EmployeePayslips;