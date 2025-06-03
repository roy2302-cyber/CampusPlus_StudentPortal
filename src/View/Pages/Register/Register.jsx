import { useState } from 'react';
import styles from './Register.module.css';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile,signOut} from "firebase/auth";
import { auth, db } from "../../../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    const showError = (msg) => {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(""), 2000);
    };

    const showSuccess = (msg) => {
      setSuccessMessage(msg);
      setTimeout(() => {
        setSuccessMessage("");
        navigate("/");
      }, 2000);
    };

    if (!fullName.trim()) {
      showError("שם מלא נדרש למילוי");
      return;
    }

    if (!email.trim()) {
      showError("יש להזין כתובת אימייל");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError("כתובת האימייל אינה תקינה");
      return;
    }

    if (!phone.trim()) {
      showError("יש להזין מספר טלפון");
      return;
    }

    const phoneRegex = /^\+\d{10,15}$/;
    if (!phoneRegex.test(phone)) {
      showError("מספר הטלפון צריך להיות בפורמט בינלאומי (לדוגמה +972...)");
      return;
    }

    if (!password) {
      showError("יש להזין סיסמה");
      return;
    }

    if (password.length < 6) {
      showError("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }

    if (!confirmPassword) {
      showError("יש להזין אימות סיסמה");
      return;
    }

    if (password !== confirmPassword) {
      showError("אימות הסיסמה לא תואם לסיסמה");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: fullName });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: fullName,
        email: user.email,
        phone: phone,
        active: true,
        isAdmin: false,
        removed: false,
        createdAt: serverTimestamp(),
        settings: {
          emailNotifications: true,
          smsNotifications: false,
          profileVisibility: false,
          dataSharing: true
        }
      })

      await signOut(auth);
      showSuccess("נרשמת בהצלחה! מעביר אותך למסך התחברות...");

    } catch (error) {
  let message = "שגיאה כללית בהרשמה";
  switch (error.code) {
    case "auth/email-already-in-use":
      message = "האימייל הזה כבר קיים במערכת";
      break;
    case "auth/invalid-email":
      message = "כתובת האימייל אינה תקינה";
      break;
    case "auth/weak-password":
      message = "הסיסמה חלשה מדי. יש לבחור סיסמה חזקה יותר";
      break;
    case "auth/operation-not-allowed":
      message = "הרשמה אינה זמינה כעת. נסה שוב מאוחר יותר";
      break;
    default:
      message = "שגיאה בהרשמה: " + error.message;
  }

  showError(message);
}

  };

  return (
    <div className={styles.registerContainer}>
      <h1 className={styles.registerTitle}>רישום למערכת</h1>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>שם מלא</label>
        <input type="text" className={styles.formInput} value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>אימייל</label>
        <input type="email" className={styles.formInput} value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>מספר טלפון (בפורמט בינלאומי)</label>
        <input type="tel" className={styles.formInput} value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>סיסמה</label>
        <input type="password" className={styles.formInput} value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>אישור סיסמה</label>
        <input type="password" className={styles.formInput} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
      </div>

      {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}
      {successMessage && <p className={styles.successText}>{successMessage}</p>}

      <button onClick={handleRegister} className={styles.registerButton}>צור חשבון</button>

      <p className={styles.registerPrompt}>
        כבר יש לך חשבון? <Link to="/" className={styles.registerLink}>התחבר כאן</Link>
      </p>
    </div>
  );
}
