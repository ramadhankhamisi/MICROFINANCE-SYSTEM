-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Branches table
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  manager_id UUID,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  established_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  last_login TIMESTAMP WITH TIME ZONE,
  is_2fa_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add manager foreign key
ALTER TABLE branches ADD CONSTRAINT fk_branches_manager 
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  national_id VARCHAR(50) NOT NULL,
  id_type VARCHAR(50),
  id_expiry_date DATE,
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10) CHECK (gender IN ('M', 'F', 'Other')),
  marital_status VARCHAR(20),
  occupation VARCHAR(100),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  assigned_officer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  annual_income DECIMAL(15, 2),
  monthly_income DECIMAL(15, 2),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted')),
  customer_type VARCHAR(50) DEFAULT 'individual' CHECK (customer_type IN ('individual', 'business', 'group')),
  kyc_verified BOOLEAN DEFAULT FALSE,
  kyc_verified_date DATE,
  kyc_verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(national_id, branch_id)
);

-- Loan products
CREATE TABLE loan_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  min_amount DECIMAL(15, 2) NOT NULL,
  max_amount DECIMAL(15, 2) NOT NULL,
  base_interest_rate DECIMAL(5, 2) NOT NULL CHECK (base_interest_rate >= 0),
  min_duration_months INT NOT NULL,
  max_duration_months INT NOT NULL,
  default_duration_months INT NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  requires_collateral BOOLEAN DEFAULT FALSE,
  requires_guarantor BOOLEAN DEFAULT FALSE,
  grace_period_days INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

