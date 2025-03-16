import { v4 as uuidv4 } from 'uuid';

// Initialize default super admin if not exists
export const initializeUsers = () => {
  // Get existing users or initialize empty array
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  // Check if superadmin already exists
  const superAdminExists = users.some((user: any) => user.login === 'superadmin');
  
  if (!superAdminExists) {
    // Add default super admin user
    users.push({
      id: uuidv4(),
      login: 'superadmin',
      password: 'superadminjogi123',
      name: 'Super Admin',
      role: 'superadmin'
    });
    
    // Save updated users array
    localStorage.setItem('users', JSON.stringify(users));
  }
};

// Add a new company
export const addCompany = (companyData: {
  name: string;
  address: string;
  phone: string;
  email: string;
}) => {
  // Get existing companies or initialize empty array
  const companies = JSON.parse(localStorage.getItem('companies') || '[]');
  
  // Create new company with unique ID
  const newCompany = {
    id: uuidv4(),
    ...companyData,
    createdAt: new Date().toISOString(),
  };
  
  // Add new company to array
  companies.push(newCompany);
  
  // Save updated companies array
  localStorage.setItem('companies', JSON.stringify(companies));
  
  return newCompany;
};

// Get all companies
export const getCompanies = () => {
  return JSON.parse(localStorage.getItem('companies') || '[]');
};

// Get company by ID
export const getCompanyById = (id: string) => {
  const companies = JSON.parse(localStorage.getItem('companies') || '[]');
  return companies.find((company: any) => company.id === id) || null;
};

// Add admin user for a company
export const addCompanyAdmin = (companyId: string, adminData: {
  name: string;
  login: string;
  password: string;
}) => {
  // Get existing users
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  // Check if login already exists
  const loginExists = users.some((user: any) => user.login === adminData.login);
  
  if (loginExists) {
    throw new Error('Login already exists');
  }
  
  // Create new admin user
  const newAdmin = {
    id: uuidv4(),
    ...adminData,
    role: 'admin',
    companyId,
    createdAt: new Date().toISOString(),
  };
  
  // Add new admin to users array
  users.push(newAdmin);
  
  // Save updated users array
  localStorage.setItem('users', JSON.stringify(users));
  
  // Return admin without password
  const { password, ...adminWithoutPassword } = newAdmin;
  return adminWithoutPassword;
};

// Get admins for a company
export const getCompanyAdmins = (companyId: string) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  return users
    .filter((user: any) => user.role === 'admin' && user.companyId === companyId)
    .map(({ password, ...user }: any) => user); // Remove passwords from returned data
};

// Employee management
export const addEmployee = (companyId: string, userId: string, employeeData: {
  firstName: string;
  lastName: string;
  hourlyRate: number;
  login: string;
  password: string;
}) => {
  // Get existing employees
  const employees = JSON.parse(localStorage.getItem('employees') || '[]');
  
  // Check if login already exists
  const loginExists = employees.some((emp: any) => emp.login === employeeData.login);
  
  if (loginExists) {
    throw new Error('Login already exists');
  }
  
  // Create new employee
  const newEmployee = {
    id: uuidv4(),
    ...employeeData,
    companyId,
    createdAt: new Date().toISOString(),
    createdBy: userId
  };
  
  // Add new employee to array
  employees.push(newEmployee);
  
  // Save updated employees array
  localStorage.setItem('employees', JSON.stringify(employees));
  
  // Log the activity
  logActivity(userId, 'create', 'employee', newEmployee.id, {
    employee_name: `${employeeData.firstName} ${employeeData.lastName}`
  });
  
  // Return employee without password
  const { password, ...employeeWithoutPassword } = newEmployee;
  return employeeWithoutPassword;
};

export const updateEmployee = (userId: string, employeeId: string, updates: {
  firstName?: string;
  lastName?: string;
  hourlyRate?: number;
  login?: string;
  password?: string;
}) => {
  // Get existing employees
  const employees = JSON.parse(localStorage.getItem('employees') || '[]');
  
  // Find the employee
  const index = employees.findIndex((emp: any) => emp.id === employeeId);
  
  if (index === -1) {
    throw new Error('Employee not found');
  }
  
  // Check if updating login and if it already exists
  if (updates.login && updates.login !== employees[index].login) {
    const loginExists = employees.some((emp: any) => 
      emp.id !== employeeId && emp.login === updates.login
    );
    
    if (loginExists) {
      throw new Error('Login already exists');
    }
  }
  
  // Update employee
  const updatedEmployee = {
    ...employees[index],
    ...updates,
    updatedAt: new Date().toISOString(),
    updatedBy: userId
  };
  
  employees[index] = updatedEmployee;
  
  // Save updated employees array
  localStorage.setItem('employees', JSON.stringify(employees));
  
  // Log the activity
  logActivity(userId, 'update', 'employee', employeeId, {
    employee_name: `${updatedEmployee.firstName} ${updatedEmployee.lastName}`
  });
  
  // Return employee without password
  const { password, ...employeeWithoutPassword } = updatedEmployee;
  return employeeWithoutPassword;
};

