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

export interface RegisterResponse {
  name: string
  email: string
  accountNumber: number
  balance: number
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
    'Access-Control-Allow-Origin': '*',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const options: RequestInit = {
    method,
    headers: {
      ...defaultHeaders,
    },
    mode: 'cors' as RequestMode,
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = `${API_BASE_URL}/${cleanEndpoint}`;
    console.log(`Making ${method} request to:`, url);
    
    const response = await fetch(url, options);
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error('API request error:', error);
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
}): Promise<RegisterResponse> => {
  // Add detailed logging
  console.log('Registering user with data:', {
    ...userData,
    password: '[REDACTED]',
    confirmPassword: '[REDACTED]'
  });

  // Check if passwords match
  if (userData.password !== userData.confirmPassword) {
    throw new Error("Passwords do not match");
  }

  try {
    const response = await apiRequest<RegisterResponse>('users/register', 'POST', userData);
    console.log('Raw registration response:', response);
    
    // Validate response format
    if (!response || typeof response !== 'object') {
      console.error('Invalid response format:', response);
      throw new Error('Invalid response format from server');
    }
    
    // Check for required fields
    if (!response.name || !response.email || typeof response.accountNumber !== 'number' || typeof response.balance !== 'number') {
      console.error('Missing required fields in response:', response);
      throw new Error('Missing required fields in response');
    }
    
    return response;
  } catch (error) {
    console.error('Registration error details:', error);
    throw error;
  }
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
  const amount = data.amount;
  console.log('Deposit amount:', amount);
  
  if (isNaN(amount)) {
    throw new Error('Invalid amount provided');
  }
  
  const formattedAmount = amount.toFixed(2);
  console.log('Formatted amount:', formattedAmount);
  
  return apiRequest(`transactions/deposit/${accountNumber}?amount=${formattedAmount}`, 'POST');
};

export const withdrawFunds = async (accountNumber: number, data: { amount: number }): Promise<Transaction> => {
  const amount = data.amount;
  console.log('Withdraw amount:', amount);
  
  if (isNaN(amount)) {
    throw new Error('Invalid amount provided');
  }
  
  const formattedAmount = amount.toFixed(2);
  console.log('Formatted amount:', formattedAmount);
  
  return apiRequest(`transactions/withdraw/${accountNumber}?amount=${formattedAmount}`, 'POST');
};

export const transferFunds = async (senderId: number, receiverId: number, data: { amount: number }): Promise<Transaction> => {
  const amount = data.amount;
  console.log('Transfer amount:', amount);
  
  if (isNaN(amount)) {
    throw new Error('Invalid amount provided');
  }
  
  const formattedAmount = amount.toFixed(2);
  console.log('Formatted amount:', formattedAmount);
  
  return apiRequest(`transactions/transfer?senderId=${senderId}&receiverId=${receiverId}&amount=${formattedAmount}`, 'POST');
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
