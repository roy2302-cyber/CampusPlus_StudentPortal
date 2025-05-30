import { useState } from 'react';
import styles from './Admin.module.css';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from 'recharts';

export default function AdminDashboard() {
  const [search, setSearch] = useState('');

  const users = [
    { id: '1', displayName: 'רות כהן', email: 'ruth@example.com', active: true, isAdmin: false },
    { id: '2', displayName: 'דוד לוי', email: 'david@example.com', active: false, isAdmin: true },
    { id: '3', displayName: 'נועה ישראלי', email: 'noa@example.com', active: true, isAdmin: false }
  ];

  const filteredUsers = users.filter(user =>
    user.displayName.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const kpi = {
    activeUsers: 2,
    registeredUsers: 3,
    summaries: 7,
    tasks: 4,
    questions: 5
  };

  const kpiData = [
    { name: 'משתמשים רשומים', value: kpi.registeredUsers },
    { name: 'משתמשים פעילים', value: kpi.activeUsers },
    { name: 'סיכומים', value: kpi.summaries },
    { name: 'משימות', value: kpi.tasks },
    { name: 'שאלות', value: kpi.questions },
  ];

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>ניהול משתמשים 🛠️</h1>
      </div>

      <div className={styles.statGrid}>
        <div className={styles.statCard}><p className={styles.statLabel}>משתמשים רשומים</p><p className={styles.statValue}>{kpi.registeredUsers}</p></div>
        <div className={styles.statCard}><p className={styles.statLabel}>משתמשים פעילים</p><p className={styles.statValue}>{kpi.activeUsers}</p></div>
        <div className={styles.statCard}><p className={styles.statLabel}>סיכומים</p><p className={styles.statValue}>{kpi.summaries}</p></div>
        <div className={styles.statCard}><p className={styles.statLabel}>משימות</p><p className={styles.statValue}>{kpi.tasks}</p></div>
        <div className={styles.statCard}><p className={styles.statLabel}>שאלות</p><p className={styles.statValue}>{kpi.questions}</p></div>
      </div>

      <input
        type="text"
        placeholder="חפש לפי שם או מייל"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.searchBox}
      />

      <table className={styles.userTable}>
        <thead>
          <tr>
            <th>שם</th>
            <th>אימייל</th>
            <th>סטטוס</th>
            <th>מנהל</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.id}>
              <td>{user.displayName}</td>
              <td>{user.email}</td>
              <td>{user.active ? 'פעיל' : 'לא פעיל'}</td>
              <td>{user.isAdmin ? 'כן' : 'לא'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.chartSection}>
        <h2 className={styles.chartTitle}>נתוני ניהול כלליים 📊</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={kpiData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 16, direction: 'rtl', textAnchor: 'start' }}
              width={150}
            />
            <Tooltip />
            <Bar dataKey="value" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
