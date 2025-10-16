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
    const resp = await apiConnector(
      "POST",
      `${payslip.GENERATE}/${payslipId}`,
      null,
      { headers: { Authorization: `Bearer ${token}` } },
      null,
      { responseType: "blob" }
    );

    // Extract filename from Content-Disposition
    let filename = "download.pdf"; // fallback
    const disposition = resp.headers["content-disposition"];
    if (disposition) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) filename = match[1];
    }

    const blob = new Blob([resp.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename; // <-- backend filename
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    toast.success("Payslip PDF generated");
  } catch (e: any) {
    console.error("EMP GENERATE PAYSLIP ERROR:", e);
    toast.error(e?.response?.data?.message || "Failed to generate payslip PDF.");
  }
};


  return (
    <div className="min-h-screen p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">My Payslips</h1>
        <Button onClick={fetchSlips} variant="secondary">Refresh</Button>
      </div>
      {slips.length > 0 && (
        <Card className="p-4 mb-4">
          <h2 className="text-lg font-semibold mb-2">Latest Payslip Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Salary (Structure)</p>
              <p className="text-xl font-bold">₹{Number(slips[0]?.grossSalary || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Leave Deductions</p>
              <p className="text-xl font-bold text-red-700">₹{Math.max(Number(slips[0]?.grossSalary || 0) - Number(slips[0]?.gross || 0), 0)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Net Pay (Payable)</p>
              <p className="text-xl font-bold text-green-700">₹{Number(slips[0]?.netPay || 0)}</p>
            </div>
          </div>
        </Card>
      )}
 
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
-                <TableHead>Total Salary</TableHead>
-                <TableHead>Gross After Leaves</TableHead>
-                <TableHead>Deductions</TableHead>
-                <TableHead>Net Pay (Payable)</TableHead>
+                <TableHead>Total Salary</TableHead>
+                <TableHead>Leave Deductions</TableHead>
+                <TableHead>Net Pay (Payable)</TableHead>
                 <TableHead>PDF</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {slips.map((s) => (
                 <TableRow key={s._id}>
                   <TableCell>{monthNames[(s.month ?? 1) - 1] || s.month}</TableCell>
                   <TableCell>{s.year}</TableCell>
-                  <TableCell>₹{s.grossSalary ?? 0}</TableCell>
-                  <TableCell>₹{s.gross ?? 0}</TableCell>
-                  <TableCell>
-                    <Badge variant="secondary">₹{s.deductions}</Badge>
-                  </TableCell>
-                  <TableCell className="font-medium">₹{s.netPay}</TableCell>
+                  <TableCell>₹{s.grossSalary ?? 0}</TableCell>
+                  <TableCell>
+                    <Badge variant="destructive">₹{Math.max((s.grossSalary ?? 0) - (s.gross ?? 0), 0)}</Badge>
+                  </TableCell>
+                  <TableCell className="font-medium">₹{s.netPay}</TableCell>
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