import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { dbService } from '../../services/dbService';
import { Product } from '../../types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Image as ImageIcon, 
  EyeOff, 
  Eye, 
  PlusCircle, 
  X,
  Search,
  Filter,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductListProps {
  user: User;
}

export default function ProductList({ user }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    const data = await dbService.getProducts(user.uid);
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [user.uid]);

  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      await dbService.deleteProduct(id);
      fetchProducts();
    }
  };

  const toggleStatus = async (product: Product) => {
    await dbService.updateProduct(product.id, { isActive: !product.isActive });
    fetchProducts();
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Administração</p>
          <h1 className="text-5xl font-black text-stone-900 tracking-tighter leading-[0.9]">
            Seu <span className="text-brand">Cardápio</span>
          </h1>
          <p className="text-stone-500 font-medium mt-3">Gerencie os itens da sua loja.</p>
        </div>
        <button
          onClick={() => { setCurrentProduct(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-3 px-8 py-5 bg-brand text-white rounded-[28px] font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-100 hover:scale-105 transition-all w-full md:w-auto"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </header>

      {/* Search & Stats - Artistic Style */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-white border border-stone-100 rounded-3xl focus:border-brand outline-none transition-all shadow-sm"
          />
        </div>
        <div className="bg-white px-8 py-4 rounded-3xl border border-stone-100 shadow-sm flex items-center gap-4">
           <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center">
              <Filter className="w-4 h-4 text-stone-400" />
           </div>
           <div>
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none mb-1">Total</p>
              <p className="font-black text-stone-900 text-sm leading-none">{products.length} itens</p>
           </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white h-56 rounded-[40px] border border-stone-50 animate-pulse shadow-sm" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white p-16 rounded-[48px] text-center border-2 border-dashed border-stone-200">
          <div className="bg-stone-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
            <Package className="w-12 h-12 text-stone-200" />
          </div>
          <h3 className="text-3xl font-black text-stone-900 mb-4 tracking-tighter">Nada por aqui</h3>
          <p className="text-stone-500 font-medium max-w-sm mx-auto mb-10 text-lg">
            Adicione seu primeiro produto para que seus clientes possam vê-lo online.
          </p>
          <button
            onClick={() => { setCurrentProduct(null); setIsModalOpen(true); }}
            className="px-10 py-5 bg-stone-900 text-white rounded-[32px] font-black text-sm uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xl shadow-stone-200"
          >
            Adicionar Primeiro Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className={`
                bg-white p-6 rounded-[40px] border border-stone-50 shadow-xl shadow-stone-100/30 hover:shadow-2xl hover:shadow-stone-200/50 transition-all duration-500 group relative overflow-hidden
                ${!product.isActive ? 'opacity-60 grayscale' : ''}
              `}
            >
              <div className="flex gap-6 items-start">
                <div className="w-24 h-24 rounded-[28px] bg-stone-50 flex-shrink-0 overflow-hidden border border-stone-50 relative group-hover:scale-105 transition-transform duration-500">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-stone-100" />
                    </div>
                  )}
                  {!product.isActive && (
                    <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center backdrop-blur-[2px]">
                      <EyeOff className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand bg-orange-50 px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                  <h3 className="font-black text-xl text-stone-900 truncate mt-3 tracking-tight">{product.name}</h3>
                  <p className="font-display font-black-italic text-brand text-lg mt-2 tracking-tighter">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                  </p>
                </div>
              </div>

              <p className="text-stone-400 text-xs mt-6 line-clamp-2 leading-relaxed font-medium">
                {product.description}
              </p>

              <div className="mt-8 pt-6 border-t border-stone-50 flex items-center justify-between">
                <button 
                  onClick={() => toggleStatus(product)}
                  className={`text-[10px] uppercase font-black px-4 py-2 rounded-2xl transition-all tracking-widest ${
                    product.isActive ? 'text-green-600 bg-green-50 border border-green-100' : 'text-stone-400 bg-stone-50 border border-stone-100'
                  }`}
                >
                  {product.isActive ? 'Ativo' : 'Inativo'}
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(product)}
                    className="w-10 h-10 flex items-center justify-center text-stone-300 hover:text-stone-900 bg-stone-50 rounded-2xl hover:bg-stone-100 transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="w-10 h-10 flex items-center justify-center text-stone-300 hover:text-red-500 bg-stone-50 rounded-2xl hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Modal - Artistic Flair */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative bg-white w-full max-w-xl rounded-[64px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="px-10 pt-10 pb-6 border-b border-stone-50 flex items-center justify-between">
                <h2 className="text-3xl font-black tracking-tighter text-stone-900">
                  {currentProduct ? 'Editar Item' : 'Novo Item'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center hover:bg-stone-100 transition-all">
                  <X className="w-6 h-6 text-stone-400" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 custom-scrollbar">
                 <ProductForm 
                  product={currentProduct} 
                  ownerId={user.uid} 
                  onSuccess={() => { setIsModalOpen(false); fetchProducts(); }} 
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductForm({ product, ownerId, onSuccess }: { product: Partial<Product> | null, ownerId: string, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price ? String(product.price) : '',
    imageUrl: product?.imageUrl || '',
    category: product?.category || '',
    isActive: product?.isActive !== false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      ...formData,
      ownerId,
      price: parseFloat(formData.price.replace(',', '.'))
    };

    try {
      if (product?.id) {
        await dbService.updateProduct(product.id, data);
      } else {
        await dbService.addProduct(data);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar produto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
      <div className="space-y-1.5 text-left">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1">Nome do Produto</label>
        <input 
          type="text" 
          required
          placeholder="Ex: Cheeseburger Especial"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-2xl focus:border-brand outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1">Preço (R$)</label>
          <input 
            type="text" 
            required
            placeholder="0,00"
            value={formData.price}
            onChange={e => setFormData({ ...formData, price: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-2xl focus:border-brand outline-none transition-all"
          />
        </div>
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1">Categoria</label>
          <input 
            type="text" 
            required
            placeholder="Ex: Lanches"
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-2xl focus:border-brand outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-1.5 text-left">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1">Descrição</label>
        <textarea 
          placeholder="Pão brioche, blend de carne, queijo cheddar..."
          rows={3}
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-2xl focus:border-brand outline-none transition-all resize-none"
        />
      </div>

      <div className="space-y-1.5 text-left">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1">Link da Imagem (Opcional)</label>
        <input 
          type="url" 
          placeholder="https://exemplo.com/imagem.jpg"
          value={formData.imageUrl}
          onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
          className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-2xl focus:border-brand outline-none transition-all"
        />
      </div>

      <div className="flex items-center gap-3 py-2">
        <button
          type="button"
          onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
          className={`
            w-12 h-6 rounded-full relative transition-colors duration-300
            ${formData.isActive ? 'bg-brand' : 'bg-zinc-200'}
          `}
        >
          <div className={`
            absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300
            ${formData.isActive ? 'left-7' : 'left-1'}
          `} />
        </button>
        <span className="text-sm font-bold text-zinc-600">Produto Ativo</span>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-brand text-white rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all mt-4"
      >
        {loading ? 'Salvando...' : 'Salvar Produto'}
      </button>
    </form>
  );
}
