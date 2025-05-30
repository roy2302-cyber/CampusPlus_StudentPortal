import { NavLink, useNavigate } from 'react-router-dom';
import styles from './Navigation.module.css';

export default function Navigation({ currentUser, setUser }) {
  const navigate = useNavigate();

  const navItems = [
    { label: "דף הבית", path: "/home" },
    { label: "הגדרות", path: "/settings" },
    { label: "עזרה", path: "/help" },
    { label: "דשבורד", path: "/dashboard" },
    { label: "ניהול", path: "/admin" } 
  ];

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    setUser(null); 
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

        <button onClick={handleLogout} className={styles.logoutButton}>
          התנתק
        </button>
      </div>

      <span className={styles.welcomeMessage}>
        ברוך הבא, {currentUser?.fullName || "משתמש"}!
      </span>
    </nav>
  );
}
