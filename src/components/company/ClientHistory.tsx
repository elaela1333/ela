import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  getClientById, 
  getClientAppointments, 
  getCompanyServices,
  updateAppointmentPaymentStatus
} from '../../utils/auth';
import { ArrowLeft, Calendar, Check, Clock, DollarSign, Phone, User } from 'lucide-react';

interface ClientHistoryProps {
  company: any;
  user: any;
}

const ClientHistory: React.FC<ClientHistoryProps> = ({ company, user }) => {
  const { clientId } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (clientId) {
      try {
        // Load client details
        const loadedClient = getClientById(clientId);
        setClient(loadedClient);
        
        // Load client appointments
        const loadedAppointments = getClientAppointments(clientId);
        setAppointments(loadedAppointments);
        
        // Load services for reference
        const loadedServices = getCompanyServices(company.id);
        const servicesMap: Record<string, any> = {};
        loadedServices.forEach(service => {
          servicesMap[service.id] = service;
        });
        setServices(servicesMap);
      } catch (err) {
        setError('Wystąpił błąd podczas ładowania historii klienta');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  }, [clientId, company]);
  
  const handlePaymentToggle = async (appointmentId: string, currentStatus: boolean) => {
    try {
      await updateAppointmentPaymentStatus(user.id, appointmentId, !currentStatus);
      
      // Reload appointments
      const updatedAppointments = getClientAppointments(clientId || '');
      setAppointments(updatedAppointments);
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas zmiany statusu płatności');
    }
  };
  
  const getTotalDuration = (serviceIds: string[]) => {
    return serviceIds.reduce((total, id) => {
      const service = services[id];
      return total + (service ? service.duration : 0);
    }, 0);
  };
  
  // Determine if a color is dark or light to choose appropriate text color
  const getTextColorForBackground = (bgColor: string) => {
    // Simple heuristic: if the color starts with # and is in hex format
    if (bgColor.startsWith('#')) {
      // Remove the # and convert to RGB
      const hex = bgColor.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      
      // Calculate perceived brightness (YIQ formula)
      const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      
      // Return white text for dark backgrounds, and black for light backgrounds
      return yiq >= 150 ? 'text-gray-900' : 'text-white';
    }
    
    // Default to white text for unknown formats
    return 'text-white';
  };
  
  if (loading) {
    return (
      <div className="text-center p-8 text-gray-300">
        Ładowanie...
      </div>
    );
  }
  
  if (!client) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <User className="mx-auto h-12 w-12 text-gray-500" />
        <h3 className="mt-2 text-lg font-medium text-gray-300">Klient nie został znaleziony</h3>
        <Link to="/company-admin/clients" className="mt-4 inline-flex items-center text-indigo-400 hover:text-indigo-300">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Wróć do listy klientów
        </Link>
      </div>
    );
  }
  
  // Sort appointments by date and time (newest first)
  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });
  
  // Separate future and past appointments
  const now = new Date();
  const futureAppointments = sortedAppointments.filter(app => {
    const appDate = new Date(`${app.date}T${app.time}`);
    return appDate >= now;
  });
  
  const pastAppointments = sortedAppointments.filter(app => {
    const appDate = new Date(`${app.date}T${app.time}`);
    return appDate < now;
  });
  
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Link to="/company-admin/clients" className="mr-4 text-indigo-400 hover:text-indigo-300">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-2xl font-bold text-gray-100">Historia klienta</h2>
      </div>
      
      {error && (
        <div className="p-3 mb-4 bg-red-900/50 border border-red-700 text-red-200 rounded">
          {error}
        </div>
      )}
      
      {/* Client details */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center">
          <User className="h-10 w-10 text-gray-400 mr-4" />
          <div>
            <h3 className="text-xl font-bold text-gray-100">{client.fullName}</h3>
            <a href={`tel:${client.phone}`} className="text-indigo-400 hover:text-indigo-300">
              <Phone className="h-4 w-4 inline mr-1" />
              {client.phone}
            </a>
          </div>
        </div>
      </div>
      
      {/* Future appointments */}
      {futureAppointments.length > 0 && (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-medium text-gray-100 mb-4">
            <Calendar className="h-5 w-5 inline mr-2" />
            Nadchodzące wizyty
          </h3>
          
          <div className="space-y-4">
            {futureAppointments.map(appointment => {
              const appointmentServices = appointment.serviceIds
                .map((id: string) => services[id])
                .filter(Boolean);
              const totalDuration = getTotalDuration(appointment.serviceIds);
              
              return (
                <div 
                  key={appointment.id}
                  className={`rounded-lg shadow ${
                    appointment.paid 
                      ? 'bg-gray-750 border-l-4 border-green-500' 
                      : 'bg-gray-750 border-l-4 border-red-500'
                  }`}
                >
                  <div className="p-4">
                    {/* Date and payment status */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-lg font-medium text-gray-100">
                        {new Date(appointment.date).toLocaleDateString('pl-PL')} o {appointment.time}
                      </div>
                      
                      <button
                        type="button"
                        className={`p-1.5 rounded-full ${
                          appointment.paid
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                        onClick={() => handlePaymentToggle(appointment.id, appointment.paid)}
                      >
                        <DollarSign className="h-5 w-5" />
                      </button>
                    </div>
                    
                    {/* Notes section */}
                    <div className="mb-3 text-sm text-gray-400">
                      {appointment.notes ? (
                        <>Notatki: {appointment.notes}</>
                      ) : (
                        <span className="text-gray-500">Brak notatek</span>
                      )}
                    </div>
                    
                    {/* Duration and services in one row */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Duration Badge */}
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                        <Clock className="h-3 w-3 mr-1" />
                        {totalDuration} min
                      </div>
                      
                      {/* Service Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {appointmentServices.map(service => (
                          <span
                            key={service.id}
                            className={`px-2 py-1 rounded-md text-xs font-medium ${getTextColorForBackground(service.color)}`}
                            style={{ backgroundColor: service.color }}
                          >
                            {service.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Past appointments */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-medium text-gray-100 mb-4">
          <Calendar className="h-5 w-5 inline mr-2" />
          Historia wizyt
        </h3>
        
        {pastAppointments.length === 0 ? (
          <div className="text-center p-4 text-gray-400">
            Brak historii wizyt
          </div>
        ) : (
          <div className="space-y-4">
            {pastAppointments.map(appointment => {
              const appointmentServices = appointment.serviceIds
                .map((id: string) => services[id])
                .filter(Boolean);
              const totalDuration = getTotalDuration(appointment.serviceIds);
              
              return (
                <div 
                  key={appointment.id}
                  className={`rounded-lg shadow ${
                    appointment.paid 
                      ? 'bg-gray-750 border-l-4 border-green-500' 
                      : 'bg-gray-750 border-l-4 border-red-500'
                  }`}
                >
                  <div className="p-4">
                    {/* Date and payment status */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-lg font-medium text-gray-100">
                        {new Date(appointment.date).toLocaleDateString('pl-PL')} o {appointment.time}
                      </div>
                      
                      <div className={`px-2.5 py-1 rounded-md text-xs ${
                        appointment.paid 
                          ? 'bg-green-900/30 text-green-300' 
                          : 'bg-red-900/30 text-red-300'
                      }`}>
                        {appointment.paid 
                          ? <><Check className="h-3 w-3 inline mr-1" /> Opłacona</> 
                          : <><DollarSign className="h-3 w-3 inline mr-1" /> Nieopłacona</>}
                      </div>
                    </div>
                    
                    {/* Notes section */}
                    <div className="mb-3 text-sm text-gray-400">
                      {appointment.notes ? (
                        <>Notatki: {appointment.notes}</>
                      ) : (
                        <span className="text-gray-500">Brak notatek</span>
                      )}
                    </div>
                    
                    {/* Duration and services in one row */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Duration Badge */}
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                        <Clock className="h-3 w-3 mr-1" />
                        {totalDuration} min
                      </div>
                      
                      {/* Service Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {appointmentServices.map(service => (
                          <span
                            key={service.id}
                            className={`px-2 py-1 rounded-md text-xs font-medium ${getTextColorForBackground(service.color)}`}
                            style={{ backgroundColor: service.color }}
                          >
                            {service.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientHistory;
