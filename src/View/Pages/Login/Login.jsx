import { useState } from 'react';
import styles from './Login.module.css';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut} from 'firebase/auth';
import { auth, db } from '../../../firebase';
import { doc, getDoc } from "firebase/firestore";

export default function Login() {
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

  const handleLogin = async () => {
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
    setErrorMessage("הסיסמה חייבת להיות באורך של לפחות 6 תווים");
    return;
  }

  try {
    setLoading(true);
    const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
    const uid = userCredential.user.uid;


    const userDoc = await getDoc(doc(db, "users", uid));
    const userData = userDoc.data();

   if (userData?.removed) {
    await signOut(auth); 
    setErrorMessage("הגישה שלך הוסרה על ידי מנהל המערכת");
    return;
    }

    setSuccessMessage("התחברת בהצלחה! מעביר...");
    setTimeout(() => navigate("/home"), 1500);
  } catch (error) {
  let message = "שגיאה כללית בהתחברות";
  switch (error.code) {
    case "auth/user-not-found":
      message = "האימייל לא קיים במערכת";
      break;
    case "auth/wrong-password":
      message = "הסיסמה שגויה";
      break;
    case "auth/invalid-email":
      message = "כתובת האימייל אינה תקינה";
      break;
    case "auth/too-many-requests":
      message = "יותר מדי ניסיונות כושלים. נסה שוב מאוחר יותר.";
      break;
    default:
      message = "שגיאה בהתחברות: " + error.message;
  }

  setErrorMessage(message);
}
 finally {
    setLoading(false);
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
