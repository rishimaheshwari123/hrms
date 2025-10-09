import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const { token, user } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/" />;
  }

  // Allow authenticated users with supported roles
  if (["admin", "employee", "manager", "hr"].includes(user?.role)) {
    return children;
  }

  return <Navigate to="/" />;
}

export default PrivateRoute;
