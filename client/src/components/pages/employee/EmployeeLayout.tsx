import { Outlet } from "react-router-dom";
import EmployeeSidebar from "./EmployeeSidebar";

function EmployeeLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <EmployeeSidebar />

      <div className="mx-5 mt-3 ml-[var(--sidebar-width,5rem)] transition-[margin-left] duration-300">
        <Outlet />
      </div>
    </div>
  );
}

export default EmployeeLayout;
