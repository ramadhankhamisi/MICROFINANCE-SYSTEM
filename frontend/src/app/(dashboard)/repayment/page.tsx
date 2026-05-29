'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/utils/api';

interface LoanDetails {
  id: number;
  loan_number: string;
  principal_amount: number;
  total_amount_due: number;
  amount_paid: number;
  amount_outstanding: number;
  daily_payment: number;
  repayment_days: number;
  status: string;
  customer_name?: string;
}

export default function RepaymentPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LoanDetails[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<LoanDetails | null>(null);
  const [repaymentData, setRepaymentData] = useState({
    amount: '',
    transaction_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const searchLoans = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.get<{ data: LoanDetails[] }>(
        `/flexible-loans?search=${encodeURIComponent(query)}`
      );
      setSearchResults(response.data.data || []);
    } catch {
      setError('Failed to search loans');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    searchLoans(value);
  };

  const handleSelectLoan = (loan: LoanDetails) => {
    setSelectedLoan(loan);
    setSearchResults([]);
    setSearchQuery('');
    setRepaymentData({
      amount: String(loan.daily_payment || ''),
      transaction_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
    });
  };

  const handleSubmitRepayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedLoan) {
      setError('Please select a loan');
      return;
    }

    const amount = parseFloat(repaymentData.amount);
    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (amount > Number(selectedLoan.amount_outstanding)) {
      setError(`Amount exceeds outstanding balance of ${Number(selectedLoan.amount_outstanding).toLocaleString()} TSH`);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post(`/flexible-loans/${selectedLoan.id}/repayment`, {
        loan_id: selectedLoan.id,
        amount,
        transaction_date: repaymentData.transaction_date,
        payment_method: repaymentData.payment_method,
      });
      setSuccess('Repayment recorded successfully');
      setSelectedLoan(null);
      setRepaymentData({
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
      });
    } catch {
      setError('Failed to record repayment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Record Repayment</h1>
          <p className="mt-2 text-gray-600">Search active loans and record daily collections.</p>
        </div>

        {success && <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-3 text-green-700">{success}</div>}
        {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Search Loan</h2>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Loan #, customer, phone"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />

              <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
                {searchResults.map((loan) => (
                  <button
                    key={loan.id}
                    onClick={() => handleSelectLoan(loan)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-left transition hover:bg-blue-50"
                  >
                    <p className="font-semibold text-gray-900">{loan.loan_number}</p>
                    <p className="text-xs text-gray-600">{loan.customer_name || 'N/A'}</p>
                    <p className="text-xs text-blue-600">Outstanding: {Number(loan.amount_outstanding).toLocaleString()} TSH</p>
                  </button>
                ))}
                {loading && <p className="text-sm text-gray-500">Searching...</p>}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedLoan ? (
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-6 text-lg font-bold text-gray-900">Loan Details</h2>
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div className="rounded bg-gray-50 p-3">
                    <p className="text-xs text-gray-600">Customer</p>
                    <p className="font-semibold text-gray-900">{selectedLoan.customer_name}</p>
                  </div>
                  <div className="rounded bg-gray-50 p-3">
                    <p className="text-xs text-gray-600">Outstanding</p>
                    <p className="font-bold text-red-600">{Number(selectedLoan.amount_outstanding).toLocaleString()} TSH</p>
                  </div>
                  <div className="rounded bg-gray-50 p-3">
                    <p className="text-xs text-gray-600">Daily Payment</p>
                    <p className="font-bold text-blue-600">{Number(selectedLoan.daily_payment).toLocaleString()} TSH</p>
                  </div>
                  <div className="rounded bg-gray-50 p-3">
                    <p className="text-xs text-gray-600">Paid</p>
                    <p className="font-semibold text-gray-900">{Number(selectedLoan.amount_paid).toLocaleString()} TSH</p>
                  </div>
                </div>

                <form onSubmit={handleSubmitRepayment} className="space-y-4">
                  <input
                    type="number"
                    value={repaymentData.amount}
                    onChange={(event) => setRepaymentData({ ...repaymentData, amount: event.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    min="1"
                    required
                  />
                  <input
                    type="date"
                    value={repaymentData.transaction_date}
                    onChange={(event) => setRepaymentData({ ...repaymentData, transaction_date: event.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    required
                  />
                  <select
                    value={repaymentData.payment_method}
                    onChange={(event) => setRepaymentData({ ...repaymentData, payment_method: event.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="check">Check</option>
                  </select>
                  <button disabled={loading} className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400">
                    {loading ? 'Recording...' : 'Record Repayment'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="rounded-lg bg-white p-12 text-center shadow-md">
                <p className="text-gray-600">Select a loan to record repayment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
