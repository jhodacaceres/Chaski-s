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
        phone_number: editedPhone
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-gray-600">
              <ArrowLeft size={24} />
            </button>
            <span className="text-lg font-medium text-gray-900">Perfil</span>
          </div>
          <button className="text-gray-600">
            <span className="text-sm">Cbba</span>
          </button>
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

      {/* Profile Section */}
      <div className="px-4 py-6">
        {/* Profile Image and Name */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 overflow-hidden">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl text-gray-600">👤</div>
            )}
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            {user?.name || 'Usuario'}
          </h2>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={16} 
                className={`${
                  i < Math.floor(user?.averageRating || 0) 
                    ? 'text-yellow-400 fill-yellow-400' 
                    : 'text-gray-300'
                }`} 
              />
            ))}
            <span className="text-gray-500 text-sm ml-2">
              ({(user?.averageRating || 0).toFixed(1)}) • {user?.totalRatings || 0} reseñas
            </span>
          </div>
        </div>

        {/* Information Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información</h3>
          
          <div className="space-y-4">
            {/* Name */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                  <User size={16} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Nombre</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      placeholder="Nombre completo"
                      className="mt-1 px-2 py-1 border border-gray-300 rounded text-sm w-full"
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">{user?.name || 'No especificado'}</p>
                  )}
                </div>
              </div>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400"
                >
                  <Edit size={16} />
                </button>
              )}
            </div>

            {/* Description */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Edit size={16} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Descripción</p>
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
                      {editedDescription || 'Añade una descripción'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                  <MapPin size={16} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Ubicación (opcional)</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedAddress}
                      onChange={(e) => setEditedAddress(e.target.value)}
                      placeholder="Ingresa la dirección de tu tienda"
                      className="mt-1 px-2 py-1 border border-gray-300 rounded text-sm w-full"
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">
                      {user?.address || 'Ingresa la dirección de tu tienda'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                  <ShoppingBag size={16} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Categoría</p>
                  {isEditing ? (
                    <select
                      value={editedCategory}
                      onChange={(e) => setEditedCategory(e.target.value)}
                      className="mt-1 px-2 py-1 border border-gray-300 rounded text-sm w-full"
                    >
                      <option value="">Ingresa la categoría de tu tienda</option>
                      <option value="Ropa">Ropa</option>
                      <option value="Tecnología">Tecnología</option>
                      <option value="Accesorios">Accesorios</option>
                      <option value="Hogar">Hogar</option>
                      <option value="Deportes">Deportes</option>
                      <option value="Otros">Otros</option>
                    </select>
                  ) : (
                    <p className="text-gray-600 text-sm">
                      {editedCategory || 'Ingresa la categoría de tu tienda'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Phone size={16} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Teléfono (opcional)</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedPhone}
                      onChange={(e) => setEditedPhone(e.target.value)}
                      placeholder="Añade un número de contacto"
                      className="mt-1 px-2 py-1 border border-gray-300 rounded text-sm w-full"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-gray-600 text-sm">
                        {showPhone 
                          ? (user?.phoneNumber || 'Añade un número de contacto')
                          : (user?.phoneNumber ? '••••••••' : 'Añade un número de contacto')
                        }
                      </p>
                      {user?.phoneNumber && (
                        <button
                          onClick={() => setShowPhone(!showPhone)}
                          className="text-gray-400"
                        >
                          {showPhone ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing ? (
          <div className="flex gap-3">
            <button
              onClick={handleCancelEdit}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={isLoading}
              className="flex-1 py-3 bg-[#E07A5F] text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E07A5F]/90 transition-colors"
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button className="flex-1 py-3 bg-[#E07A5F] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#E07A5F]/90 transition-colors">
              <ShoppingBag size={20} />
              Publicar un producto
            </button>
            <button className="flex-1 py-3 bg-[#E07A5F] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#E07A5F]/90 transition-colors">
              <Store size={20} />
              Crear tienda
            </button>
          </div>
        )}
      </div>
    </div>
  );
};