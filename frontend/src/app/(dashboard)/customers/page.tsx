'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/utils/api';

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  national_id: string;
  date_of_birth?: string;
  address?: string;
  status: string;
}

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  nationalId: '',
  dateOfBirth: '',
  address: '',
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadCustomers = async () => {
    const response = await api.get<{ data: Customer[] }>('/customers?limit=100');
    setCustomers(response.data.data || []);
  };

  useEffect(() => {
    loadCustomers().catch(() => setError('Failed to load customers'));
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/customers', form);
      setForm(emptyForm);
      setSuccess('Customer created successfully');
      await loadCustomers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create customer';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <p className="mt-2 text-gray-600">Register and view microfinance customers.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow xl:col-span-1">
          <h2 className="mb-5 text-lg font-bold text-gray-900">New Customer</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input className="rounded-lg border px-3 py-2" placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
              <input className="rounded-lg border px-3 py-2" placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
            </div>
            <input className="w-full rounded-lg border px-3 py-2" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            <input className="w-full rounded-lg border px-3 py-2" placeholder="National ID" value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} required />
            <input className="w-full rounded-lg border px-3 py-2" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
            <input className="w-full rounded-lg border px-3 py-2" type="email" placeholder="Email optional" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <textarea className="w-full rounded-lg border px-3 py-2" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />

            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            {success && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}

            <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400">
              {loading ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>

        <div className="overflow-hidden rounded-lg bg-white shadow xl:col-span-2">
          <table className="w-full">
            <thead className="border-b bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">National ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b">
                  <td className="px-4 py-3 text-sm">{customer.first_name} {customer.last_name}</td>
                  <td className="px-4 py-3 text-sm">{customer.phone}</td>
                  <td className="px-4 py-3 text-sm">{customer.national_id}</td>
                  <td className="px-4 py-3 text-sm capitalize">{customer.status}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-gray-500" colSpan={4}>No customers yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
