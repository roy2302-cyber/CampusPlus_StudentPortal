import React, { useEffect, useState } from 'react';
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
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/users.json')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.includes(search) || user.email.includes(search)
  );

  const kpiData = [
    { name: 'משתמשים פעילים', value: 135 },
    { name: 'סיכומים שהועלו', value: 45 },
    { name: 'משימות פתוחות', value: 30 },
    { name: 'שאלות בקהילה', value: 18 },
  ];

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <h1 className={styles.adminTitle}> ניהול משתמשים 🛠️</h1>
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
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user, index) => (
            <tr key={index}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td className={styles.active}>{user.active ? 'פעיל' : 'לא פעיל'}</td>
              <td>
                <button className={styles.edit}>ערוך</button>
                <button className={styles.delete}>מחק</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.chartSection}>
        <h2 className={styles.chartTitle}>נתוני ניהול כלליים 📊</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={kpiData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
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
