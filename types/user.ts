export type Role = 'super_admin' | 'vendor' | 'koperasi' | 'affiliator' | 'reseller';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface UserWithPassword extends User {
  password: string;
}
