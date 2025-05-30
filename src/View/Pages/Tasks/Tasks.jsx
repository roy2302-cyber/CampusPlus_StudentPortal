import { useState, useEffect } from 'react';
import styles from './Tasks.module.css';
import { db, auth } from "../../../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  updateDoc
} from 'firebase/firestore';

export default function Tasks() {
  const user = auth.currentUser;
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "tasks"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(data);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddTask = async () => {
    if (!newTask.trim()) {
      setError("יש להזין שם למשימה");
      setTimeout(() => setError(""), 2000);
      return;
    }

    if (!dueDate.trim()) {
      setError("יש לבחור תאריך יעד");
      setTimeout(() => setError(""), 2000);
      return;
    }

    const today = new Date();
    const selectedDate = new Date(dueDate);
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError("לא ניתן לבחור תאריך מהעבר");
      setTimeout(() => setError(""), 2000);
      return;
    }

    try {
      const formattedDate = formatDate(dueDate);
      await addDoc(collection(db, "tasks"), {
        text: newTask,
        due: formattedDate,
        done: false,
        userId: auth.currentUser.uid,
        createdAt: new Date()
      });

      setSuccessMessage("המשימה נוספה בהצלחה!");
      setTimeout(() => setSuccessMessage(""), 2000);
      setNewTask("");
      setDueDate("");
    } catch (err) {
      console.error("שגיאה בהוספת משימה:", err);
      setError("אירעה שגיאה בשמירה");
      setTimeout(() => setError(""), 2000);
    }
  };

  const toggleTaskDone = async (taskId, currentStatus) => {
    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, {
        done: !currentStatus
      });
    } catch (err) {
      console.error("שגיאה בעדכון סטטוס משימה:", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
    } catch (err) {
      console.error("שגיאה במחיקת משימה:", err);
    }
  };

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const getDaysLeft = (dueStr) => {
    const [day, month, year] = dueStr.split("/").map(Number);
    const dueDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className={styles.tasksContainer}>
      <h1 className={styles.tasksTitle}>מעקב משימות ✅</h1>
      <p className={styles.tasksSubtitle}>נהל את כל המטלות שלך במקום אחד</p>

      <div className={styles.taskBox}>
        <label className={styles.inputLabel}>משימה חדשה:</label>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="משימה חדשה"
          className={styles.taskInput}
        />

        <label className={styles.inputLabel}>תאריך יעד:</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={styles.dateInput}
        />

        {error && <p className={styles.errorMessage}>{error}</p>}
        {successMessage && <p className={styles.successMessage}>{successMessage}</p>}

        <button onClick={handleAddTask} className={styles.addButton}>
          הוסף
        </button>
      </div>

      <h2 className={styles.taskSectionTitle}>המשימות שלי</h2>
      <ul className={styles.taskList}>
        {tasks.map((task) => (
          <li key={task.id} className={task.done ? styles.taskDone : styles.task}>
  <div className={styles.taskContent}>
  <div className={styles.taskInfo}>
    <input
      type="checkbox"
      checked={task.done}
      onChange={() => toggleTaskDone(task.id, task.done)}
    />
    <span className={styles.taskText}>
      {task.text}
      <span className={styles.daysLeft}>({getDaysLeft(task.due)} ימים נותרו)</span>
    </span>
  </div>

  <div className={styles.taskRight}>
    <span className={styles.taskDate}>עד {task.due}</span>
    <button
      onClick={() => handleDeleteTask(task.id)}
      className={styles.deleteButton}
    >
      מחק
    </button>
  </div>
</div>

</li>


        ))}
      </ul>
    </div>
  );
}
