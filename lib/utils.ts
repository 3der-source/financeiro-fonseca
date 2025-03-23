import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatar valor como moeda brasileira
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

// Formatar percentual
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100)
}

// Gerar cor aleatória para categorias
export function generateRandomColor(): string {
  const colors = [
    "#F44336",
    "#E91E63",
    "#9C27B0",
    "#673AB7",
    "#3F51B5",
    "#2196F3",
    "#03A9F4",
    "#00BCD4",
    "#009688",
    "#4CAF50",
    "#8BC34A",
    "#CDDC39",
    "#FFC107",
    "#FF9800",
    "#FF5722",
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// Calcular variação percentual
export function calculatePercentageChange(previous: number, current: number): number {
  if (previous === 0) {
    if (current === 0) return 0;
    return 0; // Evitar mostrar variação quando não havia dados anteriores
  }
  return ((current - previous) / Math.abs(previous)) * 100
}

// Formatar métodos de pagamento
export function formatPaymentMethod(method: string): { name: string; icon: string } {
  switch (method) {
    case "credit_card":
      return { name: "Cartão de Crédito", icon: "💳" }
    case "debit_card":
      return { name: "Cartão de Débito", icon: "💳" }
    case "cash":
      return { name: "Dinheiro", icon: "💵" }
    case "pix":
      return { name: "PIX", icon: "⚡" }
    case "transfer":
      return { name: "Transferência", icon: "🏦" }
    case "boleto":
      return { name: "Boleto", icon: "📄" }
    default:
      return { name: method, icon: "💰" }
  }
}

