import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth as authApi } from '../api';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]       = useState({ username: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      return setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
    }
    setLoading(true);
    try {
      const data = await authApi.register(form);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>📚 VocabVault</h1>
          <p>คลังคำศัพท์ส่วนตัวของคุณ</p>
        </div>

        <h2 className="auth-title">สมัครสมาชิก</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">ชื่อผู้ใช้</label>
            <input
              className="form-input"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="username"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">รหัสผ่าน</label>
            <input
              className="form-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="อย่างน้อย 6 ตัวอักษร"
              required
            />
          </div>

          <button
            className="btn btn-primary btn-lg"
            type="submit"
            disabled={loading}
            style={{ width: '100%', marginTop: '.5rem' }}
          >
            {loading ? 'กำลังสมัคร…' : 'สมัครสมาชิก'}
          </button>
        </form>

        <p className="auth-footer">
          มีบัญชีอยู่แล้ว?{' '}
          <Link to="/login">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  );
}
