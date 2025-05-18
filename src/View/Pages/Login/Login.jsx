import React, { useState } from 'react';
import styles from './Login.module.css';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../firebase';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !password) {
      setErrorMessage("נא למלא את כל השדות");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccessMessage("התחברת בהצלחה! מעביר...");
      setTimeout(() => navigate("/home"), 1500);
    } catch (error) {
      setErrorMessage("שגיאה בהתחברות: " + error.message);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h1 className={styles.loginTitle}>התחברות למערכת</h1>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>אימייל</label>
        <input type="email" className={styles.formInput} value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>סיסמה</label>
        <input type="password" className={styles.formInput} value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}
      {successMessage && <p className={styles.successText}>{successMessage}</p>}

      <button onClick={handleLogin} className={styles.loginButton}>התחבר</button>

      <p className={styles.registerPrompt}>
        אין לך חשבון? <Link to="/register" className={styles.registerLink}>הרשם כאן</Link>
      </p>
    </div>
  );
}