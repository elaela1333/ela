import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { addCompany, getCompanies } from '../utils/auth';
import CompanyDetails from './CompanyDetails';
import ThemeSelector from './ThemeSelector';
import { Building, LogOut, Palette, Plus, User } from 'lucide-react';

const CompanyList = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isCurrentThemeDark } = useTheme();
  
  useEffect(() => {
    // Load companies from localStorage
    const loadedCompanies = getCompanies();
    setCompanies(loadedCompanies);
    setLoading(false);
  }, []);
  
  if (loading) {
    return <div className="text-center p-4">Ładowanie...</div>;
  }
  
  if (companies.length === 0) {
    return (
      <div className={`text-center p-8 border-2 border-dashed rounded-lg ${
        isCurrentThemeDark ? 'border-gray-700' : 'border-gray-300'
      }`}>
        <Building className={`mx-auto h-12 w-12 ${
          isCurrentThemeDark ? 'text-gray-600' : 'text-gray-400'
        }`} />
        <h3 className={`mt-2 text-sm font-semibold ${
          isCurrentThemeDark ? 'text-gray-200' : 'text-gray-900'
        }`}>Brak firm</h3>
        <p className={`mt-1 text-sm ${
          isCurrentThemeDark ? 'text-gray-400' : 'text-gray-500'
        }`}>Dodaj pierwszą firmę używając formularza powyżej.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {companies.map((company) => (
        <Link
          key={company.id}
          to={`/super-admin/companies/${company.id}`}
          className={`block p-6 rounded-lg border shadow-sm hover:shadow ${
            isCurrentThemeDark 
              ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <h5 className={`mb-2 text-xl font-bold tracking-tight ${
            isCurrentThemeDark ? 'text-gray-100' : 'text-gray-900'
          }`}>{company.name}</h5>
          <p className={`text-sm mb-1 ${
            isCurrentThemeDark ? 'text-gray-400' : 'text-gray-600'
          }`}>{company.address}</p>
          <p className={`text-sm mb-1 ${
            isCurrentThemeDark ? 'text-gray-400' : 'text-gray-600'
          }`}>Tel: {company.phone}</p>
          <p className={`text-sm ${
            isCurrentThemeDark ? 'text-gray-400' : 'text-gray-600'
          }`}>Email: {company.email}</p>
        </Link>
      ))}
    </div>
  );
};

const CompanyForm = ({ onCompanyAdded }: { onCompanyAdded: () => void }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isCurrentThemeDark } = useTheme();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Add company to localStorage
      addCompany({
        name,
        address,
        phone,
        email
      });
      
      // Reset form
      setName('');
      setAddress('');
      setPhone('');
      setEmail('');
      
      // Notify parent component
      onCompanyAdded();
    } catch (err) {
      setError('Wystąpił błąd podczas dodawania firmy');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={`rounded-lg p-6 shadow-sm ${
      isCurrentThemeDark ? 'bg-gray-800' : 'bg-white'
    }`}>
      <h3 className={`text-lg font-medium mb-4 ${
        isCurrentThemeDark ? 'text-gray-100' : 'text-gray-900'
      }`}>Dodaj nową firmę</h3>
      
      {error && (
        <div className={`p-3 mb-4 rounded ${
          isCurrentThemeDark 
            ? 'bg-red-900/30 border border-red-800 text-red-200'
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isCurrentThemeDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Nazwa firmy
            </label>
            <input
              type="text"
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                isCurrentThemeDark 
                  ? 'bg-gray-700 border-gray-600 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isCurrentThemeDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Adres
            </label>
            <input
              type="text"
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                isCurrentThemeDark 
                  ? 'bg-gray-700 border-gray-600 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isCurrentThemeDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Telefon
            </label>
            <input
              type="text"
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                isCurrentThemeDark 
                  ? 'bg-gray-700 border-gray-600 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isCurrentThemeDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Email
            </label>
            <input
              type="email"
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                isCurrentThemeDark 
                  ? 'bg-gray-700 border-gray-600 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          <Plus className="h-4 w-4 mr-2" />
          {loading ? 'Dodawanie...' : 'Dodaj firmę'}
        </button>
      </form>
    </div>
  );
};

const Companies = () => {
  const [refresh, setRefresh] = useState(0);
  
  const handleCompanyAdded = () => {
    // Trigger re-render of company list
    setRefresh((prev) => prev + 1);
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Zarządzanie firmami</h2>
      
      <CompanyForm onCompanyAdded={handleCompanyAdded} />
      
      <h3 className="text-xl font-semibold mt-8 mb-4">Lista firm</h3>
      
      <CompanyList key={refresh} />
    </div>
  );
};

const ThemesPanel = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Ustawienia motywu</h2>
      <ThemeSelector />
    </div>
  );
};

const SuperAdminPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isCurrentThemeDark } = useTheme();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className={`shadow ${
        isCurrentThemeDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className={`text-xl font-bold ${
            isCurrentThemeDark ? 'text-gray-100' : 'text-gray-900'
          }`}>Panel Super Admina</h1>
          
          <div className="flex items-center">
            <span className={`mr-4 text-sm ${
              isCurrentThemeDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <User className="h-4 w-4 inline mr-1" />
              {user?.name || user?.login}
            </span>
            <button
              onClick={handleLogout}
              className={`inline-flex items-center px-3 py-1.5 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isCurrentThemeDark
                  ? 'border-gray-700 text-gray-300 bg-gray-800 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <LogOut className="h-4 w-4 mr-1" />
              Wyloguj
            </button>
          </div>
        </div>
      </header>
      
      {/* Navigation */}
      <div className={`border-b ${
        isCurrentThemeDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-4 overflow-x-auto py-3">
            <NavLink 
              to="/super-admin/companies" 
              currentPath={location.pathname}
              icon={<Building className="h-4 w-4 mr-1" />} 
              label="Firmy" 
            />
            <NavLink 
              to="/super-admin/themes" 
              currentPath={location.pathname}
              icon={<Palette className="h-4 w-4 mr-1" />} 
              label="Motywy" 
            />
          </nav>
        </div>
      </div>
      
      {/* Main content */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${
        isCurrentThemeDark ? 'text-gray-100' : 'text-gray-900'
      }`}>
        <Routes>
          <Route path="/" element={<Companies />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:companyId" element={<CompanyDetails />} />
          <Route path="/themes" element={<ThemesPanel />} />
        </Routes>
      </main>
    </div>
  );
};

const NavLink = ({ 
  to, 
  icon, 
  label,
  currentPath
}: { 
  to: string, 
  icon: React.ReactNode, 
  label: string,
  currentPath: string 
}) => {
  const isActive = currentPath.startsWith(to);
  const { isCurrentThemeDark } = useTheme();
  
  return (
    <Link
      to={to}
      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
        isActive 
          ? isCurrentThemeDark
            ? 'bg-gray-700 text-white' 
            : 'bg-indigo-50 text-indigo-700'
          : isCurrentThemeDark
            ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
};

export default SuperAdminPanel;
