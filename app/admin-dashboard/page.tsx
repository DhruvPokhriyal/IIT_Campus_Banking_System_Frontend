"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { getAllUsers, getAllTransactions } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LogOut, Users, History } from "lucide-react"

interface User {
  id: number
  name: string
  email: string
  accountNumber: number
  balance: number
  role: string
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

export default function AdminDashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("users")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("Admin Dashboard: Current user state:", { user })
    if (!user || user.role !== "admin") {
      console.log("Admin Dashboard: Not an admin, redirecting...")
      router.push("/dashboard")
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        console.log("Admin Dashboard: Starting data fetch...")
        console.log("Admin Dashboard: Auth token:", localStorage.getItem('financeFlowToken'))
        
        // Fetch users
        let usersData: User[] = []
        try {
          usersData = await getAllUsers()
          console.log("Admin Dashboard: Users fetched successfully:", usersData)
        } catch (error) {
          console.error("Admin Dashboard: Error fetching users:", error)
          toast.error("Failed to load users")
        }

        // Fetch transactions
        let transactionsData: Transaction[] = []
        try {
          transactionsData = await getAllTransactions()
          console.log("Admin Dashboard: Transactions fetched successfully:", transactionsData)
        } catch (error) {
          console.error("Admin Dashboard: Error fetching transactions:", error)
          toast.error("Failed to load transactions")
        }

        setUsers(usersData)
        setTransactions(transactionsData)
      } catch (error) {
        console.error("Admin Dashboard: General error:", error)
        setError("Failed to load data. Please try again later.")
        toast.error("Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, router])

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait while we fetch the data.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users and monitor transactions</p>
        </div>
        <Button variant="destructive" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Users ({users.length})
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center">
            <History className="mr-2 h-4 w-4" />
            Transactions ({transactions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Overview of all registered users in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No users found</p>
              ) : (
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted">
                      <tr>
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Account Number</th>
                        <th className="px-6 py-3">Balance</th>
                        <th className="px-6 py-3">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-muted">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 font-medium">{user.name}</td>
                          <td className="px-6 py-4">{user.email}</td>
                          <td className="px-6 py-4">{user.accountNumber}</td>
                          <td className="px-6 py-4">${user.balance.toFixed(2)}</td>
                          <td className="px-6 py-4 capitalize">{user.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>Overview of all transactions in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No transactions found</p>
              ) : (
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted">
                      <tr>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Description</th>
                        <th className="px-6 py-3">Sender</th>
                        <th className="px-6 py-3">Receiver</th>
                        <th className="px-6 py-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-muted">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 font-medium">{transaction.transactionType}</td>
                          <td className="px-6 py-4">${transaction.amount.toFixed(2)}</td>
                          <td className="px-6 py-4">{transaction.description}</td>
                          <td className="px-6 py-4">{transaction.sender?.accountNumber || "N/A"}</td>
                          <td className="px-6 py-4">{transaction.receiver?.accountNumber || "N/A"}</td>
                          <td className="px-6 py-4">{new Date(transaction.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 