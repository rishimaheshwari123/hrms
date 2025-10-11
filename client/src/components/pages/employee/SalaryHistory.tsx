import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getSalaryHistoryAPI } from "@/service/operations/salary";

const SalaryHistory: React.FC = () => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper: format numbers nicely
  const formatAmount = (val: any) => {
    const num = typeof val === "number" ? val : parseFloat(val);
    if (isNaN(num)) return val ?? "-";
    return num.toLocaleString("en-IN");
  };

  // Helper: show "pahle itni thi → ab itni hui (Δ)"
  const renderChange = (prevVal: any, currVal: any) => {
    const prevNum = typeof prevVal === "number" ? prevVal : parseFloat(prevVal);
    const currNum = typeof currVal === "number" ? currVal : parseFloat(currVal);
    const hasPrev = !isNaN(prevNum);
    const hasCurr = !isNaN(currNum);
    if (hasPrev && hasCurr) {
      const delta = currNum - prevNum;
      const sign = delta >= 0 ? "+" : "";
      return (
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs text-gray-500">{formatAmount(prevNum)}</span>
          <span className="text-gray-400">→</span>
          <span>{formatAmount(currNum)}</span>
          <span className={`text-xs ${delta >= 0 ? "text-green-600" : "text-red-600"}`}>
            ({sign}{formatAmount(delta)})
          </span>
        </div>
      );
    }
    return <span className="block text-right">{formatAmount(currVal)}</span>;
  };

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      const data = await getSalaryHistoryAPI(user?._id, token);
      const sorted = Array.isArray(data)
        ? [...data].sort((a: any, b: any) => {
            const ea = new Date(a.effectiveFrom).getTime();
            const eb = new Date(b.effectiveFrom).getTime();
            if (eb !== ea) return eb - ea;
            const ca = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const cb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return cb - ca;
          })
        : [];
      setHistory(sorted);
      setLoading(false);
    }
    fetchHistory();
  }, [user?._id, token]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Salary History</h1>
      {loading ? (
        <p>Loading...</p>
      ) : history.length === 0 ? (
        <p>No history found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Effective From</th>
                <th className="p-2 text-right">Basic</th>
                <th className="p-2 text-right">HRA</th>
                <th className="p-2 text-right">Conveyance</th>
                <th className="p-2 text-right">Special Allowance</th>
                <th className="p-2 text-right">Meal Allowance</th>
                <th className="p-2 text-right">Gross</th>
                <th className="p-2 text-right">Net</th>
                <th className="p-2 text-left">Reason</th>
                <th className="p-2 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, idx) => {
                const prev = history[idx + 1];
                return (
                  <tr key={h._id} className="border-b">
                    <td className="p-2">{new Date(h.effectiveFrom).toLocaleDateString()}</td>
                    <td className="p-2 text-right">{renderChange(prev?.basic, h.basic)}</td>
                    <td className="p-2 text-right">{renderChange(prev?.hra, h.hra)}</td>
                    <td className="p-2 text-right">{renderChange(prev?.conveyance, h.conveyance)}</td>
                    <td className="p-2 text-right">{renderChange(prev?.specialAllowance ?? prev?.allowance, h.specialAllowance ?? h.allowance)}</td>
                    <td className="p-2 text-right">{renderChange(prev?.mealAllowance, h.mealAllowance)}</td>
                    <td className="p-2 text-right">{renderChange(prev?.grossSalary, h.grossSalary)}</td>
                    <td className="p-2 text-right">{renderChange(prev?.netSalary, h.netSalary)}</td>
                    <td className="p-2">{h.reason || "-"}</td>
                    <td className="p-2">{h.remarks || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-gray-500 mt-2">Tip: Green shows increment, Red shows decrement. Format: "pahle → ab (delta)".</p>
        </div>
      )}
    </div>
  );
};

export default SalaryHistory;