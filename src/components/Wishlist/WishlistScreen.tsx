import React, { useState } from 'react';
// Se añaden los imports necesarios
import { Search, Heart, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../hooks/useStore';

// Definimos el tipo Product para mayor claridad en el código
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
}

export const WishlistScreen: React.FC = () => {
  const { getWishlistProducts, toggleWishlist, addToCart } = useStore();
  const wishlistProducts = getWishlistProducts();

  // Estado para controlar la animación del botón "Agregar al carrito"
  const [addingId, setAddingId] = useState<string | null>(null);

  const handleAddToCart = (product: Product) => {
    // Evita múltiples clics mientras una animación está en curso
    if (addingId) return;

    setAddingId(product.id);
    addToCart(product);

    // Resetea el estado del botón después de 1.5 segundos
    setTimeout(() => {
      setAddingId(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
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
            {/* AnimatePresence permite animar la eliminación de elementos de la lista */}
            <AnimatePresence>
              {wishlistProducts.map((product) => (
                // El componente 'motion.div' es la base de las animaciones
                <motion.div
                  key={product.id}
                  layout // Anima el cambio de posición de otros elementos
                  initial={{ opacity: 0, y: 20 }} // Estado inicial (invisible y desplazado)
                  animate={{ opacity: 1, y: 0 }} // Estado final (visible y en su posición)
                  exit={{ opacity: 0, x: -100, height: 0, margin: 0, padding: 0, border: 0 }} // Animación al salir
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
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
                          className="p-2 text-[#E07A5F] transition-transform active:scale-75"
                        >
                          <Heart size={20} fill="currentColor" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    {/* Botón con estado de confirmación y animación */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!!addingId}
                      className={`w-full py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center ${
                        addingId === product.id
                          ? 'bg-green-500 text-white' // Estado de éxito
                          : 'bg-[#E07A5F] text-white hover:bg-[#E07A5F]/90'
                      }`}
                    >
                      {addingId === product.id ? (
                        <>
                          <Check size={20} className="mr-2" />
                          Agregado
                        </>
                      ) : (
                        'Agregar al carrito'
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};