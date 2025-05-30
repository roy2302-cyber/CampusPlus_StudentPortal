<<<<<<< HEAD
import { useEffect } from 'react';
=======
>>>>>>> 74af6948e33a77384475732cde0e72eb7630115f
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

export default function Home() {
  const navigate = useNavigate();

<<<<<<< HEAD

  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) {
      navigate("/");
    }
  }, []);

  return (
    <div className={styles.homeContainer}>
      <h1 className={styles.welcomeTitle}>ברוכים הבאים למערכת קמפוס+ 🎓</h1>
=======
  return (
    <div className={styles.homeContainer}>
      <h1 className={styles.welcomeTitle}> ברוכים הבאים למערכת קמפוס+ 🎓</h1>
>>>>>>> 74af6948e33a77384475732cde0e72eb7630115f
      <p className={styles.welcomeSubtitle}>
        המערכת שתעזור לך להתנהל בקלות במהלך הלימודים: גישה לסיכומים, מעקב משימות, קהילה, ניהול אישי ועוד.
      </p>

      <div className={styles.gridContainer}>
<<<<<<< HEAD
        <button onClick={() => navigate('/tasks')} className={styles.card}>
          <h3 className={styles.cardTitle}>מעקב משימות ✅</h3>
          <p className={styles.cardText}>נהל את המשימות והדד-ליינים שלך.</p>
        </button>

        <button onClick={() => navigate('/summaries')} className={styles.card}>
          <h3 className={styles.cardTitle}>אוסף סיכומים 📚</h3>
          <p className={styles.cardText}>מצא, העלה וחפש סיכומים לכל הקורסים שלך.</p>
        </button>

        <button onClick={() => navigate('/community')} className={styles.card}>
          <h3 className={styles.cardTitle}>קהילת למידה 👥</h3>
          <p className={styles.cardText}>הצטרף לשיח אקדמי והחלף ידע עם אחרים.</p>
        </button>

        <button onClick={() => navigate('/writing')} className={styles.card}>
          <h3 className={styles.cardTitle}>כתיבה אקדמית 📝</h3>
          <p className={styles.cardText}>צור ושתף מסמכים עם סטודנטים אחרים.</p>
        </button>
      </div>
    </div>
  );
}
=======

        <button onClick={() => navigate('/tasks')} className={styles.card}>
          <h3 className={styles.cardTitle}> מעקב משימות ✅</h3>
          <p className={styles.cardText}>נהל את המשימות והדד-ליינים שלך.</p>
        </button>


        <button onClick={() => navigate('/summaries')} className={styles.card}>
          <h3 className={styles.cardTitle}> אוסף סיכומים 📚</h3>
          <p className={styles.cardText}>מצא, העלה וחפש סיכומים לכל הקורסים שלך.</p>
        </button>


        <button onClick={() => navigate('/community')} className={styles.card}>
          <h3 className={styles.cardTitle}> קהילת למידה 👥</h3>
          <p className={styles.cardText}>הצטרף לשיח אקדמי והחלף ידע עם אחרים.</p>
        </button>


        <button onClick={() => navigate('/writing')} className={styles.card}>
          <h3 className={styles.cardTitle}> כתיבה אקדמית 📝</h3>
          <p className={styles.cardText}>צור ושתף מסמכים עם סטודנטים אחרים.</p>
        </button>

      
      </div>
    </div>
  );
}
>>>>>>> 74af6948e33a77384475732cde0e72eb7630115f
