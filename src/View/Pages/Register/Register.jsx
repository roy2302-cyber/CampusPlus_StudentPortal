import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Register.module.css';

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const handleRegister = () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!fullName.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      setErrorMessage("נא למלא את כל השדות");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+\d{10,15}$/;

    if (!emailRegex.test(email)) {
      setErrorMessage("כתובת האימייל אינה תקינה");
      return;
    }

    if (!phoneRegex.test(phone)) {
      setErrorMessage("מספר הטלפון צריך להיות בפורמט בינלאומי (לדוגמה +972...)");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("אימות הסיסמה לא תואם לסיסמה");
      return;
    }

    const newUser = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password: password,
    };

    localStorage.setItem("registeredUser", JSON.stringify(newUser));

    setSuccessMessage("נרשמת בהצלחה! מעביר למסך התחברות...");
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  return (
    <div className={styles.registerContainer}>
      <h1 className={styles.registerTitle}>רישום למערכת</h1>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>שם מלא</label>
        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>אימייל</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>טלפון</label>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>סיסמה</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>אימות סיסמה</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
      </div>

      {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}
      {successMessage && <p className={styles.successText}>{successMessage}</p>}

      <button onClick={handleRegister} className={styles.registerButton}>
        הירשם
      </button>
    </div>
  );
}
