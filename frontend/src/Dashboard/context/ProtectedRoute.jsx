import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ element }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // Show loading while checking user state

  return user ? element : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
