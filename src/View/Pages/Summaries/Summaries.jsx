import React, { useState } from 'react';
import styles from './Summaries.module.css';

export default function Summaries({ currentUser = 'סטודנט_אחד' }) {
  const [summaries, setSummaries] = useState([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [hoverRatingIndex, setHoverRatingIndex] = useState(null);
  const [userRated, setUserRated] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const handleAddSummary = () => {
    if (title.trim() && file) {
      const newEntry = {
        title,
        fileName: file.name,
        author: currentUser,
        ratings: [],
        averageRating: 0
      };
      setSummaries([...summaries, newEntry]);
      setTitle("");
      setFile(null);
    }
  };

  const handleRate = (index, score) => {
    if (userRated[index]) return;
    const updated = [...summaries];
    updated[index].ratings.push(score);
    const sum = updated[index].ratings.reduce((a, b) => a + b, 0);
    updated[index].averageRating = sum / updated[index].ratings.length;
    setSummaries(updated);
    setUserRated({ ...userRated, [index]: true });
    setHoverRatingIndex(null);
  };

  const toggleFavorite = (title) => {
    setFavorites((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const renderStars = (avg) => {
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

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className={styles.fileInput}
        />

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
              העלאה ע"י: {summary.author}<br />
              דירוג ממוצע: {summary.averageRating.toFixed(1)} ({summary.ratings.length} דירוגים)<br />
              {renderStars(summary.averageRating)}
              <div className={styles.starRatingBar}>
                דרג סיכום:
                {[1, 2, 3, 4, 5].map((num) => (
                  <span
                    key={num}
                    onClick={() => handleRate(index, num)}
                    onMouseEnter={() => setHoverRatingIndex(num)}
                    onMouseLeave={() => setHoverRatingIndex(null)}
                    className={`${styles.star} ${hoverRatingIndex >= num ? styles.previewStar : ''} ${userRated[index] ? styles.disabledStar : ''}`}
                  >⭐</span>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}