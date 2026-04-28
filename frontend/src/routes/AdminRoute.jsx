import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user || !["admin", "staff"].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;
