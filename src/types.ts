export interface Store {
  id: string;
  businessName: string;
  whatsappNumber: string;
  slug: string;
  adminCode: string;
  deliveryFee: number;
  paymentMethods: PaymentMethods;
  pixKey: string;
  pixReceiverName: string;
  pixQrCodeUrl: string;
  paymentInstructions: string;
  createdAt: number;
  updatedAt: number;
}

export interface PaymentMethods {
  pix: boolean;
  cash: boolean;
  debitCard: boolean;
  creditCard: boolean;
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
