import { useState } from 'react';
import styles from './Settings.module.css';

export default function Settings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    profileVisibility: true,
    dataSharing: false
  });

  const [userDetails, setUserDetails] = useState({
    fullName: 'רוי ירוחם',
    email: 'roy@example.com',
    phone: '0501234567'
  });

  const [editingDetails, setEditingDetails] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setMessage('השינוי נשמר');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleSave = () => {
    if (!userDetails.fullName || !userDetails.email) {
      setMessage('נא למלא שם ואימייל');
      return;
    }
    setMessage('הפרטים נשמרו בהצלחה');
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div className={styles.settingsContainer}>
      <h1 className={styles.pageTitle}>הגדרות</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>עדכון פרטי חשבון</h2>
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
              <label>טלפון:</label>
              <input
                type="tel"
                value={userDetails.phone}
                onChange={(e) =>
                  setUserDetails({ ...userDetails, phone: e.target.value })
                }
              />
            </div>
            <div className={styles.formGroup}>
              <label>סיסמה נוכחית:</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>סיסמה חדשה:</label>
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
            <button className={styles.saveDetailsBtn} onClick={handleSave}>
              שמור פרטים
            </button>
            {message && <p className={styles.successText}>{message}</p>}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>התראות</h2>
        <div className={styles.checkboxGroup}>
          <label>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={() => toggleSetting('emailNotifications')}
            />
            {' '}התראות במייל
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.smsNotifications}
              onChange={() => toggleSetting('smsNotifications')}
            />
            {' '}התראות ב-SMS
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>הגדרות פרטיות</h2>
        <div className={styles.checkboxGroup}>
          <label>
            <input
              type="checkbox"
              checked={settings.profileVisibility}
              onChange={() => toggleSetting('profileVisibility')}
            />
            {' '}הגבלת צפייה בפרופיל
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.dataSharing}
              onChange={() => toggleSetting('dataSharing')}
            />
            {' '}שיתוף מידע
          </label>
        </div>
      </section>
    </div>
  );
}
