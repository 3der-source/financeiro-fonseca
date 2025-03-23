"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFinancialAnalysis } from "@/hooks/use-financial-analysis"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export function FinancialAnalysis() {
  const analysis = useFinancialAnalysis()

  // Se não houver dados, mostrar um estado de carregamento
  if (!analysis.periodData.monthly.income && !analysis.periodData.monthly.expenses) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Médias Financeiras</CardTitle>
            <CardDescription>Análise de gastos e ganhos</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendências</CardTitle>
            <CardDescription>Análise comparativa</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Médias Financeiras</CardTitle>
          <CardDescription>Análise de gastos e ganhos</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monthly">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
              <TabsTrigger value="weekly">Semanal</TabsTrigger>
              <TabsTrigger value="daily">Diária</TabsTrigger>
            </TabsList>
            <TabsContent value="monthly" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Média de Ganhos</div>
                  <div className="text-2xl font-bold text-emerald-500">
                    {formatCurrency(analysis.periodData.monthly.income)}
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Média de Gastos</div>
                  <div className="text-2xl font-bold text-red-500">
                    {formatCurrency(analysis.periodData.monthly.expenses)}
                  </div>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium text-muted-foreground">Saldo Médio</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(analysis.periodData.monthly.balance)}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Baseado nos últimos 6 meses</div>
              </div>
            </TabsContent>
            <TabsContent value="weekly" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Média de Ganhos</div>
                  <div className="text-2xl font-bold text-emerald-500">
                    {formatCurrency(analysis.periodData.weekly.income)}
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Média de Gastos</div>
                  <div className="text-2xl font-bold text-red-500">
                    {formatCurrency(analysis.periodData.weekly.expenses)}
                  </div>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium text-muted-foreground">Saldo Médio</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(analysis.periodData.weekly.balance)}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Baseado nas últimas 4 semanas</div>
              </div>
            </TabsContent>
            <TabsContent value="daily" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Média de Ganhos</div>
                  <div className="text-2xl font-bold text-emerald-500">
                    {formatCurrency(analysis.periodData.daily.income)}
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Média de Gastos</div>
                  <div className="text-2xl font-bold text-red-500">
                    {formatCurrency(analysis.periodData.daily.expenses)}
                  </div>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium text-muted-foreground">Saldo Médio</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(analysis.periodData.daily.balance)}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Baseado nos últimos 30 dias</div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tendências</CardTitle>
          <CardDescription>Análise comparativa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-3">
            <div className="text-sm font-medium">Categoria com Maior Gasto</div>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-medium">{analysis.topExpenseCategory.name || "Nenhuma"}</span>
              <span className="text-red-500 font-bold">
                {formatCurrency(analysis.topExpenseCategory.amount)}
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Representa {formatPercentage(analysis.topExpenseCategory.percentage)} dos seus gastos mensais
            </div>
          </div>

          <div className="rounded-lg border p-3">
            <div className="text-sm font-medium">Maior Economia</div>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-medium">{analysis.biggestSaving.name}</span>
              <span className="text-emerald-500 font-bold">
                {analysis.biggestSaving.percentage > 0 ? formatPercentage(analysis.biggestSaving.percentage) : "0%"}
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Em comparação com o mês anterior</div>
          </div>

          <div className="rounded-lg border p-3">
            <div className="text-sm font-medium">Maior Aumento</div>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-medium">{analysis.biggestIncrease.name}</span>
              <span className="text-red-500 font-bold">
                {analysis.biggestIncrease.percentage > 0 ? "+" + formatPercentage(analysis.biggestIncrease.percentage) : "0%"}
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Em comparação com o mês anterior</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 