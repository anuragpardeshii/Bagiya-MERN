import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import NotFound from "./NotFound";
import { AuthProvider } from "./Dashboard/context/AuthContext";
import Times from "./Times";
import ProtectedRoute from "./Dashboard/context/ProtectedRoute"; 

function App() {
  return (
    <>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/dashboard/bagiya" element={<ProtectedRoute element={<Bagiya />} />} />
        <Route path="/dashboard/profile" element={<ProtectedRoute element={<Profile />} />} />
        <Route path="/dashboard/friends" element={<ProtectedRoute element={<Friends />} />} />
        <Route path="/dashboard/rankings" element={<ProtectedRoute element={<Rankings />} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<NotFound />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/timer" element={<ProtectedRoute element={<Times />} />}/>
        </Routes>
      </AuthProvider>
    </>
  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default AppWrapper;
