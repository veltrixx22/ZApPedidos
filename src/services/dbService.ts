import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import type { Product, Store } from '../types';

type StoreInput = Pick<Store, 'businessName' | 'whatsappNumber' | 'slug' | 'adminCode'>;
type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

const FIRESTORE_TIMEOUT_MS = 15000;

export const normalizeSlug = (slug: string) => slug
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()
  .replace(/\s+/g, '-')
  .replace(/[^a-z0-9-]/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');

function withTimeout<T>(promise: Promise<T>, operation: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => {
        reject(new Error(`${operation} demorou mais de ${FIRESTORE_TIMEOUT_MS / 1000}s. Verifique a conexão e as regras do Firestore.`));
      }, FIRESTORE_TIMEOUT_MS);
    }),
  ]);
}

export const dbService = {
  async getStoreBySlug(slug: string): Promise<Store | null> {
    const path = 'stores';
    try {
      const q = query(collection(db, path), where('slug', '==', normalizeSlug(slug)));
      const snapshot = await withTimeout(getDocs(q), 'Buscar loja por slug');
      if (snapshot.empty) return null;
      const storeDoc = snapshot.docs[0];
      const data = storeDoc.data();
      return { id: storeDoc.id, ...data, deliveryFee: Number(data.deliveryFee || 0) } as Store;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return null;
    }
  },

  async checkStoreSlugAvailability(slug: string, currentStoreId?: string): Promise<boolean> {
    const store = await this.getStoreBySlug(slug);
    return !store || store.id === currentStoreId;
  },

  async createStore(store: StoreInput): Promise<string> {
    const path = 'stores';
    try {
      const slug = normalizeSlug(store.slug);
      const existingStore = await this.getStoreBySlug(slug);
      if (existingStore) {
        throw new Error('Esse link de loja já está em uso. Escolha outro.');
      }

      // TODO: This no-login adminCode access is for MVP validation only. Before scaling, replace with Firebase Auth and hashed admin codes or proper owner authentication.
      const storeRef = await withTimeout(addDoc(collection(db, path), {
        businessName: store.businessName.trim(),
        whatsappNumber: store.whatsappNumber.replace(/\D/g, ''),
        slug,
        adminCode: store.adminCode.trim(),
        deliveryFee: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }), 'Criar loja');
      return storeRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      return '';
    }
  },

  async updateStore(storeId: string, store: Partial<Pick<Store, 'businessName' | 'whatsappNumber' | 'slug' | 'deliveryFee'>>): Promise<void> {
    const path = `stores/${storeId}`;
    try {
      const payload: DocumentData = {
        ...store,
        updatedAt: Date.now(),
      };
      if (store.slug) payload.slug = normalizeSlug(store.slug);
      if (store.whatsappNumber) payload.whatsappNumber = store.whatsappNumber.replace(/\D/g, '');
      await updateDoc(doc(db, path), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async getProducts(storeId: string, onlyActive = false): Promise<Product[]> {
    const path = 'products';
    try {
      const q = query(collection(db, path), where('storeId', '==', storeId));
      const snapshot = await getDocs(q);
      const products = snapshot.docs.map(productDoc => ({ id: productDoc.id, ...productDoc.data() } as Product));
      return products
        .filter(product => !onlyActive || product.isActive)
        .sort((a, b) => a.category.localeCompare(b.category) || b.createdAt - a.createdAt);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async addProduct(product: ProductInput): Promise<string> {
    const path = 'products';
    try {
      const productRef = doc(collection(db, path));
      const now = Date.now();
      await setDoc(productRef, {
        ...product,
        price: Number(product.price),
        isActive: product.isActive !== false,
        createdAt: now,
        updatedAt: now,
      });
      return productRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      return '';
    }
  },

  async updateProduct(id: string, product: Partial<ProductInput>): Promise<void> {
    const path = `products/${id}`;
    try {
      await updateDoc(doc(db, path), {
        ...product,
        updatedAt: Date.now(),
      } as DocumentData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteProduct(id: string): Promise<void> {
    const path = `products/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },
};
