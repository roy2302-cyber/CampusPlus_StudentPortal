import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./View/Pages/Home/Home.jsx";
import Login from "./View/Pages/Login/Login.jsx";
import Register from "./View/Pages/Register/Register.jsx";
import Dashboard from "./View/Pages/Dashboard/Dashboard.jsx";
import Help from "./View/Pages/Help/Help.jsx";
import Settings from "./View/Pages/Settings/Settings.jsx";
import Admin from "./View/Pages/Admin/Admin.jsx";
import Community from "./View/Pages/Community/Community.jsx";
import Summaries from "./View/Pages/Summaries/Summaries.jsx";
import Tasks from "./View/Pages/Tasks/Tasks.jsx";
import Writing from "./View/Pages/Writing/Writing.jsx";
import Navigation from "./View/Components/Navigation/Navigation.jsx";

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
        <Navigation />
          <h1 className="logo">קמפוס+</h1>
        </header>

     

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/help" element={<Help />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/community" element={<Community />} />
          <Route path="/summaries" element={<Summaries />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/writing" element={<Writing />} />
        </Routes>

        <footer className="app-footer">
        © כל הזכויות שמורות לקמפוס+
        </footer>
      </div>
    </Router>
  );
}
