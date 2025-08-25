export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  role: 'buyer' | 'seller' | 'admin';
  ci?: string;
  address?: string;
  phoneNumber?: string;
  averageRating?: number;
  totalRatings?: number;
}

export interface Store {
  id: string;
  name: string;
  description: string;
  images: string[];
  address: string;
  ownerId: string;
  coordinates: [number, number];
  isActive: boolean;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  storeId: string;
  category: string;
  isActive: boolean;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  address: string;
  paymentMethod: 'card' | 'transfer';
  couponUsed?: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message;
  updatedAt: Date;
}

export interface Rating {
  id: string;
  userId: string;
  ratedUserId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}