import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vocab as vocabApi } from '../api';

export default function MasteredPage() {
  const [vocabs,    setVocabs]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [saving,    setSaving]    = useState(null);

  useEffect(() => {
    vocabApi.getAll()
      .then(data => setVocabs(data))
      .finally(() => setLoading(false));
  }, []);

  const mastered  = vocabs.filter(v => v.is_mastered);
  const filtered  = mastered.filter(v =>
    v.word.toLowerCase().includes(search.toLowerCase()) ||
    v.translation.toLowerCase().includes(search.toLowerCase())
  );

  const handleUnmaster = async (id) => {
    setSaving(id);
    try {
      await vocabApi.setMastered(id, false);
      setVocabs(vs => vs.map(v => v.id === id ? { ...v, is_mastered: false } : v));
    } catch (e) {
      alert('Failed: ' + e.message);
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">🏆 Mastered Words</h1>
          <p className="page-subtitle">
            {mastered.length} word{mastered.length !== 1 ? 's' : ''} mastered
          </p>
        </div>
        <Link to="/flashcard" className="btn btn-primary">🃏 Practice</Link>
      </div>

      {mastered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏆</div>
          <h3>No mastered words yet</h3>
          <p>Mark words as mastered during flashcard practice</p>
          <Link to="/flashcard" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Start practicing
          </Link>
        </div>
      ) : (
        <>
          <input
            className="search-bar"
            type="text"
            placeholder="🔍 Search mastered words…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ marginBottom: '1.25rem', maxWidth: 360 }}
          />

          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No results</h3>
            </div>
          ) : (
            <div className="mastered-list">
              {filtered.map((v, idx) => (
                <div key={v.id} className="mastered-item">
                  <div className="mastered-item-main">
                    <span className="mastered-num">{idx + 1}.</span>
                    <div className="mastered-content">
                      <div className="mastered-word">{v.word}</div>
                      <div className="mastered-translation">{v.translation}</div>
                      {v.synonyms?.length > 0 && (
                        <div className="vocab-synonyms" style={{ marginTop: '.25rem' }}>
                          {v.synonyms.map((s, i) => <span key={i} className="tag">{s}</span>)}
                        </div>
                      )}
                      {v.example_sentence && (
                        <div className="vocab-example" style={{ marginTop: '.35rem' }}>
                          "{v.example_sentence}"
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm unmaster-btn"
                    onClick={() => handleUnmaster(v.id)}
                    disabled={saving === v.id}
                    title="Move back to practice"
                  >
                    {saving === v.id ? '…' : '↩ Unmaster'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}