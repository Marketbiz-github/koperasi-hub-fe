import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface AccessDeniedProps {
  allowedRole?: string;
}

export function AccessDenied({ allowedRole }: AccessDeniedProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-700 to-slate-900 p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* Icon */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4v2m0 0v2m0-6V9m0 0V7m0 2a2 2 0 100-4 2 2 0 000 4z"
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Akses Ditolak
          </h1>
          <p className="text-gray-600 mb-2">
            {allowedRole
              ? `Anda tidak memiliki izin untuk mengakses halaman ini. Halaman ini hanya untuk ${allowedRole}.`
              : 'Anda tidak memiliki izin untuk mengakses halaman ini.'}
          </p>

          {/* Buttons */}
          <div className="space-y-3 mt-12">
            <button
              onClick={() => router.back()}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors duration-200"
            >
              Kembali
            </button>
            <button
              onClick={() => {
                const roleRouteMap: Record<string, string> = {
                  vendor: '/dashboard/vendor',
                  super_admin: '/dashboard/super_admin',
                  koperasi: '/dashboard/koperasi',
                  affiliator: '/dashboard/affiliator',
                  reseller: '/dashboard/reseller',
                };
                const route = user?.role ? roleRouteMap[user.role] : '/dashboard';
                router.push(route);
              }}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Ke Dashboard Saya
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              © 2025 KoperasiHub. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
