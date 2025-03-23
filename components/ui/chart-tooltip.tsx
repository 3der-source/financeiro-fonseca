interface ChartTooltipContentProps {
  children: React.ReactNode
}

export function ChartTooltipContent({ children }: ChartTooltipContentProps) {
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      {children}
    </div>
  )
} 