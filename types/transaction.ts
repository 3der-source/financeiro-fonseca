export interface Transaction {
  id: string
  userId: string
  name: string
  description?: string
  value: number
  type: "income" | "expense"
  date: string
  categoryId: string
  method: string
  isScheduled: boolean
  status: "paid" | "pending" | "cancelled"
  createdAt: string
  updatedAt: string
}

export interface ScheduledPayment {
  id: string
  name: string
  amount: number
  category_id: string
  payment_date: string
  payment_method: string
  status: "pending" | "paid" | "cancelled"
  notes?: string
}

export function mapScheduledPaymentToTransaction(payment: ScheduledPayment): Partial<Transaction> {
  return {
    id: payment.id,
    name: payment.name,
    value: -Math.abs(payment.amount), // Sempre será uma saída
    type: "expense",
    date: payment.payment_date,
    categoryId: payment.category_id,
    method: payment.payment_method,
    description: payment.notes,
    isScheduled: true,
    status: payment.status
  }
}

