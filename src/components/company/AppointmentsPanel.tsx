import { useState, useEffect } from 'react';
import { 
  addAppointment, 
  getCompanyAppointments, 
  getCompanyClients, 
  getCompanyServices,
  updateAppointmentPaymentStatus,
  updateAppointmentNotes
} from '../../utils/auth';
import { Calendar, Check, Clock, DollarSign, FileText, Phone, Plus, Search, X } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  duration: number;
  color: string;
}

interface Client {
  id: string;
  fullName: string;
  phone: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  clientId: string;
  notes: string;
  paid: boolean;
  serviceIds: string[];
}

interface AppointmentsPanelProps {
  company: any;
  user: any;
}

const AppointmentsPanel: React.FC<AppointmentsPanelProps> = ({ company, user }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showClientList, setShowClientList] = useState(false);
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(null);
  const [appointmentNotes, setAppointmentNotes] = useState<{[key: string]: string}>({});
  
  // Load data
  useEffect(() => {
    if (company?.id) {
      const loadedAppointments = getCompanyAppointments(company.id);
      const loadedClients = getCompanyClients(company.id);
      const loadedServices = getCompanyServices(company.id);
      
      setAppointments(loadedAppointments);
      setClients(loadedClients);
      setServices(loadedServices);
      
      // Initialize appointment notes
      const notesObj: {[key: string]: string} = {};
      loadedAppointments.forEach(app => {
        notesObj[app.id] = app.notes || '';
      });
      setAppointmentNotes(notesObj);
    }
  }, [company]);
  
  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setTime('');
    setClientSearch('');
    setSelectedClient(null);
    setSelectedServices([]);
    setNotes('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!selectedClient) {
      setError('Wybierz klienta');
      setLoading(false);
      return;
    }
    
    if (selectedServices.length === 0) {
      setError('Wybierz co najmniej jedną usługę');
      setLoading(false);
      return;
    }
    
    try {
      await addAppointment(company.id, user.id, {
        date,
        time,
        clientId: selectedClient.id,
        serviceIds: selectedServices,
        notes
      });
      
      // Reset form and reload appointments
      resetForm();
      const updatedAppointments = getCompanyAppointments(company.id);
      setAppointments(updatedAppointments);
      
      // Initialize appointment notes for new appointments
      const notesObj = {...appointmentNotes};
      updatedAppointments.forEach(app => {
        if (!notesObj[app.id]) notesObj[app.id] = app.notes || '';
      });
      setAppointmentNotes(notesObj);
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas zapisywania wizyty');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePaymentToggle = async (appointmentId: string, currentStatus: boolean) => {
    try {
      await updateAppointmentPaymentStatus(user.id, appointmentId, !currentStatus);
      
      // Reload appointments
      const updatedAppointments = getCompanyAppointments(company.id);
      setAppointments(updatedAppointments);
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas zmiany statusu płatności');
    }
  };
  
  const handleNotesChange = (appointmentId: string, value: string) => {
    setAppointmentNotes({
      ...appointmentNotes,
      [appointmentId]: value
    });
  };
  
  const saveNotes = async (appointmentId: string) => {
    try {
      await updateAppointmentNotes(user.id, appointmentId, appointmentNotes[appointmentId] || '');
      
      // Reload appointments
      const updatedAppointments = getCompanyAppointments(company.id);
      setAppointments(updatedAppointments);
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas zapisywania notatek');
    }
  };
  
  const filteredClients = clients.filter(client => 
    client.fullName.toLowerCase().includes(clientSearch.toLowerCase()) ||
    client.phone.includes(clientSearch)
  );
  
  const toggleServiceSelection = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };
  
  const getTotalDuration = (serviceIds: string[]) => {
    return serviceIds.reduce((total, id) => {
      const service = services.find(s => s.id === id);
      return total + (service ? service.duration : 0);
    }, 0);
  };
  
  const getClientById = (clientId: string) => {
    return clients.find(c => c.id === clientId);
  };
  
  const getServiceById = (serviceId: string) => {
    return services.find(s => s.id === serviceId);
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
  
  // Group appointments by date
  const groupedAppointments: {[key: string]: Appointment[]} = {};
  appointments.forEach(appointment => {
    if (!groupedAppointments[appointment.date]) {
      groupedAppointments[appointment.date] = [];
    }
    groupedAppointments[appointment.date].push(appointment);
  });
  
  // Sort dates
  const sortedDates = Object.keys(groupedAppointments).sort();
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-100">Wizyty</h2>
      
      {/* Form */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-100 mb-4">
          Dodaj nową wizytę
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
                Data
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="date"
                  required
                  className="w-full pl-10 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Godzina
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="time"
                  required
                  className="w-full pl-10 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>
            
            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Klient
              </label>
              {selectedClient ? (
                <div className="flex items-center space-x-2 p-2 bg-gray-700 border border-gray-600 rounded-md">
                  <span className="text-gray-100">{selectedClient.fullName}</span>
                  <span className="text-gray-400">{selectedClient.phone}</span>
                  <button
                    type="button"
                    className="ml-auto text-gray-400 hover:text-gray-200"
                    onClick={() => setSelectedClient(null)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
                    placeholder="Wyszukaj klienta..."
                    value={clientSearch}
                    onChange={(e) => {
                      setClientSearch(e.target.value);
                      setShowClientList(true);
                    }}
                    onFocus={() => setShowClientList(true)}
                  />
                  
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                    onClick={() => setShowClientList(!showClientList)}
                  >
                    {showClientList ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                  </button>
                  
                  {showClientList && (
                    <div className="absolute z-10 mt-1 w-full bg-gray-700 shadow-lg rounded-md max-h-60 overflow-auto">
                      <div className="sticky top-0 p-2 bg-gray-700 border-b border-gray-600">
                        <input
                          type="text"
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
                          placeholder="Filtruj klientów..."
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                        />
                      </div>
                      
                      {filteredClients.length === 0 ? (
                        <div className="p-4 text-center text-gray-400">
                          Brak pasujących klientów
                        </div>
                      ) : (
                        <ul>
                          {filteredClients.map(client => (
                            <li
                              key={client.id}
                              className="px-4 py-2 hover:bg-gray-600 cursor-pointer"
                              onClick={() => {
                                setSelectedClient(client);
                                setClientSearch('');
                                setShowClientList(false);
                              }}
                            >
                              <div className="font-medium text-gray-100">{client.fullName}</div>
                              <div className="text-sm text-gray-400">{client.phone}</div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Notatki
              </label>
              <textarea
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Wybierz usługi
            </label>
            <div className="flex flex-wrap gap-2">
              {services.map(service => (
                <button
                  key={service.id}
                  type="button"
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    selectedServices.includes(service.id)
                      ? 'text-white border-2 border-white'
                      : getTextColorForBackground(service.color)
                  }`}
                  style={{ 
                    backgroundColor: service.color,
                    borderColor: selectedServices.includes(service.id) ? 'white' : 'transparent'
                  }}
                  onClick={() => toggleServiceSelection(service.id)}
                >
                  {service.name} ({service.duration} min)
                </button>
              ))}
            </div>
            {selectedServices.length > 0 && (
              <div className="mt-2 text-sm text-gray-300">
                Łączny czas: {getTotalDuration(selectedServices)} min
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-500"
          >
            {loading ? (
              'Zapisywanie...'
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Dodaj wizytę
              </>
            )}
          </button>
        </form>
      </div>
      
      {/* Appointments list */}
      <div>
        <h3 className="text-xl font-semibold text-gray-100 mb-4">Lista wizyt</h3>
        
        {sortedDates.length === 0 ? (
          <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-300">Brak wizyt</h3>
            <p className="mt-1 text-gray-400">
              Dodaj pierwszą wizytę używając formularza powyżej.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(date => (
              <div key={date} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gray-700 px-4 py-3">
                  <h4 className="text-lg font-medium text-gray-100">
                    {new Date(date).toLocaleDateString('pl-PL', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h4>
                </div>
                
                <div className="p-4 grid grid-cols-1 gap-4">
                  {groupedAppointments[date]
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map(appointment => {
                      const client = getClientById(appointment.clientId);
                      const appointmentServices = appointment.serviceIds.map(id => getServiceById(id)).filter(Boolean) as Service[];
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
                          <div 
                            className="p-4 cursor-pointer"
                            onClick={() => setExpandedAppointment(
                              expandedAppointment === appointment.id ? null : appointment.id
                            )}
                          >
                            {/* Appointment Header with Time and Payment Status */}
                            <div className="flex justify-between items-start mb-2">
                              <div className="text-xl font-bold text-gray-100">
                                {appointment.time}
                              </div>
                              
                              <button
                                type="button"
                                className={`p-1.5 rounded-full ${
                                  appointment.paid
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePaymentToggle(appointment.id, appointment.paid);
                                }}
                              >
                                <DollarSign className="h-5 w-5" />
                              </button>
                            </div>
                            
                            {/* Client Info, Duration and Services in one row */}
                            <div className="flex flex-wrap items-center gap-3">
                              {/* Client name and phone */}
                              <div className="flex-shrink-0">
                                <div className="font-medium text-gray-100">
                                  {client?.fullName}
                                </div>
                                <a 
                                  href={`tel:${client?.phone}`} 
                                  className="text-sm text-indigo-400 hover:text-indigo-300"
                                  onClick={e => e.stopPropagation()}
                                >
                                  <Phone className="h-3 w-3 inline mr-1" />
                                  {client?.phone}
                                </a>
                              </div>
                              
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
                          
                          {expandedAppointment === appointment.id && (
                            <div className="px-4 pb-4 pt-2 border-t border-gray-700">
                              <div className="mb-2 flex items-center text-sm text-gray-300">
                                <FileText className="h-4 w-4 mr-1" />
                                Notatki
                              </div>
                              <textarea
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100 text-sm"
                                rows={3}
                                value={appointmentNotes[appointment.id] || ''}
                                onChange={(e) => handleNotesChange(appointment.id, e.target.value)}
                              />
                              <div className="mt-2 flex justify-end">
                                <button
                                  type="button"
                                  className="inline-flex items-center px-3 py-1.5 text-xs border border-transparent font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                  onClick={() => saveNotes(appointment.id)}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Zapisz notatki
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPanel;
