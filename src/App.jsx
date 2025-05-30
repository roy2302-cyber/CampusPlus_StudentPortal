import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
<<<<<<< HEAD
=======
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
>>>>>>> 74af6948e33a77384475732cde0e72eb7630115f

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
<<<<<<< HEAD
=======
  const [loggingOut, setLoggingOut] = useState(false);
>>>>>>> 74af6948e33a77384475732cde0e72eb7630115f
  const location = useLocation();

  const publicPaths = ["/", "/register"];
  const hideNavigation = publicPaths.includes(location.pathname);

  useEffect(() => {
<<<<<<< HEAD
    const savedUser = localStorage.getItem("loggedInUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(null);
    }
    setLoading(false);
=======
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();


        if (userData?.removed === true) {
          await signOut(auth);
          setUser(null);
          setLoading(false);
          return;
        }


        try {
          await updateDoc(userRef, { active: true });
        } catch (err) {
          console.error("שגיאה בעדכון active ל-true:", err.message);
        }

        const userSettingsRef = doc(db, "userSettings", currentUser.uid);
        const settingsSnap = await getDoc(userSettingsRef);
        const settingsData = settingsSnap.exists() ? settingsSnap.data() : {};

        currentUser.isAdmin = userData?.isAdmin || false;
        currentUser.settings = settingsData;

        setUser(currentUser);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [loggingOut]);

  useEffect(() => {

    return () => {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        const ref = doc(db, "users", uid);
        updateDoc(ref, { active: false }).catch((err) => {
          console.error("שגיאה בעדכון active ל-false ב-unmount:", err);
        });
      }
    };
>>>>>>> 74af6948e33a77384475732cde0e72eb7630115f
  }, []);

  if (loading) return null;

  return (
    <div className="app-container">
      {user && !hideNavigation && (
        <header className="app-header">
<<<<<<< HEAD
          <Navigation currentUser={user} setUser={setUser} />
          <h1 className="logo">קמפוס+</h1>
=======
          <Navigation currentUser={user} setLoggingOut={setLoggingOut} />
>>>>>>> 74af6948e33a77384475732cde0e72eb7630115f
        </header>
      )}

      <Routes>
<<<<<<< HEAD
        <Route path="/" element={<Login setUser={setUser} />} />
=======
        <Route path="/" element={<Login />} />
>>>>>>> 74af6948e33a77384475732cde0e72eb7630115f
        <Route path="/register" element={<Register />} />

        {user ? (
          <>
            <Route path="/home" element={<Home />} />
<<<<<<< HEAD
            <Route path="/dashboard" element={<Dashboard currentUser={user} />} />
            <Route path="/help" element={<Help />} />
            <Route path="/settings" element={<Settings currentUser={user} />} />
           <Route path="/admin" element={<Admin />} />
=======
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/help" element={<Help />} />
            <Route path="/settings" element={<Settings currentUser={user} />} />
            {user?.isAdmin && <Route path="/admin" element={<Admin />} />}
>>>>>>> 74af6948e33a77384475732cde0e72eb7630115f
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
<<<<<<< HEAD
}
=======
}
>>>>>>> 74af6948e33a77384475732cde0e72eb7630115f
