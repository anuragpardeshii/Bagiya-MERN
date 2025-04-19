import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Dashboard from "./Dashboard/Dashboard/Dashboard";
import Bagiya from "./Dashboard/Bagiya/Bagiya";
import "flowbite/dist/flowbite.min.js";
import Profile from "./Dashboard/Profile/Profile";
import Friends from "./Dashboard/Friends/Friends";
import Home from "./Home/Home";
import Rankings from "./Dashboard/Rankings/Rankings";
import Login from "./Login/Login";
import Signup from "./Signup/Signup";
import { Toaster } from "react-hot-toast";
import NotFound from "./NotFound";
import { AuthProvider } from "./Dashboard/context/AuthContext";
import Times from "./Times";
import ProtectedRoute from "./Dashboard/context/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      {/* Move Toaster outside of Routes */}
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Private Routes with AuthProvider */}
        <Route
          path="/dashboard/*"
          element={
            <AuthProvider>
              <Routes>
                <Route path="" element={<ProtectedRoute element={<Dashboard />} />} />
                <Route path="bagiya" element={<ProtectedRoute element={<Bagiya />} />} />
                <Route path="profile" element={<ProtectedRoute element={<Profile />} />} />
                <Route path="friends" element={<ProtectedRoute element={<Friends />} />} />
                <Route path="rankings" element={<ProtectedRoute element={<Rankings />} />} />
              </Routes>
            </AuthProvider>
          }
        />

        <Route
          path="/timer"
          element={
            <AuthProvider>
              <ProtectedRoute element={<Times />} />
            </AuthProvider>
          }
        />

        {/* Catch-All Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;