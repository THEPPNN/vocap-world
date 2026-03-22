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

export default function ListPage() {
  const [vocabs,    setVocabs]    = useState([]);
  const [displayed, setDisplayed] = useState([]);
  const [revealed,  setRevealed]  = useState({});
  const [search,    setSearch]    = useState('');
  const [shuffled,  setShuffled]  = useState(false);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    vocabApi.getAll()
      .then(data => { setVocabs(data); setDisplayed(data); })
      .finally(() => setLoading(false));
  }, []);

  // Filter
  useEffect(() => {
    const q = search.toLowerCase();
    const filtered = vocabs.filter(v =>
      v.word.toLowerCase().includes(q) ||
      v.synonyms.some(s => s.toLowerCase().includes(q))
    );
    setDisplayed(shuffled ? shuffle(filtered) : filtered);
    setRevealed({});
  }, [search, vocabs, shuffled]);

  const toggleReveal = (id) =>
    setRevealed(r => ({ ...r, [id]: !r[id] }));

  const revealAll = () => {
    const all = {};
    displayed.forEach(v => { all[v.id] = true; });
    setRevealed(all);
  };

  const hideAll = () => setRevealed({});

  const toggleShuffle = () => {
    setShuffled(s => !s);
    setDisplayed(d => shuffled ? [...vocabs].filter(v =>
      !search || v.word.toLowerCase().includes(search.toLowerCase()) ||
      v.synonyms.some(s => s.toLowerCase().includes(search.toLowerCase()))
    ) : shuffle(d));
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  if (vocabs.length === 0) {
    return (
      <div className="page-wrapper">
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>ยังไม่มีคำศัพท์</h3>
          <p>เพิ่มคำศัพท์ก่อนเพื่อเริ่มท่อง</p>
          <Link to="/add" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            + เพิ่มคำศัพท์
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">ท่องคำศัพท์ 📋</h1>
          <p className="page-subtitle">{displayed.length} คำศัพท์</p>
        </div>
        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="search-bar"
            type="text"
            placeholder="🔍 ค้นหา…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <button
          className={`btn btn-sm ${shuffled ? 'btn-primary' : 'btn-secondary'}`}
          onClick={toggleShuffle}
        >
          🔀 {shuffled ? 'ยกเลิกสุ่ม' : 'สุ่มลำดับ'}
        </button>
        <button className="btn btn-success btn-sm" onClick={revealAll}>
          👁 เปิดทั้งหมด
        </button>
        <button className="btn btn-secondary btn-sm" onClick={hideAll}>
          🙈 ปิดทั้งหมด
        </button>
      </div>

      {displayed.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>ไม่พบคำศัพท์</h3>
        </div>
      ) : (
        <div className="study-list">
          {displayed.map((v, idx) => (
            <div key={v.id} className="study-item">
              <div
                className="study-item-header"
                onClick={() => toggleReveal(v.id)}
              >
                <div className="study-word-row">
                  <span style={{ color: 'var(--text-3)', fontSize: '.85rem', fontWeight: 600, minWidth: '2rem' }}>
                    {idx + 1}.
                  </span>
                  <span className="study-word">{v.word}</span>
                  {v.synonyms.length > 0 && (
                    <div className="study-synonyms">
                      {v.synonyms.map((s, i) => (
                        <span key={i} className="tag">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  className={`reveal-btn ${revealed[v.id] ? 'revealed' : ''}`}
                  onClick={e => { e.stopPropagation(); toggleReveal(v.id); }}
                >
                  {revealed[v.id] ? '🙈 ซ่อน' : '👁 ดูคำแปล'}
                </button>
              </div>

              {revealed[v.id] && (
                <div className="study-reveal">
                  <div className="study-translation">📖 {v.translation}</div>
                  {v.example_sentence && (
                    <div className="study-example">"{v.example_sentence}"</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
