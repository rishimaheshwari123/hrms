import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { LogOut, Menu, X } from "lucide-react";
import { toast } from "react-toastify";
import { setToken, setUser } from "@/redux/authSlice";
import { RootState } from "@/redux/store";

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(setToken(null));
    dispatch(setUser(null));
    navigate("/");
    toast.success("User Logout Successfully!");
  };

  const handleRoleRedirect = () => {
    if (!user) return;
    if (user.role === "admin") navigate("/admin/dashboard");
    if (user.role === "employee") navigate("/employee/dashboard");
  };

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div
          className="text-2xl font-bold text-orange-600 cursor-pointer"
          onClick={() => navigate("/")}
        >
          HRMS
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-6 text-gray-700 font-medium">
          <button
            onClick={() => navigate("/")}
            className="hover:text-orange-600 transition"
          >
            Home
          </button>
          <button
            onClick={() => navigate("/about")}
            className="hover:text-orange-600 transition"
          >
            About
          </button>
          <button
            onClick={() => navigate("/contact")}
            className="hover:text-orange-600 transition"
          >
            Contact
          </button>
        </div>

        {/* Right Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <button
                onClick={handleRoleRedirect}
                className="bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 transition"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
              >
                <LogOut size={16} className="mr-1" /> Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 transition"
            >
              Login / Signup
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} className="text-orange-600" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
  className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ${
    isSidebarOpen ? "translate-x-0" : "translate-x-full"
  } z-50`}
>
  <div className="flex items-center justify-between p-4 border-b border-gray-200">
    <span
      className="text-2xl font-bold text-orange-600 cursor-pointer"
      onClick={() => {
        navigate("/");
        setIsSidebarOpen(false);
      }}
    >
      HRMS
    </span>
    <button onClick={() => setIsSidebarOpen(false)}>
      <X size={24} className="text-gray-700" />
    </button>
  </div>

  <div className="flex flex-col mt-6 space-y-4 px-4">
    <button
      onClick={() => {
        navigate("/");
        setIsSidebarOpen(false);
      }}
      className="text-gray-700 hover:text-orange-600 font-medium transition text-left"
    >
      Home
    </button>
    <button
      onClick={() => {
        navigate("/about");
        setIsSidebarOpen(false);
      }}
      className="text-gray-700 hover:text-orange-600 font-medium transition text-left"
    >
      About
    </button>
    <button
      onClick={() => {
        navigate("/contact");
        setIsSidebarOpen(false);
      }}
      className="text-gray-700 hover:text-orange-600 font-medium transition text-left"
    >
      Contact
    </button>

    {user ? (
      <>
        <button
          onClick={() => {
            handleRoleRedirect();
            setIsSidebarOpen(false);
          }}
          className="bg-orange-600 text-white px-3 py-2 rounded hover:bg-orange-700 transition text-left"
        >
          Dashboard
        </button>
        <button
          onClick={() => {
            handleLogout();
            setIsSidebarOpen(false);
          }}
          className="flex items-center bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition"
        >
          <LogOut size={16} className="mr-2" /> Logout
        </button>
      </>
    ) : (
      <button
        onClick={() => {
          navigate("/login");
          setIsSidebarOpen(false);
        }}
        className="bg-orange-600 text-white px-3 py-2 rounded hover:bg-orange-700 transition"
      >
        Login / Signup
      </button>
    )}
  </div>
</div>


      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
