import { apiConnector, axiosInstance } from "../apiConnector";
import { leaves, attendance, timesheets } from "../apis";

// Types
export type Role = "employee" | "manager" | "hr" | "admin";

export interface Attachment {
  url?: string;
  name?: string;
  size?: number;
  mimeType?: string;
}

export interface ApplyLeavePayload {
  employeeId: string;
  leaveType: string; // Consider narrowing to enum if available client-side
  from: string | Date;
  to: string | Date;
  reason?: string;
  attachFiles?: Attachment[];
}

export interface LeaveApproveRejectPayload {
  id: string;
  remarks?: string;
}

export interface ClockInPayload {
  employeeId: string;
  deviceId?: string;
  lat?: number;
  lng?: number;
}

export interface ClockOutPayload {
  employeeId: string;
}

export interface TimesheetEntry {
  date: string | Date;
  task: string;
  hours: number;
  billable?: boolean;
}
export interface SubmitTimesheetPayload {
  employeeId: string;
  weekStart: string | Date;
  entries: TimesheetEntry[];
}

// SDK functions
export const LeaveSDK = {
  apply: async (payload: ApplyLeavePayload) => {
    return apiConnector("POST", leaves.APPLY, payload);
  },
  approve: async ({ id, remarks }: LeaveApproveRejectPayload) => {
    return apiConnector("POST", `${leaves.BASE}/${id}/approve`, { remarks });
  },
  reject: async ({ id, remarks }: LeaveApproveRejectPayload) => {
    return apiConnector("POST", `${leaves.BASE}/${id}/reject`, { remarks });
  },
};

export const AttendanceSDK = {
  clockIn: async (payload: ClockInPayload) => {
    return apiConnector("POST", attendance.CLOCK_IN, payload);
  },
  clockOut: async (payload: ClockOutPayload) => {
    return apiConnector("POST", attendance.CLOCK_OUT, payload);
  },
};

export const TimesheetSDK = {
  submit: async (payload: SubmitTimesheetPayload) => {
    return apiConnector("POST", timesheets.SUBMIT, payload);
  },
  approve: async (id: string) => {
    return apiConnector("POST", `${timesheets.BASE}/${id}/approve`);
  },
  reject: async (id: string, remarks?: string) => {
    return apiConnector("POST", `${timesheets.BASE}/${id}/reject`, { remarks });
  },
};

// Optionally expose raw axios instance (with interceptors) for advanced usage
export { axiosInstance };