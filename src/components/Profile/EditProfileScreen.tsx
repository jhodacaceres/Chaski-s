import React, { useState } from 'react';
import { ArrowLeft, Save, User, MapPin, Phone, CreditCard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface EditProfileScreenProps {
  onBack: () => void;
  onProfileUpdated: () => void;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ 
  onBack, 
  onProfileUpdated 
}) => {
  const { user, updateUserProfile } = useAuth();
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedAddress, setEditedAddress] = useState(user?.address || '');
  const [editedPhone, setEditedPhone] = useState(user?.phoneNumber || '');
  const [editedCI, setEditedCI] = useState(user?.ci || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    setMessage('');
    setIsLoading(true);
    
    try {
      // Validate CI format (basic validation for Bolivian CI)
      if (editedCI && !/^\d{7,8}$/.test(editedCI)) {
        setMessage('La cédula de identidad debe tener 7 u 8 dígitos');
        return;
      }

      // Validate phone format (basic validation for Bolivian phone numbers)
      if (editedPhone && !/^[67]\d{7}$/.test(editedPhone)) {
        setMessage('El número de teléfono debe tener 8 dígitos y comenzar con 6 o 7');
        return;
      }

      await updateUserProfile({
        address: editedAddress.trim(),
        phone_number: editedPhone.trim(),
        ci: editedCI.trim()
      });

      setMessage('Perfil actualizado correctamente');
      setTimeout(() => {
        onProfileUpdated();
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error al actualizar el perfil. Por favor, intenta de nuevo.');
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
          <h1 className="text-xl font-semibold text-gray-900">Editar perfil</h1>
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
        {/* Name */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
              <User size={16} className="text-gray-600" />
            </div>
            <span className="font-medium text-gray-900">Nombre completo</span>
          </div>
          <input
            type="text"
            placeholder="Tu nombre completo"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
          />
        </div>

        {/* CI */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
              <CreditCard size={16} className="text-gray-600" />
            </div>
            <span className="font-medium text-gray-900">Cédula de identidad</span>
          </div>
          <input
            type="text"
            placeholder="12345678"
            value={editedCI}
            onChange={(e) => setEditedCI(e.target.value)}
            maxLength={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Ingresa tu CI sin guiones ni espacios</p>
        </div>

        {/* Address */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
              <MapPin size={16} className="text-gray-600" />
            </div>
            <span className="font-medium text-gray-900">Dirección completa</span>
          </div>
          <textarea
            placeholder="Av. Heroínas #123, Zona Central, Cochabamba"
            value={editedAddress}
            onChange={(e) => setEditedAddress(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent resize-none"
          />
        </div>

        {/* Phone */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
              <Phone size={16} className="text-gray-600" />
            </div>
            <span className="font-medium text-gray-900">Número de teléfono</span>
          </div>
          <input
            type="tel"
            placeholder="70123456"
            value={editedPhone}
            onChange={(e) => setEditedPhone(e.target.value)}
            maxLength={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Número de celular de 8 dígitos</p>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-[#E07A5F] text-white py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E07A5F]/90 transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Guardando...
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