import { NextResponse } from 'next/server';
import { createFakeToken } from '@/lib/fakeJwt';
import { UserWithPassword } from '@/types/user';

const users: UserWithPassword[] = [
  {
    id: 1,
    name: 'Admin Genie',
    email: 'admin@test.com',
    password: '123456',
    role: 'admin',
  },
  {
    id: 4,
    name: 'Vendor Sari',
    email: 'vendor@test.com',
    password: '123456',
    role: 'vendor',
  },
  {
    id: 2,
    name: 'Reseller Andi',
    email: 'reseller@test.com',
    password: '123456',
    role: 'reseller',
  },
  {
    id: 3,
    name: 'affiliator Budi',
    email: 'affiliator@test.com',
    password: '123456',
    role: 'affiliator',
  },
];

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return NextResponse.json(
      { message: 'Email atau password salah' },
      { status: 401 }
    );
  }

  const token = createFakeToken(user);

  const res = NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });

  // simulasi backend cookie
  res.cookies.set('access_token', token, {
    httpOnly: true,
    path: '/',
  });

  res.cookies.set('role', user.role, {
    path: '/',
  });

  return res;
}
