import { useState, useEffect } from 'react';
import styles from './Summaries.module.css';
import { db } from '../../../firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  doc,
  getDoc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { storage } from '../../../firebase';

export default function Summaries({ currentUser }) {
  const [summaries, setSummaries] = useState([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [hoverRating, setHoverRating] = useState({ index: null, score: null });
  const [userRated, setUserRated] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [alreadyRatedMessageIndex, setAlreadyRatedMessageIndex] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "summaries"), (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          uploader: d.uploader || "",
          author: d.authorName || "אנונימי",
          ratings: d.ratings || {},
          averageRating: d.averageRating || 0
        };
      });

      setSummaries(data);
    });

    return () => unsub();
  }, []);

  const handleAddSummary = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!title.trim()) {
      setErrorMessage("יש להזין כותרת לסיכום");
      setTimeout(() => setErrorMessage(""), 2000);
      return;
    }

    if (!file) {
      setErrorMessage("יש לבחור קובץ להעלאה");
      setTimeout(() => setErrorMessage(""), 2000);
      return;
    }

    if (!currentUser) {
      setErrorMessage("חובה להיות מחובר כדי להעלות סיכום");
      setTimeout(() => setErrorMessage(""), 2000);
      return;
    }

    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      const profileVisibility = userSnap.exists() &&
        userSnap.data().settings &&
        userSnap.data().settings.hasOwnProperty("profileVisibility")
        ? userSnap.data().settings.profileVisibility
        : false;

      const fileRef = storageRef(storage, `summaries/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);

      await addDoc(collection(db, "summaries"), {
        title,
        fileUrl,
        uploader: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email || "משתמש",
        showAuthor: !profileVisibility,
        ratings: {},
        averageRating: 0,
        createdAt: serverTimestamp()
      });

      setSuccessMessage("הסיכום הועלה בהצלחה!");
      setTimeout(() => setSuccessMessage(""), 2000);
      setTitle("");
      setFile(null);
    } catch (err) {
      console.error(err);
      setErrorMessage("אירעה שגיאה בהעלאה: " + err.message);
    }
  };

  const handleRate = async (index, score) => {
    const summary = summaries[index];

    if (summary.ratings && summary.ratings[currentUser.uid]) {
      setAlreadyRatedMessageIndex(index);
      setTimeout(() => setAlreadyRatedMessageIndex(null), 2000);
      return;
    }

    const updatedRatings = { ...summary.ratings, [currentUser.uid]: score };
    const scores = Object.values(updatedRatings);
    const averageRating = scores.reduce((a, b) => a + b, 0) / scores.length;

    try {
      const summaryRef = doc(db, "summaries", summary.id);
      await updateDoc(summaryRef, {
        ratings: updatedRatings,
        averageRating: averageRating
      });

      const updated = [...summaries];
      updated[index].ratings = updatedRatings;
      updated[index].averageRating = averageRating;
      setSummaries(updated);
      setUserRated({ ...userRated, [index]: true });
      setHoverRating(null);
      setAlreadyRatedMessageIndex(null);
    } catch (err) {
      console.error("שגיאה בעדכון הדירוג:", err);
      setErrorMessage("שגיאה בשמירת הדירוג");
    }
  };

  const handleDelete = async (id, fileUrl) => {
    const confirmDelete = window.confirm("האם אתה בטוח שברצונך למחוק את הסיכום?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "summaries", id));

      const path = decodeURIComponent(new URL(fileUrl).pathname.split("/o/")[1]);
      const fileRef = storageRef(storage, path);
      await deleteObject(fileRef);

      setSummaries((prev) => prev.filter((summary) => summary.id !== id));
      setSuccessMessage("הסיכום נמחק בהצלחה!");
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (err) {
      console.error("שגיאה במחיקה:", err);
      setErrorMessage("שגיאה במחיקת הסיכום");
      setTimeout(() => setErrorMessage(""), 2000);
    }
  };

  const toggleFavorite = (title) => {
    setFavorites((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const renderStars = (ratingsObj) => {
    const scores = ratingsObj ? Object.values(ratingsObj) : [];
    const avg = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;

    const fullStars = Math.floor(avg);
    const halfStar = avg - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <span>
        {Array(fullStars).fill('⭐').map((s, i) => <span key={`f${i}`}>{s}</span>)}
        {halfStar && <span>⭐️</span>}
        {Array(emptyStars).fill('☆').map((s, i) => <span key={`e${i}`}>{s}</span>)}
      </span>
    );
  };

  const filteredSummaries = summaries.filter((summary) => {
    const matchesSearch = summary.title.toLowerCase().includes(searchQuery.toLowerCase());
    const isFavorite = favorites.includes(summary.title);
    return matchesSearch && (!showFavoritesOnly || isFavorite);
  });

  return (
    <div className={styles.summariesContainer}>
      <h1 className={styles.summariesTitle}> אוסף סיכומים 📚</h1>
      <p className={styles.summariesSubtitle}>מצא סיכומים לפי קורס, העלה קבצים, דרג ושמור לתיק אישי.</p>

      {!currentUser && (
        <p className={styles.errorText}> חובה להתחבר כדי להעלות ולדרג סיכומים</p>
      )}

      <input
        type="text"
        placeholder="חפש לפי כותרת..."
        className={styles.searchInput}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <button
        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
        className={styles.favoritesToggle}
      >
        מועדפים
      </button>

      <div className={styles.inputSection}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="כותרת הסיכום"
          className={styles.summaryInput}
        />
        <label className={styles.fileUploadWrapper}>
          בחר קובץ
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className={styles.hiddenFileInput}
          />
        </label>
        {file && <p>📁 {file.name}</p>}
        {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}
        {successMessage && <p className={styles.successText}>{successMessage}</p>}

        <button onClick={handleAddSummary} className={styles.uploadButton}>
          העלה
        </button>
      </div>

      <ul className={styles.summaryList}>
        {filteredSummaries.map((summary, index) => (
          <li key={index} className={styles.summaryItem}>
            <strong>{summary.title}</strong>
            <button
              onClick={() => toggleFavorite(summary.title)}
              className={styles.favoriteBtn}
              title="הוסף למועדפים"
            >
              {favorites.includes(summary.title) ? '❤️' : '🤍'}
            </button>
            <div className={styles.summaryMeta}>
              הועלה ע"י: {
                summary.showAuthor || summary.uploader === currentUser?.uid || currentUser?.isAdmin
                  ? summary.author
                  : "משתמש אנונימי"
              } <br />
              <div className={styles.linkAndDeleteWrapper}>
                <a
                  href={summary.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.viewLink}
                >
                  צפייה בקובץ 📄
                </a>

                {(summary.uploader === currentUser?.uid || currentUser?.isAdmin) && (
                  <button
                    onClick={() => handleDelete(summary.id, summary.fileUrl)}
                    className={styles.deleteBtn}
                  >
                    מחק סיכום
                  </button>
                )}
              </div>
              <br />
              דירוג ממוצע: {summary.ratings && Object.keys(summary.ratings).length > 0 ? (
                (Object.values(summary.ratings).reduce((a, b) => a + b, 0) / Object.values(summary.ratings).length).toFixed(1)
              ) : '0'} ⭐ <br />
              סה"כ דירוגים: {summary.ratings ? Object.keys(summary.ratings).length : 0} 👤<br />

              {renderStars(summary.ratings)}

              <div className={styles.starRatingBar}>
                דרג סיכום:
                {[1, 2, 3, 4, 5].map((num) => (
                  <span
                    key={num}
                    onClick={() => handleRate(index, num)}
                    onMouseEnter={() => setHoverRating({ index, score: num })}
                    onMouseLeave={() => setHoverRating({ index: null, score: null })}
                    className={`${styles.star} ${hoverRating && hoverRating.index === index && hoverRating.score >= num ? styles.previewStar : ''} ${userRated[index] ? styles.disabledStar : ''}`}
                  >⭐</span>
                ))}
              </div>

              <div className={styles.ratingMessageBox}>
                {alreadyRatedMessageIndex === index && (
                  <p className={styles.alreadyRatedText}>כבר דירגת את הסיכום הזה</p>
                )}
                {hoverRating?.index === index && !userRated[index] && (
                  <p className={styles.previewRatingText}>
                    דירוג: {hoverRating?.score} ⭐
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
