import { useState } from 'react';
import { User } from 'firebase/auth';
import { dbService } from '../../services/dbService';
import { Profile } from '../../types';
import { Save, Store, Phone, Link as LinkIcon, Info } from 'lucide-react';

interface SettingsPageProps {
  user: User;
  profile: Profile | null;
}

export default function SettingsPage({ user, profile }: SettingsPageProps) {
  const [businessName, setBusinessName] = useState(profile?.businessName || '');
  const [whatsappNumber, setWhatsappNumber] = useState(profile?.whatsappNumber || '');
  const [slug, setSlug] = useState(profile?.slug || '');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success', message: string } | null>(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const cleanNumber = whatsappNumber.replace(/\D/g, '');

    try {
      if (slug !== profile?.slug) {
        const isAvailable = await dbService.checkSlugAvailability(slug, user.uid);
        if (!isAvailable) {
          setStatus({ type: 'error', message: 'Este link já está em uso.' });
          setLoading(false);
          return;
        }
      }

      await dbService.saveProfile({
        ownerId: user.uid,
        businessName,
        whatsappNumber: cleanNumber,
        slug: slug.toLowerCase(),
        createdAt: profile?.createdAt || Date.now()
      });

      setStatus({ type: 'success', message: 'Configurações salvas com sucesso!' });
      window.location.reload();
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Erro ao salvar configurações.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Configurações</p>
        <h1 className="text-5xl font-black text-stone-900 tracking-tighter leading-[0.9]">
          Sua <span className="text-brand">Identidade</span>
        </h1>
        <p className="text-stone-500 font-medium mt-3">Ajuste as informações da sua loja e do seu link.</p>
      </header>

      {status && (
        <div className={`p-5 rounded-[28px] flex items-center gap-4 text-sm font-black uppercase tracking-widest border ${
          status.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-brand/10 text-brand border-brand/20'
        }`}>
          <Save className="w-5 h-5 flex-shrink-0" />
          <p>{status.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-10 md:p-14 rounded-[48px] border border-stone-100 shadow-xl shadow-stone-100/50 space-y-10">
        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-3 text-left">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2 pl-1">
              <Store className="w-4 h-4" />
              Nome do Negócio
            </label>
            <input 
              type="text" 
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              className="w-full px-6 py-5 bg-stone-50 border border-stone-100 rounded-[28px] focus:border-brand outline-none transition-all font-medium text-stone-900"
              placeholder="Ex: Burger House"
            />
          </div>

          <div className="space-y-3 text-left">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2 pl-1">
              <Phone className="w-4 h-4" />
              WhatsApp (Vendas)
            </label>
            <input 
              type="tel" 
              value={whatsappNumber}
              onChange={e => setWhatsappNumber(e.target.value)}
              className="w-full px-6 py-5 bg-stone-50 border border-stone-100 rounded-[28px] focus:border-brand outline-none transition-all font-medium text-stone-900"
              placeholder="Ex: 11999999999"
            />
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest pl-1">Apenas números com DDD</p>
          </div>

          <div className="space-y-3 text-left">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2 pl-1">
              <LinkIcon className="w-4 h-4" />
              Seu Link Personalizado
            </label>
            <div className="flex items-center gap-2 bg-stone-50 border border-stone-100 rounded-[28px] px-6 overflow-hidden focus-within:border-brand transition-all">
              <span className="text-stone-400 text-xs py-5 border-r border-stone-200 pr-5 whitespace-nowrap font-black uppercase tracking-widest">loja/</span>
              <input 
                type="text" 
                value={slug}
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="w-full py-5 bg-transparent outline-none font-black text-stone-900 tracking-tight"
                placeholder="nome-da-loja"
              />
            </div>
            <div className="bg-orange-50 p-4 rounded-2xl flex items-start gap-3 mt-4 border border-orange-100">
               <Info className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
               <p className="text-[10px] text-orange-900 font-bold uppercase tracking-widest leading-relaxed">
                 Atenção: Ao mudar o link, o endereço antigo parará de funcionar e você precisará atualizar suas redes sociais.
               </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto px-12 py-5 bg-brand text-white rounded-[32px] font-black text-sm uppercase tracking-widest hover:scale-[1.05] active:scale-[0.95] transition-all disabled:opacity-50 shadow-2xl shadow-orange-100 flex items-center justify-center gap-4"
        >
          {loading ? 'Processando...' : <><Save className="w-5 h-5" /> Salvar Configurações</>}
        </button>
      </form>
    </div>
  );
}
