import React from 'react';
import { Edit, MapPin, Phone, Mail, CreditCard, ShoppingBag, Bell, HelpCircle, LogOut, ChevronRight, Save, X, Shield, User, Store, Star } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface ProfileScreenProps {
  onViewProfile?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onViewProfile }) => {
  const { user, supabaseUser, logout, updateUserProfile, updatePassword } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedName, setEditedName] = React.useState(user?.name || '');
  const [editedDescription, setEditedDescription] = React.useState('');
  const [editedAddress, setEditedAddress] = React.useState(user?.address || '');
  const [editedCategory, setEditedCategory] = React.useState('');
  const [editedPhone, setEditedPhone] = React.useState(user?.phoneNumber || '');
  const [isSellerMode, setIsSellerMode] = React.useState(user?.role === 'seller');
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');
  
  // Password setup state
  const [showPasswordSetup, setShowPasswordSetup] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const [passwordSuccess, setPasswordSuccess] = React.useState('');

  // Check if user registered with Google
  const isGoogleUser = supabaseUser?.app_metadata?.provider === 'google';

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

  const handlePasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(newPassword);
      setPasswordSuccess('Contraseña creada correctamente. Ahora puedes iniciar sesión con tu email y contraseña.');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSetup(false);
      setTimeout(() => setPasswordSuccess(''), 5000);
    } catch (error) {
      console.error('Error setting password:', error);
      setPasswordError('Error al crear la contraseña. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSellerToggle = async () => {
    const newRole = isSellerMode ? 'buyer' : 'seller';
    setIsLoading(true);
    
    try {
      // Here you would update the user role in the database
      // For now, just update local state
      setIsSellerMode(!isSellerMode);
      setMessage(`Modo ${newRole === 'seller' ? 'vendedor' : 'comprador'} activado`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating seller mode:', error);
      setMessage('Error al cambiar el modo');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium text-gray-900">Perfil</span>
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

      {passwordSuccess && (
        <div className="mx-4 mt-4 p-3 rounded-lg bg-green-100 text-green-800">
          <p className="text-sm">{passwordSuccess}</p>
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
          <div className="flex items-center justify-center gap-1 mb-4">
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
          
          {/* Ver perfil button */}
          <button
            onClick={onViewProfile}
            className="flex items-center justify-center gap-2 mx-auto px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <span className="text-sm font-medium">Ver perfil</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Seller Mode Toggle */}
        <div className="mb-8">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#E07A5F] rounded-lg flex items-center justify-center">
                <Store size={16} className="text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Modo Vendedor</p>
                <p className="text-gray-600 text-sm">
                  {isSellerMode ? 'Puedes vender productos' : 'Solo puedes comprar'}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isSellerMode}
                onChange={handleSellerToggle}
                disabled={isLoading}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#E07A5F]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E07A5F]"></div>
            </label>
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
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Edit size={16} className="text-gray-600" />
                </div>
                <p className="font-medium text-gray-900">Descripción</p>
              </div>
              {isEditing ? (
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Añade una descripción"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                />
              ) : (
                <p className="text-gray-600 text-sm ml-11">
                  {editedDescription || 'Añade una descripción'}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                  <MapPin size={16} className="text-gray-600" />
                </div>
                <p className="font-medium text-gray-900">Ubicación (opcional)</p>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedAddress}
                  onChange={(e) => setEditedAddress(e.target.value)}
                  placeholder="Ingresa la dirección de tu tienda"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              ) : (
                <p className="text-gray-600 text-sm ml-11">
                  {user?.address || 'Ingresa la dirección de tu tienda'}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                  <ShoppingBag size={16} className="text-gray-600" />
                </div>
                <p className="font-medium text-gray-900">Categoría</p>
              </div>
              {isEditing ? (
                <select
                  value={editedCategory}
                  onChange={(e) => setEditedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                <p className="text-gray-600 text-sm ml-11">
                  {editedCategory || 'Ingresa la categoría de tu tienda'}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Phone size={16} className="text-gray-600" />
                </div>
                <p className="font-medium text-gray-900">Teléfono (opcional)</p>
              </div>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedPhone}
                  onChange={(e) => setEditedPhone(e.target.value)}
                  placeholder="Añade un número de contacto"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              ) : (
                <p className="text-gray-600 text-sm ml-11">
                  {user?.phoneNumber || 'Añade un número de contacto'}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Mail size={16} className="text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">E-mail</p>
                  <p className="text-gray-600 text-sm">{supabaseUser?.email || user?.email || 'No especificado'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing ? (
          <div className="flex gap-3 mb-8">
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
          <div className="flex gap-3 mb-8">
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

        {/* Password Setup Section for Google Users */}
        {isGoogleUser && (
          <div className="mb-8 pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Seguridad</h3>
            
            {!showPasswordSetup ? (
              <button
                onClick={() => setShowPasswordSetup(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Shield size={20} className="text-gray-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Crear contraseña</p>
                    <p className="text-gray-600 text-sm">Permite iniciar sesión con email y contraseña</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </button>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Crear nueva contraseña</h4>
                  <button
                    onClick={() => {
                      setShowPasswordSetup(false);
                      setPasswordError('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handlePasswordSetup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nueva contraseña
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar contraseña
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la contraseña"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
                      required
                    />
                  </div>
                  
                  {passwordError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-600 text-sm">{passwordError}</p>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isLoading || !newPassword || !confirmPassword}
                    className="w-full bg-[#E07A5F] text-white py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E07A5F]/90 transition-colors"
                  >
                    {isLoading ? 'Creando contraseña...' : 'Crear contraseña'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
};