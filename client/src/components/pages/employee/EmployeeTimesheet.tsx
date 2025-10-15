import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { createTimesheetEntryAPI, updateTimesheetEntryAPI, getMyTimesheetsAPI } from "@/service/operations/timesheet";

const fmtDate = (d: string | Date) => new Date(d).toLocaleDateString();
const todayISO = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const EmployeeTimesheet: React.FC = () => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [range, setRange] = useState<"day" | "week" | "month">("day");
  const [anchorDate, setAnchorDate] = useState<string>(todayISO());
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  const todayEntry = useMemo(() => {
    if (range !== "day") return null;
    return items.length > 0 ? items[0] : null;
  }, [items, range]);

  const [notes, setNotes] = useState<string>("");
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [activeNote, setActiveNote] = useState<string>("");

  const loadTimesheets = async (r = range, d = anchorDate) => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getMyTimesheetsAPI(r, d, token);
      const list = data?.data || [];
      setItems(list);
      if (r === "day" && list.length > 0) {
        setNotes(String(list[0]?.notes || ""));
      } else {
        setNotes("");
      }
    } catch (e) {
      // handled in service via toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimesheets("day", anchorDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Auto-refresh on filter changes
    loadTimesheets(range, anchorDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, anchorDate]);

  const onCreate = async () => {
    if (!token) return;
    try {
      await createTimesheetEntryAPI({ notes }, token);
      await loadTimesheets("day", todayISO());
      toast.success("Today's timesheet saved.");
    } catch (e) {}
  };

  const onUpdate = async () => {
    if (!token || !todayEntry?._id) return;
    try {
      await updateTimesheetEntryAPI(todayEntry._id, { notes }, token);
      await loadTimesheets("day", todayISO());
      toast.success("Timesheet updated.");
    } catch (e) {}
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold">Timesheet</h2>

      {/* Today's Entry */}
      <Card className="p-4 space-y-4">
        <h3 className="font-medium">Today's Timesheet ({fmtDate(new Date())})</h3>
        <div>
          <Label>Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Todays work? (Notes only)" />
        </div>
        <div className="flex items-center gap-3">
          {todayEntry ? (
            <Button onClick={onUpdate}>Update Today's Entry</Button>
          ) : (
            <Button onClick={onCreate}>Save Today's Entry</Button>
          )}
        </div>
        {todayEntry && (
          <p className="text-xs text-muted-foreground">Entry exists for today. You can edit only today's entry.</p>
        )}
      </Card>

      {/* Range Viewer */}
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
          <div className="ml-auto">
            <Button onClick={() => loadTimesheets(range, anchorDate)} disabled={loading}>
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3}>No entries found.</TableCell>
                </TableRow>
              ) : (
                items.map((it) => (
                  <TableRow key={it._id} className="cursor-pointer" onClick={() => { setActiveNote(String(it.notes || "")); setIsNoteDialogOpen(true); }}>
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
      {/* Note viewer */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notes</DialogTitle>
          </DialogHeader>
          <div className="whitespace-pre-wrap text-sm text-foreground">
            {activeNote || "(No notes)"}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsNoteDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </Card>
    </div>
  );
};

export default EmployeeTimesheet;