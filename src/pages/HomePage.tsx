import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ArrowRight, CheckCircle2, LogIn, MessageCircle, Store, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg-site text-stone-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <span className="font-display text-2xl font-black tracking-tight">ZapPedido</span>
        </Link>
        <Link
          to="/criar-loja"
          className="rounded-2xl bg-stone-900 px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-stone-800"
        >
          Criar loja
        </Link>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-[1fr_420px] lg:py-24">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-xs font-black uppercase tracking-widest text-orange-700">
              Sem login, pronto para vender hoje
            </p>
            <h1 className="max-w-3xl font-display text-5xl font-black leading-none tracking-tight text-stone-950 md:text-7xl">
              Cardapio online com pedido direto no WhatsApp.
            </h1>
            <p className="mt-7 max-w-xl text-lg font-medium leading-relaxed text-stone-600">
              Crie o link da sua loja, cadastre produtos e receba pedidos formatados no WhatsApp. Simples, rapido e sem taxa por pedido.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/criar-loja"
                className="inline-flex items-center justify-center gap-3 rounded-[28px] bg-brand px-8 py-5 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-orange-200 transition hover:bg-orange-600"
              >
                Criar meu cardapio gratis <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/entrar"
                className="inline-flex items-center justify-center gap-3 rounded-[28px] bg-white px-8 py-5 text-sm font-black uppercase tracking-widest text-stone-900 shadow-sm ring-1 ring-stone-200 transition hover:bg-stone-50"
              >
                Já tenho uma loja <LogIn className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="rounded-[40px] bg-white p-6 shadow-2xl shadow-stone-200/70 ring-1 ring-stone-100">
            <div className="rounded-[32px] bg-stone-950 p-6 text-white">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-300">Pedido recebido</p>
                  <h2 className="mt-1 text-2xl font-black">Burger House</h2>
                </div>
                <MessageCircle className="h-8 w-8 text-whatsapp" />
              </div>
              <div className="space-y-3 rounded-3xl bg-white/10 p-5 text-sm">
                <p>Cliente: Maria</p>
                <p>Pagamento: PIX</p>
                <p>Pedido: 2x X-Burger</p>
                <p className="font-black text-orange-300">Total: R$ 49,80</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-stone-100 bg-white px-6 py-16">
          <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-4">
            <Feature text="Sem taxa por pedido" />
            <Feature text="Pedido direto no WhatsApp" />
            <Feature text="Link proprio da loja" />
            <Feature text="Sem precisar instalar app" />
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-3">
          <InfoCard icon={<Store />} title="Crie sua loja" text="Escolha um nome, WhatsApp, link e codigo de admin." />
          <InfoCard icon={<CheckCircle2 />} title="Cadastre produtos" text="Adicione preco, categoria, foto e status ativo ou inativo." />
          <InfoCard icon={<MessageCircle />} title="Receba pedidos" text="O cliente monta a sacola e envia tudo pronto pelo WhatsApp." />
        </section>
      </main>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-3xl bg-stone-50 p-5 font-bold text-stone-700 ring-1 ring-stone-100">
      <CheckCircle2 className="h-5 w-5 text-brand" />
      {text}
    </div>
  );
}

function InfoCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-[32px] bg-white p-7 shadow-sm ring-1 ring-stone-100">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-brand">
        {icon}
      </div>
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-3 font-medium leading-relaxed text-stone-500">{text}</p>
    </div>
  );
}
