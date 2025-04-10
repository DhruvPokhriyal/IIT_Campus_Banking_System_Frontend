// API service functions to interact with the backend

const API_BASE_URL = "http://localhost:8080"

// Helper function to get the auth token
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("financeFlowToken")
  }
  return null
}

// Base API request function with error handling
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken()

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  try {
    // Add a timeout to the fetch request to avoid hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      mode: "cors",
      credentials: "include",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `API request failed: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error("API request error:", error)

    // Provide more specific error messages based on the error type
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(`Unable to connect to the API server at ${API_BASE_URL}. Please ensure the server is running.`)
    }

    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please check your network connection and try again.")
    }

    throw error
  }
}

// User Registration and Authentication
export const registerUser = (userData: {
  name: string
  email: string
  password: string
  accountNumber: string
  startingBalance: number
}) => {
  return apiRequest("/api/users/register", {
    method: "POST",
    body: JSON.stringify(userData),
  })
}

export const loginUser = (email: string, password: string) => {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export const loginAdmin = (email: string, password: string) => {
  return apiRequest("/api/auth/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

// Account Details
export const getAccountDetails = (accountNumber: string) => {
  return apiRequest(`/api/accounts/${accountNumber}`)
}

export const getAccountBalance = (accountNumber: string) => {
  return apiRequest(`/api/accounts/${accountNumber}/balance`)
}

// Transactions
export const getTransactions = (accountId: string) => {
  return apiRequest(`/api/transactions/account/${accountId}`)
}

export const depositFunds = (accountId: string, amount: number) => {
  return apiRequest(`/api/transactions/deposit/${accountId}?amount=${amount}`, {
    method: "POST",
  })
}

export const withdrawFunds = (accountId: string, amount: number) => {
  return apiRequest(`/api/transactions/withdraw/${accountId}?amount=${amount}`, {
    method: "POST",
  })
}

export const transferFunds = (senderId: string, receiverId: string, amount: number) => {
  return apiRequest(`/api/transactions/transfer?senderId=${senderId}&receiverId=${receiverId}&amount=${amount}`, {
    method: "POST",
  })
}

// Error handling for API requests
export const handleApiError = (error: any) => {
  console.error("API Error:", error)
  return {
    message: error.message || "An unexpected error occurred",
  }
}
