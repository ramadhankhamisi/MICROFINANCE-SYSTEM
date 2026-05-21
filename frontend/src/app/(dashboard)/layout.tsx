'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/contexts/authStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900">MFS</h2>
          <p className="text-sm text-gray-600">Microfinance System</p>
        </div>
        <nav className="mt-6 space-y-2 px-4">
          <a href="#" className="block px-4 py-2 rounded-lg hover:bg-gray-100">Dashboard</a>
          <a href="#" className="block px-4 py-2 rounded-lg hover:bg-gray-100">Customers</a>
          <a href="#" className="block px-4 py-2 rounded-lg hover:bg-gray-100">Loans</a>
          <a href="#" className="block px-4 py-2 rounded-lg hover:bg-gray-100">Reports</a>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
