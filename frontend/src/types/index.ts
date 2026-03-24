export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  password2: string;
  business_slug: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: string;
}

export interface PublicBusiness {
  id: string;
  name: string;
  slug: string;
  timezone: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  phone: string;
  address: string;
  timezone: string;
  plan: string;
  is_active: boolean;
  owner_email: string;
  created_at: string;
}

export interface Client {
  id: string;
  user: string;
  user_email: string;
  user_full_name: string;
  notes: string;
  created_at: string;
}

export interface Service {
  id: string;
  business: string;
  name: string;
  description: string;
  duration_min: number;
  price: string;
  is_active: boolean;
  created_at: string;
}

export interface Pet {
  id: string;
  owner: string;
  owner_email: string;
  name: string;
  species: string;
  species_display: string;
  breed: string;
  birth_date: string | null;
  weight_kg: string | null;
  notes: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  business: string;
  pet: string;
  pet_name: string;
  service: string;
  service_name: string;
  staff: string | null;
  staff_email: string | null;
  scheduled_at: string;
  status: string;
  status_display: string;
  notes: string;
  price_charged: string | null;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
