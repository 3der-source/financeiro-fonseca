"use client"

import { useState, useEffect, useMemo } from "react"
import { createClientComponentClient } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { calculatePercentageChange } from "@/lib/utils"
import type { Transaction } from "@/types/transaction"
import { toast } from "sonner"
import { useToast } from "@/components/ui/use-toast"
import { useCategories } from "@/hooks/use-categories"
import { addDays } from "date-fns"

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [balance, setBalance] = useState(0)
  const [income, setIncome] = useState(0)
  const [expenses, setExpenses] = useState(0)
  const [incomeChange, setIncomeChange] = useState(0)
  const [expensesChange, setExpensesChange] = useState(0)
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [dailyData, setDailyData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])

  const { user } = useAuth()
  const supabase = createClientComponentClient()

  // Número de pagamentos pendentes nos próximos 7 dias
  const pendingCount = useMemo(() => {
    return transactions.filter(t => {
      if (!t.isScheduled || t.status !== "pending") return false;
      
      // Criar a data usando o formato yyyy-MM-dd e definir hora para meio-dia
      // para evitar problemas de fuso horário
      const dateParts = t.date.split('-');
      if (dateParts.length === 3) {
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // Mês em JS é 0-11
        const day = parseInt(dateParts[2]);
        
        // Usar UTC para evitar ajustes de fuso horário que podem alterar o dia
        const date = new Date(Date.UTC(year, month, day, 12, 0, 0));
        const now = new Date();
        const sevenDaysFromNow = addDays(now, 7);
        
        return date <= sevenDaysFromNow;
      }
      return false;
    }).length;
  }, [transactions])

  // Carregar transações do banco de dados
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return

      setIsLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false })

        if (error) {
          throw error
        }

        const formattedTransactions: Transaction[] = data.map((t) => ({
          id: t.id,
          userId: t.user_id,
          name: t.name,
          description: t.notes || "",
          value: t.amount,
          type: t.amount > 0 ? "income" as const : "expense" as const,
          date: t.date,
          categoryId: t.category_id || "outros",
          method: t.payment_method,
          isScheduled: t.is_scheduled || false,
          status: t.status || "paid",
          createdAt: t.created_at,
          updatedAt: t.updated_at
        }))

        // Separar transações normais e agendadas
        const normalTransactions = formattedTransactions.filter(
          t => !t.isScheduled || t.status === "paid"
        )

        setTransactions(formattedTransactions)
        calculateFinancialData(normalTransactions) // Calcular dados apenas com transações normais e pagas
      } catch (err: any) {
        console.error("Erro ao carregar transações:", err)
        setError(err.message)
        toast.error("Erro ao carregar transações", {
          description: err.message || "Não foi possível carregar suas transações.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [user, supabase])

  // Calcular dados financeiros (apenas transações normais e pagas)
  const calculateFinancialData = (transactions: Transaction[]) => {
    try {
      if (!Array.isArray(transactions) || transactions.length === 0) {
        setBalance(0)
        setIncome(0)
        setExpenses(0)
        setIncomeChange(0)
        setExpensesChange(0)
        setMonthlyData([])
        setWeeklyData([])
        setDailyData([])
        setCategoryData([])
        return
      }

      // Obter mês e ano atual
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear

      // Filtrar transações do mês atual e anterior (apenas normais e pagas)
      const currentMonthTransactions = transactions.filter((t) => {
        // Criar a data usando o formato yyyy-MM-dd e definir hora para meio-dia
        // para evitar problemas de fuso horário
        const dateParts = t.date.split('-');
        if (dateParts.length === 3) {
          const year = parseInt(dateParts[0]);
          const month = parseInt(dateParts[1]) - 1; // Mês em JS é 0-11
          const day = parseInt(dateParts[2]);
          
          // Usar UTC para evitar ajustes de fuso horário que podem alterar o dia
          const date = new Date(Date.UTC(year, month, day, 12, 0, 0));
          return date.getUTCMonth() === currentMonth && 
                 date.getUTCFullYear() === currentYear;
        }
        return false;
      });

      const previousMonthTransactions = transactions.filter((t) => {
        // Criar a data usando o formato yyyy-MM-dd e definir hora para meio-dia
        // para evitar problemas de fuso horário
        const dateParts = t.date.split('-');
        if (dateParts.length === 3) {
          const year = parseInt(dateParts[0]);
          const month = parseInt(dateParts[1]) - 1; // Mês em JS é 0-11
          const day = parseInt(dateParts[2]);
          
          // Usar UTC para evitar ajustes de fuso horário que podem alterar o dia
          const date = new Date(Date.UTC(year, month, day, 12, 0, 0));
          return date.getUTCMonth() === previousMonth && 
                 date.getUTCFullYear() === previousYear;
        }
        return false;
      });

      // Calcular totais para o mês atual
      let currentBalance = 0
      let currentIncome = 0
      let currentExpenses = 0

      currentMonthTransactions.forEach((transaction) => {
        if (transaction && typeof transaction.value === "number") {
          currentBalance += transaction.value

          if (transaction.type === "income") {
            currentIncome += transaction.value
          } else {
            currentExpenses += Math.abs(transaction.value)
          }
        }
      })

      // Calcular totais para o mês anterior
      let previousIncome = 0
      let previousExpenses = 0

      previousMonthTransactions.forEach((transaction) => {
        if (transaction && typeof transaction.value === "number") {
          if (transaction.type === "income") {
            previousIncome += transaction.value
          } else {
            previousExpenses += Math.abs(transaction.value)
          }
        }
      })

      // Atualizar estados
      setBalance(currentBalance)
      setIncome(currentIncome)
      setExpenses(currentExpenses)
      setIncomeChange(calculatePercentageChange(previousIncome, currentIncome))
      setExpensesChange(calculatePercentageChange(previousExpenses, currentExpenses))

      // Preparar dados para gráficos (apenas transações normais e pagas)
      prepareChartData(transactions)
    } catch (error) {
      console.error("Erro ao calcular dados financeiros:", error)
      setBalance(0)
      setIncome(0)
      setExpenses(0)
      setIncomeChange(0)
      setExpensesChange(0)
    }
  }

  // Preparar dados para os gráficos
  const prepareChartData = (transactions: Transaction[]) => {
    if (!Array.isArray(transactions) || transactions.length === 0) return

    try {
      // Dados mensais
      const monthlyMap = new Map()
      const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

      transactions.forEach((t) => {
        // Criar a data usando o formato yyyy-MM-dd e definir hora para meio-dia
        // para evitar problemas de fuso horário
        const dateParts = t.date.split('-');
        if (dateParts.length === 3) {
          const year = parseInt(dateParts[0]);
          const month = parseInt(dateParts[1]) - 1; // Mês em JS é 0-11
          const day = parseInt(dateParts[2]);
          
          // Usar UTC para evitar ajustes de fuso horário que podem alterar o dia
          const date = new Date(Date.UTC(year, month, day, 12, 0, 0));
          const monthYear = `${months[date.getMonth()]} ${date.getFullYear()}`

          if (!monthlyMap.has(monthYear)) {
            monthlyMap.set(monthYear, { name: monthYear, income: 0, expenses: 0 })
          }

          const data = monthlyMap.get(monthYear)
          if (t.value > 0) {
            data.income += t.value
          } else {
            data.expenses += Math.abs(t.value)
          }
        }
      })

      const monthlyDataArray = Array.from(monthlyMap.values())
      monthlyDataArray.sort((a, b) => {
        const [aMonth, aYear] = a.name.split(" ")
        const [bMonth, bYear] = b.name.split(" ")

        if (aYear !== bYear) return Number.parseInt(aYear) - Number.parseInt(bYear)
        return months.indexOf(aMonth) - months.indexOf(bMonth)
      })

      setMonthlyData(monthlyDataArray.slice(-7)) // Últimos 7 meses

      // Dados semanais
      const now = new Date()
      const oneWeekAgo = new Date(now)
      oneWeekAgo.setDate(now.getDate() - 7)
      
      // Incluir uma semana à frente para transações futuras
      const oneWeekAhead = new Date(now)
      oneWeekAhead.setDate(now.getDate() + 7)

      const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
      const weeklyMap = new Map(weekDays.map(day => [day, { name: day, income: 0, expenses: 0 }]))

      transactions.forEach((t) => {
        // Criar a data usando o formato yyyy-MM-dd e definir hora para meio-dia
        // para evitar problemas de fuso horário
        const dateParts = t.date.split('-');
        if (dateParts.length === 3) {
          const year = parseInt(dateParts[0]);
          const month = parseInt(dateParts[1]) - 1; // Mês em JS é 0-11
          const day = parseInt(dateParts[2]);
          
          // Usar UTC para evitar ajustes de fuso horário que podem alterar o dia
          const date = new Date(Date.UTC(year, month, day, 12, 0, 0));
          
          // Verificar se a transação está no período de uma semana para trás ou uma semana à frente
          if (date >= oneWeekAgo && date <= oneWeekAhead) {
            // Usar getUTCDay para obter o dia da semana em UTC
            const dayName = weekDays[date.getUTCDay()]
            const data = weeklyMap.get(dayName)!
            if (t.value > 0) {
              data.income += t.value
            } else {
              data.expenses += Math.abs(t.value)
            }
          }
        }
      })

      setWeeklyData(Array.from(weeklyMap.values()))

      // Dados diários (últimas 24 horas)
      const oneDayAgo = new Date(now)
      oneDayAgo.setHours(now.getHours() - 24)
      
      // Para visualização diária, agora vamos considerar também transações futuras
      // Vamos mostrar dados do dia atual por padrão
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      
      // Também incluiremos transações dos próximos 7 dias
      const endOfForecast = new Date(now);
      endOfForecast.setDate(endOfForecast.getDate() + 7);

      // Criar hora para cada hora do dia
      const hourlyMap = new Map()
      for (let i = 0; i < 24; i++) {
        const hourStr = `${i.toString().padStart(2, "0")}:00`
        hourlyMap.set(hourStr, { name: hourStr, income: 0, expenses: 0 })
      }

      transactions.forEach((t) => {
        // Extrair a parte de data da string de data
        const dateParts = t.date.split('-');
        if (dateParts.length === 3) {
          const year = parseInt(dateParts[0]);
          const month = parseInt(dateParts[1]) - 1; // Mês em JS é 0-11
          const day = parseInt(dateParts[2]);
          
          // Obter a hora real da transação do banco de dados
          // Tentar extrair a hora da string de data completa (formato ISO)
          let hours = 12; // Padrão para meio-dia
          
          // Se a data inclui informação de hora (formato ISO)
          if (t.createdAt) {
            const createdDate = new Date(t.createdAt);
            if (!isNaN(createdDate.getTime())) {
              hours = createdDate.getHours();
            }
          }
          
          // Usar UTC para evitar ajustes de fuso horário que podem alterar o dia
          const date = new Date(Date.UTC(year, month, day, hours, 0, 0));
          
          // Verificar se a transação é do dia atual OU é uma transação futura dentro de 7 dias
          // Para dia atual, mostramos todas as transações do dia
          const today = new Date();
          const isSameYear = date.getUTCFullYear() === today.getUTCFullYear();
          const isSameMonth = date.getUTCMonth() === today.getUTCMonth();
          const isSameDay = date.getUTCDate() === today.getUTCDate();
          const isToday = isSameYear && isSameMonth && isSameDay;
          
          // Para transações futuras, só mostramos as programadas
          const isFuture = date > now && date <= endOfForecast && t.isScheduled;
          
          if (isToday || isFuture) {
            const hour = date.getUTCHours();
            const hourStr = `${hour.toString().padStart(2, "0")}:00`;
            
            if (hourlyMap.has(hourStr)) {
              const data = hourlyMap.get(hourStr)!;
              if (t.value > 0) {
                data.income += t.value;
              } else {
                data.expenses += Math.abs(t.value);
              }
            }
          }
        }
      });

      setDailyData(Array.from(hourlyMap.values()));

      // Dados por categoria
      const categoryMap = new Map()

      transactions.forEach((t) => {
        if (t.value < 0) { // Apenas despesas
          if (!categoryMap.has(t.categoryId)) {
            categoryMap.set(t.categoryId, { name: t.categoryId, value: 0 })
          }

          const data = categoryMap.get(t.categoryId)
          data.value += Math.abs(t.value)
        }
      })

      setCategoryData(Array.from(categoryMap.values()))
    } catch (error) {
      console.error("Erro ao preparar dados para gráficos:", error)
      setMonthlyData([])
      setWeeklyData([])
      setDailyData([])
      setCategoryData([])
    }
  }

  const addTransaction = async (transaction: Transaction) => {
    if (!user || !transaction) return false

    try {
      // Garantir que a data atual com hora seja usada para o registro
      const now = new Date();
      const createdAtISOString = now.toISOString();
      
      // Preservar a data exatamente como informada pelo usuário
      // sem tentar converter para objetos Date para evitar problemas de fuso horário
      let transactionDate = transaction.date;
      
      const newTransaction = {
        user_id: user.id,
        name: transaction.name,
        notes: transaction.description,
        amount: transaction.value,
        category_id: transaction.categoryId,
        date: transactionDate,
        payment_method: transaction.method,
        is_scheduled: transaction.isScheduled || false,
        status: transaction.status || "paid",
        created_at: createdAtISOString,
        updated_at: createdAtISOString
      }

      const { data, error } = await supabase
        .from("transactions")
        .insert(newTransaction)
        .select("*")
        .single()

      if (error) {
        throw error
      }

      const addedTransaction: Transaction = {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        description: data.notes || "",
        value: data.amount,
        type: data.amount > 0 ? "income" : "expense",
        date: data.date,
        categoryId: data.category_id || "outros",
        method: data.payment_method,
        isScheduled: data.is_scheduled || false,
        status: data.status || "paid",
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      // Atualizar o estado local
      const updatedTransactions = [addedTransaction, ...transactions]
      setTransactions(updatedTransactions)

      // Recalcular dados financeiros
      calculateFinancialData(updatedTransactions.filter(t => !t.isScheduled || t.status === "paid"))

      toast.success("Transação adicionada", {
        description: "Sua transação foi adicionada com sucesso.",
      })

      return true
    } catch (err: any) {
      console.error("Erro ao adicionar transação:", err)
      setError(err.message)
      toast.error("Erro ao adicionar transação", {
        description: err.message || "Não foi possível adicionar sua transação.",
      })
      return false
    }
  }

  const updateTransaction = async (updatedTransaction: Transaction) => {
    if (!user || !updatedTransaction || !updatedTransaction.id) return false

    try {
      // Preservar a data exatamente como informada pelo usuário
      // sem tentar converter para objetos Date para evitar problemas de fuso horário
      const transactionToUpdate = {
        name: updatedTransaction.name,
        notes: updatedTransaction.description,
        amount: updatedTransaction.value,
        category_id: updatedTransaction.categoryId,
        date: updatedTransaction.date,
        payment_method: updatedTransaction.method,
        is_scheduled: updatedTransaction.isScheduled || false,
        status: updatedTransaction.status || "paid",
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from("transactions")
        .update(transactionToUpdate)
        .eq("id", updatedTransaction.id)
        .eq("user_id", user.id)

      if (error) {
        throw error
      }

      const updatedTransactions = transactions.map((transaction) =>
        transaction.id === updatedTransaction.id ? updatedTransaction : transaction,
      )

      setTransactions(updatedTransactions)
      calculateFinancialData(updatedTransactions.filter(t => !t.isScheduled || t.status === "paid"))

      toast.success("Transação atualizada", {
        description: "Sua transação foi atualizada com sucesso.",
      })

      return true
    } catch (err: any) {
      console.error("Erro ao atualizar transação:", err)
      setError(err.message)
      toast.error("Erro ao atualizar transação", {
        description: err.message || "Não foi possível atualizar sua transação.",
      })
      return false
    }
  }

  const deleteTransaction = async (id: string) => {
    if (!user || !id) return false

    try {
      const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id)

      if (error) {
        throw error
      }

      const updatedTransactions = transactions.filter((transaction) => transaction.id !== id)
      setTransactions(updatedTransactions)
      calculateFinancialData(updatedTransactions.filter(t => !t.isScheduled || t.status === "paid"))

      toast.success("Transação excluída", {
        description: "Sua transação foi excluída com sucesso.",
      })

      return true
    } catch (err: any) {
      console.error("Erro ao excluir transação:", err)
      setError(err.message)
      toast.error("Erro ao excluir transação", {
        description: err.message || "Não foi possível excluir sua transação.",
      })
      return false
    }
  }

  // Função para atualizar os totais manualmente
  const updateTotals = (newIncome: number, newExpenses: number) => {
    setIncome(newIncome)
    setExpenses(newExpenses)
    setBalance(newIncome - newExpenses)
  }

  return {
    transactions,
    isLoading,
    error,
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
    updateTotals,
    pendingCount,
  }
}

