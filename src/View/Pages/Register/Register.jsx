import React, { useState } from 'react';
import styles from './Register.module.css';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db} from "../../../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
 

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

 const handleRegister = async () => {
  setErrorMessage("");
  setSuccessMessage("");

  if (!fullName || !email || !password || !confirmPassword) {
    setErrorMessage("נא למלא את כל השדות");
    return;
  }

  if (password !== confirmPassword) {
    setErrorMessage("אישור הסיסמה לא תואם");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // עדכון השם בפרופיל
    await updateProfile(userCredential.user, {
      displayName: fullName
    });

    // שמירת המשתמש במסד הנתונים
    await setDoc(doc(db, "users", userCredential.user.uid), {
      displayName: fullName,
      email: email,
      createdAt: serverTimestamp()
    });

    setSuccessMessage("נרשמת בהצלחה! כעת תוכל להתחבר");
    setTimeout(() => navigate("/"), 1500);
  } catch (error) {
    setErrorMessage("שגיאה ברישום: " + error.message);
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
