import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ✅ Hook to navigate

  const BACKEND_URL = "http://localhost:3000/api/auth"; // ✅ Consistent API path

  const login = () => {
    window.location.href = `${BACKEND_URL}/login`;
  };

  const logout = async () => {
    try {
      await axios.get(`${BACKEND_URL}/logout`, { withCredentials: true });
      setUser(null);
      navigate("/login"); // ✅ Redirect to login after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const fetchUser = async () => {
    try {
      const { data } = await axios.get(`${BACKEND_URL}/check-auth`, {
        withCredentials: true,
      });
      setUser(data);
    } catch (error) {
      setUser(null);
      navigate("/login"); // ✅ Redirect unauthenticated users
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
