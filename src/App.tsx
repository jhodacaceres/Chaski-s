import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth.tsx';
import { useStore } from './hooks/useStore';
import { useMessages } from './hooks/useMessages';
import { LoginScreen } from './components/Auth/LoginScreen';
import { HomeScreen } from './components/Home/HomeScreen';
import { WishlistScreen } from './components/Wishlist/WishlistScreen';
import { CartScreen } from './components/Cart/CartScreen';
import { CheckoutScreen } from './components/Checkout/CheckoutScreen';
import { ProfileScreen } from './components/Profile/ProfileScreen';
import { ViewProfileScreen } from './components/Profile/ViewProfileScreen';
import { UserProfileScreen } from './components/Profile/UserProfileScreen';
import { MessagesScreen } from './components/Messages/MessagesScreen';
import { CreateStoreScreen } from './components/Store/CreateStoreScreen';
import { CreateProductScreen } from './components/Products/CreateProductScreen';
import { MyStoresScreen } from './components/Store/MyStoresScreen';
import { BottomNavigation } from './components/Layout/BottomNavigation';

function AppContent() {
  const { user } = useAuth();
  const { getCartItemCount } = useStore();
  const { getTotalUnreadCount } = useMessages();
  const [currentPage, setCurrentPage] = useState('home');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCreateStore, setShowCreateStore] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [showViewProfile, setShowViewProfile] = useState(false);
  const [showMyStores, setShowMyStores] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [userIdToView, setUserIdToView] = useState<string | null>(null);

  if (!user) {
    return <LoginScreen />;
  }

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handleBackFromCheckout = () => {
    setShowCheckout(false);
  };

  const handleCreateStore = () => {
    setShowCreateStore(true);
  };

  const handleCreateProduct = (storeId?: string) => {
    if (storeId) {
      setSelectedStoreId(storeId);
    }
    setShowCreateProduct(true);
  };

  const handleBackFromCreateStore = () => {
    setShowCreateStore(false);
  };

  const handleBackFromCreateProduct = () => {
    setShowCreateProduct(false);
    setSelectedStoreId(null);
  };

  const handleStoreCreated = () => {
    setShowCreateStore(false);
    setCurrentPage('home');
  };

  const handleProductCreated = () => {
    setShowCreateProduct(false);
    setSelectedStoreId(null);
    setCurrentPage('home');
  };

  const handleViewMyStores = () => {
    setShowMyStores(true);
  };

  const handleBackFromMyStores = () => {
    setShowMyStores(false);
  };

  const handleOpenMessages = () => {
    setCurrentPage('messages');
  };

  const handleViewProfile = () => {
    setShowViewProfile(true);
  };

  const handleViewUserProfile = (userId: string) => {
    setUserIdToView(userId);
    setShowViewProfile(true);
  };

  const handleBackFromViewProfile = () => {
    setShowViewProfile(false);
    setUserIdToView(null);
  };

  if (showCheckout) {
    return <CheckoutScreen onBack={handleBackFromCheckout} />;
  }

  if (showCreateStore) {
    return (
      <CreateStoreScreen 
        onBack={handleBackFromCreateStore}
        onStoreCreated={handleStoreCreated}
      />
    );
  }

  if (showCreateProduct) {
    return (
      <CreateProductScreen 
        onBack={handleBackFromCreateProduct}
        onProductCreated={handleProductCreated}
        selectedStoreId={selectedStoreId}
      />
    );
  }

  if (showMyStores) {
    return (
      <MyStoresScreen 
        onBack={handleBackFromMyStores}
        onCreateStore={handleCreateStore}
        onCreateProduct={handleCreateProduct}
      />
    );
  }

  if (showViewProfile) {
    if (userIdToView) {
      return <UserProfileScreen onBack={handleBackFromViewProfile} userId={userIdToView} />;
    } else {
      return <ViewProfileScreen onBack={handleBackFromViewProfile} />;
    }
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomeScreen 
            onOpenMessages={handleOpenMessages}
            onCreateStore={handleCreateStore}
            onCreateProduct={handleCreateProduct}
            onViewUserProfile={handleViewUserProfile}
            messageCount={getTotalUnreadCount()}
          />
        );
      case 'wishlist':
        return <WishlistScreen />;
      case 'cart':
        return <CartScreen onCheckout={handleCheckout} />;
      case 'messages':
        return <MessagesScreen />;
      case 'profile':
        return (
          <ProfileScreen 
            onViewProfile={handleViewProfile}
            onViewStores={handleViewMyStores}
          />
        );
      default:
        return (
          <HomeScreen 
            onOpenMessages={handleOpenMessages}
            onCreateStore={handleCreateStore}
            onCreateProduct={handleCreateProduct}
            onViewUserProfile={handleViewUserProfile}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="pb-16">
        {renderCurrentPage()}
      </div>
      
      <BottomNavigation
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        cartItemCount={getCartItemCount()}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;