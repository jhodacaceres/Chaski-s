import React, { useState, useRef } from 'react';
import { ArrowLeft, Camera, Plus, X } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { useAuth } from '../../hooks/useAuth';

interface CreateProductScreenProps {
  onBack: () => void;
  onProductCreated: () => void;
}

export const CreateProductScreen: React.FC<CreateProductScreenProps> = ({ onBack, onProductCreated }) => {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productImages, setProductImages] = useState<string[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  
  const { createProduct, stores, isLoading } = useStore();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock image URLs for demonstration
  const sampleImages = [
    'https://images.pexels.com/photos/1187765/pexels-photo-1187765.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg?auto=compress&cs=tinysrgb&w=400'
  ];

  const userStores = stores.filter(store => store.ownerId === user?.id);

  const handleAddSampleImage = () => {
    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    if (!productImages.includes(randomImage)) {
      setProductImages(prev => [...prev, randomImage]);
    }
  };

  const handleRemoveImage = (imageUrl: string) => {
    setProductImages(prev => prev.filter(img => img !== imageUrl));
  };

  const handleSubmit = async () => {
    if (!productName || !productPrice || !selectedStoreId || !user) return;

    try {
      await createProduct({
        name: productName,
        description: productDescription,
        price: parseFloat(productPrice),
        image: productImages[0] || '',
        images: productImages,
        storeId: selectedStoreId,
        category: productCategory,
        isActive: true,
        stock: parseInt(productStock) || 0
      });

      onProductCreated();
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error al crear el producto. Por favor, intenta de nuevo.');
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
          <h1 className="text-xl font-semibold text-gray-900">Crear producto</h1>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Store Selection */}
        {userStores.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-sm">🏪</span>
              </div>
              <span className="font-medium text-gray-900">Tienda</span>
            </div>
            <select
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
            >
              <option value="">Selecciona una tienda</option>
              {userStores.map(store => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
          </div>
        )}

        {userStores.length === 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-yellow-800 text-sm">
              Necesitas crear una tienda primero para poder agregar productos.
            </p>
          </div>
        )}

        {/* Product Name */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-sm">📦</span>
            </div>
            <span className="font-medium text-gray-900">Nombre del producto</span>
          </div>
          <input
            type="text"
            placeholder="Nombre del producto"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
          />
        </div>

        {/* Product Description */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-sm">📝</span>
            </div>
            <span className="font-medium text-gray-900">Descripción</span>
          </div>
          <textarea
            placeholder="Descripción del producto"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent resize-none"
          />
        </div>

        {/* Price and Stock */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-sm">💰</span>
              </div>
              <span className="font-medium text-gray-900">Precio</span>
            </div>
            <input
              type="number"
              placeholder="0.00"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              step="0.01"
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
            />
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-sm">📊</span>
              </div>
              <span className="font-medium text-gray-900">Stock</span>
            </div>
            <input
              type="number"
              placeholder="0"
              value={productStock}
              onChange={(e) => setProductStock(e.target.value)}
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
            />
          </div>
        </div>

        {/* Category */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-sm">🏷️</span>
            </div>
            <span className="font-medium text-gray-900">Categoría</span>
          </div>
          <select
            value={productCategory}
            onChange={(e) => setProductCategory(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
          >
            <option value="">Selecciona una categoría</option>
            <option value="Ropa">Ropa</option>
            <option value="Tecnología">Tecnología</option>
            <option value="Accesorios">Accesorios</option>
            <option value="Hogar">Hogar</option>
            <option value="Deportes">Deportes</option>
            <option value="Otros">Otros</option>
          </select>
        </div>

        {/* Product Images */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Imágenes del producto</h3>
          
          {/* Selected Images */}
          {productImages.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {productImages.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden">
                  <img src={image} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
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
                // In a real app, you would upload these files to your storage service
                console.log('Files selected:', e.target.files);
              }}
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!productName || !productPrice || !selectedStoreId || isLoading}
          className="w-full bg-[#E07A5F] text-white py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E07A5F]/90 transition-colors"
        >
          {isLoading ? 'Creando producto...' : 'Crear producto'}
        </button>
      </div>
    </div>
  );
};