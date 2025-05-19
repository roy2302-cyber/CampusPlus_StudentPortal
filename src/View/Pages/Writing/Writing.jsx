import { useState, useEffect } from 'react';
import styles from './Writing.module.css';
import { db, storage, auth } from '../../../firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
  onSnapshot,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

export default function Writing({ currentUser }) {
  const [documents, setDocuments] = useState([]);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [docStates, setDocStates] = useState({});
  const [editingStates, setEditingStates] = useState({});
  const [lastDocId, setLastDocId] = useState(null);
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    const unsubDocs = onSnapshot(collection(db, "documents"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate().toLocaleString('he-IL', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) || "תאריך לא ידוע"
      })).filter(doc =>
        doc.author === currentUser || doc.sharedWith?.includes(uid)
      );
      setDocuments(list);
    });

    return () => unsubDocs();
  }, [currentUser, uid]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllUsers(usersList);
    };

    fetchUsers();
  }, []);

  const updateDocState = (docId, field, value) => {
    setDocStates(prev => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        [field]: value
      }
    }));
  };

  const handleShare = async (docId) => {
    const selectedUserId = docStates[docId]?.selectedUserId;
    if (!selectedUserId) return;
    try {
      const docRef = doc(db, "documents", docId);
      await updateDoc(docRef, {
        sharedWith: arrayUnion(selectedUserId)
      });
      const sharedUser = allUsers.find(u => u.id === selectedUserId);
      updateDocState(docId, "sharedMessage", `המסמך שותף עם ${sharedUser?.displayName || "משתמש"} ✅`);
      setTimeout(() => updateDocState(docId, "sharedMessage", ""), 3000);
    } catch (err) {
      console.error("שגיאה בשיתוף:", err);
    }
  };

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    const trimmedText = text.trim();

    if (!trimmedTitle || (!trimmedText && !file)) {
      updateDocState("global", "errorMessage", "יש למלא נושא ולצרף תוכן כתוב או קובץ.");
      setTimeout(() => updateDocState("global", "errorMessage", ""), 3000);
      return;
    }

    try {
      let fileUrl = "";
      if (file) {
        const fileStorageRef = storageRef(storage, `documents/${Date.now()}_${file.name}`);
        await uploadBytes(fileStorageRef, file);
        fileUrl = await getDownloadURL(fileStorageRef);
      }

      const newDoc = {
        author: auth.currentUser.displayName || currentUser,
        content: trimmedText,
        topic: trimmedTitle,
        createdAt: serverTimestamp(),
        fileUrl: fileUrl,
        sharedWith: []
      };

      const docRef = await addDoc(collection(db, "documents"), newDoc);
      setLastDocId(docRef.id);

      setText("");
      setTitle("");
      setFile(null);
      updateDocState("global", "successMessage", "המסמך נשמר בהצלחה!");
      setTimeout(() => {
       updateDocState("global", "successMessage", "");
        }, 2000);
    } catch (err) {
      console.error("שגיאה בשמירה:", err);
    }
  };

  const handleDelete = async (docId) => {
    try {
      const docSnapshot = documents.find((doc) => doc.id === docId);

      if (docSnapshot?.fileUrl) {
        const filePath = decodeURIComponent(
          new URL(docSnapshot.fileUrl).pathname.split("/o/")[1].split("?")[0]
        );
        const fileRef = storageRef(storage, filePath);
        await deleteObject(fileRef);
      }

      await deleteDoc(doc(db, "documents", docId));
      alert("המסמך והקובץ נמחקו בהצלחה");
      setLastDocId(null);
    } catch (error) {
      console.error("שגיאה במחיקת המסמך או הקובץ:", error);
    }
  };

  const startEditing = (doc) => {
    setEditingStates(prev => ({
      ...prev,
      [doc.id]: {
        topic: doc.topic,
        content: doc.content,
        file: null,
        oldFileUrl: doc.fileUrl || ""
      }
    }));
  };

  const cancelEditing = (docId) => {
    setEditingStates(prev => {
      const updated = { ...prev };
      delete updated[docId];
      return updated;
    });
  };

  const saveEdit = async (docId) => {
  const edited = editingStates[docId];
  const errors = {};

  if (!edited.topic?.trim()) errors.topic = 'נא להזין נושא';
  if (!edited.content?.trim()) errors.content = 'נא להזין תוכן';

  if (Object.keys(errors).length > 0) {
    updateDocState(docId, 'editErrors', errors);

    // ניקוי אוטומטי אחרי 2 שניות
    setTimeout(() => {
      updateDocState(docId, 'editErrors', {});
    }, 2000);

    return;
  }

  try {
    let newFileUrl = edited.oldFileUrl;

    if (edited.file) {
      if (edited.oldFileUrl) {
        const filePath = decodeURIComponent(
          new URL(edited.oldFileUrl).pathname.split("/o/")[1].split("?")[0]
        );
        await deleteObject(storageRef(storage, filePath));
      }

      const newFileRef = storageRef(storage, `documents/${Date.now()}_${edited.file.name}`);
      await uploadBytes(newFileRef, edited.file);
      newFileUrl = await getDownloadURL(newFileRef);
    }

    await updateDoc(doc(db, "documents", docId), {
      topic: edited.topic,
      content: edited.content,
      fileUrl: newFileUrl
    });

    cancelEditing(docId);
    updateDocState(docId, "sharedMessage", "המסמך עודכן בהצלחה!");
    setTimeout(() => updateDocState(docId, "sharedMessage", ""), 3000);
  } catch (err) {
    console.error("שגיאה בעריכת המסמך:", err);
  }
};



  return (
    <div className={styles.writingContainer}>
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitleBlue}>כתיבה אקדמית 📝</h1>
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
        placeholder="התחל לכתוב כאן..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className={styles.fileInput}
      />

      {docStates["global"]?.errorMessage && (
        <div className={styles.errorMessage}>
          {docStates["global"].errorMessage}
        </div>
      )}

      <div className={styles.buttonWrapper}>
        {docStates["global"]?.successMessage && (
          <div className={styles.successMessage}>
            {docStates["global"].successMessage}
          </div>
        )}
        <button className={styles.saveButton} onClick={handleSave}>
          שמור מסמך
        </button>
  
      </div>

      <div className={styles.savedDocuments}>
        {documents.map((doc) => (
          <div key={doc.id} className={styles.documentItem}>
            <strong className={styles.documentMeta}>
              טיוטה נשמרה ב-{doc.date} | נושא: {doc.topic}
            </strong>
            <p className={styles.documentContent}>{doc.content}</p>
            {doc.fileUrl && (
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.viewFileLink}
              >
                צפייה בקובץ 📄
              </a>
            )}

            {auth.currentUser.displayName === doc.author && (
              <div className={styles.inlineButtons}>
                <select
                  className={styles.selectUser}
                  value={docStates[doc.id]?.selectedUserId || ""}
                  onChange={(e) =>
                    updateDocState(doc.id, "selectedUserId", e.target.value)
                  }
                >
                  <option value="">בחר משתמש לשיתוף</option>
                  {allUsers
                    .filter((u) => u.id !== auth.currentUser.uid)
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.displayName}
                      </option>
                    ))}
                </select>

                <button
                  className={styles.shareBtn}
                  onClick={() => handleShare(doc.id)}
                >
                  שתף מסמך 
                </button>
                
                <button onClick={() => startEditing(doc)} className={styles.editBtn}>ערוך מסמך </button>
                <button onClick={() => handleDelete(doc.id)} className={styles.deleteBtn}>מחק מסמך </button>
              </div>
            )}

         {editingStates[doc.id] && (
  <div className={styles.editForm}>
    <label className={styles.editLabel}>נושא:</label>
<input
  type="text"
  value={editingStates[doc.id]?.topic || ''}
  onChange={(e) =>
    setEditingStates(prev => ({
      ...prev,
      [doc.id]: {
        ...prev[doc.id],
        topic: e.target.value
      }
    }))
  }
  className={styles.editInput}
/>
{docStates[doc.id]?.editErrors?.topic && (
  <div className={styles.errorMessage}>
    {docStates[doc.id].editErrors.topic}
  </div>
)}

<label className={styles.editLabel}>תוכן:</label>
<textarea
  value={editingStates[doc.id]?.content || ''}
  onChange={(e) =>
    setEditingStates(prev => ({
      ...prev,
      [doc.id]: {
        ...prev[doc.id],
        content: e.target.value
      }
    }))
  }
  className={styles.editTextarea}
/>
{docStates[doc.id]?.editErrors?.content && (
  <div className={styles.errorMessage}>
    {docStates[doc.id].editErrors.content}
  </div>
)}


    <label className={styles.editLabel}>קובץ חדש:</label>
    <input
      type="file"
      onChange={(e) =>
        setEditingStates(prev => ({
          ...prev,
          [doc.id]: {
            ...prev[doc.id],
            file: e.target.files[0]
          }
        }))
      }
      className={styles.fileInput}
    />

    <div className={styles.editButtons}>
      <button
        onClick={() => saveEdit(doc.id)}
        className={styles.saveEditBtn}
      >
        שמור שינויים 
      </button>
      <button
        onClick={() => cancelEditing(doc.id)}
        className={styles.cancelEditBtn}
      >
        בטל עריכה 
      </button>
    </div>
  </div>
)}

           

            {docStates[doc.id]?.sharedMessage && (
              <div className={styles.successMessage}>
                {docStates[doc.id].sharedMessage}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
