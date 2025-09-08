import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Phone, MessageCircle, User, Fingerprint } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useMessages } from '../../hooks/useMessages';
import { User as UserType, Rating } from '../../types';

// --- Definición de tipos para la tienda y productos ---
interface Store {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  contact_number?: string;
  location?: string;
}

interface Product {
  id: string;
  name: string;
  images: string[];
}


interface UserProfileScreenProps {
  userId: string;
  onBack: () => void;
}

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ userId, onBack }) => {
  const { user: currentUser } = useAuth();
  const { createConversation } = useMessages();
  const [profileUser, setProfileUser] = useState<UserType | null>(null);
  const [userStore, setUserStore] = useState<Store | null>(null);
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [userRating, setUserRating] = useState<number>(0);
  const [userComment, setUserComment] = useState<string>('');
  const [existingRating, setExistingRating] = useState<Rating | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAllUserData();
  }, [userId]);

  useEffect(() => {
    if (currentUser) {
      fetchExistingRating();
    }
  }, [currentUser, userId]);

  const fetchAllUserData = async () => {
    setIsLoading(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profileData) {
        setProfileUser({
          id: profileData.id,
          name: profileData.name || 'Usuario',
          email: '',
          role: profileData.role,
          profileImage: profileData.profile_image || undefined,
          ci: profileData.ci || undefined,
          address: profileData.address || undefined,
          phoneNumber: profileData.phone_number || undefined,
          averageRating: profileData.average_rating || 0,
          totalRatings: profileData.total_ratings || 0
        });

        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('*')
          .eq('owner_id', profileData.id)
          .limit(1)
          .maybeSingle();
        
        if (storeError) throw storeError;

        if (storeData) {
          setUserStore(storeData);
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('id, name, images')
            .eq('store_id', storeData.id)
            .limit(4);

          if (productsError) throw productsError;
          setStoreProducts(productsData || []);
        }
      } else {
        setProfileUser(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setProfileUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExistingRating = async () => {
    if (!currentUser) return;
    try {
      const { data } = await supabase
        .from('ratings')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('rated_user_id', userId)
        .maybeSingle();

      if (data) {
        setExistingRating(data);
        setUserRating(data.rating);
        setUserComment(data.comment || '');
      }
    } catch (error: any) {
      console.error('Error fetching existing rating:', error);
    }
  };

  const submitRating = async () => {
    if (!currentUser || !userRating || userRating < 1 || userRating > 5) return;

    setIsSubmittingRating(true);
    try {
      if (existingRating) {
        await supabase
          .from('ratings')
          .update({ rating: userRating, comment: userComment, updated_at: new Date().toISOString() })
          .eq('id', existingRating.id);
        setMessage('Calificación actualizada correctamente');
      } else {
        await supabase
          .from('ratings')
          .insert({ user_id: currentUser.id, rated_user_id: userId, rating: userRating, comment: userComment });
        setMessage('Calificación enviada correctamente');
      }
      await fetchAllUserData();
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
    if (!currentUser) return;

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E07A5F]"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-gray-600">Usuario no encontrado</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-[#E07A5F] text-white rounded-lg">Volver</button>
      </div>
    );
  }

  const canRate = currentUser && currentUser.id !== userId;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 py-4 flex items-center border-b border-gray-200">
        <button onClick={onBack} className="text-gray-600"><ArrowLeft size={24} /></button>
      </div>

      {message && (
        <div className={`mx-4 mt-4 p-3 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          <p className="text-sm">{message}</p>
        </div>
      )}

      <div className="px-4 py-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gray-400 rounded-full mx-auto mb-4 overflow-hidden">
            {profileUser.profileImage ? (
              <img src={profileUser.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300 text-white"><User size={32} /></div>
            )}
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">{profileUser.name}</h2>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} className={`${i < Math.floor(profileUser.averageRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
            ))}
            <span className="text-gray-500 text-xs ml-1">{(profileUser.averageRating || 0).toFixed(1)} ({profileUser.totalRatings || 0} reseñas)</span>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Información</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Número de teléfono</p>
                  <p className="text-gray-600 text-sm">{profileUser.phoneNumber || 'No proporcionado'}</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-white rounded-lg">
              <div className="flex items-center gap-3">
                <Fingerprint size={16} className="text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Cédula de Identidad</p>
                  <p className="text-gray-600 text-sm">{profileUser.ci || 'No proporcionado'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {userStore && (
          <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Tienda</h3>
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                  <img src={userStore.image_url || 'https://via.placeholder.com/100'} alt="Store" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{userStore.name}</h4>
                  <p className="text-gray-600 text-sm">{userStore.description || 'Sin descripción de tienda.'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p className="font-medium">Número de contacto</p>
                  <p>{userStore.contact_number || 'No disponible'}</p>
                </div>
                <div>
                  <p className="font-medium">Ubicación</p>
                  <p>{userStore.location || 'No disponible'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

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
                    <button key={star} onClick={() => setUserRating(star)} className="transition-colors">
                      <Star size={20} className={`${star <= userRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`} />
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
                {isSubmittingRating ? 'Enviando...' : existingRating ? 'Actualizar calificación' : 'Enviar calificación'}
              </button>
            </div>
          </div>
        )}

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

        {storeProducts.length > 0 && (
          <div className="mt-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Productos de la tienda</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {storeProducts.map(product => (
                <div key={product.id} className="bg-white rounded-lg overflow-hidden aspect-square">
                  <img 
                    src={product.images[0] || 'https://via.placeholder.com/150'} 
                    alt={product.name}
                    className="w-full h-full object-cover" 
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};