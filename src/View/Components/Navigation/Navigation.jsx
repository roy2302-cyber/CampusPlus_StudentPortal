import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './Navigation.module.css';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function Navigation({ currentUser, setLoggingOut }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false); 

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
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, { active: false });
    } catch (err) {
      console.error("שגיאה בעדכון סטטוס ל־false:", err);
    }
  }

  try {
    await signOut(auth);
    navigate("/");
  } catch (err) {
    console.error("שגיאה בהתנתקות:", err);
  }
};

  return (
    <nav className={styles.navbar}>
      <div className={styles.welcomeMessage}>
        ברוך הבא, {currentUser?.displayName || "משתמש"}!
      </div>

      <div className={styles.center}>
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

      <div className={styles.logo}>קמפוס+</div>

      
      <button
        className={styles["menu-toggle"]}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      
      <div className={`${styles["mobile-menu"]} ${menuOpen ? styles.show : ""}`}>
        {navItems.map(({ label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
            onClick={() => setMenuOpen(false)}
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
            onClick={() => setMenuOpen(false)}
          >
            ניהול
          </NavLink>
        )}
        <button onClick={() => { setMenuOpen(false); handleLogout(); }} className={styles.logoutButton}>
          התנתק
        </button>
      </div>
    </nav>
  );
}

