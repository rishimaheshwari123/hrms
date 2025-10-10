import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLeaveBalance, applyLeave, listLeaves } from "@/service/operations/leave";
import { listHolidays } from "@/service/operations/holiday";

const LeaveManagement = () => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [selectedRange, setSelectedRange] = useState<any>();
  const [leaveType, setLeaveType] = useState("Casual");
  const [reason, setReason] = useState("");
  const [balances, setBalances] = useState<any>({});
  const [myLeaves, setMyLeaves] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
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

  // Build date overlays for user's own leaves by status
  const myPendingDates = useMemo(() => {
    const ranges = (myLeaves || []).filter(lv => lv.status === "Pending");
    const expandRange = (from: any, to: any) => {
      const start = new Date(from);
      const end = new Date(to);
      const days: Date[] = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push(new Date(d));
      }
      return days;
    };
    return ranges.flatMap(lv => expandRange(lv.fromDate || lv.startDate, lv.toDate || lv.endDate));
  }, [myLeaves]);

  const myApprovedDates = useMemo(() => {
    const ranges = (myLeaves || []).filter(lv => lv.status === "Approved");
    const expandRange = (from: any, to: any) => {
      const start = new Date(from);
      const end = new Date(to);
      const days: Date[] = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push(new Date(d));
      }
      return days;
    };
    return ranges.flatMap(lv => expandRange(lv.fromDate || lv.startDate, lv.toDate || lv.endDate));
  }, [myLeaves]);

  const myRejectedDates = useMemo(() => {
    const ranges = (myLeaves || []).filter(lv => lv.status === "Rejected");
    const expandRange = (from: any, to: any) => {
      const start = new Date(from);
      const end = new Date(to);
      const days: Date[] = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push(new Date(d));
      }
      return days;
    };
    return ranges.flatMap(lv => expandRange(lv.fromDate || lv.startDate, lv.toDate || lv.endDate));
  }, [myLeaves]);

  const fetchHolidays = async () => {
    const now = currentMonth;
    const data = await listHolidays({ month: now.getMonth() + 1, year: now.getFullYear() }, token);
    setHolidays(data || []);
  };

  useEffect(() => {
    fetchBalances();
    fetchMyLeaves();
    fetchHolidays();
  }, [user?._id, currentMonth]);

  const selectedDays = useMemo(() => {
    if (!selectedRange?.from || !selectedRange?.to) return 0;
    const start = new Date(selectedRange.from);
    const end = new Date(selectedRange.to);
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round((end.getTime() - start.getTime()) / oneDay) + 1;
  }, [selectedRange]);

  const fetchBalances = async () => {
    if (!user?._id) return;
    const data = await getLeaveBalance(user?._id, token);
    setBalances(data || {});
  };

  const fetchMyLeaves = async () => {
    const data = await listLeaves({ employeeId: user?._id }, token);
    // Extra safety: client-side filter to ensure only current user's leaves
    const onlyMine = (data || []).filter((lv: any) => {
      const emp = lv?.employee;
      const idStr = typeof emp === "string" ? emp : emp?._id;
      return idStr === user?._id;
    });
    setMyLeaves(onlyMine);
  };

  useEffect(() => {
    fetchBalances();
    fetchMyLeaves();
    fetchHolidays();
  }, [user?._id]);

  const handleApply = async () => {
    if (!selectedRange?.from || !selectedRange?.to) return;
    setLoading(true);
    const payload = {
      employeeId: user?._id,
      leaveType,
      startDate: selectedRange.from,
      endDate: selectedRange.to,
      totalDays: selectedDays,
      reason,
    };
    const res = await applyLeave(payload, token);
    setLoading(false);
    if (res) {
      setSelectedRange(undefined);
      setReason("");
      fetchBalances();
      fetchMyLeaves();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Apply Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Calendar
                  mode="range"
                  selected={selectedRange}
                  onSelect={setSelectedRange}
                  onMonthChange={(m: Date) => setCurrentMonth(m)}
                  modifiers={{
                    holiday: holidays.map(h => new Date(h.date)),
                    weekend: weekendDates,
                    pendingMine: myPendingDates,
                    approvedMine: myApprovedDates,
                    rejectedMine: myRejectedDates,
                  }}
                  modifiersClassNames={{
                    holiday: "bg-red-100 text-red-700",
                    weekend: "bg-gray-100 text-gray-700",
                    pendingMine: "bg-orange-100 text-orange-700",
                    approvedMine: "bg-green-100 text-green-700",
                    rejectedMine: "bg-purple-100 text-purple-700",
                  }}
                />
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                  >
                    {Object.keys(balances || {}).map((t) => (
                      <option key={t} value={t}>{t} ({balances[t]?.remaining ?? 0} left)</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Input value={reason} onChange={(e) => setReason(e.target.value)} />
                </div>
                <div className="text-sm text-gray-600">Selected Days: {selectedDays}</div>
                <Button onClick={handleApply} disabled={loading || !selectedRange?.from || !selectedRange?.to}>
                  {loading ? "Submitting..." : "Apply Leave"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Leave Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {Object.keys(balances || {}).map((t) => (
                <li key={t} className="flex justify-between">
                  <span>{t}</span>
                  <span>{balances[t]?.remaining ?? 0}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 text-xs text-gray-600">
              <div className="flex items-center gap-2"><span className="inline-block h-3 w-3 bg-red-100 border border-red-300" /> Company Holiday</div>
              <div className="flex items-center gap-2 mt-1"><span className="inline-block h-3 w-3 bg-gray-100 border border-gray-300" /> Weekend (Sat/Sun)</div>
              <div className="flex items-center gap-2 mt-1"><span className="inline-block h-3 w-3 bg-orange-100 border border-orange-300" /> My Pending Leave</div>
              <div className="flex items-center gap-2 mt-1"><span className="inline-block h-3 w-3 bg-green-100 border border-green-300" /> My Approved Leave</div>
              <div className="flex items-center gap-2 mt-1"><span className="inline-block h-3 w-3 bg-purple-100 border border-purple-300" /> My Rejected Leave</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>My Leaves</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {myLeaves?.length ? (
              myLeaves.map((lv) => (
                <div key={lv._id} className="flex justify-between border rounded p-2 bg-white">
                  <div>
                    <div className="font-medium">{lv.leaveType} ({lv.status})</div>
                    <div className="text-sm text-gray-600">{new Date(lv.fromDate || lv.startDate).toLocaleDateString()} - {new Date(lv.toDate || lv.endDate).toLocaleDateString()}</div>
                  </div>
                  <div className="text-sm">{lv.totalDays} days</div>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No leaves yet.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveManagement;