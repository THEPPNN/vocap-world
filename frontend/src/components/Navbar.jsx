import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); setMenuOpen(false); };
  const closeMenu = () => setMenuOpen(false);
  const navLinkClass = ({ isActive }) => 'nav-link' + (isActive ? ' active' : '');

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand" onClick={closeMenu}>
          📚 VocabVault
        </NavLink>

        {/* Desktop */}
        <div className="navbar-nav desktop-nav">
          <NavLink to="/" end className={navLinkClass}>Library</NavLink>
          <NavLink to="/flashcard" className={navLinkClass}>Flashcard</NavLink>
          <NavLink to="/typing"    className={navLinkClass}>⌨️ Typing</NavLink>
          <NavLink to="/mastered"  className={navLinkClass}>🏆 Mastered</NavLink>
          <NavLink to="/list"      className={navLinkClass}>Study</NavLink>
          <NavLink to="/add"       className={navLinkClass}>+ Add</NavLink>
          <span className="nav-user">👤 {user?.username}</span>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Log out</button>
        </div>

        {/* Hamburger */}
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mobile-menu">
          <NavLink to="/" end className={navLinkClass} onClick={closeMenu}>🏠 Library</NavLink>
          <NavLink to="/flashcard" className={navLinkClass} onClick={closeMenu}>🃏 Flashcard</NavLink>
          <NavLink to="/typing"    className={navLinkClass} onClick={closeMenu}>⌨️ Typing Practice</NavLink>
          <NavLink to="/mastered"  className={navLinkClass} onClick={closeMenu}>🏆 Mastered</NavLink>
          <NavLink to="/list"      className={navLinkClass} onClick={closeMenu}>📋 Study List</NavLink>
          <NavLink to="/add"       className={navLinkClass} onClick={closeMenu}>➕ Add Word</NavLink>
          <div className="mobile-menu-footer">
            <span className="nav-user">👤 {user?.username}</span>
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>Log out</button>
          </div>
        </div>
      )}
    </nav>
  );
}