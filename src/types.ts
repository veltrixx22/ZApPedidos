export interface Store {
  id: string;
  businessName: string;
  whatsappNumber: string;
  slug: string;
  adminCode: string;
  deliveryFee: number;
  createdAt: number;
  updatedAt: number;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderData {
  customerName: string;
  address: string;
  paymentMethod: string;
  notes: string;
  items: CartItem[];
  total: number;
}
