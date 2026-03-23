import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vocab as vocabApi } from '../api';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardPage() {
  const [vocabs,  setVocabs]  = useState([]);
  const [deck,    setDeck]    = useState([]);
  const [index,   setIndex]   = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known,   setKnown]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [done,    setDone]    = useState(false);

  useEffect(() => {
    vocabApi.getAll()
      .then(data => { setVocabs(data); setDeck(shuffle(data)); })
      .finally(() => setLoading(false));
  }, []);

  const restart = () => {
    setDeck(shuffle(vocabs));
    setIndex(0);
    setFlipped(false);
    setKnown(0);
    setDone(false);
  };

  const next = (wasKnown) => {
    if (wasKnown) setKnown(k => k + 1);
    if (index + 1 >= deck.length) {
      setDone(true);
    } else {
      setIndex(i => i + 1);
      setFlipped(false);
    }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  if (vocabs.length === 0) {
    return (
      <div className="page-wrapper flashcard-page">
        <div className="empty-state">
          <div className="empty-state-icon">🃏</div>
          <h3>No words yet</h3>
          <p>Add some words to start practicing flashcards</p>
          <Link to="/add" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            + Add Word
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((known / deck.length) * 100);
    return (
      <div className="page-wrapper flashcard-page">
        <h1 className="page-title" style={{ marginBottom: '2rem' }}>Session Complete 🎉</h1>
        <div className="card fc-result-card">
          <div className="fc-result-score">{pct}%</div>
          <div className="fc-result-label">
            Remembered {known} of {deck.length} words
          </div>
          <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={restart}>
              🔄 Play again
            </button>
            <Link to="/" className="btn btn-secondary btn-lg">
              Back to library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const card     = deck[index];
  const progress = (index / deck.length) * 100;

  return (
    <div className="page-wrapper flashcard-page">
      <div className="page-header" style={{ justifyContent: 'center' }}>
        <h1 className="page-title">Flashcard 🃏</h1>
      </div>

      <div className="flashcard-progress">
        {index + 1} / {deck.length}
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flashcard-scene" onClick={() => setFlipped(f => !f)}>
        <div className={`flashcard-inner ${flipped ? 'flipped' : ''}`}>
          <div className="flashcard-face flashcard-front">
            <div className="fc-word">{card.word}</div>
            {card.synonyms.length > 0 && (
              <div className="fc-synonyms">
                {card.synonyms.map((s, i) => (
                  <span key={i} className="fc-syn-tag">{s}</span>
                ))}
              </div>
            )}
            <div className="fc-hint">Tap to reveal meaning 👆</div>
          </div>

          <div className="flashcard-face flashcard-back">
            <div className="fc-translation">{card.translation}</div>
            {card.example_sentence && (
              <div className="fc-example">"{card.example_sentence}"</div>
            )}
            <div className="fc-hint" style={{ color: 'var(--text-3)', marginTop: '1rem' }}>
              Tap to flip back
            </div>
          </div>
        </div>
      </div>

      <div className="flashcard-controls">
        <button className="btn fc-unknown-btn btn-lg" onClick={() => next(false)}>
          ❌ Still learning
        </button>
        <span className="fc-counter">{known} known</span>
        <button className="btn fc-known-btn btn-lg" onClick={() => next(true)}>
          ✅ Got it!
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <Link to="/" className="btn btn-secondary btn-sm">← Back to library</Link>
      </div>
    </div>
  );
}