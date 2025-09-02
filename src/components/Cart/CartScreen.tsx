import React, { useState } from 'react';
import { Minus, Plus, ArrowRight, Check } from 'lucide-react';
import { useStore } from '../../hooks/useStore';

interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    description?: string;
  };
  quantity: number;
}

interface CartScreenProps {
  onCheckout: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({ onCheckout }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'description'>('products');
  const { cart, updateCartQuantity, getCartTotal, products, isLoading } = useStore();
  const [cartAnimation, setCartAnimation] = useState<string | null>(null);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateCartQuantity(productId, newQuantity);
    
    // Show animation for quantity increase
    if (newQuantity > (cart.find(item => item.product.id === productId)?.quantity || 0)) {
      setCartAnimation(productId);
      setTimeout(() => {
        setCartAnimation(null);
      }, 1000);
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-32 h-32 animate-spin rounded-full border-4 border-[#E07A5F] border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = 0; // Free shipping
  const serviceFee = 2.00;
  const total = subtotal + shipping + serviceFee;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="text-4xl">🛒</div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tu carrito está vacío</h3>
          <p className="text-gray-500">Agrega algunos productos para comenzar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Tu carrito</h1>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2 border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 text-center py-2 font-medium ${
              activeTab === 'products'
                ? 'text-[#E07A5F] border-b-2 border-[#E07A5F]'
                : 'text-gray-500'
            }`}
          >
            PRODUCTOS
          </button>
          <button
            onClick={() => setActiveTab('description')}
            className={`flex-1 text-center py-2 font-medium ${
              activeTab === 'description'
                ? 'text-[#E07A5F] border-b-2 border-[#E07A5F]'
                : 'text-gray-500'
            }`}
          >
            DESCRIPCIÓN
          </button>
          <div className="flex-1 text-center py-2 font-medium text-gray-500">
            PRECIO
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 px-4 py-4">
        {activeTab === 'products' && (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.product.id} className="flex items-start gap-4">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                  <p className="text-gray-600 text-sm mb-1">{item.product.description}</p>
                  <p className="text-sm text-gray-500 mb-2">Cantidad: {item.quantity.toString().padStart(2, '0')}</p>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-[#E07A5F] font-bold text-lg">${item.product.price}</p>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.product.id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                      >
                        <Minus size={16} />
                      </button>
                      <div className="w-8 text-center relative">
                        <span>{item.quantity}</span>
                        {cartAnimation === item.product.id && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check size={16} className="text-green-500 animate-bounce" />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-[#E07A5F] text-white flex items-center justify-center"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'description' && (
          <div className="py-4 text-gray-600">
            <p>El carrito de compras es una característica que te permite acumular productos que desees comprar.</p>
          </div>
        )}

        {/* Related Products */}
        {products ? (
          products.length > 0 ? (
            <div className="mt-8">
              <h3 className="font-medium text-gray-900 mb-4">Productos relacionados</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.slice(0, 4).map((product) => (
                  <div key={product.id} className="text-center">
                    <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center mb-2 overflow-hidden">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs text-gray-600">{product.name}</p>
                    <p className="text-xs font-medium">${product.price}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-8 text-center text-gray-500">
              No hay productos relacionados disponibles
            </div>
          )
        ) : null}
      </div>

      {/* Summary */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal ({cart.length})</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Envío</span>
            <span className="font-medium text-green-600">Gratis</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tarifa de servicio</span>
            <span className="font-medium">${serviceFee.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onCheckout}
          className="w-full bg-[#E07A5F] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#E07A5F]/90 transition-colors"
        >
          Ir a pagar
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};