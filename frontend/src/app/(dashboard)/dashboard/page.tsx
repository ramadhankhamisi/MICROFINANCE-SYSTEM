'use client';

import { useEffect, useState } from 'react';
import { api } from '@/utils/api';

interface DashboardSummary {
  totalCustomers: number;
  totalLoans: number;
  activeLoans: number;
  totalPrincipal: number;
  outstandingPortfolio: number;
  totalCollected: number;
  todayCollections: number;
}

const money = (value: number) => `${Number(value || 0).toLocaleString()} TSH`;

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const response = await api.get<{ data: DashboardSummary }>('/dashboard/summary');
        setSummary(response.data.data);
      } catch {
        setError('Failed to load dashboard summary');
      }
    };

    loadSummary();
  }, []);

  const cards = [
    { label: 'Total Customers', value: summary?.totalCustomers ?? 0 },
    { label: 'Active Loans', value: summary?.activeLoans ?? 0 },
    { label: 'Outstanding Portfolio', value: money(summary?.outstandingPortfolio ?? 0) },
    { label: "Today's Collections", value: money(summary?.todayCollections ?? 0) },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Branch performance and daily microfinance activity.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm text-gray-600">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm text-gray-600">Total Principal Issued</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">{money(summary?.totalPrincipal ?? 0)}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm text-gray-600">Total Collected</p>
          <p className="mt-2 text-2xl font-bold text-green-700">{money(summary?.totalCollected ?? 0)}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm text-gray-600">All Loans</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{summary?.totalLoans ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
