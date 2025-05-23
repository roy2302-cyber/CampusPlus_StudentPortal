import { useEffect, useState } from 'react';
import styles from './Settings.module.css';
import { db, auth } from '../../../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { functions } from '../../../firebase';
import { httpsCallable } from 'firebase/functions';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword
} from 'firebase/auth';

export default function Settings({ currentUser }) {
  const [settings, setSettings] = useState({
    emailNotifications: false,
    smsNotifications: false,
    profileVisibility: false,
    dataSharing: true
  });

  const [userDetails, setUserDetails] = useState({ fullName: '', email: '', phone: '' });
  const [editingDetails, setEditingDetails] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [checkboxFeedback, setCheckboxFeedback] = useState({});
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const sendEmailNotification = httpsCallable(functions, 'sendEmailNotification');
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, 'userSettings', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    };

    const fetchUserDetails = async () => {
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        setUserDetails({
          fullName: data.displayName || '',
          email: data.email || '',
          phone: data.phone || ''
        });
      }
    };

    if (uid) {
      fetchSettings();
      fetchUserDetails();
    }
  }, [uid]);

  const isStrongPassword = (password) => {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password);
  };

  const handleSaveAll = async () => {
    if (!userDetails.fullName.trim() || !userDetails.email.trim()) {
      setErrorMessage('נא למלא שם מלא ואימייל תקף');
      setTimeout(() => setErrorMessage(''), 2000);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userDetails.email)) {
      setErrorMessage('האימייל שגוי. נא להזין כתובת אימייל תקינה.');
      setTimeout(() => setErrorMessage(''), 2000);
      return;
    }

    if ((newPassword || confirmPassword) && (
      !currentPassword || newPassword !== confirmPassword || !isStrongPassword(newPassword)
    )) {
      setErrorMessage('וודא שכל שדות הסיסמה מולאו כהלכה.');
      setTimeout(() => setErrorMessage(''), 2000);
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updateEmail(auth.currentUser, userDetails.email);

      if (newPassword) {
        await updatePassword(auth.currentUser, newPassword);
      }

      await updateDoc(doc(db, 'users', uid), {
        displayName: userDetails.fullName,
        email: userDetails.email,
        phone: userDetails.phone,
      });

      setSuccessMessage('הפרטים עודכנו בהצלחה!');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      console.error('שגיאה בעדכון הפרטים:', err);
      setErrorMessage('שגיאה באימות או עדכון. ודא שהסיסמה נכונה. ייתכן ותצטרך להתחבר מחדש.');
      setTimeout(() => setErrorMessage(''), 2000);
    }
  };

  const handleChange = async (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);

    try {
      await setDoc(doc(db, 'userSettings', uid), updated);
      await setDoc(doc(db, 'users', uid), { settings: updated }, { merge: true });

      setCheckboxFeedback((prev) => ({ ...prev, [key]: 'ההגדרה נשמרה בהצלחה!' }));
      setTimeout(() => {
        setCheckboxFeedback((prev) => ({ ...prev, [key]: '' }));
      }, 2000);

      if (key === 'emailNotifications') {
        const rawEmail = userDetails.email?.trim();
        const isValidEmail = rawEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail);

        if (!isValidEmail) {
          console.warn("לא נשלח מייל - אימייל לא תקין:", rawEmail);
          return;
        }

        try {
          const result = await sendEmailNotification({
            to: rawEmail,
            subject: 'עדכון הגדרות מייל',
            html: `
              <div dir="rtl" style="text-align:right; font-family:Arial, sans-serif; line-height:1.6;">
                <p>שינית את ההגדרה להתראות במייל בקמפוס+</p>
                <p>בברכה,<br>צוות קמפוס+</p>
              </div>
            `,
          });
          console.log("📤 אימייל נשלח:", result);
        } catch (err) {
          console.error("שגיאה בשליחת מייל:", err.message || err);
        }
      }

      if (key === 'smsNotifications') {
        const rawPhone = userDetails.phone?.trim();
        const isValidPhone = rawPhone && /^(\+972|0)(5\d{8})$/.test(rawPhone);

        if (!isValidPhone) {
          console.warn("לא נשלח SMS - מספר לא תקין:", rawPhone);
          return;
        }

        try {
          const sendSms = httpsCallable(functions, 'sendSmsNotification');
          const result = await sendSms({
            to: rawPhone,
            message: 'ההגדרה להתראות ב-SMS עודכנה בהצלחה',
          });
          console.log("SMS נשלח:", result);
        } catch (err) {
          console.error("שגיאה בשליחת SMS על שינוי הגדרה:", err.message || err);
        }
      }
    } catch (err) {
      console.error("שגיאה בעדכון הגדרה:", err.message || err);
      setCheckboxFeedback((prev) => ({ ...prev, [key]: 'שגיאה בשמירה' }));
      setTimeout(() => {
        setCheckboxFeedback((prev) => ({ ...prev, [key]: '' }));
      }, 2000);
    }
  };

  return (
    <section className="settings-section">
      <div className={styles.settingsContainer}>
        <h1 className={styles.pageTitle}>הגדרות ⚙️</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>עדכון פרטי חשבון</h2>
          <p className={styles.sectionDescription}>
            עדכן את פרטי החשבון שלך, כולל שם, אימייל, טלפון וסיסמה
          </p>
          <button
            className={styles.button}
            onClick={() => setEditingDetails(!editingDetails)}
          >
            {editingDetails ? 'ביטול' : 'ערוך פרטים'}
          </button>

          {editingDetails && (
            <div className={styles.editDetails}>
              <div className={styles.formGroup}>
                <label>שם מלא:</label>
                <input
                  type="text"
                  value={userDetails.fullName}
                  onChange={(e) =>
                    setUserDetails({ ...userDetails, fullName: e.target.value })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label>אימייל:</label>
                <input
                  type="email"
                  value={userDetails.email}
                  onChange={(e) =>
                    setUserDetails({ ...userDetails, email: e.target.value })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label>מספר טלפון:</label>
                <input
                  type="tel"
                  value={userDetails.phone || ''}
                  onChange={(e) =>
                    setUserDetails({ ...userDetails, phone: e.target.value })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label>סיסמה נוכחית (נדרשת לעדכון):</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>סיסמה חדשה (לא חובה):</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>אימות סיסמה חדשה:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}
              {successMessage && (
                <p className={styles.successMessage}>{successMessage}</p>
              )}

              <button onClick={handleSaveAll} className={styles.saveDetailsBtn}>
                שמור פרטים
              </button>
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>התראות</h2>
          <div className={styles.checkboxGroup}>
            {['emailNotifications', 'smsNotifications'].map((key) => (
              <div key={key}>
                <label>
                  <input
                    type="checkbox"
                    checked={settings[key]}
                    onChange={() => handleChange(key)}
                  />{' '}
                  {key === 'emailNotifications'
                    ? 'התראות במייל'
                    : 'התראות ב-SMS'}
                </label>
                {checkboxFeedback[key] && (
                  <p className={styles.successText}>{checkboxFeedback[key]}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>הגדרות פרטיות</h2>
          <div className={styles.checkboxGroup}>
            {['profileVisibility', 'dataSharing'].map((key) => (
              <div key={key}>
                <label>
                  <input
                    type="checkbox"
                    checked={settings[key]}
                    onChange={() => handleChange(key)}
                  />{' '}
                  {key === 'profileVisibility'
                    ? 'הגבלת צפייה בפרופיל'
                    : 'הסכמה לשיתוף מידע'}
                </label>
                {checkboxFeedback[key] && (
                  <p className={styles.successText}>{checkboxFeedback[key]}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
