import { useState } from 'react';
import styles from './Login.module.css';
import { useNavigate, Link } from 'react-router-dom';

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleLogin = () => {
    setErrorMessage("");
    setSuccessMessage("");

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setErrorMessage("נא למלא את כל השדות");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setErrorMessage("כתובת האימייל אינה תקינה");
      return;
    }

    if (!validatePassword(trimmedPassword)) {
      setErrorMessage("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const savedUser = JSON.parse(localStorage.getItem("registeredUser"));

      if (
        savedUser &&
        savedUser.email === trimmedEmail &&
        savedUser.password === trimmedPassword
      ) {
        localStorage.setItem("loggedInUser", JSON.stringify(savedUser));
        setUser(savedUser); // עדכון המשתמש בלוגיקה הראשית

        setSuccessMessage("התחברת בהצלחה! מעביר...");
        setTimeout(() => navigate("/home"), 1500);
      } else {
        setErrorMessage("פרטי ההתחברות שגויים. נסה שוב.");
      }

      setLoading(false);
    }, 1000);
  };

  return (
    <div className={styles.loginContainer}>
      <h1 className={styles.loginTitle}>התחברות למערכת</h1>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>אימייל</label>
        <input
          type="email"
          className={styles.formInput}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>סיסמה</label>
        <input
          type="password"
          className={styles.formInput}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}
      {successMessage && <p className={styles.successText}>{successMessage}</p>}

      <button
        onClick={handleLogin}
        className={styles.loginButton}
        disabled={loading}
      >
        {loading ? "טוען..." : "התחבר"}
      </button>

      <p className={styles.registerPrompt}>
        אין לך חשבון? <Link to="/register" className={styles.registerLink}>הרשם כאן</Link>
      </p>
    </div>
  );
}
