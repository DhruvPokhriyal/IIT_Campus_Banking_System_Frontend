const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Types
interface User {
  id: number
  name: string
  email: string
  accountNumber: number
  balance: number
  role: string
}

interface LoginResponse {
  status: string
  message: string
  user: User
}

interface Account {
  id: number
  accountNumber: number
  balance: number
}

interface Transaction {
  id: number
  transactionType: "Deposit" | "Withdrawal" | "Transfer"
  amount: number
  description: string
  timestamp: string
  sender?: {
    id: number
    accountNumber: number
  }
  receiver?: {
    id: number
    accountNumber: number
  }
}

// Base API request function with error handling
const apiRequest = async <T>(
  endpoint: string,
  method: string = "GET",
  data?: any
): Promise<T> => {
  const token = localStorage.getItem('financeFlowToken');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const options: RequestInit = {
    method,
    headers: {
      ...defaultHeaders,
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const response = await fetch(`${API_BASE_URL}/${cleanEndpoint}`, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to the server. Please check your connection.');
    }
    throw error;
  }
}

// Auth endpoints
export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  return apiRequest('auth/login', 'POST', { email, password });
};

export const loginAdmin = async (email: string, password: string): Promise<LoginResponse> => {
  return apiRequest('auth/admin/login', 'POST', { email, password });
};

export const registerUser = async (userData: {
  name: string
  email: string
  password: string
  confirmPassword: string
  accountNumber: number
  balance?: number
}): Promise<User> => {
  return apiRequest('users/register', 'POST', userData);
};

// Account endpoints
export const getAccountDetails = async (accountNumber: number): Promise<Account> => {
  return apiRequest(`accounts/${accountNumber}`);
};

export const getAccountBalance = async (accountNumber: number): Promise<number> => {
  return apiRequest(`accounts/${accountNumber}/balance`);
};

// Transaction endpoints
export const getTransactions = async (accountNumber: number): Promise<Transaction[]> => {
  return apiRequest(`transactions/account/${accountNumber}`);
};

export const depositFunds = async (accountNumber: number, data: { amount: number }): Promise<Transaction> => {
  return apiRequest(`transactions/deposit/${accountNumber}`, 'POST', data);
};

export const withdrawFunds = async (accountNumber: number, data: { amount: number }): Promise<Transaction> => {
  return apiRequest(`transactions/withdraw/${accountNumber}`, 'POST', data);
};

export const transferFunds = async (senderId: number, receiverId: number, data: { amount: number }): Promise<Transaction> => {
  return apiRequest('transactions/transfer', 'POST', { senderId, receiverId, ...data });
};

// Error handling utility
export const handleApiError = (error: unknown) => {
  if (error instanceof Error) {
    // Handle specific error messages from the backend
    if (error.message.includes('More than one row with the given identifier')) {
      return { message: 'Account data inconsistency detected. Please contact support.' };
    }
    return { message: error.message };
  }
  return { message: 'An unexpected error occurred' };
};
