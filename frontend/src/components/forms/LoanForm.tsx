'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/api';

interface CalculationPreview {
  loanAmount: number;
  interestRate: string;
  interest: number;
  totalDue: number;
  repaymentDays: number;
  dailyPayment: number;
  tierName: string;
  recommendedRange: { min: number; max: number };
  validation: {
    isValid: boolean;
    recommendedRange: { min: number; max: number };
    allowedRange: { min: number; max: number };
    message: string;
  };
}

interface LoanFormProps {
  customers: any[];
  onSuccess?: () => void;
  loading?: boolean;
}

export default function LoanForm({ customers, onSuccess, loading = false }: LoanFormProps) {
  const [formData, setFormData] = useState({
    customer_id: '',
    principal_amount: '',
    repayment_days: '',
    loan_officer_id: '',
  });

  const [preview, setPreview] = useState<CalculationPreview | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchCalculationPreview = async (amount: string, days: string) => {
    if (!amount || !days) return;

    try {
      setPreviewLoading(true);
      setError('');
      const response = await fetch(
        `${API_BASE_URL}/flexible-loans/calculation-preview?amount=${amount}&repayment_days=${days}`
      );

      if (!response.ok) {
        const data = await response.json();
        setError(data.error?.message || 'Failed to fetch calculation');
        setPreview(null);
        return;
      }

      const data = await response.json();
      setPreview(data.data);
    } catch (err) {
      setError('Error calculating preview');
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.principal_amount && formData.repayment_days) {
        fetchCalculationPreview(formData.principal_amount, formData.repayment_days);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.principal_amount, formData.repayment_days]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!preview?.validation.isValid) {
      setError('Please fix validation errors before submitting');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/flexible-loans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          principal_amount: parseFloat(formData.principal_amount),
          repayment_days: parseInt(formData.repayment_days),
          branch_id: localStorage.getItem('branch_id'),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to create loan');
      }

      setFormData({ customer_id: '', principal_amount: '', repayment_days: '', loan_officer_id: '' });
      setPreview(null);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating loan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Loan</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer <span className="text-red-500">*</span>
          </label>
          <select
            name="customer_id"
            value={formData.customer_id}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a customer</option>
            {customers?.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.first_name} {customer.last_name} - {customer.phone}
              </option>
            ))}
          </select>
        </div>

        {/* Principal Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loan Amount (TSH) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="principal_amount"
            value={formData.principal_amount}
            onChange={handleInputChange}
            placeholder="10000 - 10000000"
            min="10000"
            max="10000000"
            step="1000"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Minimum: 10,000 TSH | Maximum: 10,000,000 TSH</p>
        </div>

        {/* Repayment Days */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Repayment Period (Days) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="repayment_days"
            value={formData.repayment_days}
            onChange={handleInputChange}
            placeholder="Enter number of days"
            min="1"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {preview?.validation.allowedRange && (
            <p className="text-xs text-gray-500 mt-1">
              Allowed range: {preview.validation.allowedRange.min} - {preview.validation.allowedRange.max} days
              (Recommended: {preview.validation.recommendedRange.min} - {preview.validation.recommendedRange.max} days)
            </p>
          )}
        </div>

        {/* Loan Officer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loan Officer <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="loan_officer_id"
            value={formData.loan_officer_id}
            onChange={handleInputChange}
            placeholder="Your Officer ID (UUID)"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Calculation Preview */}
        {formData.principal_amount && formData.repayment_days && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            {previewLoading ? (
              <div className="text-center py-4">
                <p className="text-gray-600">Calculating preview...</p>
              </div>
            ) : preview ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Calculation Preview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded">
                    <p className="text-xs text-gray-600">Loan Amount</p>
                    <p className="text-lg font-bold text-gray-900">
                      {preview.loanAmount.toLocaleString()} TSH
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-xs text-gray-600">Interest (20%)</p>
                    <p className="text-lg font-bold text-gray-900">
                      {preview.interest.toLocaleString()} TSH
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-xs text-gray-600">Total Due</p>
                    <p className="text-lg font-bold text-blue-600">
                      {preview.totalDue.toLocaleString()} TSH
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-xs text-gray-600">Daily Payment</p>
                    <p className="text-lg font-bold text-gray-900">
                      {preview.dailyPayment.toLocaleString()} TSH
                    </p>
                  </div>
                  <div className="col-span-2 bg-white p-3 rounded">
                    <p className="text-xs text-gray-600">Tier</p>
                    <p className="text-sm font-semibold text-gray-900">{preview.tierName}</p>
                  </div>
                </div>

                {/* Validation Status */}
                <div className={`mt-4 p-3 rounded ${preview.validation.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`text-sm font-medium ${preview.validation.isValid ? 'text-green-700' : 'text-red-700'}`}>
                    {preview.validation.message}
                  </p>
                </div>
              </div>
            ) : error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && !previewLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || loading || !preview?.validation.isValid}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          {isSubmitting ? 'Creating Loan...' : 'Create Loan'}
        </button>
      </form>
    </div>
  );
}
