import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, MapPin, Phone, Mail, MessageCircle, User, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useMessages } from '../../hooks/useMessages';
import { User as UserType, Rating } from '../../types';

interface UserProfileScreenProps {
  userId: string;
  onBack: () => void;
}

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ userId, onBack }) => {
  const { user: currentUser } = useAuth();
  const { createConversation } = useMessages();
  const [profileUser, setProfileUser] = useState<UserType | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [userComment, setUserComment] = useState<string>('');
  const [existingRating, setExistingRating] = useState<Rating | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUserProfile();
    if (currentUser) {
      fetchExistingRating();
    }
  }, [userId, currentUser]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found for this user ID
          setProfileUser(null);
          setIsLoading(false);
          return;
        }
        throw error;
      }

      // Get user email from auth.users
      const { data: authData } = await supabase.auth.admin.getUserById(userId);
      
      setProfileUser({
        id: data.id,
        name: data.name || 'Usuario',
        email: authData.user?.email || '',
        role: data.role,
        profileImage: data.profile_image || undefined,
        ci: data.ci || undefined,
        address: data.address || undefined,
        phoneNumber: data.phone_number || undefined,
        averageRating: data.average_rating || 0,
        totalRatings: data.total_ratings || 0
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExistingRating = async () => {
    if (!currentUser) return;
    
    // Skip rating queries for demo users to avoid UUID errors
    if (currentUser.id === 'demo-user-id') return;

    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('rated_user_id', userId)
        .single();

      if (data) {
        setExistingRating(data);
        setUserRating(data.rating);
        setUserComment(data.comment || '');
      }
    } catch (error) {
      // No existing rating found, which is fine
    }
  };

  const submitRating = async () => {
    if (!currentUser || !userRating || userRating < 1 || userRating > 5) return;
    
    // Skip rating operations for demo users to avoid UUID errors
    if (currentUser.id === 'demo-user-id') {
      setMessage('Función no disponible en modo demo');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsSubmittingRating(true);
    try {
      if (existingRating) {
        const { error } = await supabase
          .from('ratings')
          .update({
            rating: userRating,
            comment: userComment,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRating.id);

        if (error) throw error;
        setMessage('Calificación actualizada correctamente');
      } else {
        const { error } = await supabase
          .from('ratings')
          .insert({
            user_id: currentUser.id,
            rated_user_id: userId,
            rating: userRating,
            comment: userComment
          });

        if (error) throw error;
        setMessage('Calificación enviada correctamente');
      }

      await fetchUserProfile();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error submitting rating:', error);
      setMessage('Error al enviar la calificación');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentUser || currentUser.id === 'demo-user-id') {
      setMessage('Función no disponible en modo demo');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsCreatingConversation(true);
    try {
      await createConversation(userId);
      setMessage('Conversación creada. Ve a la sección de mensajes para chatear.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error creating conversation:', error);
      setMessage('Error al crear la conversación');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsCreatingConversation(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E07A5F] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Usuario no encontrado</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-[#E07A5F] text-white rounded-lg"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const canRate = currentUser && currentUser.id !== userId;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-gray-200">
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
            {profileUser.profileImage ? (
              <img src={profileUser.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <User size={32} />
              </div>
            )}
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            {profileUser.name}
          </h2>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={14} 
                className={`${
                  i < Math.floor(profileUser.averageRating || 0) 
                    ? 'text-yellow-400 fill-yellow-400' 
                    : 'text-gray-300'
                }`} 
              />
            ))}
            <span className="text-gray-500 text-xs ml-1">
              {(profileUser.averageRating || 0).toFixed(1)} ({profileUser.totalRatings || 0} reseñas)
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
                <div>
                  <p className="text-sm font-medium text-gray-900">Número de teléfono</p>
                  <p className="text-gray-600 text-sm">{profileUser.phoneNumber || '74532345'}</p>
                </div>
              </div>
              <button className="text-gray-400">
                <Eye size={16} />
              </button>
            </div>

            {/* Description */}
            <div className="p-3 bg-white rounded-lg">
              <div className="flex items-center gap-3">
                <Edit size={16} className="text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Descripción</p>
                  <p className="text-gray-600 text-sm">Añade una descripción</p>
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
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
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

        {/* Rating Section */}
        {canRate && (
          <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              {existingRating ? 'Tu calificación' : 'Calificar usuario'}
            </h3>
            
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium text-gray-700">Calificación:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setUserRating(star)}
                      className="transition-colors"
                    >
                      <Star
                        size={20}
                        className={`${
                          star <= userRating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 hover:text-yellow-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <textarea
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="Comparte tu experiencia..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent resize-none text-sm"
                />
              </div>

              <button
                onClick={submitRating}
                disabled={!userRating || isSubmittingRating}
                className="w-full bg-[#E07A5F] text-white py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E07A5F]/90 transition-colors text-sm"
              >
                {isSubmittingRating 
                  ? 'Enviando...' 
                  : existingRating 
                    ? 'Actualizar calificación' 
                    : 'Enviar calificación'
                }
              </button>
            </div>
          </div>
        )}

        {/* Contact Button */}
        <button 
          onClick={handleSendMessage}
          disabled={isCreatingConversation}
          className="w-full bg-[#E07A5F] text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#E07A5F]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreatingConversation ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creando conversación...
            </>
          ) : (
            <>
              <MessageCircle size={20} />
              Enviar mensaje
            </>
          )}
        </button>

        {/* Product Preview */}
        <div className="mt-6 bg-white rounded-lg overflow-hidden">
          <img 
            src="https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400" 
            alt="Product" 
            className="w-full h-32 object-cover" 
          />
        </div>
      </div>
    </div>
  );
};