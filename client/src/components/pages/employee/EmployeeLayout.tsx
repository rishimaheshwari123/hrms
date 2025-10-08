import { Outlet } from "react-router-dom";
import EmployeeSidebar from "./EmployeeSidebar";

function EmployeeLayout() {
  return (
    <div className="">
      <EmployeeSidebar />

      <div className="lg:ml-24 mx-5 mt-3 ml-[100px] min-h-screen  ">
        <Outlet />
      </div>
    </div>
  );
}

export default EmployeeLayout;
