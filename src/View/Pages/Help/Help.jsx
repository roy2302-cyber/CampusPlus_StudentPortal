import React from 'react';
import styles from './Help.module.css';

export default function Help() {
  return (
    <div className={styles.helpContainer}>
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}> עזרה 📘</h1>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>שאלות נפוצות</h2>
        <ul className={styles.faqList}>
        <li><a href="#">איך מצטרפים לקורסים?</a></li>
        <li><a href="#">כיצד משתפים סיכומים עם אחרים?</a></li>
        <li><a href="#">האם אפשר לערוך מסמך אחרי שמירה?</a></li>
        </ul>

      </section>
    </div>
  );
}
