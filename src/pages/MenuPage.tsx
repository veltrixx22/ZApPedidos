import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, ImageIcon, Minus, Plus, ShoppingBag, X, Zap } from 'lucide-react';
import { formatCurrency } from '../lib/currency';
import { dbService } from '../services/dbService';
import type { CartItem, Product, Store } from '../types';

export default function MenuPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    async function loadMenu() {
      setLoading(true);
      const storeData = await dbService.getStoreBySlug(slug);
      setStore(storeData);
      if (storeData) setProducts(await dbService.getProducts(storeData.id, true));
      setLoading(false);
    }
    loadMenu();
  }, [slug]);

  const categories = useMemo(() => Array.from(new Set(products.map(product => product.category || 'Geral'))).sort(), [products]);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const deliveryFee = Number(store?.deliveryFee || 0);
  const orderTotal = cartTotal + deliveryFee;
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const addToCart = (product: Product) => {
    setCart(current => {
      const existing = current.find(item => item.id === product.id);
      if (existing) return current.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(current => {
      const existing = current.find(item => item.id === productId);
      if (existing && existing.quantity > 1) return current.map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item);
      return current.filter(item => item.id !== productId);
    });
  };

  if (loading) return <Loading />;

  if (!store) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-site p-6 text-center">
        <div>
          <h1 className="text-3xl font-black">Cardapio nao encontrado</h1>
          <p className="mt-3 font-medium text-stone-500">Confira se o link da loja esta correto.</p>
          <Link to="/" className="mt-6 inline-flex rounded-2xl bg-brand px-6 py-4 font-black text-white">Voltar</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-2xl bg-white shadow-2xl shadow-stone-200">
      <header className="border-b border-stone-100 px-6 pb-8 pt-10">
        <div className="mb-5 flex items-center gap-2 text-stone-400">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand text-white">
            <Zap className="h-3 w-3 fill-current" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">ZapPedido</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight">{store.businessName}</h1>
        <p className="mt-2 text-sm font-bold text-green-600">Pedido direto pelo WhatsApp</p>
      </header>

      {categories.length > 0 && (
        <nav className="sticky top-0 z-20 flex gap-3 overflow-x-auto border-b border-stone-100 bg-white/95 px-5 py-4 backdrop-blur">
          {categories.map(category => (
            <a key={category} href={`#${category}`} className="whitespace-nowrap rounded-2xl bg-stone-50 px-5 py-3 text-xs font-black uppercase tracking-widest text-stone-600 ring-1 ring-stone-100">
              {category}
            </a>
          ))}
        </nav>
      )}

      <main className="space-y-10 px-6 py-8 pb-36">
        {products.length === 0 ? (
          <div className="rounded-[32px] bg-stone-50 p-10 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-stone-300" />
            <p className="mt-4 font-black text-stone-500">Nenhum produto disponivel.</p>
          </div>
        ) : categories.map(category => (
          <section key={category} id={category}>
            <h2 className="mb-4 text-xs font-black uppercase tracking-widest text-stone-400">{category}</h2>
            <div className="space-y-4">
              {products.filter(product => (product.category || 'Geral') === category).map(product => (
                <ProductCard key={product.id} product={product} onAdd={() => addToCart(product)} />
              ))}
            </div>
          </section>
        ))}
      </main>

      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-5 z-30 mx-auto max-w-2xl px-5">
          <button
            onClick={() => setCheckoutOpen(true)}
            className="flex w-full items-center justify-between rounded-[28px] bg-brand p-5 font-black text-white shadow-2xl shadow-orange-200"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand">{cartCount}</span>
              Ver sacola
            </span>
            <span className="flex items-center gap-2">{formatCurrency(orderTotal)} <ChevronRight className="h-5 w-5" /></span>
          </button>
        </div>
      )}

      {checkoutOpen && (
        <Checkout
          store={store}
          cart={cart}
          subtotal={cartTotal}
          deliveryFee={deliveryFee}
          onClose={() => setCheckoutOpen(false)}
          onAdd={addToCart}
          onRemove={removeFromCart}
        />
      )}
    </div>
  );
}

function ProductCard({ product, onAdd }: { key?: string; product: Product; onAdd: () => void }) {
  return (
    <article className="flex gap-4 rounded-[28px] bg-white p-3 ring-1 ring-stone-100">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-3xl bg-stone-100">
        <ImageWithFallback src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1 py-1">
        <h3 className="text-lg font-black leading-tight">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm font-medium text-stone-500">{product.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-black text-brand">{formatCurrency(product.price)}</span>
          <button onClick={onAdd} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-white">
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </article>
  );
}

