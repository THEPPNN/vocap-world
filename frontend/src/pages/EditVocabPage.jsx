import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { vocab as vocabApi } from '../api';

export default function EditVocabPage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [form,    setForm]    = useState(null);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    vocabApi.getAll()
      .then(list => {
        const item = list.find(v => String(v.id) === id);
        if (!item) { navigate('/'); return; }
        setForm({
          word:             item.word,
          translation:      item.translation,
          example_sentence: item.example_sentence || '',
          synonyms:         item.synonyms.length ? item.synonyms : [''],
        });
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const setField = (field, value) =>
    setForm(f => ({ ...f, [field]: value }));

  const setSynonym = (i, value) => {
    const syns = [...form.synonyms];
    syns[i] = value;
    setForm(f => ({ ...f, synonyms: syns }));
  };

  const addSynonym    = () => setForm(f => ({ ...f, synonyms: [...f.synonyms, ''] }));
  const removeSynonym = (i) => {
    if (form.synonyms.length <= 1) return;
    setForm(f => ({ ...f, synonyms: f.synonyms.filter((_, idx) => idx !== i) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await vocabApi.update(id, {
        ...form,
        synonyms: form.synonyms.filter(s => s.trim()),
      });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!form)   return null;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Edit Word</h1>
        <Link to="/" className="btn btn-secondary">← Back</Link>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Word <span style={{ color: 'red' }}>*</span></label>
            <input
              className="form-input"
              type="text"
              value={form.word}
              onChange={e => setField('word', e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Translation / Meaning <span style={{ color: 'red' }}>*</span></label>
            <input
              className="form-input"
              type="text"
              value={form.translation}
              onChange={e => setField('translation', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Synonyms</label>
            <div className="synonyms-list">
              {form.synonyms.map((syn, i) => (
                <div key={i} className="synonym-row">
                  <input
                    className="form-input"
                    type="text"
                    value={syn}
                    onChange={e => setSynonym(i, e.target.value)}
                    placeholder={"Synonym " + (i + 1)}
                  />
                  {form.synonyms.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeSynonym(i)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="add-synonym-btn"
              onClick={addSynonym}
            >
              + Add synonym
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Example sentence</label>
            <textarea
              className="form-textarea"
              value={form.example_sentence}
              onChange={e => setField('example_sentence', e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-actions" style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end' }}>
            <Link to="/" className="btn btn-secondary">Cancel</Link>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : '💾 Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}