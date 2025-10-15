import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllEmployees } from "@/service/operations/auth";
import { createTaskAPI, listAllTasksAPI, updateTaskAPI } from "@/service/operations/task";
import { useMemo } from "react";
import { listActivitiesAdminAPI } from "@/service/activity";
import { toast } from "react-toastify";

const AdminTasks: React.FC = () => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [employees, setEmployees] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const headers = { Authorization: `Bearer ${token}` };
  const [adminActivities, setAdminActivities] = useState<any[]>([]);
  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter((t: any) => {
      const id = (t?._id || t?.id || "").toString().toLowerCase();
      const title = (t?.title || "").toLowerCase();
      const desc = (t?.description || "").toLowerCase();
      const status = (t?.status || "").toLowerCase();
      const priority = (t?.priority || "").toLowerCase();
      const assignee = (
        t?.assignedTo?.firstName || t?.assignedTo?.name || t?.assignedTo || ""
      )
        .toString()
        .toLowerCase();
      return (
        id.includes(q) ||
        title.includes(q) ||
        desc.includes(q) ||
        status.includes(q) ||
        priority.includes(q) ||
        assignee.includes(q)
      );
    });
  }, [search, tasks]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [priority, setPriority] = useState<string>("medium");
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [adminNote, setAdminNote] = useState<string>("");
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  
  const generateTaskCode = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TASK-${y}${m}${day}-${rand}`;
  };

  const fetchEmployees = async () => {
    try {
      const data = await getAllEmployees(token);
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await listAllTasksAPI(headers);
      const data = res?.data?.data ?? res?.data ?? [];
      setTasks(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await listActivitiesAdminAPI(headers);
      const payload = res?.data?.data ?? res?.data ?? [];
      setAdminActivities(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchTasks();
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateTask = async () => {
    if (!title || !assignedTo) {
      setError("Title and Assigned To are required");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const assignedById = (user as any)?._id || (user as any)?.id;
      const payload = { title, description, assignedTo, dueDate, priority, assignedBy: assignedById };
      await createTaskAPI(payload, headers);
      toast.success("Task Created successfully!")
      setTitle("");
      setDescription("");
      setAssignedTo("");
      setDueDate("");
      setPriority("medium");
      fetchTasks();
    } catch (err: any) {
      setError(err?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const markDone = async (taskId: string) => {
    try {
      await updateTaskAPI(taskId, { status: "done" }, headers);
      fetchTasks();
    } catch (err: any) {
      setError(err?.message || "Failed to update task");
    }
  };

  const approveTask = async (taskId: string) => {
    try {
      await updateTaskAPI(taskId, { status: "approved", reviewedAt: new Date().toISOString(), reviewNotes: reviewNotes[taskId] || "" }, headers);
      fetchTasks();
      toast.success("task Approved")
    } catch (err: any) {
      setError(err?.message || "Failed to approve task");
    }
  };

  const rejectTask = async (taskId: string) => {
    try {
      await updateTaskAPI(taskId, { status: "rejected", reviewedAt: new Date().toISOString(), reviewNotes: reviewNotes[taskId] || "" }, headers);
      fetchTasks();
            toast.success("Task Rejected")

    } catch (err: any) {
      setError(err?.message || "Failed to reject task");
    }
  };

  // Task details handlers
  const openTaskDetails = (task: any) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const closeTaskDetails = () => {
    setIsDetailOpen(false);
    setSelectedTask(null);
    setAdminNote("");
    setReplyTexts({});
  };

  const addAdminNote = async () => {
    if (!selectedTask || !adminNote.trim()) return;
    try {
      const adminId = (user as any)?._id || (user as any)?.id;
      await updateTaskAPI(String(selectedTask?._id || selectedTask?.id), {
        $push: { comments: { type: "note", text: adminNote.trim(), by: adminId, role: "admin", at: new Date().toISOString() } },
        activityType: "task_note",
        activityMessage: `Admin added note on task ${selectedTask?.title}`,
      }, headers);
      setAdminNote("");
      await fetchTasks();
      setSelectedTask((prev) => {
        if (!prev) return prev;
        const id = String(prev?._id || prev?.id);
        const updated = tasks.find((x) => String(x?._id || x?.id) === id);
        return updated || prev;
      });
    } catch (e: any) {
      setError(e?.message || "Failed to add note");
    }
  };

  const replyToDoubt = async (doubt: any) => {
    const text = replyTexts[String(doubt?._id)]?.trim();
    if (!selectedTask || !doubt?._id || !text) return;
    try {
      const adminId = (user as any)?._id || (user as any)?.id;
      await updateTaskAPI(String(selectedTask?._id || selectedTask?.id), {
        $push: { comments: { type: "reply", text, by: adminId, role: "admin", replyTo: doubt?._id, at: new Date().toISOString() } },
        activityType: "task_reply",
        activityMessage: `Admin replied to doubt on task ${selectedTask?.title}`,
      }, headers);
      setReplyTexts((prev) => ({ ...prev, [String(doubt?._id)]: "" }));
      await fetchTasks();
      setSelectedTask((prev) => {
        if (!prev) return prev;
        const id = String(prev?._id || prev?.id);
        const updated = tasks.find((x) => String(x?._id || x?.id) === id);
        return updated || prev;
      });
    } catch (e: any) {
      setError(e?.message || "Failed to reply to doubt");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Task Management</h1>

      <Card className="p-4 space-y-4">
        <h2 className="text-xl font-semibold">Assign Task</h2>
        {error && <div className="text-red-600">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter task title" />
          </div>
          <div>
            <Label>Priority</Label>
            <select className="w-full border rounded px-3 py-2" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description" />
          </div>
          <div>
            <Label>Assign To</Label>
            <select className="w-full border rounded px-3 py-2" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
              <option value="">Select Employee</option>
              {employees?.map((emp: any) => (
                <option key={emp?._id} value={emp?._id}>
                  {(emp?.firstName || emp?.name || "")} {(emp?.lastName || "")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Due Date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
        <Button onClick={handleCreateTask} disabled={loading} className="mt-2">
          {loading ? "Saving..." : "Create Task"}
        </Button>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Label htmlFor="admin-task-search">Search</Label>
          <Input id="admin-task-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by code, id, title, assignee, status, priority" />
        </div>
        <h2 className="text-xl font-semibold mb-2">All Tasks</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code / ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7}>Loading...</TableCell>
              </TableRow>
            ) : filteredTasks?.length ? (
              filteredTasks.map((t: any) => (
                <TableRow key={t?._id || t?.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{t?.taskCode || t?._id || t?.id}</span>
                      <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(String(t?.taskCode || t?._id || t?.id))}>Copy</Button>
                    </div>
                  </TableCell>
                  <TableCell>{t?.title}</TableCell>
                  <TableCell>{t?.assignedTo?.firstName || t?.assignedTo?.name || t?.assignedTo || '-'}</TableCell>
                  <TableCell className="capitalize">{t?.status}</TableCell>
                  <TableCell className="capitalize">{t?.priority}</TableCell>
                  <TableCell>{t?.dueDate ? new Date(t?.dueDate).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>
                    {t?.status === "done" ? (
                      <div className="space-y-2">
                        <div>
                          <Label>Review Notes</Label>
                          <textarea
                            className="w-full border rounded px-3 py-2"
                            placeholder="Add notes for approval/rejection"
                            value={reviewNotes[String(t?._id || t?.id)] || ""}
                            onChange={(e) => setReviewNotes((prev) => ({ ...prev, [String(t?._id || t?.id)]: e.target.value }))}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => approveTask(t?._id || t?.id)}>Approve</Button>
                          <Button size="sm" variant="outline" onClick={() => rejectTask(t?._id || t?.id)}>Reject</Button>
                          <Button size="sm" variant="secondary" onClick={() => openTaskDetails(t)}>View</Button>
                        </div>
                      </div>
                    ) : t?.status === "approved" ? (
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">Approved</span>
                        <Button size="sm" variant="secondary" onClick={() => openTaskDetails(t)}>View</Button>
                      </div>
                    ) : t?.status === "rejected" ? (
                      <div className="flex items-center gap-2">
                        <span className="text-red-600">Rejected</span>
                        <Button size="sm" variant="secondary" onClick={() => openTaskDetails(t)}>View</Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => markDone(t?._id || t?.id)}>Mark Done</Button>
                        <Button size="sm" variant="secondary" onClick={() => openTaskDetails(t)}>View</Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">No tasks</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      <Card className="p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">Notifications</h2>
        {adminActivities?.length ? (
          <div className="space-y-2">
            {adminActivities.slice(0, 5).map((a: any) => (
              <div key={a?._id} className="text-sm text-gray-700 flex justify-between">
                <span>{a?.message}</span>
                <span className="text-gray-500">{a?.createdAt ? new Date(a.createdAt).toLocaleString() : "-"}</span>
              </div>
            ))}
            {adminActivities.length > 5 && (
              <div className="text-xs text-gray-500">+{adminActivities.length - 5} more</div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500">No notifications</div>
        )}
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
                          <div className="text-sm"><span className="font-medium">Employee:</span> {d?.text}</div>
                          {replies?.length ? (
                            <div className="mt-2 pl-3 border-l">
                              {replies.map((r: any) => (
                                <div key={r?._id} className="text-xs text-gray-700">↳ Admin reply: {r?.text}</div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500 mt-1">No replies yet</div>
                          )}
                          <div className="mt-2 flex gap-2">
                            <Input
                              value={replyTexts[String(d?._id)] || ""}
                              onChange={(e) => setReplyTexts((prev) => ({ ...prev, [String(d?._id)]: e.target.value }))}
                              placeholder="Write a reply"
                            />
                            <Button size="sm" onClick={() => replyToDoubt(d)} disabled={!replyTexts[String(d?._id)]?.trim()}>Reply</Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No doubts</div>
                )}
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
                  <div className="text-sm text-gray-500">No notes yet</div>
                )}
                <div className="mt-2 flex gap-2">
                  <Input value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Add an admin note" />
                  <Button size="sm" onClick={addAdminNote} disabled={!adminNote.trim()}>Add</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminTasks;