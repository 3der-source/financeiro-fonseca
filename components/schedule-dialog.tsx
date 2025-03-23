"use client"

import { useState, useEffect } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { NumericFormat } from "react-number-format"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useCategories } from "@/hooks/use-categories"

interface ScheduledPayment {
  name: string
  amount: number
  category_id: string
  payment_date: string
  payment_method: string
  notes?: string
}

interface ScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (payment: ScheduledPayment) => Promise<boolean>
  scheduledPayments: ScheduledPayment[]
}

export function ScheduleDialog({ open, onOpenChange, onSave, scheduledPayments }: ScheduleDialogProps) {
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [paymentDate, setPaymentDate] = useState<Date>()
  const [paymentMethod, setPaymentMethod] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const { categories } = useCategories()

  useEffect(() => {
    if (!open) {
      setName("")
      setAmount("")
      setCategoryId("")
      setPaymentDate(undefined)
      setPaymentMethod("")
      setNotes("")
      setCalendarOpen(false)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentDate) return

    setIsSubmitting(true)
    try {
      const success = await onSave({
        name,
        amount: parseFloat(amount.replace(/[^\d,-]/g, "").replace(",", ".")),
        category_id: categoryId,
        payment_date: paymentDate.toISOString(),
        payment_method: paymentMethod,
        notes,
      })

      if (success) {
        onOpenChange(false)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setPaymentDate(date)
      setCalendarOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agendar Pagamento</DialogTitle>
          <DialogDescription>
            Agende um pagamento para uma data futura. Você será notificado quando a data estiver próxima.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Nome do pagamento"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="transition-colors focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <NumericFormat
              id="amount"
              customInput={Input}
              thousandSeparator="."
              decimalSeparator=","
              prefix="R$ "
              placeholder="R$ 0,00"
              value={amount}
              onValueChange={(values) => setAmount(values.value)}
              required
              className="transition-colors focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger id="category" className="transition-colors focus:border-primary">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(new Set(categories.map(cat => cat.id))).map((id) => {
                  const cat = categories.find(c => c.id === id)
                  if (!cat) return null
                  return (
                    <SelectItem 
                      key={cat.id} 
                      value={cat.id}
                      className="cursor-pointer transition-colors hover:bg-accent"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Data de Vencimento</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal transition-colors focus:border-primary",
                    !paymentDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate ? format(paymentDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  disabled={(date) => date < new Date()}
                  fromDate={new Date()}
                  modifiers={{ disabled: [(date) => date < new Date()] }}
                  modifiersStyles={{
                    disabled: { color: "var(--muted-foreground)", opacity: 0.5 },
                    selected: { 
                      backgroundColor: "var(--primary)",
                      color: "var(--primary-foreground)",
                      borderRadius: "0.375rem"
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
              <SelectTrigger id="paymentMethod" className="transition-colors focus:border-primary">
                <SelectValue placeholder="Selecione uma forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card" className="cursor-pointer transition-colors hover:bg-accent">
                  💳 Cartão de Crédito
                </SelectItem>
                <SelectItem value="debit_card" className="cursor-pointer transition-colors hover:bg-accent">
                  💳 Cartão de Débito
                </SelectItem>
                <SelectItem value="bank_slip" className="cursor-pointer transition-colors hover:bg-accent">
                  📄 Boleto
                </SelectItem>
                <SelectItem value="pix" className="cursor-pointer transition-colors hover:bg-accent">
                  ⚡ PIX
                </SelectItem>
                <SelectItem value="money" className="cursor-pointer transition-colors hover:bg-accent">
                  💵 Dinheiro
                </SelectItem>
                <SelectItem value="transfer" className="cursor-pointer transition-colors hover:bg-accent">
                  🏦 Transferência
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações sobre o pagamento"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="transition-colors focus:border-primary resize-none"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="transition-colors hover:bg-secondary"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="transition-colors bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Agendando...
                </>
              ) : (
                'Agendar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

