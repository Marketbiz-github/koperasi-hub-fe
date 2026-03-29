export type Role = 'super_admin' | 'vendor' | 'koperasi' | 'affiliator' | 'reseller';

export interface User {
  id: number | string;
  name?: string;
  email: string;
  role: Role;
  phone?: string;
  plan?: {
    id: number;
    name: string;
    price: string;
    duration_days: number;
  };
  flags?: {
    id: number;
    name: string;
  }[];
  child_affiliations?: any[];
  status?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserWithPassword extends User {
  password: string;
}
