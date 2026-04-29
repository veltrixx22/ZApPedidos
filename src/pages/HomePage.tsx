import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingCart, Smartphone, Send, Zap, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-200 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
      <div className="absolute top-1/4 -right-24 w-64 h-64 bg-green-200 rounded-full blur-[100px] opacity-10 pointer-events-none"></div>

      {/* Header */}
      <header className="px-6 md:px-12 py-8 flex items-center justify-between bg-transparent relative z-10">
        <div className="flex items-center gap-2">
          <div className="bg-brand w-8 h-8 rounded-lg flex items-center justify-center">
            <span className="text-white font-black">Z</span>
          </div>
          <span className="font-display font-black text-2xl tracking-tighter text-stone-900">ZapPedido</span>
        </div>
        <div className="flex items-center gap-6">
          <button className="hidden md:block text-sm font-semibold text-stone-500 hover:text-stone-900 transition-colors">Funcionalidades</button>
          <button className="hidden md:block text-sm font-semibold text-stone-500 hover:text-stone-900 transition-colors">Preços</button>
          <button 
            onClick={() => navigate('/entrar')}
            className="text-brand font-black text-sm tracking-tight hover:scale-105 transition-transform"
          >
            Entrar
          </button>
        </div>
      </header>

      {/* Hero Section - Split Grid */}
      <section className="px-6 md:px-12 pt-20 md:pt-32 pb-24 max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 xl:col-span-5 pt-12 text-left"
          >
            <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-black rounded-full mb-6 uppercase tracking-widest">
              7 Dias Grátis
            </span>
            <h1 className="font-display text-[56px] md:text-[80px] font-black leading-[0.9] tracking-tighter text-stone-900 mb-8">
              Seu cardápio <br/>online com <br/>
              <span className="text-brand font-black-italic">pedidos</span> no <br/>
              WhatsApp
            </h1>
            <p className="text-xl text-stone-600 mb-10 max-w-sm leading-relaxed font-medium">
              Crie seu menu digital em minutos e receba pedidos organizados direto no seu celular. Sem taxas ocultas.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <button 
                onClick={() => navigate('/entrar')}
                className="w-full sm:w-auto px-10 py-5 bg-brand text-white rounded-2xl font-black text-lg shadow-2xl shadow-orange-200 hover:bg-orange-600 hover:scale-105 transition-all"
              >
                Começar agora
              </button>
              <div className="flex flex-col">
                <span className="text-xl font-black text-stone-900 tracking-tighter">R$ 19,90</span>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">por mês, sem comissão</span>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Interface Preview (Artistic Flair) */}
          <div className="lg:col-span-6 xl:col-span-7 relative h-[500px] md:h-[600px] hidden lg:block">
            {/* Dashboard Card Preview */}
            <motion.div 
              initial={{ opacity: 0, rotate: 10, y: 50 }}
              animate={{ opacity: 1, rotate: 2, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="absolute top-0 right-0 w-[420px] bg-white rounded-[32px] shadow-2xl border border-stone-100 p-8 z-0"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-black text-stone-400 tracking-widest">Dashboard do Lojista</span>
                  <span className="text-xl font-black text-stone-900">Burger House 🍔</span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center">
                  <div className="w-2 h-2 bg-whatsapp rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-stone-50 rounded-2xl flex items-center justify-between border border-stone-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-200 rounded-xl" />
                    <div>
                      <p className="font-black text-sm text-stone-900 leading-none">X-Burger Clássico</p>
                      <p className="text-xs font-bold text-stone-500 mt-1 italic">R$ 24,90</p>
                    </div>
                  </div>
                  <div className="w-8 h-4 bg-brand rounded-full relative">
                    <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-orange-50 rounded-2xl flex items-center justify-between border border-orange-100">
                <div className="text-[10px] font-black text-orange-800 font-mono">zappedido.app/loja/burger-house</div>
                <button className="text-[10px] uppercase font-black text-brand tracking-widest">Copiar Link</button>
              </div>
            </motion.div>

            {/* Mobile Frame Preview */}
            <motion.div 
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute left-0 top-20 w-[260px] h-[500px] bg-stone-900 rounded-[50px] p-2.5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] z-10 border-[6px] border-stone-800"
            >
              <div className="w-full h-full bg-white rounded-[38px] overflow-hidden flex flex-col relative">
                <div className="pt-8 px-5 pb-4">
                  <h2 className="text-lg font-black tracking-tight text-stone-900">Burger House</h2>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Aberto agora • 20-30 min</p>
                </div>
                <div className="flex-1 p-5 pt-0">
                  <div className="w-full h-32 bg-gradient-to-br from-orange-400 to-brand rounded-2xl mb-4" />
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <h3 className="text-sm font-black text-stone-900">X-Burger</h3>
                        <p className="text-[8px] text-stone-500 leading-tight font-medium mt-0.5">Pão brioche, carne Angus 150g...</p>
                        <p className="text-xs font-black-italic text-brand mt-1">R$ 24,90</p>
                      </div>
                      <div className="w-8 h-8 bg-brand text-white rounded-xl flex items-center justify-center font-bold">+</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white border-t border-stone-100">
                  <div className="w-full py-3 bg-whatsapp text-white rounded-xl font-black text-[10px] uppercase tracking-widest text-center">
                    Finalizar no WhatsApp
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits - Simplified artistic look */}
      <section className="bg-stone-50/50 py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <BenefitCard 
              icon={<Zap className="w-8 h-8 text-brand fill-current" />}
              title="Configuração Rápida"
              description="Em menos de 5 minutos seu cardápio está no ar pronto para receber pedidos."
            />
            <BenefitCard 
              icon={<Send className="w-8 h-8 text-stone-900 fill-current" />}
              title="Pedidos no WhatsApp"
              description="Receba pedidos organizados e formatados diretamente no seu WhatsApp."
            />
            <BenefitCard 
              icon={<Smartphone className="w-8 h-8 text-brand" />}
              title="Mobile First"
              description="Experiência perfeita para seus clientes pedirem pelo celular."
            />
          </div>
        </div>
      </section>

      {/* Stats/Social Proof */}
      <section className="py-20 px-6 text-center bg-white">
        <h2 className="font-display text-3xl font-bold mb-12">Por que escolher o ZapPedido?</h2>
        <div className="flex flex-wrap justify-center gap-8 max-w-4xl mx-auto">
          <div className="p-6 bg-zinc-50 rounded-2xl flex-1 min-w-[240px]">
            <p className="text-3xl font-bold text-brand mb-2">0%</p>
            <p className="text-zinc-600 font-medium">Taxa por pedido</p>
          </div>
          <div className="p-6 bg-zinc-50 rounded-2xl flex-1 min-w-[240px]">
            <p className="text-3xl font-bold text-brand mb-2">100%</p>
            <p className="text-zinc-600 font-medium">Link próprio seu</p>
          </div>
          <div className="p-6 bg-zinc-50 rounded-2xl flex-1 min-w-[240px]">
            <p className="text-3xl font-bold text-brand mb-2">24h</p>
            <p className="text-zinc-600 font-medium">Disponível sempre</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 px-6 bg-zinc-900 text-white text-center">
        <div className="flex items-center justify-center gap-2 mb-6 opacity-80">
          <Zap className="w-5 h-5" />
          <span className="font-display font-bold text-lg">ZapPedido</span>
        </div>
        <p className="text-zinc-400 text-sm">© 2024 ZapPedido - O seu cardápio digital.</p>
      </footer>
    </div>
  );
}

function BenefitCard({ icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-6">{icon}</div>
      <h3 className="font-display text-xl font-bold mb-3">{title}</h3>
      <p className="text-zinc-500 leading-relaxed">{description}</p>
    </div>
  );
}
