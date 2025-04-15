import React, { useState } from 'react';
import styles from './Writing.module.css';

export default function Writing({ currentUser = "רוי ירוחם" }) {
  const [documents, setDocuments] = useState([]);
  const [text, setText] = useState("");
  const [title, setTitle] = useState(""); 

  const handleSave = () => {
    if (!text.trim()) return;
    const date = new Date().toLocaleDateString('he-IL');
    const newDoc = {
      content: text,
      date,
      topic: title || "ללא נושא"
    };
    setDocuments([newDoc, ...documents]);
    setText("");
    setTitle(""); 
  };

  return (
    <div className={styles.writingContainer}>
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitleBlue}>  כתיבה אקדמית 📝</h1>
        <p className={styles.pageSubtitle}>צור מסמך חדש, שמור טיוטות ושתף עם אחרים.</p>
      </div>

      <input
        type="text"
        placeholder="נושא"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={styles.topicInput}
      />

      <textarea
        className={styles.textArea}
        placeholder= "התחל לכתוב כאן..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>

      <div className={styles.buttonWrapper}>
        <button className={styles.saveButton} onClick={handleSave}>
          שמור מסמך
        </button>
      </div>

      <div className={styles.savedDocuments}>
        {documents.map((doc, index) => (
          <div key={index} className={styles.documentItem}>
            <strong className={styles.documentMeta}>
              טיוטה נשמרה ב-{doc.date} | נושא: <span className={styles.documentTopic}>{doc.topic}</span>
            </strong>
            <p className={styles.documentContent}>{doc.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
