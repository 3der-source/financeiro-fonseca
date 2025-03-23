"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useCategories } from "@/hooks/use-categories"
import { formatCurrency, formatPaymentMethod } from "@/lib/utils"
import type { Transaction } from "@/types/transaction"

interface TransactionTableProps {
  transactions: Transaction[]
  onEdit?: (transaction: Transaction) => void
  onDelete?: (transaction: Transaction) => void
  onStatusChange?: (transaction: Transaction, newStatus: "pending" | "paid" | "cancelled") => void
}

export function TransactionTable({ transactions, onEdit, onDelete, onStatusChange }: TransactionTableProps) {
  const { getCategoryById } = useCategories()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
      case "cancelled":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            const category = getCategoryById(transaction.categoryId)
            const paymentMethod = formatPaymentMethod(transaction.method)
            return (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.name}</TableCell>
                <TableCell className={transaction.type === "income" ? "text-emerald-500" : "text-red-500"}>
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(Math.abs(transaction.value))}
                </TableCell>
                <TableCell>
                  {(() => {
                    // Processar a data manualmente para evitar problemas de fuso horário
                    const dateParts = transaction.date.split('-');
                    if (dateParts.length === 3) {
                      const year = parseInt(dateParts[0]);
                      const month = parseInt(dateParts[1]) - 1; // Mês em JS é 0-11
                      const day = parseInt(dateParts[2]);
                      return `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
                    }
                    // Fallback para o método anterior
                    return format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR });
                  })()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span>{paymentMethod.icon}</span>
                    <span>{paymentMethod.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{category?.name || "Outros"}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(transaction.status)} variant="secondary">
                    {transaction.status === "paid"
                      ? "Pago"
                      : transaction.status === "pending"
                      ? "Pendente"
                      : "Cancelado"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      {transaction.isScheduled && transaction.status !== "cancelled" && onStatusChange && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onStatusChange(transaction, "paid")}
                            disabled={transaction.status === "paid"}
                          >
                            Marcar como pago
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onStatusChange(transaction, "pending")}
                            disabled={transaction.status === "pending"}
                          >
                            Marcar como pendente
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onStatusChange(transaction, "cancelled")}
                            className="text-red-600"
                          >
                            Cancelar pagamento
                          </DropdownMenuItem>
                        </>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(transaction)}>Editar</DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(transaction)}
                          className="text-red-600"
                        >
                          Excluir
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

