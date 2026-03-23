import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { vocab as vocabApi } from '../api';

export default function HomePage() {
  const navigate = useNavigate();
  const [vocabs,  setVocabs]  = useState([]);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    vocabApi.getAll()
      .then(setVocabs)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this word?')) return;
    try {
      await vocabApi.remove(id);
      setVocabs(v => v.filter(x => x.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  const filtered = vocabs.filter(v =>
    v.word.toLowerCase().includes(search.toLowerCase()) ||
    v.translation.toLowerCase().includes(search.toLowerCase()) ||
    v.synonyms.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Library</h1>
          <p className="page-subtitle">{vocabs.length} word{vocabs.length !== 1 ? 's' : ''} total</p>
        </div>
        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
          <input
            className="search-bar"
            type="text"
            placeholder="🔍 Search words…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Link to="/add" className="btn btn-primary">+ Add Word</Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>{search ? 'No words found' : 'Your library is empty'}</h3>
          <p>{search ? 'Try a different search term' : 'Click "+ Add Word" to get started'}</p>
        </div>
      ) : (
        <div className="vocab-grid">
          {filtered.map(v => (
            <div key={v.id} className="vocab-card">
              <div className="vocab-word">{v.word}</div>
              <div className="vocab-translation">📖 {v.translation}</div>

              {v.synonyms.length > 0 && (
                <div className="vocab-synonyms">
                  {v.synonyms.map((s, i) => (
                    <span key={i} className="tag">{s}</span>
                  ))}
                </div>
              )}

              {v.example_sentence && (
                <div className="vocab-example">"{v.example_sentence}"</div>
              )}

              <div className="vocab-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate(`/edit/${v.id}`)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(v.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}