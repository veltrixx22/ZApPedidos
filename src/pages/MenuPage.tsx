import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbService } from '../services/dbService';
import type { Profile, Product, CartItem, OrderData } from '../types';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  ChevronRight, 
  X, 
  Zap, 
  Info, 
  MapPin, 
  CreditCard, 
  MessageSquare,
  AlertTriangle,
  ChevronLeft,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function MenuPage() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      setLoading(true);
      const shopProfile = await dbService.getProfileBySlug(slug);
      if (shopProfile) {
        setProfile(shopProfile);
        const shopProducts = await dbService.getProducts(shopProfile.ownerId, true);
        setProducts(shopProducts);
      }
      setLoading(false);
    }
    loadData();
  }, [slug]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)));
    return cats.sort();
  }, [products]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map(item => item.id === id ? { ...item, quantity: item.quantity - 1 } : item);
      }
      return prev.filter(item => item.id !== id);
    });
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-site flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
          <p className="font-black text-stone-500 uppercase tracking-widest text-[10px]">Buscando cardápio...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-bg-site flex items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <div className="bg-stone-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info className="w-10 h-10 text-stone-300" />
          </div>
          <h1 className="text-3xl font-black mb-2">Cardápio não encontrado</h1>
          <p className="text-stone-500 mb-8 font-medium">O link que você acessou pode estar incorreto ou a loja não existe mais.</p>
          <a href="/" className="px-8 py-4 bg-brand text-white rounded-2xl font-black shadow-xl shadow-orange-100">Voltar ao início</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans max-w-2xl mx-auto border-x border-stone-50 relative pb-32 shadow-2xl">
      {/* Header */}
      <header className="px-8 pt-12 pb-8 bg-white border-b border-stone-100">
        <div className="flex items-center gap-2 opacity-50 mb-4">
          <div className="w-4 h-4 bg-brand rounded flex items-center justify-center">
             <Zap className="w-2 h-2 text-white fill-current" />
          </div>
          <span className="text-[10px] font-black tracking-widest uppercase text-stone-900">ZapPedido</span>
        </div>
        <h1 className="text-4xl font-black text-stone-900 tracking-tighter">{profile.businessName}</h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded">Aberto agora</span>
          <span className="text-stone-400 text-xs font-bold">• 20-30 min</span>
        </div>
      </header>

      {/* Categories Navigation */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md z-30 px-6 py-4 border-b border-stone-100 overflow-x-auto whitespace-nowrap flex gap-3 no-scrollbar scroll-smooth">
        {categories.map(cat => (
          <a 
            key={cat} 
            href={`#${cat}`}
            className="px-5 py-2.5 bg-stone-50 rounded-2xl text-xs font-black text-stone-600 hover:bg-brand hover:text-white transition-all border border-stone-200 uppercase tracking-widest"
          >
            {cat}
          </a>
        ))}
      </div>

      {/* Menu List */}
      <div className="px-8 py-8 space-y-12">
        {products.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <div className="bg-stone-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-stone-300" />
            </div>
            <p className="font-black text-stone-500 uppercase text-xs tracking-widest">Nenhum produto disponível.</p>
          </div>
        ) : categories.map(cat => (
          <section key={cat} id={cat} className="space-y-6 pt-4">
            <h2 className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] mb-4">
              {cat}
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {products.filter(p => p.category === cat).map(product => (
                <div key={product.id}>
                  <ProductCard product={product} addToCart={addToCart} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Floating Cart Panel (Artistic Flair) */}
      <AnimatePresence>
        {cartCount > 0 && !isCartOpen && !isCheckoutOpen && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 inset-x-0 px-6 z-40 md:left-auto md:right-8 md:w-full md:max-w-md"
          >
            <button 
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-brand p-5 rounded-[28px] shadow-2xl shadow-orange-200 flex items-center justify-between text-white font-black group hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white text-brand w-10 h-10 rounded-xl flex items-center justify-center text-lg">
                  {cartCount}
                </div>
                <span className="uppercase tracking-widest text-xs">Ver Sacola</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-display font-black-italic tracking-tighter">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}
                </span>
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        cartTotal={cartTotal}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutFlow 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        cartTotal={cartTotal}
        profile={profile}
      />
    </div>
  );
}

function ProductCard({ product, addToCart }: { product: Product, addToCart: (p: Product) => void }) {
  return (
    <div className="flex gap-6 p-2 rounded-[32px] hover:bg-stone-50 transition-all group">
      <div className="flex-1 py-1">
        <h3 className="font-black text-lg text-stone-900 leading-tight tracking-tight">{product.name}</h3>
        <p className="text-stone-500 text-xs mt-1.5 line-clamp-2 leading-relaxed font-medium">{product.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-display font-black-italic text-brand text-lg tracking-tighter">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
          </span>
          <button 
            onClick={() => addToCart(product)}
            className="w-10 h-10 bg-brand text-white rounded-2xl shadow-xl shadow-orange-100 active:scale-90 transition-all flex items-center justify-center opacity-0 md:group-hover:opacity-100 lg:opacity-100"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>
      {product.imageUrl && (
        <div className="w-28 h-28 rounded-[28px] overflow-hidden flex-shrink-0 border border-stone-100 shadow-sm relative">
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-stone-900/5 group-hover:bg-transparent transition-colors" />
        </div>
      )}
    </div>
  );
}

function CartDrawer({ isOpen, onClose, cart, cartTotal, addToCart, removeFromCart, onCheckout }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md" />
      <motion.div 
        initial={{ y: '100%' }} animate={{ y: 0 }}
        className="relative bg-white w-full max-w-2xl h-[85vh] sm:h-auto sm:max-h-[80vh] rounded-t-[40px] sm:rounded-[40px] flex flex-col p-6 overflow-hidden"
      >
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100">
          <h2 className="text-2xl font-display font-bold">Sua Sacola</h2>
          <button onClick={onClose} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
          {cart.map((item: CartItem) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 overflow-hidden flex-shrink-0">
                {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm truncate">{item.name}</h4>
                <p className="text-brand text-xs font-bold font-display italic">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                </p>
              </div>
              <div className="flex items-center gap-3 bg-zinc-100 rounded-xl p-1">
                <button onClick={() => removeFromCart(item.id)} className="p-1 rounded-lg hover:bg-white transition-colors">
                  <Minus className="w-5 h-5 text-zinc-500" />
                </button>
                <span className="font-bold text-sm min-w-[1.5rem] text-center">{item.quantity}</span>
                <button onClick={() => addToCart(item)} className="p-1 rounded-lg hover:bg-white transition-colors">
                  <Plus className="w-5 h-5 text-brand" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-100 space-y-4">
          <div className="flex items-center justify-between text-zinc-500">
            <span>Subtotal</span>
            <span className="font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}</span>
          </div>
          <div className="flex items-center justify-between text-xl font-display font-bold text-zinc-900 border-t border-zinc-50 pt-4">
            <span>Total</span>
            <span className="text-brand italic">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}</span>
          </div>
          <button 
            onClick={() => { onClose(); onCheckout(); }}
            className="w-full py-5 bg-brand text-white rounded-3xl font-bold text-lg shadow-xl shadow-orange-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Finalizar Pedido
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function CheckoutFlow({ isOpen, onClose, cart, cartTotal, profile }: any) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    paymentMethod: 'Dinheiro',
    notes: ''
  });

  if (!isOpen) return null;

  const generateWhatsAppLink = () => {
    const cleanNumber = profile.whatsappNumber.replace(/\D/g, '');
    const finalNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;
    
    let message = `Olá, gostaria de fazer um pedido pelo ZapPedido.\n\n`;
    message += `*Loja:* ${profile.businessName}\n\n`;
    message += `*Cliente:* ${formData.name}\n`;
    message += `*Endereço:* ${formData.address}\n`;
    message += `*Pagamento:* ${formData.paymentMethod}\n\n`;
    message += `*Pedido:*\n`;
    
    cart.forEach((item: CartItem) => {
      message += `- ${item.quantity}x ${item.name} — R$ ${item.price.toFixed(2)} cada\n`;
    });
    
    message += `\n*Total: R$ ${cartTotal.toFixed(2)}*\n\n`;
    
    if (formData.notes) {
      message += `*Observação:*\n${formData.notes}`;
    }

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${finalNumber}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md" />
      <motion.div 
        initial={{ y: '100%' }} animate={{ y: 0 }}
        className="relative bg-white w-full max-w-2xl h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-[40px] sm:rounded-[40px] flex flex-col p-8 overflow-hidden"
      >
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-display font-bold">Finalizar Pedido</h2>
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Passo {step} de 3</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
          {step === 1 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <User className="w-4 h-4" /> Nome Completo
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome"
                  className="w-full px-5 py-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl focus:border-brand outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Endereço de Entrega
                </label>
                <textarea 
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Rua, número, bairro e complemento"
                  rows={3}
                  className="w-full px-5 py-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl focus:border-brand outline-none transition-all resize-none"
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Método de Pagamento
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['Dinheiro', 'PIX', 'Cartão de Crédito', 'Cartão de Débito'].map(method => (
                  <button 
                    key={method}
                    onClick={() => setFormData({ ...formData, paymentMethod: method })}
                    className={`
                      p-4 rounded-2xl border-2 font-bold text-left transition-all
                      ${formData.paymentMethod === method ? 'border-brand bg-orange-50 text-brand' : 'border-zinc-100 text-zinc-500'}
                    `}
                  >
                    {method}
                  </button>
                ))}
              </div>
              <div className="space-y-2 pt-4">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Observações (Opcional)
                </label>
                <input 
                  type="text" 
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ex: Tirar cebola, troco para 50..."
                  className="w-full px-5 py-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl focus:border-brand outline-none transition-all"
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-8">
              <div className="bg-orange-50 p-6 rounded-[32px] border border-orange-100">
                <h4 className="font-bold text-orange-900 mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" /> Resumo do Pedido
                </h4>
                <div className="space-y-2">
                  {cart.map((item: CartItem) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-orange-700">{item.quantity}x {item.name}</span>
                      <span className="font-bold text-orange-900">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-orange-200 flex justify-between font-display font-bold text-lg text-orange-900">
                  <span>Total</span>
                  <span className="italic">R$ {cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-zinc-50 p-4 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Ao clicar em finalizar, você será redirecionado para o WhatsApp com a mensagem do seu pedido pronta. 
                  <span className="font-bold text-zinc-700"> Revise os dados antes de enviar.</span>
                </p>
              </div>
            </motion.div>
          )}
        </div>

        <div className="mt-8">
          {step < 3 ? (
            <button 
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && (!formData.name || !formData.address)}
              className="w-full py-5 bg-zinc-900 text-white rounded-3xl font-bold text-lg hover:bg-zinc-800 transition-all disabled:opacity-50"
            >
              Continuar
            </button>
          ) : (
            <button 
              onClick={generateWhatsAppLink}
              className="w-full py-5 bg-whatsapp text-white rounded-3xl font-bold text-lg shadow-xl shadow-green-100 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 animate-pulse active:animate-none"
            >
              Finalizar no WhatsApp
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

