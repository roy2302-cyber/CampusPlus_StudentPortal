import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);


  if (loading) return null;

  return (
    <Router>
      <div className="app-container">
        {user && (
          <header className="app-header">
            <Navigation />
            <h1 className="logo">קמפוס+</h1>
          </header>
        )}

        <Routes>

          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {user ? (
            <>
              <Route path="/home" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/help" element={<Help />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/community" element={<Community currentUser={user.displayName} />} />
              <Route path="/summaries" element={<Summaries user={user} />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/writing" element={<Writing currentUser={user.displayName} />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/" />} />
          )}
        </Routes>

        {user && (
          <footer className="app-footer">
            © כל הזכויות שמורות לקמפוס+
          </footer>
        )}
      </div>
    </Router>
  );
}
