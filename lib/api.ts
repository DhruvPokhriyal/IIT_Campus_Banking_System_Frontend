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
  status: string
  message: string
  user: User
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
    // Only check for amount parameter on transaction-related endpoints
    const isTransactionEndpoint = endpoint.includes('transactions/');
    if (isTransactionEndpoint && !data.amount && method !== 'GET') {
      throw new Error("Required parameter 'amount' is not present.");
    }
    options.body = JSON.stringify(data);
  }

  try {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const response = await fetch(`${API_BASE_URL}/${cleanEndpoint}`, options);
    
    const responseData = await response.json();
    
    if (!response.ok) {
      // Log the full error response for debugging
      console.error('Server error response:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });
      
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }

    return responseData;
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
}): Promise<RegisterResponse> => {
  // Add detailed logging
  console.log('Registering user with data:', {
    ...userData,
    password: userData.password, // Log actual password for debugging
    confirmPassword: userData.confirmPassword // Log actual password for debugging
  });

  // Check if passwords match
  if (userData.password !== userData.confirmPassword) {
    console.log('Password mismatch:', {
      password: userData.password,
      confirmPassword: userData.confirmPassword
    });
    throw new Error("Passwords do not match");
  }

  // Send the complete user data including confirmPassword
  console.log('Sending request with data:', {
    ...userData,
    password: userData.password // Log actual password for debugging
  });

  try {
    const response = await apiRequest<RegisterResponse>('users/register', 'POST', userData);
    console.log('Registration response:', response);
    return response;
  } catch (error) {
    console.error('Registration error:', error);
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
