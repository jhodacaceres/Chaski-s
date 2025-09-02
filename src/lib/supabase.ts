import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          profile_image: string | null;
          role: 'buyer' | 'seller' | 'admin';
          ci: string | null;
          address: string | null;
          phone_number: string | null;
          average_rating: number | null;
          total_ratings: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          profile_image?: string | null;
          role?: 'buyer' | 'seller' | 'admin';
          ci?: string | null;
          address?: string | null;
          phone_number?: string | null;
          average_rating?: number | null;
          total_ratings?: number | null;
        };
        Update: {
          name?: string | null;
          profile_image?: string | null;
          role?: 'buyer' | 'seller' | 'admin';
          ci?: string | null;
          address?: string | null;
          phone_number?: string | null;
          average_rating?: number | null;
          total_ratings?: number | null;
          updated_at?: string;
        };
      };
      stores: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          images: string[];
          address: string;
          owner_id: string;
          coordinates: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          description?: string | null;
          images?: string[];
          address: string;
          owner_id: string;
          coordinates?: string | null;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          description?: string | null;
          images?: string[];
          address?: string;
          coordinates?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          images: string[];
          store_id: string;
          category: string | null;
          is_active: boolean;
          stock: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          description?: string | null;
          price: number;
          images?: string[];
          store_id: string;
          category?: string | null;
          is_active?: boolean;
          stock?: number;
        };
        Update: {
          name?: string;
          description?: string | null;
          price?: number;
          images?: string[];
          category?: string | null;
          is_active?: boolean;
          stock?: number;
          updated_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          product_id: string;
          quantity?: number;
        };
        Update: {
          quantity?: number;
        };
      };
      wishlist_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          product_id: string;
        };
        Update: {};
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          total: number;
          status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
          address: string;
          payment_method: 'card' | 'transfer' | null;
          coupon_used: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          total: number;
          status?: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
          address: string;
          payment_method?: 'card' | 'transfer' | null;
          coupon_used?: string | null;
        };
        Update: {
          status?: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
          payment_method?: 'card' | 'transfer' | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
          created_at: string;
        };
        Insert: {
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
        };
        Update: {};
      };
      ratings: {
        Row: {
          id: string;
          user_id: string;
          rated_user_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          rated_user_id: string;
          rating: number;
          comment?: string | null;
        };
        Update: {
          rating?: number;
          comment?: string | null;
          updated_at?: string;
        };
      };
    };
  };
};