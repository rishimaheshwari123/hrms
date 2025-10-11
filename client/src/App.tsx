import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import OpenRoute from "@/components/auth/OpenRoute";
import PrivateRoute from "@/components/auth/PrivateRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SalaryHistory from "./components/pages/employee/SalaryHistory";

// Admin Components
import Dashboard from "./components/pages/admin/Dashboard";
import Layout from "./components/pages/admin/Layout";

// Employee Components

import { RootState } from "./redux/store";
import EmployeeLayout from "./components/pages/employee/EmployeeLayout";
import EmployeeDashboard from "./components/pages/employee/EmployeeDashboard";
import GetAllEmployee from "./components/pages/admin/GetAllEmployee";
import EditEmployee from "./components/pages/admin/EditEmployee";
import AddEmployee from "./components/pages/admin/AddEmployee";
import ViewEmployee from "./components/pages/admin/ViewEmployee";
import MyProfile from "./components/pages/employee/MyProfile";
import AdminSalary from "./components/pages/admin/AdminSallery";
import LeaveManagement from "./components/pages/employee/LeaveManagement";
import HolidayCalendar from "./components/pages/admin/HolidayCalendar";
import LeaveApproval from "./components/pages/admin/LeaveApproval";
import EmployeePayslips from "./components/pages/employee/EmployeePayslips";
import RulesManagement from "./components/pages/admin/RulesManagement";

const queryClient = new QueryClient();

const App = () => {
  const { user } = useSelector((state: RootState) => state.auth); // <-- user from redux store

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />

                <Route
                  path="/login"
                  element={
                    <OpenRoute>
                      <Login />
                    </OpenRoute>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <OpenRoute>
                      <Signup />
                    </OpenRoute>
                  }
                />

                {/* Admin Routes */}
                {user?.role === "admin" && (
                  <Route
                    path="/admin"
                    element={
                      <PrivateRoute>
                        <Layout />
                      </PrivateRoute>
                    }
                  >
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="get-all-employee" element={<GetAllEmployee />} />
                    <Route path="edit-employee/:id" element={<EditEmployee />} />
                    <Route path="view-employee/:id" element={<ViewEmployee />} />
                    <Route path="add-employee" element={<AddEmployee />} />
                    <Route path="salary-employee/:id" element={<AdminSalary />} />
                    <Route path="holiday-calendar" element={<HolidayCalendar />} />
                    <Route path="leave-approval" element={<LeaveApproval />} />
                    <Route path="rules-management" element={<RulesManagement />} />
                  </Route>
                )}

                {/* Employee Routes */}
                {user?.role === "employee" && (
                  <Route
                    path="/employee"
                    element={
                      <PrivateRoute>
                        <EmployeeLayout />
                      </PrivateRoute>
                    }
                  >
                    <Route path="dashboard" element={<EmployeeDashboard />} />
                    <Route path="my-profile" element={<MyProfile />} />
                    <Route path="edit-employee/:id" element={<EditEmployee />} />
                    <Route path="bank-details/:id" element={<AdminSalary />} />
                    <Route path="leave-management" element={<LeaveManagement />} />
                    <Route path="payslips" element={<EmployeePayslips />} />
                    <Route path="salary-history" element={<SalaryHistory />} />
                  </Route>
                )}

                {/* Not Found */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
