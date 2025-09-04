import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, ShoppingCart, Star, MapPin, User, MessageCircle, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Product, Store, User as UserType } from '../../types';
import { useStore } from '../../hooks/useStore';
import { useAuth } from '../../hooks/useAuth';
import { useMessages } from '../../hooks/useMessages';

interface ProductDetailScreenProps {
  product: Product;
  onBack: () => void;
  onViewUserProfile: (userId: string) => void;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ 
  product, 
  onBack, 
  onViewUserProfile 
}) => {
  const { user } = useAuth();
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const { createConversation } = useMessages();
  const [store, setStore] = useState<Store | null>(null);
  const [storeOwner, setStoreOwner] = useState<UserType | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [message, setMessage] = useState('');
  const [showCartAnimation, setShowCartAnimation] = useState(false);

  const productImages = product.images && product.images.length > 0 ? product.images : [product.image];

  useEffect(() => {
    fetchStoreAndOwner();
  }, [product.storeId]);

  const fetchStoreAndOwner = async () => {
    try {
      let ownerId: string | null = null;

      // If product has a store, fetch store information
      if (product.storeId) {
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('*')
          .eq('id', product.storeId)
          .single();

        if (storeError) throw storeError;

        const storeInfo: Store = {
          id: storeData.id,
          name: storeData.name,
          description: storeData.description || '',
          images: storeData.images || [],
          address: storeData.address,
          ownerId: storeData.owner_id,
          coordinates: storeData.coordinates ? [storeData.coordinates.x, storeData.coordinates.y] : [0, 0],
          isActive: storeData.is_active,
          createdAt: new Date(storeData.created_at)
        };

        setStore(storeInfo);
        ownerId = storeData.owner_id;
      } else if (product.userId) {
        // For products without stores, use the product's user_id
        ownerId = product.userId;
      }

      // Fetch owner information
      if (ownerId) {
        const { data: ownerData, error: ownerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', ownerId)
          .single();

        if (ownerError) throw ownerError;

        const ownerInfo: UserType = {
          id: ownerData.id,
          name: ownerData.name || 'Usuario',
          email: '', // We don't need email for display
          role: ownerData.role,
          profileImage: ownerData.profile_image || undefined,
          ci: ownerData.ci || undefined,
          address: ownerData.address || undefined,
          phoneNumber: ownerData.phone_number || undefined,
          averageRating: ownerData.average_rating || 0,
          totalRatings: ownerData.total_ratings || 0
        };

        setStoreOwner(ownerInfo);
      }
    } catch (error) {
      console.error('Error fetching store and owner:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    
    // Show cart animation
    setShowCartAnimation(true);
    setTimeout(() => {
      setShowCartAnimation(false);
    }, 2000);
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product.id);
    const isInWishlist = wishlist.includes(product.id);
    setMessage(isInWishlist ? 'Removido de la lista de deseos' : 'Agregado a la lista de deseos');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleContactSeller = async () => {
    if (!user || !storeOwner || user.id === 'demo-user-id') {
      setMessage('Función no disponible en modo demo');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsCreatingConversation(true);
    try {
      await createConversation(storeOwner.id);
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E07A5F] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-gray-600">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Detalle del producto</h1>
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
        {/* Product Images */}
        <div className="mb-6">
          <div className="aspect-square rounded-xl overflow-hidden mb-4">
            <img
              src={productImages[selectedImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {productImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index ? 'border-[#E07A5F]' : 'border-gray-200'
                  }`}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-3xl font-bold text-[#E07A5F] mb-4">${product.price}</p>
          <p className="text-gray-600 mb-4">{product.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span>Stock: {product.stock}</span>
            <span>Categoría: {product.category}</span>
          </div>
        </div>

        {/* Store Info */}
        {store && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-3">Información de la tienda</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                {store.images[0] ? (
                  <img src={store.images[0]} alt={store.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span className="text-lg">🏪</span>
                )}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{store.name}</h4>
                <p className="text-gray-600 text-sm">{store.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <MapPin size={14} />
              <span>{store.address}</span>
            </div>
          </div>
        )}

        {/* Seller Info */}
        {storeOwner && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-3">Vendedor</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                  {storeOwner.profileImage ? (
                    <img src={storeOwner.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} className="text-gray-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{storeOwner.name}</h4>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={12} 
                        className={`${
                          i < Math.floor(storeOwner.averageRating || 0) 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                    <span className="text-gray-500 text-xs ml-1">
                      ({(storeOwner.averageRating || 0).toFixed(1)})
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onViewUserProfile(storeOwner.id)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                >
                  Ver perfil
                </button>
                <button
                  onClick={handleContactSeller}
                  disabled={isCreatingConversation}
                  className="px-3 py-2 bg-[#E07A5F] text-white rounded-lg hover:bg-[#E07A5F]/90 transition-colors text-sm disabled:opacity-50"
                >
                  {isCreatingConversation ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <MessageCircle size={16} />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quantity Selector */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Cantidad</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors"
            >
              -
            </button>
            <span className="text-xl font-semibold text-gray-900 min-w-[3rem] text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors"
              disabled={quantity >= product.stock}
            >
              +
            </button>
            <span className="text-sm text-gray-500">Disponible: {product.stock}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6 relative">
          <button
            onClick={handleToggleWishlist}
            className={`flex-1 py-3 rounded-xl font-medium border-2 transition-colors ${
              wishlist.includes(product.id)
                ? 'border-[#E07A5F] bg-[#E07A5F]/10 text-[#E07A5F]'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Heart 
              size={20} 
              className={`inline mr-2 ${wishlist.includes(product.id) ? 'fill-current' : ''}`} 
            />
            {wishlist.includes(product.id) ? 'En lista de deseos' : 'Agregar a deseos'}
          </button>
          
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 py-3 bg-[#E07A5F] text-white rounded-xl font-medium hover:bg-[#E07A5F]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={20} className="inline mr-2" />
            {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
          </button>
          
          {/* Cart Animation Overlay */}
          {showCartAnimation && (
            <div className="absolute inset-0 bg-green-500 bg-opacity-90 rounded-xl flex items-center justify-center animate-pulse z-10">
              <div className="text-white text-center">
                <Check size={32} className="mx-auto mb-2" />
                <span className="font-medium">¡Agregado al carrito!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};