import { useState } from 'react';
import styles from './Tasks.module.css';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleAddTask = () => {
    if (!newTask.trim()) {
      setError('יש להזין שם למשימה');
      setTimeout(() => setError(''), 2000);
      return;
    }

    if (!dueDate) {
      setError('יש לבחור תאריך יעד');
      setTimeout(() => setError(''), 2000);
      return;
    }

    const today = new Date();
    const selected = new Date(dueDate);
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);

    if (selected < today) {
      setError('לא ניתן לבחור תאריך מהעבר');
      setTimeout(() => setError(''), 2000);
      return;
    }

    const newTaskObj = {
      id: Date.now(),
      text: newTask,
      due: formatDate(dueDate),
      done: false,
    };

    setTasks([...tasks, newTaskObj]);
    setSuccessMessage('המשימה נוספה בהצלחה!');
    setTimeout(() => setSuccessMessage(''), 2000);
    setNewTask('');
    setDueDate('');
  };

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const getDaysLeft = (dueStr) => {
    const [day, month, year] = dueStr.split('/').map(Number);
    const due = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = due - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const toggleDone = (taskId) => {
    setTasks(tasks.map((task) =>
      task.id === taskId ? { ...task, done: !task.done } : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  return (
    <div className={styles.tasksContainer}>
      <h1 className={styles.tasksTitle}>מעקב משימות</h1>
      <p className={styles.tasksSubtitle}>נהל את כל המטלות שלך במקום אחד</p>

      <div className={styles.taskBox}>
        <label className={styles.inputLabel}>משימה חדשה:</label>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className={styles.taskInput}
          placeholder="לדוגמה: סיים עבודה בקורס"
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
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleDone(task.id)}
              />
              <span className={styles.taskText}>
                {task.text} ({getDaysLeft(task.due)} ימים נותרו)
              </span>
              <span className={styles.taskDate}>עד {task.due}</span>
              <button onClick={() => deleteTask(task.id)} className={styles.deleteButton}>
                מחק
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}