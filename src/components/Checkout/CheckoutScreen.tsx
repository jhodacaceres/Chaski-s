import React, { useState } from 'react';
import { ArrowLeft, MapPin, Edit, CreditCard, Smartphone } from 'lucide-react';
import { useStore } from '../../hooks/useStore';

interface CheckoutScreenProps {
  onBack: () => void;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ onBack }) => {
  const { cart, getCartTotal, clearCart } = useStore();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer'>('card');
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountCode, setDiscountCode] = useState('');

  const subtotal = getCartTotal();
  const shipping = 0;
  const serviceFee = 2.00;
  const discount = 0;
  const total = subtotal + shipping + serviceFee - discount;

  const handlePayment = async () => {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    clearCart();
    alert('¡Pedido realizado con éxito!');
    onBack();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-gray-600">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Checkout</h1>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Payment Method */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Elija un método de pago</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`p-4 rounded-xl border-2 transition-colors ${
                paymentMethod === 'card'
                  ? 'border-[#E07A5F] bg-[#E07A5F]/10'
                  : 'border-gray-200'
              }`}
            >
              <CreditCard size={24} className="mx-auto mb-2" />
              <span className="text-sm font-medium">Pago QR</span>
            </button>
            
            <button
              onClick={() => setPaymentMethod('transfer')}
              className={`p-4 rounded-xl border-2 transition-colors ${
                paymentMethod === 'transfer'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200'
              }`}
            >
              <Smartphone size={24} className="mx-auto mb-2" />
              <span className="text-sm font-medium">Efectivo</span>
            </button>
          </div>

          <button
            onClick={() => setShowDiscount(!showDiscount)}
            className="w-full py-3 bg-[#E07A5F] text-white rounded-xl font-medium mb-6"
          >
            Añadir descuento %
          </button>

          {showDiscount && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Código de descuento"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
              />
            </div>
          )}
        </div>

        {/* Delivery Information */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Datos de entrega y facturación</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#E07A5F] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">📦</span>
                </div>
                <div>
                  <p className="font-medium">DELIVERY</p>
                  <p className="text-gray-600 text-sm">Standard | 3-4 days</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-gray-600" />
                <div>
                  <p className="font-medium">UBICACIÓN</p>
                  <p className="text-gray-600 text-sm">Cbba | Av. Circunvalación</p>
                </div>
              </div>
              <button className="text-[#E07A5F]">
                <Edit size={20} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm">📝</span>
                </div>
                <div>
                  <p className="font-medium">Instrucciones de entrega</p>
                  <p className="text-gray-600 text-sm">Aquí van las instrucciones</p>
                </div>
              </div>
              <button className="text-[#E07A5F]">
                <Edit size={20} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-sm">⭐</span>
                </div>
                <div>
                  <p className="font-medium">Chaskipoints</p>
                  <p className="text-gray-600 text-sm">50</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#E07A5F]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E07A5F]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Resumen</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal ({cart.length})</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Envío</span>
              <span className="text-green-600">Gratis</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tarifa de servicio</span>
              <span>${serviceFee.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Descuentos</span>
                <span className="text-green-600">-$ {discount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handlePayment}
          className="w-full bg-[#E07A5F] text-white py-4 rounded-xl font-semibold hover:bg-[#E07A5F]/90 transition-colors"
        >
          Pagar ${total.toFixed(2)}
        </button>
      </div>
    </div>
  );
};