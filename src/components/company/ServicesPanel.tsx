import { useState, useEffect } from 'react';
import { addService, getCompanyServices, updateService, deleteService } from '../../utils/auth';
import { Check, Clock, Pencil, Plus, Scissors, Trash2, X } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  duration: number;
  color: string;
  companyId: string;
}

interface ServicesPanelProps {
  company: any;
  user: any;
}

// Predefined colors collection
const predefinedColors = [
  "#4f46e5", // Indigo
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#84cc16", // Lime
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#d946ef", // Fuchsia
  "#ec4899", // Pink
  "#64748b", // Slate
  "#166534", // Green
  "#b91c1c", // Dark Red
  "#7e22ce", // Purple
  "#0891b2"  // Teal
];

const ServicesPanel: React.FC<ServicesPanelProps> = ({ company, user }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [color, setColor] = useState('#4f46e5');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  // Load services
  useEffect(() => {
    if (company?.id) {
      const loadedServices = getCompanyServices(company.id);
      setServices(loadedServices);
    }
  }, [company]);
  
  const resetForm = () => {
    setName('');
    setDuration('');
    setColor('#4f46e5');
    setEditingService(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (editingService) {
        // Update existing service
        await updateService(user.id, editingService.id, {
          name,
          duration: parseInt(duration),
          color
        });
        setEditingService(null);
      } else {
        // Add new service
        await addService(company.id, user.id, {
          name,
          duration: parseInt(duration),
          color,
          type: 'default' // Keep a default type for backward compatibility
        });
      }
      
      // Reset form and reload services
      resetForm();
      const updatedServices = getCompanyServices(company.id);
      setServices(updatedServices);
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas zapisywania usługi');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setDuration(service.duration.toString());
    setColor(service.color);
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć tę usługę?')) {
      try {
        await deleteService(user.id, id);
        // Reload services
        const updatedServices = getCompanyServices(company.id);
        setServices(updatedServices);
      } catch (err: any) {
        setError(err.message || 'Wystąpił błąd podczas usuwania usługi');
      }
    }
  };
  
  const handleCancel = () => {
    resetForm();
  };
  
  const handleColorSelect = (selectedColor: string) => {
    setColor(selectedColor);
  };
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-100">Usługi</h2>
      
      {/* Form */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-100 mb-4">
          {editingService ? 'Edytuj usługę' : 'Dodaj nową usługę'}
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
                Nazwa usługi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Scissors className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  required
                  className="w-full pl-10 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Czas trwania (minuty)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full pl-10 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Kolor
              </label>
              
              {/* Predefined colors */}
              <div className="flex flex-wrap gap-2 mb-4">
                {predefinedColors.map((predefColor) => (
                  <button
                    key={predefColor}
                    type="button"
                    className={`w-8 h-8 rounded-full transition-all ${
                      color === predefColor ? 'ring-2 ring-white' : 'ring-1 ring-gray-600 hover:ring-gray-400'
                    }`}
                    style={{ backgroundColor: predefColor }}
                    onClick={() => handleColorSelect(predefColor)}
                    aria-label={`Kolor ${predefColor}`}
                  >
                    {color === predefColor && (
                      <Check className="h-4 w-4 text-white mx-auto" />
                    )}
                  </button>
                ))}
              </div>
              
              {/* Custom color picker */}
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  className="h-10 w-10 rounded border border-gray-600 bg-transparent"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
                <div 
                  className="h-10 w-20 rounded border border-gray-600"
                  style={{ backgroundColor: color }}
                />
                <span className="text-gray-300 text-sm font-mono">
                  {color.toUpperCase()}
                </span>
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
              ) : editingService ? (
                <>
                  <Pencil className="h-4 w-4 mr-2" />
                  Zapisz zmiany
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj usługę
                </>
              )}
            </button>
            
            {editingService && (
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
      
      {/* Service list */}
      <div>
        <h3 className="text-xl font-semibold text-gray-100 mb-4">Lista usług</h3>
        
        {services.length === 0 ? (
          <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <Scissors className="mx-auto h-12 w-12 text-gray-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-300">Brak usług</h3>
            <p className="mt-1 text-gray-400">
              Dodaj pierwszą usługę używając formularza powyżej.
            </p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Usługa
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Czas trwania
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Kolor
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-100">
                        {service.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{service.duration} min</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="h-6 w-6 rounded-full border border-gray-600"
                          style={{ backgroundColor: service.color }}
                        />
                        <span className="ml-2 text-sm text-gray-400 font-mono">
                          {service.color.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(service)}
                        className="text-indigo-400 hover:text-indigo-300 mr-3"
                      >
                        <Pencil className="h-4 w-4 inline" /> Edytuj
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
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

export default ServicesPanel;
