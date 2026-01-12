'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import LoginForm from '@/components/auth/loginForm';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore(state => state.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        alert('Login gagal');
        return;
      }

      const data = await res.json();
      setUser(data.user);

      // redirect by role
      if (data.user.role === 'admin') {
        router.push('/dashboard/admin');
      } else if (data.user.role === 'vendor') {
        router.push('/dashboard/vendor');
      } else if (data.user.role === 'koperasi') {
        router.push('/dashboard/koperasi');
      } else {
        router.push('/dashboard/affiliator');
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat login');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <LoginForm
      email={email}
      password={password}
      showPassword={showPassword}
      isLoading={isLoading}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onTogglePassword={() => setShowPassword(!showPassword)}
      onSubmit={handleLogin}
    />
  );
}