import React, { useState } from 'react';
import styles from './Community.module.css';

export default function Community({ currentUser = "רוי ירוחם" }) {
  const [questions, setQuestions] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [answerInputs, setAnswerInputs] = useState({});

  const handleAddQuestion = () => {
    if (title.trim() && content.trim()) {
      const newQuestion = {
        title,
        content,
        author: currentUser,
        answers: []
      };
      setQuestions([newQuestion, ...questions]);
      setTitle("");
      setContent("");
    }
  };

  const handleAddAnswer = (index) => {
    const answerText = answerInputs[index];
    if (!answerText || !answerText.trim()) return;
    const updated = [...questions];
    updated[index].answers.push({ text: answerText, author: currentUser });
    setQuestions(updated);
    setAnswerInputs({ ...answerInputs, [index]: "" });
  };

  return (
    <div className={styles.communityContainer}>
      <h1 className={styles.communityTitle}> קהילת למידה 👥</h1>
      <p className={styles.communitySubtitle}>שאל שאלות, הגב והשתתף בדיונים.</p>

      <div className={styles.questionForm}>
        <input
          type="text"
          placeholder="כותרת שאלה"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.questionInput}
        />
        <textarea
          placeholder="תוכן השאלה..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={styles.questionTextarea}
        ></textarea>
        <button onClick={handleAddQuestion} className={styles.submitButton}>פרסם</button>
      </div>

      <div className={styles.questionList}>
        {questions.map((q, index) => (
          <div key={index} className={styles.questionItem}>
            <div className={styles.questionHeader}>
              <div className={styles.questionMeta}>
                <span className={styles.questionLabel}>שאלה מאת:</span>
                <span className={styles.questionAuthor}>{q.author}</span>
                <span className={styles.questionBullet}></span>
              </div>
              <h2 className={styles.questionHeading}>{q.title}</h2>
            </div>

            <p className={styles.questionContent}>{q.content}</p>

            {q.answers.length > 0 && (
              <div className={styles.answersSection}>
                <strong className={styles.answersTitle}>תגובות:</strong>
                <ul className={styles.answersList}>
                  {q.answers.map((a, i) => (
                    <li key={i} className={styles.answerItem}>
                      <span className={styles.answerAuthor}>תגובה מאת: <strong>{a.author}</strong></span><br />
                      <span className={styles.answerText}>{a.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <textarea
              placeholder="כתוב תגובה..."
              value={answerInputs[index] || ""}
              onChange={(e) => setAnswerInputs({ ...answerInputs, [index]: e.target.value })}
              className={styles.answerTextarea}
            ></textarea>
            <button onClick={() => handleAddAnswer(index)} className={styles.submitButton}>
              הגב
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
