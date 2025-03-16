import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getCompanyById, logActivity } from '../utils/auth';
import { Building, Calendar, LogOut, Palette, Scissors, User, UserRound, Users, Wallet } from 'lucide-react';
import EmployeesPanel from './company/EmployeesPanel';
import ServicesPanel from './company/ServicesPanel';
import ClientsPanel from './company/ClientsPanel';
import AppointmentsPanel from './company/AppointmentsPanel';
import FinancesPanel from './company/FinancesPanel';
import ClientHistory from './company/ClientHistory';
import ActivityLogPanel from './company/ActivityLogPanel';
import ThemeSelector from './ThemeSelector';

const ThemesPanel = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-100">Ustawienia motywu</h2>
      <ThemeSelector />
    </div>
  );
};

const CompanyAdminPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isCurrentThemeDark } = useTheme();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Load company details when component mounts
  useEffect(() => {
    if (user && user.companyId) {
      // Load company details
      const loadedCompany = getCompanyById(user.companyId);
      setCompany(loadedCompany);
    }
    setLoading(false);
  }, [user]);
  
  // Log user activity on page change
  useEffect(() => {
    if (user && company) {
      logActivity(user.id, 'page_view', 'page', '', {
        page: location.pathname,
        company_id: company.id
      });
    }
  }, [location.pathname, user, company]);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  if (loading) {
    return <div className="text-center p-8 text-gray-400">Ładowanie...</div>;
  }
  
  if (!company) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800 rounded-lg shadow-lg">
          <Building className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-lg font-medium text-red-400">Firma nie została znaleziona</h3>
          <p className="mt-1 text-sm text-gray-400">
            Nie można znaleźć firmy dla bieżącego użytkownika.
          </p>
          <button
            onClick={handleLogout}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Wyloguj się
          </button>
        </div>
      </div>
    );
  }
  
  // Determine background color based on theme
  const bgColor = isCurrentThemeDark ? 'bg-gray-900' : 'bg-gray-50';
  const headerBgColor = isCurrentThemeDark ? 'bg-gray-800' : 'bg-white';
  const borderColor = isCurrentThemeDark ? 'border-gray-700' : 'border-gray-200';
  const textColor = isCurrentThemeDark ? 'text-gray-100' : 'text-gray-900';
  const textSecondaryColor = isCurrentThemeDark ? 'text-gray-400' : 'text-gray-500';
  
  return (
    <div className={`min-h-screen ${bgColor}`}>
      {/* Header */}
      <header className={`${headerBgColor} shadow-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className={`text-xl font-bold ${textColor}`}>Panel administratora firmy</h1>
            <p className={`text-sm ${textSecondaryColor}`}>
              <Building className="h-4 w-4 inline mr-1" />
              {company.name}
            </p>
          </div>
          
          <div className="flex items-center">
            <span className={`mr-4 text-sm ${textSecondaryColor}`}>
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
      <div className={`${headerBgColor} shadow-md border-t ${borderColor}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-4 overflow-x-auto py-3">
            <NavLink to="/company-admin/employees" icon={<Users className="h-4 w-4 mr-1" />} label="Pracownicy" />
            <NavLink to="/company-admin/services" icon={<Scissors className="h-4 w-4 mr-1" />} label="Usługi" />
            <NavLink to="/company-admin/clients" icon={<UserRound className="h-4 w-4 mr-1" />} label="Klienci" />
            <NavLink to="/company-admin/appointments" icon={<Calendar className="h-4 w-4 mr-1" />} label="Wizyty" />
            <NavLink to="/company-admin/finances" icon={<Wallet className="h-4 w-4 mr-1" />} label="Finanse" />
            <NavLink to="/company-admin/activity" icon={<User className="h-4 w-4 mr-1" />} label="Aktywność" />
            <NavLink to="/company-admin/themes" icon={<Palette className="h-4 w-4 mr-1" />} label="Motywy" />
          </nav>
        </div>
      </div>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/employees" element={<EmployeesPanel company={company} user={user} />} />
          <Route path="/services" element={<ServicesPanel company={company} user={user} />} />
          <Route path="/clients" element={<ClientsPanel company={company} user={user} />} />
          <Route path="/clients/:clientId/history" element={<ClientHistory company={company} user={user} />} />
          <Route path="/appointments" element={<AppointmentsPanel company={company} user={user} />} />
          <Route path="/finances" element={<FinancesPanel company={company} user={user} />} />
          <Route path="/activity" element={<ActivityLogPanel company={company} user={user} />} />
          <Route path="/themes" element={<ThemesPanel />} />
          <Route path="/" element={<AppointmentsPanel company={company} user={user} />} />
        </Routes>
      </main>
    </div>
  );
};

const NavLink = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const { isCurrentThemeDark } = useTheme();
  
  return (
    <Link
      to={to}
      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive 
        ? isCurrentThemeDark 
          ? 'bg-gray-700 text-white' 
          : 'bg-indigo-50 text-indigo-700'
        : isCurrentThemeDark
          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
    >
      {icon}
      {label}
    </Link>
  );
};

export default CompanyAdminPanel;
