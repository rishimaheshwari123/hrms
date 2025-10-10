import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertHoliday, deleteHolidayAPI, listHolidays } from "@/service/operations/holiday";

const HolidayCalendar = () => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [recurrence, setRecurrence] = useState("none");
  const [holidays, setHolidays] = useState<any[]>([]);

  const fetchHolidays = async (month?: number, year?: number) => {
    const now = new Date();
    const params = { month: month || now.getMonth() + 1, year: year || now.getFullYear() };
    const data = await listHolidays(params, token);
    setHolidays(data || []);
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleSave = async () => {
    if (!selectedDate || !title) return;
    const payload = {
      title,
      date: selectedDate,
      description,
      recurrence,
      createdBy: user?._id,
    };
    const res = await upsertHoliday(payload, token);
    if (res) {
      setTitle("");
      setDescription("");
      setRecurrence("none");
      fetchHolidays();
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteHolidayAPI(id, token, user?._id);
    fetchHolidays();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Official Holiday Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate as any}
                modifiers={{ holiday: holidays.map(h => new Date(h.date)) }}
                modifiersClassNames={{ holiday: "bg-red-100 text-red-700" }}
              />
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Recurrence</Label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                >
                  <option value="none">None</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
              <Button onClick={handleSave} disabled={!selectedDate || !title}>Save Holiday</Button>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Saved Holidays</h3>
            <div className="space-y-2">
              {holidays?.length ? (
                holidays.map((h) => (
                  <div key={h._id} className="flex justify-between items-center p-2 border rounded bg-white">
                    <div>
                      <div className="font-medium">{h.title}</div>
                      <div className="text-sm text-gray-600">{new Date(h.date).toLocaleDateString()} {h.recurring !== "none" ? `(${h.recurring})` : ""}</div>
                    </div>
                    <Button variant="destructive" onClick={() => handleDelete(h._id)}>Delete</Button>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No holidays saved.</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HolidayCalendar;