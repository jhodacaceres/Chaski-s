import React, { useState, useRef } from 'react';
import { ArrowLeft, Camera, Plus, X, ChevronDown, Store, Upload, MapPin } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { useAuth } from '../../hooks/useAuth';

interface CreateProductScreenProps {
  onBack: () => void;
  onProductCreated: () => void;
  selectedStoreId?: string | null;
}

export const CreateProductScreen: React.FC<CreateProductScreenProps> = ({ onBack, onProductCreated, selectedStoreId: initialStoreId }) => {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productImages, setProductImages] = useState<string[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState(initialStoreId || 'no-store');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [pickupLocation, setPickupLocation] = useState<{lat: number, lng: number} | null>(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  const { createProduct, stores, isLoading } = useStore();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!productImages.includes(randomImage) && productImages.length < 3) {
      setProductImages(prev => [...prev, randomImage]);
    }
  };

  const handleRemoveImage = (imageUrl: string) => {
    setProductImages(prev => prev.filter(img => img !== imageUrl));
    // Also remove from uploaded files if it's a blob URL
    if (imageUrl.startsWith('blob:')) {
      const index = productImages.indexOf(imageUrl);
      if (index !== -1) {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
      }
    }
  };

  const handleFileUpload = (files: FileList) => {
    const filesArray = Array.from(files);
    const maxFiles = 5;
    const currentCount = productImages.length;
    const availableSlots = maxFiles - currentCount;
    
    if (availableSlots <= 0) {
      setErrorMessage('Máximo 5 imágenes permitidas');
      return;
    }
    
    const filesToAdd = filesArray.slice(0, availableSlots);
    
    // Validate file types and sizes
    for (const file of filesToAdd) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Solo se permiten archivos de imagen');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setErrorMessage('Las imágenes no deben superar los 5MB');
        return;
      }
    }
    
    // Create preview URLs and store files
    const newImageUrls = filesToAdd.map(file => URL.createObjectURL(file));
    setProductImages(prev => [...prev, ...newImageUrls]);
    setUploadedFiles(prev => [...prev, ...filesToAdd]);
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setErrorMessage('');
    
    if (!navigator.geolocation) {
      setErrorMessage('La geolocalización no está disponible en este navegador');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setPickupLocation({ lat: latitude, lng: longitude });
        
        // Get address from coordinates using reverse geocoding
        try {
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY&language=es&pretty=1`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              const address = data.results[0].formatted;
              setPickupAddress(address);
            } else {
              setPickupAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            }
          } else {
            setPickupAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
        } catch (error) {
          console.error('Error getting address:', error);
          setPickupAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setErrorMessage('No se pudo obtener la ubicación. Por favor, permite el acceso a la ubicación.');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    
    // Validate required fields
    if (!productName.trim()) {
      setErrorMessage('El nombre del producto es requerido');
      return;
    }
    if (!productPrice || parseFloat(productPrice) <= 0) {
      setErrorMessage('El precio debe ser mayor a 0');
      return;
    }
    if (productImages.length === 0) {
      setErrorMessage('Debes agregar al menos una imagen');
      return;
    }
    if (!pickupLocation) {
      setErrorMessage('Debes obtener la ubicación de recogida');
      return;
    }

    if (!productName || !productPrice || !user) {
      setErrorMessage('Por favor complete el nombre y precio del producto');
      return;
    }

    try {
      await createProduct({
        name: productName,
        description: productDescription,
        price: parseFloat(productPrice),
        image: productImages[0] || '',
        images: productImages,
        storeId: selectedStoreId === 'no-store' ? null : selectedStoreId,
        category: productCategory,
        stock: parseInt(productStock) || 0,
        pickupLocation,
        pickupAddress
      }, uploadedFiles);

      onProductCreated();
    } catch (error) {
      console.error('Error creating product:', error);
      setErrorMessage('Error al crear el producto. Por favor, intenta de nuevo.');
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
          <h1 className="text-lg font-medium text-gray-900">Crear publicación</h1>
        </div>
        <span className="text-red-500 text-sm font-medium">Cbba ⚪</span>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mx-4 mt-4 p-3 rounded-lg bg-red-100 text-red-800">
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      <div className="px-4 py-6">
        {/* Image Upload Section */}
        <div className="mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Imágenes del producto</h3>
          
          {/* Image Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[0, 1, 2, 3, 4].map((index) => (
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
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-gray-600"
                  >
                    <Camera size={20} />
                    <span className="text-xs mt-1">
                      {index === 0 ? 'Imagen principal' : 'Imagen adicional'}
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {/* Upload Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-medium flex items-center justify-center gap-2 hover:border-[#E07A5F] hover:text-[#E07A5F] transition-colors"
            >
              <Upload size={20} />
              Subir imágenes desde galería
            </button>
            
            <button
              onClick={handleAddSampleImage}
              disabled={productImages.length >= 5}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-medium flex items-center justify-center gap-2 hover:border-[#E07A5F] hover:text-[#E07A5F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={20} />
              Agregar imagen de muestra
            </button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            Puedes subir hasta 5 imágenes. La primera será la imagen principal.
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileUpload(e.target.files);
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

        {/* Store Selection */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Tienda (Opcional)</h3>
          <div className="relative">
            <select
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="w-full px-0 py-2 border-0 border-b border-gray-200 focus:outline-none focus:border-[#E07A5F] text-gray-900 appearance-none bg-transparent"
            >
              <option value="no-store">Sin tienda (producto independiente)</option>
              {userStores.map(store => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-0 top-3 text-gray-400 pointer-events-none" />
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Puedes crear productos independientes o asociarlos a una de tus tiendas
          </p>
          {userStores.length === 0 && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                💡 Tip: Crea una tienda para organizar mejor tus productos
              </p>
            </div>
          )}
        </div>

        {/* Location Section */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Ubicación de recogida</h3>
          <p className="text-gray-600 text-sm mb-4">
            Esta ubicación se usará para que los compradores sepan dónde recoger el producto
          </p>
          
          {!pickupLocation ? (
            <button
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-medium flex items-center justify-center gap-2 hover:border-[#E07A5F] hover:text-[#E07A5F] transition-colors disabled:opacity-50"
            >
              {isGettingLocation ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  Obteniendo ubicación...
                </>
              ) : (
                <>
                  <MapPin size={20} />
                  Obtener ubicación actual
                </>
              )}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <MapPin size={20} className="text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-green-800">Ubicación obtenida</p>
                  <p className="text-green-600 text-sm">{pickupAddress}</p>
                  <p className="text-green-500 text-xs">
                    Coordenadas: {pickupLocation.lat.toFixed(6)}, {pickupLocation.lng.toFixed(6)}
                  </p>
                </div>
              </div>
              <button
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="w-full py-2 text-[#E07A5F] border border-[#E07A5F] rounded-lg hover:bg-[#E07A5F]/10 transition-colors disabled:opacity-50"
              >
                {isGettingLocation ? 'Actualizando...' : 'Actualizar ubicación'}
              </button>
            </div>
          )}
        </div>

        {/* Stock */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Inventario</h3>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Stock disponible</label>
            <input
              type="number"
              placeholder="10"
              value={productStock}
              onChange={(e) => setProductStock(e.target.value)}
              min="0"
              className="w-full px-0 py-2 border-0 border-b border-gray-200 focus:outline-none focus:border-[#E07A5F] text-gray-900"
            />
            <p className="text-gray-500 text-sm mt-1">
              Cantidad de productos disponibles para venta
            </p>
          </div>
        </div>

        {/* Publish Button */}
        <button
          onClick={handleSubmit}
          disabled={!productName.trim() || !productPrice || parseFloat(productPrice) <= 0 || productImages.length === 0 || !pickupLocation || isLoading}
          className="w-full bg-[#E07A5F] text-white py-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E07A5F]/90 transition-colors"
        >
          {isLoading ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
    </div>
  );
};