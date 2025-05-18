import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './Navigation.module.css';
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebase'; 

export default function Navigation() {
  const navigate = useNavigate();

  const navItems = [
    { label: "דף הבית", path: "/Home" },
    { label: "הגדרות", path: "/Settings" },
    { label: "עזרה", path: "/Help" },
    { label: "דשבורד", path: "/Dashboard" },
    { label: "ניהול", path: "/Admin" }
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); 
    } catch (error) {
      console.error("שגיאה בהתנתקות:", error.message);
    }
  };

  return (
    <nav className={styles.navbar}>
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
      
      <button onClick={handleLogout} className={styles.logoutButton}>
        התנתק
      </button>
    </nav>
  );
}
