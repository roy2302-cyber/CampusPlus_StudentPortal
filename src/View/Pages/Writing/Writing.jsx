import { useState, useEffect } from 'react';
import styles from './Writing.module.css';
import { db, storage, auth } from '../../../firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  onSnapshot,
  deleteDoc,
  getDocs,
  getDoc
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
  const [docStates, setDocStates] = useState({});
  const [editingStates, setEditingStates] = useState({});
  const [sharableUsers, setSharableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState({});
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!uid) return;
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      const allowSharing = userSnap.exists() && userSnap.data().settings?.dataSharing === true;

      const unsubDocs = onSnapshot(collection(db, "documents"), (snapshot) => {
  const list = snapshot.docs.map(d => {
    const docData = d.data(); // ✅ הגדרה נכונה
    return {
      id: d.id,
      ...docData,
      date: docData.createdAt?.toDate().toLocaleString('he-IL', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }) || "תאריך לא ידוע"
    };
  })
  
  .filter(d =>
    d.authorId === uid || (allowSharing && d.sharedWith?.includes(uid))
  );
  setDocuments(list);
});

      return () => unsubDocs();
    };

    const fetchSharableUsers = async () => {
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(usersRef);
      const filtered = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.uid !== currentUser.uid && data.settings?.dataSharing === true) {
          filtered.push({
            uid: data.uid,
            displayName: data.displayName || data.email || "משתמש"
          });
        }
      });
      setSharableUsers(filtered);
    };

    fetchSharableUsers();
    fetchDocuments();
  }, [uid]);

  const updateDocState = (docId, field, value) => {
    setDocStates(prev => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        [field]: value
      }
    }));
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
      await addDoc(collection(db, "documents"), {
        author: currentUser.displayName,
        authorId: currentUser.uid,
        profileVisibility: currentUser.settings?.profileVisibility ?? false,
        topic: trimmedTitle,
        content: trimmedText,
        createdAt: serverTimestamp(),
        fileUrl: fileUrl,
        sharedWith: []
      });
      setText(""); setTitle(""); setFile(null);
      updateDocState("global", "successMessage", "המסמך נשמר בהצלחה!");
      setTimeout(() => updateDocState("global", "successMessage", ""), 2000);
    } catch (err) {
      console.error("שגיאה בשמירה:", err);
    }
  };

  const handleDelete = async (docId) => {
    try {
      const targetDoc = documents.find((d) => d.id === docId);
      if (targetDoc?.fileUrl) {
        const filePath = decodeURIComponent(new URL(targetDoc.fileUrl).pathname.split("/o/")[1].split("?")[0]);
        const fileRef = storageRef(storage, filePath);
        await deleteObject(fileRef);
      }
      await deleteDoc(doc(db, "documents", docId));
      alert("המסמך נמחק בהצלחה!");
    } catch (error) {
      console.error("שגיאה במחיקת המסמך או הקובץ:", error);
    }
  };

  const startEditing = (documentItem) => {
  setEditingStates(prev => ({
    ...prev,
    [documentItem.id]: {
      topic: documentItem.topic,
      content: documentItem.content,
      file: null,
      oldFileUrl: documentItem.fileUrl || ""
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
      setTimeout(() => updateDocState(docId, 'editErrors', {}), 2000);
      return;
    }
    try {
      let newFileUrl = edited.oldFileUrl;
      if (edited.file) {
        if (edited.oldFileUrl) {
          const filePath = decodeURIComponent(new URL(edited.oldFileUrl).pathname.split("/o/")[1].split("?")[0]);
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

    <input type="text" placeholder="נושא" value={title} onChange={(e) => setTitle(e.target.value)} className={styles.topicInput} />
    <textarea className={styles.textArea} placeholder="התחל לכתוב כאן..." value={text} onChange={(e) => setText(e.target.value)}></textarea>
    <label className={styles.fileUploadLabel}>
      העלה קובץ 
      <input type="file" onChange={(e) => setFile(e.target.files[0])} className={styles.fileInput} />
    </label>
    <span className={styles.fileName}>{file?.name || "לא נבחר קובץ"}</span>

    {docStates["global"]?.errorMessage && <div className={styles.errorMessage}>{docStates["global"].errorMessage}</div>}
    <div className={styles.buttonWrapper}>
      {docStates["global"]?.successMessage && <div className={styles.successMessage}>{docStates["global"].successMessage}</div>}
      <button className={styles.saveButton} onClick={handleSave}>שמור מסמך</button>
    </div>

    <div className={styles.savedDocuments}>
      {documents.map((d) => (
        <div key={d.id} className={styles.documentItem}>
          {d.authorId === uid ? (
            <strong className={styles.documentMeta}>
              טיוטה נשמרה בתאריך- {d.date} | נושא: {d.topic}
            </strong>
          ) : (
            <>
              <strong className={styles.documentMeta}>
                מסמך משותף מ- {
                  (d.profileVisibility && !currentUser.isAdmin && d.authorId !== uid)
                    ? "משתמש אנונימי"
                    : (d.author || "משתמש")
                } בתאריך {d.date}
              </strong>
              <div className={styles.sharedTopic}>
                נושא: <strong>{d.topic}</strong>
              </div>
            </>
          )}

          <p className={styles.documentContent}>{d.content}</p>
          {d.fileUrl && (
            <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className={styles.viewFileLink}>
              צפייה בקובץ 📄
            </a>
          )}

          <div className={styles.inlineButtons}>
            {(auth.currentUser.uid === d.authorId || currentUser.isAdmin) && (
              <button onClick={() => startEditing(d)} className={styles.editBtn}>ערוך מסמך</button>
            )}
            {(d.sharedWith?.includes(uid) || auth.currentUser.uid === d.authorId || currentUser.isAdmin) && (
              <button onClick={() => handleDelete(d.id)} className={styles.deleteBtn}>מחק מסמך</button>
            )}
          </div>

          <div className={styles.shareRow}>
  {docStates[d.id]?.shareError && (
    <div className={styles.errorMessage}>{docStates[d.id].shareError}</div>
  )}

  <button
    className={styles.shareButton}
    onClick={async () => {
      const selectedUid = selectedUsers[d.id];
      if (!selectedUid) {
        updateDocState(d.id, "shareError", "יש לבחור משתמש לשיתוף");
        setTimeout(() => updateDocState(d.id, "shareError", ""), 3000);
        return;
      }
      try {
        await updateDoc(doc(db, "documents", d.id), {
          sharedWith: [...(d.sharedWith || []), selectedUid]
        });
        updateDocState(d.id, "sharedMessage", "המסמך שותף בהצלחה!");
        setSelectedUsers((prev) => ({ ...prev, [d.id]: "" }));
        setTimeout(() => updateDocState(d.id, "sharedMessage", ""), 2000);
      } catch (err) {
        console.error("שגיאה בשיתוף:", err);
      }
    }}
  >
    שתף
  </button>

  <select
    onChange={(e) => setSelectedUsers((prev) => ({
      ...prev,
      [d.id]: e.target.value
    }))}
    value={selectedUsers[d.id] || ""}
    className={styles.selectInput}
  >
    <option value="" disabled>בחר משתמש לשיתוף</option>
    {sharableUsers.map((user) => (
      <option key={user.uid} value={user.uid}>
        {user.displayName}
      </option>
    ))}
  </select>
</div>


          {editingStates[d.id] && (
            <div className={styles.editForm}>
              <label className={styles.editLabel}>נושא:</label>
              <input
                type="text"
                value={editingStates[d.id]?.topic || ''}
                onChange={(e) => setEditingStates(prev => ({ ...prev, [d.id]: { ...prev[d.id], topic: e.target.value } }))}
                className={styles.editInput}
              />
              {docStates[d.id]?.editErrors?.topic && <div className={styles.errorMessage}>{docStates[d.id].editErrors.topic}</div>}

              <label className={styles.editLabel}>תוכן:</label>
              <textarea
                value={editingStates[d.id]?.content || ''}
                onChange={(e) => setEditingStates(prev => ({ ...prev, [d.id]: { ...prev[d.id], content: e.target.value } }))}
                className={styles.editTextarea}
              />
              {docStates[d.id]?.editErrors?.content && <div className={styles.errorMessage}>{docStates[d.id].editErrors.content}</div>}

              <label className={styles.fileUploadLabel}>
                 העלה קובץ חדש
                <input
                  type="file"
                  onChange={(e) => setEditingStates(prev => ({
                    ...prev,
                    [d.id]: {
                      ...prev[d.id],
                      file: e.target.files[0]
                    }
                  }))}
                  className={styles.fileInput}
                />
              </label>
              <span className={styles.fileName}>
                {editingStates[d.id]?.file?.name || "לא נבחר קובץ"}
              </span>

              <div className={styles.editButtons}>
                <button onClick={() => saveEdit(d.id)} className={styles.saveEditBtn}>שמור שינויים</button>
                <button onClick={() => cancelEditing(d.id)} className={styles.cancelEditBtn}>בטל עריכה</button>
              </div>
            </div>
          )}

          {docStates[d.id]?.sharedMessage && (
            <div className={styles.successMessage}>{docStates[d.id].sharedMessage}</div>
          )}
        </div>
      ))}
    </div>
  </div>
);
}
