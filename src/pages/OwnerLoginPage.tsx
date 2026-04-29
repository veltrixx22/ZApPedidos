import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, LogIn, Store } from 'lucide-react';
import { dbService, normalizeSlug } from '../services/dbService';

export default function OwnerLoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [slug, setSlug] = useState(normalizeSlug(searchParams.get('slug') || ''));
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanSlug = normalizeSlug(slug);
      if (!cleanSlug || !adminCode.trim()) {
        setError('Informe o link da loja e o codigo de admin.');
        return;
      }

      const store = await dbService.getStoreBySlug(cleanSlug);
      if (!store) {
        setError('Loja não encontrada.');
        return;
      }

      if (store.adminCode !== adminCode.trim()) {
        setError('Código de admin incorreto.');
        return;
      }

      localStorage.setItem(`zappedido_admin_${cleanSlug}`, 'true');
      navigate(`/admin/${cleanSlug}`);
    } catch (error) {
      console.error('Owner login error:', error);
      setError('Não foi possível acessar o painel agora.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-site px-6 py-8">
      <div className="mx-auto max-w-xl">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-stone-500 hover:text-stone-900">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <div className="rounded-[40px] bg-white p-8 shadow-xl shadow-stone-200/70 ring-1 ring-stone-100 md:p-12">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-stone-900 text-white">
              <Store className="h-8 w-8 text-brand" />
            </div>
            <h1 className="font-display text-4xl font-black leading-none tracking-tight text-stone-950">
              Entrar no painel
            </h1>
            <p className="mt-4 font-medium text-stone-500">
              Acesse sua loja usando o link da loja e o código de admin.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-3xl bg-red-50 p-4 text-sm font-bold text-red-600 ring-1 ring-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <label className="block">
              <span className="mb-2 block pl-2 text-[10px] font-black uppercase tracking-widest text-stone-400">Link da loja</span>
              <div className="flex items-center rounded-[28px] bg-stone-50 ring-1 ring-stone-100 focus-within:ring-brand">
                <span className="border-r border-stone-200 px-5 py-4 text-xs font-black uppercase tracking-widest text-stone-400">loja/</span>
                <input
                  value={slug}
                  onChange={event => setSlug(normalizeSlug(event.target.value))}
                  placeholder="minha-loja"
                  className="w-full bg-transparent px-5 py-4 font-black outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block pl-2 text-[10px] font-black uppercase tracking-widest text-stone-400">Codigo de admin</span>
              <input
                value={adminCode}
                onChange={event => setAdminCode(event.target.value)}
                placeholder="Seu codigo de admin"
                className="input-field"
              />
            </label>

            <button
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-[28px] bg-brand px-8 py-5 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-orange-200 transition hover:bg-orange-600 disabled:opacity-60"
            >
              {loading ? 'Entrando...' : 'Entrar'}
              <LogIn className="h-5 w-5" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-bold text-stone-500">
            Ainda nao tem loja? <Link to="/criar-loja" className="text-brand">Criar meu cardapio gratis</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
