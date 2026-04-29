import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { dbService } from '../../services/dbService';
import { Profile } from '../../types';
import { Rocket, Store, Phone, Link as LinkIcon, Info, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileSetupProps {
  user: User;
  profile: Profile | null;
}

export default function ProfileSetup({ user, profile }: ProfileSetupProps) {
  const [businessName, setBusinessName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success', message: string } | null>(null);
  const navigate = useNavigate();

  // If profile exists, redirect back to home
  if (profile) {
    navigate('/dashboard');
    return null;
  }

  const handleSlugChange = (e: any) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(val);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    if (!businessName || !whatsappNumber || !slug) {
      setStatus({ type: 'error', message: 'Por favor, preencha todos os campos.' });
      setLoading(false);
      return;
    }

    // Clean whatsapp number
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      setStatus({ type: 'error', message: 'Número de WhatsApp inválido.' });
      setLoading(false);
      return;
    }

    try {
      const isAvailable = await dbService.checkSlugAvailability(slug, user.uid);
      if (!isAvailable) {
        setStatus({ type: 'error', message: 'Este link já está sendo usado. Escolha outro.' });
        setLoading(false);
        return;
      }

      await dbService.saveProfile({
        ownerId: user.uid,
        businessName,
        whatsappNumber: cleanNumber,
        slug: slug.toLowerCase(),
        createdAt: Date.now()
      });

      setStatus({ type: 'success', message: 'Perfil criado com sucesso!' });
      window.location.href = '/dashboard'; // Force reload to refresh profile state in App
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Ocorreu um erro ao salvar seu perfil.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 md:p-14 rounded-[56px] shadow-2xl shadow-stone-200 border border-stone-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand rounded-full blur-[100px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="flex flex-col items-center text-center mb-12 relative z-10">
          <div className="w-20 h-20 bg-stone-900 rounded-[28px] flex items-center justify-center mb-8 rotate-3 shadow-xl">
            <Rocket className="w-10 h-10 text-brand" />
          </div>
          <h1 className="text-4xl font-black text-stone-900 tracking-tighter leading-none">
            Vamos configurar <br/><span className="text-brand">sua loja</span>
          </h1>
          <p className="text-stone-500 font-medium mt-4 max-w-sm">
            Falta apenas um passo para você começar a vender pelo WhatsApp.
          </p>
        </div>

        {status && (
          <div className={`mb-8 p-5 rounded-[24px] flex items-center gap-4 text-sm font-black uppercase tracking-widest border ${
            status.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-brand/10 text-brand border-brand/20'
          }`}>
            {status.type === 'error' ? <Info className="w-5 h-5 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 flex-shrink-0" />}
            <p>{status.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2 pl-2">
              <Store className="w-4 h-4" />
              Nome do seu Negócio
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Ex: Pizzaria do João"
              className="w-full px-7 py-5 bg-stone-50 border border-stone-100 rounded-[28px] focus:border-brand focus:bg-white outline-none transition-all font-medium text-stone-900"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2 pl-2">
              <Phone className="w-4 h-4" />
              WhatsApp para Pedidos
            </label>
            <input
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="Ex: 11999999999"
              className="w-full px-7 py-5 bg-stone-50 border border-stone-100 rounded-[28px] focus:border-brand focus:bg-white outline-none transition-all font-medium text-stone-900"
              required
            />
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest pl-2">Apenas números, com DDD</p>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2 pl-2">
              <LinkIcon className="w-4 h-4" />
              Seu Link Personalizado
            </label>
            <div className="relative flex items-center bg-stone-50 border border-stone-100 rounded-[28px] px-7 focus-within:border-brand transition-all">
              <span className="text-stone-400 text-xs font-black uppercase tracking-widest border-r border-stone-200 pr-5 py-5 whitespace-nowrap">
                loja/
              </span>
              <input
                type="text"
                value={slug}
                onChange={handleSlugChange}
                placeholder="minhaloja"
                className="w-full pl-5 py-5 bg-transparent outline-none font-black text-stone-900 tracking-tight"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-stone-900 text-white rounded-[32px] font-black text-base uppercase tracking-widest hover:scale-[1.03] active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-stone-200 mt-6"
          >
            {loading ? 'Processando...' : 'Criar Minha Loja'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
