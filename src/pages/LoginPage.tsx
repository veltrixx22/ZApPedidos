import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { dbService } from '../services/dbService';
import { Zap, AlertCircle, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const profile = await dbService.getProfile(result.user.uid);
      
      if (profile) {
        navigate('/dashboard');
      } else {
        navigate('/dashboard/setup');
      }
    } catch (err: any) {
      console.error(err);
      setError('Falha ao entrar com Google. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-site flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-orange-100 rounded-full blur-[100px] opacity-20 -translate-x-1/2 -translate-y-12"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-green-100 rounded-full blur-[100px] opacity-10 translate-x-1/2 translate-y-12"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-10 md:p-14 rounded-[48px] shadow-2xl border border-stone-100 relative z-10"
      >
        <div className="flex flex-col items-center mb-12">
          <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-orange-100">
            <span className="text-white font-black text-3xl">Z</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tighter mb-4 text-center leading-[0.9]">
            Bem-vindo de <br/> <span className="text-brand font-black-italic">volta</span>
          </h1>
          <p className="text-stone-500 font-medium text-center text-sm md:text-base">Entre para gerenciar seu cardápio e ver seus pedidos.</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-4 py-5 bg-stone-900 hover:bg-stone-800 text-white rounded-[32px] font-black text-lg transition-all shadow-xl shadow-stone-200 disabled:opacity-50 group"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.63l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Entrar com Google</span>
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <p className="mt-10 text-center text-stone-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
          Ao entrar você concorda com nossos <br className="hidden md:block"/> termos de serviço.
        </p>
      </motion.div>
    </div>
  );
}
