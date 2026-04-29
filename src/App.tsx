/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { dbService } from './services/dbService';
import type { Profile } from './types';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/Dashboard';
import MenuPage from './pages/MenuPage';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userProfile = await dbService.getProfile(user.uid);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 font-medium">Carregando ZapPedido...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/entrar" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/loja/:slug" element={<MenuPage />} />
        
        {/* Protected Dashboard Routes */}
        <Route 
          path="/dashboard/*" 
          element={user ? <DashboardPage user={user} profile={profile} /> : <Navigate to="/entrar" />} 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

