import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Plus, X, MapPin, FileText, Store, Phone, ChevronDown } from 'lucide-react';
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
    category: '',
    phone: '',
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-gray-600"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Crea tu tienda</h1>
          <div className="w-6" />
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Upload Image Section */}
        <div className="mb-8">
          <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center relative overflow-hidden">
            {formData.images.length > 0 ? (
              <>
                <img src={formData.images[0]} alt="Store" className="w-full h-full object-cover" />
                <button
                  onClick={() => handleRemoveImage(formData.images[0])}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X size={12} />
                </button>
              </>
            ) : (
              <div className="text-center">
                <Upload size={32} className="text-gray-400 mx-auto mb-2" />
                <span className="text-gray-500 text-sm">Agregar logo</span>
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-medium flex items-center justify-center gap-2 hover:border-[#E07A5F] hover:text-[#E07A5F] transition-colors"
          >
            <Upload size={20} />
            {formData.images.length > 0 ? 'Cambiar imagen' : 'Subir imagen'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileUpload(e.target.files);
              }
            }}
          />
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Store size={20} className="text-gray-600" />
              <label className="text-base font-medium text-gray-900">Nombre</label>
            </div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nombre tu tienda"
              className="w-full px-0 py-3 border-0 border-b border-gray-200 focus:outline-none focus:border-[#E07A5F] text-gray-900 placeholder-gray-500"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-gray-600" />
              <label className="text-base font-medium text-gray-900">Descripción</label>
            </div>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Añade una descripción"
              rows={3}
              className="w-full px-0 py-3 border-0 border-b border-gray-200 focus:outline-none focus:border-[#E07A5F] text-gray-900 placeholder-gray-500 resize-none"
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-gray-600" />
              <label className="text-base font-medium text-gray-900">Ubicación (opcional)</label>
            </div>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Dirección de tu tienda"
              className="w-full px-0 py-3 border-0 border-b border-gray-200 focus:outline-none focus:border-[#E07A5F] text-gray-900 placeholder-gray-500"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-gray-600 rounded flex items-center justify-center">
                <span className="text-white text-xs">📦</span>
              </div>
              <label className="text-base font-medium text-gray-900">Categoría</label>
            </div>
            <div className="relative">
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-0 py-3 border-0 border-b border-gray-200 focus:outline-none focus:border-[#E07A5F] text-gray-900 appearance-none bg-transparent"
              >
                <option value="">Selecciona una categoría</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Ropa">Ropa</option>
                <option value="Hogar">Hogar</option>
                <option value="Deportes">Deportes</option>
                <option value="Alimentación">Alimentación</option>
                <option value="Otros">Otros</option>
              </select>
              <ChevronDown size={16} className="absolute right-0 top-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Phone size={20} className="text-gray-600" />
              <label className="text-base font-medium text-gray-900">Teléfono (opcional)</label>
            </div>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Añade un número de teléfono"
              className="w-full px-0 py-3 border-0 border-b border-gray-200 focus:outline-none focus:border-[#E07A5F] text-gray-900 placeholder-gray-500"
            />
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
          className="w-full bg-[#E07A5F] text-white py-4 rounded-xl font-semibold hover:bg-[#E07A5F]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
        >
          {loading ? 'Creando tienda...' : 'Continuar'}
        </button>
      </div>
    </div>
  );
}