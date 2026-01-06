export type Role = 'admin' | 'vendor' | 'reseller' | 'affiliator';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface UserWithPassword extends User {
  password: string;
}
