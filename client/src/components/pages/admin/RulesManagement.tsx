import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { listRulesAPI, createRuleAPI, updateRuleAPI, deleteRuleAPI } from "@/service/operations/rules";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { Pencil, Trash2, Plus, RefreshCcw } from "lucide-react";

const defaultForm = {
  name: "",
  category: "deduction" as "earning" | "deduction",
  type: "fixed" as "fixed" | "percentage",
  base: "gross" as "basic" | "gross" | "net" | "taxable",
  value: 0,
  isTaxable: false,
  priority: 0,
  active: true,
};

export default function RulesManagement() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<{ active?: boolean; category?: string }>({ active: undefined, category: undefined });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const canManage = user?.role === "admin";

  const fetchRules = async () => {
    if (!token) return toast.error("Missing auth token");
    setLoading(true);
    const list = await listRulesAPI({ token, filters });
    setRules(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.active, filters.category]);

  const onCreateOrUpdate = async () => {
    try {
      if (!token) return toast.error("Missing auth token");
      const payload = { ...form, createdBy: user?._id, requesterId: user?._id };
      if (editingId) {
        await updateRuleAPI({ token, id: editingId, updates: payload });
      } else {
        await createRuleAPI({ token, payload });
      }
      setIsDialogOpen(false);
      setForm(defaultForm);
      setEditingId(null);
      fetchRules();
    } catch (e) {
      // errors handled in operation
    }
  };

  const onEdit = (rule: any) => {
    setEditingId(rule._id);
    setForm({
      name: rule.name || "",
      category: rule.category || "deduction",
      type: rule.type || "fixed",
      base: rule.base || "gross",
      value: Number(rule.value || 0),
      isTaxable: !!rule.isTaxable,
      priority: Number(rule.priority || 0),
      active: !!rule.active,
    });
    setIsDialogOpen(true);
  };

  const onDelete = async (id: string) => {
    if (!token) return toast.error("Missing auth token");
    const ok = window.confirm("Are you sure you want to delete this rule?");
    if (!ok) return;
    try {
      await deleteRuleAPI({ token, id });
      fetchRules();
    } catch (e) {
      // handled
    }
  };

  const header = useMemo(() => (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-2xl font-semibold">Deduction/Earning Rules</h1>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={fetchRules}><RefreshCcw className="h-4 w-4 mr-2" />Refresh</Button>
        {canManage && (
          <Button onClick={() => { setForm(defaultForm); setEditingId(null); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> New Rule
          </Button>
        )}
      </div>
    </div>
  ), [canManage]);

  return (
    <div className="min-h-screen p-4">
      {header}

      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Category</Label>
            <Select value={filters.category || ""} onValueChange={(val) => setFilters((prev) => ({ ...prev, category: val === "all" ? undefined : val }))}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="earning">Earning</SelectItem>
                <SelectItem value="deduction">Deduction</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Label>Active Only</Label>
            <Switch checked={!!filters.active} onCheckedChange={(val) => setFilters((prev) => ({ ...prev, active: val ? true : undefined }))} />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        {loading ? (
          <p>Loading rules...</p>
        ) : rules.length === 0 ? (
          <p>No rules found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Base</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Taxable</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((r) => (
                <TableRow key={r._id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>
                    <Badge variant={r.category === "earning" ? "default" : "secondary"}>{r.category}</Badge>
                  </TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>{r.base}</TableCell>
                  <TableCell>{r.type === "fixed" ? `₹${r.value}` : `${r.value}%`}</TableCell>
                  <TableCell>{r.isTaxable ? "Yes" : "No"}</TableCell>
                  <TableCell>{r.priority ?? 0}</TableCell>
                  <TableCell>
                    <Badge variant={r.active ? "default" : "secondary"}>{r.active ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {canManage && (
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEdit(r)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="sm" onClick={() => onDelete(r._id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Rule" : "Create Rule"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(val) => setForm((p) => ({ ...p, category: val as any }))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="earning">Earning</SelectItem>
                  <SelectItem value="deduction">Deduction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(val) => setForm((p) => ({ ...p, type: val as any }))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Base</Label>
              <Select value={form.base} onValueChange={(val) => setForm((p) => ({ ...p, base: val as any }))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="gross">Gross</SelectItem>
                  <SelectItem value="net">Net</SelectItem>
                  <SelectItem value="taxable">Taxable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <Input type="number" value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: Number(e.target.value) }))} />
              <p className="text-xs text-muted-foreground mt-1">If percentage, enter percent value; if fixed, enter amount.</p>
            </div>
            <div className="flex items-center gap-3">
              <Label>Taxable</Label>
              <Switch checked={form.isTaxable} onCheckedChange={(v) => setForm((p) => ({ ...p, isTaxable: v }))} />
            </div>
            <div>
              <Label>Priority</Label>
              <Input type="number" value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: Number(e.target.value) }))} />
            </div>
            <div className="flex items-center gap-3">
              <Label>Active</Label>
              <Switch checked={form.active} onCheckedChange={(v) => setForm((p) => ({ ...p, active: v }))} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => { setIsDialogOpen(false); setEditingId(null); }}>Cancel</Button>
            <Button onClick={onCreateOrUpdate}>{editingId ? "Save Changes" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}