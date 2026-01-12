export type Role = 'admin' | 'vendor' | 'koperasi' | 'affiliator';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface UserWithPassword extends User {
  password: string;
}
