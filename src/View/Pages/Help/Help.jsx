import React, { useState } from 'react';
import styles from './Help.module.css';

const faqData = {
  favorites: {
    question: 'איך מוסיפים סיכום לרשימת המועדפים ואיפה מוצאים אותו?',
    answer: (
      <ol>
        <li>גש לעמוד "אוסף סיכומים"</li>
        <li>אתר את הסיכום שברצונך לשמור</li>
        <li>לחץ על אייקון הלב ❤️ שמופיע ליד הסיכום</li>
        <li>הסיכום יתווסף למועדפים שלך</li>
        <li>כדי לראות את כל הסיכומים ששמרת — לחץ על כפתור <strong>"מועדפים"</strong> בחלק העליון של העמוד</li>
      </ol>
    ),
  },
  academicShare: {
    question: 'איך משתפים מסמכים אקדמיים עם משתמשים אחרים?',
    answer: (
      <ol>
        <li>גש לעמוד "כתיבה אקדמית"</li>
        <li>צור מסמך חדש עם כותרת, תוכן או קובץ</li>
        <li>לחץ על כפתור <strong>"שתף מסמך"</strong> ליד המסמך שיצרת</li>
        <li>בחר מהרשימה את המשתמשים שתרצה לשתף איתם</li>
        <li>המסמך יהפוך לנגיש עבורם כשיתחברו למערכת</li>
      </ol>
    ),
  },
  edit: {
    question: 'האם אפשר לערוך מסמך אחרי שמירה?',
    answer: (
      <ol>
        <li>גש לעמוד "כתיבה אקדמית"</li>
        <li>אתר את המסמך שלך</li>
        <li>לחץ על <strong>"ערוך"</strong> ליד המסמך</li>
        <li>עדכן את הכותרת, התוכן או הקובץ</li>
        <li>לחץ על <strong>"שמור שינויים"</strong></li>
      </ol>
    ),
  },
};

export default function Help() {
  const [selectedFaq, setSelectedFaq] = useState(null);

  return (
    <div className={styles.helpContainer}>
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>עזרה 📘</h1>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>שאלות נפוצות</h2>
        <ul className={styles.faqList}>
          <li>
            <button onClick={() => setSelectedFaq('favorites')}>
              איך מוסיפים סיכום לרשימת המועדפים ואיפה מוצאים אותו?
            </button>
          </li>
          <li>
            <button onClick={() => setSelectedFaq('academicShare')}>
              איך משתפים מסמכים אקדמיים עם משתמשים אחרים?
            </button>
          </li>
          <li>
            <button onClick={() => setSelectedFaq('edit')}>
              האם אפשר לערוך מסמך אחרי שמירה?
            </button>
          </li>
        </ul>
      </section>

      {selectedFaq && (
        <div className={styles.modalOverlay} onClick={() => setSelectedFaq(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setSelectedFaq(null)}>✖</button>
            <h3>{faqData[selectedFaq].question}</h3>
            <div>{faqData[selectedFaq].answer}</div>
          </div>
        </div>
      )}
    </div>
  );
}
