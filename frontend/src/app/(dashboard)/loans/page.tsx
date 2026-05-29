'use client';

import { useEffect, useState } from 'react';
import LoanForm from '@/components/forms/LoanForm';
import { api } from '@/utils/api';

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
}

interface Loan {
  id: number;
  loan_number: string;
  customer_name: string;
  principal_amount: number;
  daily_payment: number;
  repayment_days: number;
  amount_outstanding: number;
  status: string;
}

export default function LoansPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');

  const fetchCustomers = async () => {
    const response = await api.get<{ data: Customer[] }>('/customers?limit=100');
    setCustomers(response.data.data || []);
  };

  const fetchLoans = async () => {
    setLoading(true);
    const response = await api.get<{ data: Loan[] }>('/flexible-loans');
    setLoans(response.data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    Promise.all([fetchCustomers(), fetchLoans()])
      .catch(() => setError('Failed to load loan data'))
      .finally(() => setLoading(false));
  }, []);

  const handleLoanCreated = () => {
    setActiveTab('list');
    fetchLoans().catch(() => setError('Failed to refresh loans'));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Loan Management</h1>
          <p className="mt-2 text-gray-600">Create loans and monitor repayment balances.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => setActiveTab('create')}
            className={`rounded-lg px-4 py-2 font-semibold transition ${
              activeTab === 'create'
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Create Loan
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`rounded-lg px-4 py-2 font-semibold transition ${
              activeTab === 'list'
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Loans ({loans.length})
          </button>
        </div>

        {activeTab === 'create' ? (
          <LoanForm customers={customers} onSuccess={handleLoanCreated} loading={loading} />
        ) : (
          <div className="rounded-lg bg-white shadow-md">
            {loading ? (
              <div className="p-8 text-center text-gray-600">Loading loans...</div>
            ) : loans.length === 0 ? (
              <div className="p-8 text-center text-gray-600">No loans found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Loan #</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Principal</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Daily Payment</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Outstanding</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map((loan) => (
                      <tr key={loan.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-blue-600">{loan.loan_number}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{loan.customer_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{Number(loan.principal_amount).toLocaleString()} TSH</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{Number(loan.daily_payment).toLocaleString()} TSH</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{Number(loan.amount_outstanding).toLocaleString()} TSH</td>
                        <td className="px-6 py-4">
                          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold capitalize text-green-800">
                            {loan.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
