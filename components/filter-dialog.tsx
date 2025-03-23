"use client"

import { useState, useEffect } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { DateRange } from "react-day-picker"

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
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useCategories } from "@/contexts/categories-context"

interface Category {
  id: string
  name: string
  color: string
  created_at: string
}

interface FilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FilterDialog({ open, onOpenChange }: FilterDialogProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  })
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [category, setCategory] = useState<string>("all")
  const [type, setType] = useState<string>("all")
  const { categories } = useCategories()

  // Resetar filtros quando o diálogo é fechado
  useEffect(() => {
    if (!open) {
      setDate({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(),
      })
      setCalendarOpen(false)
      setCategory("all")
      setType("all")
    }
  }, [open])

  const handleDateSelect = (newDate: DateRange | undefined) => {
    setDate(newDate)
    if (newDate?.from && newDate?.to) {
      setCalendarOpen(false)
    }
  }

  const handleApplyFilters = () => {
    // Implementar lógica de filtros aqui
    onOpenChange(false)
  }

  const handleResetFilters = () => {
    setDate({
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date(),
    })
    setCategory("all")
    setType("all")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filtrar Transações</DialogTitle>
          <DialogDescription>Defina os filtros para visualizar suas transações.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="date-range">Período</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="date-range"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal transition-colors focus:border-primary",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                        {format(date.to, "dd/MM/yyyy", { locale: ptBR })}
                      </>
                    ) : (
                      format(date.from, "dd/MM/yyyy", { locale: ptBR })
                    )
                  ) : (
                    <span>Selecione um período</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={handleDateSelect}
                  numberOfMonths={1}
                  modifiersStyles={{
                    today: { fontWeight: "bold" },
                    range_start: { 
                      color: "var(--primary-foreground)", 
                      backgroundColor: "var(--primary)",
                      borderRadius: "0.375rem"
                    },
                    range_end: { 
                      color: "var(--primary-foreground)", 
                      backgroundColor: "var(--primary)",
                      borderRadius: "0.375rem"
                    },
                    range_middle: { 
                      color: "var(--accent-foreground)", 
                      backgroundColor: "var(--accent)",
                      borderRadius: "0"
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" className="transition-colors focus:border-primary">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer transition-colors hover:bg-accent">
                  🔍 Todas as categorias
                </SelectItem>
                {categories.map((cat) => (
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
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type" className="transition-colors focus:border-primary">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer transition-colors hover:bg-accent">
                  🔍 Todos os tipos
                </SelectItem>
                <SelectItem value="income" className="cursor-pointer transition-colors hover:bg-accent">
                  ⬆️ Apenas entradas
                </SelectItem>
                <SelectItem value="expense" className="cursor-pointer transition-colors hover:bg-accent">
                  ⬇️ Apenas saídas
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleResetFilters}
            className="transition-colors hover:bg-secondary"
          >
            Limpar Filtros
          </Button>
          <Button 
            type="submit"
            onClick={handleApplyFilters}
            className="transition-colors bg-primary hover:bg-primary/90"
          >
            Aplicar Filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

