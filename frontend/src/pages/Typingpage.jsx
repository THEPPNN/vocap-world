import { useState, useEffect, useRef, useCallback } from 'react';
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

function buildText(vocabs) {
  // Shuffle words and join with spaces — aim for ~40 words
  const words = shuffle(vocabs.map(v => v.word));
  const repeated = [];
  while (repeated.length < Math.min(40, words.length * 3)) {
    repeated.push(...shuffle(words));
  }
  return repeated.slice(0, Math.min(40, repeated.length)).join(' ');
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
}

export default function TypingPage() {
  const [vocabs,    setVocabs]    = useState([]);
  const [text,      setText]      = useState('');
  const [typed,     setTyped]     = useState('');
  const [started,   setStarted]   = useState(false);
  const [finished,  setFinished]  = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed,   setElapsed]   = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [totalErrors, setTotalErrors] = useState(0);

  const inputRef    = useRef(null);
  const timerRef    = useRef(null);
  const textAreaRef = useRef(null);

  useEffect(() => {
    vocabApi.getAll().then(data => {
      setVocabs(data);
      setText(buildText(data));
    }).finally(() => setLoading(false));
    return () => clearInterval(timerRef.current);
  }, []);

  // Focus input when clicking text area
  const focusInput = () => inputRef.current?.focus();

  const handleInput = useCallback((e) => {
    const val = e.target.value;

    // Start timer on first keystroke
    if (!started && val.length > 0) {
      setStarted(true);
      setStartTime(Date.now());
      timerRef.current = setInterval(() => {
        setElapsed(s => s + 1);
      }, 1000);
    }

    // Count new errors
    if (val.length > typed.length) {
      const i = val.length - 1;
      if (val[i] !== text[i]) {
        setTotalErrors(e => e + 1);
      }
    }

    setTyped(val);

    // Finished
    if (val.length >= text.length) {
      clearInterval(timerRef.current);
      setFinished(true);
    }
  }, [started, text, typed]);

  const restart = useCallback(() => {
    clearInterval(timerRef.current);
    setText(buildText(vocabs));
    setTyped('');
    setStarted(false);
    setFinished(false);
    setStartTime(null);
    setElapsed(0);
    setTotalErrors(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [vocabs]);

  // ── Stats ──
  const correctChars = typed.split('').filter((c, i) => c === text[i]).length;
  const minutes      = elapsed > 0 ? elapsed / 60 : 0.0001;
  const wpm          = Math.round((correctChars / 5) / minutes);
  const accuracy     = typed.length > 0
    ? Math.round((correctChars / typed.length) * 100)
    : 100;

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  if (vocabs.length < 2) {
    return (
      <div className="page-wrapper">
        <div className="empty-state">
          <div className="empty-state-icon">⌨️</div>
          <h3>Not enough words</h3>
          <p>Add at least 2 words to start typing practice</p>
          <Link to="/add" className="btn btn-primary" style={{ marginTop: '1rem' }}>+ Add Word</Link>
        </div>
      </div>
    );
  }

  // ── Result screen ──
  if (finished) {
    return (
      <div className="tp-wrapper">
        <div className="tp-result-card">
          <div className="tp-result-title">⌨️ Session complete!</div>
          <div className="tp-result-stats">
            <div className="tp-result-stat">
              <div className="tp-result-val">{wpm}</div>
              <div className="tp-result-label">WPM</div>
            </div>
            <div className="tp-result-stat">
              <div className="tp-result-val">{accuracy}%</div>
              <div className="tp-result-label">Accuracy</div>
            </div>
            <div className="tp-result-stat">
              <div className="tp-result-val">{formatTime(elapsed)}</div>
              <div className="tp-result-label">Time</div>
            </div>
            <div className="tp-result-stat">
              <div className="tp-result-val">{totalErrors}</div>
              <div className="tp-result-label">Errors</div>
            </div>
          </div>

          {/* Grade */}
          <div className="tp-grade">
            {accuracy >= 98 && wpm >= 40 ? '🏆 Excellent!'
              : accuracy >= 95 && wpm >= 25 ? '🎉 Great job!'
              : accuracy >= 90 ? '👍 Good work!'
              : '💪 Keep practicing!'}
          </div>

          <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={restart}>
              🔄 Try again
            </button>
            <Link to="/" className="btn btn-secondary btn-lg">Back to library</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Practice screen ──
  // Determine which word we're currently on (for scroll / highlight)
  const currentWordIdx = text.slice(0, typed.length).split(' ').length - 1;

  return (
    <div className="tp-wrapper">
      {/* Header */}
      <div className="tp-header">
        <div className="tp-title">⌨️ Typing Practice</div>
        <Link to="/" className="btn btn-secondary btn-sm">← Back</Link>
      </div>

      {/* Live stats */}
      <div className="tp-stats-bar">
        <div className="tp-stat-item">
          <span className="tp-stat-val">{started ? wpm : '—'}</span>
          <span className="tp-stat-lbl">WPM</span>
        </div>
        <div className="tp-stat-divider" />
        <div className="tp-stat-item">
          <span className="tp-stat-val">{started ? accuracy + '%' : '—'}</span>
          <span className="tp-stat-lbl">Accuracy</span>
        </div>
        <div className="tp-stat-divider" />
        <div className="tp-stat-item">
          <span className="tp-stat-val">{formatTime(elapsed)}</span>
          <span className="tp-stat-lbl">Time</span>
        </div>
        <div className="tp-stat-divider" />
        <div className="tp-stat-item">
          <span className="tp-stat-val">{totalErrors}</span>
          <span className="tp-stat-lbl">Errors</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="tp-progress-track">
        <div
          className="tp-progress-fill"
          style={{ width: `${(typed.length / text.length) * 100}%` }}
        />
      </div>

      {/* Text display */}
      <div
        className="tp-text-area"
        onClick={focusInput}
        ref={textAreaRef}
      >
        {!started && (
          <div className="tp-start-hint">Click here and start typing…</div>
        )}
        <div className="tp-text">
          {text.split('').map((char, i) => {
            let cls = 'tp-char';
            if (i < typed.length) {
              cls += typed[i] === char ? ' tp-correct' : ' tp-wrong';
            } else if (i === typed.length) {
              cls += ' tp-cursor';
            }
            // Space with wrong char
            if (char === ' ' && i < typed.length && typed[i] !== char) {
              cls += ' tp-wrong-space';
            }
            return (
              <span key={i} className={cls}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            );
          })}
        </div>
      </div>

      {/* Hidden input */}
      <textarea
        ref={inputRef}
        className="tp-hidden-input"
        value={typed}
        onChange={handleInput}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        aria-label="Type here"
      />

      {/* Controls */}
      <div className="tp-controls">
        <button className="btn btn-secondary" onClick={restart} title="Restart (Esc)">
          🔄 Restart
        </button>
        <span className="tp-word-count">
          {typed.split(' ').filter(Boolean).length} / {text.split(' ').length} words
        </span>
      </div>
    </div>
  );
}
