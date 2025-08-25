                                                                                                                                                                                                                                                                                                                                                    import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { login, loginWithGoogle, loginWithApple, register, isLoading } = useAuth();

  // Mock user for demo purposes
  const handleSkipLogin = () => {
    // This will be handled in the useAuth hook
    window.localStorage.setItem('skipAuth', 'true');
    window.location.reload();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Client-side validation
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    
    if (email && password) {
      try {
        if (isSignUp) {
          await register(email, password, { name, role: 'buyer' });
        } else {
          await login(email, password);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        let errorMessage = 'Error en la autenticación. Por favor, intenta de nuevo.';
        
        if (error instanceof Error) {
          if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Credenciales incorrectas. ¿No tienes cuenta? Regístrate primero.';
          } else if (error.message.includes('User already registered')) {
            errorMessage = 'Este email ya está registrado. Intenta iniciar sesión.';
          } else {
            errorMessage = error.message;
          }
        }
        
        setError(errorMessage);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-8">
        {/* Logo */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-[#E07A5F] mb-2">CHASKI</h1>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
            </h2>
            <p className="text-gray-600 text-sm">
              {isSignUp ? 'Ingresa tus datos para registrarte' : 'Ingresa tu email y contraseña'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {isSignUp && (
              <input
                type="text"
                placeholder="Nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
              />
            )}
            <input
              type="email"
              placeholder="email@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
            />
            
            <input
              type="password"
             placeholder="Contraseña (mínimo 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
            />
            
            <button
              type="submit"
              disabled={!email || !password || password.length < 6 || (isSignUp && !name) || isLoading}
              className="w-full bg-[#E07A5F] text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E07A5F]/90 transition-colors"
            >
              {isLoading ? 'Cargando...' : (isSignUp ? 'Registrarse' : 'Continuar')}
            </button>
          </form>

          <div className="text-center text-gray-500 text-sm">
            or
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <button
              onClick={loginWithGoogle}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button
              onClick={loginWithApple}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.347-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
              </svg>
              Continuar con Apple
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#E07A5F] text-sm font-medium"
            >
              {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>

          {/* Skip Login Button */}
          <div className="text-center">
            <button
              onClick={handleSkipLogin}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Continuar sin cuenta (Demo)
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center leading-relaxed">
  Al continuar, aceptas nuestros <span className="underline">Términos de Servicio</span> y <span className="underline">Política de Privacidad</span>.
</p> 
        </div>
      </div>
    </div>
  );
};