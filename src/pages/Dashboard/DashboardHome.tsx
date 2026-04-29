import { User } from 'firebase/auth';
import { Profile } from '../../types';
import { ExternalLink, Copy, Check, Zap, ShoppingBag, Eye, Package, Settings, ChevronRight } from 'lucide-react';
import { useState, ReactNode } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';

interface DashboardHomeProps {
  user: User;
  profile: Profile | null;
}

// ... rest of the file stays same, but I need to change the function component prop type

export default function DashboardHome({ user, profile }: DashboardHomeProps) {
  const [copied, setCopied] = useState(false);

  if (!profile) return null;

  const menuUrl = `${window.location.origin}/loja/${profile.slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Visão Geral</p>
          <h1 className="text-5xl font-black text-stone-900 tracking-tighter leading-[0.9]">
            Olá, <span className="text-brand">{user.displayName?.split(' ')[0] || 'Dono'}</span> 👋
          </h1>
        </div>
        
        <div className="bg-white p-4 rounded-3xl border border-stone-100 flex items-center gap-6 shadow-xl shadow-stone-100/50">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Seu Link</span>
            <span className="text-xs font-black text-stone-900 font-mono tracking-tight">{menuUrl.replace('https://', '')}</span>
          </div>
          <button 
            onClick={copyLink}
            className="px-6 py-3 bg-stone-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-stone-800 transition-all flex items-center gap-2"
          >
            {copied ? <Check size={14} className="text-brand" /> : <Copy size={14} />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
      </header>

      {/* Cards Stats - Artistic Flair */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <StatCard 
          icon={<ShoppingBag className="w-6 h-6 text-brand" />}
          label="Pedidos Recebidos"
          value="--"
          description="Inicie as vendas hoje"
        />
        <StatCard 
          icon={<Eye className="w-6 h-6 text-stone-900" />}
          label="Visualizações"
          value="--"
          description="Acompanhe o tráfego"
        />
        <StatCard 
          icon={<Zap className="w-6 h-6 text-brand fill-current" />}
          label="Status"
          value="Online"
          description="Sua loja está ativa"
        />
      </div>

      {/* Public Link Card - Modern Split Look */}
      <div className="bg-stone-900 text-white p-10 md:p-14 rounded-[48px] shadow-2xl flex flex-col lg:flex-row items-center gap-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand rounded-full blur-[120px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="flex-1 space-y-8 relative z-10 text-center lg:text-left">
          <div>
            <h2 className="text-4xl font-black tracking-tighter mb-4 leading-none">Complete seu <br/><span className="text-brand">cardápio</span> agora</h2>
            <p className="text-stone-400 font-medium leading-relaxed text-lg max-w-md">
              Adicione fotos atraentes e descrições suculentas para aumentar suas vendas pelo WhatsApp.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link 
              to="/dashboard/products"
              className="px-8 py-5 bg-brand text-white rounded-[28px] font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-orange-950/40 inline-flex items-center gap-3"
            >
              Gerenciar Produtos <ChevronRight className="w-5 h-5" />
            </Link>
            <a 
              href={menuUrl} 
              target="_blank" 
              className="px-8 py-5 bg-white/10 hover:bg-white/20 text-white rounded-[28px] font-black text-sm uppercase tracking-widest transition-all inline-flex items-center gap-3 border border-white/10"
              rel="noreferrer"
            >
              Ver Menu Online <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[40px] flex-shrink-0 shadow-2xl rotate-3 hover:translate-y-[-10px] hover:rotate-0 transition-all duration-500 group">
          <QRCodeSVG value={menuUrl} size={160} />
          <div className="mt-6 pt-4 border-t border-stone-50 text-center">
            <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest group-hover:text-brand transition-colors">Acesso Rápido</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, description }: { icon: ReactNode, label: string, value: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-[40px] border border-stone-100 shadow-xl shadow-stone-100/50 group hover:border-brand/20 transition-all">
      <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center mb-8 border border-stone-100 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-4xl font-black text-stone-900 tracking-tighter mb-2">{value}</p>
        <p className="text-xs text-stone-500 font-medium italic">{description}</p>
      </div>
    </div>
  );
}
