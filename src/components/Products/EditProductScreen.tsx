import React, { useState, useRef } from 'react';
import { ArrowLeft, Camera, Save, X, Plus, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Product, Store } from '../../types';

interface EditProductScreenProps {
  product: Product;
  stores: Store[];
  onBack: () => void;
  onProductUpdated: () => void;
}

export const EditProductScreen: React.FC<EditProductScreenProps> = ({ 
  product, 
  stores,
  onBack, 
  onProductUpdated 
}) => {
  const [productName, setProductName] = useState(product.name);
  const [productDescription, setProductDescription] = useState(product.description);
  const [productPrice, setProductPrice] = useState(product.price.toString());
  const [productCategory, setProductCategory] = useState(product.category);
  const [productStock, setProductStock] = useState(product.stock.toString());
  const [productImages, setProductImages] = useState<string[]>(product.images || [product.image]);
  const [selectedStoreId, setSelectedStoreId] = useState(product.storeId);
  const [location, setLocation] = useState('Cochabamba | Cercado');
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
    if (!productImages.includes(randomImage) && productImages.length < 3) {
      setProductImages(prev => [...prev, randomImage]);
    }
  };

  const handleRemoveImage = (imageUrl: string) => {
    setProductImages(prev => prev.filter(img => img !== imageUrl));
  };

  const handleSubmit = async () => {
    setMessage('');
    setIsLoading(true);
    
    try {
      if (!productName.trim()) {
        setMessage('El nombre del producto es requerido');
        return;
      }
      if (!productPrice || parseFloat(productPrice) <= 0) {
        setMessage('El precio debe ser mayor a 0');
        return;
      }
      if (!selectedStoreId) {
        setMessage('Debes seleccionar una tienda');
        return;
      }

      const { error } = await supabase
        .from('products')
        .update({
          name: productName.trim(),
          description: productDescription.trim(),
          price: parseFloat(productPrice),
          category: productCategory,
          stock: parseInt(productStock) || 0,
          images: productImages,
          store_id: selectedStoreId,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (error) throw error;

      setMessage('Producto actualizado correctamente');
      setTimeout(() => {
        onProductUpdated();
      }, 1500);
    } catch (error) {
      console.error('Error updating product:', error);
      setMessage('Error al actualizar el producto. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-gray-600">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-medium text-gray-900">Editar publicación</h1>
        </div>
        <span className="text-red-500 text-sm font-medium">Cbba ⚪</span>
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
        {/* Image Upload Section */}
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[0, 1, 2].map((index) => (
              <div key={index} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                {productImages[index] ? (
                  <>
                    <img src={productImages[index]} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleRemoveImage(productImages[index])}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={index === 0 ? () => fileInputRef.current?.click() : handleAddSampleImage}
                    className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-gray-600"
                  >
                    <Camera size={20} />
                    <span className="text-xs mt-1">
                      {index === 0 ? 'Agregar imagen' : 'Imagen opcional'}
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                const filesArray = Array.from(e.target.files).slice(0, 3);
                const imageUrls = filesArray.map(file => URL.createObjectURL(file));
                setProductImages(imageUrls);
              }
            }}
          />
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Detalles del artículo</h3>
          
          <div className="space-y-4">
            {/* Product Name */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Título</label>
              <input
                type="text"
                placeholder="Título del producto"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-0 py-2 border-0 border-b border-gray-200 focus:outline-none focus:border-[#E07A5F] text-gray-900"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Precio</label>
              <input
                type="number"
                placeholder="$10.99"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                step="0.01"
                min="0"
                className="w-full px-0 py-2 border-0 border-b border-gray-200 focus:outline-none focus:border-[#E07A5F] text-gray-900"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Categoría</label>
              <div className="relative">
                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="w-full px-0 py-2 border-0 border-b border-gray-200 focus:outline-none focus:border-[#E07A5F] text-gray-900 appearance-none bg-transparent"
                >
                  <option value="">Selecciona una categoría</option>
                  <option value="Ropa">Ropa</option>
                  <option value="Tecnología">Tecnología</option>
                  <option value="Accesorios">Accesorios</option>
                  <option value="Hogar">Hogar</option>
                  <option value="Deportes">Deportes</option>
                  <option value="Otros">Otros</option>
                </select>
                <ChevronDown size={16} className="absolute right-0 top-3 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Descripción (Opcional)</label>
              <textarea
                placeholder="Descripción del producto"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                rows={3}
                className="w-full px-0 py-2 border-0 border-b border-gray-200 focus:outline-none focus:border-[#E07A5F] text-gray-900 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Ubicación</h3>
          <div className="flex items-center justify-between">
            <span className="text-gray-900">{location}</span>
            <span className="text-red-500 text-sm">Cambiar</span>
          </div>
        </div>

        {/* Store Selection */}
        {stores.length > 0 && (
          <div className="bg-white rounded-lg p-4 mb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Tienda</h3>
            <div className="relative">
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="w-full px-0 py-2 border-0 border-b border-gray-200 focus:outline-none focus:border-[#E07A5F] text-gray-900 appearance-none bg-transparent"
              >
                <option value="">Selecciona una tienda</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-0 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Save Changes Button */}
        <button
          onClick={handleSubmit}
          disabled={!productName.trim() || !productPrice || parseFloat(productPrice) <= 0 || !selectedStoreId || isLoading}
          className="w-full bg-[#E07A5F] text-white py-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E07A5F]/90 transition-colors"
        >
          {isLoading ? 'Guardando cambios...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
};