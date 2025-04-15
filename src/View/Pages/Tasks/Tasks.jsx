import React, { useState } from 'react';
import styles from './Tasks.module.css';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleAddTask = () => {
    if (newTask.trim() && dueDate.trim()) {
      const formattedDate = formatDate(dueDate);
      setTasks([...tasks, { text: newTask, due: formattedDate, done: false }]);
      setNewTask("");
      setDueDate("");
    }
  };

  const toggleTask = (index) => {
    const updated = [...tasks];
    updated[index].done = !updated[index].done;
    setTasks(updated);
  };

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className={styles.tasksContainer}>
      <h1 className={styles.tasksTitle}> מעקב משימות ✅</h1>
      <p className={styles.tasksSubtitle}>נהל את כל המטלות שלך במקום אחד</p>

      <div className={styles.taskBox}>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="משימה חדשה"
          className={styles.taskInput}
        />

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={styles.dateInput}
        />

        <button onClick={handleAddTask} className={styles.addButton}>
          הוסף
        </button>
      </div>

      <ul className={styles.taskList}>
        {tasks.map((task, index) => (
          <li
            key={index}
            onClick={() => toggleTask(index)}
            className={task.done ? styles.taskDone : styles.task}
          >
            <div className={styles.taskContent}>
              <span className={styles.taskText}>{task.text}</span>
              <span className={styles.taskDate}>עד {task.due}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}