export const getCompanyEmployees = (companyId: string) => {
  const employees = JSON.parse(localStorage.getItem('employees') || '[]');
  return employees
    .filter((emp: any) => emp.companyId === companyId)
    .map(({ password, ...emp }: any) => emp); // Remove passwords
};

// Service management
export const addService = (companyId: string, userId: string, serviceData: {
  name: string;
  duration: number;
  type: string;
  color: string;
}) => {
  // Get existing services
  const services = JSON.parse(localStorage.getItem('services') || '[]');
  
  // Create new service
  const newService = {
    id: uuidv4(),
    ...serviceData,
    companyId,
    createdAt: new Date().toISOString(),
    createdBy: userId
  };
  
  // Add new service to array
  services.push(newService);
  
  // Save updated services array
  localStorage.setItem('services', JSON.stringify(services));
  
  // Log the activity
  logActivity(userId, 'create', 'service', newService.id, {
    service_name: serviceData.name
  });
  
  return newService;
};

export const updateService = (userId: string, serviceId: string, updates: {
  name?: string;
  duration?: number;
  type?: string;
  color?: string;
}) => {
  // Get existing services
  const services = JSON.parse(localStorage.getItem('services') || '[]');
  
  // Find the service
  const index = services.findIndex((srv: any) => srv.id === serviceId);
  
  if (index === -1) {
    throw new Error('Service not found');
  }
  
  // Update service
  const updatedService = {
    ...services[index],
    ...updates,
    updatedAt: new Date().toISOString(),
    updatedBy: userId
  };
  
  services[index] = updatedService;
  
  // Save updated services array
  localStorage.setItem('services', JSON.stringify(services));
  
  // Log the activity
  logActivity(userId, 'update', 'service', serviceId, {
    service_name: updatedService.name
  });
  
  return updatedService;
};

export const deleteService = (userId: string, serviceId: string) => {
  // Get existing services
  const services = JSON.parse(localStorage.getItem('services') || '[]');
  
  // Find the service for logging
  const service = services.find((srv: any) => srv.id === serviceId);
  
  if (!service) {
    throw new Error('Service not found');
  }
  
  // Filter out the service
  const updatedServices = services.filter((srv: any) => srv.id !== serviceId);
  
  // Save updated services array
  localStorage.setItem('services', JSON.stringify(updatedServices));
  
  // Log the activity
  logActivity(userId, 'delete', 'service', serviceId, {
    service_name: service.name
  });
  
  return serviceId;
};

export const getCompanyServices = (companyId: string) => {
  const services = JSON.parse(localStorage.getItem('services') || '[]');
  return services.filter((srv: any) => srv.companyId === companyId);
};

// Client management
export const addClient = (companyId: string, userId: string, clientData: {
  fullName: string;
  phone: string;
}) => {
  // Get existing clients
  const clients = JSON.parse(localStorage.getItem('clients') || '[]');
  
  // Create new client
  const newClient = {
    id: uuidv4(),
    ...clientData,
    companyId,
    createdAt: new Date().toISOString(),
    createdBy: userId
  };
  
  // Add new client to array
  clients.push(newClient);
  
  // Save updated clients array
  localStorage.setItem('clients', JSON.stringify(clients));
  
  // Log the activity
  logActivity(userId, 'create', 'client', newClient.id, {
    client_name: clientData.fullName
  });
  
  return newClient;
};

export const updateClient = (userId: string, clientId: string, updates: {
  fullName?: string;
  phone?: string;
}) => {
  // Get existing clients
  const clients = JSON.parse(localStorage.getItem('clients') || '[]');
  
  // Find the client
  const index = clients.findIndex((cli: any) => cli.id === clientId);
  
  if (index === -1) {
    throw new Error('Client not found');
  }
  
  // Update client
  const updatedClient = {
    ...clients[index],
    ...updates,
    updatedAt: new Date().toISOString(),
    updatedBy: userId
  };
  
  clients[index] = updatedClient;
  
  // Save updated clients array
  localStorage.setItem('clients', JSON.stringify(clients));
  
  // Log the activity
  logActivity(userId, 'update', 'client', clientId, {
    client_name: updatedClient.fullName
  });
  
  return updatedClient;
};

