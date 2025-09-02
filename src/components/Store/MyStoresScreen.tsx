import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Store, Package, ChevronRight, Edit, Trash, Eye } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { useAuth } from '../../hooks/useAuth';
import { Store as StoreType, Product } from '../../types';
import { EditStoreScreen } from './EditStoreScreen';
import { EditProductScreen } from '../Products/EditProductScreen';

interface MyStoresScreenProps {
  onBack: () => void;
  onCreateStore: () => void;
  onCreateProduct: (storeId: string) => void;
}

export const MyStoresScreen: React.FC<MyStoresScreenProps> = ({
  onBack,
  onCreateStore,
  onCreateProduct,
}) => {
  const { stores, products } = useStore();
  const { user } = useAuth();
  const [expandedStoreId, setExpandedStoreId] = useState<string | null>(null);
  const [editingStore, setEditingStore] = useState<StoreType | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const myStores = stores.filter(store => store.ownerId === user?.id);

  const getStoreProducts = (storeId: string): Product[] => {
    return products.filter(product => product.storeId === storeId);
  };

  const handleStoreUpdated = () => {
    setEditingStore(null);
    // Refresh stores data
    window.location.reload();
  };

  const handleProductUpdated = () => {
    setEditingProduct(null);
    // Refresh products data
    window.location.reload();
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        const { error } = await supabase
          .from('products')
          .update({ is_active: false })
          .eq('id', productId);

        if (error) throw error;
        
        // Refresh the page to show updated data
        window.location.reload();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error al eliminar el producto');
      }
    }
  };

  if (editingStore) {
    return (
      <EditStoreScreen
        store={editingStore}
        onBack={() => setEditingStore(null)}
        onStoreUpdated={handleStoreUpdated}
      />
    );
  }

  if (editingProduct) {
    return (
      <EditProductScreen
        product={editingProduct}
        stores={myStores}
        onBack={() => setEditingProduct(null)}
        onProductUpdated={handleProductUpdated}
      />
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-gray-600">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Mis Tiendas</h1>
          </div>
          <button
            onClick={onCreateStore}
            className="flex items-center gap-2 px-4 py-2 bg-[#E07A5F] text-white rounded-lg hover:bg-[#E07A5F]/90 transition-colors"
          >
            <Plus size={20} />
            <span>Crear Tienda</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {myStores.length === 0 ? (
          <div className="text-center py-8">
            <Store size={48} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">No tienes tiendas creadas</p>
            <button
              onClick={onCreateStore}
              className="mt-4 text-[#E07A5F] hover:text-[#E07A5F]/90 font-medium"
            >
              Crear mi primera tienda
            </button>
          </div>
        ) : (
          myStores.map(store => (
            <div key={store.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Store Header */}
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedStoreId(expandedStoreId === store.id ? null : store.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Store className="text-gray-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{store.name}</h3>
                    <p className="text-sm text-gray-500">{store.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingStore(store);
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit size={20} />
                  </button>
                  <ChevronRight 
                    size={20} 
                    className={`text-gray-400 transition-transform ${
                      expandedStoreId === store.id ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Store Products */}
              {expandedStoreId === store.id && (
                <div className="border-t border-gray-200">
                  <div className="p-4 bg-gray-50 flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Productos</h4>
                    <button
                      onClick={() => onCreateProduct(store.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-[#E07A5F] text-white rounded-lg hover:bg-[#E07A5F]/90 transition-colors text-sm"
                    >
                      <Plus size={16} />
                      <span>Añadir Producto</span>
                    </button>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {getStoreProducts(store.id).length === 0 ? (
                      <div className="p-4 text-center">
                        <Package size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-600 text-sm">No hay productos en esta tienda</p>
                      </div>
                    ) : (
                      getStoreProducts(store.id).map(product => (
                        <div key={product.id} className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg">
                              {product.image && (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{product.name}</h4>
                              <p className="text-sm text-gray-500">
                                Stock: {product.stock} | ${product.price}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setEditingProduct(product)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                              <Edit size={20} />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash size={20} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
