"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { loginUser, loginAdmin, registerUser } from "@/lib/api"

interface User {
  name: string
  email: string
  accountNumber: string
  accountId: string
  role: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, role: string) => Promise<void>
  logout: () => void
  register: (userData: RegisterData) => Promise<void>
}

interface RegisterData {
  name: string
  email: string
  password: string
  accountNumber: string
  startingBalance: number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("financeFlowToken")
    const userData = localStorage.getItem("financeFlowUser")

    if (!token || !userData) {
      setIsLoading(false)
      return
    }

    try {
      const parsedUser = JSON.parse(userData) as User
      setUser(parsedUser)
    } catch (error) {
      // Invalid user data
      localStorage.removeItem("financeFlowToken")
      localStorage.removeItem("financeFlowUser")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string, role: string) => {
    setIsLoading(true)
    try {
      let response

      if (role === "user") {
        response = await loginUser(email, password)
      } else {
        response = await loginAdmin(email, password)
      }

      // Store token in localStorage
      localStorage.setItem("financeFlowToken", response.token || "mock-token")

      // Create user object
      const userData: User = {
        name: response.name || "User",
        email,
        accountNumber: response.accountNumber || "1234567890",
        accountId: response.accountId || "acc_123456",
        role,
      }

      // Store user info
      localStorage.setItem("financeFlowUser", JSON.stringify(userData))

      setUser(userData)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("financeFlowToken")
    localStorage.removeItem("financeFlowUser")
    setUser(null)
    router.push("/login")
  }

  const register = async (userData: RegisterData) => {
    setIsLoading(true)
    try {
      await registerUser(userData)
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
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
