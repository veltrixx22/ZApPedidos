import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateStorePage from './pages/CreateStorePage';
import AdminPage from './pages/AdminPage';
import MenuPage from './pages/MenuPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/criar-loja" element={<CreateStorePage />} />
        <Route path="/admin/:slug" element={<AdminPage />} />
        <Route path="/loja/:slug" element={<MenuPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
