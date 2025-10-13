import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listTasksForEmployeeAPI, updateTaskAPI } from "@/service/task";
import { listActivitiesForEmployeeAPI } from "@/service/activity";

const EmployeeTasks: React.FC = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [doubts, setDoubts] = useState<Record<string, string>>({});
  const [activities, setActivities] = useState<any[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [modalDoubt, setModalDoubt] = useState<string>("");

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const employeeId = (user as any)?._id || (user as any)?.id;

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

  const fetchActivities = async () => {
    if (!employeeId) return;
    try {
      const res = await listActivitiesForEmployeeAPI(employeeId, headers);
      const payload = res?.data?.data ?? res?.data ?? [];
      setActivities(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, token]);

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter((t: any) => {
      const code = (t?.taskCode || "").toString().toLowerCase();
      const id = (t?._id || t?.id || "").toString().toLowerCase();
      const title = (t?.title || "").toLowerCase();
      const status = (t?.status || "").toLowerCase();
      const priority = (t?.priority || "").toLowerCase();
      return code.includes(q) || id.includes(q) || title.includes(q) || status.includes(q) || priority.includes(q);
    });
  }, [search, tasks]);

  const acceptTask = async (taskId: string) => {
    try {
      setLoading(true);
      await updateTaskAPI(taskId, { status: "accepted", acceptedAt: new Date().toISOString(), activityType: "task_accepted", activityMessage: `Task accepted by employee ${employeeId}` }, headers);
      await fetchTasks();
    } catch (err: any) {
      setError(err?.message || "Failed to accept task");
    } finally {
      setLoading(false);
    }
  };

  const submitDoubt = async (taskId: string) => {
    const text = doubts[taskId]?.trim() || modalDoubt.trim();
    if (!text) return;
    try {
      setLoading(true);
      // Backend should append a new doubt entry to the task
      await updateTaskAPI(taskId, { $push: { doubts: { text, by: employeeId, at: new Date().toISOString() } }, activityType: "task_doubt", activityMessage: `Doubt raised by employee ${employeeId}` }, headers);
      setDoubts((prev) => ({ ...prev, [taskId]: "" }));
      setModalDoubt("");
      // Optimistic update if viewing this task
      setSelectedTask((prev) => {
        if (!prev || String(prev?._id || prev?.id) !== String(taskId)) return prev;
        const newD = { _id: `temp-${Date.now()}`, text, by: employeeId, at: new Date().toISOString() };
        return { ...prev, doubts: [...(prev?.doubts || []), newD] };
      });
      await fetchTasks();
    } catch (err: any) {
      setError(err?.message || "Failed to submit doubt");
    } finally {
      setLoading(false);
    }
  };

  const openTaskDetails = (task: any) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const closeTaskDetails = () => {
    setIsDetailOpen(false);
    setSelectedTask(null);
    setModalDoubt("");
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Tasks</h1>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Label htmlFor="emp-task-search">Search</Label>
          <Input id="emp-task-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by code, id, title, status, priority" />
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-4">
        <h3 className="font-semibold mb-2">Notifications</h3>
        {!activities?.length ? (
          <div className="text-sm text-gray-500">No notifications</div>
        ) : (
          <div className="space-y-2">
            {activities.slice(0, 5).map((a: any) => (
              <div key={a?._id} className="flex items-center justify-between text-sm">
                <span className="font-medium capitalize">{String(a?.type || "activity").replace(/_/g, " ")}</span>
                <span className="flex-1 ml-2 truncate">{a?.message}</span>
                <span className="text-gray-500 ml-2">{a?.createdAt ? new Date(a.createdAt).toLocaleString() : "-"}</span>
              </div>
            ))}
            {activities.length > 5 && (
              <div className="text-xs text-gray-500">+{activities.length - 5} more</div>
            )}
          </div>
        )}
      </Card>
      {error && <div className="text-red-600">{error}</div>}

      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
              <TableHead>Ask Doubt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7}>Loading...</TableCell>
              </TableRow>
            ) : !filteredTasks?.length ? (
              <TableRow>
                <TableCell colSpan={7}>No tasks assigned.</TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((t: any) => {
                const id = String(t?._id || t?.id);
                const status = (t?.status || "pending").toLowerCase();
                const canAccept = status === "pending";
                return (
                  <TableRow key={id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{t?.taskCode || id}</span>
                        <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(String(t?.taskCode || id))}>Copy</Button>
                      </div>
                    </TableCell>
                    <TableCell>{t?.title}</TableCell>
                    <TableCell className="capitalize">{t?.priority || "-"}</TableCell>
                    <TableCell>{formatDate(t?.dueDate)}</TableCell>
                    <TableCell className="capitalize">{status}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {canAccept && (
                          <Button size="sm" onClick={() => acceptTask(id)} disabled={loading}>Accept</Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => openTaskDetails(t)}>View</Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <textarea
                          className="w-full border rounded px-3 py-2"
                          placeholder="Ask a doubt or add a comment"
                          value={doubts[id] || ""}
                          onChange={(e) => setDoubts((prev) => ({ ...prev, [id]: e.target.value }))}
                        />
                        <Button size="sm" variant="outline" onClick={() => submitDoubt(id)} disabled={loading || !doubts[id]?.trim()}>Submit</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    {isDetailOpen && selectedTask && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <Card className="w-full max-w-3xl p-6 bg-white rounded shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Task Details</h3>
              <Button variant="outline" onClick={closeTaskDetails}>Close</Button>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Code:</span> <span className="font-mono">{selectedTask?.taskCode || selectedTask?._id || selectedTask?.id}</span></div>
              <div><span className="font-medium">Title:</span> {selectedTask?.title}</div>
              <div><span className="font-medium">Description:</span> {selectedTask?.description || '-'}</div>
              <div><span className="font-medium">Priority:</span> {selectedTask?.priority}</div>
              <div><span className="font-medium">Due:</span> {selectedTask?.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : '-'}</div>
              <div className="capitalize"><span className="font-medium">Status:</span> {selectedTask?.status}</div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Doubts</h4>
                {selectedTask?.doubts?.length ? (
                  <div className="space-y-3">
                    {selectedTask.doubts.map((d: any) => {
                      const replies = (selectedTask?.comments || []).filter((c: any) => c?.type === "reply" && String(c?.replyTo) === String(d?._id));
                      return (
                        <div key={d?._id} className="border rounded p-3">
                          <div className="text-sm"><span className="font-medium">You:</span> {d?.text}</div>
                          {replies?.length ? (
                            <div className="mt-2 pl-3 border-l">
                              {replies.map((r: any) => (
                                <div key={r?._id} className="text-xs text-gray-700">↳ Admin reply: {r?.text}</div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500 mt-1">No replies yet</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No doubts</div>
                )}

                <div className="mt-2 flex gap-2">
                  <Input value={modalDoubt} onChange={(e) => setModalDoubt(e.target.value)} placeholder="Ask a new doubt" />
                  <Button size="sm" onClick={() => submitDoubt(String(selectedTask?._id || selectedTask?.id))} disabled={loading || !modalDoubt.trim()}>Submit</Button>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Admin Notes</h4>
                {(selectedTask?.comments || []).filter((c: any) => c?.type === "note").length ? (
                  <div className="space-y-2">
                    {(selectedTask?.comments || []).filter((c: any) => c?.type === "note").map((n: any) => (
                      <div key={n?._id} className="text-sm text-gray-700">• {n?.text}</div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No admin notes yet</div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EmployeeTasks;