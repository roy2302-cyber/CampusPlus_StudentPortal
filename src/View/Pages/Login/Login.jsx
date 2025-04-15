import React, { useState } from 'react';
import styles from './Login.module.css';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (email && password) {
      navigate("/dashboard");
    } else {
      alert("נא למלא את כל השדות");
    }
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

      <button
        onClick={handleLogin}
        className={styles.loginButton}
      >
        התחבר
      </button>

      <p className={styles.registerPrompt}>
        אין לך חשבון? <Link to="/Register" className={styles.registerLink}>הרשם כאן</Link>
      </p>
    </div>
  );
}