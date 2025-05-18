import { useState, useEffect } from 'react';
import styles from './Community.module.css';
import {
  collection,
  addDoc,
  updateDoc,
  onSnapshot,
  doc,
  deleteDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { db, auth } from "../../../firebase";

export default function Community({ currentUser }) {
  const [questions, setQuestions] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [answerInputs, setAnswerInputs] = useState({});

  // ✅ useEffect - בפנים
 useEffect(() => {
  const unsub = onSnapshot(collection(db, "questions"), (snapshot) => {
    const fetchedQuestions = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        likes: data.likes || [],
        answers: data.answers || [],
        ...data
      };
    });
    setQuestions(fetchedQuestions);
  });

  return () => unsub();
}, []);


  const handleAddQuestion = async () => {
    if (title.trim() && content.trim()) {
      await addDoc(collection(db, "questions"), {
        title,
        content,
        author: currentUser,
        likes: [],
        answers: []
      });
      setTitle("");
      setContent("");
    }
  };

  const handleAddAnswer = async (questionId, index) => {
  const answerText = answerInputs[index];
  if (!answerText || !answerText.trim()) return;

  const questionRef = doc(db, "questions", questionId);
  await updateDoc(questionRef, {
    answers: arrayUnion({
      text: answerText,
      author: currentUser
    })
  });

  setAnswerInputs({ ...answerInputs, [index]: "" });
};


  const handleLikeToggle = async (questionId, likesArray) => {
    const userId = auth.currentUser.uid;
    const questionRef = doc(db, "questions", questionId);
    const alreadyLiked = likesArray.includes(userId);

    await updateDoc(questionRef, {
      likes: alreadyLiked ? arrayRemove(userId) : arrayUnion(userId)
    });
  };

  const handleDeleteQuestion = async (questionId) => {
    await deleteDoc(doc(db, "questions", questionId));
  };

  const handleDeleteAnswer = async (questionId, answerIndex) => {
  const question = questions.find(q => q.id === questionId);
  if (!question) return;

  const updatedAnswers = [...question.answers];
  updatedAnswers.splice(answerIndex, 1); 

  const questionRef = doc(db, "questions", questionId);
  await updateDoc(questionRef, {
    answers: updatedAnswers
  });
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
          <div key={q.id} className={styles.questionItem}>
            <div className={styles.questionHeader}>
              <div className={styles.questionMeta}>
                <span className={styles.questionLabel}>שאלה מאת:</span>
                <span className={styles.questionAuthor}>{q.author}</span>
              </div>

              {q.author === currentUser && (
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className={styles.deleteButton}
                >
                  מחק שאלה 🗑️
                </button>
              )}
            </div>

            <div className={styles.questionTitleRow}>
              <div style={{ flexGrow: 1 }}>
                <span className={styles.questionLabelTitle}>נושא השאלה:</span>
                <h2 className={styles.questionHeading}>{q.title}</h2>

                <span className={styles.questionLabelContent}>תוכן השאלה:</span>
                <p className={styles.questionContent}>{q.content}</p>
              </div>

              <button
                onClick={() => handleLikeToggle(q.id, q.likes)}
                className={styles.likeButton}
              >
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
                          תגובה מאת: <strong>{a.author}</strong>
                        </span> &nbsp;
                        {a.author === currentUser && (
                          <button
                            onClick={() => handleDeleteAnswer(q.id, i)}
                            className={styles.deleteButton}
                          >
                            מחק תגובה
                          </button>
                        )}
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
            <button onClick={() => handleAddAnswer(q.id, index)} className={styles.submitButton}>
              הגב
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

