import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className={styles.homeContainer}>
      <h1 className={styles.welcomeTitle}> ברוכים הבאים למערכת קמפוס+ 🎓</h1>
      <p className={styles.welcomeSubtitle}>
        המערכת שתעזור לך להתנהל בקלות במהלך הלימודים: גישה לסיכומים, מעקב משימות, קהילה, ניהול אישי ועוד.
      </p>

      <div className={styles.gridContainer}>

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
