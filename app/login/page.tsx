"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { loginAdmin, loginUser } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("user")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"

    if (!formData.password) newErrors.password = "Password is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Update the handleSubmit function to completely bypass API calls in development/preview mode
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // DEVELOPMENT MODE: Always use mock data for login in preview/development
      // In a production environment, you would remove this mock data approach
      const mockUserData = {
        token: "mock-token",
        name: activeTab === "user" ? "Test User" : "Admin User",
        accountNumber: activeTab === "user" ? "1234567890" : "9876543210",
        accountId: activeTab === "user" ? "acc_123456" : "acc_admin",
      }

      // Store token in localStorage
      localStorage.setItem("financeFlowToken", mockUserData.token)

      // Store user info
      localStorage.setItem(
        "financeFlowUser",
        JSON.stringify({
          name: mockUserData.name,
          email: formData.email,
          accountNumber: mockUserData.accountNumber,
          accountId: mockUserData.accountId,
          role: activeTab,
        }),
      )

      // Show development mode notification
      toast({
        title: "Development Mode",
        description: "Logged in with mock data. API connection not required in preview mode.",
      })

      // Redirect to dashboard
      router.push("/dashboard")

      // Optional: Try to call the API in the background, but don't wait for it or let it block the login
      if (activeTab === "user") {
        loginUser(formData.email, formData.password).catch((error) => {
          console.warn("Background API login attempt failed:", error)
        })
      } else {
        loginAdmin(formData.email, formData.password).catch((error) => {
          console.warn("Background API admin login attempt failed:", error)
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen max-w-screen-md flex-col items-center justify-center py-12">
      <Link href="/" className="mb-8 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to home
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="user" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user">User</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
            <TabsContent value="user">
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="#" className="text-xs font-medium text-teal-600 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>

                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>

                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="font-medium text-teal-600 hover:underline">
                    Create one
                  </Link>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="admin">
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Admin Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="#" className="text-xs font-medium text-teal-600 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>

                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in as Admin"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
