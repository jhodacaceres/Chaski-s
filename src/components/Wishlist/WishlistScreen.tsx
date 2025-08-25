import React from 'react';
import { Search, Heart } from 'lucide-react';
import { useStore } from '../../hooks/useStore';

export const WishlistScreen: React.FC = () => {
  const { getWishlistProducts, toggleWishlist, addToCart } = useStore();
  const wishlistProducts = getWishlistProducts();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Lista de deseos</h1>
          <button className="text-gray-600">
            <Search size={24} />
          </button>
        </div>
      </div>

      {/* Wishlist Items */}
      <div className="px-4 py-4">
        {wishlistProducts.length === 0 ? (
          <div className="text-center py-16">
            <Heart size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tu lista está vacía</h3>
            <p className="text-gray-500">Agrega productos a tu lista de deseos</p>
          </div>
        ) : (
          <div className="space-y-4">
            {wishlistProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-24 h-24 object-cover"
                  />
                  
                  <div className="flex-1 p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                      <p className="text-[#E07A5F] font-bold text-lg">${product.price}</p>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="p-2 text-[#E07A5F]"
                      >
                        <Heart size={20} fill="#E07A5F" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="px-4 pb-4">
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-[#E07A5F] text-white py-2 rounded-lg font-medium hover:bg-[#E07A5F]/90 transition-colors"
                  >
                    Agregar al carrito
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};