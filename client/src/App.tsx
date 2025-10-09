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
import EmployeeTimesheets from "./components/pages/employee/EmployeeTimesheets";
import ManagerApprovals from "./components/pages/manager/ManagerApprovals";

// Admin Components
import Dashboard from "./components/pages/admin/Dashboard";
import Layout from "./components/pages/admin/Layout";

// Employee Components

import { RootState } from "./redux/store";
import EmployeeLayout from "./components/pages/employee/EmployeeLayout";
import EmployeeDashboard from "./components/pages/employee/EmployeeDashboard";
import AddEmployee from "./components/pages/hr/AddEmployee";

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
                  </Route>
                )}

                {/* Manager/HR/Admin Approvals (Top-level protected route) */}
                {(user?.role === "manager" || user?.role === "hr" || user?.role === "admin") && (
                  <Route
                    path="/manager/approvals"
                    element={
                      <PrivateRoute>
                        <ManagerApprovals />
                      </PrivateRoute>
                    }
                  />
                )}

                {/* HR Add Employee (Top-level protected route) */}
                {(user?.role === "manager" || user?.role === "hr" || user?.role === "admin") && (
                  <Route
                    path="/hr/add-employee"
                    element={
                      <PrivateRoute>
                        <AddEmployee />
                      </PrivateRoute>
                    }
                  />
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
                    <Route path="timesheets" element={<EmployeeTimesheets />} />
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
