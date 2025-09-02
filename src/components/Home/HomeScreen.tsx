import React, { useState } from 'react';
import { Search, Bell, MapPin, Filter, Heart, Plus, MessageCircle, Package, Store, Smartphone, Shirt, MoreHorizontal, User, Check } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { Product } from '../../types';
import { ProductDetailScreen } from '../Products/ProductDetailScreen';

interface HomeScreenProps {
  onOpenMessages: () => void;
  onCreateStore: () => void;
  onCreateProduct: () => void;
  onViewUserProfile?: (userId: string) => void;
  messageCount?: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenMessages, onCreateStore, onCreateProduct, onViewUserProfile, messageCount = 0 }) => {
  const { products, addToCart, toggleWishlist, wishlist } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showVenderOptions, setShowVenderOptions] = useState(false);
  const [showCategoriesOptions, setShowCategoriesOptions] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartAnimation, setCartAnimation] = useState<string | null>(null);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    
    // Show cart animation
    setCartAnimation(product.id);
    setTimeout(() => {
      setCartAnimation(null);
    }, 2000);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedProduct) {
    return (
      <ProductDetailScreen
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
        onViewUserProfile={onViewUserProfile}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#E07A5F] px-4 py-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-white">
            <h1 className="text-2xl font-bold">CHASKI</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-white">
              <Search size={24} />
            </button>
            <button className="text-white">
              <Bell size={24} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <button className="flex items-center gap-2 text-white/90">
            <MapPin size={16} />
            <span className="text-sm">Cbba</span>
          </button>
          
          {/* Vender Button with Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowVenderOptions(!showVenderOptions)}
              className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1"
            >
              <span className="text-white text-sm">Vender</span>
            </button>
            
            {showVenderOptions && (
              <div className="absolute top-full mt-2 bg-white rounded-lg shadow-lg py-2 min-w-[160px] z-10">
                <button 
                  onClick={() => {
                    setShowVenderOptions(false);
                    onCreateProduct();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <Package size={16} />
                  <span className="text-sm">Publicar producto</span>
                </button>
                <button 
                  onClick={() => {
                    setShowVenderOptions(false);
                    onCreateStore();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <Store size={16} />
                  <span className="text-sm">Crear tienda</span>
                </button>
              </div>
            )}
          </div>

          {/* Categories Button with Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowCategoriesOptions(!showCategoriesOptions)}
              className="flex items-center gap-2 text-white/90"
            >
              <span className="text-sm">Categorías</span>
            </button>
            
            {showCategoriesOptions && (
              <div className="absolute top-full mt-2 bg-white rounded-lg shadow-lg py-2 min-w-[140px] z-10">
                <button 
                  onClick={() => {
                    setShowCategoriesOptions(false);
                    // Handle technology category
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <Smartphone size={16} />
                  <span className="text-sm">Tecnología</span>
                </button>
                <button 
                  onClick={() => {
                    setShowCategoriesOptions(false);
                    // Handle clothing category
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <Shirt size={16} />
                  <span className="text-sm">Ropa</span>
                </button>
                <button 
                  onClick={() => {
                    setShowCategoriesOptions(false);
                    // Handle other category
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <MoreHorizontal size={16} />
                  <span className="text-sm">Otros</span>
                </button>
              </div>
            )}
          </div>

          {/* Messages Button with Counter */}
          <button 
            onClick={onOpenMessages}
            className="relative flex items-center gap-2 text-white/90"
          >
            <MessageCircle size={16} />
            {messageCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {messageCount > 9 ? '9+' : messageCount}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-2">
        {/* Selection Section */}
        <div className="bg-white rounded-t-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Selección de hoy</h2>
            <button className="flex items-center gap-2 text-gray-600">
              <Filter size={16} />
              <span className="text-sm">Filtrar</span>
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-32 object-cover"
                  />
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className={`absolute top-2 right-2 p-2 rounded-full ${
                      wishlist.includes(product.id)
                        ? 'bg-[#E07A5F] text-white'
                        : 'bg-white text-gray-400'
                    }`}
                  >
                    <Heart size={16} fill={wishlist.includes(product.id) ? 'white' : 'none'} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewUserProfile?.(product.storeId);
                    }}
                    className="absolute top-2 left-2 p-2 rounded-full bg-white text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <User size={16} />
                  </button>
                </div>
                
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 text-sm mb-1">{product.name}</h3>
                  <p className="text-[#E07A5F] font-bold text-lg">${product.price}</p>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    className="w-full mt-2 bg-[#E07A5F] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#E07A5F]/90 transition-colors"
                  >
                    Agregar al carrito
                  </button>
                  
                  {/* Cart Animation */}
                  {cartAnimation === product.id && (
                    <div className="absolute inset-0 bg-green-500 bg-opacity-90 rounded-xl flex items-center justify-center animate-pulse">
                      <div className="text-white text-center">
                        <Check size={24} className="mx-auto mb-1" />
                        <span className="text-sm font-medium">¡Agregado al carrito!</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-20 right-4 bg-[#E07A5F] text-white p-4 rounded-full shadow-lg hover:bg-[#E07A5F]/90 transition-colors">
        <Plus size={24} />
      </button>
    </div>
  );
};