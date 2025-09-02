import React, { useState } from 'react';
import { ArrowLeft, Edit, Save, X, Eye, EyeOff, Star, User, MapPin, Phone, Mail, ShoppingBag, Store } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface ViewProfileScreenProps {
  onBack: () => void;
}

export const ViewProfileScreen: React.FC<ViewProfileScreenProps> = ({ onBack }) => {
  const { user, supabaseUser, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedAddress, setEditedAddress] = useState(user?.address || '');
  const [editedCategory, setEditedCategory] = useState('');
  const [editedPhone, setEditedPhone] = useState(user?.phoneNumber || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPhone, setShowPhone] = useState(false);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      await updateUserProfile({
        address: editedAddress,
        phone_number: editedPhone,
        name: editedName
      });
      setMessage('Perfil actualizado correctamente');
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error al actualizar el perfil');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(user?.name || '');
    setEditedDescription('');
    setEditedAddress(user?.address || '');
    setEditedCategory('');
    setEditedPhone(user?.phoneNumber || '');
    setIsEditing(false);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between">
        <button onClick={onBack} className="text-gray-600">
          <ArrowLeft size={24} />
        </button>
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

      {/* Profile Section */}
      <div className="px-4 py-6">
        {/* Profile Image and Name */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gray-400 rounded-full mx-auto mb-4 overflow-hidden">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <User size={32} />
              </div>
            )}
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            {user?.name || 'Mateo Araka'}
          </h2>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={14} 
                className={`${
                  i < Math.floor(user?.averageRating || 4.5) 
                    ? 'text-yellow-400 fill-yellow-400' 
                    : 'text-gray-300'
                }`} 
              />
            ))}
            <span className="text-gray-500 text-xs ml-1">
              4.5 (30 reseñas)
            </span>
          </div>
        </div>

        {/* Information Section */}
        <div className="mb-8">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Información</h3>
          
          <div className="space-y-3">
            {/* Phone */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Número de teléfono</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedPhone}
                      onChange={(e) => setEditedPhone(e.target.value)}
                      placeholder="74532345"
                      className="mt-1 px-2 py-1 border border-gray-300 rounded text-sm w-full"
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">74532345</p>
                  )}
                </div>
              </div>
              <button className="text-gray-400">
                <Eye size={16} />
              </button>
            </div>

            {/* Description */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center gap-3">
                <Edit size={16} className="text-gray-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Descripción</p>
                  {isEditing ? (
                    <textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      placeholder="Añade una descripción"
                      rows={2}
                      className="mt-1 px-2 py-1 border border-gray-300 rounded text-sm w-full resize-none"
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">
                      Añade una descripción
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Section */}
        <div className="mb-8">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Tienda</h3>
          
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                <img 
                  src="https://images.pexels.com/photos/1187765/pexels-photo-1187765.jpeg?auto=compress&cs=tinysrgb&w=100" 
                  alt="Store" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Nombre de la tienda</h4>
                <p className="text-gray-600 text-sm">Descripción de la tienda</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
              <div>
                <p className="font-medium">Número de contacto</p>
                <p>74532345</p>
              </div>
              <div>
                <p className="font-medium">Ubicación</p>
                <p>Av. Aroma</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsEditing(true)}
          className="w-full bg-[#E07A5F] text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#E07A5F]/90 transition-colors"
        >
          <Edit size={20} />
          Publicar un producto
        </button>

        {/* Product Preview */}
        <div className="mt-6 bg-white rounded-lg overflow-hidden">
          <img 
            src="https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400" 
            alt="Product" 
            className="w-full h-32 object-cover" 
          />
        </div>

        {/* Edit Mode Actions */}
        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
            <div className="bg-white w-full rounded-t-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Editar perfil</h3>
                <button onClick={handleCancelEdit} className="text-gray-500">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={editedPhone}
                    onChange={(e) => setEditedPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    value={editedAddress}
                    onChange={(e) => setEditedAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
                  />
                </div>
              </div>
              
              <button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="w-full bg-[#E07A5F] text-white py-3 rounded-lg font-medium disabled:opacity-50"
              >
                {isLoading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};