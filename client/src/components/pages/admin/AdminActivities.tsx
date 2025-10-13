import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listActivitiesAdminAPI } from "@/service/activity";

const AdminActivities: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const headers = { Authorization: `Bearer ${token}` };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await listActivitiesAdminAPI(headers);
      const payload = res?.data?.data ?? res?.data ?? [];
      setActivities(Array.isArray(payload) ? payload : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">System Activities</h1>
      <Card className="p-4">
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4}>Loading...</TableCell>
              </TableRow>
            ) : activities?.length ? (
              activities.map((a: any) => (
                <TableRow key={a?._id}>
                  <TableCell>{a?.type}</TableCell>
                  <TableCell>{a?.message}</TableCell>
                  <TableCell>{a?.target?.firstName || a?.target?.name || a?.target || '-'}</TableCell>
                  <TableCell>{a?.createdAt ? new Date(a.createdAt).toLocaleString() : '-'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">No activities</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminActivities;