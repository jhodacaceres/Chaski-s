import React from 'react';
import { Home, Heart, ShoppingCart, User } from 'lucide-react';

interface BottomNavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  cartItemCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  currentPage, 
  onPageChange,
  cartItemCount = 0
}) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'wishlist', icon: Heart, label: 'Lista de deseos' },
    { id: 'cart', icon: ShoppingCart, label: 'Tu carrito' },
    { id: 'profile', icon: User, label: 'Perfil' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around items-center">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onPageChange(id)}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors relative ${
              currentPage === id 
                ? 'text-[#E07A5F] bg-[#E07A5F]/10' 
                : 'text-gray-500 hover:text-[#E07A5F]'
            }`}
          >
            <Icon size={20} />
            <span className="text-xs mt-1 font-medium">{label}</span>
            
            {id === 'cart' && cartItemCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-[#E07A5F] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};