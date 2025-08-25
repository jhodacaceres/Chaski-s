import React, { useState } from 'react';
import { ArrowLeft, Camera, Plus } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { useAuth } from '../../hooks/useAuth';

interface CreateStoreScreenProps {
  onBack: () => void;
  onStoreCreated: () => void;
}

export const CreateStoreScreen: React.FC<CreateStoreScreenProps> = ({ onBack, onStoreCreated }) => {
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storeImages, setStoreImages] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  const { createStore, products, isLoading } = useStore();
  const { user } = useAuth();

  const backgroundPatterns = [
    'https://images.pexels.com/photos/1187765/pexels-photo-1187765.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400'
  ];

  const handleSubmit = async () => {
    if (!storeName || !storeAddress || !user) return;

    try {
      await createStore({
        name: storeName,
        description: storeDescription,
        address: storeAddress,
        images: storeImages.length > 0 ? storeImages : [backgroundPatterns[0]],
        ownerId: user.id,
        coordinates: [-17.3895, -66.1568], // Default coordinates for Cochabamba
        isActive: true
      });

      onStoreCreated();
    } catch (error) {
      console.error('Error creating store:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-gray-600">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Crea tu tienda</h1>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Store Name */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-sm">🏪</span>
            </div>
            <span className="font-medium text-gray-900">Nombre</span>
          </div>
          <input
            type="text"
            placeholder="Nombre de tu tienda"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
          />
        </div>

        {/* Store Description */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-sm">📝</span>
            </div>
            <span className="font-medium text-gray-900">Descripción</span>
          </div>
          <textarea
            placeholder="Añade una descripción"
            value={storeDescription}
            onChange={(e) => setStoreDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent resize-none"
          />
        </div>

        {/* Store Address */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-sm">📍</span>
            </div>
            <span className="font-medium text-gray-900">Dirección</span>
          </div>
          <input
            type="text"
            placeholder="Dirección de tu tienda"
            value={storeAddress}
            onChange={(e) => setStoreAddress(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
          />
        </div>

        {/* Background Selection */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Añade un fondo</h3>
          <div className="grid grid-cols-3 gap-3">
            {backgroundPatterns.map((pattern, index) => (
              <button
                key={index}
                onClick={() => setStoreImages([pattern])}
                className={`aspect-square rounded-xl border-2 overflow-hidden ${
                  storeImages.includes(pattern) 
                    ? 'border-[#E07A5F]' 
                    : 'border-gray-200'
                }`}
              >
                <img src={pattern} alt={`Pattern ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <button className="w-full mt-3 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium flex items-center justify-center gap-2">
            <Camera size={20} />
            Subir desde galería
          </button>
        </div>

        {/* Products Section */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Sube tus productos</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Sample Product */}
            <div className="bg-gray-100 rounded-xl p-4">
              <img 
                src="https://images.pexels.com/photos/1187765/pexels-photo-1187765.jpeg?auto=compress&cs=tinysrgb&w=200" 
                alt="Product" 
                className="w-full h-24 object-cover rounded-lg mb-2" 
              />
              <h4 className="font-medium text-gray-900 text-sm">Product name</h4>
              <p className="text-[#E07A5F] font-bold">$10.99</p>
              <button className="w-full mt-2 py-1 text-[#E07A5F] text-sm">
                <span>✏️</span>
              </button>
            </div>

            {/* Add Product Button */}
            <button className="bg-gray-100 rounded-xl p-4 flex flex-col items-center justify-center min-h-[140px] text-gray-500 hover:bg-gray-200 transition-colors">
              <Plus size={32} className="mb-2" />
              <span className="text-sm font-medium">Agregar producto</span>
            </button>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!storeName || !storeAddress || isLoading}
          className="w-full bg-[#E07A5F] text-white py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E07A5F]/90 transition-colors"
        >
          {isLoading ? 'Creando tienda...' : 'Guardar Tienda'}
        </button>
      </div>
    </div>
  );
};