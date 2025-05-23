import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './Navigation.module.css';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function Navigation({ currentUser, setLoggingOut }) {
  const navigate = useNavigate();

  const navItems = [
    { label: "דף הבית", path: "/Home" },
    { label: "הגדרות", path: "/Settings" },
    { label: "עזרה", path: "/Help" },
    { label: "דשבורד", path: "/Dashboard" }
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    const uid = auth.currentUser?.uid;

    if (uid) {
      const userRef = doc(db, "users", uid);
      try {
        await updateDoc(userRef, { active: false });
      } catch (err) {
        console.error("שגיאה בעדכון סטטוס ל־false:", err);
      }
    }

    await signOut(auth);
    navigate("/");
  };

  return (
    <nav className={styles.navbar}>
      
      <div className={styles.navLinks}>
        {navItems.map(({ label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            {label}
          </NavLink>
        ))}

        {currentUser?.isAdmin && (
          <NavLink
            to="/Admin"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            ניהול
          </NavLink>
        )}

        <button onClick={handleLogout} className={styles.logoutButton}>
          התנתק
        </button>
      </div>

      <span className={styles.welcomeMessage}>
   ברוך הבא, {currentUser?.displayName || "משתמש"}!
      </span>

    </nav>
  );
}
