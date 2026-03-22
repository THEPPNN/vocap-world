import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar       from './components/Navbar';
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage     from './pages/HomePage';
import AddVocabPage from './pages/AddVocabPage';
import EditVocabPage from './pages/EditVocabPage';
import FlashcardPage from './pages/FlashcardPage';
import ListPage      from './pages/ListPage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Private */}
        <Route path="/"           element={<PrivateRoute><HomePage /></PrivateRoute>} />
        <Route path="/add"        element={<PrivateRoute><AddVocabPage /></PrivateRoute>} />
        <Route path="/edit/:id"   element={<PrivateRoute><EditVocabPage /></PrivateRoute>} />
        <Route path="/flashcard"  element={<PrivateRoute><FlashcardPage /></PrivateRoute>} />
        <Route path="/list"       element={<PrivateRoute><ListPage /></PrivateRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
