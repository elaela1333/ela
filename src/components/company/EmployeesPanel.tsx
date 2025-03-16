import { useState, useEffect } from 'react';
import { addEmployee, getCompanyEmployees, updateEmployee } from '../../utils/auth';
import { Banknote, Pencil, Key, User, UserPlus } from 'lucide-react';

interface EmployeesPanelProps {
  company: any;
  user: any;
}

const EmployeesPanel: React.FC<EmployeesPanelProps> = ({ company, user }) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  
  // Load employees
  useEffect(() => {
    if (company?.id) {
      const loadedEmployees = getCompanyEmployees(company.id);
      setEmployees(loadedEmployees);
    }
  }, [company]);
  
  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setHourlyRate('');
    setLogin('');
    setPassword('');
    setEditingEmployee(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (editingEmployee) {
        // Update existing employee
        const updates: any = {
          firstName,
          lastName,
          hourlyRate: parseFloat(hourlyRate)
        };
        
        // Only update login and password if they are provided
        if (login) updates.login = login;
        if (password) updates.password = password;
        
        await updateEmployee(user.id, editingEmployee.id, updates);
        setEditingEmployee(null);
      } else {
        // Add new employee
        await addEmployee(company.id, user.id, {
          firstName,
          lastName,
          hourlyRate: parseFloat(hourlyRate),
          login,
          password
        });
      }
      
      // Reset form and reload employees
      resetForm();
      const updatedEmployees = getCompanyEmployees(company.id);
      setEmployees(updatedEmployees);
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas zapisywania pracownika');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (employee: any) => {
    setEditingEmployee(employee);
    setFirstName(employee.firstName);
    setLastName(employee.lastName);
    setHourlyRate(employee.hourlyRate.toString());
    setLogin(employee.login);
    setPassword(''); // Don't populate password for security
  };
  
  const handleCancel = () => {
    resetForm();
  };
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-100">Pracownicy</h2>
      
      {/* Form */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-100 mb-4">
          {editingEmployee ? 'Edytuj pracownika' : 'Dodaj nowego pracownika'}
        </h3>
        
        {error && (
          <div className="p-3 mb-4 bg-red-900/50 border border-red-700 text-red-200 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Imię
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  required
                  className="w-full pl-10 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nazwisko
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Stawka godzinowa
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Banknote className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-10 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Login
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  required={!editingEmployee}
                  className="w-full pl-10 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder={editingEmployee ? "Pozostaw puste aby nie zmieniać" : ""}
                />
              </div>
              {editingEmployee && (
                <p className="text-xs text-gray-400 mt-1">
                  Pozostaw puste aby zachować obecny login
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Hasło
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="password"
                  required={!editingEmployee}
                  className="w-full pl-10 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingEmployee ? "Pozostaw puste aby nie zmieniać" : ""}
                />
              </div>
              {editingEmployee && (
                <p className="text-xs text-gray-400 mt-1">
                  Pozostaw puste aby zachować obecne hasło
                </p>
              )}
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-500"
            >
              {loading ? (
                'Zapisywanie...'
              ) : editingEmployee ? (
                <>
                  <Pencil className="h-4 w-4 mr-2" />
                  Zapisz zmiany
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Dodaj pracownika
                </>
              )}
            </button>
            
            {editingEmployee && (
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Anuluj
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Employee list */}
      <div>
        <h3 className="text-xl font-semibold text-gray-100 mb-4">Lista pracowników</h3>
        
        {employees.length === 0 ? (
          <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <User className="mx-auto h-12 w-12 text-gray-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-300">Brak pracowników</h3>
            <p className="mt-1 text-gray-400">
              Dodaj pierwszego pracownika używając formularza powyżej.
            </p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Pracownik
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Login
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Stawka
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-100">
                        {employee.firstName} {employee.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">{employee.login}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-100">{employee.hourlyRate.toFixed(2)} zł/h</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="text-indigo-400 hover:text-indigo-300"
                      >
                        <Pencil className="h-4 w-4 inline" /> Edytuj
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeesPanel;
