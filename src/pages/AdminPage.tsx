import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Camera, CheckCircle2, Copy, Edit3, ExternalLink, Eye, EyeOff, ImageIcon, Plus, Save, Trash2, X } from 'lucide-react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { dbService } from '../services/dbService';
import type { Product, Store } from '../types';

const emptyProduct = {
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  category: '',
  isActive: true,
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_UPLOAD_TIMEOUT_MS = 30000;

function withUploadTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => {
        reject(new Error(`Upload demorou mais de ${IMAGE_UPLOAD_TIMEOUT_MS / 1000}s. Tente novamente ou cole um link da imagem.`));
      }, IMAGE_UPLOAD_TIMEOUT_MS);
    }),
  ]);
}

export default function AdminPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');

  const accessKey = `zappedido_admin_${slug}`;

  const loadStore = async () => {
    setLoading(true);
    const data = await dbService.getStoreBySlug(slug);
    setStore(data);
    setUnlocked(localStorage.getItem(accessKey) === 'true');
    if (data) setProducts(await dbService.getProducts(data.id));
    setLoading(false);
  };

  useEffect(() => {
    loadStore();
  }, [slug]);

  const handleUnlock = (event: FormEvent) => {
    event.preventDefault();
    if (!store) return;
    if (adminCode.trim() !== store.adminCode) {
      setError('Codigo de admin incorreto.');
      return;
    }
    localStorage.setItem(accessKey, 'true');
    setUnlocked(true);
    setError('');
  };

  if (loading) return <Loading text="Carregando painel..." />;

  if (!store) {
    return (
      <Centered>
        <h1 className="text-3xl font-black">Loja nao encontrada</h1>
        <Link to="/criar-loja" className="mt-6 inline-flex rounded-2xl bg-brand px-6 py-4 font-black text-white">Criar loja</Link>
      </Centered>
    );
  }

  if (!unlocked) {
    return (
      <Centered>
        <div className="w-full max-w-md rounded-[36px] bg-white p-8 shadow-xl ring-1 ring-stone-100">
          <h1 className="text-3xl font-black tracking-tight">Acessar painel</h1>
          <p className="mt-3 font-medium text-stone-500">Digite o codigo de admin da loja {store.businessName}.</p>
          {error && <p className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600">{error}</p>}
          <form onSubmit={handleUnlock} className="mt-6 space-y-4">
            <input
              value={adminCode}
              onChange={event => setAdminCode(event.target.value)}
              placeholder="Codigo de admin"
              className="input-field"
            />
            <button className="w-full rounded-[24px] bg-stone-900 px-6 py-4 font-black uppercase tracking-widest text-white">
              Desbloquear painel
            </button>
          </form>
        </div>
      </Centered>
    );
  }

  return <Dashboard store={store} products={products} onRefresh={loadStore} />;
}

