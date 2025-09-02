import React, { useState } from 'react';
import { ArrowLeft, Camera, MapPin, Store, FileText, Image } from 'lucide-react';
import { useStore } from '../../hooks/useStore';

interface CreateStoreScreenProps {
  onBack: () => void;
  onStoreCreated: () => void;
}

export function CreateStoreScreen({ onBack, onStoreCreated }: CreateStoreScreenProps) {
  const { createStore, loading } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    images: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la tienda es requerido';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await createStore(formData);
      onStoreCreated();
    } catch (error) {
      console.error('Error creating store:', error);
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
        {/* Store Image */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>
            <button className="text-orange-500 font-medium">
              Agregar foto de tienda
            </button>
          </div>
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

          {/* Additional Images */}
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <Image className="w-5 h-5 text-gray-600" />
              <label className="text-base font-medium text-gray-900">
                Imágenes adicionales
              </label>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">
                Agrega hasta 5 imágenes de tu tienda
              </p>
              <button className="text-orange-500 font-medium mt-2">
                Seleccionar imágenes
              </button>
            </div>
          </div>
        </div>

        {/* Create Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-orange-500 text-white py-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creando tienda...' : 'Crear Tienda'}
        </button>
      </div>
    </div>
  );
}