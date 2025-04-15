import React, { useState } from 'react';
import styles from './Register.module.css';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = () => {
    if (fullName && email && password && confirmPassword) {
      if (password !== confirmPassword) {
        alert("אישור הסיסמה לא תואם");
        return;
      }
      navigate("/dashboard");
    } else {
      alert("נא למלא את כל השדות");
    }
  };

  return (
    <div className={styles.registerContainer}>
      <h1 className={styles.registerTitle}>רישום למערכת</h1>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>שם מלא</label>
        <input
          type="text"
          className={styles.formInput}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

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

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>אישור סיסמה</label>
        <input
          type="password"
          className={styles.formInput}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <button
        onClick={handleRegister}
        className={styles.registerButton}
      >
        צור חשבון
      </button>
      <p className={styles.registerPrompt}>
        כבר יש לך חשבון? <Link to="/" className={styles.registerLink}>התחבר כאן</Link>
      </p>
    </div>
  );
}