function Dashboard({ store, products, onRefresh }: { store: Store; products: Product[]; onRefresh: () => Promise<void> }) {
  const [settings, setSettings] = useState({
    businessName: store.businessName,
    whatsappNumber: store.whatsappNumber,
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const menuUrl = `${window.location.origin}/loja/${store.slug}`;

  const grouped: Record<string, Product[]> = useMemo(() => {
    return products.reduce<Record<string, Product[]>>((acc, product) => {
      const key = product.category || 'Sem categoria';
      acc[key] = acc[key] || [];
      acc[key].push(product);
      return acc;
    }, {});
  }, [products]);

  const saveSettings = async (event: FormEvent) => {
    event.preventDefault();
    setSavingSettings(true);
    await dbService.updateStore(store.id, settings);
    await onRefresh();
    setSavingSettings(false);
  };

  const copyMenuLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(menuUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = menuUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }

      setCopyStatus('Link copiado!');
    } catch (error) {
      console.error('Copy link error:', error);
      setCopyStatus('Não foi possível copiar. Copie manualmente.');
    }
  };

  return (
    <div className="min-h-screen bg-bg-site px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Painel da loja</p>
            <h1 className="mt-2 text-5xl font-black tracking-tight">{store.businessName}</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={copyMenuLink} className="btn-secondary"><Copy className="h-4 w-4" /> Copiar link</button>
            <Link to={`/loja/${store.slug}`} target="_blank" className="btn-secondary"><ExternalLink className="h-4 w-4" /> Ver cardapio</Link>
            <button onClick={() => { setEditingProduct(null); setModalOpen(true); }} className="btn-primary"><Plus className="h-4 w-4" /> Produto</button>
          </div>
        </header>

        <div className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-stone-100">
          <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-stone-400">Link publico do cardapio</label>
          <input value={menuUrl} readOnly className="input-field" />
          {copyStatus && <p className="mt-3 text-sm font-bold text-stone-600">{copyStatus}</p>}
        </div>

        <form onSubmit={saveSettings} className="grid gap-4 rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-stone-100 md:grid-cols-[1fr_220px_auto]">
          <input value={settings.businessName} onChange={event => setSettings({ ...settings, businessName: event.target.value })} className="input-field" />
          <input value={settings.whatsappNumber} onChange={event => setSettings({ ...settings, whatsappNumber: event.target.value })} className="input-field" />
          <button disabled={savingSettings} className="btn-primary"><Save className="h-4 w-4" /> {savingSettings ? 'Salvando' : 'Salvar'}</button>
        </form>

        {products.length === 0 ? (
          <div className="rounded-[32px] border-2 border-dashed border-stone-200 bg-white p-12 text-center">
            <h2 className="text-2xl font-black">Nenhum produto ainda</h2>
            <p className="mt-3 font-medium text-stone-500">Cadastre o primeiro item do seu cardapio.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([category, items]) => (
              <section key={category}>
                <h2 className="mb-4 text-xs font-black uppercase tracking-widest text-stone-400">{category}</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {items.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onEdit={() => { setEditingProduct(product); setModalOpen(true); }}
                      onDelete={async () => {
                        if (confirm('Excluir este produto?')) {
                          await dbService.deleteProduct(product.id);
                          await onRefresh();
                        }
                      }}
                      onToggle={async () => {
                        await dbService.updateProduct(product.id, { isActive: !product.isActive });
                        await onRefresh();
                      }}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <ProductModal
          storeId={store.id}
          product={editingProduct}
          onClose={() => setModalOpen(false)}
          onSaved={async () => {
            setModalOpen(false);
            await onRefresh();
          }}
        />
      )}
    </div>
  );
}

function ProductCard({ product, onEdit, onDelete, onToggle }: { key?: string; product: Product; onEdit: () => void; onDelete: () => void; onToggle: () => void }) {
  return (
    <div className={`rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-stone-100 ${product.isActive ? '' : 'opacity-60'}`}>
      <div className="flex gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-2xl bg-stone-100">
          {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-black">{product.name}</p>
          <p className="text-sm font-bold text-brand">{formatCurrency(product.price)}</p>
          <p className="mt-1 line-clamp-2 text-xs font-medium text-stone-500">{product.description}</p>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4">
        <button onClick={onToggle} className="rounded-2xl bg-stone-50 px-4 py-2 text-xs font-black">
          {product.isActive ? <Eye className="inline h-4 w-4" /> : <EyeOff className="inline h-4 w-4" />} {product.isActive ? 'Ativo' : 'Inativo'}
        </button>
        <div className="flex gap-2">
          <button onClick={onEdit} className="icon-button"><Edit3 className="h-4 w-4" /></button>
          <button onClick={onDelete} className="icon-button text-red-500"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}

function ProductModal({ storeId, product, onClose, onSaved }: { storeId: string; product: Product | null; onClose: () => void; onSaved: () => void }) {
  const [formData, setFormData] = useState({
    name: product?.name || emptyProduct.name,
    description: product?.description || emptyProduct.description,
    price: product ? String(product.price).replace('.', ',') : emptyProduct.price,
    imageUrl: product?.imageUrl || emptyProduct.imageUrl,
    category: product?.category || emptyProduct.category,
    isActive: product?.isActive ?? emptyProduct.isActive,
  });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(product?.imageUrl ? 'Imagem enviada com sucesso' : '');
  const [uploadError, setUploadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [manualImageUrl, setManualImageUrl] = useState('');

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setUploadStatus('');

    if (!import.meta.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
      setUploadError('Firebase Storage não configurado. Verifique NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET na Vercel.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setUploadError('Selecione um arquivo de imagem.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setUploadError('A imagem deve ter no maximo 5MB.');
      return;
    }

    setUploadingImage(true);
    try {
      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const filePath = `products/${storeId}/${Date.now()}-${safeFileName}`;
      const imageRef = ref(storage, filePath);
      await withUploadTimeout(uploadBytes(imageRef, file));
      const imageUrl = await withUploadTimeout(getDownloadURL(imageRef));
      setFormData(current => ({ ...current, imageUrl }));
      setUploadStatus('Imagem enviada com sucesso');
    } catch (error: any) {
      console.error('Image upload error:', error);
      const code = error?.code || 'unknown';
      const message = error?.message || 'Erro desconhecido';
      setUploadError(`Erro ao enviar imagem: ${code} - ${message}`);
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSaveError('');

    try {
      const payload = {
        storeId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price.replace(',', '.')),
        imageUrl: formData.imageUrl.trim() || manualImageUrl.trim() || '',
        category: formData.category.trim() || 'Geral',
        isActive: formData.isActive,
      };
      if (product) await dbService.updateProduct(product.id, payload);
      else await dbService.addProduct(payload);
      onSaved();
    } catch (error: any) {
      console.error('Save product error:', error);
      setSaveError(error?.message || 'Nao foi possivel salvar o produto.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <form onSubmit={handleSubmit} className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-[36px] bg-white p-6 shadow-2xl sm:rounded-[36px]">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-black">{product ? 'Editar produto' : 'Novo produto'}</h2>
          <button type="button" onClick={onClose} className="icon-button"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4">
          <input required value={formData.name} onChange={event => setFormData({ ...formData, name: event.target.value })} placeholder="Nome" className="input-field" />
          <div className="grid grid-cols-2 gap-4">
            <input required value={formData.price} onChange={event => setFormData({ ...formData, price: event.target.value })} placeholder="Preco" className="input-field" />
            <input required value={formData.category} onChange={event => setFormData({ ...formData, category: event.target.value })} placeholder="Categoria" className="input-field" />
          </div>
          <textarea value={formData.description} onChange={event => setFormData({ ...formData, description: event.target.value })} placeholder="Descricao" rows={3} className="input-field resize-none" />

          <div className="rounded-[28px] bg-stone-50 p-4 ring-1 ring-stone-100">
            <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-black uppercase tracking-widest text-stone-800 shadow-sm ring-1 ring-stone-200">
              <Camera className="h-5 w-5 text-brand" />
              {uploadingImage ? 'Enviando imagem...' : 'Selecionar ou tirar foto'}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                disabled={uploadingImage || saving}
                className="sr-only"
              />
            </label>

            {formData.imageUrl || manualImageUrl ? (
              <div className="mt-4 overflow-hidden rounded-3xl bg-white">
                <img src={formData.imageUrl || manualImageUrl} alt="Preview do produto" className="h-52 w-full object-cover" />
              </div>
            ) : (
              <div className="mt-4 flex h-40 items-center justify-center rounded-3xl bg-white text-stone-300">
                <ImageIcon className="h-10 w-10" />
              </div>
            )}

            {uploadStatus && (
              <p className="mt-3 flex items-center gap-2 text-sm font-bold text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                {uploadStatus}
              </p>
            )}
            {uploadError && <p className="mt-3 text-sm font-bold text-red-600">{uploadError}</p>}
          </div>

          <label className="block">
            <span className="mb-2 block pl-2 text-[10px] font-black uppercase tracking-widest text-stone-400">Ou cole um link da imagem</span>
            <input
              value={manualImageUrl}
              onChange={event => setManualImageUrl(event.target.value)}
              placeholder="https://exemplo.com/foto.jpg"
              className="input-field"
            />
          </label>

          <label className="flex items-center gap-3 font-bold text-stone-600">
            <input type="checkbox" checked={formData.isActive} onChange={event => setFormData({ ...formData, isActive: event.target.checked })} />
            Produto ativo
          </label>
          {saveError && <p className="text-sm font-bold text-red-600">{saveError}</p>}
          <button disabled={saving} className="btn-primary w-full justify-center">{saving ? 'Salvando...' : 'Salvar produto'}</button>
        </div>
      </form>
    </div>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center bg-bg-site p-6 text-center">{children}</div>;
}

function Loading({ text }: { text: string }) {
  return (
    <Centered>
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
        <p className="font-bold text-stone-500">{text}</p>
      </div>
    </Centered>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
