import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./index.css";
import Dashboard from "./Dashboard/Dashboard/Dashboard";
import Bagiya from "./Dashboard/Bagiya/Bagiya";
import Profile from "./Dashboard/Profile/Profile";

function App() {


  return (
    <>
      <Routes>
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/dashboard/bagiya" element={<Bagiya/>} />
        <Route path="/dashboard/profile" element={<Profile/>} />
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
