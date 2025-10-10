import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listLeaves, decideLeave } from "@/service/operations/leave";
import { listHolidays } from "@/service/operations/holiday";

const LeaveApproval = () => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const weekendDates = useMemo(() => {
    const month = currentMonth;
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const days: Date[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = new Date(d);
      if (day.getDay() === 0 || day.getDay() === 6) days.push(new Date(day));
    }
    return days;
  }, [currentMonth]);

  const pendingDates = useMemo(() => {
    const expandRange = (from: any, to: any) => {
      const start = new Date(from);
      const end = new Date(to);
      const days: Date[] = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push(new Date(d));
      }
      return days;
    };
    return pendingLeaves.flatMap(lv => expandRange(lv.fromDate || lv.startDate, lv.toDate || lv.endDate));
  }, [pendingLeaves]);

  const fetchData = async () => {
    const leaves = await listLeaves({ status: "Pending" }, token);
    setPendingLeaves(leaves || []);
    const now = currentMonth;
    const hol = await listHolidays({ month: now.getMonth() + 1, year: now.getFullYear() }, token);
    setHolidays(hol || []);
  };

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  const handleDecision = async (leaveId: string, decision: "Approved" | "Rejected") => {
    const res = await decideLeave(leaveId, decision, token, user?._id);
    if (res) fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Leave Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate as any}
              onMonthChange={(m: Date) => setCurrentMonth(m)}
              modifiers={{
                holiday: holidays.map(h => new Date(h.date)),
                weekend: weekendDates,
              }}
              modifiersClassNames={{
                holiday: "bg-red-100 text-red-700",
                weekend: "bg-gray-100 text-gray-700",
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingLeaves?.length ? (
                pendingLeaves.map((lv) => (
                  <div key={lv._id} className="p-2 border rounded bg-white">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium">{
                          typeof lv.employee === "string"
                            ? lv.employee
                            : (lv.employee?.name || `${lv.employee?.firstName || ""} ${lv.employee?.lastName || ""}`.trim() || lv.employee?.employeeCode || lv.employee?._id)
                        }</div>
                        <div className="text-sm text-gray-600">{lv.leaveType} | {lv.totalDays} days</div>
                        <div className="text-xs text-gray-500">{new Date(lv.fromDate || lv.startDate).toLocaleDateString()} - {new Date(lv.toDate || lv.endDate).toLocaleDateString()}</div>
                      </div>
                      {lv.status === "Pending" ? (
                        <div className="flex gap-2">
                          <Button onClick={() => handleDecision(lv._id, "Approved")}>Approve</Button>
                          <Button variant="destructive" onClick={() => handleDecision(lv._id, "Rejected")}>Reject</Button>
                        </div>
                      ) : (
                        <span className={`px-2 py-1 rounded text-sm ${lv.status === "Approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>Status: {lv.status}</span>
                      )}
                    </div>
                    {lv.reason && (
                      <div className="mt-2 text-sm text-gray-700">Reason: {lv.reason}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No pending requests.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeaveApproval;