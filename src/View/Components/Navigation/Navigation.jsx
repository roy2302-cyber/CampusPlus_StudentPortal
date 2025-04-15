import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Navigation.module.css';

export default function Navigation() {
  const navItems = [
    { label: "דף הבית", path: "/Home" },
    { label: "הגדרות", path: "/Settings" },
    { label: "עזרה", path: "/Help" },
    { label: "דשבורד", path: "/Dashboard" },
    { label: "ניהול", path: "/Admin" }
  ];

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
    </nav>
  );
}
