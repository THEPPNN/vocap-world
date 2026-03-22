import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          📚 VocabVault
        </NavLink>

        <div className="navbar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            คลัง
          </NavLink>
          <NavLink
            to="/flashcard"
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            Flashcard
          </NavLink>
          <NavLink
            to="/list"
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            ท่องศัพท์
          </NavLink>
          <NavLink
            to="/add"
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            + เพิ่ม
          </NavLink>

          <span className="nav-user">👤 {user?.username}</span>

          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            ออกจากระบบ
          </button>
        </div>
      </div>
    </nav>
  );
}
