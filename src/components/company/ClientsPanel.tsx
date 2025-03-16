import { useState, useEffect } from 'react';
import { addClient, getCompanyClients, updateClient, deleteClient } from '../../utils/auth';
import { Link } from 'react-router-dom';
import { History, Pencil, Phone, Trash2, User, UserPlus, X } from 'lucide-react';

interface Client {
  id: string;
  fullName: string;
  phone: string;
  companyId: string;
}

interface ClientsPanelProps {
  company: any;
  user: any;
}

const ClientsPanel: React.FC<ClientsPanelProps> = ({ company, user }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  // Load clients
  useEffect(() => {
    if (company?.id) {
      const loadedClients = getCompanyClients(company.id);
      setClients(loadedClients);
    }
  }, [company]);
  
  const resetForm = () => {
    setFullName('');
    setPhone('');
    setEditingClient(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (editingClient) {
        // Update existing client
        await updateClient(user.id, editingClient.id, {
          fullName,
          phone
        });
        setEditingClient(null);
      } else {
        // Add new client
        await addClient(company.id, user.id, {
          fullName,
          phone
        });
      }
      
      // Reset form and reload clients
      resetForm();
      const updatedClients = getCompanyClients(company.id);
      setClients(updatedClients);
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas zapisywania klienta');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFullName(client.fullName);
    setPhone(client.phone);
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć tego klienta?')) {
      try {
        await deleteClient(user.id, id);
        // Reload clients
        const updatedClients = getCompanyClients(company.id);
        setClients(updatedClients);
      } catch (err: any) {
        setError(err.message || 'Wystąpił błąd podczas usuwania klienta');
      }
    }
  };
  
  const handleCancel = () => {
    resetForm();
  };
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-100">Klienci</h2>
      
      {/* Form */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-100 mb-4">
          {editingClient ? 'Edytuj klienta' : 'Dodaj nowego klienta'}
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
                Imię i nazwisko
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  required
                  className="w-full pl-10 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Numer telefonu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="tel"
                  required
                  className="w-full pl-10 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
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
              ) : editingClient ? (
                <>
                  <Pencil className="h-4 w-4 mr-2" />
                  Zapisz zmiany
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Dodaj klienta
                </>
              )}
            </button>
            
            {editingClient && (
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <X className="h-4 w-4 mr-2" />
                Anuluj
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Client list */}
      <div>
        <h3 className="text-xl font-semibold text-gray-100 mb-4">Lista klientów</h3>
        
        {clients.length === 0 ? (
          <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <User className="mx-auto h-12 w-12 text-gray-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-300">Brak klientów</h3>
            <p className="mt-1 text-gray-400">
              Dodaj pierwszego klienta używając formularza powyżej.
            </p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Imię i nazwisko
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Telefon
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-100">
                        {client.fullName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a href={`tel:${client.phone}`} className="text-sm text-indigo-400 hover:text-indigo-300">
                        {client.phone}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/company-admin/clients/${client.id}/history`}
                        className="text-indigo-400 hover:text-indigo-300 mr-3"
                      >
                        <History className="h-4 w-4 inline" /> Historia
                      </Link>
                      <button
                        onClick={() => handleEdit(client)}
                        className="text-indigo-400 hover:text-indigo-300 mr-3"
                      >
                        <Pencil className="h-4 w-4 inline" /> Edytuj
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4 inline" /> Usuń
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

export default ClientsPanel;
