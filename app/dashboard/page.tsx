"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CreditCardIcon,
  DollarSignIcon,
  LogOutIcon,
  UserIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  getAccountBalance,
  getAccountDetails,
  getTransactions,
  depositFunds,
  withdrawFunds,
  transferFunds,
} from "@/lib/api"

// Types
interface User {
  name: string
  email: string
  accountNumber: string
  accountId: string
  role: string
}

interface AccountDetails {
  accountNumber: string
  accountType: string
  status: string
  createdAt: string
}

interface Transaction {
  id: string
  type: "deposit" | "withdrawal" | "transfer"
  amount: number
  date: string
  description: string
  balance: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Action form states
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [transferAmount, setTransferAmount] = useState("")
  const [receiverId, setReceiverId] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("financeFlowToken")
    const userData = localStorage.getItem("financeFlowUser")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData) as User
    setUser(parsedUser)

    // Fetch account details, balance, and transactions
    fetchAccountData(parsedUser.accountNumber, parsedUser.accountId)
  }, [router])

  // Update the fetchAccountData function to always use mock data in development/preview mode
  const fetchAccountData = async (accountNumber: string, accountId: string) => {
    setIsLoading(true)

    try {
      // DEVELOPMENT MODE: Always use mock data in preview/development
      // In a production environment, you would remove this mock approach

      // Mock account details
      const mockDetails = {
        accountNumber,
        accountType: "Checking",
        status: "Active",
        createdAt: new Date().toISOString().split("T")[0],
      }
      setAccountDetails(mockDetails)

      // Mock balance
      const mockBalance = 5000
      setBalance(mockBalance)

      // Mock transactions
      const mockTransactions = [
        {
          id: "tx_1",
          type: "deposit" as const,
          amount: 1000,
          date: "2023-04-10",
          description: "Salary deposit",
          balance: 5000,
        },
        {
          id: "tx_2",
          type: "withdrawal" as const,
          amount: 200,
          date: "2023-04-08",
          description: "ATM withdrawal",
          balance: 4000,
        },
        {
          id: "tx_3",
          type: "transfer" as const,
          amount: 300,
          date: "2023-04-05",
          description: "Transfer to John",
          balance: 4200,
        },
      ]
      setTransactions(mockTransactions)

      // Optional: Try to fetch real data in the background, but don't wait for it
      try {
        getAccountDetails(accountNumber)
          .then((details) => {
            console.log("Background API account details fetch succeeded")
            setAccountDetails(details)
          })
          .catch((error) => {
            console.warn("Background API account details fetch failed:", error)
          })

        getAccountBalance(accountNumber)
          .then((balanceData) => {
            console.log("Background API balance fetch succeeded")
            setBalance(balanceData.balance)
          })
          .catch((error) => {
            console.warn("Background API balance fetch failed:", error)
          })

        getTransactions(accountId)
          .then((transactionsData) => {
            console.log("Background API transactions fetch succeeded")
            setTransactions(transactionsData)
          })
          .catch((error) => {
            console.warn("Background API transactions fetch failed:", error)
          })
      } catch (error) {
        console.warn("Background API data fetch setup failed:", error)
      }
    } catch (error) {
      console.error("Error setting up mock data:", error)
      toast({
        title: "Error",
        description: "Failed to set up dashboard data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("financeFlowToken")
    localStorage.removeItem("financeFlowUser")
    router.push("/login")
  }

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid deposit amount.",
        variant: "destructive",
      })
      return
    }

    setActionLoading(true)

    try {
      const amount = Number(depositAmount)

      // Call API to deposit funds
      await depositFunds(user?.accountId || "", amount)

      // Update balance and transactions
      const newBalance = (balance || 0) + amount
      setBalance(newBalance)

      const newTransaction: Transaction = {
        id: `tx_${Date.now()}`,
        type: "deposit",
        amount,
        date: new Date().toISOString().split("T")[0],
        description: "Deposit",
        balance: newBalance,
      }

      setTransactions([newTransaction, ...transactions])

      toast({
        title: "Deposit successful",
        description: `${amount.toFixed(2)} has been deposited to your account.`,
      })

      setDepositAmount("")
    } catch (error) {
      console.error("Deposit error:", error)
      toast({
        title: "Deposit failed",
        description: "There was an error processing your deposit. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive",
      })
      return
    }

    const amount = Number(withdrawAmount)

    if (amount > (balance || 0)) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough funds for this withdrawal.",
        variant: "destructive",
      })
      return
    }

    setActionLoading(true)

    try {
      // Call API to withdraw funds
      await withdrawFunds(user?.accountId || "", amount)

      // Update balance and transactions
      const newBalance = (balance || 0) - amount
      setBalance(newBalance)

      const newTransaction: Transaction = {
        id: `tx_${Date.now()}`,
        type: "withdrawal",
        amount,
        date: new Date().toISOString().split("T")[0],
        description: "Withdrawal",
        balance: newBalance,
      }

      setTransactions([newTransaction, ...transactions])

      toast({
        title: "Withdrawal successful",
        description: `${amount.toFixed(2)} has been withdrawn from your account.`,
      })

      setWithdrawAmount("")
    } catch (error) {
      console.error("Withdrawal error:", error)
      toast({
        title: "Withdrawal failed",
        description: "There was an error processing your withdrawal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleTransfer = async () => {
    if (!transferAmount || isNaN(Number(transferAmount)) || Number(transferAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid transfer amount.",
        variant: "destructive",
      })
      return
    }

    if (!receiverId) {
      toast({
        title: "Receiver required",
        description: "Please enter a receiver account ID.",
        variant: "destructive",
      })
      return
    }

    const amount = Number(transferAmount)

    if (amount > (balance || 0)) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough funds for this transfer.",
        variant: "destructive",
      })
      return
    }

    setActionLoading(true)

    try {
      // Call API to transfer funds
      await transferFunds(user?.accountId || "", receiverId, amount)

      // Update balance and transactions
      const newBalance = (balance || 0) - amount
      setBalance(newBalance)

      const newTransaction: Transaction = {
        id: `tx_${Date.now()}`,
        type: "transfer",
        amount,
        date: new Date().toISOString().split("T")[0],
        description: `Transfer to ${receiverId}`,
        balance: newBalance,
      }

      setTransactions([newTransaction, ...transactions])

      toast({
        title: "Transfer successful",
        description: `${amount.toFixed(2)} has been transferred to account ${receiverId}.`,
      })

      setTransferAmount("")
      setReceiverId("")
    } catch (error) {
      console.error("Transfer error:", error)
      toast({
        title: "Transfer failed",
        description: "There was an error processing your transfer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const getTransactionIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "deposit":
        return <ArrowDownIcon className="h-4 w-4 text-emerald-500" />
      case "withdrawal":
        return <ArrowUpIcon className="h-4 w-4 text-red-500" />
      case "transfer":
        return <ArrowRightIcon className="h-4 w-4 text-teal-500" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <div className="mb-8 flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>

        <div className="mt-8">
          <Skeleton className="mb-4 h-8 w-40" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold">
            <div className="rounded-full bg-teal-600 p-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-white"
              >
                <path d="M2 17h2v4h-2z" />
                <path d="M6 17h2v4H6z" />
                <path d="M10 17h2v4h-2z" />
                <path d="M14 17h2v4h-2z" />
                <path d="M18 17h2v4h-2z" />
                <path d="M4 21h16" />
                <path d="M4 3h16" />
                <path d="M12 21v-9" />
                <path d="M12 12V7" />
                <path d="M12 7H8" />
                <path d="M12 7h4" />
              </svg>
            </div>
            <span>FinanceFlow</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 md:flex">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{user?.name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOutIcon className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.name}. Here&apos;s an overview of your account.
              </p>
            </div>

            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            {/* Overview content */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
                  <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(balance || 0)}</div>
                  <p className="text-xs text-muted-foreground">Available for withdrawal or transfer</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Account Details</CardTitle>
                  <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{accountDetails?.accountNumber}</div>
                  <p className="text-xs text-muted-foreground">
                    {accountDetails?.accountType} • {accountDetails?.status}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setActiveTab("transactions")
                      }}
                    >
                      View All
                    </a>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {transactions.slice(0, 2).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(transaction.type)}
                          <div className="text-sm font-medium">{transaction.description}</div>
                        </div>
                        <div className="text-sm font-medium">{formatCurrency(transaction.amount)}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Manage your funds with ease</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 sm:flex-row">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="flex-1 bg-teal-600 hover:bg-teal-700">
                        <ArrowDownIcon className="mr-2 h-4 w-4" />
                        Deposit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Deposit Funds</DialogTitle>
                        <DialogDescription>Enter the amount you want to deposit into your account.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="deposit-amount">Amount</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input
                              id="deposit-amount"
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              className="pl-8"
                              value={depositAmount}
                              onChange={(e) => setDepositAmount(e.target.value)}
                              disabled={actionLoading}
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={handleDeposit}
                          disabled={actionLoading}
                          className="bg-teal-600 hover:bg-teal-700"
                        >
                          {actionLoading ? "Processing..." : "Deposit Funds"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        <ArrowUpIcon className="mr-2 h-4 w-4" />
                        Withdraw
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Withdraw Funds</DialogTitle>
                        <DialogDescription>Enter the amount you want to withdraw from your account.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="withdraw-amount">Amount</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input
                              id="withdraw-amount"
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              className="pl-8"
                              value={withdrawAmount}
                              onChange={(e) => setWithdrawAmount(e.target.value)}
                              disabled={actionLoading}
                            />
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Available balance: {formatCurrency(balance || 0)}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={handleWithdraw}
                          disabled={actionLoading}
                          className="bg-teal-600 hover:bg-teal-700"
                        >
                          {actionLoading ? "Processing..." : "Withdraw Funds"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transfer Money</CardTitle>
                  <CardDescription>Send money to another account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="receiver-id">Recipient Account ID</Label>
                    <Input
                      id="receiver-id"
                      placeholder="Enter account ID"
                      value={receiverId}
                      onChange={(e) => setReceiverId(e.target.value)}
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transfer-amount">Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="transfer-amount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-8"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        disabled={actionLoading}
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    onClick={handleTransfer}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Processing..." : "Transfer Funds"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>View all your recent transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center gap-4">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Transactions</SelectItem>
                      <SelectItem value="deposit">Deposits</SelectItem>
                      <SelectItem value="withdrawal">Withdrawals</SelectItem>
                      <SelectItem value="transfer">Transfers</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select defaultValue="newest">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="amount-high">Amount (High to Low)</SelectItem>
                      <SelectItem value="amount-low">Amount (Low to High)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {transactions.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                      <p className="text-muted-foreground">No transactions found</p>
                    </div>
                  ) : (
                    transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex flex-col justify-between rounded-lg border p-4 sm:flex-row sm:items-center"
                      >
                        <div className="flex items-center gap-4">
                          <div className="rounded-full bg-muted p-2">{getTransactionIcon(transaction.type)}</div>
                          <div>
                            <div className="font-medium">{transaction.description}</div>
                            <div className="text-sm text-muted-foreground">{transaction.date}</div>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-4 sm:mt-0">
                          <div className="text-right">
                            <div className="font-medium">
                              {transaction.type === "deposit" ? "+" : "-"}
                              {formatCurrency(transaction.amount)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Balance: {formatCurrency(transaction.balance)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Deposit Funds</CardTitle>
                  <CardDescription>Add money to your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deposit-amount-tab">Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="deposit-amount-tab"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-8"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        disabled={actionLoading}
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    onClick={handleDeposit}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Processing..." : "Deposit Funds"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Withdraw Funds</CardTitle>
                  <CardDescription>Take money from your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="withdraw-amount-tab">Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="withdraw-amount-tab"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-8"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        disabled={actionLoading}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">Available balance: {formatCurrency(balance || 0)}</div>
                  <Button
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    onClick={handleWithdraw}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Processing..." : "Withdraw Funds"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transfer Money</CardTitle>
                  <CardDescription>Send money to another account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="receiver-id-tab">Recipient Account ID</Label>
                    <Input
                      id="receiver-id-tab"
                      placeholder="Enter account ID"
                      value={receiverId}
                      onChange={(e) => setReceiverId(e.target.value)}
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transfer-amount-tab">Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="transfer-amount-tab"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-8"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        disabled={actionLoading}
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    onClick={handleTransfer}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Processing..." : "Transfer Funds"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
