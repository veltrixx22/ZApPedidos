export interface Profile {
  ownerId: string;
  businessName: string;
  whatsappNumber: string;
  slug: string;
  createdAt: number;
}

export interface Product {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isActive: boolean;
  createdAt: number;
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
