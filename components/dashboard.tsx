"use client"

import { useState, useMemo } from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  CreditCardIcon,
  DollarSignIcon,
  FilterIcon,
  PlusIcon,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionDialog } from "@/components/transaction-dialog"
import { TransactionTable } from "@/components/transaction-table"
import { FilterDialog } from "@/components/filter-dialog"
import { FinancialCharts } from "@/components/financial-charts"
import { CategoryManager } from "@/components/category-manager"
import { NotificationDropdown } from "@/components/notification-dropdown"
import { UserDropdown } from "@/components/user-dropdown"
import { useTransactions } from "@/hooks/use-transactions"
import { useCategories } from "@/hooks/use-categories"
import { useNotifications } from "@/hooks/use-notifications"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import type { Transaction } from "@/types/transaction"
import { ThemeToggle } from "@/components/theme-toggle"
import { FinancialAnalysis } from "@/components/financial-analysis"

export default function Dashboard() {
  const [showTransactionDialog, setShowTransactionDialog] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>()

  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    balance,
    income,
    expenses,
    incomeChange,
    expensesChange,
    monthlyData,
    weeklyData,
    dailyData,
    categoryData,
    isLoading,
    pendingCount,
  } = useTransactions()

  const handleAddTransaction = async (transaction: Transaction) => {
    await addTransaction(transaction)
  }

  const handleUpdateTransaction = async (transaction: Transaction) => {
    await updateTransaction(transaction)
    setEditingTransaction(undefined)
  }

  const handleDeleteTransaction = async (transaction: Transaction) => {
    await deleteTransaction(transaction.id)
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowTransactionDialog(true)
  }

  const handleStatusChange = async (transaction: Transaction, newStatus: "pending" | "paid" | "cancelled") => {
    await updateTransaction({
      ...transaction,
      status: newStatus
    })
  }

  const currentDate = format(new Date(), "MMMM yyyy", { locale: ptBR })

  const handleTransactionDialogChange = (open: boolean) => {
    setShowTransactionDialog(open);
    if (!open) {
      setEditingTransaction(undefined);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <DollarSignIcon className="h-6 w-6" />
          <h1 className="text-lg font-semibold">Finanças Pessoais</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden md:flex" onClick={() => setShowCategoryManager(true)}>
            Gerenciar Categorias
          </Button>
          <ThemeToggle />
          <NotificationDropdown />
          <UserDropdown />
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-4">
          <h1 className="flex-1 text-2xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="md:hidden" onClick={() => setShowCategoryManager(true)}>
              Categorias
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => setShowFilterDialog(true)}>
              <FilterIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filtrar</span>
            </Button>
            <Button
              size="sm"
              className="h-8 gap-1"
              onClick={() => {
                setEditingTransaction(undefined)
                setShowTransactionDialog(true)
              }}
            >
              <PlusIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Nova Transação</span>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
              <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
              <p className="text-xs text-muted-foreground">{currentDate}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entradas</CardTitle>
              <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">{formatCurrency(income)}</div>
              <p className="text-xs text-muted-foreground">
                {incomeChange === 0 ? (
                  "Primeiro mês com transações"
                ) : (
                  <span>
                    <span className={incomeChange > 0 ? "text-emerald-500" : incomeChange < 0 ? "text-red-500" : ""}>
                      {incomeChange > 0 ? "+" : ""}
                      {formatPercentage(incomeChange)}
                    </span>{" "}
                    em relação ao mês anterior
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saídas</CardTitle>
              <ArrowDownIcon className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{formatCurrency(expenses)}</div>
              <p className="text-xs text-muted-foreground">
                {expensesChange === 0 ? (
                  "Primeiro mês com transações"
                ) : (
                  <span>
                    <span className={expensesChange > 0 ? "text-red-500" : expensesChange < 0 ? "text-emerald-500" : ""}>
                      {expensesChange > 0 ? "+" : ""}
                      {formatPercentage(expensesChange)}
                    </span>{" "}
                    em relação ao mês anterior
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
              <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Próximos 7 dias</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <FinancialCharts
              monthlyData={monthlyData}
              weeklyData={weeklyData}
              dailyData={dailyData}
              categoryData={categoryData}
            />
            <TransactionTable
              transactions={transactions.slice(0, Math.min(5, transactions.length))}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              onStatusChange={handleStatusChange}
            />
          </TabsContent>
          <TabsContent value="transactions" className="space-y-4">
            <TransactionTable
              transactions={transactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              onStatusChange={handleStatusChange}
            />
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <FinancialAnalysis />
          </TabsContent>
        </Tabs>
      </main>

      <TransactionDialog
        open={showTransactionDialog}
        onOpenChange={handleTransactionDialogChange}
        onSave={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
        editTransaction={editingTransaction}
      />

      <FilterDialog
        open={showFilterDialog}
        onOpenChange={setShowFilterDialog}
      />

      <CategoryManager
        open={showCategoryManager}
        onOpenChange={setShowCategoryManager}
      />
    </div>
  )
}

