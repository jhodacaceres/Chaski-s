                                                                                                                                                                                                                                                                                                                                                    import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const { login, loginWithGoogle, loginWithApple, register, isLoading } = useAuth();

  // Mock user for demo purposes
  const handleSkipLogin = () => {
    setProcessingAction(true);
    try {
      // This will be handled in the useAuth hook
      window.localStorage.setItem('skipAuth', 'true');
      window.location.reload();
    } catch (error) {
      setProcessingAction(false);
      setError('Error al intentar modo demo');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setProcessingAction(true);
    
    // Client-side validation
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setProcessingAction(false);
      return;
    }
    
    if (!email || !password) {
      setError('Por favor ingresa email y contraseña.');
      setProcessingAction(false);
      return;
    }

    try {
      if (isSignUp && !name) {
        setError('Por favor ingresa tu nombre.');
        setProcessingAction(false);
        return;
      }

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
        } else if (error.message.includes('La operación ha excedido el tiempo máximo de espera')) {
          errorMessage = 'La operación está tardando demasiado. Por favor, intenta de nuevo.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      setProcessingAction(false);
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
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            )}
            <input
              type="email"
              placeholder="email@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            
            <input
              type="password"
              disabled={isLoading}
              placeholder="Contraseña (mínimo 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
            />
            
            <button
              type="submit"
              disabled={!email || !password || password.length < 6 || (isSignUp && !name) || isLoading || processingAction}
              className="w-full bg-[#E07A5F] text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E07A5F]/90 transition-colors"
            >
              {(isLoading || processingAction) ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Cargando...</span>
                </div>
              ) : (
                isSignUp ? 'Registrarse' : 'Continuar'
              )}
            </button>
          </form>

          <div className="text-center text-gray-500 text-sm">
            or
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <button
              onClick={async (e) => {
                e.preventDefault();
                setProcessingAction(true);
                try {
                  await loginWithGoogle();
                } catch (error) {
                  console.error('Error logging in with Google:', error);
                  setError('Error al iniciar sesión con Google');
                  setProcessingAction(false);
                }
              }}
              disabled={isLoading || processingAction}
              className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#4285F4] border-t-transparent rounded-full animate-spin"></div>
                  <span>Conectando...</span>
                </div>
              ) : (
                'Continuar con Google'
              )}
            </button>

            <button
              onClick={async (e) => {
                e.preventDefault();
                setProcessingAction(true);
                try {
                  await loginWithApple();
                } catch (error) {
                  console.error('Error logging in with Apple:', error);
                  setError('Error al iniciar sesión con Apple');
                  setProcessingAction(false);
                }
              }}
              disabled={isLoading || processingAction}
              className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.543 14.1c-.054 1.292.962 1.925 1.005 1.955-.824 1.173-2.103 1.341-2.56 1.359-1.09.11-2.125-.624-2.683-.624-.557 0-1.416.606-2.329.59-1.195-.02-2.283-.676-2.897-1.712-1.235-2.074-.32-5.134.886-6.815.588-.84 1.29-1.783 2.21-1.75.885.033 1.22.555 2.282.555 1.062 0 1.363-.555 2.291-.537.946.017 1.547.838 2.13 1.68.67.98.945 1.925.962 1.975-.02.006-1.843.687-1.862 2.728M15.03 7.965c.483-.566.81-1.354.722-2.138-.697.028-1.54.452-2.037 1.017-.447.51-.838 1.325-.734 2.107.78.06 1.578-.396 2.049-.986"/>
              </svg>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
                  <span>Conectando...</span>
                </div>
              ) : (
                'Continuar con Apple'
              )}
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