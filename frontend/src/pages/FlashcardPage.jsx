import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { vocab as vocabApi } from "../api";

// ── Text-to-Speech ────────────────────────────────────────────────────────────
function speak(text, lang = "en-US") {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = 0.9;
  window.speechSynthesis.speak(utter);
}

function SpeakButton({ text, lang }) {
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = (e) => {
    e.stopPropagation(); // don't flip the card
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang || "en-US";
    utter.rate = 0.9;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  return (
    <button
      className={`speak-btn ${speaking ? "speaking" : ""}`}
      onClick={handleSpeak}
      title="Listen to pronunciation"
      aria-label="Speak"
    >
      {speaking ? "🔊" : "🔈"}
    </button>
  );
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardPage() {
  const [vocabs, setVocabs] = useState([]);
  const [deck, setDeck] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [mastering, setMastering] = useState(null); // id being saved

  useEffect(() => {
    vocabApi
      .getAll()
      .then((data) => {
        setVocabs(data);
        // Only show unmastered words
        setDeck(shuffle(data.filter((v) => !v.is_mastered)));
      })
      .finally(() => setLoading(false));
  }, []);

  const restart = () => {
    setDeck(shuffle(vocabs.filter((v) => !v.is_mastered)));
    setIndex(0);
    setFlipped(false);
    setKnown(0);
    setDone(false);
  };

  const restartAll = () => {
    setDeck(shuffle(vocabs));
    setIndex(0);
    setFlipped(false);
    setKnown(0);
    setDone(false);
  };

  const advance = (wasKnown) => {
    if (wasKnown) setKnown((k) => k + 1);
    if (index + 1 >= deck.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  };

  // Mark as mastered → remove from deck permanently
  const handleMaster = async () => {
    const card = deck[index];
    setMastering(card.id);
    try {
      await vocabApi.setMastered(card.id, true);
      // Update local vocabs state
      setVocabs((vs) =>
        vs.map((v) => (v.id === card.id ? { ...v, is_mastered: true } : v)),
      );
      // Remove from deck
      const newDeck = deck.filter((_, i) => i !== index);
      if (newDeck.length === 0) {
        setDone(true);
      } else {
        setDeck(newDeck);
        setIndex((i) => Math.min(i, newDeck.length - 1));
        setFlipped(false);
      }
    } catch (e) {
      alert("Failed to save: " + e.message);
    } finally {
      setMastering(null);
    }
  };

  if (loading)
    return (
      <div className="spinner-wrap">
        <div className="spinner" />
      </div>
    );

  const masteredCount = vocabs.filter((v) => v.is_mastered).length;

  if (vocabs.length === 0) {
    return (
      <div className="page-wrapper flashcard-page">
        <div className="empty-state">
          <div className="empty-state-icon">🃏</div>
          <h3>No words yet</h3>
          <p>Add some words to start practicing</p>
          <Link
            to="/add"
            className="btn btn-primary"
            style={{ marginTop: "1rem" }}
          >
            + Add Word
          </Link>
        </div>
      </div>
    );
  }

  if (deck.length === 0 && !done) {
    return (
      <div className="page-wrapper flashcard-page">
        <div className="empty-state">
          <div className="empty-state-icon">🏆</div>
          <h3>All {masteredCount} words mastered!</h3>
          <p>You've marked every word as mastered.</p>
          <div
            style={{
              display: "flex",
              gap: ".75rem",
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: "1.25rem",
            }}
          >
            <button className="btn btn-primary" onClick={restartAll}>
              Practice all again
            </button>
            <Link to="/mastered" className="btn btn-secondary">
              View mastered words
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    const pct = deck.length > 0 ? Math.round((known / deck.length) * 100) : 100;
    return (
      <div className="page-wrapper flashcard-page">
        <h1 className="page-title" style={{ marginBottom: "1.5rem" }}>
          Session Complete 🎉
        </h1>
        <div className="card fc-result-card">
          <div className="fc-result-score">{pct}%</div>
          <div className="fc-result-label">
            Remembered {known} of {deck.length} words
          </div>
          {masteredCount > 0 && (
            <p
              style={{
                color: "var(--success)",
                fontSize: ".9rem",
                marginBottom: "1rem",
              }}
            >
              🏆 {masteredCount} word{masteredCount !== 1 ? "s" : ""} mastered
              total
            </p>
          )}
          <div
            style={{
              display: "flex",
              gap: ".75rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button className="btn btn-primary btn-lg" onClick={restart}>
              🔄 Play again
            </button>
            {masteredCount > 0 && (
              <Link to="/mastered" className="btn btn-secondary btn-lg">
                🏆 View mastered
              </Link>
            )}
            <Link to="/" className="btn btn-secondary btn-lg">
              Back to library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const card = deck[index];
  const progress = (index / deck.length) * 100;

  return (
    <div className="fc-page-layout">
      {/* Header */}
      <div className="fc-header">
        <h1 className="page-title">Flashcard 🃏</h1>
        {masteredCount > 0 && (
          <Link to="/mastered" className="btn btn-secondary btn-sm">
            🏆 {masteredCount} mastered
          </Link>
        )}
      </div>

      {/* Progress */}
      <div className="flashcard-progress">
        {index + 1} / {deck.length}
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="flashcard-scene" onClick={() => setFlipped((f) => !f)}>
        <div className={`flashcard-inner ${flipped ? "flipped" : ""}`}>
          <div className="flashcard-face flashcard-front">
            <div className="fc-word-row">
              <div className="fc-word">{card.word}</div>
              <SpeakButton text={card.word} lang="en-US" />
            </div>
            <small>{card.example_sentence}</small>
            {card.synonyms?.length > 0 && (
              <div className="fc-synonyms">
                {card.synonyms.map((s, i) => (
                  <span key={i} className="fc-syn-tag">
                    {s}
                  </span>
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
            <div
              className="fc-hint"
              style={{ color: "var(--text-3)", marginTop: ".75rem" }}
            >
              Tap to flip back
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="fc-controls-wrap">
        <div className="flashcard-controls">
          <button
            className="btn fc-unknown-btn btn-lg"
            onClick={() => advance(false)}
          >
            ❌ Still learning
          </button>
          <span className="fc-counter">{known} known</span>
          <button
            className="btn fc-known-btn btn-lg"
            onClick={() => advance(true)}
          >
            ✅ Got it!
          </button>
        </div>

        {/* Master button */}
        <button
          className="btn fc-master-btn"
          onClick={handleMaster}
          disabled={mastering === card.id}
          title="Mark as mastered — won't appear in flashcards again"
        >
          {mastering === card.id ? "Saving…" : "🏆 Mark as mastered"}
        </button>

        <Link to="/" className="fc-back-link">
          ← Back to library
        </Link>
      </div>
    </div>
  );
}
