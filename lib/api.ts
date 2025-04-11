const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

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
    // Remove the leading slash from endpoint if it exists
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
export const loginUser = async (email: string, password: string) => {
  return apiRequest('auth/login', 'POST', { email, password });
};

export const loginAdmin = async (email: string, password: string) => {
  return apiRequest('auth/admin/login', 'POST', { email, password });
};

export const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
  accountNumber: string;
  startingBalance: number;
}) => {
  return apiRequest('auth/register', 'POST', userData);
};

// Account endpoints
export const getAccountBalance = async (accountNumber: number) => {
  return apiRequest(`/accounts/${accountNumber}/balance`);
};

export const getAccountDetails = async (accountNumber: number) => {
  return apiRequest(`/accounts/${accountNumber}`);
};

export interface Transaction {
  id: string
  type: "deposit" | "withdrawal" | "transfer"
  amount: number
  date: string
  description: string
  balance: number
}

export const getTransactions = async (accountNumber: number): Promise<Transaction[]> => {
  try {
    const response = await apiRequest<{ transactions: Transaction[] }>(
      `transactions/account/${accountNumber}`,
      "GET"
    )
    return response.transactions
  } catch (error) {
    console.error("Error fetching transactions:", error)
    throw error
  }
}

export const depositFunds = async (accountNumber: number, amount: number) => {
  return apiRequest(`/accounts/${accountNumber}/deposit`, 'POST', { amount });
};

export const withdrawFunds = async (accountNumber: number, amount: number) => {
  return apiRequest(`/accounts/${accountNumber}/withdraw`, 'POST', { amount });
};

export const transferFunds = async (fromAccountNumber: number, toAccountNumber: number, amount: number) => {
  return apiRequest(`/accounts/${fromAccountNumber}/transfer`, 'POST', { toAccountNumber, amount });
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
