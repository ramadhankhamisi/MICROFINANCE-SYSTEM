export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
  },
  customers: {
    list: '/customers',
    create: '/customers',
    get: (id: string) => `/customers/${id}`,
    update: (id: string) => `/customers/${id}`,
  },
  loans: {
    list: '/loans',
    create: '/loans',
    get: (id: string) => `/loans/${id}`,
    calculationPreview: '/flexible-loans/calculation-preview',
    repaymentRange: '/flexible-loans/repayment-range',
  },
  flexibleLoans: {
    calculationPreview: '/flexible-loans/calculation-preview',
    repaymentRange: '/flexible-loans/repayment-range',
    create: '/flexible-loans',
    get: (id: string) => `/flexible-loans/${id}`,
    recordRepayment: (id: string) => `/flexible-loans/${id}/repayment`,
  },
};
