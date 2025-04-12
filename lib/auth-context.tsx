"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { loginUser, loginAdmin, registerUser, handleApiError, RegisterResponse } from "@/lib/api"

interface User {
  id: number
  name: string
  email: string
  accountNumber: number
  balance: number
  role: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  login: (email: string, password: string, role: string) => Promise<void>
  logout: () => void
  register: (userData: RegisterData) => Promise<void>
  clearError: () => void
}

interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
  accountNumber: string
  startingBalance: number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("financeFlowToken")
        const userData = localStorage.getItem("financeFlowUser")

        if (!token || !userData) {
          setIsLoading(false)
          return
        }

        const parsedUser = JSON.parse(userData) as User
        setUser(parsedUser)
      } catch (error) {
        console.error("Auth check error:", error)
        localStorage.removeItem("financeFlowToken")
        localStorage.removeItem("financeFlowUser")
        setError("Session expired. Please login again.")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string, role: string) => {
    setIsLoading(true)
    setError(null)
    try {
      let response

      if (role === "user") {
        response = await loginUser(email, password)
      } else {
        response = await loginAdmin(email, password)
      }

      if (response.status !== "LOGIN_SUCCESS") {
        throw new Error(response.message || "Login failed")
      }

      if (!response.user) {
        throw new Error("Invalid response from server: Missing user data")
      }

      // Store the user data
      const userData: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        accountNumber: response.user.accountNumber,
        balance: response.user.balance,
        role: response.user.role,
      }

      localStorage.setItem("financeFlowUser", JSON.stringify(userData))
      setUser(userData)
      router.push("/dashboard")
    } catch (error) {
      const apiError = handleApiError(error)
      setError(apiError.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("financeFlowToken")
    localStorage.removeItem("financeFlowUser")
    setUser(null)
    setError(null)
    router.push("/login")
  }

  const register = async (userData: RegisterData) => {
    setIsLoading(true)
    setError(null)
    try {
      // Add logging to debug password values
      console.log('Auth context - Registration data:', {
        ...userData,
        password: userData.password, // Log actual password for debugging
        confirmPassword: userData.confirmPassword // Log actual password for debugging
      });

      if (userData.password !== userData.confirmPassword) {
        console.log('Auth context - Password mismatch:', {
          password: userData.password,
          confirmPassword: userData.confirmPassword
        });
        throw new Error("Passwords do not match");
      }

      const response = await registerUser({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        accountNumber: Number(userData.accountNumber),
        balance: userData.startingBalance
      });
      
      console.log('Auth context - Registration response:', response);
      
      if (response.status !== "REGISTRATION_SUCCESS") {
        throw new Error(response.message || "Registration failed");
      }

      router.push("/login");
    } catch (error) {
      console.error('Auth context - Registration error:', error);
      const apiError = handleApiError(error);
      setError(apiError.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        error,
        login,
        logout,
        register,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
