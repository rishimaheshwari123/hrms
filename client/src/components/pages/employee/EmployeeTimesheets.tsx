import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import React, { useMemo, useState } from "react";
import { TimesheetSDK } from "@/service/sdk/index";
import { toast } from "react-toastify";

interface EntryRow {
  date: string; // ISO string
  task: string;
  hours: number;
  billable: boolean;
}

const EmployeeTimesheets: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const employeeId = (user as any)?._id || (user as any)?.id;

  const [weekStart, setWeekStart] = useState<string>("");
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const weekDays = useMemo(() => {
    if (!weekStart) return [];
    const start = new Date(weekStart);
    if (isNaN(start.getTime())) return [];
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
  }, [weekStart]);

  React.useEffect(() => {
    if (weekDays.length) {
      setEntries(
        weekDays.map((d) => ({ date: d, task: "", hours: 0, billable: false }))
      );
    } else {
      setEntries([]);
    }
  }, [weekDays]);

  const handleEntryChange = (index: number, field: keyof EntryRow, value: any) => {
    setEntries((prev) => {
      const next = [...prev];
      (next[index] as any)[field] = field === "hours" ? Number(value) : value;
      return next;
    });
  };

  const validate = () => {
    if (!employeeId) {
      toast.error("Missing employee ID");
      return false;
    }
    if (!weekStart || isNaN(new Date(weekStart).getTime())) {
      toast.error("Please select a valid week start date (Monday)");
      return false;
    }
    for (const e of entries) {
      if (e.hours < 0 || e.hours > 24) {
        toast.error("Each day's hours must be between 0 and 24");
        return false;
      }
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        employeeId,
        weekStart,
        entries: entries.map((e) => ({
          date: e.date,
          task: e.task,
          hours: e.hours,
          billable: e.billable,
        })),
      };
      const res = await TimesheetSDK.submit(payload);
      toast.success(res?.data?.message || "Timesheet submitted successfully");
      setEntries([]);
      setWeekStart("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit timesheet");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold mt-4">Weekly Timesheet</h1>
      <div className="flex items-center gap-4">
        <label className="font-medium">Week Start (YYYY-MM-DD):</label>
        <input
          type="date"
          value={weekStart}
          onChange={(e) => setWeekStart(e.target.value)}
          className="border rounded px-3 py-2"
        />
      </div>

      {entries.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Task</th>
                <th className="p-2 border">Hours</th>
                <th className="p-2 border">Billable</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((row, idx) => (
                <tr key={row.date}>
                  <td className="p-2 border text-sm">{row.date}</td>
                  <td className="p-2 border">
                    <input
                      type="text"
                      value={row.task}
                      onChange={(e) => handleEntryChange(idx, "task", e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                      placeholder="Describe task/work"
                    />
                  </td>
                  <td className="p-2 border w-32">
                    <input
                      type="number"
                      min={0}
                      max={24}
                      step={0.25}
                      value={row.hours}
                      onChange={(e) => handleEntryChange(idx, "hours", e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                    />
                  </td>
                  <td className="p-2 border text-center">
                    <input
                      type="checkbox"
                      checked={row.billable}
                      onChange={(e) => handleEntryChange(idx, "billable", e.target.checked)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div>
        <button
          onClick={submit}
          disabled={submitting || !entries.length}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Timesheet"}
        </button>
      </div>
    </div>
  );
};

export default EmployeeTimesheets;