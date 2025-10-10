import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const { token, user } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/" />;
  }

  if (user?.role === "admin") {
    return children;
  } else if (user?.role === "employee") {
    return children;
  }

  return <Navigate to="/" />;
}

export default PrivateRoute;
