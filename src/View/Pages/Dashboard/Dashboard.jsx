import React from 'react';
import styles from './Dashboard.module.css';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from 'recharts';

const kpiData = [
  { name: 'משימות שהושלמו', value: 18 },
  { name: 'סיכומים שהועלו', value: 7 },
  { name: 'שיתופים בקהילה', value: 3 },
  { name: 'מסמכים אקדמיים', value: 4 },
];

export default function Dashboard() {
  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}> דשבורד סטודנט 📊</h1>
      </div>

      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>משימות שהושלמו</p>
          <p className={`${styles.statValue} ${styles.green}`}>18</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>סיכומים שהועלו</p>
          <p className={`${styles.statValue} ${styles.blue}`}>7</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>שיתופים בקהילה</p>
          <p className={`${styles.statValue} ${styles.purple}`}>3</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>מסמכים אקדמיים</p>
          <p className={`${styles.statValue} ${styles.orange}`}>4</p>
        </div>
      </div>

      <div className={styles.chartSection}>
        <h2 className={styles.chartTitle}>גרף התקדמות</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={kpiData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
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
}