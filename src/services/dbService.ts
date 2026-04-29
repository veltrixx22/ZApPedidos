import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  type DocumentData
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import type { Profile, Product } from '../types';

export const dbService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const path = `profiles/${userId}`;
    try {
      const docSnap = await getDoc(doc(db, path));
      return docSnap.exists() ? docSnap.data() as Profile : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async getProfileBySlug(slug: string): Promise<Profile | null> {
    const path = 'profiles';
    try {
      const q = query(collection(db, path), where('slug', '==', slug.toLowerCase()));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      return querySnapshot.docs[0].data() as Profile;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return null;
    }
  },

  async saveProfile(profile: Profile): Promise<void> {
    const path = `profiles/${profile.ownerId}`;
    try {
      // Also update slug lookup
      await setDoc(doc(db, 'slugs', profile.slug.toLowerCase()), { ownerId: profile.ownerId });
      await setDoc(doc(db, path), {
        ...profile,
        slug: profile.slug.toLowerCase(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getProducts(ownerId: string, onlyActive = false): Promise<Product[]> {
    const path = 'products';
    try {
      let q = query(
        collection(db, path), 
        where('ownerId', '==', ownerId),
        orderBy('category', 'asc'),
        orderBy('createdAt', 'desc')
      );
      
      if (onlyActive) {
        q = query(q, where('isActive', '==', true));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async addProduct(product: Omit<Product, 'id'>): Promise<string> {
    const path = 'products';
    try {
      const newDocRef = doc(collection(db, path));
      await setDoc(newDocRef, {
        ...product,
        createdAt: Date.now()
      });
      return newDocRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      return '';
    }
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<void> {
    const path = `products/${id}`;
    try {
      await updateDoc(doc(db, path), product as DocumentData);
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

  async checkSlugAvailability(slug: string, currentOwnerId: string): Promise<boolean> {
    const path = `slugs/${slug.toLowerCase()}`;
    try {
      const docSnap = await getDoc(doc(db, path));
      if (!docSnap.exists()) return true;
      return docSnap.data().ownerId === currentOwnerId;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return false;
    }
  }
};
