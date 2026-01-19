'use client'

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useLayoutEffect } from "react";
import { AccessDenied } from "@/components/access-denied";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useLayoutEffect(() => {
    // Jika tidak ada user, redirect ke login
    if (!user) {
      router.replace('/login');
      return;
    }

    // Jika user ada tapi role tidak sesuai, tidak perlu redirect
    // layout akan show access denied
  }, [user, router]);

  // Jika tidak ada user, redirect dilakukan via useLayoutEffect
  if (!user) {
    return null;
  }

  // Jika user ada tapi role tidak sesuai, show access denied
  if (user.role !== 'admin') {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
