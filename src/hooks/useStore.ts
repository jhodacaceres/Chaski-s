import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { Product, Store, CartItem } from '../types';

export const useStore = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch products
  useEffect(() => {
    fetchProducts();
    fetchStores();
  }, []);

  // Fetch user-specific data when user changes
  useEffect(() => {
    if (user) {
      // Skip fetching user data if in demo mode
      const skipAuth = localStorage.getItem('skipAuth');
      if (skipAuth !== 'true') {
        fetchCart();
        fetchWishlist();
      } else {
        // Set mock data for demo
        setCart([]);
        setWishlist([]);
      }
    } else {
      setCart([]);
      setWishlist([]);
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          stores (
            name,
            address
          )
        `)
        .eq('is_active', true);

      if (error) throw error;

      const formattedProducts: Product[] = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        image: item.images[0] || '',
        images: item.images,
        storeId: item.store_id,
        category: item.category || '',
        isActive: item.is_active,
        stock: item.stock
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      const formattedStores: Store[] = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        images: item.images,
        address: item.address,
        ownerId: item.owner_id,
        coordinates: item.coordinates ? JSON.parse(item.coordinates) : [0, 0],
        isActive: item.is_active,
        createdAt: new Date(item.created_at)
      }));

      setStores(formattedStores);
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const fetchCart = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const cartItems: CartItem[] = data.map(item => ({
        product: {
          id: item.products.id,
          name: item.products.name,
          description: item.products.description || '',
          price: item.products.price,
          image: item.products.images[0] || '',
          images: item.products.images,
          storeId: item.products.store_id,
          category: item.products.category || '',
          isActive: item.products.is_active,
          stock: item.products.stock
        },
        quantity: item.quantity
      }));

      setCart(cartItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const fetchWishlist = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setWishlist(data.map(item => item.product_id));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  // Cart functions
  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!user) return;

    // Handle demo mode
    const skipAuth = localStorage.getItem('skipAuth');
    if (skipAuth === 'true') {
      const existingItem = cart.find(item => item.product.id === product.id);
      if (existingItem) {
        setCart(prev => prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ));
      } else {
        setCart(prev => [...prev, { product, quantity }]);
      }
      return;
    }

    try {
      const existingItem = cart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        await updateCartQuantity(product.id, existingItem.quantity + quantity);
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity
          });

        if (error) throw error;
        await fetchCart();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) return;

    // Handle demo mode
    const skipAuth = localStorage.getItem('skipAuth');
    if (skipAuth === 'true') {
      setCart(prev => prev.filter(item => item.product.id !== productId));
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    if (!user) return;

    // Handle demo mode
    const skipAuth = localStorage.getItem('skipAuth');
    if (skipAuth === 'true') {
      if (quantity <= 0) {
        setCart(prev => prev.filter(item => item.product.id !== productId));
      } else {
        setCart(prev => prev.map(item => 
          item.product.id === productId 
            ? { ...item, quantity }
            : item
        ));
      }
      return;
    }

    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
      await fetchCart();
    } catch (error) {
      console.error('Error updating cart quantity:', error);
    }
  };

  const clearCart = async () => {
    if (!user) return;

    // Handle demo mode
    const skipAuth = localStorage.getItem('skipAuth');
    if (skipAuth === 'true') {
      setCart([]);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setCart([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Wishlist functions
  const toggleWishlist = async (productId: string) => {
    if (!user) return;

    // Handle demo mode
    const skipAuth = localStorage.getItem('skipAuth');
    if (skipAuth === 'true') {
      setWishlist(prev => 
        prev.includes(productId)
          ? prev.filter(id => id !== productId)
          : [...prev, productId]
      );
      return;
    }

    try {
      const isInWishlist = wishlist.includes(productId);

      if (isInWishlist) {
        const { error } = await supabase
          .from('wishlist_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('wishlist_items')
          .insert({
            user_id: user.id,
            product_id: productId
          });

        if (error) throw error;
      }

      await fetchWishlist();
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const getWishlistProducts = () => {
    return products.filter(product => wishlist.includes(product.id));
  };

  // Store functions
  const createStore = async (storeData: Omit<Store, 'id' | 'createdAt'>) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('stores')
        .insert({
          name: storeData.name,
          description: storeData.description,
          images: storeData.images,
          address: storeData.address,
          owner_id: user.id,
          coordinates: JSON.stringify(storeData.coordinates),
          is_active: storeData.isActive
        })
        .select()
        .single();

      if (error) throw error;

      const newStore: Store = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        images: data.images,
        address: data.address,
        ownerId: data.owner_id,
        coordinates: JSON.parse(data.coordinates),
        isActive: data.is_active,
        createdAt: new Date(data.created_at)
      };

      setStores(prev => [...prev, newStore]);
      return newStore;
    } catch (error) {
      console.error('Error creating store:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Product functions
  const createProduct = async (productData: Omit<Product, 'id'>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          images: productData.images || [productData.image],
          store_id: productData.storeId,
          category: productData.category,
          is_active: productData.isActive,
          stock: productData.stock
        })
        .select()
        .single();

      if (error) throw error;

      const newProduct: Product = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        price: data.price,
        image: data.images[0] || '',
        images: data.images,
        storeId: data.store_id,
        category: data.category || '',
        isActive: data.is_active,
        stock: data.stock
      };

      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return {
    products,
    stores,
    cart,
    wishlist,
    isLoading,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    toggleWishlist,
    getWishlistProducts,
    createStore,
    createProduct,
    getCartTotal,
    getCartItemCount,
    fetchProducts,
    fetchStores
  };
};