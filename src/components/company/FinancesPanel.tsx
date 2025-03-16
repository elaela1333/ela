import { useState, useEffect } from 'react';
import { 
  getUnpaidAppointments, 
  getCompanyClients, 
  getCompanyServices, 
  updateAppointmentPaymentStatus 
} from '../../utils/auth';
import { Check, Clock, DollarSign, Phone } from 'lucide-react';

interface FinancesPanelProps {
  company: any;
  user: any;
}

const FinancesPanel: React.FC<FinancesPanelProps> = ({ company, user }) => {
  const [unpaidAppointments, setUnpaidAppointments] = useState<any[]>([]);
  const [clients, setClients] = useState<Record<string, any>>({});
  const [services, setServices] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Load data
  useEffect(() => {
    if (company?.id) {
      try {
        const loadedAppointments = getUnpaidAppointments(company.id);
        const loadedClients = getCompanyClients(company.id);
        const loadedServices = getCompanyServices(company.id);
        
        // Create lookup objects for clients and services
        const clientsMap: Record<string, any> = {};
        loadedClients.forEach(client => {
          clientsMap[client.id] = client;
        });
        
        const servicesMap: Record<string, any> = {};
        loadedServices.forEach(service => {
          servicesMap[service.id] = service;
        });
        
        setUnpaidAppointments(loadedAppointments);
        setClients(clientsMap);
        setServices(servicesMap);
      } catch (err) {
        setError('Wystąpił błąd podczas ładowania danych');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  }, [company]);
  
  const handlePaymentComplete = async (appointmentId: string) => {
    try {
      await updateAppointmentPaymentStatus(user.id, appointmentId, true);
      
      // Update the local state by removing the now-paid appointment
      setUnpaidAppointments(unpaidAppointments.filter(app => app.id !== appointmentId));
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas aktualizacji płatności');
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
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-100">Finanse</h2>
      
      {error && (
        <div className="p-3 mb-4 bg-red-900/50 border border-red-700 text-red-200 rounded">
          {error}
        </div>
      )}
      
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-medium text-gray-100 mb-4">
          <DollarSign className="h-5 w-5 inline mr-1" />
          Nieopłacone wizyty
        </h3>
        
        {unpaidAppointments.length === 0 ? (
          <div className="text-center p-8 text-gray-300">
            <Check className="h-12 w-12 text-green-500 mx-auto mb-2" />
            Brak nieopłaconych wizyt
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unpaidAppointments.map(appointment => {
              const client = clients[appointment.clientId];
              const appointmentServices = appointment.serviceIds
                .map((id: string) => services[id])
                .filter(Boolean);
              const totalDuration = getTotalDuration(appointment.serviceIds);
              
              return (
                <div 
                  key={appointment.id}
                  className="bg-gray-750 rounded-lg shadow-md border-l-4 border-red-500 overflow-hidden"
                >
                  <div className="p-4">
                    {/* Date & Time and Payment button */}
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-sm text-gray-400">
                          {new Date(appointment.date).toLocaleDateString('pl-PL')}
                        </div>
                        <div className="text-lg font-bold text-gray-100">
                          {appointment.time}
                        </div>
                      </div>
                      <button
                        onClick={() => handlePaymentComplete(appointment.id)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md flex items-center"
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        Opłacone
                      </button>
                    </div>
                    
                    {/* Client info */}
                    {client && (
                      <div className="mb-3">
                        <div className="font-medium text-gray-100">
                          {client.fullName}
                        </div>
                        <a 
                          href={`tel:${client.phone}`} 
                          className="text-sm text-indigo-400 hover:text-indigo-300"
                        >
                          <Phone className="h-3 w-3 inline mr-1" />
                          {client.phone}
                        </a>
                      </div>
                    )}
                    
                    {/* Duration and services in one row */}
                    <div className="flex flex-wrap items-center gap-2">
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

export default FinancesPanel;
