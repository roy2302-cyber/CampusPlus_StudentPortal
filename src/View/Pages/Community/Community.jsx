import { useState, useEffect } from 'react';
import styles from './Community.module.css';
import {
  collection,
  addDoc,
  updateDoc,
  onSnapshot,
  doc,
  deleteDoc,
  getDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { db, auth, functions } from "../../../firebase";
import { httpsCallable } from 'firebase/functions';

const sendEmailNotification = httpsCallable(functions, 'sendEmailNotification');

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
  const [userSettingsMap, setUserSettingsMap] = useState({});

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "questions"), async (snapshot) => {
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

      const allUserIds = new Set();
      fetchedQuestions.forEach(q => {
        allUserIds.add(q.authorId);
        q.answers?.forEach(a => allUserIds.add(a.authorId));
      });

      const userSettingsData = {};
      for (const uid of allUserIds) {
        const userRef = doc(db, "userSettings", uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          userSettingsData[uid] = snap.data();
        }
      }

      if (currentUser?.uid && currentUser?.settings) {
        userSettingsData[currentUser.uid] = currentUser.settings;
      }

      setUserSettingsMap(userSettingsData);
    });

    return () => unsub();
  }, [currentUser]);

  const getDisplayName = (uid, fallback) => {
    const settings = userSettingsMap[uid];
    if (settings?.profileVisibility && currentUser?.uid !== uid && !currentUser?.isAdmin) {
      return "משתמש אנונימי";
    }
    return fallback;
  };

  const handleAddQuestion = async () => {
    if (!currentUser?.uid) return;

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

    setTitleError("");
    setContentError("");

    await addDoc(collection(db, "questions"), {
      title,
      content,
      author: currentUser.displayName || "משתמש ללא שם",
      authorId: currentUser.uid,
      likes: [],
      answers: []
    });


    setSuccessMessage("השאלה פורסמה בהצלחה!");
    setTimeout(() => setSuccessMessage(""), 2000);


   try {
  const result = await sendEmailNotification({
    to: "royye5869@gmail.com",
    subject: "שאלה חדשה פורסמה בקהילת הלמידה",
    html: `
      <div dir="rtl" style="text-align:right; font-family:Arial,sans-serif;">
        <h2>שאלה חדשה פורסמה בקמפוס+</h2>
        <p><strong>נושא:</strong> ${title}</p>
        <p><strong>תוכן:</strong> ${content}</p>
      </div>`
  });
  console.log("תוצאה מהמייל:", result.data);
} catch (error) {
  console.error("שליחת מייל נכשלה:", error);
}

    setTitle("");
    setContent("");
    setSuccessMessage("השאלה פורסמה בהצלחה!");
    setTimeout(() => setSuccessMessage(""), 2000);
  };

  const handleAddAnswer = async (questionId, index) => {
    if (!currentUser?.uid) return;

    const answerText = answerInputs[index];
    if (!answerText || !answerText.trim()) {
      setAnswerErrors(prev => ({ ...prev, [index]: "יש להזין תגובה." }));
      setAnswerSuccess(prev => ({ ...prev, [index]: "" }));
      return;
    }

    const question = questions.find(q => q.id === questionId);

    try {
      await updateDoc(doc(db, "questions", questionId), {
        answers: arrayUnion({
          text: answerText,
          author: currentUser.displayName,
          authorId: currentUser.uid
        })
      });

      if (question && question.authorId !== currentUser.uid) {
        const authorDoc = await getDoc(doc(db, "users", question.authorId));
        const authorEmail = authorDoc.exists() ? authorDoc.data().email : null;

  if (authorEmail) {
  try {
    const result = await sendEmailNotification({
      to: authorEmail,
      subject: "תגובה חדשה לשאלה שלך בקמפוס+",
      html: `
        <div dir="rtl" style="text-align:right; font-family:Arial,sans-serif;">
          <h2>תגובה חדשה לשאלה שלך</h2>
          <p><strong>שאלה:</strong> ${question.title}</p>
          <p><strong>תגובה:</strong> ${answerText}</p>
        </div>`
    });
    console.log("נשלח מייל תגובה:", result.data);
  } catch (error) {
    console.error("שליחת מייל נכשלה:", error);
  }
}


}

      setAnswerInputs(prev => ({ ...prev, [index]: "" }));
      setAnswerErrors(prev => ({ ...prev, [index]: "" }));
      setAnswerSuccess(prev => ({ ...prev, [index]: "התגובה פורסמה בהצלחה!" }));
      setTimeout(() => {
        setAnswerSuccess(prev => ({ ...prev, [index]: "" }));
      }, 2000);
    } catch (error) {
      console.error("שגיאה בהוספת תגובה:", error);
    }
  };

  const handleLikeToggle = async (questionId, likesArray) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const questionRef = doc(db, "questions", questionId);
    const alreadyLiked = likesArray.includes(userId);

    await updateDoc(questionRef, {
      likes: alreadyLiked ? arrayRemove(userId) : arrayUnion(userId)
    });
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!currentUser?.uid) return;
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
                <span className={styles.questionAuthor}>
                  {getDisplayName(q.authorId, q.author)}
                </span>
              </div>
              
              {(q.authorId === currentUser?.uid || currentUser?.isAdmin) && (
                <button onClick={() => handleDeleteQuestion(q.id)} className={styles.deleteButton}>
                  מחק שאלה
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

  <div className={styles.actionsRow}>
    <button
      onClick={() => handleLikeToggle(q.id, q.likes)}
      className={styles.likeButton}
    >
      👍 {q.likes?.length || 0}
    </button>
  </div>
</div>

            {Array.isArray(q.answers) && q.answers.length > 0 && (
              <div className={styles.answersSection}>
                <strong className={styles.answersTitle}>תגובות:</strong>
                <ul className={styles.answersList}>
                  {q.answers.map((a, i) => (
                    <li key={i} className={styles.answerItem}>
                      <div className={styles.answerHeaderRow}>
                       <span className={styles.answerAuthor}>
                        תגובה מאת: <strong>{getDisplayName(a.authorId, a.author)}</strong>
                        </span>
                        {(a.authorId === currentUser?.uid || currentUser?.isAdmin) && (
                        <button onClick={() => handleDeleteAnswer(q.id, i)} className={styles.deleteButton}>
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
            {answerErrors[index] && (
              <p className={styles.errorMessage}>{answerErrors[index]}</p>
            )}
            {answerSuccess[index] && (
              <p className={styles.successMessage}>{answerSuccess[index]}</p>
            )}
            <button onClick={() => handleAddAnswer(q.id, index)} className={styles.submitButton}>
              הגב
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
