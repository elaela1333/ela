import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  getCompanyById, 
  addCompanyAdmin, 
  getCompanyAdmins 
} from '../utils/auth';
import { ArrowLeft, User, Users } from 'lucide-react';

const AdminList = ({ companyId }: { companyId: string }) => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load admins for this company
    const loadedAdmins = getCompanyAdmins(companyId);
    setAdmins(loadedAdmins);
    setLoading(false);
  }, [companyId]);
  
  if (loading) {
    return <div className="text-center p-4">Ładowanie...</div>;
  }
  
  if (admins.length === 0) {
    return (
      <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Brak administratorów</h3>
        <p className="mt-1 text-sm text-gray-500">Dodaj pierwszego administratora używając formularza powyżej.</p>
      </div>
    );
  }
  
  return (
    <div className="mt-6 overflow-hidden bg-white shadow sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {admins.map((admin) => (
          <li key={admin.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <p className="font-medium text-indigo-600 truncate">{admin.name}</p>
                </div>
                <div className="ml-2 flex-shrink-0 flex">
                  <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Administrator
                  </p>
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="flex items-center text-sm text-gray-500">
                    Login: {admin.login}
                  </p>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <p>
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const AdminForm = ({ companyId, onAdminAdded }: { companyId: string, onAdminAdded: () => void }) => {
  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Add admin to localStorage
      addCompanyAdmin(companyId, {
        name,
        login,
        password
      });
      
      // Reset form
      setName('');
      setLogin('');
      setPassword('');
      
      // Notify parent component
      onAdminAdded();
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas dodawania administratora');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">Dodaj administratora</h3>
      
      {error && (
        <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imię
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Login
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hasło
            </label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          <User className="h-4 w-4 mr-2" />
          {loading ? 'Dodawanie...' : 'Dodaj administratora'}
        </button>
      </form>
    </div>
  );
};

const CompanyDetails = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const [company, setCompany] = useState<any>(null);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (companyId) {
      // Load company details
      const loadedCompany = getCompanyById(companyId);
      setCompany(loadedCompany);
      setLoading(false);
    }
  }, [companyId]);
  
  const handleAdminAdded = () => {
    // Trigger re-render of admin list
    setRefresh((prev) => prev + 1);
  };
  
  if (loading) {
    return <div className="text-center p-4">Ładowanie...</div>;
  }
  
  if (!company) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-medium text-red-600">Firma nie została znaleziona</h3>
        <Link to="/super-admin/companies" className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-900">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Wróć do listy firm
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6 flex items-center">
        <Link to="/super-admin/companies" className="mr-4 text-indigo-600 hover:text-indigo-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-2xl font-bold">Szczegóły firmy</h2>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{company.name}</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Informacje o firmie</p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Nazwa</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{company.name}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Adres</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{company.address}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Telefon</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{company.phone}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{company.email}</dd>
            </div>
          </dl>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Administratorzy firmy</h3>
        
        {companyId && (
          <>
            <AdminForm companyId={companyId} onAdminAdded={handleAdminAdded} />
            
            <h3 className="text-lg font-semibold mt-8 mb-4">Lista administratorów</h3>
            
            <AdminList key={refresh} companyId={companyId} />
          </>
        )}
      </div>
    </div>
  );
};

export default CompanyDetails;
