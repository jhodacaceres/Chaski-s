import React, { useState, useRef } from 'react';
import { ArrowLeft, Camera, Save, X, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Store } from '../../types';

interface EditStoreScreenProps {
  store: Store;
  onBack: () => void;
  onStoreUpdated: () => void;
}

export const EditStoreScreen: React.FC<EditStoreScreenProps> = ({ 
  store, 
  onBack, 
  onStoreUpdated 
}) => {
  const [storeName, setStoreName] = useState(store.name);
  const [storeDescription, setStoreDescription] = useState(store.description);
  const [storeAddress, setStoreAddress] = useState(store.address);
  const [storeImages, setStoreImages] = useState<string[]>(store.images);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleImages = [
    'https://images.pexels.com/photos/1187765/pexels-photo-1187765.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg?auto=compress&cs=tinysrgb&w=400'
  ];

  const handleAddSampleImage = () => {
    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    if (!storeImages.includes(randomImage)) {
      setStoreImages(prev => [...prev, randomImage]);
    }
  };

  const handleRemoveImage = (imageUrl: string) => {
    setStoreImages(prev => prev.filter(img => img !== imageUrl));
  };

  const handleSubmit = async () => {
    setMessage('');
    setIsLoading(true);
    
    try {
      // Validate required fields
      if (!storeName.trim()) {
        setMessage('El nombre de la tienda es requerido');
        return;
      }
      if (!storeAddress.trim()) {
        setMessage('La dirección de la tienda es requerida');
        return;
      }

      const { error } = await supabase
        .from('stores')
        .update({
          name: storeName.trim(),
          description: storeDescription.trim(),
          address: storeAddress.trim(),
          images: storeImages,
          updated_at: new Date().toISOString()
        })
        .eq('id', store.id);

      if (error) throw error;

      setMessage('Tienda actualizada correctamente');
      setTimeout(() => {
        onStoreUpdated();
      }, 1500);
    } catch (error) {
      console.error('Error updating store:', error);
      setMessage('Error al actualizar la tienda. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
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
          <h1 className="text-xl font-semibold text-gray-900">Editar tienda</h1>
        </div>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div className={`mx-4 mt-4 p-3 rounded-lg ${
          message.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          <p className="text-sm">{message}</p>
        </div>
      )}

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

        {/* Store Images */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Imágenes de la tienda</h3>
          
          {/* Selected Images */}
          {storeImages.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {storeImages.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden">
                  <img src={image} alt={`Store ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemoveImage(image)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Image Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleAddSampleImage}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium flex items-center justify-center gap-2 hover:border-[#E07A5F] hover:text-[#E07A5F] transition-colors"
            >
              <Plus size={20} />
              Agregar imagen de muestra
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium flex items-center justify-center gap-2 hover:border-[#E07A5F] hover:text-[#E07A5F] transition-colors"
            >
              <Camera size={20} />
              Subir desde galería
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  const filesArray = Array.from(e.target.files);
                  const imageUrls = filesArray.map(file => URL.createObjectURL(file));
                  setStoreImages(prev => [...prev, ...imageUrls]);
                }
              }}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!storeName.trim() || !storeAddress.trim() || isLoading}
          className="w-full bg-[#E07A5F] text-white py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E07A5F]/90 transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Actualizando...
            </>
          ) : (
            <>
              <Save size={20} />
              Guardar cambios
            </>
          )}
        </button>
      </div>
    </div>
  );
};