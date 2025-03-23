"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartTooltipContent } from "@/components/ui/chart-tooltip"
import { ChartContainer } from "@/components/ui/chart-container"
import { useCategories } from "@/hooks/use-categories"
import { formatCurrency } from "@/lib/utils"
import { chartColors } from "@/lib/themes"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface FinancialChartsProps {
  monthlyData?: Array<{
    name: string
    income: number
    expenses: number
  }>
  weeklyData?: Array<{
    name: string
    income: number
    expenses: number
  }>
  dailyData?: Array<{
    name: string
    income: number
    expenses: number
  }>
  categoryData?: Array<{
    name: string
    value: number
  }>
}

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}

export function FinancialCharts({
  monthlyData = [],
  weeklyData = [],
  dailyData = [],
  categoryData = [],
}: FinancialChartsProps) {
  const [period, setPeriod] = useState("monthly")
  const { getCategoryById } = useCategories()
  const [chartHeight, setChartHeight] = useState(300)
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const { width } = useWindowSize()
  const isMobile = width < 640
  const isTablet = width >= 640 && width < 1024

  // Ajustar altura dos gráficos com base no tamanho da tela
  useEffect(() => {
    if (isMobile) {
      setChartHeight(250)
    } else if (isTablet) {
      setChartHeight(300)
    } else {
      setChartHeight(350)
    }
  }, [isMobile, isTablet])

  const data = period === "monthly" ? monthlyData : period === "weekly" ? weeklyData : dailyData

  return (
    <div className="flex flex-col gap-4">
      <Card className="w-full">
        <CardHeader className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>Entradas vs. Saídas</CardTitle>
            <CardDescription>Comparativo de receitas e despesas</CardDescription>
          </div>
          <Tabs defaultValue="monthly" value={period} onValueChange={setPeriod}>
            <TabsList className="grid w-[180px] grid-cols-3">
              <TabsTrigger value="monthly">Mês</TabsTrigger>
              <TabsTrigger value="weekly">Sem</TabsTrigger>
              <TabsTrigger value="daily">Dia</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <ChartContainer className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{
                  top: 10,
                  right: 10,
                  left: isMobile ? -20 : 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                  tickFormatter={(value) => {
                    if (isMobile) {
                      if (period === "monthly") {
                        return value.split(" ")[0] // Apenas o mês
                      } else if (period === "weekly") {
                        return value.substring(0, 1) // Primeira letra
                      } else if (period === "daily") {
                        // Para visualização diária em dispositivos móveis, mostrar apenas algumas horas
                        return value.substring(0, 2) // Apenas as horas
                      }
                    }
                    return value
                  }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    if (isMobile) {
                      if (value >= 1000000) {
                        return `${(value / 1000000).toFixed(1)}M`
                      } else if (value >= 1000) {
                        return `${(value / 1000).toFixed(0)}K`
                      }
                    }
                    return value
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stackId="1" 
                  stroke={isDark ? chartColors.income.dark : chartColors.income.light}
                  fill={isDark ? chartColors.income.dark : chartColors.income.light}
                  name="Entradas"
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stackId="2" 
                  stroke={isDark ? chartColors.expenses.dark : chartColors.expenses.light}
                  fill={isDark ? chartColors.expenses.dark : chartColors.expenses.light}
                  name="Saídas"
                />
                <Legend 
                  wrapperStyle={{ fontSize: 12 }}
                  verticalAlign="bottom"
                  height={36}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
            <CardDescription>Distribuição de despesas</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, left: isMobile ? -20 : 0, bottom: 0 }}>
                  <Pie
                    data={categoryData.map((item) => ({
                      ...item,
                      name: getCategoryById(item.name).name,
                      color: getCategoryById(item.name).color,
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={isMobile ? 80 : 100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => {
                      if (isMobile) {
                        return `${((percent || 0) * 100).toFixed(0)}%`
                      }
                      return `${name || ""}: ${((percent || 0) * 100).toFixed(0)}%`
                    }}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getCategoryById(entry.name).color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CategoryTooltip />} />
                  <Legend 
                    wrapperStyle={{ fontSize: 12 }}
                    verticalAlign="bottom"
                    height={36}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Balanço Mensal</CardTitle>
            <CardDescription>Saldo líquido por mês</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={monthlyData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: isMobile ? -20 : 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                    tickFormatter={(value) => {
                      if (isMobile) {
                        return value.split(" ")[0] // Apenas o mês
                      }
                      return value
                    }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      if (isMobile) {
                        if (value >= 1000000) {
                          return `${(value / 1000000).toFixed(1)}M`
                        } else if (value >= 1000) {
                          return `${(value / 1000).toFixed(0)}K`
                        }
                      }
                      return value
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ fontSize: 12 }}
                    verticalAlign="bottom"
                    height={36}
                  />
                  <Bar 
                    dataKey="income" 
                    name="Entradas" 
                    fill={isDark ? chartColors.income.dark : chartColors.income.light}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="expenses" 
                    name="Saídas" 
                    fill={isDark ? chartColors.expenses.dark : chartColors.expenses.light}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function CustomTooltip(props: any) {
  const { active, payload, label } = props || {}
  const { theme } = useTheme()
  const isDark = theme === "dark"

  if (!active || !payload || !Array.isArray(payload) || payload.length === 0) {
    return null
  }

  return (
    <ChartTooltipContent>
      <div className="font-medium">{label}</div>
      <div className="flex flex-col gap-0.5">
        {payload[0] && (
          <div className="flex items-center">
            <div 
              className="h-2 w-2 rounded-full mr-1" 
              style={{ backgroundColor: isDark ? chartColors.income.dark : chartColors.income.light }}
            />
            <span className="text-sm text-muted-foreground">Entradas: </span>
            <span className="ml-1 font-medium" style={{ color: isDark ? chartColors.income.dark : chartColors.income.light }}>
              {formatCurrency(payload[0].value !== undefined ? payload[0].value : 0)}
            </span>
          </div>
        )}
        {payload[1] && (
          <div className="flex items-center">
            <div 
              className="h-2 w-2 rounded-full mr-1" 
              style={{ backgroundColor: isDark ? chartColors.expenses.dark : chartColors.expenses.light }}
            />
            <span className="text-sm text-muted-foreground">Saídas: </span>
            <span className="ml-1 font-medium" style={{ color: isDark ? chartColors.expenses.dark : chartColors.expenses.light }}>
              {formatCurrency(payload[1].value !== undefined ? payload[1].value : 0)}
            </span>
          </div>
        )}
      </div>
    </ChartTooltipContent>
  )
}

function CategoryTooltip(props: any) {
  const { active, payload } = props || {}

  if (!active || !payload || !Array.isArray(payload) || payload.length === 0) {
    return null
  }

  const data = payload[0].payload

  return (
    <ChartTooltipContent>
      <div className="font-medium">{data.name}</div>
      <div className="flex items-center mt-1">
        <span className="text-sm text-muted-foreground">Valor: </span>
        <span className="ml-1 font-medium">{formatCurrency(data.value)}</span>
      </div>
    </ChartTooltipContent>
  )
}

