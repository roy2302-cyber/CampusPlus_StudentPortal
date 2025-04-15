import React from 'react';
import styles from './Settings.module.css';

export default function Settings() {
  return (
    <div className={styles.settingsContainer}>
      <h1 className={styles.pageTitle}> הגדרות ⚙️</h1>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
        <div>
      <h2 className={styles.sectionTitle}>הגדרות פרטים</h2>
      <p className={styles.sectionDescription}>
       עדכון פרטים אישיים<br />שינוי סיסמה
      </p>
      </div>

          <div className={styles.sectionButtons}>
            <button className={styles.button}>ערוך פרטים</button>
            <button className={styles.button}>שנה סיסמה</button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>התראות</h2>
        <div className={styles.checkboxGroup}>
          <label><input type="checkbox" /> התראות במייל</label>
          <label><input type="checkbox" /> התראות ב-SMS</label>
          <label><input type="checkbox" /> התראות בטלפון</label>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>הגדרות פרטיות</h2>
        <div className={styles.checkboxGroup}>
          <label><input type="checkbox" /> הגבלת צפייה בפרופיל</label>
          <label><input type="checkbox" /> הסכמה לשיתוף מידע</label>
        </div>
      </section>
    </div>
  );
}
