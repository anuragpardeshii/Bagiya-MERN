import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./index.css";
import Dashboard from "./Dashboard/Dashboard/Dashboard";
import Bagiya from "./Dashboard/Bagiya/Bagiya";
import "flowbite/dist/flowbite.min.js";
import Profile from "./Dashboard/Profile/Profile";
import Friends from "./Dashboard/Friends/Friends";

function App() {


  return (
    <>
      <Routes>
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/dashboard/bagiya" element={<Bagiya/>} />
        <Route path="/dashboard/profile" element={<Profile/>} />
        <Route path="/dashboard/friends" element={<Friends/>} />
      </Routes>
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
