'use client';

import { useState } from 'react';
import { API_BASE_URL } from '@/config/api';

interface LoanDetails {
  id: string;
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

interface RepaymentRecord {
  amount: number;
  transaction_date: string;
  payment_method: string;
  loan_id: string;
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

    try {
      setLoading(true);
      setError('');

      // Search by customer name or loan number
      const response = await fetch(
        `${API_BASE_URL}/flexible-loans?search=${encodeURIComponent(query)}`,
        { credentials: 'include' }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.data || []);
      }
    } catch (err) {
      setError('Failed to search loans');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    searchLoans(value);
  };

  const handleSelectLoan = (loan: LoanDetails) => {
    setSelectedLoan(loan);
    setSearchResults([]);
    setSearchQuery('');
    setRepaymentData({
      amount: loan.daily_payment?.toString() || '',
      transaction_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRepaymentData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitRepayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLoan) {
      setError('Please select a loan');
      return;
    }

    const amount = parseFloat(repaymentData.amount);
    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (amount > selectedLoan.amount_outstanding) {
      setError(`Amount exceeds outstanding balance of ${selectedLoan.amount_outstanding} TSH`);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/flexible-loans/${selectedLoan.id}/repayment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          loan_id: selectedLoan.id,
          amount: amount,
          transaction_date: repaymentData.transaction_date,
          payment_method: repaymentData.payment_method,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to record repayment');
      }

      setSuccess('Repayment recorded successfully!');
      setSelectedLoan(null);
      setRepaymentData({
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
      });

      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error recording repayment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Record Repayment</h1>
          <p className="text-gray-600 mt-2">Record daily loan repayments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Search Loan</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Number or Customer Name
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.map(loan => (
                    <button
                      key={loan.id}
                      onClick={() => handleSelectLoan(loan)}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg transition"
                    >
                      <p className="font-semibold text-gray-900">{loan.loan_number}</p>
                      <p className="text-xs text-gray-600">{loan.customer_name || 'N/A'}</p>
                      <p className="text-xs text-blue-600">
                        Outstanding: {loan.amount_outstanding?.toLocaleString()} TSH
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {selectedLoan && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-gray-600">Selected Loan</p>
                  <p className="font-semibold text-gray-900">{selectedLoan.loan_number}</p>
                  <button
                    onClick={() => setSelectedLoan(null)}
                    className="mt-2 text-xs text-blue-600 hover:underline"
                  >
                    Clear Selection
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Repayment Form */}
          <div className="lg:col-span-2">
            {selectedLoan ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Loan Details & Repayment</h2>

                {/* Loan Summary */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Principal Amount</p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedLoan.principal_amount?.toLocaleString()} TSH
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Total Due (with 20% Interest)</p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedLoan.total_amount_due?.toLocaleString()} TSH
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Daily Payment</p>
                    <p className="text-lg font-bold text-blue-600">
                      {selectedLoan.daily_payment?.toLocaleString()} TSH
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Outstanding Balance</p>
                    <p className="text-lg font-bold text-red-600">
                      {selectedLoan.amount_outstanding?.toLocaleString()} TSH
                    </p>
                  </div>
                  <div className="col-span-2 bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Amount Paid / Total Due</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedLoan.amount_paid?.toLocaleString()} / {selectedLoan.total_amount_due?.toLocaleString()} TSH
                      </p>
                      <p className="text-sm text-gray-600">
                        {Math.round((selectedLoan.amount_paid / selectedLoan.total_amount_due) * 100)}% Complete
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition"
                        style={{
                          width: `${Math.min((selectedLoan.amount_paid / selectedLoan.total_amount_due) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Repayment Form */}
                <form onSubmit={handleSubmitRepayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Repayment Amount (TSH) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={repaymentData.amount}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="100"
                      min="0"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Max: {selectedLoan.amount_outstanding?.toLocaleString()} TSH
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="transaction_date"
                      value={repaymentData.transaction_date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="payment_method"
                      value={repaymentData.payment_method}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="mobile_money">Mobile Money</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-green-700 text-sm">{success}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    {loading ? 'Recording Repayment...' : 'Record Repayment'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600">Select a loan from the search panel to record repayment</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
