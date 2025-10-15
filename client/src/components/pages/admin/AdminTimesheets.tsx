import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { listTimesheetsAdminAPI, updateTimesheetEntryAdminAPI } from "@/service/operations/timesheet";
import { getAllEmployees } from "@/service/operations/auth";

const fmtDate = (d: string | Date) => new Date(d).toLocaleDateString();
const todayISO = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const AdminTimesheets: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [range, setRange] = useState<"day" | "week" | "month">("day");
  const [anchorDate, setAnchorDate] = useState<string>(todayISO());
  const [employeeId, setEmployeeId] = useState<string>("ALL");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [editNotes, setEditNotes] = useState<string>("");
  const [editDate, setEditDate] = useState<string>("");

  const loadEmployees = async () => {
    try {
      const data = await getAllEmployees(token);
      setEmployees(Array.isArray(data) ? data : []);
    } catch (e) {
      // handled in service
    }
  };

  const loadRows = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const resp = await listTimesheetsAdminAPI({ range, date: anchorDate, employeeId: employeeId === "ALL" ? undefined : employeeId }, token);
      const list = resp?.data || [];
      const filtered = employeeId === "ALL"
        ? list
        : list.filter((it: any) => String(it?.emp?._id || it?.employee) === employeeId);
      setRows(filtered);
    } catch (e) {
      // handled in service
    } finally {
      setLoading(false);
    }
  };

  const toDateInput = (d: string | Date) => {
    const x = new Date(d);
    const iso = new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString();
    return iso.slice(0, 10);
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setEditNotes(String(item?.notes || ""));
    setEditDate(toDateInput(item?.date));
    setIsEditOpen(true);
  };

  const saveEdit = async () => {
    if (!token || !editItem?._id) return;
    const payload: any = { notes: editNotes };
    if (editDate) payload.date = editDate;
    try {
      await updateTimesheetEntryAdminAPI(editItem._id, payload, token);
      toast.success("Timesheet updated");
      setIsEditOpen(false);
      setEditItem(null);
      setEditNotes("");
      setEditDate("");
      await loadRows();
    } catch (e) {}
  };

  useEffect(() => {
    loadEmployees();
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Auto-refresh on filter changes
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, anchorDate, employeeId]);

  const nameOf = (emp: any) => {
    if (!emp) return "";
    if (emp.name) return emp.name;
    const fn = emp.firstName || "";
    const ln = emp.lastName || "";
    return `${fn} ${ln}`.trim();
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold">Timesheets (Admin)</h2>

      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-40">
            <Label>Range</Label>
            <Select value={range} onValueChange={(v) => setRange(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={anchorDate} onChange={(e) => setAnchorDate(e.target.value)} />
          </div>
          <div className="w-64">
            <Label>Employee</Label>
            <Select value={employeeId} onValueChange={(v) => setEmployeeId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="All employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All employees</SelectItem>
                {employees.map((e) => (
                  <SelectItem key={e._id} value={e._id}>{nameOf(e)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto">
            <Button onClick={loadRows} disabled={loading}>
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>No entries found.</TableCell>
                </TableRow>
              ) : (
                rows.map((it) => (
                  <TableRow key={it._id} className="cursor-pointer" onClick={() => openEdit(it)}>
                    <TableCell>{nameOf(it.emp)}</TableCell>
                    <TableCell>{it.emp?.email}</TableCell>
                    <TableCell>{fmtDate(it.date)}</TableCell>
                    <TableCell className="max-w-xl truncate" title={it.notes}>
                      {String(it.notes || "").length ? String(it.notes) : "(No notes)"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Timesheet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Employee</Label>
                  <Input readOnly value={nameOf(editItem?.emp) || ""} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input readOnly value={editItem?.emp?.email || ""} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Edit notes" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => { setIsEditOpen(false); setEditItem(null); }}>Cancel</Button>
              <Button onClick={saveEdit}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
};

export default AdminTimesheets;