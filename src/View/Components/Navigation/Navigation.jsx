<<<<<<< HEAD
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
=======
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
      const userRef = doc(db, "users", uid);
      try {
        await updateDoc(userRef, { active: false });
      } catch (err) {
        console.error("שגיאה בעדכון סטטוס ל־false:", err);
      }
    }
    await signOut(auth);
>>>>>>> 74af6948e33a77384475732cde0e72eb7630115f
    navigate("/");
  };

  return (
    <nav className={styles.navbar}>
<<<<<<< HEAD
      <div className={styles.navLinks}>
=======
      <div className={styles.welcomeMessage}>
        ברוך הבא, {currentUser?.displayName || "משתמש"}!
      </div>

      <div className={styles.center}>
>>>>>>> 74af6948e33a77384475732cde0e72eb7630115f
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
<<<<<<< HEAD

=======
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
>>>>>>> 74af6948e33a77384475732cde0e72eb7630115f
        <button onClick={handleLogout} className={styles.logoutButton}>
          התנתק
        </button>
      </div>

<<<<<<< HEAD
      <span className={styles.welcomeMessage}>
        ברוך הבא, {currentUser?.fullName || "משתמש"}!
      </span>
    </nav>
  );
}
=======
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

>>>>>>> 74af6948e33a77384475732cde0e72eb7630115f
