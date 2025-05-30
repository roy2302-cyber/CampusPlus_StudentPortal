<<<<<<< HEAD
import { useState } from "react";
import styles from './Dashboard.module.css';
=======
import { useEffect, useState } from "react";
import styles from './Dashboard.module.css';
import { db } from '../../../firebase';
import {
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

>>>>>>> 74af6948e33a77384475732cde0e72eb7630115f
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from 'recharts';

<<<<<<< HEAD
export default function Dashboard() {
  const [stats] = useState({
    tasks: 4,
    summaries: 3,
    posts: 5,
    documents: 2,
  });

=======
export default function Dashboard({ user }) {
  const [stats, setStats] = useState({
    tasks: 0,
    summaries: 0,
    posts: 0,
    documents: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const uid = user?.uid;
      if (!uid) return;

      try {

        const tasksSnap = await getDocs(query(
          collection(db, 'tasks'),
          where('userId', '==', uid),
          where('done', '==', true)
        ));


        const summariesSnap = await getDocs(query(
          collection(db, 'summaries'),
          where('uploader', '==', uid)
        ));


        const postsSnap = await getDocs(query(
          collection(db, 'questions'),
          where('authorId', '==', uid)
        ));


        const documentsSnap = await getDocs(query(
          collection(db, 'documents'),
          where('authorId', '==', uid)
        ));

        setStats({
          tasks: tasksSnap.size,
          summaries: summariesSnap.size,
          posts: postsSnap.size,
          documents: documentsSnap.size
        });
      } catch (error) {
        console.error('שגיאה בטעינת נתוני דשבורד:', error);
      }
    };

    fetchStats();
  }, [user]);

>>>>>>> 74af6948e33a77384475732cde0e72eb7630115f
  const kpiData = [
    { name: 'משימות שהושלמו', value: stats.tasks },
    { name: 'סיכומים שהועלו', value: stats.summaries },
    { name: 'שיתופים בקהילה', value: stats.posts },
    { name: 'כתיבה אקדמית', value: stats.documents },
  ];

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}> דשבורד סטודנט 📊</h1>
      </div>

      <div className={styles.statGrid}>
<<<<<<< HEAD
        <div className={styles.statCard}><p className={styles.statLabel}>משימות שהושלמו</p><p className={`${styles.statValue} ${styles.green}`}>{stats.tasks}</p></div>
        <div className={styles.statCard}><p className={styles.statLabel}>סיכומים שהועלו</p><p className={`${styles.statValue} ${styles.blue}`}>{stats.summaries}</p></div>
        <div className={styles.statCard}><p className={styles.statLabel}>שיתופים בקהילה</p><p className={`${styles.statValue} ${styles.purple}`}>{stats.posts}</p></div>
        <div className={styles.statCard}><p className={styles.statLabel}>כתיבה/מסמכים אקדמיים</p><p className={`${styles.statValue} ${styles.orange}`}>{stats.documents}</p></div>
=======
        <div className={styles.statCard}>
          <p className={styles.statLabel}>משימות שהושלמו</p>
          <p className={`${styles.statValue} ${styles.green}`}>{stats.tasks}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>סיכומים שהועלו</p>
          <p className={`${styles.statValue} ${styles.blue}`}>{stats.summaries}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>שיתופים בקהילה</p>
          <p className={`${styles.statValue} ${styles.purple}`}>{stats.posts}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>כתיבה/מסמכים אקדמיים</p>
          <p className={`${styles.statValue} ${styles.orange}`}>{stats.documents}</p>
        </div>
>>>>>>> 74af6948e33a77384475732cde0e72eb7630115f
      </div>

      <div className={styles.chartSection}>
        <h2 className={styles.chartTitle}>גרף התקדמות</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={kpiData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 18, textAnchor: 'start', direction: 'rtl' }}
              width={150}
            />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 74af6948e33a77384475732cde0e72eb7630115f
