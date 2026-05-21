export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'branch_manager' | 'loan_officer' | 'cashier' | 'staff';
  branchId: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  nationalId: string;
  dateOfBirth?: string;
  address?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Loan {
  id: number;
  customerId: number;
  amount: number;
  loanType: string;
  interestRate: number;
  termMonths: number;
  status: 'active' | 'completed' | 'defaulted';
  disbursalDate: string;
  maturityDate: string;
}

export interface Repayment {
  id: number;
  loanId: number;
  paymentDate: string;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  status: 'pending' | 'completed' | 'overdue';
}

export interface Transaction {
  id: number;
  branchId: number;
  transactionType: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  transactionDate: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  timestamp: string;
}
