import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listTasksForEmployeeAPI, updateTaskAPI } from "@/service/task";

const EmployeeDashboard: React.FC = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const employeeId = (user as any)?._id || (user as any)?.id;

  useEffect(() => {
    const fetchTasks = async () => {
      if (!employeeId) return;
      try {
        setLoading(true);
        setError("");
        const res = await listTasksForEmployeeAPI(employeeId, headers);
        const data = res?.data?.tasks ?? res?.data?.data ?? res?.data ?? [];
        setTasks(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err?.message || "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [employeeId, headers]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
  };

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter((t: any) => {
      const id = (t?._id || t?.id || "").toString().toLowerCase();
      const title = (t?.title || "").toLowerCase();
      const desc = (t?.description || "").toLowerCase();
      const status = (t?.status || "").toLowerCase();
      const priority = (t?.priority || "").toLowerCase();
      return (
        id.includes(q) ||
        title.includes(q) ||
        desc.includes(q) ||
        status.includes(q) ||
        priority.includes(q)
      );
    });
  }, [search, tasks]);

  const pendingCount = tasks.filter((t: any) => (t?.status || "pending").toLowerCase() === "pending").length;
  const overdue = tasks.filter((t: any) => {
    const due = t?.dueDate ? new Date(t.dueDate) : null;
    const done = (t?.status || "").toLowerCase() === "done" || (t?.isDone ? true : false);
    return due && !done && due.getTime() < Date.now();
  });
  const dueToday = tasks.filter((t: any) => {
    const due = t?.dueDate ? new Date(t.dueDate) : null;
    const done = (t?.status || "").toLowerCase() === "done" || (t?.isDone ? true : false);
    if (!due || done) return false;
    const now = new Date();
    return (
      due.getFullYear() === now.getFullYear() &&
      due.getMonth() === now.getMonth() &&
      due.getDate() === now.getDate()
    );
  });

  const acceptTask = async (taskId: string) => {
    try {
      setLoading(true);
      await updateTaskAPI(taskId, { status: "accepted", acceptedAt: new Date().toISOString(), activityType: "task.accepted", activityMessage: `Task accepted by employee ${employeeId}` }, headers);
      const res = await listTasksForEmployeeAPI(employeeId, headers);
      const data = res?.data?.tasks ?? res?.data?.data ?? res?.data ?? [];
      setTasks(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to accept task");
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      setLoading(true);
      await updateTaskAPI(taskId, { status: "done", completedAt: new Date().toISOString(), activityType: "task.completed", activityMessage: `Task marked complete by employee ${employeeId}` }, headers);
      const res = await listTasksForEmployeeAPI(employeeId, headers);
      const data = res?.data?.tasks ?? res?.data?.data ?? res?.data ?? [];
      setTasks(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to mark task complete");
    } finally {
      setLoading(false);
    }
  };

  const copyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      // optionally: show a toast if available
    } catch {}
  };

  return (
    <div className="p-6 space-y-6">
      <p className="text-xl">
        Welcome {user?.name?.charAt(0).toUpperCase() + user?.name?.slice(1)} 👋 to our Employee dashboard
      </p>

      {/* Notifications */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold">Pending</h3>
          <p className="text-2xl">{pendingCount}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold">Due Today</h3>
          <p className="text-2xl">{dueToday.length}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold">Overdue</h3>
          <p className="text-2xl">{overdue.length}</p>
        </Card>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Label htmlFor="task-search">Search</Label>
          <Input id="task-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by code, id, title, status, priority" />
        </div>

        {loading && <p>Loading tasks...</p>}
        {error && <p className="text-red-600">{error}</p>}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!filteredTasks?.length ? (
                <TableRow>
                  <TableCell colSpan={6}>No tasks assigned yet.</TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((t: any) => {
                  const id = t?._id || t?.id;
                  const status = (t?.status || "pending").toLowerCase();
                  const canAccept = status === "pending";
                  const canComplete = status === "accepted";
                  return (
                    <TableRow key={id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{t?.taskCode || id}</span>
                          {id && (
                            <Button variant="outline" size="sm" onClick={() => copyId(String(t?.taskCode || id))}>Copy</Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{t?.title}</TableCell>
                      <TableCell className="capitalize">{t?.priority || "-"}</TableCell>
                      <TableCell>{formatDate(t?.dueDate)}</TableCell>
                      <TableCell className="capitalize">{status}</TableCell>
                      <TableCell className="space-x-2">
                        {canAccept && (
                          <Button size="sm" onClick={() => acceptTask(String(id))} disabled={loading}>Accept</Button>
                        )}
                        {canComplete && (
                          <Button size="sm" variant="outline" onClick={() => completeTask(String(id))} disabled={loading}>Mark Complete</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      {/* Top Overdue Tasks */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Top Overdue Tasks</h3>
        {overdue.length === 0 ? (
          <p className="text-sm text-gray-600">No overdue tasks. Great job!</p>
        ) : (
          <ul className="space-y-2">
            {overdue
              .sort((a: any, b: any) => new Date(a?.dueDate || 0).getTime() - new Date(b?.dueDate || 0).getTime())
              .slice(0, 5)
              .map((t: any) => (
                <li key={String(t?._id || t?.id)} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{t?.taskCode || String(t?._id || t?.id)}</span>
                    <span className="text-sm">{t?.title || "Untitled"}</span>
                  </div>
                  <span className="text-xs text-red-600">Due: {formatDate(t?.dueDate)}</span>
                </li>
              ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default EmployeeDashboard;
