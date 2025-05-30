import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const publicPaths = ["/", "/register"];
  const hideNavigation = publicPaths.includes(location.pathname);

  useEffect(() => {
    const savedUser = localStorage.getItem("loggedInUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <div className="app-container">
      {user && !hideNavigation && (
        <header className="app-header">
          <Navigation currentUser={user} setUser={setUser} />
          <h1 className="logo">קמפוס+</h1>
        </header>
      )}

      <Routes>
        <Route path="/" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />

        {user ? (
          <>
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard currentUser={user} />} />
            <Route path="/help" element={<Help />} />
            <Route path="/settings" element={<Settings currentUser={user} />} />
           <Route path="/admin" element={<Admin />} />
            <Route path="/community" element={<Community currentUser={user} />} />
            <Route path="/summaries" element={<Summaries currentUser={user} />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/writing" element={<Writing currentUser={user} />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/" />} />
        )}
      </Routes>

      {user && !hideNavigation && (
        <footer className="app-footer">© כל הזכויות שמורות לקמפוס+</footer>
      )}
    </div>
  );
}
