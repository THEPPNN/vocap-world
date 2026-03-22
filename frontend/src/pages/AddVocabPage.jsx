import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { vocab as vocabApi } from '../api';

const emptyForm = {
  word: '',
  translation: '',
  example_sentence: '',
  synonyms: [''],
};

export default function AddVocabPage() {
  const navigate = useNavigate();
  const [form,    setForm]    = useState(emptyForm);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (field, value) =>
    setForm(f => ({ ...f, [field]: value }));

  const setSynonym = (i, value) => {
    const syns = [...form.synonyms];
    syns[i] = value;
    setForm(f => ({ ...f, synonyms: syns }));
  };

  const addSynonym = () =>
    setForm(f => ({ ...f, synonyms: [...f.synonyms, ''] }));

  const removeSynonym = (i) => {
    if (form.synonyms.length <= 1) return;
    setForm(f => ({ ...f, synonyms: f.synonyms.filter((_, idx) => idx !== i) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await vocabApi.add({
        ...form,
        synonyms: form.synonyms.filter(s => s.trim()),
      });
      setSuccess('✅ เพิ่มคำศัพท์เรียบร้อยแล้ว!');
      setForm(emptyForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">เพิ่มคำศัพท์ใหม่</h1>
        </div>
        <Link to="/" className="btn btn-secondary">← กลับ</Link>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Word */}
          <div className="form-group">
            <label className="form-label">คำศัพท์ <span style={{ color: 'red' }}>*</span></label>
            <input
              className="form-input"
              type="text"
              value={form.word}
              onChange={e => setField('word', e.target.value)}
              placeholder="เช่น serendipity"
              required
              autoFocus
            />
          </div>

          {/* Translation */}
          <div className="form-group">
            <label className="form-label">คำแปล <span style={{ color: 'red' }}>*</span></label>
            <input
              className="form-input"
              type="text"
              value={form.translation}
              onChange={e => setField('translation', e.target.value)}
              placeholder="เช่น การค้นพบสิ่งดีโดยบังเอิญ"
              required
            />
          </div>

          {/* Synonyms */}
          <div className="form-group">
            <label className="form-label">คำเหมือน (Synonyms)</label>
            <div className="synonyms-list">
              {form.synonyms.map((syn, i) => (
                <div key={i} className="synonym-row">
                  <input
                    className="form-input"
                    type="text"
                    value={syn}
                    onChange={e => setSynonym(i, e.target.value)}
                    placeholder={`คำเหมือนที่ ${i + 1}`}
                  />
                  {form.synonyms.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeSynonym(i)}
                      title="ลบ"
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
              style={{ marginTop: '.5rem' }}
            >
              + เพิ่มคำเหมือน
            </button>
          </div>

          {/* Example */}
          <div className="form-group">
            <label className="form-label">ตัวอย่างประโยค</label>
            <textarea
              className="form-textarea"
              value={form.example_sentence}
              onChange={e => setField('example_sentence', e.target.value)}
              placeholder="เช่น It was pure serendipity that we met that day."
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end' }}>
            <Link to="/" className="btn btn-secondary">ยกเลิก</Link>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'กำลังบันทึก…' : '💾 บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
