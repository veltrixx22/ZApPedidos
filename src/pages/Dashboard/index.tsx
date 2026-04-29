import { useState, useEffect, ReactNode } from 'react';
import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { User, signOut } from 'firebase/auth';
import { 
  LayoutDashboard, 
  Package, 
  Settings as SettingsIcon, 
  ExternalLink, 
  LogOut, 
  Zap, 
  Menu as MenuIcon, 
  X,
  Plus,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../../lib/firebase';
import type { Profile } from '../../types';

// Sub-pages
import DashboardHome from './DashboardHome';
import ProductList from './ProductList';
import SettingsPage from './SettingsPage';
import ProfileSetup from './ProfileSetup';

interface DashboardPageProps {
  user: User;
  profile: Profile | null;
}

export default function DashboardPage({ user, profile }: DashboardPageProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navItems = [
    { label: 'Visão Geral', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Cardápio', icon: Package, path: '/dashboard/products' },
    { label: 'Ajustes', icon: SettingsIcon, path: '/dashboard/settings' },
  ];

  useEffect(() => {
    if (!profile && location.pathname !== '/dashboard/setup') {
      navigate('/dashboard/setup');
    }
  }, [profile, location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-bg-site flex font-sans">
      {/* Desktop Sidebar (Artistic Flair) */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-stone-100 flex-col sticky top-0 h-screen shadow-xl shadow-stone-100/50">
        <div className="p-10">
          <div className="flex items-center gap-2 mb-10">
            <div className="bg-stone-900 w-8 h-8 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">Z</span>
            </div>
            <span className="font-display font-black text-xl tracking-tighter text-stone-900 leading-none">ZapPedido</span>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <SidebarLink 
                key={item.path}
                to={item.path} 
                icon={<item.icon size={20} />} 
                label={item.label} 
                active={location.pathname === item.path} 
              />
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-stone-50">
          {profile && (
            <div className="bg-stone-50 p-6 rounded-3xl mb-8 border border-stone-100">
              <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
                 <Zap className="w-5 h-5 text-brand fill-current" />
              </div>
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Link Público</p>
              <p className="text-[10px] font-black text-stone-900 truncate font-mono mb-4 text-brand">/loja/{profile.slug}</p>
              
              <Link 
                to={`/loja/${profile.slug}`}
                target="_blank"
                className="flex items-center justify-center gap-2 w-full py-3 bg-stone-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg"
              >
                Ver Cardápio <ExternalLink size={12} />
              </Link>
            </div>
          )}

          <div className="flex items-center gap-3 px-2 mb-6">
            {user.photoURL ? (
              <img src={user.photoURL} className="w-10 h-10 rounded-2xl border border-stone-100" alt="Avatar" />
            ) : (
              <div className="w-10 h-10 bg-stone-100 rounded-2xl flex items-center justify-center text-xs font-black uppercase text-stone-400">
                {user.displayName?.[0] || 'U'}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-black text-stone-900 truncate">{user.displayName || 'Usuário'}</p>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1 text-stone-400 font-extrabold text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        
        {/* Mobile Header */}
        <header className="lg:hidden h-20 bg-white border-b border-stone-100 px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="bg-stone-900 w-8 h-8 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">Z</span>
            </div>
            <span className="font-display font-black text-lg tracking-tighter">ZapPedido</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-stone-50 rounded-xl"
          >
            {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 relative z-10 max-w-6xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<DashboardHome user={user} profile={profile} />} />
            <Route path="/products" element={<ProductList user={user} />} />
            <Route path="/settings" element={<SettingsPage user={user} profile={profile} />} />
            <Route path="/setup" element={<ProfileSetup user={user} profile={profile} />} />
          </Routes>
        </div>
      </main>

      {/* Mobile Drawer (Artistic) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-white w-72 h-full shadow-2xl p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                 <div className="flex items-center gap-2">
                    <div className="bg-stone-900 w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs">Z</div>
                    <span className="font-display font-black text-xl tracking-tighter">ZapPedido</span>
                  </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-stone-50 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => (
                  <SidebarLink 
                    key={item.path}
                    to={item.path} 
                    icon={<item.icon size={20} />} 
                    label={item.label} 
                    active={location.pathname === item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                ))}
              </nav>

              <div className="mt-auto pt-8 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   {user.photoURL && <img src={user.photoURL} className="w-10 h-10 rounded-2xl border border-stone-100" alt="Avatar" />}
                   <div className="min-w-0">
                      <p className="text-[10px] font-black text-stone-900 truncate">{user.displayName || 'Usuário'}</p>
                      <button onClick={handleLogout} className="text-[10px] font-black text-red-500 uppercase tracking-widest">Sair</button>
                   </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SidebarLinkProps {
  key?: string;
  to: string;
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}

function SidebarLink({ to, icon, label, active, onClick }: SidebarLinkProps) {
  return (
    <Link 
      to={to}
      onClick={onClick}
      className={`
        flex items-center justify-between px-5 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest group
        ${active 
          ? 'bg-stone-900 text-white shadow-xl shadow-stone-200' 
          : 'text-stone-400 hover:text-stone-900 hover:bg-stone-50'}
      `}
    >
      <div className="flex items-center gap-4">
        <span className={active ? 'text-brand' : ''}>{icon}</span>
        {label}
      </div>
      {active && <ChevronRight size={14} className="text-brand" />}
    </Link>
  );
}
