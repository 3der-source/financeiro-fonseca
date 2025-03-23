"use client"

import { useMemo } from "react"
import { useTransactions } from "@/hooks/use-transactions"
import { useCategories } from "@/hooks/use-categories"
import { addDays, startOfDay, subDays, subMonths, subWeeks } from "date-fns"

interface PeriodData {
  income: number
  expenses: number
  balance: number
}

interface AnalysisData {
  periodData: {
    daily: PeriodData
    weekly: PeriodData
    monthly: PeriodData
  }
  topExpenseCategory: {
    name: string
    amount: number
    percentage: number
  }
  biggestSaving: {
    name: string
    percentage: number
  }
  biggestIncrease: {
    name: string
    percentage: number
  }
}

export function useFinancialAnalysis(): AnalysisData {
  const { transactions } = useTransactions()
  const { categories, getCategoryById } = useCategories()

  const periodData = useMemo(() => {
    const now = startOfDay(new Date())
    const lastMonth = subMonths(now, 1)
    const lastWeek = subWeeks(now, 1)
    const yesterday = subDays(now, 1)

    // Filtrar transações por período
    const monthlyTransactions = transactions.filter(t => 
      new Date(t.date) >= subMonths(now, 6) && 
      (!t.isScheduled || t.status === "paid")
    )
    const weeklyTransactions = transactions.filter(t => 
      new Date(t.date) >= subWeeks(now, 4) && 
      (!t.isScheduled || t.status === "paid")
    )
    const dailyTransactions = transactions.filter(t => 
      new Date(t.date) >= subDays(now, 30) && 
      (!t.isScheduled || t.status === "paid")
    )

    // Calcular médias por período
    const calculatePeriodData = (transactions: typeof monthlyTransactions, divisor: number): PeriodData => {
      const income = transactions.reduce((sum, t) => sum + (t.type === "income" ? t.value : 0), 0) / divisor
      const expenses = transactions.reduce((sum, t) => sum + (t.type === "expense" ? t.value : 0), 0) / divisor
      return {
        income,
        expenses,
        balance: income - expenses
      }
    }

    return {
      monthly: calculatePeriodData(monthlyTransactions, 6), // Média dos últimos 6 meses
      weekly: calculatePeriodData(weeklyTransactions, 4),   // Média das últimas 4 semanas
      daily: calculatePeriodData(dailyTransactions, 30),    // Média dos últimos 30 dias
    }
  }, [transactions])

  const topExpenseCategory = useMemo(() => {
    const currentMonthTransactions = transactions.filter(t => 
      new Date(t.date) >= subMonths(startOfDay(new Date()), 1) && 
      t.type === "expense" &&
      (!t.isScheduled || t.status === "paid")
    )

    const categoryExpenses = new Map<string, number>()
    let totalExpenses = 0

    currentMonthTransactions.forEach(t => {
      const categoryId = t.categoryId
      const value = Math.abs(t.value)
      const currentAmount = categoryExpenses.get(categoryId) || 0
      categoryExpenses.set(categoryId, currentAmount + value)
      totalExpenses += value
    })

    let maxAmount = 0
    let topCategoryId = ""

    categoryExpenses.forEach((amount, categoryId) => {
      if (amount > maxAmount) {
        maxAmount = amount
        topCategoryId = categoryId
      }
    })

    const category = getCategoryById(topCategoryId)

    return {
      name: category?.name || "Outros",
      amount: maxAmount,
      percentage: totalExpenses > 0 ? (maxAmount / totalExpenses) * 100 : 0
    }
  }, [transactions, getCategoryById])

  const { biggestSaving, biggestIncrease } = useMemo(() => {
    const now = startOfDay(new Date())
    const currentMonthTransactions = transactions.filter(t => 
      new Date(t.date) >= subMonths(now, 1) && 
      new Date(t.date) <= now &&
      t.type === "expense" &&
      (!t.isScheduled || t.status === "paid")
    )
    const lastMonthTransactions = transactions.filter(t => 
      new Date(t.date) >= subMonths(now, 2) && 
      new Date(t.date) < subMonths(now, 1) &&
      t.type === "expense" &&
      (!t.isScheduled || t.status === "paid")
    )

    const currentExpensesByCategory = new Map<string, number>()
    const lastExpensesByCategory = new Map<string, number>()

    // Calcular gastos do mês atual por categoria
    currentMonthTransactions.forEach(t => {
      const categoryId = t.categoryId
      const value = Math.abs(t.value)
      const currentAmount = currentExpensesByCategory.get(categoryId) || 0
      currentExpensesByCategory.set(categoryId, currentAmount + value)
    })

    // Calcular gastos do mês anterior por categoria
    lastMonthTransactions.forEach(t => {
      const categoryId = t.categoryId
      const value = Math.abs(t.value)
      const currentAmount = lastExpensesByCategory.get(categoryId) || 0
      lastExpensesByCategory.set(categoryId, currentAmount + value)
    })

    let maxSaving = 0
    let maxIncrease = 0
    let savingCategoryId = ""
    let increaseCategoryId = ""

    // Processar categorias do mês anterior
    lastExpensesByCategory.forEach((lastAmount, categoryId) => {
      const currentAmount = currentExpensesByCategory.get(categoryId) || 0
      
      // Só calcular se houve gasto no mês anterior
      if (lastAmount > 0) {
        const difference = (lastAmount - currentAmount) / lastAmount
        
        if (difference > maxSaving) {
          maxSaving = difference
          savingCategoryId = categoryId
        }
        
        if (difference < 0 && Math.abs(difference) > maxIncrease) {
          maxIncrease = Math.abs(difference)
          increaseCategoryId = categoryId
        }
      }
    })
    
    // Verificar categorias que só existem no mês atual (novos gastos)
    currentExpensesByCategory.forEach((currentAmount, categoryId) => {
      if (!lastExpensesByCategory.has(categoryId) && currentAmount > 0) {
        // Novo gasto sem histórico anterior - marcar como aumento de 100%
        if (maxIncrease < 1) {  // 1 = 100%
          maxIncrease = 1
          increaseCategoryId = categoryId
        }
      }
    })

    // Multiplicar por 100 para percentagem
    maxSaving = maxSaving * 100
    maxIncrease = maxIncrease * 100

    return {
      biggestSaving: {
        name: getCategoryById(savingCategoryId)?.name || "Outros",
        percentage: maxSaving
      },
      biggestIncrease: {
        name: getCategoryById(increaseCategoryId)?.name || "Outros",
        percentage: maxIncrease
      }
    }
  }, [transactions, getCategoryById])

  return {
    periodData,
    topExpenseCategory,
    biggestSaving,
    biggestIncrease
  }
} 