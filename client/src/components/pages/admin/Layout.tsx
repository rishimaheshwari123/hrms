import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Sidebar />

      <div className="mx-5 mt-3 ml-[var(--sidebar-width,5rem)] transition-[margin-left] duration-300">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