export const deleteClient = (userId: string, clientId: string) => {
  // Get existing clients
  const clients = JSON.parse(localStorage.getItem('clients') || '[]');
  
  // Find the client for logging
  const client = clients.find((cli: any) => cli.id === clientId);
  
  if (!client) {
    throw new Error('Client not found');
  }
  
  // Check if client has appointments
  const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  const hasAppointments = appointments.some((app: any) => app.clientId === clientId);
  
  if (hasAppointments) {
    throw new Error('Cannot delete client with appointments');
  }
  
  // Filter out the client
  const updatedClients = clients.filter((cli: any) => cli.id !== clientId);
  
  // Save updated clients array
  localStorage.setItem('clients', JSON.stringify(updatedClients));
  
  // Log the activity
  logActivity(userId, 'delete', 'client', clientId, {
    client_name: client.fullName
  });
  
  return clientId;
};

export const getCompanyClients = (companyId: string) => {
  const clients = JSON.parse(localStorage.getItem('clients') || '[]');
  return clients.filter((cli: any) => cli.companyId === companyId);
};

export const getClientById = (clientId: string) => {
  const clients = JSON.parse(localStorage.getItem('clients') || '[]');
  return clients.find((cli: any) => cli.id === clientId);
};

// Appointment management
export const addAppointment = (companyId: string, userId: string, appointmentData: {
  date: string;
  time: string;
  clientId: string;
  serviceIds: string[];
  notes?: string;
}) => {
  // Get existing appointments
  const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  
  // Create new appointment
  const appointmentId = uuidv4();
  const newAppointment = {
    id: appointmentId,
    date: appointmentData.date,
    time: appointmentData.time,
    clientId: appointmentData.clientId,
    companyId,
    notes: appointmentData.notes || '',
    paid: false,
    createdAt: new Date().toISOString(),
    createdBy: userId
  };
  
  // Add new appointment to array
  appointments.push(newAppointment);
  
  // Save updated appointments array
  localStorage.setItem('appointments', JSON.stringify(appointments));
  
  // Add appointment services
  addAppointmentServices(appointmentId, appointmentData.serviceIds);
  
  // Get client name for logging
  const client = getClientById(appointmentData.clientId);
  
  // Log the activity
  logActivity(userId, 'create', 'appointment', appointmentId, {
    client_name: client?.fullName || 'Unknown client',
    date: appointmentData.date,
    time: appointmentData.time
  });
  
  return {
    ...newAppointment,
    serviceIds: appointmentData.serviceIds
  };
};

export const updateAppointment = (userId: string, appointmentId: string, updates: {
  date?: string;
  time?: string;
  clientId?: string;
  serviceIds?: string[];
  notes?: string;
}) => {
  // Get existing appointments
  const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  
  // Find the appointment
  const index = appointments.findIndex((app: any) => app.id === appointmentId);
  
  if (index === -1) {
    throw new Error('Appointment not found');
  }
  
  // Update appointment
  const updatedAppointment = {
    ...appointments[index],
    ...updates,
    updatedAt: new Date().toISOString(),
    updatedBy: userId
  };
  
  // Remove serviceIds from the appointment object
  const { serviceIds, ...appointmentWithoutServices } = updatedAppointment;
  appointments[index] = appointmentWithoutServices;
  
  // Save updated appointments array
  localStorage.setItem('appointments', JSON.stringify(appointments));
  
  // Update appointment services if provided
  if (updates.serviceIds) {
    // First delete all existing services
    deleteAppointmentServices(appointmentId);
    // Then add new services
    addAppointmentServices(appointmentId, updates.serviceIds);
  }
  
  // Get client name for logging
  const client = getClientById(updatedAppointment.clientId);
  
  // Log the activity
  logActivity(userId, 'update', 'appointment', appointmentId, {
    client_name: client?.fullName || 'Unknown client',
    date: updatedAppointment.date,
    time: updatedAppointment.time
  });
  
  return updatedAppointment;
};

export const updateAppointmentPaymentStatus = (userId: string, appointmentId: string, paid: boolean) => {
  // Get existing appointments
  const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  
  // Find the appointment
  const index = appointments.findIndex((app: any) => app.id === appointmentId);
  
  if (index === -1) {
    throw new Error('Appointment not found');
  }
  
  // Update payment status
  appointments[index].paid = paid;
  appointments[index].updatedAt = new Date().toISOString();
  appointments[index].updatedBy = userId;
  
  // Save updated appointments array
  localStorage.setItem('appointments', JSON.stringify(appointments));
  
  // Get client name for logging
  const client = getClientById(appointments[index].clientId);
  
  // Log the activity
  logActivity(userId, 'update_payment', 'appointment', appointmentId, {
    client_name: client?.fullName || 'Unknown client',
    date: appointments[index].date,
    time: appointments[index].time,
    paid: paid
  });
  
  return appointments[index];
};