function ImageWithFallback({ src, alt, className }: { src?: string; alt: string; className: string }) {
  const [loaded, setLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setImageFailed(false);
  }, [src]);

  if (!src || imageFailed) {
    return (
      <div className={`${className} flex items-center justify-center bg-stone-100 text-stone-300`}>
        <ImageIcon className="h-7 w-7" />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {!loaded && <div className="absolute inset-0 bg-stone-100" />}
      <img
        src={src}
        alt={alt}
        className={className}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setLoaded(true);
          setImageFailed(true);
        }}
      />
    </div>
  );
}

function Checkout({ store, cart, subtotal, deliveryFee, onClose, onAdd, onRemove }: { store: Store; cart: CartItem[]; subtotal: number; deliveryFee: number; onClose: () => void; onAdd: (product: Product) => void; onRemove: (id: string) => void }) {
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!customerName.trim() || !address.trim()) {
      setError('Informe nome e endereco para finalizar.');
      return;
    }
    window.open(generateWhatsAppLink({ store, cart, subtotal, deliveryFee, customerName, address, paymentMethod, notes }), '_blank');
  };

  const total = subtotal + deliveryFee;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-stone-950/60 backdrop-blur-sm sm:items-center sm:p-6">
      <form onSubmit={handleSubmit} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[36px] bg-white p-6 shadow-2xl sm:rounded-[36px]">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-black">Finalizar pedido</h2>
          <button type="button" onClick={onClose} className="icon-button"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-4">
          {cart.map(item => (
            <div key={item.id} className="flex items-center gap-4 rounded-2xl bg-stone-50 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-black">{item.name}</p>
                <p className="text-sm font-bold text-brand">{formatCurrency(item.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => onRemove(item.id)} className="icon-button"><Minus className="h-4 w-4" /></button>
                <span className="w-6 text-center font-black">{item.quantity}</span>
                <button type="button" onClick={() => onAdd(item)} className="icon-button"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="my-6 space-y-3 border-y border-stone-100 py-5">
          <div className="flex items-center justify-between text-sm font-bold text-stone-500">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm font-bold text-stone-500">
            <span>Taxa de entrega</span>
            <span>{deliveryFee > 0 ? formatCurrency(deliveryFee) : 'Grátis'}</span>
          </div>
          <div className="flex items-center justify-between text-xl font-black">
            <span>Total</span>
            <span className="text-brand">{formatCurrency(total)}</span>
          </div>
        </div>

        {error && <p className="mb-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600">{error}</p>}

        <div className="grid gap-4">
          <input value={customerName} onChange={event => setCustomerName(event.target.value)} placeholder="Seu nome" className="input-field" />
          <textarea value={address} onChange={event => setAddress(event.target.value)} placeholder="Endereco de entrega" rows={3} className="input-field resize-none" />
          <select value={paymentMethod} onChange={event => setPaymentMethod(event.target.value)} className="input-field">
            <option>PIX</option>
            <option>Dinheiro</option>
            <option>Cartao de Credito</option>
            <option>Cartao de Debito</option>
          </select>
          <input value={notes} onChange={event => setNotes(event.target.value)} placeholder="Observacao" className="input-field" />
          <button className="rounded-[28px] bg-whatsapp px-8 py-5 font-black uppercase tracking-widest text-white">
            Finalizar pedido no WhatsApp
          </button>
        </div>
      </form>
    </div>
  );
}

function generateWhatsAppLink({ store, cart, subtotal, deliveryFee, customerName, address, paymentMethod, notes }: {
  store: Store;
  cart: CartItem[];
  subtotal: number;
  deliveryFee: number;
  customerName: string;
  address: string;
  paymentMethod: string;
  notes: string;
}) {
  const cleanNumber = store.whatsappNumber.replace(/[\s()+-]/g, '').replace(/\D/g, '');
  const finalNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;
  let message = `Olá, gostaria de fazer um pedido pelo ZapPedido.\n\n`;
  message += `Loja: ${store.businessName}\n\n`;
  message += `Cliente: ${customerName}\n`;
  message += `Endereço: ${address}\n`;
  message += `Pagamento: ${paymentMethod}\n\n`;
  message += `Pedido:\n`;
  cart.forEach(item => {
    message += `- ${item.quantity}x ${item.name} — R$ ${item.price.toFixed(2).replace('.', ',')} cada\n`;
  });
  message += `\nSubtotal: ${formatCurrency(subtotal)}\n`;
  message += `Taxa de entrega: ${deliveryFee > 0 ? formatCurrency(deliveryFee) : 'Grátis'}\n`;
  message += `Total: ${formatCurrency(subtotal + deliveryFee)}\n`;
  if (notes.trim()) message += `\nObservação:\n${notes.trim()}`;
  return `https://wa.me/${finalNumber}?text=${encodeURIComponent(message)}`;
}

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-site">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
        <p className="font-bold text-stone-500">Carregando cardapio...</p>
      </div>
    </div>
  );
}
