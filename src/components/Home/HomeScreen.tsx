import React, { useState, useEffect } from 'react';
// Se importa el ícono 'Check' para la animación del carrito
import { Search, Plus, ShoppingCart, Heart, User, MessageCircle, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  store_id: string;
  user_id?: string;
  stores?: {
    owner_id: string;
  };
}

interface HomeScreenProps {
  onOpenMessages: () => void;
  onCreateStore: () => void;
  onCreateProduct: () => void;
  onViewUserProfile: (userId: string) => void;
  messageCount: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenMessages,
  onCreateStore,
  onCreateProduct,
  onViewUserProfile,
  messageCount
}) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // --- NUEVOS ESTADOS PARA ANIMACIONES ---
  // Guarda el ID del producto que se está añadiendo al carrito
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  // Guarda los IDs de los productos en la lista de deseos para una respuesta instantánea
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProducts();
  }, []);

  // --- NUEVO USEEFFECT PARA CARGAR LA LISTA DE DESEOS ---
  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          stores (
            owner_id
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- NUEVA FUNCIÓN PARA OBTENER LA LISTA DE DESEOS ---
  const fetchWishlist = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('product_id')
        .eq('user_id', user.id);
      
      if (error) throw error;

      const wishlistedIds = new Set(data.map(item => item.product_id));
      setWishlistItems(wishlistedIds);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewCreatorProfile = (product: Product) => {
  // --- PASO DE DEPURACIÓN: AÑADE ESTOS CONSOLE.LOG ---
  console.log("Producto seleccionado:", product);
  
  const creatorId = product.stores?.owner_id || product.user_id;
  console.log("ID del creador extraído:", creatorId);
  
  if (creatorId) {
    onViewUserProfile(creatorId);
  } else {
    console.error('No se pudo encontrar el ID del creador para este producto.');
  }
};

  // --- FUNCIÓN addToCart ACTUALIZADA CON ANIMACIÓN ---
  const addToCart = async (productId: string) => {
    if (addingToCart) return; // Evita múltiples clics durante la animación

    try {
      setAddingToCart(productId); // Inicia la animación
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAddingToCart(null); // Resetea si no hay usuario
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .insert({ user_id: user.id, product_id: productId, quantity: 1 });

      if (error) throw error;

      // Mantiene el estado de "Agregado" por 1.5 segundos
      setTimeout(() => {
        setAddingToCart(null);
      }, 1500);

    } catch (error) {
      console.error('Error adding to cart:', error);
      setAddingToCart(null); // Resetea el estado en caso de error
    }
  };

  // --- FUNCIÓN toggleWishlist ACTUALIZADA PARA RESPUESTA INSTANTÁNEA ---
  const toggleWishlist = async (productId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const isWishlisted = wishlistItems.has(productId);

      if (isWishlisted) {
        // Actualiza el estado local primero para una UI instantánea
        setWishlistItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        // Elimina de la base de datos en segundo plano
        await supabase
          .from('wishlist_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
      } else {
        // Actualiza el estado local primero
        setWishlistItems(prev => new Set(prev).add(productId));
        // Inserta en la base de datos en segundo plano
        await supabase
          .from('wishlist_items')
          .insert({ user_id: user.id, product_id: productId });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      // Opcional: Revertir el cambio de estado si la operación de DB falla
      fetchWishlist();
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">Inicio</h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenMessages}
              className="relative p-2 text-gray-600 hover:text-orange-500 transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
              {messageCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {messageCount}
                </span>
              )}
            </button>
            <button
              onClick={onCreateStore}
              className="p-2 text-gray-600 hover:text-orange-500 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <ShoppingCart className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500">No hay productos disponibles</p>
            <button
              onClick={onCreateProduct}
              className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Crear Producto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => {
              // --- VARIABLES PARA CONTROLAR ESTADO DE LOS BOTONES ---
              const isWishlisted = wishlistItems.has(product.id);
              const isAdding = addingToCart === product.id;

              return (
                <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="relative aspect-square">
                    <img
                      src={product.images[0] || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleViewCreatorProfile(product)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-orange-500 font-bold text-lg mb-3">
                      ${product.price}
                    </p>

                    {/* --- BOTONES DE ACCIÓN CON ANIMACIONES --- */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => addToCart(product.id)}
                        disabled={isAdding}
                        className={`flex-1 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out flex items-center justify-center transform active:scale-95 ${
                          isAdding
                            ? 'bg-green-500' // Color de confirmación
                            : 'bg-orange-500 hover:bg-orange-600'
                        }`}
                      >
                        {isAdding ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Agregado
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Agregar
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Heart
                          className={`w-4 h-4 transition-all duration-200 ease-in-out transform active:scale-125 ${
                            isWishlisted ? 'text-red-500' : 'text-gray-600'
                          }`}
                          fill={isWishlisted ? 'currentColor' : 'none'}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};