export const updateAppointmentNotes = (userId: string, appointmentId: string, notes: string) => {
  // Get existing appointments
  const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  
  // Find the appointment
  const index = appointments.findIndex((app: any) => app.id === appointmentId);
  
  if (index === -1) {
    throw new Error('Appointment not found');
  }
  
  // Update notes
  appointments[index].notes = notes;
  appointments[index].updatedAt = new Date().toISOString();
  appointments[index].updatedBy = userId;
  
  // Save updated appointments array
  localStorage.setItem('appointments', JSON.stringify(appointments));
  
  // Log the activity
  logActivity(userId, 'update_notes', 'appointment', appointmentId, {
    notes_updated: true
  });
  
  return appointments[index];
};

export const deleteAppointment = (userId: string, appointmentId: string) => {
  // Get existing appointments
  const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  
  // Find the appointment for logging
  const appointment = appointments.find((app: any) => app.id === appointmentId);
  
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  
  // Get client name for logging
  const client = getClientById(appointment.clientId);
  
  // Filter out the appointment
  const updatedAppointments = appointments.filter((app: any) => app.id !== appointmentId);
  
  // Save updated appointments array
  localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
  
  // Delete appointment services
  deleteAppointmentServices(appointmentId);
  
  // Log the activity
  logActivity(userId, 'delete', 'appointment', appointmentId, {
    client_name: client?.fullName || 'Unknown client',
    date: appointment.date,
    time: appointment.time
  });
  
  return appointmentId;
};

export const getCompanyAppointments = (companyId: string) => {
  const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  const filteredAppointments = appointments.filter((app: any) => app.companyId === companyId);
  
  // Get appointment services
  return filteredAppointments.map((app: any) => {
    return {
      ...app,
      serviceIds: getAppointmentServiceIds(app.id)
    };
  });
};

export const getClientAppointments = (clientId: string) => {
  const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  const filteredAppointments = appointments.filter((app: any) => app.clientId === clientId);
  
  // Get appointment services
  return filteredAppointments.map((app: any) => {
    return {
      ...app,
      serviceIds: getAppointmentServiceIds(app.id)
    };
  });
};

export const getUnpaidAppointments = (companyId: string) => {
  const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  const filteredAppointments = appointments.filter((app: any) => 
    app.companyId === companyId && !app.paid
  );
  
  // Get appointment services
  return filteredAppointments.map((app: any) => {
    return {
      ...app,
      serviceIds: getAppointmentServiceIds(app.id)
    };
  });
};

// Appointment services helpers
const addAppointmentServices = (appointmentId: string, serviceIds: string[]) => {
  // Get existing appointment services
  const appointmentServices = JSON.parse(localStorage.getItem('appointmentServices') || '[]');
  
  // Add new appointment services
  const newAppointmentServices = serviceIds.map(serviceId => ({
    id: uuidv4(),
    appointmentId,
    serviceId,
    createdAt: new Date().toISOString()
  }));
  
  // Combine with existing appointment services
  const updatedAppointmentServices = [...appointmentServices, ...newAppointmentServices];
  
  // Save updated appointment services array
  localStorage.setItem('appointmentServices', JSON.stringify(updatedAppointmentServices));
};

const deleteAppointmentServices = (appointmentId: string) => {
  // Get existing appointment services
  const appointmentServices = JSON.parse(localStorage.getItem('appointmentServices') || '[]');
  
  // Filter out services for this appointment
  const updatedAppointmentServices = appointmentServices.filter(
    (appService: any) => appService.appointmentId !== appointmentId
  );
  
  // Save updated appointment services array
  localStorage.setItem('appointmentServices', JSON.stringify(updatedAppointmentServices));
};

const getAppointmentServiceIds = (appointmentId: string) => {
  const appointmentServices = JSON.parse(localStorage.getItem('appointmentServices') || '[]');
  return appointmentServices
    .filter((appService: any) => appService.appointmentId === appointmentId)
    .map((appService: any) => appService.serviceId);
};

// Activity logging
export const logActivity = (userId: string, action: string, entityType: string, entityId: string, details: any) => {
  // Get existing logs
  const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
  
  // Create new log entry
  const newLog = {
    id: uuidv4(),
    userId,
    action,
    entityType,
    entityId,
    details,
    createdAt: new Date().toISOString()
  };
  
  // Add new log to array
  logs.push(newLog);
  
  // Save updated logs array
  localStorage.setItem('activityLogs', JSON.stringify(logs));
  
  return newLog;
};

export const getActivityLogs = (companyId: string) => {
  const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  // Get all user IDs belonging to this company
  const companyUserIds = users
    .filter((user: any) => user.companyId === companyId)
    .map((user: any) => user.id);
  
  // Filter logs by company users
  return logs.filter((log: any) => companyUserIds.includes(log.userId));
};
