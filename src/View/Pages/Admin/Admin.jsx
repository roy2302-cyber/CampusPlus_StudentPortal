import { useEffect, useState } from 'react';
import styles from './Admin.module.css';
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../../../firebase';

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
  const [editingUserId, setEditingUserId] = useState(null);
  const [editData, setEditData] = useState({});
  const [kpi, setKpi] = useState({
    activeUsers: 0,
    registeredUsers: 0,
    summaries: 0,
    tasks: 0,
    questions: 0
  });

  const fetchAllData = async () => {
    const snapshot = await getDocs(collection(db, 'users'));
const data = await Promise.all(
  snapshot.docs.map(async docSnap => {
    const userData = docSnap.data();
    const userId = docSnap.id;


    if (userData.removed) return null;

    const settingsSnap = await getDoc(doc(db, 'userSettings', userId));
    const settingsData = settingsSnap.exists() ? settingsSnap.data() : {};

    return {
      id: userId,
      ...userData,
      profileVisibility: settingsData.profileVisibility || false
    };
  })
);


const filtered = data.filter(u => u !== null);
const active = filtered.filter(u => u.active).length;
const total = filtered.length;
setUsers(filtered);

    

    setKpi(prev => ({
      ...prev,
      activeUsers: active,
      registeredUsers: total
    }));

    const summariesSnap = await getDocs(collection(db, 'summaries'));
    setKpi(prev => ({
      ...prev,
      summaries: summariesSnap.size
    }));

    const tasksSnap = await getDocs(collection(db, 'tasks'));
    const openTasks = tasksSnap.docs.filter(doc => doc.data().done === false).length;
    setKpi(prev => ({
      ...prev,
      tasks: openTasks
    }));

    const questionsSnap = await getDocs(collection(db, 'questions'));
    setKpi(prev => ({
      ...prev,
      questions: questionsSnap.size
    }));
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const filteredUsers = users.filter(user =>
    (user.displayName || '').toLowerCase().includes(search.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const kpiData = [
    { name: 'משתמשים רשומים', value: kpi.registeredUsers },
    { name: 'משתמשים פעילים', value: kpi.activeUsers },
    { name: 'סיכומים שהועלו', value: kpi.summaries },
    { name: 'משימות פתוחות', value: kpi.tasks },
    { name: 'שאלות בקהילה', value: kpi.questions },
  ];

  const startEdit = (user) => {
    setEditingUserId(user.id);
    setEditData({
      displayName: user.displayName || '',
      email: user.email || '',
      active: user.active || false,
      isAdmin: user.isAdmin || false
    });
  };

  const saveEdit = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, editData);
      setEditingUserId(null);
      await fetchAllData();
    } catch (err) {
      console.error('שגיאה בעדכון:', err);
    }
  };

  const deleteUser = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      removed: true,
      active: false
    });


    await fetchAllData();
  } catch (err) {
    console.error('שגיאה בסימון המשתמש כ־removed:', err);
    alert("שגיאה בעדכון סטטוס המשתמש: " + err.message);
  }
};


  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>ניהול משתמשים 🛠️</h1>
      </div>

      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>משתמשים רשומים</p>
          <p className={`${styles.statValue} ${styles.gray}`}>{users.length}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>משתמשים פעילים</p>
          <p className={`${styles.statValue} ${styles.green}`}>{kpi.activeUsers}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>סיכומים שהועלו</p>
          <p className={`${styles.statValue} ${styles.blue}`}>{kpi.summaries}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>משימות פתוחות</p>
          <p className={`${styles.statValue} ${styles.red}`}>{kpi.tasks}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>שיתופים בקהילה</p>
          <p className={`${styles.statValue} ${styles.purple}`}>{kpi.questions}</p>
        </div>
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
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => {
            const isCurrentUser = user.id === auth.currentUser?.uid;

            return (
              <tr key={user.id}>
                <td>
                  {editingUserId === user.id ? (
                    <input
                      value={editData.displayName}
                      onChange={(e) =>
                        setEditData({ ...editData, displayName: e.target.value })
                      }
                      disabled={isCurrentUser} 
                    />
                  ) : (
                    <>
                      {user.displayName || '---'}
                      {user.profileVisibility && (
                        <span className={styles.privateIndicator}> פרופיל מוגבל</span>
                      )}
                    </>
                  )}
                </td>

                <td>
                  {editingUserId === user.id ? (
                    <input
                      value={editData.email}
                      onChange={(e) =>
                        setEditData({ ...editData, email: e.target.value })
                      }
                      disabled={isCurrentUser}
                    />
                  ) : (
                    user.email || '---'
                  )}
                </td>

                <td>
                  {editingUserId === user.id ? (
                    <select
                      value={editData.active ? 'true' : 'false'}
                      onChange={(e) =>
                        setEditData({ ...editData, active: e.target.value === 'true' })
                      }
                      disabled={isCurrentUser} 
                    >
                      <option value="true">פעיל</option>
                      <option value="false">לא פעיל</option>
                    </select>
                  ) : (
                    user.active ? 'פעיל' : 'לא פעיל'
                  )}
                </td>

                <td>
                  {editingUserId === user.id ? (
                    <select
                      value={editData.isAdmin ? 'true' : 'false'}
                      onChange={(e) =>
                        setEditData({ ...editData, isAdmin: e.target.value === 'true' })
                      }
                      disabled={isCurrentUser} 
                    >
                      <option value="true">כן</option>
                      <option value="false">לא</option>
                    </select>
                  ) : (
                    user.isAdmin ? 'כן' : 'לא'
                  )}
                </td>

                <td>
                  {editingUserId === user.id ? (
                    <>
                      <button
                        className={styles.save}
                        onClick={() => saveEdit(user.id)}
                        disabled={isCurrentUser}
                      >
                        שמור
                      </button>
                      <button
                        className={styles.cancel}
                        onClick={() => setEditingUserId(null)}
                      >
                        בטל
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className={styles.edit}
                        onClick={() => {
                          if (isCurrentUser) {
                            alert(" אינך יכול לערוך את עצמך מתוך ממשק הניהול.");
                            return;
                          }
                          startEdit(user);
                        }}
                      >
                        ערוך
                      </button>

                      <button
                        className={styles.delete}
                        onClick={() => {
                          if (isCurrentUser) {
                            alert(" אינך יכול למחוק את המשתמש שאתה מחובר אליו כרגע.");
                            return;
                          }
                          deleteUser(user.id);
                        }}
                      >
                        מחק
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
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
