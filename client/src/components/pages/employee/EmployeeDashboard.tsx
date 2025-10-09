import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { AttendanceSDK } from "@/service/sdk/index";
import { toast } from "react-toastify";
import React from "react";

const EmployeeDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const getGeo = async (): Promise<{lat?: number; lng?: number}> => {
    if (!("geolocation" in navigator)) return {};
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({})
      );
    });
  };

  const handleClockIn = async () => {
    try {
      const { lat, lng } = await getGeo();
      const res = await AttendanceSDK.clockIn({ employeeId: (user as any)?._id || (user as any)?.id, lat, lng });
      toast.success(res?.data?.message || "Clock-in successful");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Clock-in failed");
    }
  };

  const handleClockOut = async () => {
    try {
      const res = await AttendanceSDK.clockOut({ employeeId: (user as any)?._id || (user as any)?.id });
      toast.success(res?.data?.message || "Clock-out successful");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Clock-out failed");
    }
  };

  return (
    <>
      <p className="mt-5 mb-10 text-xl">
        Welcome {user?.name.charAt(0).toUpperCase() + user?.name.slice(1)} 👋 to
        our Employee dashboard
      </p>

      <div className="mt-10 space-y-6">
        <p className="text-center text-3xl font-semibold mb-2 uppercase ">
          Quick Actions
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleClockIn}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Clock In
          </button>
          <button
            onClick={handleClockOut}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Clock Out
          </button>
        </div>
        <p className="border-2 border-black"></p>
      </div>
      <br />
      <br />
    </>
  );
};

export default EmployeeDashboard;
