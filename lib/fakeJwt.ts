import { User } from '@/types/user';

export function createFakeToken(user: User) {
  return Buffer.from(JSON.stringify(user)).toString('base64');
}

export function decodeFakeToken(token: string): User {
  return JSON.parse(Buffer.from(token, 'base64').toString());
}
