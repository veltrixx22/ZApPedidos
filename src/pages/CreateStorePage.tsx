import { FormEvent, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, Zap } from 'lucide-react';
import { dbService } from '../services/dbService';

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

export default function CreateStorePage() {
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [slug, setSlug] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBusinessNameChange = (value: string) => {
    setBusinessName(value);
    if (!slug) setSlug(slugify(value));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    const cleanSlug = slugify(slug);
    const cleanNumber = whatsappNumber.replace(/\D/g, '');

    if (!businessName.trim() || !cleanNumber || !cleanSlug || !adminCode.trim()) {
      setError('Preencha todos os campos para criar sua loja.');
      return;
    }

    if (cleanNumber.length < 10) {
      setError('Informe um WhatsApp com DDD.');
      return;
    }

    if (adminCode.trim().length < 4) {
      setError('Use um codigo de admin com pelo menos 4 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const available = await dbService.checkStoreSlugAvailability(cleanSlug);
      if (!available) {
        setError('Este link ja esta em uso. Escolha outro.');
        return;
      }

      await dbService.createStore({
        businessName: businessName.trim(),
        whatsappNumber: cleanNumber,
        slug: cleanSlug,
        adminCode: adminCode.trim(),
      });

      localStorage.setItem(`zappedido_admin_${cleanSlug}`, 'true');
      navigate(`/admin/${cleanSlug}`);
    } catch (err) {
      console.error(err);
      setError('Nao foi possivel criar a loja agora.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-site px-6 py-8">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-stone-500 hover:text-stone-900">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <div className="rounded-[40px] bg-white p-8 shadow-xl shadow-stone-200/70 ring-1 ring-stone-100 md:p-12">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-brand text-white">
              <Store className="h-8 w-8" />
            </div>
            <h1 className="font-display text-4xl font-black leading-none tracking-tight text-stone-950">
              Criar meu cardapio
            </h1>
            <p className="mt-4 font-medium text-stone-500">
              Sem login. Voce acessa o painel usando o link da loja e seu codigo de admin.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-3xl bg-red-50 p-4 text-sm font-bold text-red-600 ring-1 ring-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Field label="Nome da loja">
              <input
                value={businessName}
                onChange={event => handleBusinessNameChange(event.target.value)}
                placeholder="Ex: Burger House"
                className="input-field"
              />
            </Field>

            <Field label="WhatsApp para pedidos">
              <input
                value={whatsappNumber}
                onChange={event => setWhatsappNumber(event.target.value)}
                placeholder="Ex: 11999999999"
                className="input-field"
              />
            </Field>

            <Field label="Link da loja">
              <div className="flex items-center rounded-[28px] bg-stone-50 ring-1 ring-stone-100 focus-within:ring-brand">
                <span className="border-r border-stone-200 px-5 py-4 text-xs font-black uppercase tracking-widest text-stone-400">loja/</span>
                <input
                  value={slug}
                  onChange={event => setSlug(slugify(event.target.value))}
                  placeholder="minha-loja"
                  className="w-full bg-transparent px-5 py-4 font-black outline-none"
                />
              </div>
            </Field>

            <Field label="Codigo de admin">
              <input
                value={adminCode}
                onChange={event => setAdminCode(event.target.value)}
                placeholder="Crie um codigo simples"
                className="input-field"
              />
            </Field>

            <p className="rounded-3xl bg-orange-50 p-4 text-xs font-bold leading-relaxed text-orange-900 ring-1 ring-orange-100">
              TODO: This no-login adminCode access is for MVP validation only. Before scaling, replace with Firebase Auth and hashed admin codes or proper owner authentication.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-[28px] bg-brand px-8 py-5 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-orange-200 transition hover:bg-orange-600 disabled:opacity-60"
            >
              {loading ? 'Criando...' : 'Criar loja agora'}
              <Zap className="h-5 w-5 fill-current" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block pl-2 text-[10px] font-black uppercase tracking-widest text-stone-400">{label}</span>
      {children}
    </label>
  );
}
