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
import { useAuth } from "@/lib/auth-context"

// Types
interface AccountDetails {
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

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, logout } = useAuth()
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  // Action form states
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [transferAmount, setTransferAmount] = useState("")
  const [receiverId, setReceiverId] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Fetch account details, balance, and transactions
    fetchAccountData(user.accountNumber)
  }, [user, router])

  const fetchAccountData = async (accountNumber: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const [details, balanceData, transactionsData] = await Promise.allSettled([
        getAccountDetails(accountNumber),
        getAccountBalance(accountNumber),
        getTransactions(accountNumber)
      ])
  
      // Handle each promise result individually
      if (details.status === 'fulfilled') {
        setAccountDetails(details.value)
      }
      
      if (balanceData.status === 'fulfilled') {
        setBalance(balanceData.value)
      }
      
      if (transactionsData.status === 'fulfilled') {
        setTransactions(transactionsData.value || [])
      }
  
      // Check if any requests failed
      const failures = [details, balanceData, transactionsData].filter(
        result => result.status === 'rejected'
      )
  
      if (failures.length > 0) {
        const errorMessage = failures
          .map(failure => (failure.status === 'rejected' ? failure.reason.message : ''))
          .join('. ')
        
        setError(errorMessage)
        toast({
          title: "Some data couldn't be loaded",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch account data'
      setError(message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
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
      const transaction = await depositFunds(user?.accountNumber || 0, { amount })
      
      // Update balance
      setBalance((balance || 0) + amount)
      
      // Add new transaction to the list
      setTransactions([transaction, ...transactions])

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
      const transaction = await withdrawFunds(user?.accountNumber || 0, { amount })
      
      // Update balance
      setBalance((balance || 0) - amount)
      
      // Add new transaction to the list
      setTransactions([transaction, ...transactions])

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
        description: "Please enter a receiver account number.",
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
      const transaction = await transferFunds(
        user?.accountNumber || 0,
        Number(receiverId),
        { amount }
      )
      
      // Update balance
      setBalance((balance || 0) - amount)
      
      // Add new transaction to the list
      setTransactions([transaction, ...transactions])

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

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          <LogOutIcon className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              <p className="font-medium">Error loading account data</p>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Overview</CardTitle>
                  <CardDescription>Your account details and current balance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Account Number</p>
                      <p className="font-medium">{accountDetails?.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Initial Balance</p>
                      <p className="font-medium">${accountDetails?.balance.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">${balance?.toFixed(2)}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your recent account activity</CardDescription>
                </CardHeader>
                <CardContent>
                  {!transactions || transactions.length === 0 ? (
                    <p className="text-center text-muted-foreground">No transactions yet</p>
                  ) : (
                    <div className="space-y-4">
                      {transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            {transaction.transactionType === "Deposit" ? (
                              <ArrowDownIcon className="h-6 w-6 text-green-500" />
                            ) : transaction.transactionType === "Withdrawal" ? (
                              <ArrowUpIcon className="h-6 w-6 text-red-500" />
                            ) : (
                              <ArrowRightIcon className="h-6 w-6 text-blue-500" />
                            )}
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(transaction.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-medium ${
                                transaction.transactionType === "Deposit"
                                  ? "text-green-500"
                                  : transaction.transactionType === "Withdrawal"
                                  ? "text-red-500"
                                  : "text-blue-500"
                              }`}
                            >
                              {transaction.transactionType === "Deposit" ? "+" : "-"}${Math.abs(
                                transaction.amount
                              ).toFixed(2)}
                            </p>
                            {transaction.receiver && (
                              <p className="text-sm text-muted-foreground">
                                To: {transaction.receiver.accountNumber}
                              </p>
                            )}
                            {transaction.sender && (
                              <p className="text-sm text-muted-foreground">
                                From: {transaction.sender.accountNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Actions</CardTitle>
                  <CardDescription>Deposit, withdraw, or transfer funds</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Deposit Funds</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        disabled={actionLoading}
                      />
                      <Button onClick={handleDeposit} disabled={actionLoading}>
                        Deposit
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Withdraw Funds</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        disabled={actionLoading}
                      />
                      <Button onClick={handleWithdraw} disabled={actionLoading}>
                        Withdraw
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Transfer Funds</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        disabled={actionLoading}
                      />
                      <Input
                        type="number"
                        placeholder="Receiver Account"
                        value={receiverId}
                        onChange={(e) => setReceiverId(e.target.value)}
                        disabled={actionLoading}
                      />
                      <Button onClick={handleTransfer} disabled={actionLoading}>
                        Transfer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
