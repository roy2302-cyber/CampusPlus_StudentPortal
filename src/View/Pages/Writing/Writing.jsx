import { useState } from 'react';
import styles from './Writing.module.css';

export default function Writing() {
  const [documents, setDocuments] = useState([]);
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSave = () => {
    if (!title.trim() || !text.trim()) return;
    const newDoc = {
      id: Date.now().toString(),
      topic: title,
      content: text,
    };
    setDocuments([newDoc, ...documents]);
    setTitle('');
    setText('');
    setSuccessMessage('המסמך נשמר בהצלחה!');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const handleDelete = (docId) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
  };

  return (
    <div className={styles.writingContainer}>
      <h1 className={styles.pageTitleBlue}>כתיבה אקדמית 📝</h1>
      <input
        type="text"
        placeholder="נושא"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={styles.topicInput}
      />
      <textarea
        className={styles.textArea}
        placeholder="התחל לכתוב כאן..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>
      <button onClick={handleSave} className={styles.saveButton}>שמור מסמך</button>
      {successMessage && <p className={styles.successMessage}>{successMessage}</p>}

      <h2 className={styles.savedTitle}>המסמכים שלי</h2>
      <ul className={styles.savedList}>
        {documents.map((doc) => (
          <li key={doc.id} className={styles.documentItem}>
            <strong>{doc.topic}</strong>
            <p>{doc.content}</p>
            <button onClick={() => handleDelete(doc.id)} className={styles.deleteButton}>מחק</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
