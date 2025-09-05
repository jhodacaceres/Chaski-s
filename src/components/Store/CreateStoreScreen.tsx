import React, { useState, useRef } from 'react';
import { ArrowLeft, MapPin, Store, FileText, Upload, Plus, X } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { useAuth } from '../../hooks/useAuth'; 

interface CreateStoreScreenProps {
  onBack: () => void;
  onStoreCreated: () => void;
}

export function CreateStoreScreen({ onBack, onStoreCreated }: CreateStoreScreenProps) {
  const { createStore, loading } = useStore();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    images: [] as string[],
    coordinates: [0, 0] as [number, number]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRemoveImage = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== imageUrl)
    }));
    
    // Si la URL es un 'blob', significa que es un archivo subido por el usuario.
    // Esta lógica elimina el archivo correspondiente del estado 'uploadedFiles'.
    if (imageUrl.startsWith('blob:')) {
      const index = formData.images.indexOf(imageUrl);
      if (index !== -1) {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
      }
    }
  };

  const handleFileUpload = (files: FileList) => {
    const filesArray = Array.from(files);
    const maxFiles = 5;
    const currentCount = formData.images.length;
    const availableSlots = maxFiles - currentCount;
    
    if (availableSlots <= 0) {
      setErrors(prev => ({ ...prev, images: 'Máximo 5 imágenes permitidas' }));
      return;
    }
    
    const filesToAdd = filesArray.slice(0, availableSlots);
    
    for (const file of filesToAdd) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, images: 'Solo se permiten archivos de imagen' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setErrors(prev => ({ ...prev, images: 'Las imágenes no deben superar los 5MB' }));
        return;
      }
    }
    
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }));
    }
    
    const newImageUrls = filesToAdd.map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImageUrls]
    }));
    setUploadedFiles(prev => [...prev, ...filesToAdd]);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'El nombre de la tienda es requerido';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    if (!formData.address.trim()) newErrors.address = 'La dirección es requerida';
    if (formData.images.length === 0) newErrors.images = 'Agrega al menos una imagen de la tienda';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await createStore({
        ...formData,
        ownerId: user?.id || '',
        isActive: true,
        createdAt: new Date()
      });
      onStoreCreated();
    } catch (error) {
      console.error('Error creating store:', error);
      setErrors(prev => ({ ...prev, submit: 'Error al crear la tienda. Intenta de nuevo.' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Crear Tienda</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Store Images */}
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Imágenes de la tienda</h3>
          
          {formData.images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                  <img src={image} alt={`Tienda ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemoveImage(image)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X size={12} />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      Principal
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={formData.images.length >= 5}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-medium flex items-center justify-center gap-2 hover:border-[#E07A5F] hover:text-[#E07A5F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={20} />
            Subir imágenes desde galería
          </button>
          
          <p className="text-xs text-gray-500 text-center mt-2">
            Puedes subir hasta 5 imágenes. La primera será la imagen principal.
          </p>
          
          {errors.images && (
            <p className="text-red-500 text-sm mt-2">{errors.images}</p>
          )}
          
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

        {/* Store Information */}
        <div className="bg-white rounded-lg p-6 space-y-6">
          {/* Store Name */}
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <Store className="w-5 h-5 text-gray-600" />
              <label className="text-base font-medium text-gray-900">
                Nombre de la tienda
              </label>
            </div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ingresa el nombre de tu tienda"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <label className="text-base font-medium text-gray-900">
                Descripción
              </label>
            </div>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe tu tienda y lo que vendes"
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <MapPin className="w-5 h-5 text-gray-600" />
              <label className="text-base font-medium text-gray-900">
                Dirección
              </label>
            </div>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Ingresa la dirección de tu tienda"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>
        </div>

        {errors.submit && (
          <div className="bg-red-100 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Create Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#E07A5F] text-white py-4 rounded-lg font-semibold hover:bg-[#E07A5F]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creando tienda...' : 'Crear Tienda'}
        </button>
      </div>
    </div>
  );
}