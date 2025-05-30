import { useState, useEffect } from 'react';
import styles from './Community.module.css';

export default function Community({ currentUser }) {
  const [questions, setQuestions] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [answerInputs, setAnswerInputs] = useState({});
  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [answerErrors, setAnswerErrors] = useState({});
  const [answerSuccess, setAnswerSuccess] = useState({});

  const getDisplayName = (uid, fallback) => fallback;

  const handleAddQuestion = () => {
    if (!title.trim()) {
      setTitleError("יש למלא כותרת שאלה.");
      setTimeout(() => setTitleError(""), 2000);
      return;
    }
    if (!content.trim()) {
      setContentError("יש למלא תוכן שאלה.");
      setTimeout(() => setContentError(""), 2000);
      return;
    }

    const newQuestion = {
      id: Date.now().toString(),
      title,
      content,
      author: currentUser?.displayName || "משתמש",
      authorId: currentUser?.uid || 'demo',
      likes: [],
      answers: []
    };

    setQuestions(prev => [...prev, newQuestion]);
    setTitle("");
    setContent("");
    setSuccessMessage("השאלה פורסמה בהצלחה!");
    setTimeout(() => setSuccessMessage(""), 2000);
  };

  const handleAddAnswer = (questionId, index) => {
    const answerText = answerInputs[index];
    if (!answerText || !answerText.trim()) {
      setAnswerErrors(prev => ({ ...prev, [index]: "יש להזין תגובה." }));
      setAnswerSuccess(prev => ({ ...prev, [index]: "" }));
      return;
    }

    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId
          ? { ...q, answers: [...q.answers, { text: answerText, author: currentUser?.displayName || 'משתמש', authorId: currentUser?.uid || 'demo' }] }
          : q
      )
    );

    setAnswerInputs(prev => ({ ...prev, [index]: "" }));
    setAnswerErrors(prev => ({ ...prev, [index]: "" }));
    setAnswerSuccess(prev => ({ ...prev, [index]: "התגובה פורסמה בהצלחה!" }));
    setTimeout(() => setAnswerSuccess(prev => ({ ...prev, [index]: "" })), 2000);
  };

  const handleLikeToggle = (questionId, likesArray) => {
    const userId = currentUser?.uid || 'demo';
    setQuestions(prev =>
      prev.map(q => {
        if (q.id === questionId) {
          const alreadyLiked = q.likes.includes(userId);
          return {
            ...q,
            likes: alreadyLiked ? q.likes.filter(id => id !== userId) : [...q.likes, userId]
          };
        }
        return q;
      })
    );
  };

  const handleDeleteQuestion = (questionId) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const handleDeleteAnswer = (questionId, answerIndex) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id === questionId) {
          const updatedAnswers = [...q.answers];
          updatedAnswers.splice(answerIndex, 1);
          return { ...q, answers: updatedAnswers };
        }
        return q;
      })
    );
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
        {titleError && <p className={styles.errorMessage}>{titleError}</p>}
        {contentError && <p className={styles.errorMessage}>{contentError}</p>}
        <button onClick={handleAddQuestion} className={styles.submitButton}>פרסם</button>
        {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
      </div>

      <div className={styles.questionList}>
        {questions.map((q, index) => (
          <div key={q.id} className={styles.questionItem}>
            <div className={styles.questionHeader}>
              <div className={styles.questionMeta}>
                <span className={styles.questionLabel}>שאלה מאת:</span>
                <span className={styles.questionAuthor}>{getDisplayName(q.authorId, q.author)}</span>
              </div>
              <button onClick={() => handleDeleteQuestion(q.id)} className={styles.deleteButton}>מחק שאלה</button>
            </div>

            <div className={styles.questionTitleRow}>
              <div style={{ flexGrow: 1 }}>
                <span className={styles.questionLabelTitle}>נושא השאלה:</span>
                <h2 className={styles.questionHeading}>{q.title}</h2>

                <span className={styles.questionLabelContent}>תוכן השאלה:</span>
                <p className={styles.questionContent}>{q.content}</p>
              </div>

              <button onClick={() => handleLikeToggle(q.id, q.likes)} className={styles.likeButton}>
                👍 {q.likes?.length || 0}
              </button>
            </div>

            {Array.isArray(q.answers) && q.answers.length > 0 && (
              <div className={styles.answersSection}>
                <strong className={styles.answersTitle}>תגובות:</strong>
                <ul className={styles.answersList}>
                  {q.answers.map((a, i) => (
                    <li key={i} className={styles.answerItem}>
                      <div className={styles.answerHeader}>
                        <span className={styles.answerAuthor}>
                          תגובה מאת: <strong>{getDisplayName(a.authorId, a.author)}</strong>
                        </span>
                        <button onClick={() => handleDeleteAnswer(q.id, i)} className={styles.deleteButton}>מחק תגובה</button>
                      </div>
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
            {answerErrors[index] && <p className={styles.errorMessage}>{answerErrors[index]}</p>}
            {answerSuccess[index] && <p className={styles.successMessage}>{answerSuccess[index]}</p>}
            <button onClick={() => handleAddAnswer(q.id, index)} className={styles.submitButton}>הגב</button>
          </div>
        ))}
      </div>
    </div>
  );
}
