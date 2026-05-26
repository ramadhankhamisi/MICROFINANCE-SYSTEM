'use client';

import { useState, useEffect } from 'react';
import LoanForm from '@/components/forms/LoanForm';
import { API_BASE_URL } from '@/config/api';

export default function LoansPage() {
  const [customers, setCustomers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');

  useEffect(() => {
    fetchCustomers();
    fetchLoans();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.data || []);
      }
    } catch (err) {
      setError('Failed to fetch customers');
    }
  };

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/flexible-loans`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setLoans(data.data || []);
      }
    } catch (err) {
      setError('Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  };

  const handleLoanCreated = () => {
    setActiveTab('list');
    fetchLoans();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Loan Management</h1>
          <p className="text-gray-600 mt-2">Manage customer loans and repayment schedules</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === 'create'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Create Loan
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Active Loans ({loans.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'create' ? (
          <LoanForm customers={customers} onSuccess={handleLoanCreated} loading={loading} />
        ) : (
          <div className="bg-white rounded-lg shadow-md">
            {loading ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">Loading loans...</p>
              </div>
            ) : loans.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">No active loans found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Loan #</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Principal</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Daily Payment</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Days Left</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map(loan => (
                      <tr key={loan.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-blue-600">{loan.loan_number}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {loan.customer_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {loan.principal_amount?.toLocaleString()} TSH
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {loan.daily_payment?.toLocaleString()} TSH
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{loan.repayment_days} days</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              loan.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
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
