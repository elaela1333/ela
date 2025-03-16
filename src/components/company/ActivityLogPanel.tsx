import { useState, useEffect } from 'react';
import { getActivityLogs } from '../../utils/auth';
import { Clock, FileText, Search, User } from 'lucide-react';

interface ActivityLogPanelProps {
  company: any;
  user: any;
}

const ActivityLogPanel: React.FC<ActivityLogPanelProps> = ({ company, user }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<Record<string, any>>({});
  
  useEffect(() => {
    if (company?.id) {
      try {
        // Load activity logs for this company
        const loadedLogs = getActivityLogs(company.id);
        setLogs(loadedLogs);
        
        // Build user lookup table
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const usersMap: Record<string, any> = {};
        storedUsers.forEach((user: any) => {
          usersMap[user.id] = user;
        });
        setUsers(usersMap);
      } catch (err) {
        console.error('Error loading activity logs:', err);
      } finally {
        setLoading(false);
      }
    }
  }, [company]);
  
  const getActionLabel = (action: string): string => {
    switch (action) {
      case 'create':
        return 'Utworzenie';
      case 'update':
        return 'Aktualizacja';
      case 'delete':
        return 'Usunięcie';
      case 'update_payment':
        return 'Zmiana statusu płatności';
      case 'update_notes':
        return 'Aktualizacja notatek';
      case 'page_view':
        return 'Wyświetlenie strony';
      default:
        return action;
    }
  };
  
  const getEntityLabel = (entityType: string): string => {
    switch (entityType) {
      case 'employee':
        return 'pracownika';
      case 'service':
        return 'usługi';
      case 'client':
        return 'klienta';
      case 'appointment':
        return 'wizyty';
      case 'page':
        return 'strony';
      default:
        return entityType;
    }
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  const getUserName = (userId: string): string => {
    const user = users[userId];
    return user ? (user.name || user.login) : 'Nieznany użytkownik';
  };
  
  const getActionDescription = (log: any): string => {
    const { action, entityType, details } = log;
    
    if (action === 'create' && entityType === 'employee') {
      return `Dodano pracownika: ${details.employee_name}`;
    }
    if (action === 'update' && entityType === 'employee') {
      return `Zaktualizowano pracownika: ${details.employee_name}`;
    }
    if (action === 'create' && entityType === 'service') {
      return `Dodano usługę: ${details.service_name}`;
    }
    if (action === 'update' && entityType === 'service') {
      return `Zaktualizowano usługę: ${details.service_name}`;
    }
    if (action === 'delete' && entityType === 'service') {
      return `Usunięto usługę: ${details.service_name}`;
    }
    if (action === 'create' && entityType === 'client') {
      return `Dodano klienta: ${details.client_name}`;
    }
    if (action === 'update' && entityType === 'client') {
      return `Zaktualizowano klienta: ${details.client_name}`;
    }
    if (action === 'delete' && entityType === 'client') {
      return `Usunięto klienta: ${details.client_name}`;
    }
    if (action === 'create' && entityType === 'appointment') {
      return `Dodano wizytę dla: ${details.client_name} (${details.date}, ${details.time})`;
    }
    if (action === 'update' && entityType === 'appointment') {
      return `Zaktualizowano wizytę dla: ${details.client_name} (${details.date}, ${details.time})`;
    }
    if (action === 'delete' && entityType === 'appointment') {
      return `Usunięto wizytę dla: ${details.client_name} (${details.date}, ${details.time})`;
    }
    if (action === 'update_payment' && entityType === 'appointment') {
      return `${details.paid ? 'Oznaczono jako opłacone' : 'Oznaczono jako nieopłacone'} wizytę dla: ${details.client_name} (${details.date}, ${details.time})`;
    }
    if (action === 'update_notes' && entityType === 'appointment') {
      return `Zaktualizowano notatki dla wizyty`;
    }
    if (action === 'page_view' && entityType === 'page') {
      return `Wyświetlono stronę: ${details.page}`;
    }
    
    return `${getActionLabel(action)} ${getEntityLabel(entityType)}`;
  };
  
  // Filter logs based on search term
  const filteredLogs = logs.filter(log => {
    const searchString = searchTerm.toLowerCase();
    const userName = getUserName(log.userId).toLowerCase();
    const description = getActionDescription(log).toLowerCase();
    
    return userName.includes(searchString) || description.includes(searchString);
  });
  
  // Sort logs by date (newest first)
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  if (loading) {
    return (
      <div className="text-center p-8 text-gray-300">
        Ładowanie...
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-100">Dziennik aktywności</h2>
      
      {/* Search input */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Szukaj w dzienniku aktywności..."
            className="block w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Activity logs list */}
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {sortedLogs.length === 0 ? (
          <div className="text-center p-8 text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            {searchTerm ? 'Brak pasujących wyników' : 'Brak aktywności do wyświetlenia'}
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {sortedLogs.map(log => (
              <div key={log.id} className="p-4 hover:bg-gray-750">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-100">
                      {getActionDescription(log)}
                    </div>
                    <div className="mt-1 text-sm text-gray-400 flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {getUserName(log.userId)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(log.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogPanel;
