import React, { useState, useEffect } from 'react';
import { Search, Plus, ShoppingCart, Heart, User, MessageCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  store_id: string;
  user_id?: string;
  stores?: {
    owner_id: string;
  };
}

interface HomeScreenProps {
  onOpenMessages: () => void;
  onCreateStore: () => void;
  onCreateProduct: () => void;
  onViewUserProfile: (userId: string) => void;
  messageCount: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenMessages,
  onCreateStore,
  onCreateProduct,
  onViewUserProfile,
  messageCount
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [creatorIds, setCreatorIds] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          stores (
            owner_id
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data || []);
      
      // Cache creator IDs
      const creators: { [key: string]: string } = {};
      data?.forEach(product => {
        const creatorId = product.stores?.owner_id || product.user_id;
        if (creatorId) {
          creators[product.id] = creatorId;
        }
      });
      setCreatorIds(creators);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewCreatorProfile = (productId: string) => {
    const creatorId = creatorIds[productId];
    if (creatorId) {
      onViewUserProfile(creatorId);
    }
  };

  const addToCart = async (productId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity: 1
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const toggleWishlist = async (productId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if already in wishlist
      const { data: existing } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .limit(1);

      if (existing && existing.length > 0) {
        // Remove from wishlist
        await supabase
          .from('wishlist_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
      } else {
        // Add to wishlist
        await supabase
          .from('wishlist_items')
          .insert({
            user_id: user.id,
            product_id: productId
          });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">Inicio</h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenMessages}
              className="relative p-2 text-gray-600 hover:text-orange-500 transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
              {messageCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {messageCount}
                </span>
              )}
            </button>
            <button
              onClick={onCreateStore}
              className="p-2 text-gray-600 hover:text-orange-500 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <ShoppingCart className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500">No hay productos disponibles</p>
            <button
              onClick={onCreateProduct}
              className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Crear Producto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Product Image */}
                <div className="relative aspect-square">
                  <img
                    src={product.images[0] || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Creator Profile Button */}
                  <button
                    onClick={() => handleViewCreatorProfile(product.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-orange-500 font-bold text-lg mb-3">
                    ${product.price}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => addToCart(product.id)}
                      className="flex-1 bg-orange-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center justify-center"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Agregar
                    </button>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};