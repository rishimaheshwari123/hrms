export type Role = "employee" | "manager" | "hr" | "admin";

export interface Attachment {
  url?: string;
  name?: string;
  size?: number;
  mimeType?: string;
}

export interface ApplyLeavePayload {
  employeeId: string;
  leaveType: string;
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