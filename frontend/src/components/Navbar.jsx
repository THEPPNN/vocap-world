import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  const navLinkClass = ({ isActive }) =>
    'nav-link' + (isActive ? ' active' : '');

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand" onClick={closeMenu}>
          📚 VocabVault
        </NavLink>

        {/* Desktop nav */}
        <div className="navbar-nav desktop-nav">
          <NavLink to="/" end className={navLinkClass}>คลัง</NavLink>
          <NavLink to="/flashcard" className={navLinkClass}>Flashcard</NavLink>
          <NavLink to="/list" className={navLinkClass}>ท่องศัพท์</NavLink>
          <NavLink to="/add" className={navLinkClass}>+ เพิ่ม</NavLink>
          <span className="nav-user">👤 {user?.username}</span>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            ออกจากระบบ
          </button>
        </div>

        {/* Hamburger button (mobile) */}
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="เมนู"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mobile-menu">
          <NavLink to="/" end className={navLinkClass} onClick={closeMenu}>🏠 คลัง</NavLink>
          <NavLink to="/flashcard" className={navLinkClass} onClick={closeMenu}>🃏 Flashcard</NavLink>
          <NavLink to="/list" className={navLinkClass} onClick={closeMenu}>📋 ท่องศัพท์</NavLink>
          <NavLink to="/add" className={navLinkClass} onClick={closeMenu}>➕ เพิ่มคำศัพท์</NavLink>
          <div className="mobile-menu-footer">
            <span className="nav-user">👤 {user?.username}</span>
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>
              ออกจากระบบ
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}