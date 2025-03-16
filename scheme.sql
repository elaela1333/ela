-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  login TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL,
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employees table
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  hourly_rate DECIMAL(10, 2) NOT NULL,
  login TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  duration INTEGER NOT NULL, -- duration in minutes
  type TEXT NOT NULL,
  color TEXT NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  time TIME NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  paid BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Appointment services (many-to-many)
CREATE TABLE appointment_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity logs
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- 'client', 'service', 'appointment', 'payment'
  entity_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default superadmin
INSERT INTO users (id, login, password, name, role) 
VALUES (
  uuid_generate_v4(), 
  'superadmin', 
  'superadminjogi123', 
  'Super Admin', 
  'superadmin'
) ON CONFLICT (login) DO NOTHING;

-- Create indexes
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_services_company ON services(company_id);
CREATE INDEX idx_clients_company ON clients(company_id);
CREATE INDEX idx_appointments_company ON appointments(company_id);
CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointment_services_appointment ON appointment_services(appointment_id);
CREATE INDEX idx_appointment_services_service ON appointment_services(service_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
