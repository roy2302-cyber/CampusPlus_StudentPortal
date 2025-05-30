import { useState } from 'react';
import styles from './Summaries.module.css';

export default function Summaries() {
  const [summaries, setSummaries] = useState([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleAddSummary = () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!title.trim()) {
      setErrorMessage('יש להזין כותרת לסיכום');
      return;
    }
    if (!file) {
      setErrorMessage('יש לבחור קובץ להעלאה');
      return;
    }

    const newSummary = {
      id: Date.now(),
      title,
      fileName: file.name,
      uploader: 'משתמש דמו',
      author: 'משתמש דמו',
      fileUrl: '#',
      ratings: {},
    };

    setSummaries(prev => [...prev, newSummary]);
    setTitle('');
    setFile(null);
    setSuccessMessage('הסיכום הועלה בהצלחה!');
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm('האם אתה בטוח שברצונך למחוק את הסיכום?');
    if (!confirmDelete) return;
    setSummaries(prev => prev.filter(s => s.id !== id));
    setSuccessMessage('הסיכום נמחק בהצלחה!');
  };

  const toggleFavorite = (title) => {
    setFavorites(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
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
      <p className={styles.summariesSubtitle}>מצא סיכומים לפי קורס, העלה קבצים ושמור לתיק אישי.</p>

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
        {filteredSummaries.map((summary) => (
          <li key={summary.id} className={styles.summaryItem}>
            <strong>{summary.title}</strong>
            <button
              onClick={() => toggleFavorite(summary.title)}
              className={styles.favoriteBtn}
              title="הוסף למועדפים"
            >
              {favorites.includes(summary.title) ? '❤️' : '🤍'}
            </button>
            <div className={styles.summaryMeta}>
              הועלה ע"י: {summary.author} <br />
              <a href={summary.fileUrl} className={styles.viewLink}>צפייה בקובץ 📄</a>
              <button onClick={() => handleDelete(summary.id)} className={styles.deleteBtn}>מחק סיכום</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
