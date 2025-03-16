import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Lock, Palette, User } from 'lucide-react';
import ThemeSelector from './ThemeSelector';

const Login = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  
  const { login: authLogin } = useAuth();
  const { isCurrentThemeDark } = useTheme();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const success = await authLogin(login, password);
      
      if (success) {
        // Get the current user after login
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        // Redirect based on role
        if (currentUser.role === 'superadmin') {
          navigate('/super-admin');
        } else if (currentUser.role === 'admin') {
          navigate('/company-admin');
        }
      } else {
        setError('Nieprawidłowy login lub hasło');
      }
    } catch (err) {
      setError('Wystąpił błąd podczas logowania');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={`min-h-screen flex items-center justify-center ${
      isCurrentThemeDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className={`max-w-md w-full space-y-8 p-8 rounded-lg shadow-md ${
        isCurrentThemeDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="text-center">
          <h2 className={`mt-6 text-3xl font-bold ${
            isCurrentThemeDark ? 'text-gray-100' : 'text-gray-900'
          }`}>Panel logowania</h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className={`p-3 rounded ${
              isCurrentThemeDark 
                ? 'bg-red-900/30 border border-red-800 text-red-200'
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              {error}
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="login" className="sr-only">Login</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className={`h-5 w-5 ${
                    isCurrentThemeDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  id="login"
                  name="login"
                  type="text"
                  required
                  className={`appearance-none relative block w-full px-3 py-3 pl-10 border placeholder-gray-500 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                    isCurrentThemeDark
                      ? 'bg-gray-700 border-gray-600 text-gray-100'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Login"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">Hasło</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${
                    isCurrentThemeDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className={`appearance-none relative block w-full px-3 py-3 pl-10 border placeholder-gray-500 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                    isCurrentThemeDark
                      ? 'bg-gray-700 border-gray-600 text-gray-100'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Hasło"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {loading ? 'Logowanie...' : 'Zaloguj się'}
            </button>
          </div>
        </form>
        
        <div className="pt-4 text-center">
          <button
            type="button"
            onClick={() => setShowThemeSelector(!showThemeSelector)}
            className={`inline-flex items-center text-sm px-3 py-2 rounded-md ${
              isCurrentThemeDark
                ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Palette className="h-4 w-4 mr-2" />
            {showThemeSelector ? 'Ukryj wybór motywu' : 'Wybierz motyw'}
          </button>
          
          {showThemeSelector && (
            <div className="mt-4">
              <ThemeSelector />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
