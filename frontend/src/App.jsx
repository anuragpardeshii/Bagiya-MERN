import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./index.css";
import Dashboard from "./Dashboard/Dashboard/Dashboard";

function App() {


  return (
    <>
      <Routes>
        <Route path="/dashboard" element={<Dashboard/>} />
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
