import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import LoadingScreen from "../../components/LoadingScreen";

const ProtectedRoute = ({ element }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />; // Custom tree loading animation

  return user ? element : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
