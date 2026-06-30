export interface Area {
  id: string;
  name: string;
  created_at: string;
}

export interface Role {
  id: string;
  name: string;
  is_system_admin: boolean;
  area_id: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role_id?: string;
  avatar_url?: string;
  created_at: string;
  // Joined fields
  roles?: {
    name: string;
    is_system_admin: boolean;
  };
}

export interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  location?: string;
  notes?: string;
  status: string;
  assigned_salesperson_id?: string;
  created_at: string;
  // Joined fields
  users?: {
    name: string;
  };
}

export interface Project {
  id: string;
  code?: string;
  title: string;
  description?: string;
  client_id: string;
  assigned_salesperson_id?: string;
  status: string;
  expected_revenue: number;
  created_at: string;
  // Joined fields
  proformas?: Proforma[];
}

export interface Proforma {
  id: string;
  code?: string;
  project_id: string;
  items: any[];
  total: number;
  expiration_date?: string;
  issue_date: string;
  status: string;
  generated_file_url?: string;
  created_at: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  created_at: string;
}
