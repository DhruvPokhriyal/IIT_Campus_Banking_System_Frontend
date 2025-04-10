"use client"

// This is a simple auth utility for client-side authentication
// In a real app, you would use a more robust solution like NextAuth.js

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export interface User {
  name: string
  email: string
  accountNumber: string
  accountId: string
  role: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("banksmartToken")
    const userData = localStorage.getItem("banksmartUser")

    if (!token || !userData) {
      setIsLoading(false)
      return
    }

    try {
      const parsedUser = JSON.parse(userData) as User
      setUser(parsedUser)
    } catch (error) {
      // Invalid user data
      localStorage.removeItem("banksmartToken")
      localStorage.removeItem("banksmartUser")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = (email: string, password: string, role = "user") => {
    // In a real app, you would call the API endpoint
    // const endpoint = role === 'user' ? '/api/auth/login' : '/api/auth/admin/login'
    // return fetch(endpoint, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password })
    // }).then(res => res.json())

    // Mock successful login
    const mockUser: User = {
      name: "John Doe",
      email,
      accountNumber: "1234567890",
      accountId: "acc_123456",
      role,
    }

    localStorage.setItem("banksmartToken", "mock-jwt-token")
    localStorage.setItem("banksmartUser", JSON.stringify(mockUser))

    setUser(mockUser)
    return Promise.resolve({ success: true })
  }

  const logout = () => {
    localStorage.removeItem("banksmartToken")
    localStorage.removeItem("banksmartUser")
    setUser(null)
    router.push("/login")
  }

  const register = (userData: {
    name: string
    email: string
    password: string
    accountNumber: string
    startingBalance: string
  }) => {
    // In a real app, you would call the API endpoint
    // return fetch('/api/users/register', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(userData)
    // }).then(res => res.json())

    // Mock successful registration
    return Promise.resolve({ success: true })
  }

  return {
    user,
    isLoading,
    login,
    logout,
    register,
    isAuthenticated: !!user,
  }
}
