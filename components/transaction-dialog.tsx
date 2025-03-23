"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useCategories } from "@/hooks/use-categories"
import { cn, formatPaymentMethod } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, ControllerRenderProps, FieldValues, Controller } from "react-hook-form"
import * as z from "zod"
import type { Transaction } from "@/types/transaction"
import { NumericFormat } from "react-number-format"

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  value: z.coerce.number().min(0.01, "Valor deve ser maior que zero"),
  type: z.enum(["income", "expense"]),
  date: z.date(),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  method: z.string().min(1, "Método de pagamento é obrigatório"),
  isScheduled: z.boolean().default(false),
  status: z.enum(["paid", "pending", "cancelled"]).default("paid"),
})

type FormValues = z.infer<typeof formSchema>

interface TransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (transaction: Transaction) => void
  editTransaction?: Transaction
}

export function TransactionDialog({ open, onOpenChange, onSave, editTransaction }: TransactionDialogProps) {
  const { categories } = useCategories()
  const [isScheduled, setIsScheduled] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      value: 0,
      type: "expense" as const,
      date: new Date(),
      categoryId: "",
      method: "",
      isScheduled: false,
      status: "paid" as const,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: editTransaction?.name || "",
        description: editTransaction?.description || "",
        value: editTransaction ? Math.abs(editTransaction.value) : 0,
        type: editTransaction ? editTransaction.type : "expense",
        date: editTransaction?.date
          ? (() => {
              // Converter a string de data para objeto Date, preservando o dia original
              const dateParts = editTransaction.date.split('-');
              if (dateParts.length === 3) {
                const year = parseInt(dateParts[0]);
                const month = parseInt(dateParts[1]) - 1; // Mês em JS é 0-11
                const day = parseInt(dateParts[2]);
                
                // Criar a data às 12:00 para evitar qualquer problema de fuso horário
                return new Date(year, month, day, 12, 0, 0);
              }
              return new Date();
            })()
          : new Date(),
        categoryId: editTransaction?.categoryId || "outros",
        method: editTransaction?.method || "credit_card",
        isScheduled: editTransaction?.isScheduled || false,
        status: editTransaction?.status || "paid",
      })
      setIsScheduled(editTransaction?.isScheduled || false)
    }
  }, [form, editTransaction, open])

  const onSubmit = async (values: FormValues) => {
    const transaction: Transaction = {
      id: editTransaction?.id || "",
      userId: editTransaction?.userId || "",
      name: values.name,
      description: values.description,
      value: values.type === "expense" ? -Math.abs(values.value) : Math.abs(values.value),
      type: values.type,
      date: `${values.date.getFullYear()}-${String(values.date.getMonth() + 1).padStart(2, '0')}-${String(values.date.getDate()).padStart(2, '0')}`,
      categoryId: values.categoryId,
      method: values.method,
      isScheduled: values.isScheduled,
      status: values.status,
      createdAt: editTransaction?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await onSave(transaction)
    onOpenChange(false)
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          form.reset({
            name: "",
            description: "",
            value: 0,
            type: "expense" as const,
            date: new Date(),
            categoryId: "",
            method: "",
            isScheduled: false,
            status: "paid" as const,
          });
          setIsScheduled(false);
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editTransaction ? "Editar Transação" : "Nova Transação"}</DialogTitle>
          <DialogDescription>
            {editTransaction
              ? "Edite os detalhes da transação abaixo"
              : "Adicione uma nova transação preenchendo os campos abaixo"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }: { field: ControllerRenderProps<FormValues, "type"> }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant={field.value === "expense" ? "default" : "outline"}
                      className={cn(
                        "flex-1 px-3",
                        field.value === "expense" ? "bg-destructive hover:bg-destructive/90" : ""
                      )}
                      onClick={() => {
                        field.onChange("expense");
                        form.reset({
                          name: "",
                          description: "",
                          value: 0,
                          type: "expense" as const,
                          date: new Date(),
                          categoryId: "",
                          method: "",
                          isScheduled: false,
                          status: "paid" as const,
                        });
                        setIsScheduled(false);
                      }}
                    >
                      Despesa
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === "income" ? "default" : "outline"}
                      className={cn(
                        "flex-1 px-3",
                        field.value === "income" ? "bg-emerald-600 hover:bg-emerald-700" : ""
                      )}
                      onClick={() => {
                        field.onChange("income");
                        form.reset({
                          name: "",
                          description: "",
                          value: 0,
                          type: "income" as const,
                          date: new Date(),
                          categoryId: "",
                          method: "",
                          isScheduled: false,
                          status: "paid" as const,
                        });
                        setIsScheduled(false);
                      }}
                    >
                      Receita
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }: { field: ControllerRenderProps<FormValues, "name"> }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Aluguel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Controller
              control={form.control}
              name="value"
              render={({ field: { onChange, value, onBlur, name, ref } }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <NumericFormat
                      customInput={Input}
                      thousandSeparator="."
                      decimalSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                      prefix="R$ "
                      placeholder="R$ 0,00"
                      value={value}
                      onValueChange={(values) => {
                        onChange(values.floatValue);
                      }}
                      onBlur={onBlur}
                      name={name}
                      getInputRef={ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }: { field: ControllerRenderProps<FormValues, "description"> }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ex: Pagamento do aluguel do mês" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }: { field: ControllerRenderProps<FormValues, "date"> }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={ptBR}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }: { field: ControllerRenderProps<FormValues, "categoryId"> }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="method"
              render={({ field }: { field: ControllerRenderProps<FormValues, "method"> }) => (
                <FormItem>
                  <FormLabel>Método de Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o método">
                          {field.value && (
                            <div className="flex items-center gap-2">
                              <span>{formatPaymentMethod(field.value).icon}</span>
                              <span>{formatPaymentMethod(field.value).name}</span>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="credit_card" className="flex items-center gap-2">
                        <div className="flex items-center">
                          <span className="mr-2">💳</span>
                          <span>Cartão de Crédito</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="debit_card" className="flex items-center gap-2">
                        <div className="flex items-center">
                          <span className="mr-2">💳</span>
                          <span>Cartão de Débito</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="cash" className="flex items-center gap-2">
                        <div className="flex items-center">
                          <span className="mr-2">💵</span>
                          <span>Dinheiro</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="pix" className="flex items-center gap-2">
                        <div className="flex items-center">
                          <span className="mr-2">⚡</span>
                          <span>PIX</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="transfer" className="flex items-center gap-2">
                        <div className="flex items-center">
                          <span className="mr-2">🏦</span>
                          <span>Transferência</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="boleto" className="flex items-center gap-2">
                        <div className="flex items-center">
                          <span className="mr-2">📄</span>
                          <span>Boleto</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isScheduled"
              render={({ field }: { field: ControllerRenderProps<FormValues, "isScheduled"> }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Pagamento Agendado</FormLabel>
                    <FormDescription>
                      Marque esta opção se este for um pagamento agendado
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked)
                        setIsScheduled(checked)
                        if (checked) {
                          form.setValue("status", "pending")
                        } else {
                          form.setValue("status", "paid")
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {isScheduled && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }: { field: ControllerRenderProps<FormValues, "status"> }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="submit">{editTransaction ? "Salvar" : "Adicionar"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

